import {
  Injectable,
  Inject,
  Optional,
  Logger,
  BadGatewayException,
  GatewayTimeoutException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { SystemSetting } from '../../../database/entities/system-setting.entity';
import {
  FMS_CONFIG_OPTIONS,
  FmsClientOptions,
  DEFAULT_FMS_CLIENT_OPTIONS,
} from './fms-client.config';
import {
  FmsResolvedConfig,
  FmsConnectionTestResult,
  FmsAcknowledgeResponse,
} from '../interfaces/fms.interfaces';
import { FmsDatabaseConfigDto, FmsTestConnectionDto } from '../dto/fms-config.dto';

@Injectable()
export class FmsClientService {
  private readonly logger = new Logger(FmsClientService.name);
  private readonly initialOptions: FmsClientOptions;
  private cachedConfig: FmsResolvedConfig | null = null;
  private lastCacheFetch = 0;
  private readonly cacheTtlMs = 15000; // 15 seconds in-memory cache

  constructor(
    private readonly httpService: HttpService,
    @Optional()
    @InjectRepository(SystemSetting)
    private readonly settingRepo?: Repository<SystemSetting>,
    @Optional()
    @Inject(FMS_CONFIG_OPTIONS)
    options?: FmsClientOptions,
  ) {
    this.initialOptions = { ...DEFAULT_FMS_CLIENT_OPTIONS, ...options };
  }

  /**
   * Resolve active configuration from Database (SystemSetting table)
   * with fallback to environment variables and default values.
   */
  async resolveConfig(): Promise<FmsResolvedConfig> {
    const now = Date.now();
    if (this.cachedConfig && now - this.lastCacheFetch < this.cacheTtlMs) {
      return this.cachedConfig;
    }

    let dbBaseUrl: string | undefined;
    let dbTimeoutMs: number | undefined;
    let dbDebug: boolean | undefined;
    let dbEnabled: boolean | undefined;
    let dbHeaders: Record<string, string> | undefined;
    let lastUpdatedAt: Date | undefined;
    let lastUpdatedBy: string | undefined;

    if (this.settingRepo) {
      try {
        const settings = await this.settingRepo.find({
          where: {
            key: In([
              'fms_base_url',
              'fms_timeout_ms',
              'fms_debug',
              'fms_enabled',
              'fms_headers',
            ]),
          },
        });

        for (const s of settings) {
          if (s.updatedAt && (!lastUpdatedAt || s.updatedAt > lastUpdatedAt)) {
            lastUpdatedAt = s.updatedAt;
            lastUpdatedBy = s.updatedBy;
          }
          if (s.key === 'fms_base_url' && s.value) {
            dbBaseUrl = s.value.trim();
          } else if (s.key === 'fms_timeout_ms' && s.value) {
            const parsed = Number(s.value);
            if (!isNaN(parsed) && parsed > 0) dbTimeoutMs = parsed;
          } else if (s.key === 'fms_debug' && s.value !== undefined) {
            dbDebug = s.value === 'true' || s.value === '1';
          } else if (s.key === 'fms_enabled' && s.value !== undefined) {
            dbEnabled = s.value === 'true' || s.value === '1';
          } else if (s.key === 'fms_headers' && s.value) {
            try {
              dbHeaders = JSON.parse(s.value);
            } catch {
              // Ignore invalid JSON
            }
          }
        }
      } catch (err: any) {
        this.logger.warn(`Failed to query database for FMS configuration: ${err.message}. Using fallback.`);
      }
    }

    const envBaseUrl = process.env.FMS_BASE_URL || process.env.FMS_CONTROLLER_URL;
    const envTimeout = process.env.FMS_TIMEOUT_MS ? Number(process.env.FMS_TIMEOUT_MS) : undefined;

    const source: 'DATABASE' | 'ENVIRONMENT' | 'DEFAULT' = dbBaseUrl
      ? 'DATABASE'
      : envBaseUrl
        ? 'ENVIRONMENT'
        : 'DEFAULT';

    const baseUrl = (dbBaseUrl || envBaseUrl || this.initialOptions.baseUrl || 'http://localhost/api').replace(/\/+$/, '');
    const timeoutMs = dbTimeoutMs ?? envTimeout ?? this.initialOptions.timeoutMs ?? 15000;
    const debug = dbDebug !== undefined ? dbDebug : (this.initialOptions.debug ?? process.env.NODE_ENV === 'development');
    const enabled = dbEnabled !== undefined ? dbEnabled : true;
    const headers = dbHeaders ?? this.initialOptions.headers ?? {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    this.cachedConfig = {
      baseUrl,
      timeoutMs,
      debug,
      enabled,
      headers,
      source,
      updatedAt: lastUpdatedAt?.toISOString(),
      updatedBy: lastUpdatedBy,
    };

    this.lastCacheFetch = now;
    return this.cachedConfig;
  }

  /**
   * Invalidate in-memory cached configuration
   */
  invalidateConfigCache(): void {
    this.cachedConfig = null;
    this.lastCacheFetch = 0;
  }

  /**
   * Get the active Base URL
   */
  async getBaseUrl(): Promise<string> {
    const config = await this.resolveConfig();
    return config.baseUrl;
  }

  /**
   * Synchronous getter for Base URL (returns cached or initial)
   */
  getBaseUrlSync(): string {
    return this.cachedConfig?.baseUrl || this.initialOptions.baseUrl || 'http://localhost/api';
  }

  /**
   * Save / Update FMS Configuration in Database (SystemSetting table)
   */
  async saveDatabaseConfig(
    dto: FmsDatabaseConfigDto,
    userId?: string,
  ): Promise<FmsResolvedConfig> {
    if (!this.settingRepo) {
      throw new BadGatewayException('Database repository for SystemSetting is not available');
    }

    const updates: Array<{ key: string; value: string }> = [];

    if (dto.baseUrl !== undefined) {
      updates.push({ key: 'fms_base_url', value: dto.baseUrl.trim().replace(/\/+$/, '') });
    }
    if (dto.timeoutMs !== undefined) {
      updates.push({ key: 'fms_timeout_ms', value: String(Number(dto.timeoutMs)) });
    }
    if (dto.debug !== undefined) {
      updates.push({ key: 'fms_debug', value: String(Boolean(dto.debug)) });
    }
    if (dto.enabled !== undefined) {
      updates.push({ key: 'fms_enabled', value: String(Boolean(dto.enabled)) });
    }
    if (dto.headers !== undefined) {
      updates.push({ key: 'fms_headers', value: JSON.stringify(dto.headers) });
    }

    for (const item of updates) {
      const setting = this.settingRepo.create({
        key: item.key,
        value: item.value,
        updatedBy: userId ?? undefined,
      });
      await this.settingRepo.save(setting);
    }

    this.invalidateConfigCache();
    const resolved = await this.resolveConfig();
    this.logger.log(`FMS configuration updated in database by user ${userId ?? 'system'}: BaseURL=${resolved.baseUrl}, Timeout=${resolved.timeoutMs}ms`);
    return resolved;
  }

  /**
   * Test connection and handshake ping against target controller URL
   */
  async testConnection(dto?: FmsTestConnectionDto): Promise<FmsConnectionTestResult> {
    const activeConfig = await this.resolveConfig();
    const targetUrl = (dto?.baseUrl || activeConfig.baseUrl).replace(/\/+$/, '');
    const timeoutMs = dto?.timeoutMs || 5000;
    const testEndpoint = `${targetUrl}/Acknowledge`;

    const startTime = Date.now();

    try {
      const response = await firstValueFrom(
        this.httpService.post<FmsAcknowledgeResponse>(
          testEndpoint,
          { Code: 200 },
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: timeoutMs,
          },
        ),
      );

      const latencyMs = Date.now() - startTime;
      const data = response.data;

      return {
        success: true,
        targetUrl,
        latencyMs,
        statusCode: response.status,
        message: 'Koneksi ke FMS Forecourt Controller berhasil',
        serverTime: data?.ServerTime,
        controllerVersion: data?.ControllerVersion,
        details: data,
      };
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data;

      let message = 'Gagal terhubung ke FMS Controller';
      if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
        message = `Koneksi timeout (${timeoutMs}ms)`;
      } else if (axiosError.message) {
        message = axiosError.message;
      }

      return {
        success: false,
        targetUrl,
        latencyMs,
        statusCode: status,
        message,
        details: responseData,
      };
    }
  }

  /**
   * Build full URL with path
   */
  private buildUrl(baseUrl: string, path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Execute an HTTP POST request sending JSON payload via Axios
   */
  async post<T = any>(
    path: string,
    body: any = {},
    customHeaders?: Record<string, string>,
  ): Promise<T> {
    const config = await this.resolveConfig();

    if (!config.enabled) {
      throw new BadGatewayException({
        success: false,
        message: 'FMS Controller integration is currently disabled in database settings',
      });
    }

    const url = this.buildUrl(config.baseUrl, path);
    const requestConfig: AxiosRequestConfig = {
      headers: {
        ...config.headers,
        ...(customHeaders || {}),
      },
      timeout: config.timeoutMs,
    };

    if (config.debug) {
      this.logger.debug(`[FMS Axios POST] ${url} - Body: ${JSON.stringify(body)}`);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<T>(url, body, requestConfig),
      );
      return this.handleAxiosResponse<T>(response, `POST ${path}`, config.debug);
    } catch (error: any) {
      this.handleAxiosError(error, `POST ${path}`, url, config.timeoutMs);
    }
  }

  /**
   * Execute an HTTP GET request via Axios
   */
  async get<T = any>(
    path: string,
    query?: Record<string, any>,
    customHeaders?: Record<string, string>,
  ): Promise<T> {
    const config = await this.resolveConfig();

    if (!config.enabled) {
      throw new BadGatewayException({
        success: false,
        message: 'FMS Controller integration is currently disabled in database settings',
      });
    }

    const url = this.buildUrl(config.baseUrl, path);
    const headers = {
      ...config.headers,
      ...(customHeaders || {}),
    };
    delete headers['Content-Type'];

    const requestConfig: AxiosRequestConfig = {
      params: query,
      headers,
      timeout: config.timeoutMs,
    };

    if (config.debug) {
      this.logger.debug(`[FMS Axios GET] ${url}`);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(url, requestConfig),
      );
      return this.handleAxiosResponse<T>(response, `GET ${path}`, config.debug);
    } catch (error: any) {
      this.handleAxiosError(error, `GET ${path}`, url, config.timeoutMs);
    }
  }

  /**
   * Execute an HTTP POST request sending Multipart/FormData (for file uploads) via Axios
   */
  async postFormData<T = any>(
    path: string,
    formData: any,
    customHeaders?: Record<string, string>,
  ): Promise<T> {
    const config = await this.resolveConfig();

    if (!config.enabled) {
      throw new BadGatewayException({
        success: false,
        message: 'FMS Controller integration is currently disabled in database settings',
      });
    }

    const url = this.buildUrl(config.baseUrl, path);
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Accept: 'application/json',
        ...(customHeaders || {}),
      },
      timeout: config.timeoutMs * 4, // Longer timeout for file uploads
    };

    if (config.debug) {
      this.logger.debug(`[FMS Axios POST FormData] ${url}`);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<T>(url, formData, requestConfig),
      );
      return this.handleAxiosResponse<T>(response, `POST FormData ${path}`, config.debug);
    } catch (error: any) {
      this.handleAxiosError(error, `POST FormData ${path}`, url, config.timeoutMs * 4);
    }
  }

  /**
   * Parse Axios response
   */
  private handleAxiosResponse<T>(response: AxiosResponse<T>, endpoint: string, debug?: boolean): T {
    let responseData: any = response.data;

    // In case CodeIgniter returned JSON as string
    if (typeof responseData === 'string') {
      try {
        responseData = JSON.parse(responseData);
      } catch {
        // keep as string
      }
    }

    if (debug) {
      this.logger.debug(
        `[FMS Axios Response] ${endpoint} (${response.status}) - Data: ${
          typeof responseData === 'object' ? JSON.stringify(responseData) : responseData
        }`,
      );
    }

    return responseData as T;
  }

  /**
   * Handle Axios network/timeout/HTTP error responses
   */
  private handleAxiosError(error: any, endpoint: string, url: string, timeoutMs: number): never {
    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      this.logger.error(`[FMS Timeout] ${endpoint} exceeded ${timeoutMs}ms against ${url}`);
      throw new GatewayTimeoutException({
        success: false,
        message: `FMS Forecourt Controller timeout (${timeoutMs}ms) for ${endpoint}`,
        targetUrl: url,
      });
    }

    if (error instanceof BadGatewayException || error instanceof GatewayTimeoutException) {
      throw error;
    }

    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status;
    const responseData = axiosError.response?.data;

    let message = 'Failed to communicate with FMS Controller';
    if (typeof responseData === 'object' && responseData !== null) {
      message = responseData.message || responseData.error || responseData.Message || message;
    } else if (typeof responseData === 'string' && responseData.length > 0) {
      message = responseData;
    } else if (axiosError.message) {
      message = axiosError.message;
    }

    this.logger.error(`[FMS Axios Error] ${endpoint} (${status ?? 'Network Error'}): ${message}`);

    throw new BadGatewayException({
      success: false,
      statusCode: status ?? 502,
      message: `FMS Controller request failed: ${message}`,
      targetUrl: url,
      details: responseData,
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from './client/fms-client.service';
import {
  FmsAuthService,
  FmsDiscoveryService,
  FmsPumpService,
  FmsShiftService,
  FmsTankService,
  FmsRfidService,
  FmsConfigService,
  FmsSettingService,
  FmsUserService,
  FmsReportService,
  FmsUploadService,
} from './services';
import { FmsDatabaseConfigDto, FmsTestConnectionDto } from './dto/fms-config.dto';
import { FmsResolvedConfig, FmsConnectionTestResult } from './interfaces/fms.interfaces';

/**
 * Unified FMS Service Facade
 * 
 * Provides a single injection entrypoint to access all sub-services for the
 * Pertamina SPBU Forecourt Controller & POS integration.
 *
 * Example usage:
 * ```ts
 * @Injectable()
 * export class DispenserSyncService {
 *   constructor(private readonly fms: FmsService) {}
 *
 *   async checkPumpStatus(pumpNo: number) {
 *     const data = await this.fms.pumps.getLastPumpData({ PumpNumber: pumpNo });
 *     return data;
 *   }
 * }
 * ```
 */
@Injectable()
export class FmsService {
  private readonly logger = new Logger(FmsService.name);

  constructor(
    public readonly client: FmsClientService,
    public readonly auth: FmsAuthService,
    public readonly discovery: FmsDiscoveryService,
    public readonly pumps: FmsPumpService,
    public readonly shift: FmsShiftService,
    public readonly tanks: FmsTankService,
    public readonly rfid: FmsRfidService,
    public readonly config: FmsConfigService,
    public readonly settings: FmsSettingService,
    public readonly users: FmsUserService,
    public readonly reports: FmsReportService,
    public readonly uploads: FmsUploadService,
  ) {
    this.logger.log(`FMS Integration Service initialized. Target controller: ${this.client.getBaseUrlSync()}`);
  }

  /**
   * Helper: Check connectivity to the forecourt controller
   */
  async ping(): Promise<boolean> {
    try {
      const res = await this.discovery.acknowledge();
      return !!res;
    } catch (err) {
      return false;
    }
  }

  /**
   * Get active FMS configuration (resolved from database, environment, or default)
   */
  async getConfig(): Promise<FmsResolvedConfig> {
    return this.client.resolveConfig();
  }

  /**
   * Save or update FMS configuration in database (SystemSetting table)
   */
  async saveConfig(dto: FmsDatabaseConfigDto, userId?: string): Promise<FmsResolvedConfig> {
    return this.client.saveDatabaseConfig(dto, userId);
  }

  /**
   * Test connection and handshake ping with latency against target controller
   */
  async testConnection(dto?: FmsTestConnectionDto): Promise<FmsConnectionTestResult> {
    return this.client.testConnection(dto);
  }

  /**
   * Invalidate in-memory configuration cache
   */
  refreshConfig(): void {
    this.client.invalidateConfigCache();
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import { FmsPriceChangeDto, FmsConnectionConfigDto } from '../dto/fms-config.dto';
import {
  FmsPriceChangeResponse,
  FmsConnectionConfigResponse,
} from '../interfaces/fms.interfaces';

@Injectable()
export class FmsConfigService {
  private readonly logger = new Logger(FmsConfigService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Updates price for a fuel grade with effective activation datetime.
   *
   * Endpoint: POST /config/Price_change
   */
  async schedulePriceChange(dto: FmsPriceChangeDto): Promise<FmsPriceChangeResponse> {
    const payload = {
      GradeId: Number(dto.GradeId),
      Price: Number(dto.Price),
      ActiveDT: dto.ActiveDT,
    };
    this.logger.log(`Scheduling price change for Grade ${dto.GradeId}: Price=${dto.Price}, ActiveDT=${dto.ActiveDT}`);
    return this.client.post<FmsPriceChangeResponse>('/config/Price_change', payload);
  }

  /**
   * Writes WiFi credentials and system proxy settings directly to Linux OS config files.
   *
   * Endpoint: POST /connection/Config
   */
  async setConnectionConfig(dto: FmsConnectionConfigDto): Promise<FmsConnectionConfigResponse> {
    const payload = {
      ssid: dto.ssid,
      psk: dto.psk,
      proxy_active_flag: Boolean(dto.proxy_active_flag),
      http: dto.http,
      https: dto.https,
      ftp: dto.ftp,
    };
    this.logger.log(`Updating FMS network connection and proxy config (SSID: ${dto.ssid})`);
    return this.client.post<FmsConnectionConfigResponse>('/connection/Config', payload);
  }
}

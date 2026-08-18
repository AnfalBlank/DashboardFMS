import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import { FmsAcknowledgeDto, FmsConfigurationDto } from '../dto/fms-discovery.dto';
import { FmsAcknowledgeResponse, FmsConfigurationResponse } from '../interfaces/fms.interfaces';

@Injectable()
export class FmsDiscoveryService {
  private readonly logger = new Logger(FmsDiscoveryService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Client connectivity handshake ping.
   *
   * Endpoint: POST /Acknowledge
   */
  async acknowledge(dto?: FmsAcknowledgeDto): Promise<FmsAcknowledgeResponse> {
    const payload = {
      Code: dto?.Code ?? 200,
    };
    return this.client.post<FmsAcknowledgeResponse>('/Acknowledge', payload);
  }

  /**
   * Fetches complete SPBU profile, headers/footers, supported bank methods,
   * active pumps, nozzles, product grades, prices, and PSO subsidy flags.
   *
   * Endpoint: POST /Configuration
   */
  async getConfiguration(dto?: FmsConfigurationDto): Promise<FmsConfigurationResponse> {
    const payload = {
      Code: dto?.Code ?? 200,
    };
    return this.client.post<FmsConfigurationResponse>('/Configuration', payload);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import { FmsBackupDto } from '../dto/fms-report.dto';
import { FmsBackupResponse } from '../interfaces/fms.interfaces';

@Injectable()
export class FmsReportService {
  private readonly logger = new Logger(FmsReportService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Pulls un-synced fueling transactions, tank deliveries, and latest ATG levels
   * within datetime range and flags them as sent.
   *
   * Endpoint: POST /report/Backup
   */
  async syncBackup(dto: FmsBackupDto): Promise<FmsBackupResponse> {
    const payload = {
      waktuAwal: dto.waktuAwal,
      waktuAkhir: dto.waktuAkhir,
    };
    this.logger.log(`Triggering FMS Central Backup sync from ${dto.waktuAwal} to ${dto.waktuAkhir}`);
    return this.client.post<FmsBackupResponse>('/report/Backup', payload);
  }
}

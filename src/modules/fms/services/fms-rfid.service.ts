import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import { FmsRfidInfoDto } from '../dto/fms-rfid.dto';
import { FmsRfidInfoResponse } from '../interfaces/fms.interfaces';

@Injectable()
export class FmsRfidService {
  private readonly logger = new Logger(FmsRfidService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Inquires card balance, authorized vehicle registration plate, customer name,
   * and allowed fuel products.
   *
   * Endpoint: POST /rfid/Info
   */
  async getCardInfo(dto: FmsRfidInfoDto): Promise<FmsRfidInfoResponse> {
    const payload = {
      Code: dto.Code ?? 200,
      PumpNo: Number(dto.PumpNo),
      HoseNo: Number(dto.HoseNo),
      CardNo: dto.CardNo,
    };
    this.logger.log(`Querying RFID card info for CardNo: ${dto.CardNo} on Pump ${dto.PumpNo}`);
    return this.client.post<FmsRfidInfoResponse>('/rfid/Info', payload);
  }
}

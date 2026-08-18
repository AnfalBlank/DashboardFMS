import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import { FmsOpenShiftDto, FmsCloseShiftDto, FmsInfoShiftDto } from '../dto/fms-shift.dto';
import {
  FmsOpenShiftResponse,
  FmsCloseShiftResponse,
  FmsInfoShiftResponse,
} from '../interfaces/fms.interfaces';

@Injectable()
export class FmsShiftService {
  private readonly logger = new Logger(FmsShiftService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Opens new shift, snapshots initial pump electronic totalizers and tank stock levels,
   * and authorizes non-self-service dispensers.
   *
   * Endpoint: POST /shift/Open_shift
   */
  async openShift(dto: FmsOpenShiftDto): Promise<FmsOpenShiftResponse> {
    const payload = {
      UserId: dto.UserId,
    };
    this.logger.log(`Opening FMS Shift for user: ${dto.UserId}`);
    return this.client.post<FmsOpenShiftResponse>('/shift/Open_shift', payload);
  }

  /**
   * Closes shift, records final totalizers and tank levels, and sets pump authorizations to 0.
   *
   * Endpoint: POST /shift/Close_shift
   */
  async closeShift(dto?: FmsCloseShiftDto): Promise<FmsCloseShiftResponse> {
    this.logger.log('Closing active FMS Shift');
    return this.client.post<FmsCloseShiftResponse>('/shift/Close_shift', dto ?? {});
  }

  /**
   * Queries current shift status, shift ID, open time, and shift daily sequence number.
   *
   * Endpoint: POST /shift/Info_shift
   */
  async getShiftInfo(dto?: FmsInfoShiftDto): Promise<FmsInfoShiftResponse> {
    return this.client.post<FmsInfoShiftResponse>('/shift/Info_shift', dto ?? {});
  }
}

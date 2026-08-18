import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import {
  FmsLastTankDataDto,
  FmsDeliveryStartDto,
  FmsDeliveryStatusDto,
  FmsDeliveryStopDto,
  FmsDeliveryTankDataDto,
} from '../dto/fms-tank.dto';
import {
  FmsListTankResponse,
  FmsLastTankDataResponse,
  FmsDeliveryStartResponse,
  FmsDeliveryStatusResponse,
  FmsDeliveryStopResponse,
  FmsDeliveryTankDataResponse,
} from '../interfaces/fms.interfaces';

@Injectable()
export class FmsTankService {
  private readonly logger = new Logger(FmsTankService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Lists active storage tanks, associated products, and prices.
   *
   * Endpoint: POST /tank/List_tank
   */
  async listTanks(): Promise<FmsListTankResponse> {
    return this.client.post<FmsListTankResponse>('/tank/List_tank', {});
  }

  /**
   * Fetches real-time Automatic Tank Gauge (ATG) telemetry
   * (fuel/water height, volume, temperature, empty ullage capacity, ATG online flag).
   *
   * Endpoint: POST /tank/Last_tank_data
   */
  async getLastTankData(dto: FmsLastTankDataDto): Promise<FmsLastTankDataResponse> {
    const payload = {
      TankNumber: Number(dto.TankNumber),
    };
    return this.client.post<FmsLastTankDataResponse>('/tank/Last_tank_data', payload);
  }

  /**
   * Initiates fuel receiving mode for a tank and snapshots initial inventory levels.
   *
   * Endpoint: POST /tank/Delivery_start
   */
  async startDelivery(dto: FmsDeliveryStartDto): Promise<FmsDeliveryStartResponse> {
    const payload = {
      TankNumber: Number(dto.TankNumber),
    };
    this.logger.log(`Starting fuel receiving for Tank ${dto.TankNumber}`);
    return this.client.post<FmsDeliveryStartResponse>('/tank/Delivery_start', payload);
  }

  /**
   * Checks whether a tank is currently receiving fuel delivery.
   *
   * Endpoint: POST /tank/Delivery_status
   */
  async getDeliveryStatus(dto: FmsDeliveryStatusDto): Promise<FmsDeliveryStatusResponse> {
    const payload = {
      TankNumber: Number(dto.TankNumber),
    };
    return this.client.post<FmsDeliveryStatusResponse>('/tank/Delivery_status', payload);
  }

  /**
   * Completes fuel delivery, snapshots final inventory levels, and records DO / invoice details.
   *
   * Endpoint: POST /tank/Delivery_stop
   */
  async stopDelivery(dto: FmsDeliveryStopDto): Promise<FmsDeliveryStopResponse> {
    const payload = {
      TankNumber: Number(dto.TankNumber),
      NoDO: dto.NoDO,
      NoInvoice: dto.NoInvoice,
      DeliveryVolume: String(dto.DeliveryVolume),
      NoKendaraan: dto.NoKendaraan,
      NamaPengemudi: dto.NamaPengemudi,
      Pengirim: dto.Pengirim,
    };
    this.logger.log(`Finishing fuel delivery for Tank ${dto.TankNumber}, DO: ${dto.NoDO}, Volume: ${dto.DeliveryVolume}`);
    return this.client.post<FmsDeliveryStopResponse>('/tank/Delivery_stop', payload);
  }

  /**
   * Queries historical delivery logs by date.
   *
   * Endpoint: POST /tank/Delivery_tank_data
   */
  async getHistoricalDeliveryData(dto: FmsDeliveryTankDataDto): Promise<FmsDeliveryTankDataResponse> {
    const payload = {
      tgl_delivery: dto.tgl_delivery,
    };
    return this.client.post<FmsDeliveryTankDataResponse>('/tank/Delivery_tank_data', payload);
  }
}

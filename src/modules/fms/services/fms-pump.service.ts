import { Injectable, Logger } from '@nestjs/common';
import { FmsClientService } from '../client/fms-client.service';
import {
  FmsLastPumpDataDto,
  FmsPumpStateDto,
  FmsPresetDto,
  FmsPresetCheckDto,
  FmsPresetStatusDto,
  FmsLockPumpDto,
  FmsChangeMopDto,
  FmsLastPreTransactionDto,
  FmsLastPostPurchaseDto,
} from '../dto/fms-pump.dto';
import {
  FmsListPumpResponse,
  FmsLastPumpDataResponse,
  FmsPumpStateResponse,
  FmsPresetResponse,
  FmsPresetCheckResponse,
  FmsPresetStatusResponse,
  FmsLockPumpResponse,
  FmsChangeMopResponse,
  FmsLastPreTransactionResponse,
  FmsLastPostPurchaseResponse,
} from '../interfaces/fms.interfaces';

@Injectable()
export class FmsPumpService {
  private readonly logger = new Logger(FmsPumpService.name);

  constructor(private readonly client: FmsClientService) {}

  /**
   * Returns list of configured and active dispenser pumps with nozzles and product grades.
   *
   * Endpoint: POST /pump/List_pump
   */
  async listPumps(): Promise<FmsListPumpResponse> {
    return this.client.post<FmsListPumpResponse>('/pump/List_pump', {});
  }

  /**
   * Polls latest fueling amount, volume, unit price, and operational status:
   * (0=Offline, 1=Idle, 2=NozzleUp, 3=Fueling, 4=Complete)
   *
   * Endpoint: POST /pump/Last_pump_data
   */
  async getLastPumpData(dto: FmsLastPumpDataDto): Promise<FmsLastPumpDataResponse> {
    const payload = {
      PumpNumber: Number(dto.PumpNumber),
    };
    return this.client.post<FmsLastPumpDataResponse>('/pump/Last_pump_data', payload);
  }

  /**
   * Returns high level operational state code:
   * (1=Offline, 4=Idle, 7=NozzleUp, 9=Fueling, 10=Complete)
   *
   * Endpoint: POST /pump/State
   */
  async getState(dto: FmsPumpStateDto): Promise<FmsPumpStateResponse> {
    const payload = {
      Code: dto.Code ?? 200,
      PumpNo: Number(dto.PumpNo),
    };
    return this.client.post<FmsPumpStateResponse>('/pump/State', payload);
  }

  /**
   * Sends pre-authorization preset limit to dispenser.
   * Set Card object for RFID/fleet transactions or null for Cash.
   *
   * Endpoint: POST /pump/Preset
   */
  async createPreset(dto: FmsPresetDto): Promise<FmsPresetResponse> {
    const payload = {
      PumpNo: Number(dto.PumpNo),
      HoseNo: Number(dto.HoseNo),
      Amount: String(dto.Amount),
      Odometer: dto.Odometer ?? '',
      VehicleNo: dto.VehicleNo ?? '',
      VehicleType: dto.VehicleType ?? '',
      PhoneNo: dto.PhoneNo ?? '',
      AgencyName: dto.AgencyName ?? '',
      AgencyType: dto.AgencyType ?? '',
      CustomerType: dto.CustomerType ?? 'Umum',
      Card: dto.Card ?? null,
      Payments: dto.Payments ?? [
        {
          Type: 1,
          Name: 'CASH',
          Amount: Number(dto.Amount),
          RefNo: '',
          VerifyNo: '',
          TerminalId: '',
        },
      ],
    };
    this.logger.log(`Creating preset order on Pump ${dto.PumpNo} Hose ${dto.HoseNo} for amount ${dto.Amount}`);
    return this.client.post<FmsPresetResponse>('/pump/Preset', payload);
  }

  /**
   * Verifies if pump and hose are available for preset authorization.
   *
   * Endpoint: POST /pump/Preset_check
   */
  async checkPreset(dto: FmsPresetCheckDto): Promise<FmsPresetCheckResponse> {
    const payload = {
      Code: dto.Code ?? 200,
      PumpNo: Number(dto.PumpNo),
      HoseNo: Number(dto.HoseNo),
    };
    return this.client.post<FmsPresetCheckResponse>('/pump/Preset_check', payload);
  }

  /**
   * Polls status of active preset. Returns transaction result when IsCompleted is true.
   *
   * Endpoint: POST /pump/Preset_status
   */
  async getPresetStatus(dto: FmsPresetStatusDto): Promise<FmsPresetStatusResponse> {
    const payload = {
      Code: dto.Code ?? 200,
      PumpNo: Number(dto.PumpNo),
      HoseNo: Number(dto.HoseNo),
      PresetType: dto.PresetType ?? '2',
      PresetId: dto.PresetId ?? 1,
      PresetDT: dto.PresetDT ?? new Date().toISOString().replace('T', ' ').substring(0, 19),
      Amount: String(dto.Amount ?? '0'),
      CardNo: dto.CardNo ?? '',
      TerminalId: dto.TerminalId ?? '',
    };
    return this.client.post<FmsPresetStatusResponse>('/pump/Preset_status', payload);
  }

  /**
   * Lock (0) or Unlock/Authorize (1) dispenser pump.
   *
   * Endpoint: POST /pump/Lock
   */
  async lockPump(dto: FmsLockPumpDto): Promise<FmsLockPumpResponse> {
    const payload = {
      PumpNumber: Number(dto.PumpNumber),
      Lock: Number(dto.Lock),
    };
    this.logger.log(`Lock pump action: Pump ${dto.PumpNumber} set Lock=${dto.Lock}`);
    return this.client.post<FmsLockPumpResponse>('/pump/Lock', payload);
  }

  /**
   * Updates payment method breakdown and vehicle info for an existing completed delivery.
   *
   * Endpoint: POST /pump/Change_mop
   */
  async changeMop(dto: FmsChangeMopDto): Promise<FmsChangeMopResponse> {
    const payload = {
      Code: dto.Code ?? 200,
      PumpNo: Number(dto.PumpNo),
      DeliveryId: Number(dto.DeliveryId),
      AttendantId: dto.AttendantId ? Number(dto.AttendantId) : undefined,
      Odometer: dto.Odometer ?? '',
      VehicleNo: dto.VehicleNo ?? '',
      VehicleType: dto.VehicleType ?? '',
      PhoneNo: dto.PhoneNo ?? '',
      AgencyName: dto.AgencyName ?? '',
      AgencyType: dto.AgencyType ?? '',
      CustomerType: dto.CustomerType ?? 'Umum',
      Payments: dto.Payments,
    };
    return this.client.post<FmsChangeMopResponse>('/pump/Change_mop', payload);
  }

  /**
   * Fetches recent pre-authorized transaction records for a pump.
   *
   * Endpoint: POST /pump/Last_pre_transaction
   */
  async getLastPreTransactions(dto: FmsLastPreTransactionDto): Promise<FmsLastPreTransactionResponse> {
    const payload = {
      Code: dto.Code ?? 200,
      PumpNo: Number(dto.PumpNo),
      Row: dto.Row ?? 5,
    };
    return this.client.post<FmsLastPreTransactionResponse>('/pump/Last_pre_transaction', payload);
  }

  /**
   * Fetches recent post-purchase fueling transactions.
   *
   * Endpoint: POST /pump/Last_post_purchase
   */
  async getLastPostPurchase(dto: FmsLastPostPurchaseDto): Promise<FmsLastPostPurchaseResponse> {
    const payload = {
      Code: dto.Code ?? 200,
      PumpNo: Number(dto.PumpNo),
      Row: dto.Row ?? 5,
    };
    return this.client.post<FmsLastPostPurchaseResponse>('/pump/Last_post_purchase', payload);
  }
}

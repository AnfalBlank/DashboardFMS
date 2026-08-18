import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FmsLastPumpDataDto {
  @ApiProperty({ example: 1, description: 'Dispenser pump number' })
  @IsNotEmpty()
  @IsNumber()
  PumpNumber: number;
}

export class FmsPumpStateDto {
  @ApiPropertyOptional({ example: 200, description: 'Protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;

  @ApiProperty({ example: 1, description: 'Dispenser pump number' })
  @IsNotEmpty()
  @IsNumber()
  PumpNo: number;
}

export class FmsPaymentItemDto {
  @ApiProperty({ example: 1, description: 'Payment type ID (1=Cash, 2=Prepaid, 3=EDC, 4=RFID Fleet, etc.)' })
  @IsNotEmpty()
  @IsNumber()
  Type: number;

  @ApiProperty({ example: 'CASH', description: 'Payment method name' })
  @IsNotEmpty()
  @IsString()
  Name: string;

  @ApiProperty({ example: 50000, description: 'Payment amount' })
  @IsNotEmpty()
  @IsNumber()
  Amount: number;

  @ApiPropertyOptional({ example: 'TRX-123456', description: 'Reference number' })
  @IsOptional()
  @IsString()
  RefNo?: string;

  @ApiPropertyOptional({ example: 'APPR-001', description: 'Bank verification/approval code' })
  @IsOptional()
  @IsString()
  VerifyNo?: string;

  @ApiPropertyOptional({ example: 'TID-001', description: 'Terminal ID / EDC ID' })
  @IsOptional()
  @IsString()
  TerminalId?: string;
}

export class FmsCardPresetDto {
  @ApiPropertyOptional({ example: 'E280117000000200', description: 'RFID card number / UID' })
  @IsOptional()
  @IsString()
  CardNo?: string;

  @ApiPropertyOptional({ example: 'B 1234 ABC', description: 'Vehicle license plate' })
  @IsOptional()
  @IsString()
  PlateNo?: string;

  @ApiPropertyOptional({ example: 'PT Trans Nusantara', description: 'Customer or agency name' })
  @IsOptional()
  @IsString()
  CustomerName?: string;

  @ApiPropertyOptional({ example: 500000, description: 'Available balance or quota' })
  @IsOptional()
  @IsNumber()
  Balance?: number;
}

export class FmsPresetDto {
  @ApiProperty({ example: 1, description: 'Target pump number' })
  @IsNotEmpty()
  @IsNumber()
  PumpNo: number;

  @ApiProperty({ example: 1, description: 'Target hose / nozzle number' })
  @IsNotEmpty()
  @IsNumber()
  HoseNo: number;

  @ApiProperty({ example: '50000', description: 'Pre-authorization preset amount in currency or volume' })
  @IsNotEmpty()
  Amount: string | number;

  @ApiPropertyOptional({ example: '125430', description: 'Vehicle odometer reading' })
  @IsOptional()
  @IsString()
  Odometer?: string;

  @ApiPropertyOptional({ example: 'B 1234 ABC', description: 'Vehicle registration plate' })
  @IsOptional()
  @IsString()
  VehicleNo?: string;

  @ApiPropertyOptional({ example: 'Minibus', description: 'Vehicle type' })
  @IsOptional()
  @IsString()
  VehicleType?: string;

  @ApiPropertyOptional({ example: '08123456789', description: 'Customer phone number' })
  @IsOptional()
  @IsString()
  PhoneNo?: string;

  @ApiPropertyOptional({ example: 'PT Trans Nusantara', description: 'Agency or company name' })
  @IsOptional()
  @IsString()
  AgencyName?: string;

  @ApiPropertyOptional({ example: 'Logistik', description: 'Agency category' })
  @IsOptional()
  @IsString()
  AgencyType?: string;

  @ApiPropertyOptional({ example: 'Umum', description: 'Customer type classification' })
  @IsOptional()
  @IsString()
  CustomerType?: string;

  @ApiPropertyOptional({ description: 'Card info object for RFID/Fleet transactions, or null for Cash' })
  @IsOptional()
  Card?: FmsCardPresetDto | null;

  @ApiPropertyOptional({ type: [FmsPaymentItemDto], description: 'Payment breakdown array' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FmsPaymentItemDto)
  Payments?: FmsPaymentItemDto[];
}

export class FmsPresetCheckDto {
  @ApiPropertyOptional({ example: 200, description: 'Protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;

  @ApiProperty({ example: 1, description: 'Pump number' })
  @IsNotEmpty()
  @IsNumber()
  PumpNo: number;

  @ApiProperty({ example: 1, description: 'Hose number' })
  @IsNotEmpty()
  @IsNumber()
  HoseNo: number;
}

export class FmsPresetStatusDto {
  @ApiPropertyOptional({ example: 200, description: 'Protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;

  @ApiProperty({ example: 1, description: 'Pump number' })
  @IsNotEmpty()
  @IsNumber()
  PumpNo: number;

  @ApiProperty({ example: 1, description: 'Hose number' })
  @IsNotEmpty()
  @IsNumber()
  HoseNo: number;

  @ApiPropertyOptional({ example: '2', description: 'Preset type' })
  @IsOptional()
  @IsString()
  PresetType?: string;

  @ApiPropertyOptional({ example: 1, description: 'Preset ID returned during creation' })
  @IsOptional()
  PresetId?: number | string;

  @ApiPropertyOptional({ example: '2026-08-18 10:00:00', description: 'Preset timestamp' })
  @IsOptional()
  @IsString()
  PresetDT?: string;

  @ApiPropertyOptional({ example: '50000', description: 'Preset amount' })
  @IsOptional()
  Amount?: string | number;

  @ApiPropertyOptional({ example: '', description: 'Card number if applicable' })
  @IsOptional()
  @IsString()
  CardNo?: string;

  @ApiPropertyOptional({ example: '', description: 'Terminal ID if applicable' })
  @IsOptional()
  @IsString()
  TerminalId?: string;
}

export class FmsLockPumpDto {
  @ApiProperty({ example: 1, description: 'Dispenser pump number' })
  @IsNotEmpty()
  @IsNumber()
  PumpNumber: number;

  @ApiProperty({ example: 1, description: '0 = Lock / Stop, 1 = Unlock / Authorize' })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1])
  Lock: number;
}

export class FmsChangeMopDto {
  @ApiPropertyOptional({ example: 200, description: 'Protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;

  @ApiProperty({ example: 1, description: 'Pump number' })
  @IsNotEmpty()
  @IsNumber()
  PumpNo: number;

  @ApiProperty({ example: 10524, description: 'Delivery ID to update' })
  @IsNotEmpty()
  @IsNumber()
  DeliveryId: number;

  @ApiPropertyOptional({ example: 2, description: 'Attendant operator ID' })
  @IsOptional()
  @IsNumber()
  AttendantId?: number;

  @ApiPropertyOptional({ example: '125450', description: 'Vehicle odometer' })
  @IsOptional()
  @IsString()
  Odometer?: string;

  @ApiPropertyOptional({ example: 'B 1234 ABC', description: 'Vehicle plate number' })
  @IsOptional()
  @IsString()
  VehicleNo?: string;

  @ApiPropertyOptional({ example: 'Minibus', description: 'Vehicle type' })
  @IsOptional()
  @IsString()
  VehicleType?: string;

  @ApiPropertyOptional({ example: '08123456789', description: 'Customer phone' })
  @IsOptional()
  @IsString()
  PhoneNo?: string;

  @ApiPropertyOptional({ example: 'PT Trans', description: 'Agency name' })
  @IsOptional()
  @IsString()
  AgencyName?: string;

  @ApiPropertyOptional({ example: 'Logistik', description: 'Agency type' })
  @IsOptional()
  @IsString()
  AgencyType?: string;

  @ApiPropertyOptional({ example: 'Corporate', description: 'Customer type' })
  @IsOptional()
  @IsString()
  CustomerType?: string;

  @ApiProperty({ type: [FmsPaymentItemDto], description: 'Updated payments array' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FmsPaymentItemDto)
  Payments: FmsPaymentItemDto[];
}

export class FmsLastPreTransactionDto {
  @ApiPropertyOptional({ example: 200, description: 'Protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;

  @ApiProperty({ example: 1, description: 'Pump number' })
  @IsNotEmpty()
  @IsNumber()
  PumpNo: number;

  @ApiPropertyOptional({ example: 5, description: 'Number of rows to retrieve' })
  @IsOptional()
  @IsNumber()
  Row?: number;
}

export class FmsLastPostPurchaseDto {
  @ApiPropertyOptional({ example: 200, description: 'Protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;

  @ApiProperty({ example: 1, description: 'Pump number' })
  @IsNotEmpty()
  @IsNumber()
  PumpNo: number;

  @ApiPropertyOptional({ example: 5, description: 'Number of rows to retrieve' })
  @IsOptional()
  @IsNumber()
  Row?: number;
}

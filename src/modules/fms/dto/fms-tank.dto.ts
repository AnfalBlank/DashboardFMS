import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FmsLastTankDataDto {
  @ApiProperty({ example: 1, description: 'Storage tank number' })
  @IsNotEmpty()
  @IsNumber()
  TankNumber: number;
}

export class FmsDeliveryStartDto {
  @ApiProperty({ example: 1, description: 'Storage tank number receiving fuel delivery' })
  @IsNotEmpty()
  @IsNumber()
  TankNumber: number;
}

export class FmsDeliveryStatusDto {
  @ApiProperty({ example: 1, description: 'Storage tank number to check' })
  @IsNotEmpty()
  @IsNumber()
  TankNumber: number;
}

export class FmsDeliveryStopDto {
  @ApiProperty({ example: 1, description: 'Storage tank number' })
  @IsNotEmpty()
  @IsNumber()
  TankNumber: number;

  @ApiProperty({ example: 'DO-20260818-001', description: 'Delivery Order (DO) reference number' })
  @IsNotEmpty()
  @IsString()
  NoDO: string;

  @ApiProperty({ example: 'INV-20260818-001', description: 'Invoice reference number' })
  @IsNotEmpty()
  @IsString()
  NoInvoice: string;

  @ApiProperty({ example: '8000', description: 'Delivered fuel volume in Liters' })
  @IsNotEmpty()
  DeliveryVolume: string | number;

  @ApiProperty({ example: 'B 9999 PT', description: 'Tanker truck vehicle registration plate' })
  @IsNotEmpty()
  @IsString()
  NoKendaraan: string;

  @ApiProperty({ example: 'Budi Santoso', description: 'Tanker driver name' })
  @IsNotEmpty()
  @IsString()
  NamaPengemudi: string;

  @ApiProperty({ example: 'PT Pertamina Patra Niaga', description: 'Fuel supplier / distributor company' })
  @IsNotEmpty()
  @IsString()
  Pengirim: string;
}

export class FmsDeliveryTankDataDto {
  @ApiProperty({ example: '2026-08-18', description: 'Delivery query date in YYYY-MM-DD format' })
  @IsNotEmpty()
  @IsString()
  tgl_delivery: string;
}

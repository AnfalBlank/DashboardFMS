import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreatePresetDto {
  @ApiProperty({ description: 'Nomor kartu RFID', example: 'CRD-2026-001' })
  @IsString()
  @IsNotEmpty()
  card_number: string;

  @ApiProperty({ description: 'ID produk BBM', example: 'prod-ptx' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ description: 'ID Pompa Dispenser tujuan', example: 'pump-01' })
  @IsString()
  @IsNotEmpty()
  pump_id: string;

  @ApiProperty({ description: 'ID Nozzle BBM', example: 'nzl-01-1' })
  @IsString()
  nozzle_id: string;

  @ApiProperty({ description: 'Volume preset pengisian (Liter)', example: 45.5 })
  @IsNumber()
  @IsPositive()
  volume_l: number;

  @ApiPropertyOptional({ description: 'Shift kerja operator', example: 'PAGI' })
  @IsString()
  @IsOptional()
  shift?: string;

  @ApiPropertyOptional({ description: 'Angka totalizer awal/odometer', example: 12500.5 })
  @IsNumber()
  @IsOptional()
  totalizer_before?: number;
}

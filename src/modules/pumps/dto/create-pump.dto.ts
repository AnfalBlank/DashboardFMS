import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePumpDto {
  @ApiPropertyOptional({
    description: 'Kode / ID Unik Pompa Dispenser (opsional, default di-generate dari nomor dispenser)',
    example: 'PUMP-01',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Nomor Pompa Dispenser (misal 01, 1, 2)',
    example: '01',
  })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiPropertyOptional({
    description: 'Lokasi Pulau Pompa SPBP',
    example: 'Pulau Pompa 1 (Utara)',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Status Pompa Dispenser',
    enum: ['OFFLINE', 'IDLE', 'NOZZLE_UP', 'FUELLING'],
    default: 'IDLE',
  })
  @IsString()
  @IsOptional()
  @IsIn(['OFFLINE', 'IDLE', 'NOZZLE_UP', 'FUELLING'])
  status?: 'OFFLINE' | 'IDLE' | 'NOZZLE_UP' | 'FUELLING';

  @ApiPropertyOptional({
    description: 'Status Aktif (1 = Aktif, 0 = Nonaktif)',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  active?: number;

  @ApiPropertyOptional({
    description: 'ID Pompa Enabler (id_pump pada sistem Forecourt Controller)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  id_pump_enabler?: number;

  @ApiPropertyOptional({
    description: 'Status Preset Dispenser',
    enum: ['NONE', 'SET', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'NONE',
  })
  @IsString()
  @IsOptional()
  @IsIn(['NONE', 'SET', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  preset_status?: 'NONE' | 'SET' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

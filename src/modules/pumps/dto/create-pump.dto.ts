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
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE'],
    default: 'ACTIVE',
  })
  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE'])
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE';

  @ApiPropertyOptional({
    description: 'Status Aktif (1 = Aktif, 0 = Nonaktif)',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  active?: number;
}

import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePumpDto {
  @ApiPropertyOptional({
    description: 'Nomor Pompa Dispenser (misal 01, 1, 2)',
    example: '01',
  })
  @IsString()
  @IsOptional()
  number?: string;

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
    example: 'ACTIVE',
  })
  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE'])
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE';

  @ApiPropertyOptional({
    description: 'Status Aktif (1 = Aktif, 0 = Nonaktif)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  active?: number;
}

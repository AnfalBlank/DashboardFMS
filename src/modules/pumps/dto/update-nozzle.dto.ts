import {
  IsString,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNozzleDto {
  @ApiPropertyOptional({
    description: 'Nomor / Indeks Nozzle pada Dispenser (misal 1, 2, 3, 4)',
    example: '1',
  })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({
    description: 'ID Pompa Dispenser yang menaungi nozzle',
    example: 'PUMP-01',
  })
  @IsString()
  @IsOptional()
  pump_id?: string;

  @ApiPropertyOptional({
    description: 'ID Produk BBM yang dialirkan oleh nozzle',
    example: 'prod-solar',
  })
  @IsString()
  @IsOptional()
  product_id?: string;

  @ApiPropertyOptional({
    description: 'Status Nozzle',
    enum: ['ACTIVE', 'INACTIVE', 'OFFLINE'],
    example: 'ACTIVE',
  })
  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'OFFLINE'])
  status?: 'ACTIVE' | 'INACTIVE' | 'OFFLINE';
}

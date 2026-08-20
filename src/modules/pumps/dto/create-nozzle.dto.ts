import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNozzleDto {
  @ApiPropertyOptional({
    description: 'ID Unik Nozzle (opsional, default: NOZZLE-{pump_number}-{number})',
    example: 'NOZZLE-01-1',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Nomor / Indeks Nozzle pada Dispenser (misal 1, 2, 3, 4)',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({
    description: 'ID Pompa Dispenser yang menaungi nozzle',
    example: 'PUMP-01',
  })
  @IsString()
  @IsNotEmpty()
  pump_id: string;

  @ApiProperty({
    description: 'ID Produk BBM yang dialirkan oleh nozzle',
    example: 'prod-solar',
  })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiPropertyOptional({
    description: 'Status Nozzle',
    enum: ['ACTIVE', 'INACTIVE', 'OFFLINE'],
    default: 'ACTIVE',
  })
  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'OFFLINE'])
  status?: 'ACTIVE' | 'INACTIVE' | 'OFFLINE';
}

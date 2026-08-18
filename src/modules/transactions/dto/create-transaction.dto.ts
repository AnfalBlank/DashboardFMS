import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 'CRD-2026-001' })
  @IsString()
  @IsNotEmpty()
  card_number: string;

  @ApiProperty({ example: 'prod-ptx' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiPropertyOptional({ example: 'nzl-01-1' })
  @IsString()
  @IsOptional()
  nozzle_id?: string;

  @ApiPropertyOptional({ example: 'pump-01' })
  @IsString()
  @IsOptional()
  pump_id?: string;

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  @IsPositive()
  volume_l: number;

  @ApiPropertyOptional({ enum: ['PAGI', 'SIANG', 'MALAM'], default: 'PAGI' })
  @IsEnum(['PAGI', 'SIANG', 'MALAM'])
  @IsOptional()
  shift?: 'PAGI' | 'SIANG' | 'MALAM';

  @ApiPropertyOptional({ example: 12500.5 })
  @IsNumber()
  @IsOptional()
  totalizer_before?: number;

  @ApiPropertyOptional({ example: 12546.0 })
  @IsNumber()
  @IsOptional()
  totalizer_after?: number;

  @ApiPropertyOptional({ enum: ['CONTROLLER', 'MANUAL', 'API'], default: 'MANUAL' })
  @IsEnum(['CONTROLLER', 'MANUAL', 'API'])
  @IsOptional()
  source?: 'CONTROLLER' | 'MANUAL' | 'API';

  @ApiPropertyOptional({ example: '2026-08-17T10:30:00.000Z' })
  @IsString()
  @IsOptional()
  transaction_time?: string;
}

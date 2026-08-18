import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ControllerTransactionPushDto {
  @ApiProperty({ example: 'CRD-2026-001' })
  @IsString()
  @IsNotEmpty()
  card_number: string;

  @ApiPropertyOptional({ example: 'PTX' })
  @IsString()
  @IsOptional()
  product_code?: string;

  @ApiPropertyOptional({ example: 'prod-ptx' })
  @IsString()
  @IsOptional()
  product_id?: string;

  @ApiProperty({ example: 35.0 })
  @IsNumber()
  @IsPositive()
  volume_l: number;

  @ApiPropertyOptional({ example: 'nzl-01-1' })
  @IsString()
  @IsOptional()
  nozzle_id?: string;

  @ApiPropertyOptional({ example: 'pump-01' })
  @IsString()
  @IsOptional()
  pump_id?: string;

  @ApiPropertyOptional({ example: 'PAGI' })
  @IsString()
  @IsOptional()
  shift?: string;

  @ApiPropertyOptional({ example: 12500.0 })
  @IsNumber()
  @IsOptional()
  totalizer_before?: number;

  @ApiPropertyOptional({ example: 12535.0 })
  @IsNumber()
  @IsOptional()
  totalizer_after?: number;

  @ApiPropertyOptional({ example: '2026-08-17T10:45:00.000Z' })
  @IsString()
  @IsOptional()
  transaction_time?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class StockAdjustmentDto {
  @ApiProperty({ example: 'prod-ptx' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiPropertyOptional({ example: 'tank-01' })
  @IsString()
  @IsOptional()
  tank_id?: string;

  @ApiProperty({ example: -50 })
  @IsNumber()
  delta_l: number;

  @ApiProperty({ example: 'Koreksi penguapan suhu udara tinggi mingguan' })
  @IsString()
  @MinLength(5)
  reason: string;
}

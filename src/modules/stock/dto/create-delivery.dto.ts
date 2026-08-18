import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({ example: '2026-08-17' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'PT Pertamina Patra Niaga' })
  @IsString()
  @IsNotEmpty()
  supplier: string;

  @ApiProperty({ example: 'prod-ptx' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 8000 })
  @IsNumber()
  @IsPositive()
  quantity_l: number;

  @ApiPropertyOptional({ example: 'tank-01' })
  @IsString()
  @IsOptional()
  tank_id?: string;

  @ApiPropertyOptional({ example: 'DO-2026-0881' })
  @IsString()
  @IsOptional()
  doc_number?: string;

  @ApiPropertyOptional({ example: 'Penerimaan BBM via Mobil Tangki Pertamina' })
  @IsString()
  @IsOptional()
  delivery_note?: string;
}

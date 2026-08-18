import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GenerateQuotaDto {
  @ApiProperty({ example: 'August 2026' })
  @IsString()
  @IsNotEmpty()
  period: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  year: number;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 'prod-ptx' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @IsPositive()
  default_l: number;

  @ApiPropertyOptional({ enum: ['all', 'unit', 'custom'], default: 'all' })
  @IsEnum(['all', 'unit', 'custom'])
  @IsOptional()
  scope?: 'all' | 'unit' | 'custom';

  @ApiPropertyOptional({ example: 'unit-ditres' })
  @IsString()
  @IsOptional()
  unit_id?: string;

  @ApiPropertyOptional({ example: ['crd-01', 'crd-02'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  card_ids?: string[];
}

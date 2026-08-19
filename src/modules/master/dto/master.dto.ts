import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'PTX' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Pertamax' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ['Bensin', 'Solar', 'LPG'], example: 'Bensin' })
  @IsEnum(['Bensin', 'Solar', 'LPG'])
  @IsNotEmpty()
  type: 'Bensin' | 'Solar' | 'LPG';

  @ApiPropertyOptional({ example: 'Liter', default: 'Liter' })
  @IsString()
  @IsOptional()
  unit?: string;
}

export class CreatePriceDto {
  @ApiProperty({ example: 'prod-ptx' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 12500 })
  @IsNumber()
  @IsPositive()
  price_per_unit: number;

  @ApiProperty({ example: '2026-09-01' })
  @IsString()
  @IsNotEmpty()
  effective_date: string;
}

export class CreateVehicleDto {
  @ApiProperty({ example: 'PB 1234 XX' })
  @IsString()
  @IsNotEmpty()
  police_number: string;

  @ApiPropertyOptional({ example: 'Sedan' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 'Corolla Altis' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsNumber()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ example: 'unit-ditres' })
  @IsString()
  @IsOptional()
  unit_id?: string;

  @ApiPropertyOptional({ example: 'prod-ptx', description: 'Product ID from master products' })
  @IsString()
  @IsOptional()
  product_id?: string;

  @ApiPropertyOptional({ example: 'PTX', description: 'Fuel type code or name (optional if product_id provided)' })
  @IsString()
  @IsOptional()
  fuel_type?: string;

  @ApiPropertyOptional({ example: 'Mobil Dinas Operasional' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'Sedan' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 'Corolla Altis' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsNumber()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ example: 'unit-ditres' })
  @IsString()
  @IsOptional()
  unit_id?: string;

  @ApiPropertyOptional({ example: 'prod-ptx', description: 'Product ID from master products' })
  @IsString()
  @IsOptional()
  product_id?: string;

  @ApiPropertyOptional({ example: 'PTX', description: 'Fuel type code or name' })
  @IsString()
  @IsOptional()
  fuel_type?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Catatan operasional' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateUnitDto {
  @ApiProperty({ example: 'DITRES' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'DITRESKRIMSUS' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'unit-polda' })
  @IsString()
  @IsOptional()
  parent_id?: string;

  @ApiPropertyOptional({ example: 'Kombes Polisi ...' })
  @IsString()
  @IsOptional()
  commander?: string;

  @ApiPropertyOptional({ example: 200, default: 200 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  default_alloc_l?: number;
}

export class UpdateUnitDto {
  @ApiPropertyOptional({ example: 'DITRESKRIMSUS Polda PB' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Kombes Polisi ...' })
  @IsString()
  @IsOptional()
  commander?: string;

  @ApiPropertyOptional({ example: 250 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  default_alloc_l?: number;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsString()
  @IsOptional()
  status?: string;
}

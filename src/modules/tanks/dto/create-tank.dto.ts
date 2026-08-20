import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTankDto {
  @ApiPropertyOptional({
    description: 'Kode / ID Unik Tangki (misal TANK-01, jika kosong akan di-generate otomatis)',
    example: 'TANK-01',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'ID Produk BBM yang ditampung tangki',
    example: 'prod-solar',
  })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({
    description: 'Kapasitas maksimal tangki (Liter)',
    example: 20000,
  })
  @IsNumber()
  @Min(1)
  capacity_l: number;

  @ApiPropertyOptional({
    description: 'Stok fisik awal tangki (Liter)',
    example: 15000,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  current_l?: number;

  @ApiPropertyOptional({
    description: 'Warna minyak (oil_color)',
    enum: ['blue', 'green', 'red', 'yellow'],
    default: 'blue',
  })
  @IsString()
  @IsOptional()
  @IsIn(['blue', 'green', 'red', 'yellow'])
  oil_color?: 'blue' | 'green' | 'red' | 'yellow';

  @ApiPropertyOptional({
    description: 'Warna air (water_color)',
    enum: ['blue', 'yellow'],
    default: 'blue',
  })
  @IsString()
  @IsOptional()
  @IsIn(['blue', 'yellow'])
  water_color?: 'blue' | 'yellow';

  @ApiPropertyOptional({
    description: 'Status aktif (1 = Aktif, 0 = Nonaktif)',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  active?: number;

  @ApiPropertyOptional({
    description: 'ID Port komunikasi sensor ATG',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  id_port?: number;

  @ApiPropertyOptional({
    description: 'ID Polling sensor ATG',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  id_polling?: number;

  @ApiPropertyOptional({
    description: 'ID Tangki Enabler (id_tank pada sistem Forecourt Controller)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  id_tank_enabler?: number;

  @ApiPropertyOptional({
    description: 'Ambang batas status LOW (%)',
    example: 30,
    default: 30,
  })
  @IsNumber()
  @IsOptional()
  threshold_low?: number;

  @ApiPropertyOptional({
    description: 'Ambang batas status CRITICAL (%)',
    example: 15,
    default: 15,
  })
  @IsNumber()
  @IsOptional()
  threshold_critical?: number;

  @ApiPropertyOptional({
    description: 'Ambang batas status HIGH (%)',
    example: 90,
    default: 90,
  })
  @IsNumber()
  @IsOptional()
  threshold_high?: number;

  @ApiPropertyOptional({
    description: 'Status tangki',
    enum: ['NORMAL', 'LOW', 'CRITICAL', 'HIGH', 'SENSOR_ERROR', 'OFFLINE'],
    default: 'NORMAL',
  })
  @IsString()
  @IsOptional()
  @IsIn(['NORMAL', 'LOW', 'CRITICAL', 'HIGH', 'SENSOR_ERROR', 'OFFLINE'])
  status?: 'NORMAL' | 'LOW' | 'CRITICAL' | 'HIGH' | 'SENSOR_ERROR' | 'OFFLINE';
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TankReadingDto {
  @ApiProperty({ example: 12500 })
  @IsNumber()
  @Min(0)
  volume_l: number;

  @ApiPropertyOptional({ example: 280.5 })
  @IsNumber()
  @IsOptional()
  height_cm?: number;

  @ApiPropertyOptional({ example: 0.0 })
  @IsNumber()
  @IsOptional()
  water_level?: number;

  @ApiPropertyOptional({ example: 28.5 })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({ enum: ['SENSOR', 'MANUAL'], default: 'SENSOR' })
  @IsEnum(['SENSOR', 'MANUAL'])
  @IsOptional()
  source?: 'SENSOR' | 'MANUAL';

  @ApiPropertyOptional({ example: '2026-08-17T10:00:00.000Z' })
  @IsString()
  @IsOptional()
  read_at?: string;
}

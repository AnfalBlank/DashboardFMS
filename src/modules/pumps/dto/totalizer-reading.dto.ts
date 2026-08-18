import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TotalizerReadingDto {
  @ApiProperty({ example: 'nzl-01-1' })
  @IsString()
  @IsNotEmpty()
  nozzle_id: string;

  @ApiProperty({ example: 10450.5 })
  @IsNumber()
  @Min(0)
  opening_value: number;

  @ApiProperty({ example: 10890.2 })
  @IsNumber()
  @Min(0)
  current_value: number;

  @ApiProperty({ example: '2026-08-17' })
  @IsString()
  @IsNotEmpty()
  shift_date: string;

  @ApiPropertyOptional({ enum: ['PAGI', 'SIANG', 'MALAM'], default: 'PAGI' })
  @IsEnum(['PAGI', 'SIANG', 'MALAM'])
  @IsOptional()
  shift?: 'PAGI' | 'SIANG' | 'MALAM';
}

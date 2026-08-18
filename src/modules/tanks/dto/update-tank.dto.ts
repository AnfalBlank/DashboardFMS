import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTankDto {
  @ApiPropertyOptional({ example: 12000 })
  @IsNumber()
  @IsOptional()
  current_l?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @IsOptional()
  threshold_low?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsOptional()
  threshold_critical?: number;

  @ApiPropertyOptional({ example: 90 })
  @IsNumber()
  @IsOptional()
  threshold_high?: number;

  @ApiPropertyOptional({ example: 'Kalibrasi fisik tangki' })
  @IsString()
  @IsOptional()
  reason?: string;
}

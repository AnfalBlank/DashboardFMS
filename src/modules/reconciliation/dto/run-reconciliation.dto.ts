import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RunReconciliationDto {
  @ApiPropertyOptional({ example: '2026-08-17' })
  @IsString()
  @IsOptional()
  date?: string;
}

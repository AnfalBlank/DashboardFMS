import { IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FmsAcknowledgeDto {
  @ApiPropertyOptional({ example: 200, description: 'Handshake protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;
}

export class FmsConfigurationDto {
  @ApiPropertyOptional({ example: 200, description: 'Discovery protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;
}

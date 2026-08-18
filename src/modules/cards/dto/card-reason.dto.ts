import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CardReasonDto {
  @ApiPropertyOptional({ example: 'Kartu hilang atau rusak' })
  @IsString()
  @IsOptional()
  reason?: string;
}

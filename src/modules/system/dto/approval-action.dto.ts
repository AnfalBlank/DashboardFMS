import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApprovalActionDto {
  @ApiPropertyOptional({ example: 'Disetujui untuk pemenuhan dinas kepolisian' })
  @IsString()
  @IsOptional()
  note?: string;
}

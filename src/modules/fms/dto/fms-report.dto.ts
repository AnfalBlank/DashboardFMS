import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FmsBackupDto {
  @ApiProperty({ example: '2026-08-18 00:00:00', description: 'Start datetime in YYYY-MM-DD HH:mm:ss format' })
  @IsNotEmpty()
  @IsString()
  waktuAwal: string;

  @ApiProperty({ example: '2026-08-18 23:59:59', description: 'End datetime in YYYY-MM-DD HH:mm:ss format' })
  @IsNotEmpty()
  @IsString()
  waktuAkhir: string;
}

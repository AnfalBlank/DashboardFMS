import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FmsRfidInfoDto {
  @ApiPropertyOptional({ example: 200, description: 'Protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;

  @ApiProperty({ example: 1, description: 'Pump number where card is scanned' })
  @IsNotEmpty()
  @IsNumber()
  PumpNo: number;

  @ApiProperty({ example: 1, description: 'Hose number' })
  @IsNotEmpty()
  @IsNumber()
  HoseNo: number;

  @ApiProperty({ example: 'E280117000000200', description: 'RFID card number or hexadecimal UID' })
  @IsNotEmpty()
  @IsString()
  CardNo: string;
}

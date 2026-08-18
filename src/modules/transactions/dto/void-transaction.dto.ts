import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VoidTransactionDto {
  @ApiProperty({ example: 'Salah input volume transaksi oleh operator' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

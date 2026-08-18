import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class TopupQuotaDto {
  @ApiProperty({ example: 'crd-01' })
  @IsString()
  @IsNotEmpty()
  card_id: string;

  @ApiProperty({ example: 'prod-ptx' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @IsPositive()
  amount_l: number;

  @ApiProperty({ example: 'Tambahan patroli dinas luar kota' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

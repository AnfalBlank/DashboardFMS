import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class TopupQuotaDto {
  @ApiProperty({ example: 'crd-01', description: 'Card ID or Card Number' })
  @IsString()
  @IsNotEmpty()
  card_id: string;

  @ApiPropertyOptional({
    example: 'prod-ptx',
    description: 'Product ID (opsional: otomatis diambil dari data kendaraan tertaut ke kartu)',
  })
  @IsString()
  @IsOptional()
  product_id?: string;

  @ApiProperty({ example: 50, description: 'Volume top up dalam Liter' })
  @IsNumber()
  @IsPositive()
  amount_l: number;

  @ApiProperty({ example: 'Tambahan patroli dinas luar kota', description: 'Alasan pengajuan top up' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}


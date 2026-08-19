import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ example: 'CRD-2026-001' })
  @IsString()
  @IsNotEmpty()
  card_number: string;

  @ApiPropertyOptional({ enum: ['REGULER', 'KHUSUS'], default: 'REGULER' })
  @IsEnum(['REGULER', 'KHUSUS'])
  @IsOptional()
  card_type?: 'REGULER' | 'KHUSUS';

  @ApiProperty({ example: 'Bripka Joko Susilo' })
  @IsString()
  @IsNotEmpty()
  holder_name: string;

  @ApiPropertyOptional({ example: 'unit-ditres' })
  @IsString()
  @IsOptional()
  unit_id?: string;

  @ApiPropertyOptional({ example: 'veh-01', description: 'Assigned vehicle ID. Card fuel_type will automatically follow vehicle product.' })
  @IsString()
  @IsOptional()
  vehicle_id?: string;

  @ApiPropertyOptional({ example: 'Pertamax', description: 'Fuel type (auto-inherited from vehicle if vehicle_id is provided)' })
  @IsString()
  @IsOptional()
  fuel_type?: string;

  @ApiPropertyOptional({ example: 200, default: 200 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  monthly_limit?: number;

  @ApiPropertyOptional({ example: '2027-12-31' })
  @IsString()
  @IsOptional()
  expiry_date?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsString()
  @IsOptional()
  activation_date?: string;

  @ApiPropertyOptional({ example: 'E28068940000' })
  @IsString()
  @IsOptional()
  rfid_uid?: string;

  @ApiPropertyOptional({ example: 'Kendaraan Dinas Patroli' })
  @IsString()
  @IsOptional()
  notes?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateCardDto {
  @ApiPropertyOptional({ example: 'Bripka Joko Susilo' })
  @IsString()
  @IsOptional()
  holder_name?: string;

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

  @ApiPropertyOptional({ example: 250 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  monthly_limit?: number;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'E28068940000', description: 'RFID UID tag' })
  @IsString()
  @IsOptional()
  rfid_uid?: string;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

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

  @ApiPropertyOptional({ example: 'veh-01' })
  @IsString()
  @IsOptional()
  vehicle_id?: string;

  @ApiPropertyOptional({ example: 'PTX' })
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
  notes?: string;
}

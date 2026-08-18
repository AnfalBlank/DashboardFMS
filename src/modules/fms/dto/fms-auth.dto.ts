import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FmsLoginDto {
  @ApiPropertyOptional({ example: 200, description: 'Protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;

  @ApiProperty({ example: 'operator1', description: 'Operator or Admin user ID' })
  @IsNotEmpty()
  @IsString()
  UserId: string;

  @ApiProperty({ example: 'password123', description: 'User login password' })
  @IsNotEmpty()
  @IsString()
  Password: string;
}

export class FmsLogoutDto {
  @ApiPropertyOptional({ example: 200, description: 'Protocol code' })
  @IsOptional()
  @IsNumber()
  Code?: number;

  @ApiProperty({ example: 'operator1', description: 'Operator or Admin user ID' })
  @IsNotEmpty()
  @IsString()
  UserId: string;

  @ApiPropertyOptional({ example: 'password123', description: 'User password (optional for logout)' })
  @IsOptional()
  @IsString()
  Password?: string;
}

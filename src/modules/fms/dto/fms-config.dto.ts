import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FmsPriceChangeDto {
  @ApiProperty({ example: 1, description: 'Fuel grade ID' })
  @IsNotEmpty()
  @IsNumber()
  GradeId: number;

  @ApiProperty({ example: 10000, description: 'New fuel price per liter' })
  @IsNotEmpty()
  @IsNumber()
  Price: number;

  @ApiProperty({ example: '2026-08-18 00:00:00', description: 'Activation datetime in YYYY-MM-DD HH:mm:ss format' })
  @IsNotEmpty()
  @IsString()
  ActiveDT: string;
}

export class FmsConnectionConfigDto {
  @ApiProperty({ example: 'Pertamina_SPBU_WiFi', description: 'WiFi SSID' })
  @IsNotEmpty()
  @IsString()
  ssid: string;

  @ApiProperty({ example: 'SecretPassphrase', description: 'WiFi WPA2/WPA3 passphrase' })
  @IsNotEmpty()
  @IsString()
  psk: string;

  @ApiProperty({ example: true, description: 'Flag enabling or disabling system proxy' })
  @IsNotEmpty()
  @IsBoolean()
  proxy_active_flag: boolean;

  @ApiProperty({ example: '10.0.0.1:8080', description: 'HTTP proxy host:port' })
  @IsNotEmpty()
  @IsString()
  http: string;

  @ApiProperty({ example: '10.0.0.1:8080', description: 'HTTPS proxy host:port' })
  @IsNotEmpty()
  @IsString()
  https: string;

  @ApiProperty({ example: '10.0.0.1:8080', description: 'FTP proxy host:port' })
  @IsNotEmpty()
  @IsString()
  ftp: string;
}

export class FmsDatabaseConfigDto {
  @ApiPropertyOptional({ example: 'http://192.168.1.100/api', description: 'FMS Forecourt Controller Base URL' })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({ example: 15000, description: 'Request timeout in milliseconds' })
  @IsOptional()
  @IsNumber()
  timeoutMs?: number;

  @ApiPropertyOptional({ example: false, description: 'Enable debug logging for FMS requests/responses' })
  @IsOptional()
  @IsBoolean()
  debug?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Flag to enable or disable FMS integration' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    example: { 'X-Custom-Header': 'CustomValue' },
    description: 'Custom HTTP headers as key-value pairs',
  })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;
}

export class FmsTestConnectionDto {
  @ApiPropertyOptional({ example: 'http://192.168.1.100/api', description: 'Target Base URL to test (optional, defaults to active config)' })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({ example: 5000, description: 'Test connection timeout in milliseconds' })
  @IsOptional()
  @IsNumber()
  timeoutMs?: number;
}

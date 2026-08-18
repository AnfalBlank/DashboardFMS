import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FmsSetSiteProfilDto {
  @ApiProperty({ example: '31.123.45', description: 'SPBU site identification number' })
  @IsNotEmpty()
  @IsString()
  IdSite: string;

  @ApiProperty({ example: 1, description: 'Forecourt controller ID' })
  @IsNotEmpty()
  @IsNumber()
  IdController: number;

  @ApiProperty({ example: 1, description: 'Company / business entity ID' })
  @IsNotEmpty()
  @IsNumber()
  IdCompany: number;
}

export class FmsSetDtimeConfigDto {
  @ApiProperty({ example: '2026-08-18 10:45:00', description: 'System datetime in YYYY-MM-DD HH:mm:ss format' })
  @IsNotEmpty()
  @IsString()
  Datetime: string;
}

export class FmsReceiptHeaderItemDto {
  @ApiProperty({ example: 1, description: 'Line number (1-4)' })
  @IsNotEmpty()
  @IsNumber()
  baris: number;

  @ApiProperty({ example: 'SPBU PERTAMINA 31.123.45', description: 'Header line text' })
  @IsNotEmpty()
  @IsString()
  text: string;
}

export class FmsSetHeadersConfigDto {
  @ApiProperty({ type: [FmsReceiptHeaderItemDto], description: 'Receipt header lines' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FmsReceiptHeaderItemDto)
  Headers: FmsReceiptHeaderItemDto[];
}

export class FmsReceiptFooterItemDto {
  @ApiProperty({ example: 1, description: 'Line number (1-4)' })
  @IsNotEmpty()
  @IsNumber()
  baris: number;

  @ApiProperty({ example: 'TERIMA KASIH', description: 'Footer line text' })
  @IsNotEmpty()
  @IsString()
  text: string;
}

export class FmsSetFootersConfigDto {
  @ApiProperty({ type: [FmsReceiptFooterItemDto], description: 'Receipt footer lines' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FmsReceiptFooterItemDto)
  Footers: FmsReceiptFooterItemDto[];
}

export class FmsLinkServerItemDto {
  @ApiProperty({ example: 1, description: 'Server sequence number' })
  @IsNotEmpty()
  @IsNumber()
  no: number;

  @ApiProperty({ example: 'https://api-central.pertamina.com/v1/sync', description: 'Central sync endpoint URL' })
  @IsNotEmpty()
  @IsString()
  link: string;
}

export class FmsSetLinkServerConfigDto {
  @ApiProperty({ type: [FmsLinkServerItemDto], description: 'List of central sync server links' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FmsLinkServerItemDto)
  Link_Server: FmsLinkServerItemDto[];
}

export class FmsPortItemDto {
  @ApiProperty({ example: 1, description: 'Port ID' })
  @IsNotEmpty()
  @IsNumber()
  id_port: number;

  @ApiProperty({ example: 'ttyUSB0', description: 'Linux USB serial port name' })
  @IsNotEmpty()
  @IsString()
  usb_name: string;

  @ApiProperty({ example: 'Gilbarco', description: 'Connected device protocol / brand name' })
  @IsNotEmpty()
  @IsString()
  device_name: string;

  @ApiProperty({ example: 1, description: '1=Active, 0=Inactive' })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1])
  aktif_flag: number;
}

export class FmsSetPortsConfigDto {
  @ApiProperty({ type: [FmsPortItemDto], description: 'Serial COM port hardware assignments' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FmsPortItemDto)
  Ports: FmsPortItemDto[];
}

export class FmsProductItemDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsNotEmpty()
  @IsNumber()
  id_produk: number;

  @ApiProperty({ example: 'PERTALITE', description: 'Product name' })
  @IsNotEmpty()
  @IsString()
  nama_produk: string;

  @ApiProperty({ example: 10000, description: 'Price per liter' })
  @IsNotEmpty()
  @IsNumber()
  harga_produk: number;

  @ApiProperty({ example: 1, description: 'Product code number' })
  @IsNotEmpty()
  @IsNumber()
  code_produk: number;

  @ApiProperty({ example: 'subsidi', description: 'Subsidy status: subsidi | non-subsidi' })
  @IsNotEmpty()
  @IsString()
  status_produk: string;
}

export class FmsSetProductsConfigDto {
  @ApiProperty({ type: [FmsProductItemDto], description: 'Products catalogue array' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FmsProductItemDto)
  Products: FmsProductItemDto[];
}

export class FmsPumpProductConfigDto {
  @ApiProperty({ example: 'PERTALITE', description: 'Fuel product name' })
  @IsNotEmpty()
  @IsString()
  nama_produk: string;

  @ApiProperty({ example: 1, description: 'Connected storage tank number' })
  @IsNotEmpty()
  @IsNumber()
  number_tank: number;

  @ApiProperty({ example: 10000, description: 'Product price' })
  @IsNotEmpty()
  @IsNumber()
  harga_produk: number;
}

export class FmsPumpConfigItemDto {
  @ApiProperty({ example: 1, description: 'Dispenser pump number' })
  @IsNotEmpty()
  @IsNumber()
  number_pump: number;

  @ApiProperty({ example: 'DISPENSER 1', description: 'Dispenser label name' })
  @IsNotEmpty()
  @IsString()
  name_pump: string;

  @ApiProperty({ example: 1, description: 'Connected serial port number' })
  @IsNotEmpty()
  @IsNumber()
  port_number: number;

  @ApiProperty({ type: [FmsPumpProductConfigDto], description: 'Hose & nozzle products on this dispenser' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FmsPumpProductConfigDto)
  products: FmsPumpProductConfigDto[];
}

export class FmsSetPumpsConfigDto {
  @ApiProperty({ type: [FmsPumpConfigItemDto], description: 'Dispenser pumps forecourt configuration' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FmsPumpConfigItemDto)
  Pumps: FmsPumpConfigItemDto[];
}

export class FmsTankConfigItemDto {
  @ApiProperty({ example: 1, description: 'ATG unit ID' })
  @IsNotEmpty()
  @IsNumber()
  id_atg: number;

  @ApiProperty({ example: 1, description: 'Tank sequence number' })
  @IsNotEmpty()
  @IsNumber()
  number_tank: number;

  @ApiProperty({ example: 'TANGKI 1', description: 'Tank label name' })
  @IsNotEmpty()
  @IsString()
  name_tank: string;

  @ApiProperty({ example: 1, description: 'ATG polling ID / address' })
  @IsNotEmpty()
  @IsNumber()
  id_polling: number;

  @ApiProperty({ example: 2, description: 'Connected serial port ID' })
  @IsNotEmpty()
  @IsNumber()
  id_port: number;

  @ApiProperty({ example: '#00ff00', description: 'UI display color for fuel' })
  @IsNotEmpty()
  @IsString()
  warna_minyak: string;

  @ApiProperty({ example: '#0000ff', description: 'UI display color for water layer' })
  @IsNotEmpty()
  @IsString()
  warna_air: string;

  @ApiProperty({ example: '0', description: 'Fuel calibration offset' })
  @IsNotEmpty()
  @IsString()
  koreksi_minyak: string;

  @ApiProperty({ example: '0', description: 'Water calibration offset' })
  @IsNotEmpty()
  @IsString()
  koreksi_air: string;

  @ApiProperty({ example: 'PERTALITE', description: 'Fuel product assigned to tank' })
  @IsNotEmpty()
  @IsString()
  produk: string;
}

export class FmsSetTanksConfigDto {
  @ApiProperty({ type: [FmsTankConfigItemDto], description: 'Storage tanks configuration array' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FmsTankConfigItemDto)
  Tanks: FmsTankConfigItemDto[];
}

export class FmsSetWifiConfigDto {
  @ApiProperty({ example: 'Pertamina_SPBU_WiFi', description: 'WiFi SSID' })
  @IsNotEmpty()
  @IsString()
  SSID: string;

  @ApiProperty({ example: 'SecretPassphrase', description: 'WiFi password' })
  @IsNotEmpty()
  @IsString()
  PSK: string;
}

export class FmsSetProxyConfigDto {
  @ApiProperty({ example: '10.0.0.1:8080', description: 'HTTP proxy host:port' })
  @IsNotEmpty()
  @IsString()
  HTTP: string;

  @ApiProperty({ example: '10.0.0.1:8080', description: 'HTTPS proxy host:port' })
  @IsNotEmpty()
  @IsString()
  HTTPS: string;

  @ApiProperty({ example: '10.0.0.1:8080', description: 'FTP proxy host:port' })
  @IsNotEmpty()
  @IsString()
  FTP: string;

  @ApiProperty({ example: 1, description: '1=Active, 0=Inactive' })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1])
  ACTIVE_FLAG: number;
}

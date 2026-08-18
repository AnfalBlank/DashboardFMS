/**
 * Pertamina SPBU Forecourt Controller & POS API Interfaces
 */

// ==========================================
// Operational Enums & Constants
// ==========================================

export enum FmsPumpOperationalState {
  OFFLINE = 1,
  IDLE = 4,
  NOZZLE_UP = 7,
  FUELING = 9,
  COMPLETE = 10,
}

export enum FmsPumpStatus {
  OFFLINE = 0,
  IDLE = 1,
  NOZZLE_UP = 2,
  FUELING = 3,
  COMPLETE = 4,
}

export enum FmsPaymentType {
  CASH = 1,
  PREPAID_CARD = 2,
  EDC_BANK = 3,
  FLEET_RFID = 4,
  QRIS = 5,
  VOUCHER = 6,
}

export enum FmsUserRole {
  OPERATOR = 2,
  ADMIN = 3,
}

// ==========================================
// Section 1: Authentication & Session
// ==========================================

export interface FmsLoginRequest {
  Code?: number;
  UserId: string;
  Password: string;
}

export interface FmsLoginResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  UserId?: string;
  RoleId?: number | string;
  ActivePumps?: number[];
  SessionId?: string;
  [key: string]: any;
}

export interface FmsLogoutRequest {
  Code?: number;
  UserId: string;
  Password?: string;
}

export interface FmsLogoutResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  [key: string]: any;
}

// ==========================================
// Section 2: Handshake & Discovery
// ==========================================

export interface FmsAcknowledgeRequest {
  Code?: number;
}

export interface FmsAcknowledgeResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  ServerTime?: string;
  ControllerVersion?: string;
  [key: string]: any;
}

export interface FmsConfigurationRequest {
  Code?: number;
}

export interface FmsConfigurationResponse {
  Code?: number;
  Status?: boolean | string;
  SiteProfile?: {
    IdSite?: string;
    SiteName?: string;
    Address?: string;
    City?: string;
    Phone?: string;
    IdCompany?: number;
    IdController?: number;
  };
  Headers?: Array<{ baris: number; text: string }>;
  Footers?: Array<{ baris: number; text: string }>;
  Products?: Array<{
    id_produk: number;
    nama_produk: string;
    harga_produk: number;
    code_produk: number;
    status_produk: string;
  }>;
  Pumps?: Array<{
    number_pump: number;
    name_pump: string;
    port_number: number;
    products: Array<{
      nama_produk: string;
      number_tank: number;
      harga_produk: number;
    }>;
  }>;
  Tanks?: Array<{
    id_atg: number;
    number_tank: number;
    name_tank: string;
    id_polling: number;
    id_port: number;
    warna_minyak: string;
    warna_air: string;
    produk: string;
  }>;
  PaymentMethods?: Array<{
    type: number;
    name: string;
  }>;
  [key: string]: any;
}

// ==========================================
// Section 3: Pump Forecourt Operations
// ==========================================

export interface FmsListPumpRequest {
  [key: string]: any;
}

export interface FmsPumpProductInfo {
  nama_produk: string;
  number_tank?: number;
  harga_produk: number;
  code_produk?: number;
}

export interface FmsPumpInfo {
  number_pump: number;
  name_pump: string;
  port_number?: number;
  status?: number;
  products?: FmsPumpProductInfo[];
  [key: string]: any;
}

export interface FmsListPumpResponse {
  Code?: number;
  Pumps?: FmsPumpInfo[];
  Data?: FmsPumpInfo[];
  [key: string]: any;
}

export interface FmsLastPumpDataRequest {
  PumpNumber: number;
}

export interface FmsLastPumpDataResponse {
  Code?: number;
  PumpNumber?: number;
  PumpNo?: number;
  HoseNo?: number;
  ProductGrade?: string;
  UnitPrice?: number;
  Volume?: number;
  Amount?: number;
  Totalizer?: number;
  Status?: number; // 0=Offline, 1=Idle, 2=NozzleUp, 3=Fueling, 4=Complete
  StatusDescription?: string;
  [key: string]: any;
}

export interface FmsPumpStateRequest {
  Code?: number;
  PumpNo: number;
}

export interface FmsPumpStateResponse {
  Code?: number;
  PumpNo?: number;
  State?: number; // 1=Offline, 4=Idle, 7=NozzleUp, 9=Fueling, 10=Complete
  StateName?: string;
  [key: string]: any;
}

export interface FmsPaymentDetail {
  Type: number;
  Name: string;
  Amount: number;
  RefNo?: string;
  VerifyNo?: string;
  TerminalId?: string;
}

export interface FmsCardPresetDetail {
  CardNo?: string;
  PlateNo?: string;
  CustomerName?: string;
  Balance?: number;
  [key: string]: any;
}

export interface FmsPresetRequest {
  PumpNo: number;
  HoseNo: number;
  Amount: string | number;
  Odometer?: string;
  VehicleNo?: string;
  VehicleType?: string;
  PhoneNo?: string;
  AgencyName?: string;
  AgencyType?: string;
  CustomerType?: string;
  Card?: FmsCardPresetDetail | null;
  Payments?: FmsPaymentDetail[];
}

export interface FmsPresetResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  PresetId?: number | string;
  PresetDT?: string;
  PumpNo?: number;
  HoseNo?: number;
  Amount?: string | number;
  [key: string]: any;
}

export interface FmsPresetCheckRequest {
  Code?: number;
  PumpNo: number;
  HoseNo: number;
}

export interface FmsPresetCheckResponse {
  Code?: number;
  Status?: boolean | string;
  IsAvailable?: boolean;
  Message?: string;
  PumpNo?: number;
  HoseNo?: number;
  [key: string]: any;
}

export interface FmsPresetStatusRequest {
  Code?: number;
  PumpNo: number;
  HoseNo: number;
  PresetType?: string;
  PresetId?: number | string;
  PresetDT?: string;
  Amount?: string | number;
  CardNo?: string;
  TerminalId?: string;
}

export interface FmsPresetStatusResponse {
  Code?: number;
  Status?: boolean | string;
  IsCompleted?: boolean;
  DeliveryId?: number;
  Volume?: number;
  Amount?: number;
  UnitPrice?: number;
  TotalizerBefore?: number;
  TotalizerAfter?: number;
  [key: string]: any;
}

export interface FmsLockPumpRequest {
  PumpNumber: number;
  Lock: number; // 0 = Lock/Stop, 1 = Unlock/Authorize
}

export interface FmsLockPumpResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  PumpNumber?: number;
  IsLocked?: boolean;
  [key: string]: any;
}

export interface FmsChangeMopRequest {
  Code?: number;
  PumpNo: number;
  DeliveryId: number;
  AttendantId?: number;
  Odometer?: string;
  VehicleNo?: string;
  VehicleType?: string;
  PhoneNo?: string;
  AgencyName?: string;
  AgencyType?: string;
  CustomerType?: string;
  Payments: FmsPaymentDetail[];
}

export interface FmsChangeMopResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  DeliveryId?: number;
  [key: string]: any;
}

export interface FmsLastPreTransactionRequest {
  Code?: number;
  PumpNo: number;
  Row?: number;
}

export interface FmsLastPreTransactionResponse {
  Code?: number;
  PumpNo?: number;
  Transactions?: Array<{
    DeliveryId?: number;
    PresetDT?: string;
    PumpNo?: number;
    HoseNo?: number;
    Amount?: number;
    Volume?: number;
    UnitPrice?: number;
    VehicleNo?: string;
    PaymentMethod?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface FmsLastPostPurchaseRequest {
  Code?: number;
  PumpNo: number;
  Row?: number;
}

export interface FmsLastPostPurchaseResponse {
  Code?: number;
  PumpNo?: number;
  Transactions?: Array<{
    DeliveryId?: number;
    TransactionDT?: string;
    PumpNo?: number;
    HoseNo?: number;
    ProductName?: string;
    Volume?: number;
    Amount?: number;
    UnitPrice?: number;
    TotalizerBefore?: number;
    TotalizerAfter?: number;
    VehicleNo?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// ==========================================
// Section 4: Shift Management
// ==========================================

export interface FmsOpenShiftRequest {
  UserId: string;
}

export interface FmsOpenShiftResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  ShiftId?: number | string;
  OpenDT?: string;
  UserId?: string;
  DailySequence?: number;
  [key: string]: any;
}

export interface FmsCloseShiftRequest {
  [key: string]: any;
}

export interface FmsCloseShiftResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  ShiftId?: number | string;
  CloseDT?: string;
  [key: string]: any;
}

export interface FmsInfoShiftRequest {
  [key: string]: any;
}

export interface FmsInfoShiftResponse {
  Code?: number;
  IsOpen?: boolean;
  ShiftId?: number | string;
  UserId?: string;
  OpenDT?: string;
  SequenceNo?: number;
  [key: string]: any;
}

// ==========================================
// Section 5: Tank Inventory & ATG Operations
// ==========================================

export interface FmsListTankRequest {
  [key: string]: any;
}

export interface FmsTankItem {
  id_atg?: number;
  number_tank: number;
  name_tank: string;
  id_polling?: number;
  id_port?: number;
  warna_minyak?: string;
  warna_air?: string;
  koreksi_minyak?: string;
  koreksi_air?: string;
  produk: string;
  harga_produk?: number;
  [key: string]: any;
}

export interface FmsListTankResponse {
  Code?: number;
  Tanks?: FmsTankItem[];
  Data?: FmsTankItem[];
  [key: string]: any;
}

export interface FmsLastTankDataRequest {
  TankNumber: number;
}

export interface FmsLastTankDataResponse {
  Code?: number;
  TankNumber?: number;
  TankName?: string;
  ProductName?: string;
  FuelHeightMm?: number;
  FuelHeightCm?: number;
  WaterHeightMm?: number;
  WaterHeightCm?: number;
  FuelVolumeL?: number;
  WaterVolumeL?: number;
  TemperatureC?: number;
  UllageL?: number;
  CapacityL?: number;
  IsOnline?: boolean;
  ReadTime?: string;
  [key: string]: any;
}

export interface FmsDeliveryStartRequest {
  TankNumber: number;
}

export interface FmsDeliveryStartResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  TankNumber?: number;
  StartVolumeL?: number;
  StartHeightMm?: number;
  StartDT?: string;
  [key: string]: any;
}

export interface FmsDeliveryStatusRequest {
  TankNumber: number;
}

export interface FmsDeliveryStatusResponse {
  Code?: number;
  TankNumber?: number;
  IsDelivering?: boolean;
  StartDT?: string;
  CurrentVolumeL?: number;
  [key: string]: any;
}

export interface FmsDeliveryStopRequest {
  TankNumber: number;
  NoDO: string;
  NoInvoice: string;
  DeliveryVolume: string | number;
  NoKendaraan: string;
  NamaPengemudi: string;
  Pengirim: string;
}

export interface FmsDeliveryStopResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  TankNumber?: number;
  StartVolumeL?: number;
  EndVolumeL?: number;
  ReceivedVolumeL?: number;
  NoDO?: string;
  NoInvoice?: string;
  StopDT?: string;
  [key: string]: any;
}

export interface FmsDeliveryTankDataRequest {
  tgl_delivery: string; // YYYY-MM-DD
}

export interface FmsDeliveryTankDataResponse {
  Code?: number;
  Deliveries?: Array<{
    DeliveryId?: number;
    TankNumber?: number;
    ProductName?: string;
    DeliveryDate?: string;
    NoDO?: string;
    NoInvoice?: string;
    DeliveryVolume?: number;
    StartVolume?: number;
    EndVolume?: number;
    NoKendaraan?: string;
    NamaPengemudi?: string;
    Pengirim?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// ==========================================
// Section 6: RFID & Fleet Customer
// ==========================================

export interface FmsRfidInfoRequest {
  Code?: number;
  PumpNo: number;
  HoseNo: number;
  CardNo: string;
}

export interface FmsRfidInfoResponse {
  Code?: number;
  Status?: boolean | string;
  CardNo?: string;
  CustomerName?: string;
  VehicleNo?: string;
  VehicleType?: string;
  Balance?: number;
  QuotaL?: number;
  AllowedProducts?: string[];
  IsActive?: boolean;
  Message?: string;
  [key: string]: any;
}

// ==========================================
// Section 7: Fuel Pricing & Networking
// ==========================================

export interface FmsPriceChangeRequest {
  GradeId: number;
  Price: number;
  ActiveDT: string; // YYYY-MM-DD HH:mm:ss
}

export interface FmsPriceChangeResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  GradeId?: number;
  Price?: number;
  ActiveDT?: string;
  [key: string]: any;
}

export interface FmsConnectionConfigRequest {
  ssid: string;
  psk: string;
  proxy_active_flag: boolean;
  http: string;
  https: string;
  ftp: string;
}

export interface FmsConnectionConfigResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  [key: string]: any;
}

// ==========================================
// Section 8: Settings & Forecourt Configuration
// ==========================================

export interface FmsSiteProfileDto {
  IdSite: string;
  IdController: number;
  IdCompany: number;
}

export interface FmsDtimeConfigDto {
  Datetime: string; // YYYY-MM-DD HH:mm:ss
}

export interface FmsReceiptHeaderItem {
  baris: number;
  text: string;
}

export interface FmsHeadersConfigDto {
  Headers: FmsReceiptHeaderItem[];
}

export interface FmsReceiptFooterItem {
  baris: number;
  text: string;
}

export interface FmsFootersConfigDto {
  Footers: FmsReceiptFooterItem[];
}

export interface FmsLinkServerItem {
  no: number;
  link: string;
}

export interface FmsLinkServerConfigDto {
  Link_Server: FmsLinkServerItem[];
}

export interface FmsPortItem {
  id_port: number;
  usb_name: string;
  device_name: string;
  aktif_flag: number;
}

export interface FmsPortsConfigDto {
  Ports: FmsPortItem[];
}

export interface FmsProductItem {
  id_produk: number;
  nama_produk: string;
  harga_produk: number;
  code_produk: number;
  status_produk: string; // 'subsidi' | 'non-subsidi'
}

export interface FmsProductsConfigDto {
  Products: FmsProductItem[];
}

export interface FmsPumpProductConfig {
  nama_produk: string;
  number_tank: number;
  harga_produk: number;
}

export interface FmsPumpConfigItem {
  number_pump: number;
  name_pump: string;
  port_number: number;
  products: FmsPumpProductConfig[];
}

export interface FmsPumpsConfigDto {
  Pumps: FmsPumpConfigItem[];
}

export interface FmsTankConfigItem {
  id_atg: number;
  number_tank: number;
  name_tank: string;
  id_polling: number;
  id_port: number;
  warna_minyak: string;
  warna_air: string;
  koreksi_minyak: string;
  koreksi_air: string;
  produk: string;
}

export interface FmsTanksConfigDto {
  Tanks: FmsTankConfigItem[];
}

export interface FmsWifiConfigDto {
  SSID: string;
  PSK: string;
}

export interface FmsProxyConfigDto {
  HTTP: string;
  HTTPS: string;
  FTP: string;
  ACTIVE_FLAG: number; // 0 or 1
}

// ==========================================
// Section 9: User Management
// ==========================================

export interface FmsUserItem {
  IdUser?: number | string;
  NamaUser: string;
  RoleId: number | string;
  RoleName?: string;
  IpAddress?: string;
  [key: string]: any;
}

export interface FmsListUserResponse {
  Code?: number;
  Users?: FmsUserItem[];
  Data?: FmsUserItem[];
  [key: string]: any;
}

export interface FmsAddUserRequest {
  NamaUser: string;
  Password: string;
  RoleId: string | number; // 2=Operator, 3=Admin
  IpAddress: string;
}

export interface FmsAddUserResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  NamaUser?: string;
  [key: string]: any;
}

export interface FmsDeleteUserRequest {
  NamaUser: string;
}

export interface FmsDeleteUserResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  [key: string]: any;
}

// ==========================================
// Section 10: Central Sync & Backup
// ==========================================

export interface FmsBackupRequest {
  waktuAwal: string; // YYYY-MM-DD HH:mm:ss
  waktuAkhir: string; // YYYY-MM-DD HH:mm:ss
}

export interface FmsBackupResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  TransactionsCount?: number;
  DeliveriesCount?: number;
  ReadingsCount?: number;
  [key: string]: any;
}

// ==========================================
// Section 11: OTA Updates & Uploads
// ==========================================

export interface FmsUploadResponse {
  Code?: number;
  Status?: boolean | string;
  Message?: string;
  FileName?: string;
  FilePath?: string;
  FileSize?: number;
  [key: string]: any;
}

// ==========================================
// Dynamic Database Configuration Interfaces
// ==========================================

export interface FmsResolvedConfig {
  baseUrl: string;
  timeoutMs: number;
  debug: boolean;
  enabled: boolean;
  headers: Record<string, string>;
  source: 'DATABASE' | 'ENVIRONMENT' | 'DEFAULT';
  updatedAt?: string;
  updatedBy?: string;
}

export interface FmsConnectionTestResult {
  success: boolean;
  targetUrl: string;
  latencyMs: number;
  statusCode?: number;
  message: string;
  serverTime?: string;
  controllerVersion?: string;
  details?: any;
}


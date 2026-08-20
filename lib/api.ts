/**
 * Fuel Monitoring API Client
 * Full integration with Backend API (NestJS/TypeORM/MySQL)
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fms_token');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fms_token', token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('fms_token');
  localStorage.removeItem('fms_user');
}

type UnauthorizedCallback = () => void;
const unauthorizedListeners = new Set<UnauthorizedCallback>();

export function onUnauthorized(callback: UnauthorizedCallback): () => void {
  unauthorizedListeners.add(callback);
  return () => {
    unauthorizedListeners.delete(callback);
  };
}

export function notifyUnauthorized(): void {
  clearToken();
  unauthorizedListeners.forEach((cb) => {
    try {
      cb();
    } catch {
      /* ignore */
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fms:unauthorized'));
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { noAuth?: boolean; headers?: Record<string, string> }
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers ?? {}),
  };
  if (token && !options?.noAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !options?.noAuth && path !== '/api/auth/login') {
      notifyUnauthorized();
    }
    throw new Error(data?.message ?? `HTTP ${res.status}: ${res.statusText}`);
  }
  return data as T;
}

// ── API Namespace ──────────────────────────────────────────────────
export const api = {
  // ── Health ──
  health: () => request<{ status: string; service: string; ts: string }>('GET', '/health', undefined, { noAuth: true }),

  // ── Auth ──
  auth: {
    login: (username: string, password: string) =>
      request<{ success: boolean; data: { token: string; user: User } }>(
        'POST', '/api/auth/login', { username, password }, { noAuth: true }
      ),
    me: () => request<{ success: boolean; data: User }>('GET', '/api/auth/me'),
    logout: () => request<{ success: boolean; message: string }>('POST', '/api/auth/logout'),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ success: boolean; message: string }>('POST', '/api/auth/change-password', { currentPassword, newPassword }),
  },

  // ── Dashboard ──
  dashboard: {
    get: () => request<ApiResponse<DashboardData>>('GET', '/api/dashboard'),
    alerts: () => request<ApiListResponse<Alert>>('GET', '/api/dashboard/alerts'),
    markRead: (id: string | number) => request<{ success: boolean }>('POST', `/api/dashboard/alerts/${id}/read`),
  },

  // ── Transactions ──
  transactions: {
    list: (params?: TransactionFilter) =>
      request<ApiListResponse<Transaction>>('GET', '/api/transactions' + toQuery(params)),
    get: (id: string) => request<ApiResponse<Transaction>>('GET', `/api/transactions/${id}`),
    create: (data: CreateTransaction) => request<ApiResponse<{ id: string }>>('POST', '/api/transactions', data),
    void: (id: string, reason: string) => request<{ success: boolean }>('POST', `/api/transactions/${id}/void`, { reason }),
  },

  // ── Cards ──
  cards: {
    list: (params?: CardFilter) => request<ApiListResponse<Card>>('GET', '/api/cards' + toQuery(params)),
    get: (id: string) => request<ApiResponse<Card>>('GET', `/api/cards/${id}`),
    transactions: (id: string, params?: { limit?: number; offset?: number }) =>
      request<ApiListResponse<Transaction>>('GET', `/api/cards/${id}/transactions` + toQuery(params)),
    quota: (id: string) => request<ApiListResponse<CardQuota>>('GET', `/api/cards/${id}/quota`),
    create: (data: CreateCard) => request<ApiResponse<{ id: string }>>('POST', '/api/cards', data),
    update: (id: string, data: Partial<CreateCard>) => request<{ success: boolean }>('PUT', `/api/cards/${id}`, data),
    block: (id: string, reason: string) => request<{ success: boolean }>('POST', `/api/cards/${id}/block`, { reason }),
    unblock: (id: string, reason: string) => request<{ success: boolean }>('POST', `/api/cards/${id}/unblock`, { reason }),
  },

  // ── Quota ──
  quota: {
    list: (params?: { period_id?: string; card_id?: string; unit_id?: string }) =>
      request<ApiListResponse<CardQuota>>('GET', '/api/quota' + toQuery(params)),
    periods: () => request<ApiListResponse<QuotaPeriod>>('GET', '/api/quota/periods'),
    ledger: (cardId: string) => request<ApiListResponse<QuotaLedger>>('GET', `/api/quota/ledger/${cardId}`),
    generate: (data: GenerateQuota) => request<{ success: boolean; message: string }>('POST', '/api/quota/generate', data),
    topup: (data: TopupQuota) => request<{ success: boolean; message: string }>('POST', '/api/quota/topup', data),
  },

  // ── Tanks ──
  tanks: {
    list: () => request<ApiListResponse<Tank>>('GET', '/api/tanks'),
    get: (id: string) => request<ApiResponse<Tank>>('GET', `/api/tanks/${id}`),
    create: (data: CreateTank) => request<ApiResponse<Tank>>('POST', '/api/tanks', data),
    readings: (id: string, limit = 50) =>
      request<ApiListResponse<TankReading>>('GET', `/api/tanks/${id}/readings?limit=${limit}`),
    pushReading: (id: string, data: TankReadingInput) =>
      request<{ success: boolean }>('POST', `/api/tanks/${id}/readings`, data),
    update: (id: string, data: Partial<Tank> & { reason?: string }) =>
      request<{ success: boolean; message?: string; data?: Tank }>('PUT', `/api/tanks/${id}`, data),
    delete: (id: string) => request<{ success: boolean; message: string }>('DELETE', `/api/tanks/${id}`),
  },

  // ── Stock ──
  stock: {
    summary: () => request<ApiListResponse<StockSummary>>('GET', '/api/stock'),
    movements: (params?: { product_id?: string; from?: string; to?: string; limit?: number }) =>
      request<ApiListResponse<StockMovement>>('GET', '/api/stock/movements' + toQuery(params)),
    deliveries: () => request<ApiListResponse<Delivery>>('GET', '/api/stock/deliveries'),
    addDelivery: (data: CreateDelivery) => request<ApiResponse<{ id: string }>>('POST', '/api/stock/deliveries', data),
    adjust: (data: StockAdjustment) => request<{ success: boolean }>('POST', '/api/stock/adjustment', data),
  },

  // ── Pumps & Nozzles ──
  pumps: {
    list: () => request<ApiListResponse<Pump>>('GET', '/api/pumps'),
    get: (id: string) => request<ApiResponse<Pump>>('GET', `/api/pumps/${id}`),
    create: (data: CreatePump) => request<ApiResponse<Pump>>('POST', '/api/pumps', data),
    update: (id: string, data: Partial<CreatePump>) => request<{ success: boolean; message?: string; data?: Pump }>('PUT', `/api/pumps/${id}`, data),
    delete: (id: string) => request<{ success: boolean; message: string }>('DELETE', `/api/pumps/${id}`),
    nozzles: () => request<ApiListResponse<Nozzle>>('GET', '/api/pumps/nozzles'),
    totalizers: (date?: string) =>
      request<ApiListResponse<Totalizer>>('GET', '/api/pumps/totalizers' + (date ? `?date=${date}` : '')),
    reconciliation: (date?: string) =>
      request<ApiListResponse<PumpRecon>>('GET', '/api/pumps/reconciliation' + (date ? `?date=${date}` : '')),
    pushTotalizer: (data: TotalizerInput) => request<{ success: boolean }>('POST', '/api/pumps/totalizers', data),
  },
  nozzles: {
    list: () => request<ApiListResponse<Nozzle>>('GET', '/api/nozzles'),
    get: (id: string) => request<ApiResponse<Nozzle>>('GET', `/api/nozzles/${id}`),
    create: (data: CreateNozzle) => request<ApiResponse<Nozzle>>('POST', '/api/nozzles', data),
    update: (id: string, data: Partial<CreateNozzle>) => request<{ success: boolean; message?: string; data?: Nozzle }>('PUT', `/api/nozzles/${id}`, data),
    delete: (id: string) => request<{ success: boolean; message: string }>('DELETE', `/api/nozzles/${id}`),
  },

  // ── Reconciliation ──
  reconciliation: {
    get: (date?: string) =>
      request<ApiListResponse<Reconciliation>>('GET', '/api/reconciliation' + (date ? `?date=${date}` : '')),
    run: (date?: string) => request<{ success: boolean; data?: unknown }>('POST', '/api/reconciliation/run', date ? { date } : {}),
  },

  // ── Reports ──
  reports: {
    transactions: (params?: ReportFilter) =>
      request<ApiResponse<Transaction[]> | ApiListResponse<Transaction>>('GET', '/api/reports/transactions' + toQuery(params)),
    quota: (params?: { period_id?: string }) =>
      request<ApiResponse<CardQuota[]> | ApiListResponse<CardQuota>>('GET', '/api/reports/quota' + toQuery(params)),
    stock: () => request<ApiListResponse<Reconciliation>>('GET', '/api/reports/stock'),
    usage: (params?: { from?: string; to?: string }) =>
      request<ApiResponse<UsageReport>>('GET', '/api/reports/usage' + toQuery(params)),
    totalizer: (params?: { date?: string }) =>
      request<ApiListResponse<Totalizer>>('GET', '/api/reports/totalizer' + toQuery(params)),
    executive: (params?: { month?: string | number; year?: string | number }) =>
      request<ApiResponse<ExecutiveReport>>('GET', '/api/reports/executive' + toQuery(params)),
  },

  // ── Master Data ──
  master: {
    products: () => request<ApiListResponse<Product>>('GET', '/api/master/products'),
    addProduct: (data: CreateProduct) => request<ApiResponse<{ id: string }>>('POST', '/api/master/products', data),
    createProduct: (data: CreateProduct) => request<ApiResponse<{ id: string }>>('POST', '/api/master/products', data),
    updateProduct: (id: string, data: UpdateProduct) => request<{ success: boolean; message?: string }>('PUT', `/api/master/products/${id}`, data),
    prices: () => request<ApiListResponse<PriceHistoryItem>>('GET', '/api/master/prices'),
    addPrice: (data: { product_id: string; price_per_liter?: number; price_per_unit?: number; effective_from?: string; effective_date?: string; reason?: string }) =>
      request<{ success: boolean }>('POST', '/api/master/prices', data),
    setPrice: (data: { product_id: string; price_per_liter: number; effective_from: string; reason?: string }) =>
      request<{ success: boolean }>('POST', '/api/master/prices', { ...data, price_per_unit: data.price_per_liter, effective_date: data.effective_from }),
    vehicles: (params?: { unit_id?: string }) =>
      request<ApiListResponse<Vehicle>>('GET', '/api/master/vehicles' + toQuery(params)),
    addVehicle: (data: CreateVehicle) => request<ApiResponse<{ id: string }>>('POST', '/api/master/vehicles', data),
    createVehicle: (data: CreateVehicle) => request<ApiResponse<{ id: string }>>('POST', '/api/master/vehicles', data),
    updateVehicle: (id: string, data: Partial<CreateVehicle> & { status?: string }) =>
      request<{ success: boolean }>('PUT', `/api/master/vehicles/${id}`, data),
    units: () => request<ApiListResponse<Unit>>('GET', '/api/master/units'),
    addUnit: (data: CreateUnit) => request<ApiResponse<{ id: string }>>('POST', '/api/master/units', data),
    createUnit: (data: CreateUnit) => request<ApiResponse<{ id: string }>>('POST', '/api/master/units', data),
    updateUnit: (id: string, data: Partial<Unit>) => request<{ success: boolean }>('PUT', `/api/master/units/${id}`, data),
    users: () => request<ApiListResponse<User>>('GET', '/api/master/users'),
    roles: () => request<ApiListResponse<Role>>('GET', '/api/master/roles'),
    permissions: () => request<ApiListResponse<PermissionItem>>('GET', '/api/master/permissions'),
  },

  // ── System ──
  system: {
    audit: (params?: AuditFilter) =>
      request<ApiListResponse<AuditLog>>('GET', '/api/system/audit' + toQuery(params)),
    approvals: (status?: string) =>
      request<ApiListResponse<Approval>>('GET', '/api/system/approvals' + (status ? `?status=${status}` : '')),
    approve: (id: string, note?: string) => request<{ success: boolean }>('POST', `/api/system/approvals/${id}/approve`, { note }),
    reject: (id: string, note: string) => request<{ success: boolean }>('POST', `/api/system/approvals/${id}/reject`, { note }),
    settings: () => request<ApiResponse<SystemSettings>>('GET', '/api/system/settings'),
    saveSettings: (data: Partial<SystemSettings> | Record<string, unknown>) => request<{ success: boolean }>('PUT', '/api/system/settings', data),
    updateSettings: (data: Partial<SystemSettings> | Record<string, unknown>) => request<{ success: boolean }>('PUT', '/api/system/settings', data),
    fmsConfig: () => request<ApiResponse<FmsConfig>>('GET', '/api/system/fms-config'),
    updateFmsConfig: (data: Partial<FmsConfig> | Record<string, unknown>) => request<{ success: boolean; data?: FmsConfig }>('PUT', '/api/system/fms-config', data),
    testFmsConfig: (data?: { baseUrl?: string; timeoutMs?: number }) =>
      request<ApiResponse<FmsTestConnectionResult>>('POST', '/api/system/fms-config/test', data),
    notifications: () => request<ApiResponse<NotificationSettings> | ApiListResponse<NotificationItem>>('GET', '/api/system/notifications'),
    updateNotifications: (data: Partial<NotificationSettings> | Record<string, unknown>) => request<{ success: boolean }>('PUT', '/api/system/notifications', data),
    markAllRead: () => request<{ success: boolean }>('PUT', '/api/system/notifications/read-all'),
    integration: () => request<ApiResponse<IntegrationStatus>>('GET', '/api/system/integration'),
    testFms: (data?: { baseUrl?: string; timeoutMs?: number }) =>
      request<ApiResponse<FmsTestConnectionResult>>('POST', '/api/system/fms-config/test', data),
  },

  // ── Forecourt Management System (FMS) ──
  fms: {
    testConnection: (data?: { baseUrl?: string; timeoutMs?: number }) =>
      request<ApiResponse<FmsTestConnectionResult>>('POST', '/api/fms/test-connection', data),
    testConnectionQuick: () =>
      request<ApiResponse<FmsTestConnectionResult>>('GET', '/api/fms/test-connection'),
  },

  // ── Controller Hardware ──
  controller: {
    pushTransaction: (data: ControllerTransactionInput, secret = 'spbp-controller-2026') =>
      request<{ success: boolean }>(
        'POST',
        '/api/controller/transaction',
        data,
        { noAuth: true, headers: { 'x-controller-secret': secret } }
      ),
  },
};

// ── Utility ──
function toQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

// ── Types ──
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta?: { total: number };
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  last_login?: string;
  lastLogin?: string;
  unit?: string;
  department?: string;
}

export interface DashboardData {
  kpi: KPI;
  tanks: Tank[];
  alerts: Alert[];
  recent_transactions: Transaction[];
  last_updated: string;
}

export interface KPI {
  total_stock_l: number;
  today_consumption_l: number;
  today_transactions: number;
  monthly_consumption_l: number;
  monthly_transactions: number;
  active_cards: number;
  quota_utilization_pct: number;
  quota_remaining_l: number;
  quota_expired_l: number;
}

export interface Transaction {
  id: string;
  card_id?: string;
  card_number?: string;
  card?: string;
  holder_name?: string;
  holder?: string;
  unit_name?: string;
  unit?: string;
  product_name?: string;
  product?: string;
  volume_l?: number;
  volume?: number;
  price_per_unit?: number;
  price?: number;
  total_amount?: number;
  total?: number;
  pump_number?: string;
  pump?: string;
  nozzle_number?: string;
  nozzle?: string;
  operator_id?: string;
  operator_name?: string;
  operator?: string;
  shift?: string;
  status: string;
  transaction_time?: string;
  time?: string;
  vehicle_id?: string;
  police_number?: string;
  vehicle?: string;
  quota_before?: number;
  quota_deducted?: number;
  quota_after?: number;
}

export interface Card {
  id: string;
  card_number: string;
  number?: string;
  card_type: string;
  type?: string;
  status: string;
  holder_name: string;
  holder?: string;
  unit_id?: string;
  unit_name?: string;
  unit?: string;
  vehicle_id?: string;
  police_number?: string;
  vehicle?: string;
  product_id?: string;
  product_name?: string;
  fuel_type?: string;
  fuelType?: string;
  monthly_limit: number;
  monthlyLimit?: number;
  allocated?: number;
  used?: number;
  remaining?: number;
  expiry_date?: string;
  expiry?: string;
  activation_date?: string;
  activation?: string;
  rfid_uid?: string;
  rfidUid?: string;
  notes?: string;
}

export interface CardQuota {
  id: string;
  card_id: string;
  card_number?: string;
  holder_name?: string;
  unit_name?: string;
  product_name?: string;
  allocated_l: number;
  used_l: number;
  remaining_l: number;
  topup_l: number;
  expired_l: number;
  period?: string;
  status?: string;
}

export interface QuotaPeriod {
  id: string;
  period: string;
  year: number;
  month: number;
  status: string;
}

export interface QuotaLedger {
  id: string;
  type: string;
  amount_l: number;
  amount?: number;
  balance_l: number;
  balance?: number;
  description: string;
  created_at: string;
  date?: string;
}

export interface Tank {
  id: string;
  product_id: string;
  product_name: string;
  product?: string;
  code?: string;
  capacity_l: number;
  capacity?: number;
  current_l: number;
  current?: number;
  status: string;
  oil_color?: 'blue' | 'green' | 'red' | 'yellow';
  water_color?: 'blue' | 'yellow';
  active?: number;
  id_port?: number | null;
  id_polling?: number | null;
  id_tank_enabler?: number | null;
  temperature?: number;
  temp?: number;
  water_level?: number;
  waterLevel?: number;
  threshold_low?: number;
  threshold_critical?: number;
  threshold_high?: number;
  last_reading_at?: string;
  lastUpdate?: string;
}

export interface TankReading {
  id: string;
  tank_id: string;
  volume_l: number;
  temperature?: number;
  water_level?: number;
  height_cm?: number;
  source: string;
  read_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  type?: string;
  unit?: string;
  active: number | boolean;
  subsidi?: number | boolean;
  current_price?: number;
  currentPrice?: number;
  octane_cetane?: string;
  color_code?: string;
  density_standard?: number;
  description?: string;
}

export interface PriceHistoryItem {
  id?: string;
  product_id: string;
  product_name?: string;
  product?: string;
  code?: string;
  price_per_unit?: number;
  price_per_liter?: number;
  price?: number;
  effective_date?: string;
  effectiveDate?: string;
  effective_from?: string;
  reason?: string;
  is_active?: number | boolean;
  isActive?: number | boolean;
  created_by?: string;
  created_at?: string;
  prices?: Array<{ effectiveDate: string; price: number }>;
}

export type FuelPrice = PriceHistoryItem;

export interface Vehicle {
  id: string;
  police_number: string;
  policeNumber?: string;
  type?: string;
  brand?: string;
  model?: string;
  year?: number;
  unit_id?: string;
  unit_name?: string;
  unit?: string;
  product_id?: string;
  productId?: string;
  product_name?: string;
  productName?: string;
  product_code?: string;
  productCode?: string;
  fuel_type?: string;
  fuelType?: string;
  tank_capacity?: number;
  tankCapacity?: number;
  status: string;
  card?: string;
  notes?: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  type?: string;
  parent_id?: string | null;
  commander?: string;
  status: string;
  default_alloc_l: number;
  defaultAllocation?: number;
  active_cards?: number;
  cards?: number;
  active_vehicles?: number;
  vehicles?: number;
  used?: number;
  quota?: number;
}

export interface Pump {
  id: string;
  number: string;
  location?: string;
  status: string;
  active?: number;
  nozzle_count?: number;
  nozzles?: Nozzle[];
}

export interface Nozzle {
  id: string;
  number: string;
  pump_id: string;
  pump_number?: string;
  pumpNum?: string;
  location?: string;
  pumpLoc?: string;
  pumpStatus?: string;
  product_id: string;
  product_name: string;
  product?: string;
  status: string;
  totalizerOpen?: number;
  totalizerCurrent?: number;
  usage?: number;
  systemSales?: number;
  variance?: number;
}

export interface Totalizer {
  id: string;
  nozzle_id: string;
  nozzle_number: string;
  pump_number: string;
  product_name: string;
  opening_value: number;
  current_value: number;
  usage_l?: number;
  system_sales?: number;
  shift_date?: string;
  shift?: string;
}

export interface PumpRecon {
  nozzle_id: string;
  nozzle_number: string;
  pump_number: string;
  product_name: string;
  totalizer_usage: number;
  system_sales: number;
  variance_l: number;
}

export interface Reconciliation {
  id?: string;
  product_id: string;
  product_name?: string;
  product?: string;
  date: string;
  opening_l: number;
  opening?: number;
  delivery_l: number;
  delivery?: number;
  sales_l: number;
  sales?: number;
  adjustment_l: number;
  adjustment?: number;
  theoretical_closing: number;
  theoreticalClosing?: number;
  actual_closing: number;
  actualClosing?: number;
  variance_l: number;
  variance?: number;
  variance_pct: number;
  variancePct?: number;
  status: string;
}

export type StockReport = Reconciliation[];

export interface StockSummary {
  product_id: string;
  product_name: string;
  total_capacity: number;
  total_current: number;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name?: string;
  product?: string;
  tank_id?: string;
  type: string;
  quantity_l: number;
  delta_l?: number;
  before_l?: number;
  after_l?: number;
  balance_l?: number;
  notes?: string;
  reason?: string;
  created_at: string;
  date?: string;
  approved_by?: string;
}

export interface Delivery {
  id: string;
  date: string;
  supplier: string;
  product_name?: string;
  product?: string;
  quantity_l: number;
  quantity?: number;
  tank_id?: string;
  tank?: string;
  doc_number?: string;
  docNumber?: string;
  delivery_note?: string;
  status: string;
  operator?: string;
}

export interface Alert {
  id: number | string;
  type: string;
  title: string;
  message?: string;
  desc?: string;
  module?: string;
  severity?: string;
  read: number | boolean;
  created_at: string;
  time?: string;
}

export interface AuditLog {
  id: number | string;
  timestamp?: string;
  user_id?: string;
  username?: string;
  user?: string;
  user_name?: string;
  action: string;
  module: string;
  record_id?: string;
  recordId?: string;
  target?: string;
  resource?: string;
  detail?: string;
  description?: string;
  before_val?: string;
  before?: string;
  after_val?: string;
  after?: string;
  reason?: string;
  ip_address?: string;
  ip?: string;
  created_at: string;
}

export interface Approval {
  id: string;
  type: string;
  detail?: string;
  status: string;
  priority?: string;
  requested_by: string;
  requestedBy?: string;
  requested_by_name?: string;
  review_note?: string;
  requested_at: string;
  submittedAt?: string;
  reviewed_at?: string;
  decision?: string;
  decidedBy?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  desc?: string;
  user_count?: number;
  users_count?: number;
  users?: number;
}

export interface PermissionItem {
  id: string;
  code?: string;
  module: string;
  action: string;
  description?: string;
}

export type Permission = PermissionItem;

export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  type: string;
  read: number | boolean;
  created_at: string;
}

export interface SystemSettings {
  station_name: string;
  station_code: string;
  address: string;
  operating_hours: string;
  auto_reconcile: boolean;
  alert_critical_pct: number;
  alert_low_pct: number;
  daily_report_time: string;
  fms_base_url?: string;
  fms_timeout_ms?: number;
  fms_debug?: boolean;
  fms_enabled?: boolean;
  fms_headers?: string;
  [key: string]: unknown;
}

export interface NotificationSettings {
  email_alerts: boolean;
  telegram_alerts: boolean;
  sms_alerts: boolean;
  alert_recipients: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
  [key: string]: unknown;
}

export interface FmsConfig {
  baseUrl: string;
  timeoutMs: number;
  debug: boolean;
  enabled: boolean;
  headers?: Record<string, string> | string;
  source?: string;
  [key: string]: unknown;
}

export interface FmsTestConnectionResult {
  success: boolean;
  latencyMs?: number;
  controllerVersion?: string;
  serverTime?: string;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export interface IntegrationStatus {
  total_received: number;
  synced: number;
  pending: number;
  failed: number;
  today: number;
  last_sync: string;
  status?: string;
  fms?: {
    connected: boolean;
    latencyMs?: number;
    controllerVersion?: string;
    serverTime?: string;
    baseUrl?: string;
  };
  [key: string]: unknown;
}

export interface UsageReport {
  total_consumption_l?: number;
  by_unit: Array<{
    id: string;
    name: string;
    trx_count?: number;
    transactions_count?: number;
    total_l: number;
    total_amount?: number;
  }>;
  by_product?: Array<{
    id?: string;
    name?: string;
    product_name: string;
    transactions_count?: number;
    total_l: number;
    total_amount?: number;
  }>;
  daily_trend?: Array<{
    date: string;
    day?: number;
    pertamax?: number;
    pertalite?: number;
    dexlite?: number;
    lainnya?: number;
    total_l?: number;
  }>;
}

export interface ExecutiveReport {
  summary?: {
    total_volume_l?: number;
    total_amount_rp?: number;
    total_transactions?: number;
  };
  transactions?: {
    total_trx?: number;
    total_volume?: number;
    total_amount?: number;
  };
  stock_summary?: Array<{
    product_id?: string;
    product_name?: string;
    name?: string;
    total_current?: number;
    total_capacity?: number;
    current_l?: number;
    capacity_l?: number;
    status?: string;
  }>;
  stock?: Array<{
    name: string;
    current_l: number;
    capacity_l: number;
    status: string;
  }>;
  kpi?: KPI;
  top_units?: Array<{
    name: string;
    total_l: number;
  }>;
  quota?: {
    total_allocated?: number;
    total_used?: number;
    total_remaining?: number;
    total_expired?: number;
  };
  avg_variance?: number;
  top_cards?: Array<{
    card_number: string;
    holder_name: string;
    total_l: number;
  }>;
  period?: string;
}

// ── Filter Interfaces ──
export interface TransactionFilter {
  [key: string]: unknown;
  card?: string;
  unit?: string;
  product?: string;
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface CardFilter {
  [key: string]: unknown;
  search?: string;
  status?: string;
  unit?: string;
  limit?: number;
  offset?: number;
}

export interface ReportFilter {
  [key: string]: unknown;
  from?: string;
  to?: string;
  unit_id?: string;
  product_id?: string;
  limit?: number;
}

export interface AuditFilter {
  [key: string]: unknown;
  module?: string;
  user_id?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

// ── Create & Input Interfaces ──
export interface CreateTransaction {
  card_number: string;
  product_id: string;
  volume_l: number;
  nozzle_id?: string;
  pump_id?: string;
  shift?: string;
  totalizer_before?: number;
  totalizer_after?: number;
  source?: string;
  transaction_time?: string;
}

export interface CreateCard {
  card_number: string;
  card_type?: string;
  holder_name: string;
  unit_id?: string;
  vehicle_id?: string;
  product_id?: string;
  fuel_type?: string;
  monthly_limit?: number;
  expiry_date?: string;
  activation_date?: string;
  rfid_uid?: string;
  rfidUid?: string;
  notes?: string;
}

export interface GenerateQuota {
  period: string;
  year: number;
  month: number;
  product_id?: string;
  default_l?: number;
  scope?: string;
  unit_id?: string;
}

export interface TopupQuota {
  card_id: string;
  product_id?: string;
  amount_l: number;
  reason: string;
}

export interface TankReadingInput {
  volume_l: number;
  height_cm?: number;
  water_level?: number;
  temperature?: number;
  source?: string;
  read_at?: string;
}

export interface CreateDelivery {
  date: string;
  supplier: string;
  product_id: string;
  quantity_l: number;
  tank_id?: string;
  doc_number?: string;
  delivery_note?: string;
}

export interface StockAdjustment {
  product_id: string;
  tank_id?: string;
  delta_l: number;
  reason: string;
}

export interface TotalizerInput {
  nozzle_id: string;
  opening_value: number;
  current_value: number;
  shift_date: string;
  shift?: string;
}

export interface CreateProduct {
  code: string;
  name: string;
  type: 'Bensin' | 'Solar' | 'LPG' | string;
  unit?: string;
  subsidi?: number | boolean;
  price_per_unit?: number;
  effective_date?: string;
}

export interface UpdateProduct {
  name?: string;
  type?: 'Bensin' | 'Solar' | 'LPG' | string;
  unit?: string;
  active?: number | boolean;
  subsidi?: number | boolean;
  price_per_unit?: number;
  effective_date?: string;
}

export interface CreateVehicle {
  police_number: string;
  type?: string;
  brand?: string;
  model?: string;
  year?: number;
  unit_id?: string;
  product_id?: string;
  fuel_type?: string;
  tank_capacity?: number;
  notes?: string;
}

export interface CreateUnit {
  code: string;
  name: string;
  type?: string;
  parent_id?: string | null;
  commander?: string;
  default_alloc_l?: number;
}

export interface ControllerTransactionInput {
  card_number: string;
  product_code: string;
  product_id: string;
  volume_l: number;
  nozzle_id: string;
  pump_id: string;
  shift: string;
  totalizer_before: number;
  totalizer_after: number;
  transaction_time: string;
}

export interface CreateTank {
  id?: string;
  product_id: string;
  capacity_l: number;
  current_l?: number;
  oil_color?: 'blue' | 'green' | 'red' | 'yellow';
  water_color?: 'blue' | 'yellow';
  active?: number;
  id_port?: number | null;
  id_polling?: number | null;
  id_tank_enabler?: number | null;
  threshold_low?: number;
  threshold_critical?: number;
  threshold_high?: number;
  status?: string;
  reason?: string;
}

export interface CreatePump {
  id?: string;
  number: string;
  location?: string;
  status?: string;
  active?: number;
}

export interface CreateNozzle {
  id?: string;
  number: string;
  pump_id: string;
  product_id: string;
  status?: string;
}


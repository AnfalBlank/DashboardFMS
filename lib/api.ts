/**
 * Fuel Monitoring API Client
 * Connects Next.js frontend to the Express backend on port 4000
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fms_token');
}

export function setToken(token: string): void {
  localStorage.setItem('fms_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('fms_token');
  localStorage.removeItem('fms_user');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { noAuth?: boolean }
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token && !options?.noAuth) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`);
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────
export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ success: boolean; data: { token: string; user: User } }>(
        'POST', '/api/auth/login', { username, password }, { noAuth: true }
      ),
    me:  () => request<{ success: boolean; data: User }>('GET', '/api/auth/me'),
    logout: () => request('POST', '/api/auth/logout'),
    changePassword: (currentPassword: string, newPassword: string) =>
      request('POST', '/api/auth/change-password', { currentPassword, newPassword }),
  },

  // ── Dashboard ──
  dashboard: {
    get:    () => request<ApiResponse<DashboardData>>('GET', '/api/dashboard'),
    alerts: () => request<ApiResponse<Alert[]>>('GET', '/api/dashboard/alerts'),
    markRead: (id: string) => request('POST', `/api/dashboard/alerts/${id}/read`),
  },

  // ── Transactions ──
  transactions: {
    list: (params?: TransactionFilter) =>
      request<ApiListResponse<Transaction>>('GET', '/api/transactions' + toQuery(params)),
    get:    (id: string) => request<ApiResponse<Transaction>>('GET', `/api/transactions/${id}`),
    create: (data: CreateTransaction) => request<ApiResponse<{ id: string }>>('POST', '/api/transactions', data),
    void:   (id: string, reason: string) => request('POST', `/api/transactions/${id}/void`, { reason }),
  },

  // ── Cards ──
  cards: {
    list:  (params?: CardFilter) => request<ApiListResponse<Card>>('GET', '/api/cards' + toQuery(params)),
    get:   (id: string) => request<ApiResponse<Card>>('GET', `/api/cards/${id}`),
    transactions: (id: string, params?: { limit?: number; offset?: number }) =>
      request<ApiListResponse<Transaction>>('GET', `/api/cards/${id}/transactions` + toQuery(params)),
    quota: (id: string) => request<ApiListResponse<CardQuota>>('GET', `/api/cards/${id}/quota`),
    create: (data: CreateCard) => request<ApiResponse<{ id: string }>>('POST', '/api/cards', data),
    update: (id: string, data: Partial<CreateCard>) => request('PUT', `/api/cards/${id}`, data),
    block:   (id: string, reason: string) => request('POST', `/api/cards/${id}/block`, { reason }),
    unblock: (id: string, reason: string) => request('POST', `/api/cards/${id}/unblock`, { reason }),
  },

  // ── Quota ──
  quota: {
    list:     (params?: { period_id?: string; unit_id?: string }) =>
      request<ApiListResponse<CardQuota>>('GET', '/api/quota' + toQuery(params)),
    periods:  () => request<ApiListResponse<QuotaPeriod>>('GET', '/api/quota/periods'),
    ledger:   (cardId: string) => request<ApiListResponse<QuotaLedger>>('GET', `/api/quota/ledger/${cardId}`),
    generate: (data: GenerateQuota) => request('POST', '/api/quota/generate', data),
    topup:    (data: TopupQuota) => request('POST', '/api/quota/topup', data),
  },

  // ── Tanks ──
  tanks: {
    list:     () => request<ApiListResponse<Tank>>('GET', '/api/tanks'),
    get:      (id: string) => request<ApiResponse<Tank>>('GET', `/api/tanks/${id}`),
    readings: (id: string, limit = 50) => request<ApiListResponse<TankReading>>('GET', `/api/tanks/${id}/readings?limit=${limit}`),
    pushReading: (id: string, data: TankReadingInput) => request('POST', `/api/tanks/${id}/readings`, data),
    update:   (id: string, data: Partial<Tank>) => request('PUT', `/api/tanks/${id}`, data),
  },

  // ── Stock ──
  stock: {
    summary:    () => request<ApiListResponse<StockSummary>>('GET', '/api/stock'),
    movements:  (params?: { product_id?: string; from?: string; to?: string }) =>
      request<ApiListResponse<StockMovement>>('GET', '/api/stock/movements' + toQuery(params)),
    deliveries: () => request<ApiListResponse<Delivery>>('GET', '/api/stock/deliveries'),
    addDelivery: (data: CreateDelivery) => request<ApiResponse<{ id: string }>>('POST', '/api/stock/deliveries', data),
    adjust:     (data: StockAdjustment) => request('POST', '/api/stock/adjustment', data),
  },

  // ── Pumps & Nozzles ──
  pumps: {
    list:           () => request<ApiListResponse<Pump>>('GET', '/api/pumps'),
    nozzles:        () => request<ApiListResponse<Nozzle>>('GET', '/api/pumps/nozzles'),
    totalizers:     (date?: string) =>
      request<ApiListResponse<Totalizer>>('GET', '/api/pumps/totalizers' + (date ? `?date=${date}` : '')),
    reconciliation: (date?: string) =>
      request<ApiListResponse<PumpRecon>>('GET', '/api/pumps/reconciliation' + (date ? `?date=${date}` : '')),
    pushTotalizer:  (data: TotalizerInput) => request('POST', '/api/pumps/totalizers', data),
  },

  // ── Reconciliation ──
  reconciliation: {
    get: (date?: string) =>
      request<ApiListResponse<Reconciliation>>('GET', '/api/reconciliation' + (date ? `?date=${date}` : '')),
    run: (date?: string) => request('POST', '/api/reconciliation/run', date ? { date } : {}),
  },

  // ── Reports ──
  reports: {
    transactions: (params?: ReportFilter) =>
      request<ApiResponse<Transaction[]>>('GET', '/api/reports/transactions' + toQuery(params)),
    quota:    (params?: { period_id?: string }) =>
      request<ApiResponse<CardQuota[]>>('GET', '/api/reports/quota' + toQuery(params)),
    stock:    () => request<ApiListResponse<Reconciliation>>('GET', '/api/reports/stock'),
    usage:    (params?: { from?: string; to?: string }) =>
      request('GET', '/api/reports/usage' + toQuery(params)),
    totalizer: () => request<ApiListResponse<Totalizer>>('GET', '/api/reports/totalizer'),
    executive: (params?: { month?: string; year?: string }) =>
      request<ApiResponse<ExecutiveReport>>('GET', '/api/reports/executive' + toQuery(params)),
  },

  // ── Master Data ──
  master: {
    products: () => request<ApiListResponse<Product>>('GET', '/api/master/products'),
    prices:   () => request('GET', '/api/master/prices'),
    addPrice: (data: { product_id: string; price_per_unit: number; effective_date: string }) =>
      request('POST', '/api/master/prices', data),
    vehicles: (params?: { unit_id?: string }) =>
      request<ApiListResponse<Vehicle>>('GET', '/api/master/vehicles' + toQuery(params)),
    addVehicle: (data: CreateVehicle) => request('POST', '/api/master/vehicles', data),
    updateVehicle: (id: string, data: Partial<CreateVehicle>) => request('PUT', `/api/master/vehicles/${id}`, data),
    units:    () => request<ApiListResponse<Unit>>('GET', '/api/master/units'),
    addUnit:  (data: CreateUnit) => request('POST', '/api/master/units', data),
    updateUnit: (id: string, data: Partial<Unit>) => request('PUT', `/api/master/units/${id}`, data),
    users:    () => request<ApiListResponse<User>>('GET', '/api/master/users'),
    roles:    () => request<ApiListResponse<Role>>('GET', '/api/master/roles'),
    permissions: () => request('GET', '/api/master/permissions'),
  },

  // ── System ──
  system: {
    audit:         (params?: AuditFilter) =>
      request<ApiListResponse<AuditLog>>('GET', '/api/system/audit' + toQuery(params)),
    approvals:     (status?: string) =>
      request<ApiListResponse<Approval>>('GET', '/api/system/approvals' + (status ? `?status=${status}` : '')),
    approve:  (id: string, note?: string) => request('POST', `/api/system/approvals/${id}/approve`, { note }),
    reject:   (id: string, note: string)  => request('POST', `/api/system/approvals/${id}/reject`, { note }),
    settings:    () => request<ApiResponse<Record<string, string>>>('GET', '/api/system/settings'),
    saveSettings: (data: Record<string, string>) => request('PUT', '/api/system/settings', data),
    notifications: () => request('GET', '/api/system/notifications'),
    markAllRead:   () => request('PUT', '/api/system/notifications/read-all'),
    integration:   () => request('GET', '/api/system/integration'),
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
export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
export interface ApiListResponse<T> { success: boolean; data: T[]; meta?: { total: number }; }

export interface User { id: string; name: string; username: string; email: string; role: string; status: string; last_login?: string; }
export interface DashboardData { kpi: KPI; tanks: Tank[]; alerts: Alert[]; recent_transactions: Transaction[]; last_updated: string; }
export interface KPI { total_stock_l: number; today_consumption_l: number; today_transactions: number; monthly_consumption_l: number; monthly_transactions: number; active_cards: number; quota_utilization_pct: number; quota_remaining_l: number; quota_expired_l: number; }
export interface Transaction { id: string; card_id: string; card_number: string; holder_name: string; unit_name?: string; product_name: string; volume_l: number; price_per_unit: number; total_amount: number; pump_number?: string; nozzle_number?: string; operator_id?: string; shift: string; status: string; transaction_time: string; quota_before?: number; quota_deducted?: number; quota_after?: number; }
export interface Card { id: string; card_number: string; card_type: string; status: string; holder_name: string; unit_id?: string; unit_name?: string; vehicle_id?: string; police_number?: string; fuel_type?: string; monthly_limit: number; expiry_date?: string; }
export interface CardQuota { id: string; card_id: string; card_number?: string; holder_name?: string; unit_name?: string; product_name?: string; allocated_l: number; used_l: number; remaining_l: number; topup_l: number; expired_l: number; period?: string; }
export interface QuotaPeriod { id: string; period: string; year: number; month: number; status: string; }
export interface QuotaLedger { id: string; type: string; amount_l: number; balance_l: number; description: string; created_at: string; }
export interface Tank { id: string; product_id: string; product_name: string; capacity_l: number; current_l: number; status: string; temperature?: number; water_level?: number; last_reading_at?: string; }
export interface TankReading { id: string; tank_id: string; volume_l: number; temperature?: number; source: string; read_at: string; }
export interface Product { id: string; code: string; name: string; type: string; active: number; current_price?: number; }
export interface Vehicle { id: string; police_number: string; type?: string; brand?: string; model?: string; year?: number; unit_id?: string; unit_name?: string; fuel_type?: string; status: string; }
export interface Unit { id: string; code: string; name: string; commander?: string; status: string; default_alloc_l: number; active_cards?: number; active_vehicles?: number; }
export interface Pump { id: string; number: string; location?: string; status: string; nozzle_count?: number; }
export interface Nozzle { id: string; number: string; pump_id: string; pump_number: string; product_id: string; product_name: string; status: string; }
export interface Totalizer { id: string; nozzle_id: string; nozzle_number: string; pump_number: string; product_name: string; opening_value: number; current_value: number; usage_l?: number; system_sales?: number; }
export interface PumpRecon { nozzle_id: string; nozzle_number: string; pump_number: string; product_name: string; totalizer_usage: number; system_sales: number; variance_l: number; }
export interface Reconciliation { id?: string; product_id: string; product_name?: string; date: string; opening_l: number; delivery_l: number; sales_l: number; adjustment_l: number; theoretical_closing: number; actual_closing: number; variance_l: number; variance_pct: number; status: string; }
export interface StockSummary { product_id: string; product_name: string; total_capacity: number; total_current: number; }
export interface StockMovement { id: string; product_id: string; product_name?: string; type: string; quantity_l: number; balance_l: number; notes?: string; created_at: string; }
export interface Delivery { id: string; date: string; supplier: string; product_name?: string; quantity_l: number; tank_id?: string; doc_number?: string; status: string; }
export interface Alert { id: number; type: string; title: string; message?: string; module?: string; read: number; created_at: string; }
export interface AuditLog { id: number; timestamp?: string; user_id?: string; username?: string; user_name?: string; action: string; module: string; record_id?: string; before_val?: string; after_val?: string; reason?: string; ip_address?: string; created_at: string; }
export interface Approval { id: string; type: string; detail?: string; status: string; requested_by: string; requested_by_name?: string; review_note?: string; requested_at: string; reviewed_at?: string; }
export interface Role { id: string; name: string; description?: string; }
export interface ExecutiveReport { transactions: Record<string, number>; stock: Tank[]; quota: Record<string, number>; avg_variance: number; top_cards: Array<{ card_number: string; holder_name: string; total_l: number }>; period: string; }

// Filter types
export interface TransactionFilter { [key: string]: unknown; card?: string; unit?: string; product?: string; status?: string; from?: string; to?: string; limit?: number; offset?: number; }
export interface CardFilter { [key: string]: unknown; search?: string; status?: string; unit?: string; limit?: number; offset?: number; }
export interface ReportFilter { [key: string]: unknown; from?: string; to?: string; unit_id?: string; product_id?: string; limit?: number; }
export interface AuditFilter { [key: string]: unknown; module?: string; user_id?: string; from?: string; to?: string; limit?: number; offset?: number; }

// Create types
export interface CreateTransaction { card_number: string; product_id: string; volume_l: number; nozzle_id?: string; pump_id?: string; shift?: string; totalizer_before?: number; totalizer_after?: number; source?: string; transaction_time?: string; }
export interface CreateCard { card_number: string; card_type?: string; holder_name: string; unit_id?: string; vehicle_id?: string; fuel_type?: string; monthly_limit?: number; expiry_date?: string; rfid_uid?: string; notes?: string; }
export interface GenerateQuota { period: string; year: number; month: number; product_id: string; default_l: number; scope?: string; unit_id?: string; }
export interface TopupQuota { card_id: string; product_id: string; amount_l: number; reason: string; }
export interface TankReadingInput { volume_l: number; height_cm?: number; water_level?: number; temperature?: number; source?: string; read_at?: string; }
export interface CreateDelivery { date: string; supplier: string; product_id: string; quantity_l: number; tank_id?: string; doc_number?: string; delivery_note?: string; }
export interface StockAdjustment { product_id: string; tank_id?: string; delta_l: number; reason: string; }
export interface TotalizerInput { nozzle_id: string; opening_value: number; current_value: number; shift_date: string; shift?: string; }
export interface CreateVehicle { police_number: string; type?: string; brand?: string; model?: string; year?: number; unit_id?: string; fuel_type?: string; notes?: string; }
export interface CreateUnit { code: string; name: string; parent_id?: string; commander?: string; default_alloc_l?: number; }

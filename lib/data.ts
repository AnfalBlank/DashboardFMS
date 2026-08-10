// ── Mock data for all pages ──

export const kpiData = {
  totalStock: 24240,
  todayConsumption: 842,
  monthlyConsumption: 48240,
  activeCards: 486,
  quotaUtilization: 76.4,
  remainingQuota: 14960,
  expiredQuota: 3240,
  stockVariance: -0.32,
  totalTransactions: 4821,
  totalQuota: 63200,
};

export const tanks = [
  { id: 'T-01', product: 'Pertamax', capacity: 16000, current: 12480, status: 'NORMAL', temp: 28.4, waterLevel: 0.2, lastUpdate: '18:31:42' },
  { id: 'T-02', product: 'Pertalite', capacity: 16000, current: 4480, status: 'LOW', temp: 27.8, waterLevel: 0.1, lastUpdate: '18:31:42' },
  { id: 'T-03', product: 'Dexlite', capacity: 8000, current: 4320, status: 'NORMAL', temp: 29.1, waterLevel: 0.3, lastUpdate: '18:31:42' },
  { id: 'T-04', product: 'Pertamax Turbo', capacity: 4000, current: 480, status: 'CRITICAL', temp: 28.9, waterLevel: 0.1, lastUpdate: '18:31:42' },
  { id: 'T-05', product: 'Pertamina DEX', capacity: 4000, current: 2480, status: 'NORMAL', temp: 28.2, waterLevel: 0.2, lastUpdate: '18:31:42' },
];

export const transactions = [
  { id: 'TRX-20260809-004821', card: '008231', holder: 'AKP Hendra W.', vehicle: 'PB 1234 ZA', unit: 'DITRESKRIMSUS', product: 'Pertamax', volume: 40, price: 12300, total: 492000, pump: 'P01', nozzle: 'N2', operator: 'BUDI', shift: 'PAGI', time: '08:42:31', status: 'SUCCESS', quotaBefore: 150, quotaDeducted: 40, quotaAfter: 110 },
  { id: 'TRX-20260809-004820', card: '007412', holder: 'BRIPTU Dian R.', vehicle: 'PB 5678 AB', unit: 'DITLANTAS', product: 'Pertalite', volume: 30, price: 9700, total: 291000, pump: 'P01', nozzle: 'N1', operator: 'SARI', shift: 'PAGI', time: '08:38:14', status: 'SUCCESS', quotaBefore: 120, quotaDeducted: 30, quotaAfter: 90 },
  { id: 'TRX-20260809-004819', card: '009103', holder: 'IPDA Mursalim', vehicle: 'PB 9012 CD', unit: 'BRIMOB', product: 'Dexlite', volume: 60, price: 13740, total: 824400, pump: 'P02', nozzle: 'N3', operator: 'TONO', shift: 'PAGI', time: '08:31:07', status: 'SUCCESS', quotaBefore: 180, quotaDeducted: 60, quotaAfter: 120 },
  { id: 'TRX-20260809-004818', card: '008421', holder: 'AKP Suyatno', vehicle: 'PB 3456 EF', unit: 'INTELKAM', product: 'Pertamax', volume: 25, price: 12300, total: 307500, pump: 'P02', nozzle: 'N2', operator: 'BUDI', shift: 'PAGI', time: '08:24:52', status: 'SUCCESS', quotaBefore: 100, quotaDeducted: 25, quotaAfter: 75 },
  { id: 'TRX-20260809-004817', card: '006891', holder: 'KOMPOL Aris H.', vehicle: 'PB 7890 GH', unit: 'SAMAPTA', product: 'Pertalite', volume: 45, price: 9700, total: 436500, pump: 'P01', nozzle: 'N1', operator: 'SARI', shift: 'PAGI', time: '08:18:29', status: 'SUCCESS', quotaBefore: 200, quotaDeducted: 45, quotaAfter: 155 },
  { id: 'TRX-20260809-004816', card: '010044', holder: 'AIPTU Bagas P.', vehicle: 'PB 2345 IJ', unit: 'DITRESKRIMUM', product: 'Pertamax', volume: 50, price: 12300, total: 615000, pump: 'P02', nozzle: 'N2', operator: 'TONO', shift: 'PAGI', time: '08:11:04', status: 'FAILED', quotaBefore: 40, quotaDeducted: 0, quotaAfter: 40 },
  { id: 'TRX-20260809-004815', card: '007801', holder: 'IPTU Wahyu N.', vehicle: 'PB 6789 KL', unit: 'DITLANTAS', product: 'Pertalite', volume: 35, price: 9700, total: 339500, pump: 'P01', nozzle: 'N1', operator: 'SARI', shift: 'PAGI', time: '08:04:17', status: 'SUCCESS', quotaBefore: 160, quotaDeducted: 35, quotaAfter: 125 },
  { id: 'TRX-20260809-004814', card: '005512', holder: 'BRIGADIR Fajar', vehicle: 'PB 0011 MN', unit: 'BRIMOB', product: 'Pertamax', volume: 55, price: 12300, total: 676500, pump: 'P01', nozzle: 'N2', operator: 'BUDI', shift: 'MALAM', time: '07:55:00', status: 'SUCCESS', quotaBefore: 200, quotaDeducted: 55, quotaAfter: 145 },
  { id: 'TRX-20260809-004813', card: '011234', holder: 'AKP Rendra', vehicle: 'PB 3322 OP', unit: 'DITRESKRIMSUS', product: 'Dexlite', volume: 80, price: 13740, total: 1099200, pump: 'P02', nozzle: 'N3', operator: 'TONO', shift: 'MALAM', time: '07:40:11', status: 'VOID', quotaBefore: 250, quotaDeducted: 0, quotaAfter: 250 },
  { id: 'TRX-20260809-004812', card: '008900', holder: 'IPTU Sinta D.', vehicle: 'PB 9988 QR', unit: 'INTELKAM', product: 'Pertamax', volume: 20, price: 12300, total: 246000, pump: 'P01', nozzle: 'N2', operator: 'BUDI', shift: 'MALAM', time: '07:28:44', status: 'SUCCESS', quotaBefore: 80, quotaDeducted: 20, quotaAfter: 60 },
];

export const cards = [
  { id: 'C001', number: '008231', type: 'REGULER', status: 'ACTIVE', holder: 'AKP Hendra W.', unit: 'DITRESKRIMSUS', vehicle: 'PB 1234 ZA', fuelType: 'Pertamax', monthlyLimit: 200, currentQuota: 20, allocated: 200, used: 180, remaining: 20, expiry: '2027-12-31', activation: '2024-01-01' },
  { id: 'C002', number: '007412', type: 'REGULER', status: 'ACTIVE', holder: 'BRIPTU Dian R.', unit: 'DITLANTAS', vehicle: 'PB 5678 AB', fuelType: 'Pertalite', monthlyLimit: 200, currentQuota: 90, allocated: 200, used: 110, remaining: 90, expiry: '2027-12-31', activation: '2024-01-01' },
  { id: 'C003', number: '009103', type: 'KHUSUS', status: 'ACTIVE', holder: 'IPDA Mursalim', unit: 'BRIMOB', vehicle: 'PB 9012 CD', fuelType: 'Dexlite', monthlyLimit: 300, currentQuota: 8, allocated: 300, used: 292, remaining: 8, expiry: '2027-12-31', activation: '2024-01-01' },
  { id: 'C004', number: '008421', type: 'REGULER', status: 'ACTIVE', holder: 'AKP Suyatno', unit: 'INTELKAM', vehicle: 'PB 3456 EF', fuelType: 'Pertamax', monthlyLimit: 200, currentQuota: 75, allocated: 200, used: 125, remaining: 75, expiry: '2027-12-31', activation: '2024-01-01' },
  { id: 'C005', number: '006891', type: 'REGULER', status: 'ACTIVE', holder: 'KOMPOL Aris H.', unit: 'SAMAPTA', vehicle: 'PB 7890 GH', fuelType: 'Pertalite', monthlyLimit: 250, currentQuota: 155, allocated: 250, used: 95, remaining: 155, expiry: '2027-12-31', activation: '2024-01-01' },
  { id: 'C006', number: '010044', type: 'REGULER', status: 'BLOCKED', holder: 'AIPTU Bagas P.', unit: 'DITRESKRIMUM', vehicle: 'PB 2345 IJ', fuelType: 'Pertamax', monthlyLimit: 200, currentQuota: 40, allocated: 200, used: 160, remaining: 40, expiry: '2027-12-31', activation: '2024-01-01' },
  { id: 'C007', number: '007801', type: 'REGULER', status: 'ACTIVE', holder: 'IPTU Wahyu N.', unit: 'DITLANTAS', vehicle: 'PB 6789 KL', fuelType: 'Pertalite', monthlyLimit: 200, currentQuota: 125, allocated: 200, used: 75, remaining: 125, expiry: '2027-12-31', activation: '2024-01-01' },
  { id: 'C008', number: '005512', type: 'KHUSUS', status: 'ACTIVE', holder: 'BRIGADIR Fajar', unit: 'BRIMOB', vehicle: 'PB 0011 MN', fuelType: 'Pertamax', monthlyLimit: 300, currentQuota: 145, allocated: 300, used: 155, remaining: 145, expiry: '2027-12-31', activation: '2024-01-01' },
  { id: 'C009', number: '011234', type: 'REGULER', status: 'SUSPENDED', holder: 'AKP Rendra', unit: 'DITRESKRIMSUS', vehicle: 'PB 3322 OP', fuelType: 'Dexlite', monthlyLimit: 250, currentQuota: 250, allocated: 250, used: 0, remaining: 250, expiry: '2027-12-31', activation: '2024-01-01' },
  { id: 'C010', number: '008900', type: 'REGULER', status: 'ACTIVE', holder: 'IPTU Sinta D.', unit: 'INTELKAM', vehicle: 'PB 9988 QR', fuelType: 'Pertamax', monthlyLimit: 150, currentQuota: 60, allocated: 150, used: 90, remaining: 60, expiry: '2027-12-31', activation: '2024-01-01' },
];

export const vehicles = [
  { id: 'V001', policeNumber: 'PB 1234 ZA', type: 'Sedan', brand: 'Toyota', model: 'Camry', year: 2022, unit: 'DITRESKRIMSUS', fuelType: 'Pertamax', card: '008231', status: 'ACTIVE' },
  { id: 'V002', policeNumber: 'PB 5678 AB', type: 'SUV', brand: 'Toyota', model: 'Fortuner', year: 2021, unit: 'DITLANTAS', fuelType: 'Pertalite', card: '007412', status: 'ACTIVE' },
  { id: 'V003', policeNumber: 'PB 9012 CD', type: 'Truk', brand: 'Mitsubishi', model: 'Colt Diesel', year: 2020, unit: 'BRIMOB', fuelType: 'Dexlite', card: '009103', status: 'ACTIVE' },
  { id: 'V004', policeNumber: 'PB 3456 EF', type: 'MPV', brand: 'Toyota', model: 'Innova', year: 2023, unit: 'INTELKAM', fuelType: 'Pertamax', card: '008421', status: 'ACTIVE' },
  { id: 'V005', policeNumber: 'PB 7890 GH', type: 'SUV', brand: 'Mitsubishi', model: 'Pajero', year: 2022, unit: 'SAMAPTA', fuelType: 'Pertalite', card: '006891', status: 'ACTIVE' },
  { id: 'V006', policeNumber: 'PB 2345 IJ', type: 'Sedan', brand: 'Honda', model: 'Civic', year: 2021, unit: 'DITRESKRIMUM', fuelType: 'Pertamax', card: '010044', status: 'INACTIVE' },
];

export const units = [
  { id: 'U01', code: 'DITRES', name: 'DITRESKRIMSUS', parent: null, commander: 'KOMBES Pol. Ahmad S.', status: 'ACTIVE', defaultAllocation: 250, cards: 72, vehicles: 68, used: 11820, quota: 14400 },
  { id: 'U02', code: 'BRIMOB', name: 'BRIMOB', parent: null, commander: 'KOMBES Pol. Budi T.', status: 'ACTIVE', defaultAllocation: 300, cards: 85, vehicles: 80, used: 10680, quota: 12000 },
  { id: 'U03', code: 'LANTAS', name: 'DITLANTAS', parent: null, commander: 'AKBP Candra P.', status: 'ACTIVE', defaultAllocation: 200, cards: 64, vehicles: 62, used: 8940, quota: 11200 },
  { id: 'U04', code: 'SAMAPTA', name: 'SAMAPTA', parent: null, commander: 'AKBP Deni W.', status: 'ACTIVE', defaultAllocation: 200, cards: 58, vehicles: 55, used: 6920, quota: 10000 },
  { id: 'U05', code: 'INTEL', name: 'INTELKAM', parent: null, commander: 'AKBP Eko F.', status: 'ACTIVE', defaultAllocation: 150, cards: 48, vehicles: 45, used: 5480, quota: 8000 },
  { id: 'U06', code: 'KRIMUM', name: 'DITRESKRIMUM', parent: null, commander: 'AKBP Faisal H.', status: 'ACTIVE', defaultAllocation: 200, cards: 42, vehicles: 40, used: 4040, quota: 7200 },
  { id: 'U07', code: 'POLRES', name: 'POLRES MANOKWARI', parent: null, commander: 'AKBP Gilang N.', status: 'ACTIVE', defaultAllocation: 150, cards: 75, vehicles: 70, used: 3360, quota: 8000 },
];

export const products = [
  { id: 'P01', code: 'PTX', name: 'Pertamax', type: 'Bensin', unit: 'Liter', active: true, currentPrice: 12300 },
  { id: 'P02', code: 'PLT', name: 'Pertalite', type: 'Bensin', unit: 'Liter', active: true, currentPrice: 9700 },
  { id: 'P03', code: 'PTXT', name: 'Pertamax Turbo', type: 'Bensin', unit: 'Liter', active: true, currentPrice: 14000 },
  { id: 'P04', code: 'DXL', name: 'Dexlite', type: 'Solar', unit: 'Liter', active: true, currentPrice: 13740 },
  { id: 'P05', code: 'PDEX', name: 'Pertamina DEX', type: 'Solar', unit: 'Liter', active: true, currentPrice: 15400 },
];

export const pumps = [
  { id: 'PMP01', number: '01', status: 'ACTIVE', location: 'Area A', nozzles: [
    { id: 'N01', number: '01', product: 'Pertalite', status: 'ACTIVE', totalizerOpen: 1400000, totalizerCurrent: 1421840, usage: 21840, systemSales: 21840, variance: 0 },
    { id: 'N02', number: '02', product: 'Pertamax', status: 'ACTIVE', totalizerOpen: 960000, totalizerCurrent: 982440, usage: 22440, systemSales: 22439, variance: 1 },
  ]},
  { id: 'PMP02', number: '02', status: 'ACTIVE', location: 'Area A', nozzles: [
    { id: 'N03', number: '01', product: 'Pertalite', status: 'ACTIVE', totalizerOpen: 1360000, totalizerCurrent: 1384210, usage: 24210, systemSales: 24210, variance: 0 },
    { id: 'N04', number: '02', product: 'Pertamax', status: 'ACTIVE', totalizerOpen: 950000, totalizerCurrent: 976852, usage: 26852, systemSales: 26840, variance: 12 },
    { id: 'N05', number: '03', product: 'Dexlite', status: 'ACTIVE', totalizerOpen: 210000, totalizerCurrent: 234180, usage: 24180, systemSales: 24180, variance: 0 },
  ]},
  { id: 'PMP03', number: '03', status: 'OFFLINE', location: 'Area B', nozzles: [
    { id: 'N06', number: '01', product: 'Pertamax Turbo', status: 'OFFLINE', totalizerOpen: 130000, totalizerCurrent: 142690, usage: 12690, systemSales: 12690, variance: 0 },
    { id: 'N07', number: '02', product: 'Pertamina DEX', status: 'OFFLINE', totalizerOpen: 80000, totalizerCurrent: 89340, usage: 9340, systemSales: 9340, variance: 0 },
  ]},
];

export const reconciliations = [
  { product: 'Pertamax', opening: 10000, delivery: 5000, sales: 2840, adjustment: 0, theoreticalClosing: 12160, actualClosing: 12110, variance: -50, variancePct: -0.41, status: 'NORMAL' },
  { product: 'Pertalite', opening: 8000, delivery: 0, sales: 5820, adjustment: 0, theoreticalClosing: 2180, actualClosing: 2180, variance: 0, variancePct: 0, status: 'PERFECT' },
  { product: 'Dexlite', opening: 5000, delivery: 0, sales: 680, adjustment: 0, theoreticalClosing: 4320, actualClosing: 4315, variance: -5, variancePct: -0.12, status: 'NORMAL' },
  { product: 'Pertamax Turbo', opening: 800, delivery: 0, sales: 320, adjustment: 0, theoreticalClosing: 480, actualClosing: 480, variance: 0, variancePct: 0, status: 'PERFECT' },
  { product: 'Pertamina DEX', opening: 2800, delivery: 0, sales: 320, adjustment: 0, theoreticalClosing: 2480, actualClosing: 2480, variance: 0, variancePct: 0, status: 'PERFECT' },
];

export const alerts = [
  { id: 1, severity: 'CRITICAL', title: 'Stok Pertamax Turbo kritis', desc: 'Tank T-04 tersisa 480 L (12%) — di bawah threshold 15%', time: '08:14', module: 'inventory' },
  { id: 2, severity: 'CRITICAL', title: 'Kartu 008421 — transaksi cepat', desc: '3 transaksi dalam 8 menit (Rule: 3 trx < 10 menit)', time: '07:52', module: 'transaction' },
  { id: 3, severity: 'WARNING', title: 'Stok Pertalite mendekati LOW', desc: 'Tank T-02 tersisa 4.480 L (28%) — batas warning 30%', time: '06:30', module: 'inventory' },
  { id: 4, severity: 'WARNING', title: 'Nozzle 03 — variance totalizer', desc: 'Totalizer: 2.852 L vs Transaksi: 2.840 L (+12 L)', time: 'kemarin', module: 'dispensing' },
  { id: 5, severity: 'WARNING', title: 'Kartu 008231 — kuota 90%', desc: 'Sisa 20 L dari 200 L', time: 'kemarin', module: 'quota' },
  { id: 6, severity: 'INFO', title: 'Kuota Agustus 2026 berhasil digenerate', desc: '486 kartu × 200 L = 97.200 L', time: '01 Agu', module: 'quota' },
];

export const auditLogs = [
  { id: 1, timestamp: '09 Agu 2026 18:21', user: 'ADMIN01', action: 'UPDATE QUOTA', module: 'Quota', recordId: 'C001', before: '150 L', after: '200 L', reason: 'Operational Adjustment', ip: '192.168.1.10' },
  { id: 2, timestamp: '09 Agu 2026 17:45', user: 'ADMIN01', action: 'BLOCK CARD', module: 'Card', recordId: 'C006', before: 'ACTIVE', after: 'BLOCKED', reason: 'Suspicious activity', ip: '192.168.1.10' },
  { id: 3, timestamp: '09 Agu 2026 15:30', user: 'OPERATOR01', action: 'CREATE TRANSACTION', module: 'Transaction', recordId: 'TRX-20260809-004821', before: '-', after: 'SUCCESS 40L', reason: '-', ip: '192.168.1.20' },
  { id: 4, timestamp: '09 Agu 2026 14:12', user: 'ADMIN01', action: 'PRICE CHANGE', module: 'Product', recordId: 'P01', before: 'Rp 12.100', after: 'Rp 12.300', reason: 'Penyesuaian harga Agustus', ip: '192.168.1.10' },
  { id: 5, timestamp: '09 Agu 2026 12:00', user: 'ADMIN01', action: 'GENERATE QUOTA', module: 'Quota', recordId: 'PERIOD-AUG-2026', before: '-', after: '486 kartu × 200L', reason: 'Monthly generation', ip: '192.168.1.10' },
  { id: 6, timestamp: '08 Agu 2026 18:00', user: 'PENGELOLA01', action: 'STOCK ADJUSTMENT', module: 'Stock', recordId: 'STK-2026-088', before: '10.050 L', after: '10.000 L', reason: 'Koreksi pengukuran', ip: '192.168.1.15' },
];

export const consumptionTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  pertamax: Math.floor(580 + Math.random() * 280),
  pertalite: Math.floor(320 + Math.random() * 200),
  dexlite: Math.floor(120 + Math.random() * 80),
  lainnya: Math.floor(50 + Math.random() * 60),
}));

export const users = [
  { id: 'USR01', name: 'Ahmad Fauzi', username: 'ADMIN01', email: 'admin01@spbp.polri.go.id', role: 'Administrator SPBP', unit: 'SPBP', status: 'ACTIVE', lastLogin: '09 Agu 2026 08:30' },
  { id: 'USR02', name: 'Budi Santoso', username: 'OPERATOR01', email: 'operator01@spbp.polri.go.id', role: 'Operator', unit: 'SPBP', status: 'ACTIVE', lastLogin: '09 Agu 2026 07:00' },
  { id: 'USR03', name: 'Candra Wijaya', username: 'PENGELOLA01', email: 'pengelola01@spbp.polri.go.id', role: 'Pengelola BBM', unit: 'SPBP', status: 'ACTIVE', lastLogin: '08 Agu 2026 18:00' },
  { id: 'USR04', name: 'Dewi Rahayu', username: 'FINANCE01', email: 'finance01@spbp.polri.go.id', role: 'Finance', unit: 'SPBP', status: 'ACTIVE', lastLogin: '07 Agu 2026 10:00' },
  { id: 'USR05', name: 'Eko Prasetyo', username: 'PIMPINAN01', email: 'pimpinan01@polda-pb.go.id', role: 'Pimpinan', unit: 'POLDA PB', status: 'ACTIVE', lastLogin: '09 Agu 2026 09:00' },
  { id: 'USR06', name: 'Fajar Hidayat', username: 'AUDITOR01', email: 'auditor01@polda-pb.go.id', role: 'Auditor', unit: 'POLDA PB', status: 'INACTIVE', lastLogin: '01 Agu 2026 14:00' },
];

export const quotaLedger = [
  { date: '01 Agu 2026', type: 'ALLOCATION', amount: 200, balance: 200, description: 'Monthly Allocation Agustus 2026', ref: 'ALLOC-AUG-2026' },
  { date: '05 Agu 2026', type: 'DEDUCTION', amount: -40, balance: 160, description: 'Fuel Transaction', ref: 'TRX-20260805-002341' },
  { date: '07 Agu 2026', type: 'TOPUP', amount: 50, balance: 210, description: 'Top Up — Operasional khusus', ref: 'TOPUP-20260807-001' },
  { date: '07 Agu 2026', type: 'DEDUCTION', amount: -30, balance: 180, description: 'Fuel Transaction', ref: 'TRX-20260807-003120' },
  { date: '09 Agu 2026', type: 'DEDUCTION', amount: -40, balance: 140, description: 'Fuel Transaction', ref: 'TRX-20260809-004821' },
  { date: '09 Agu 2026', type: 'TOPUP', amount: 20, balance: 160, description: 'Top Up — Penambahan kuota harian', ref: 'TOPUP-20260809-002' },
];

export const deliveries = [
  { id: 'DEL-20260805-001', date: '05 Agu 2026', supplier: 'PT Pertamina (Persero)', product: 'Pertamax', quantity: 5000, tank: 'T-01', docNumber: 'DO-2026-08-001', status: 'CONFIRMED', operator: 'PENGELOLA01' },
  { id: 'DEL-20260801-001', date: '01 Agu 2026', supplier: 'PT Pertamina (Persero)', product: 'Pertalite', quantity: 8000, tank: 'T-02', docNumber: 'DO-2026-08-002', status: 'CONFIRMED', operator: 'PENGELOLA01' },
  { id: 'DEL-20260728-001', date: '28 Jul 2026', supplier: 'PT Pertamina (Persero)', product: 'Dexlite', quantity: 4000, tank: 'T-03', docNumber: 'DO-2026-07-015', status: 'CONFIRMED', operator: 'PENGELOLA01' },
];

export const priceHistory = [
  { product: 'Pertamax', prices: [
    { effectiveDate: '01 Jun 2026', price: 12900 },
    { effectiveDate: '01 Jul 2026', price: 12100 },
    { effectiveDate: '01 Agu 2026', price: 12300 },
  ]},
  { product: 'Pertalite', prices: [
    { effectiveDate: '01 Jun 2026', price: 9700 },
    { effectiveDate: '01 Jul 2026', price: 9700 },
    { effectiveDate: '01 Agu 2026', price: 9700 },
  ]},
  { product: 'Dexlite', prices: [
    { effectiveDate: '01 Jun 2026', price: 13200 },
    { effectiveDate: '01 Jul 2026', price: 13500 },
    { effectiveDate: '01 Agu 2026', price: 13740 },
  ]},
];

export const pendingApprovals = [
  { id: 'APV-001', type: 'TOP UP QUOTA', requestedBy: 'ADMIN01', card: '008231', detail: '+50 L Operasional khusus', submittedAt: '09 Agu 2026 15:30', priority: 'NORMAL' },
  { id: 'APV-002', type: 'STOCK ADJUSTMENT', requestedBy: 'PENGELOLA01', detail: 'Koreksi stok Pertamax -10 L', submittedAt: '09 Agu 2026 14:00', priority: 'HIGH' },
  { id: 'APV-003', type: 'TRANSACTION VOID', requestedBy: 'OPERATOR01', detail: 'VOID TRX-20260809-004813', submittedAt: '09 Agu 2026 12:10', priority: 'HIGH' },
];

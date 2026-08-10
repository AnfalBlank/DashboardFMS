# Fuel Monitoring & Management System
### SPBP Polda Papua Barat — Manokwari

> Digital Control Center untuk pengelolaan BBM SPBP Polda Papua Barat

---

## Stack

| Layer     | Teknologi |
|-----------|-----------|
| Frontend  | Next.js 16 · TypeScript · Tailwind CSS · Recharts |
| Backend   | Node.js · Express · TypeScript |
| Database  | Turso (libSQL / SQLite edge) |
| Auth      | JWT · bcryptjs |

---

## Menjalankan Lokal

### 1. Backend (port 4000)

```bash
cd backend
npm install
npm run db:migrate          # buat tabel di Turso
npm run db:seed             # seed data awal
npm run db:seed-permissions # seed roles & permissions
npm run dev                 # http://localhost:4000
```

### 2. Frontend (port 3000)

```bash
cd fuel-monitoring
npm install
npm run dev                 # http://localhost:3000
```

### Login Default

```
Username : ADMIN01
Password : Admin@2026
```

---

## Struktur Halaman (35 halaman)

```
/                         Dashboard utama
/login                    Halaman login

── Fuel Management ──
/transactions             Monitor transaksi BBM realtime
/cards                    Kelola kartu BBM
/quota                    Manajemen kuota bulanan
/topup                    Top up kuota + approval workflow
/allocation               Generate kuota massal

── Inventory ──
/tanks                    Tank monitoring realtime (ATG)
/stock                    Pergerakan stok BBM
/delivery                 Input delivery dari supplier
/stock-adjustment         Penyesuaian stok + approval

── Dispensing ──
/pumps                    Status pump & nozzle
/nozzles                  Master nozzle
/totalizer                Totalizer opening/closing
/reconciliation           Rekonsiliasi stok aktual vs teoritikal

── Reports ──
/reports/transactions     Laporan transaksi
/reports/usage            Laporan konsumsi per unit/kartu
/reports/quota            Laporan kuota
/reports/stock            Laporan stok
/reports/totalizer        Laporan totalizer
/reports/executive        Dashboard eksekutif / pimpinan

── Master Data ──
/master/products          Produk BBM
/master/price             Riwayat harga
/master/cards             Master kartu
/master/vehicles          Kendaraan
/master/units             Unit / Satker
/master/users             User management
/master/operators         Operator shift

── System ──
/system/users             Users & Roles
/system/roles             Role-permission matrix
/system/permissions       Daftar permission
/system/approval          Approval center
/system/audit             Audit log
/system/integration       Integration monitor

── User ──
/profile                  Profil pengguna
/settings                 System settings
```

---

## Backend API Endpoints (35 endpoints)

```
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/change-password

GET  /api/dashboard
GET  /api/dashboard/alerts

GET  /api/transactions          POST /api/transactions
GET  /api/transactions/:id      POST /api/transactions/:id/void

GET  /api/cards                 POST /api/cards
GET  /api/cards/:id             PUT  /api/cards/:id
GET  /api/cards/:id/transactions
GET  /api/cards/:id/quota
POST /api/cards/:id/block       POST /api/cards/:id/unblock

GET  /api/quota                 POST /api/quota/generate
GET  /api/quota/periods         POST /api/quota/topup
GET  /api/quota/ledger/:cardId

GET  /api/tanks                 PUT  /api/tanks/:id
GET  /api/tanks/:id             POST /api/tanks/:id/readings
GET  /api/tanks/:id/readings

GET  /api/stock
GET  /api/stock/movements
GET  /api/stock/deliveries      POST /api/stock/deliveries
POST /api/stock/adjustment

GET  /api/pumps
GET  /api/pumps/nozzles
GET  /api/pumps/totalizers      POST /api/pumps/totalizers
GET  /api/pumps/reconciliation

GET  /api/reconciliation        POST /api/reconciliation/run

GET  /api/reports/transactions
GET  /api/reports/quota
GET  /api/reports/stock
GET  /api/reports/usage
GET  /api/reports/totalizer
GET  /api/reports/executive

GET  /api/master/products       POST /api/master/products
GET  /api/master/prices         POST /api/master/prices
GET  /api/master/vehicles       POST /api/master/vehicles
PUT  /api/master/vehicles/:id
GET  /api/master/units          POST /api/master/units
PUT  /api/master/units/:id
GET  /api/master/users
GET  /api/master/roles
GET  /api/master/permissions

GET  /api/system/audit
GET  /api/system/approvals
POST /api/system/approvals/:id/approve
POST /api/system/approvals/:id/reject
GET  /api/system/settings       PUT  /api/system/settings
GET  /api/system/notifications  PUT  /api/system/notifications/read-all
GET  /api/system/integration

POST /api/controller/transaction   ← fuel pump controller push
```

---

## Controller Integration

Pump controller dapat push transaksi ke backend menggunakan:

```bash
POST http://localhost:4000/api/controller/transaction
Header: x-controller-secret: spbp-controller-2026

{
  "card_number":      "008231",
  "product_code":     "PTX",
  "volume_l":         40,
  "nozzle_id":        "nzl-01-2",
  "pump_id":          "pump-01",
  "shift":            "PAGI",
  "totalizer_before": 982400,
  "totalizer_after":  982440,
  "transaction_time": "2026-08-09T08:42:31.000Z"
}
```

---

## Database Schema (25 tabel)

```
roles · users · permissions · role_permissions
units · products · price_histories · vehicles · cards
quota_periods · card_quotas · quota_ledger
pumps · nozzles · totalizers
tanks · tank_readings
stock_movements · deliveries
transactions
reconciliations
approvals · audit_logs
notifications · system_settings
```

---

## Roles

| Role | Akses |
|------|-------|
| Super Administrator | Semua modul |
| Administrator SPBP | Dashboard, transaksi, kartu, kuota, stok, laporan |
| Operator | Monitoring transaksi, pump, nozzle |
| Pengelola BBM | Tank, stok, delivery, totalizer, rekonsiliasi |
| Finance | Transaksi, harga, laporan nominal |
| Pimpinan | Dashboard read-only, laporan eksekutif |
| Auditor | Read-only + audit log |

---

## Environment Variables

### Backend (.env)
```env
PORT=4000
TURSO_URL=libsql://fms-anfal.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=<token>
JWT_SECRET=<secret>
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:3000
CONTROLLER_SECRET=spbp-controller-2026
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

**Product:** Fuel Monitoring & Management System  
**Organization:** SPBP Polda Papua Barat — Manokwari  
**Version:** 1.0  
**Repository:** https://github.com/AnfalBlank/DashboardFMS

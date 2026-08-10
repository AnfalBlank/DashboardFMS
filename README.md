# Fuel Monitoring Backend API
### SPBP Polda Papua Barat — Manokwari

Express + TypeScript REST API with Turso (libSQL) database.

## Quick Start

```bash
npm install
npm run db:migrate           # create all 25 tables + indexes
npm run db:seed              # seed roles, users, units, products, pumps, tanks
npm run db:seed-permissions  # seed 20 permissions + 64 role-permission links
npm run dev                  # start dev server on port 4000
```

## Test

```bash
# Health check
curl http://localhost:4000/health

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ADMIN01","password":"Admin@2026"}'

# Use token
curl http://localhost:4000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

## Controller Push (from fuel pump)

```bash
curl -X POST http://localhost:4000/api/controller/transaction \
  -H "Content-Type: application/json" \
  -H "x-controller-secret: spbp-controller-2026" \
  -d '{
    "card_number": "008231",
    "product_code": "PTX",
    "volume_l": 40,
    "shift": "PAGI",
    "transaction_time": "2026-08-09T08:42:31.000Z"
  }'
```

See full documentation in the [frontend README](https://github.com/AnfalBlank/DashboardFMS).

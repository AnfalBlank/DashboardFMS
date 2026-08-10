// All CREATE TABLE statements for the Fuel Monitoring System
// Executed in order to respect foreign key dependencies

export const schema = [

  /* ── 1. Users & Auth ── */
  `CREATE TABLE IF NOT EXISTS roles (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    username    TEXT NOT NULL UNIQUE,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    role_id     TEXT NOT NULL REFERENCES roles(id),
    unit_id     TEXT,
    status      TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE','LOCKED')),
    last_login  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS permissions (
    id          TEXT PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,
    module      TEXT NOT NULL,
    action      TEXT NOT NULL,
    description TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       TEXT NOT NULL REFERENCES roles(id),
    permission_id TEXT NOT NULL REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
  )`,

  /* ── 2. Organization ── */
  `CREATE TABLE IF NOT EXISTS units (
    id              TEXT PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    parent_id       TEXT REFERENCES units(id),
    commander       TEXT,
    status          TEXT NOT NULL DEFAULT 'ACTIVE',
    default_alloc_l REAL NOT NULL DEFAULT 200,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  /* ── 3. Master Data ── */
  `CREATE TABLE IF NOT EXISTS products (
    id           TEXT PRIMARY KEY,
    code         TEXT NOT NULL UNIQUE,
    name         TEXT NOT NULL,
    type         TEXT NOT NULL CHECK(type IN ('Bensin','Solar','LPG')),
    unit         TEXT NOT NULL DEFAULT 'Liter',
    active       INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS price_histories (
    id             TEXT PRIMARY KEY,
    product_id     TEXT NOT NULL REFERENCES products(id),
    price_per_unit REAL NOT NULL,
    effective_date TEXT NOT NULL,
    created_by     TEXT REFERENCES users(id),
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS vehicles (
    id           TEXT PRIMARY KEY,
    police_number TEXT NOT NULL UNIQUE,
    type         TEXT,
    brand        TEXT,
    model        TEXT,
    year         INTEGER,
    unit_id      TEXT REFERENCES units(id),
    fuel_type    TEXT REFERENCES products(code),
    status       TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE')),
    notes        TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS cards (
    id             TEXT PRIMARY KEY,
    card_number    TEXT NOT NULL UNIQUE,
    card_type      TEXT NOT NULL DEFAULT 'REGULER',
    status         TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE','BLOCKED','EXPIRED','SUSPENDED')),
    holder_name    TEXT NOT NULL,
    unit_id        TEXT REFERENCES units(id),
    vehicle_id     TEXT REFERENCES vehicles(id),
    fuel_type      TEXT REFERENCES products(code),
    monthly_limit  REAL NOT NULL DEFAULT 200,
    expiry_date    TEXT,
    activation_date TEXT,
    rfid_uid       TEXT,
    notes          TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  /* ── 4. Quota ── */
  `CREATE TABLE IF NOT EXISTS quota_periods (
    id         TEXT PRIMARY KEY,
    period     TEXT NOT NULL,
    year       INTEGER NOT NULL,
    month      INTEGER NOT NULL,
    status     TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','CLOSED','PENDING')),
    closed_at  TEXT,
    closed_by  TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(year, month)
  )`,

  `CREATE TABLE IF NOT EXISTS card_quotas (
    id               TEXT PRIMARY KEY,
    card_id          TEXT NOT NULL REFERENCES cards(id),
    period_id        TEXT NOT NULL REFERENCES quota_periods(id),
    product_id       TEXT NOT NULL REFERENCES products(id),
    allocated_l      REAL NOT NULL DEFAULT 0,
    used_l           REAL NOT NULL DEFAULT 0,
    remaining_l      REAL NOT NULL DEFAULT 0,
    topup_l          REAL NOT NULL DEFAULT 0,
    expired_l        REAL NOT NULL DEFAULT 0,
    status           TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(card_id, period_id, product_id)
  )`,

  `CREATE TABLE IF NOT EXISTS quota_ledger (
    id          TEXT PRIMARY KEY,
    quota_id    TEXT NOT NULL REFERENCES card_quotas(id),
    card_id     TEXT NOT NULL REFERENCES cards(id),
    type        TEXT NOT NULL CHECK(type IN ('ALLOCATION','DEDUCTION','TOPUP','EXPIRATION','REVERSAL')),
    amount_l    REAL NOT NULL,
    balance_l   REAL NOT NULL,
    ref_id      TEXT,
    description TEXT,
    created_by  TEXT REFERENCES users(id),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  /* ── 5. Pumps, Nozzles, Tanks ── */
  `CREATE TABLE IF NOT EXISTS pumps (
    id       TEXT PRIMARY KEY,
    number   TEXT NOT NULL UNIQUE,
    location TEXT,
    status   TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE','MAINTENANCE','OFFLINE')),
    active   INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS nozzles (
    id         TEXT PRIMARY KEY,
    number     TEXT NOT NULL,
    pump_id    TEXT NOT NULL REFERENCES pumps(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    status     TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE','OFFLINE')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(pump_id, number)
  )`,

  `CREATE TABLE IF NOT EXISTS totalizers (
    id              TEXT PRIMARY KEY,
    nozzle_id       TEXT NOT NULL REFERENCES nozzles(id),
    opening_value   REAL NOT NULL DEFAULT 0,
    current_value   REAL NOT NULL DEFAULT 0,
    closing_value   REAL,
    shift_date      TEXT NOT NULL,
    shift           TEXT NOT NULL DEFAULT 'PAGI',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS tanks (
    id          TEXT PRIMARY KEY,
    product_id  TEXT NOT NULL REFERENCES products(id),
    capacity_l  REAL NOT NULL,
    current_l   REAL NOT NULL DEFAULT 0,
    status      TEXT NOT NULL DEFAULT 'NORMAL' CHECK(status IN ('NORMAL','LOW','CRITICAL','HIGH','SENSOR_ERROR','OFFLINE')),
    threshold_low    REAL NOT NULL DEFAULT 30,
    threshold_critical REAL NOT NULL DEFAULT 15,
    threshold_high   REAL NOT NULL DEFAULT 90,
    last_reading_at TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS tank_readings (
    id           TEXT PRIMARY KEY,
    tank_id      TEXT NOT NULL REFERENCES tanks(id),
    volume_l     REAL NOT NULL,
    height_cm    REAL,
    water_level  REAL,
    temperature  REAL,
    source       TEXT NOT NULL DEFAULT 'SENSOR' CHECK(source IN ('SENSOR','MANUAL')),
    read_at      TEXT NOT NULL DEFAULT (datetime('now')),
    created_by   TEXT REFERENCES users(id)
  )`,

  /* ── 6. Stock ── */
  `CREATE TABLE IF NOT EXISTS stock_movements (
    id           TEXT PRIMARY KEY,
    product_id   TEXT NOT NULL REFERENCES products(id),
    tank_id      TEXT REFERENCES tanks(id),
    type         TEXT NOT NULL CHECK(type IN ('OPENING','DELIVERY','SALE','ADJUSTMENT','CLOSING')),
    quantity_l   REAL NOT NULL,
    balance_l    REAL NOT NULL,
    ref_id       TEXT,
    notes        TEXT,
    approved_by  TEXT REFERENCES users(id),
    created_by   TEXT NOT NULL REFERENCES users(id),
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS deliveries (
    id            TEXT PRIMARY KEY,
    date          TEXT NOT NULL,
    supplier      TEXT NOT NULL,
    product_id    TEXT NOT NULL REFERENCES products(id),
    quantity_l    REAL NOT NULL,
    tank_id       TEXT REFERENCES tanks(id),
    doc_number    TEXT,
    delivery_note TEXT,
    status        TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','CONFIRMED','CANCELLED')),
    confirmed_by  TEXT REFERENCES users(id),
    confirmed_at  TEXT,
    created_by    TEXT NOT NULL REFERENCES users(id),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  /* ── 7. Transactions ── */
  `CREATE TABLE IF NOT EXISTS transactions (
    id               TEXT PRIMARY KEY,
    card_id          TEXT NOT NULL REFERENCES cards(id),
    product_id       TEXT NOT NULL REFERENCES products(id),
    nozzle_id        TEXT REFERENCES nozzles(id),
    pump_id          TEXT REFERENCES pumps(id),
    operator_id      TEXT REFERENCES users(id),
    shift            TEXT NOT NULL DEFAULT 'PAGI',
    volume_l         REAL NOT NULL,
    price_per_unit   REAL NOT NULL,
    total_amount     REAL NOT NULL,
    totalizer_before REAL,
    totalizer_after  REAL,
    quota_before     REAL,
    quota_deducted   REAL,
    quota_after      REAL,
    status           TEXT NOT NULL DEFAULT 'SUCCESS' CHECK(status IN ('SUCCESS','FAILED','CANCELLED','VOID','REFUNDED','PENDING')),
    source           TEXT NOT NULL DEFAULT 'MANUAL' CHECK(source IN ('CONTROLLER','MANUAL','API')),
    void_reason      TEXT,
    voided_by        TEXT REFERENCES users(id),
    voided_at        TEXT,
    transaction_time TEXT NOT NULL DEFAULT (datetime('now')),
    synced           INTEGER NOT NULL DEFAULT 1,
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  /* ── 8. Reconciliation ── */
  `CREATE TABLE IF NOT EXISTS reconciliations (
    id                  TEXT PRIMARY KEY,
    product_id          TEXT NOT NULL REFERENCES products(id),
    date                TEXT NOT NULL,
    opening_l           REAL NOT NULL DEFAULT 0,
    delivery_l          REAL NOT NULL DEFAULT 0,
    sales_l             REAL NOT NULL DEFAULT 0,
    adjustment_l        REAL NOT NULL DEFAULT 0,
    theoretical_closing REAL NOT NULL DEFAULT 0,
    actual_closing      REAL NOT NULL DEFAULT 0,
    variance_l          REAL NOT NULL DEFAULT 0,
    variance_pct        REAL NOT NULL DEFAULT 0,
    status              TEXT NOT NULL DEFAULT 'NORMAL' CHECK(status IN ('PERFECT','NORMAL','WARNING','CRITICAL')),
    notes               TEXT,
    created_by          TEXT REFERENCES users(id),
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  /* ── 9. Approvals ── */
  `CREATE TABLE IF NOT EXISTS approvals (
    id           TEXT PRIMARY KEY,
    type         TEXT NOT NULL,
    ref_table    TEXT NOT NULL,
    ref_id       TEXT NOT NULL,
    detail       TEXT,
    status       TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED')),
    requested_by TEXT NOT NULL REFERENCES users(id),
    reviewed_by  TEXT REFERENCES users(id),
    review_note  TEXT,
    requested_at TEXT NOT NULL DEFAULT (datetime('now')),
    reviewed_at  TEXT
  )`,

  /* ── 10. Audit Log ── */
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id         TEXT PRIMARY KEY,
    user_id    TEXT REFERENCES users(id),
    action     TEXT NOT NULL,
    module     TEXT NOT NULL,
    record_id  TEXT,
    before_val TEXT,
    after_val  TEXT,
    reason     TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  /* ── 11. Notifications ── */
  `CREATE TABLE IF NOT EXISTS notifications (
    id         TEXT PRIMARY KEY,
    type       TEXT NOT NULL CHECK(type IN ('CRITICAL','WARNING','INFO')),
    title      TEXT NOT NULL,
    message    TEXT,
    module     TEXT,
    ref_id     TEXT,
    read       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  /* ── 12. System Settings ── */
  `CREATE TABLE IF NOT EXISTS system_settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_by TEXT REFERENCES users(id),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  /* ── Indexes ── */
  `CREATE INDEX IF NOT EXISTS idx_transactions_card    ON transactions(card_id)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_time    ON transactions(transaction_time)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_status  ON transactions(status)`,
  `CREATE INDEX IF NOT EXISTS idx_quota_ledger_card    ON quota_ledger(card_id)`,
  `CREATE INDEX IF NOT EXISTS idx_card_quotas_card     ON card_quotas(card_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_user      ON audit_logs(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_module    ON audit_logs(module)`,
  `CREATE INDEX IF NOT EXISTS idx_tank_readings_tank   ON tank_readings(tank_id)`,
  `CREATE INDEX IF NOT EXISTS idx_stock_movements_prod ON stock_movements(product_id)`,
];

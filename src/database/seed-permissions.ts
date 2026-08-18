import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import {
  Role,
  User,
  Permission,
  RolePermission,
  Unit,
  Product,
  PriceHistory,
  Vehicle,
  Card,
  QuotaPeriod,
  CardQuota,
  QuotaLedger,
  Pump,
  Nozzle,
  Totalizer,
  Tank,
  TankReading,
  StockMovement,
  Delivery,
  Transaction,
  Reconciliation,
  Approval,
  AuditLog,
  Notification,
  SystemSetting,
} from './entities';

dotenv.config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'fuel_monitoring',
  entities: [
    Role,
    User,
    Permission,
    RolePermission,
    Unit,
    Product,
    PriceHistory,
    Vehicle,
    Card,
    QuotaPeriod,
    CardQuota,
    QuotaLedger,
    Pump,
    Nozzle,
    Totalizer,
    Tank,
    TankReading,
    StockMovement,
    Delivery,
    Transaction,
    Reconciliation,
    Approval,
    AuditLog,
    Notification,
    SystemSetting,
  ],
  synchronize: true,
  charset: 'utf8mb4_unicode_ci',
  timezone: '+07:00',
});

const PERMISSIONS = [
  { id: 'p-dash-view',   code: 'dashboard.view',     module: 'Dashboard',   action: 'view',     description: 'Lihat dashboard & KPI' },
  { id: 'p-trx-view',    code: 'transaction.view',   module: 'Transaksi',   action: 'view',     description: 'Lihat daftar transaksi' },
  { id: 'p-trx-create',  code: 'transaction.create', module: 'Transaksi',   action: 'create',   description: 'Input transaksi BBM manual' },
  { id: 'p-trx-void',    code: 'transaction.void',   module: 'Transaksi',   action: 'void',     description: 'Void / batalkan transaksi' },
  { id: 'p-crd-view',    code: 'card.view',          module: 'Kartu',       action: 'view',     description: 'Lihat data kartu RFID' },
  { id: 'p-crd-create',  code: 'card.create',        module: 'Kartu',       action: 'create',   description: 'Tambah kartu RFID baru' },
  { id: 'p-crd-edit',    code: 'card.edit',          module: 'Kartu',       action: 'edit',     description: 'Edit data kartu RFID' },
  { id: 'p-crd-block',   code: 'card.block',         module: 'Kartu',       action: 'block',    description: 'Blokir / unblock kartu' },
  { id: 'p-qta-view',    code: 'quota.view',         module: 'Kuota',       action: 'view',     description: 'Lihat kuota per unit / kartu' },
  { id: 'p-qta-gen',     code: 'quota.generate',     module: 'Kuota',       action: 'generate', description: 'Generate alokasi kuota bulanan' },
  { id: 'p-qta-topup',   code: 'quota.topup',        module: 'Kuota',       action: 'topup',    description: 'Top-up kuota darurat' },
  { id: 'p-qta-appv',    code: 'quota.approve',      module: 'Kuota',       action: 'approve',  description: 'Persetujuan kuota & penyesuaian' },
  { id: 'p-stk-view',    code: 'stock.view',         module: 'Stok',        action: 'view',     description: 'Lihat stok, tangki, & mutasi' },
  { id: 'p-stk-adj',     code: 'stock.adjust',       module: 'Stok',        action: 'adjust',   description: 'Penyesuaian stok tangki & penerimaan' },
  { id: 'p-rpt-view',    code: 'report.view',        module: 'Laporan',     action: 'view',     description: 'Lihat & export semua laporan' },
  { id: 'p-aud-view',    code: 'audit.view',         module: 'Audit',       action: 'view',     description: 'Lihat log audit sistem' },
  { id: 'p-usr-manage',  code: 'user.manage',        module: 'User',        action: 'manage',   description: 'Kelola user dan hak akses' },
  { id: 'p-sys-manage',  code: 'system.manage',      module: 'Sistem',      action: 'manage',   description: 'Pengaturan sistem & data master' },
];

const ALL_PERMISSION_CODES = PERMISSIONS.map((p) => p.code);

const ROLE_PERMISSIONS: Record<string, string[]> = {
  'role-admin': ALL_PERMISSION_CODES,
  'role-operator': [
    'dashboard.view', 'transaction.view', 'transaction.create',
    'card.view', 'quota.view', 'stock.view',
  ],
  'role-pengelola': [
    'dashboard.view', 'transaction.view', 'card.view', 'quota.view',
    'quota.generate', 'quota.topup', 'stock.view', 'stock.adjust',
    'report.view',
  ],
  'role-finance': [
    'dashboard.view', 'transaction.view', 'quota.view', 'stock.view',
    'report.view',
  ],
  'role-pimpinan': [
    'dashboard.view', 'transaction.view', 'card.view', 'quota.view',
    'stock.view', 'report.view',
  ],
  'role-auditor': [
    'dashboard.view', 'transaction.view', 'card.view', 'quota.view',
    'stock.view', 'report.view', 'audit.view', 'system.manage',
  ],
};

async function seedPermissions(): Promise<void> {
  console.log('🔒 Seeding permissions via TypeORM (MySQL)...');
  await dataSource.initialize();
  console.log('✓ MySQL DB connected');

  const permRepo = dataSource.getRepository(Permission);
  const rolePermRepo = dataSource.getRepository(RolePermission);

  for (const p of PERMISSIONS) {
    const exists = await permRepo.findOneBy({ id: p.id });
    if (exists) {
      await permRepo.update(p.id, p);
    } else {
      await permRepo.save(permRepo.create(p));
    }
  }
  console.log(`  ✓ ${PERMISSIONS.length} permissions`);

  let count = 0;
  for (const [roleId, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
    for (const code of permCodes) {
      const perm = await permRepo.findOneBy({ code });
      if (perm) {
        const exists = await rolePermRepo.findOneBy({
          roleId,
          permissionId: perm.id,
        });
        if (!exists) {
          await rolePermRepo.save(
            rolePermRepo.create({
              roleId,
              permissionId: perm.id,
            }),
          );
          count++;
        }
      }
    }
  }
  console.log(`  ✓ ${count} role-permission links`);

  console.log('✅ Permissions seeded');
  await dataSource.destroy();
  process.exit(0);
}

seedPermissions().catch((err) => {
  console.error('Seed permissions error:', err);
  process.exit(1);
});

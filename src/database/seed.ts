import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import {
  Role,
  User,
  Unit,
  Product,
  PriceHistory,
  Pump,
  Nozzle,
  Tank,
  QuotaPeriod,
  SystemSetting,
  Permission,
  RolePermission,
  Vehicle,
  Card,
  CardQuota,
  QuotaLedger,
  Totalizer,
  TankReading,
  StockMovement,
  Delivery,
  Transaction,
  Reconciliation,
  Approval,
  AuditLog,
  Notification,
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

async function seed(): Promise<void> {
  console.log('🌱 Seeding database via TypeORM (MySQL)...');
  await dataSource.initialize();
  console.log('✓ MySQL DB connected');

  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const unitRepo = dataSource.getRepository(Unit);
  const prodRepo = dataSource.getRepository(Product);
  const priceRepo = dataSource.getRepository(PriceHistory);
  const pumpRepo = dataSource.getRepository(Pump);
  const nozzleRepo = dataSource.getRepository(Nozzle);
  const tankRepo = dataSource.getRepository(Tank);
  const periodRepo = dataSource.getRepository(QuotaPeriod);
  const settingRepo = dataSource.getRepository(SystemSetting);
  const vehRepo = dataSource.getRepository(Vehicle);
  const cardRepo = dataSource.getRepository(Card);

  // ── Roles ──
  const roles = [
    { id: 'role-superadmin', name: 'Super Administrator', description: 'Full system access' },
    { id: 'role-admin',      name: 'Administrator SPBP',  description: 'Operational admin' },
    { id: 'role-operator',   name: 'Operator',            description: 'Dispensing operator' },
    { id: 'role-pengelola',  name: 'Pengelola BBM',       description: 'Stock & inventory manager' },
    { id: 'role-finance',    name: 'Finance',             description: 'Financial reports' },
    { id: 'role-pimpinan',   name: 'Pimpinan',            description: 'Executive read-only' },
    { id: 'role-auditor',    name: 'Auditor',             description: 'Audit read-only' },
  ];
  for (const r of roles) {
    const exists = await roleRepo.findOneBy({ id: r.id });
    if (!exists) {
      await roleRepo.save(roleRepo.create(r));
    }
  }
  console.log('  ✓ Roles');

  // ── Users ──
  const pw = await bcrypt.hash('Admin@2026', 10);
  const users = [
    { id: 'usr-admin01',  name: 'Ahmad Fauzi',    username: 'ADMIN01',    email: 'admin01@spbp.polri.go.id',    roleId: 'role-admin' },
    { id: 'usr-super01',  name: 'System Admin',   username: 'SUPERADMIN', email: 'super@spbp.polri.go.id',      roleId: 'role-superadmin' },
    { id: 'usr-op01',     name: 'Budi Santoso',   username: 'OPERATOR01', email: 'operator01@spbp.polri.go.id', roleId: 'role-operator' },
    { id: 'usr-op02',     name: 'Sari Dewi',      username: 'OPERATOR02', email: 'operator02@spbp.polri.go.id', roleId: 'role-operator' },
    { id: 'usr-pengelola', name: 'Candra Wijaya', username: 'PENGELOLA01',email: 'pengelola@spbp.polri.go.id',  roleId: 'role-pengelola' },
  ];
  for (const u of users) {
    const exists = await userRepo.findOneBy({ id: u.id });
    if (!exists) {
      await userRepo.save(userRepo.create({ ...u, password: pw, status: 'ACTIVE' }));
    }
  }
  console.log('  ✓ Users (default password: Admin@2026)');

  // ── Units ──
  const units = [
    { id: 'unit-ditres',  code: 'DITRES',  name: 'DITRESKRIMSUS',   defaultAllocL: 250 },
    { id: 'unit-brimob',  code: 'BRIMOB',  name: 'BRIMOB',          defaultAllocL: 300 },
    { id: 'unit-lantas',  code: 'LANTAS',  name: 'DITLANTAS',       defaultAllocL: 200 },
    { id: 'unit-samapta', code: 'SAMAPTA', name: 'SAMAPTA',         defaultAllocL: 200 },
    { id: 'unit-intel',   code: 'INTEL',   name: 'INTELKAM',        defaultAllocL: 150 },
    { id: 'unit-krimum',  code: 'KRIMUM',  name: 'DITRESKRIMUM',    defaultAllocL: 200 },
    { id: 'unit-polres',  code: 'POLRES',  name: 'POLRES MANOKWARI', defaultAllocL: 150 },
  ];
  for (const u of units) {
    const exists = await unitRepo.findOneBy({ id: u.id });
    if (!exists) {
      await unitRepo.save(unitRepo.create(u));
    }
  }
  console.log('  ✓ Units');

  // ── Products & Prices ──
  const products = [
    { id: 'prod-ptx',  code: 'PTX',   name: 'Pertamax',       type: 'Bensin' as const, price: 12300 },
    { id: 'prod-plt',  code: 'PLT',   name: 'Pertalite',      type: 'Bensin' as const, price: 9700  },
    { id: 'prod-ptxt', code: 'PTXT',  name: 'Pertamax Turbo', type: 'Bensin' as const, price: 14000 },
    { id: 'prod-dxl',  code: 'DXL',   name: 'Dexlite',        type: 'Solar' as const,  price: 13740 },
    { id: 'prod-pdex', code: 'PDEX',  name: 'Pertamina DEX',  type: 'Solar' as const,  price: 15400 },
  ];
  for (const p of products) {
    const exists = await prodRepo.findOneBy({ id: p.id });
    if (!exists) {
      await prodRepo.save(prodRepo.create({ id: p.id, code: p.code, name: p.name, type: p.type }));
    }
    const priceExists = await priceRepo.findOneBy({ productId: p.id });
    if (!priceExists) {
      await priceRepo.save(
        priceRepo.create({
          id: uuid(),
          productId: p.id,
          pricePerUnit: p.price,
          effectiveDate: '2026-08-01',
          createdBy: 'usr-admin01',
        }),
      );
    }
  }
  console.log('  ✓ Products & Prices');

  // ── Pumps & Nozzles ──
  const pumps = [
    { id: 'pump-01', number: '01', location: 'Area A' },
    { id: 'pump-02', number: '02', location: 'Area A' },
    { id: 'pump-03', number: '03', location: 'Area B' },
  ];
  for (const p of pumps) {
    const exists = await pumpRepo.findOneBy({ id: p.id });
    if (!exists) {
      await pumpRepo.save(pumpRepo.create(p));
    }
  }

  const nozzles = [
    { id: 'nzl-01-1', number: '01', pumpId: 'pump-01', productId: 'prod-plt', status: 'ACTIVE' as const },
    { id: 'nzl-01-2', number: '02', pumpId: 'pump-01', productId: 'prod-ptx', status: 'ACTIVE' as const },
    { id: 'nzl-02-1', number: '01', pumpId: 'pump-02', productId: 'prod-plt', status: 'ACTIVE' as const },
    { id: 'nzl-02-2', number: '02', pumpId: 'pump-02', productId: 'prod-ptx', status: 'ACTIVE' as const },
    { id: 'nzl-02-3', number: '03', pumpId: 'pump-02', productId: 'prod-dxl', status: 'ACTIVE' as const },
    { id: 'nzl-03-1', number: '01', pumpId: 'pump-03', productId: 'prod-ptxt', status: 'OFFLINE' as const },
    { id: 'nzl-03-2', number: '02', pumpId: 'pump-03', productId: 'prod-pdex', status: 'OFFLINE' as const },
  ];
  for (const n of nozzles) {
    const exists = await nozzleRepo.findOneBy({ id: n.id });
    if (!exists) {
      await nozzleRepo.save(nozzleRepo.create(n));
    }
  }
  console.log('  ✓ Pumps & Nozzles');

  // ── Tanks ──
  const tanks = [
    { id: 'tank-01', productId: 'prod-ptx',  capacityL: 16000, currentL: 12480, oilColor: 'blue' as const,   waterColor: 'blue' as const,   active: 1, idPort: 1, idPolling: 1, idTankEnabler: 1 },
    { id: 'tank-02', productId: 'prod-plt',  capacityL: 16000, currentL: 4480,  oilColor: 'green' as const,  waterColor: 'blue' as const,   active: 1, idPort: 1, idPolling: 2, idTankEnabler: 2 },
    { id: 'tank-03', productId: 'prod-dxl',  capacityL: 8000,  currentL: 4320,  oilColor: 'red' as const,    waterColor: 'yellow' as const, active: 1, idPort: 2, idPolling: 1, idTankEnabler: 3 },
    { id: 'tank-04', productId: 'prod-ptxt', capacityL: 4000,  currentL: 480,   oilColor: 'yellow' as const, waterColor: 'blue' as const,   active: 1, idPort: 2, idPolling: 2, idTankEnabler: 4 },
    { id: 'tank-05', productId: 'prod-pdex', capacityL: 4000,  currentL: 2480,  oilColor: 'green' as const,  waterColor: 'yellow' as const, active: 1, idPort: 3, idPolling: 1, idTankEnabler: 5 },
  ];
  for (const t of tanks) {
    const exists = await tankRepo.findOneBy({ id: t.id });
    if (!exists) {
      const pct = (t.currentL / t.capacityL) * 100;
      const status = pct <= 15 ? 'CRITICAL' : pct <= 30 ? 'LOW' : 'NORMAL';
      await tankRepo.save(tankRepo.create({ ...t, status: status as any }));
    }
  }
  console.log('  ✓ Tanks');

  // ── Quota Period ──
  const periodExists = await periodRepo.findOneBy({ id: 'period-aug-2026' });
  if (!periodExists) {
    await periodRepo.save(
      periodRepo.create({
        id: 'period-aug-2026',
        period: 'August 2026',
        year: 2026,
        month: 8,
        status: 'ACTIVE',
      }),
    );
  }
  console.log('  ✓ Quota Period');

  // ── Vehicles ──
  const vehicles = [
    { id: 'veh-01', policeNumber: 'PB 1234 XX', type: 'Sedan', brand: 'Toyota', model: 'Corolla Altis', year: 2023, unitId: 'unit-ditres', productId: 'prod-ptx', fuelType: 'Pertamax', notes: 'Mobil Dinas Ditreskrimsus' },
    { id: 'veh-02', policeNumber: 'PB 5678 YY', type: 'SUV', brand: 'Mitsubishi', model: 'Pajero Sport', year: 2024, unitId: 'unit-brimob', productId: 'prod-dxl', fuelType: 'Dexlite', notes: 'Kendaraan Taktis Brimob' },
    { id: 'veh-03', policeNumber: 'PB 9012 ZZ', type: 'Patroli', brand: 'Mazda', model: 'Mazda 6 Patrol', year: 2022, unitId: 'unit-lantas', productId: 'prod-ptx', fuelType: 'Pertamax', notes: 'Patroli Ditlantas' },
  ];
  for (const v of vehicles) {
    const exists = await vehRepo.findOneBy({ id: v.id });
    if (!exists) {
      await vehRepo.save(vehRepo.create(v));
    }
  }
  console.log('  ✓ Vehicles');

  // ── Cards ──
  const cards = [
    { id: 'crd-01', cardNumber: 'CRD-2026-001', cardType: 'REGULER' as const, holderName: 'Bripka Joko Susilo', unitId: 'unit-ditres', vehicleId: 'veh-01', fuelType: 'Pertamax', monthlyLimit: 250, rfidUid: 'E28068940001', status: 'ACTIVE' as const },
    { id: 'crd-02', cardNumber: 'CRD-2026-002', cardType: 'KHUSUS' as const, holderName: 'Iptu Bambang S', unitId: 'unit-brimob', vehicleId: 'veh-02', fuelType: 'Dexlite', monthlyLimit: 300, rfidUid: 'E28068940002', status: 'ACTIVE' as const },
    { id: 'crd-03', cardNumber: 'CRD-2026-003', cardType: 'REGULER' as const, holderName: 'Bripda Agus H', unitId: 'unit-lantas', vehicleId: 'veh-03', fuelType: 'Pertamax', monthlyLimit: 200, rfidUid: 'E28068940003', status: 'ACTIVE' as const },
  ];
  for (const c of cards) {
    const exists = await cardRepo.findOneBy({ id: c.id });
    if (!exists) {
      await cardRepo.save(cardRepo.create(c));
    }
  }
  console.log('  ✓ Cards');

  // ── System Settings ──
  const settings: [string, string][] = [
    ['org_name',            'SPBP Polda Papua Barat'],
    ['org_location',        'Manokwari, Papua Barat'],
    ['timezone',            'Asia/Jakarta'],
    ['currency',            'IDR'],
    ['volume_unit',         'Liter'],
    ['quota_policy',        'expire'],
    ['quota_overflow',      'reject'],
    ['variance_normal',     '0.5'],
    ['variance_warning',    '1.0'],
    ['variance_critical',   '2.0'],
    ['stock_low_pct',       '30'],
    ['stock_critical_pct',  '15'],
    ['stock_high_pct',      '90'],
    ['anomaly_max_vol',     '100'],
    ['anomaly_max_freq',    '3'],
    ['anomaly_quota_pct',   '80'],
  ];
  for (const [k, v] of settings) {
    const exists = await settingRepo.findOneBy({ key: k });
    if (!exists) {
      await settingRepo.save(settingRepo.create({ key: k, value: v, updatedBy: 'usr-admin01' }));
    }
  }
  console.log('  ✓ System Settings');

  console.log('\n✅ Database seeded successfully!');
  console.log('   Default login: ADMIN01 / Admin@2026');
  await dataSource.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

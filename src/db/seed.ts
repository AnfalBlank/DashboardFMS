import { db, testConnection } from './client';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

async function seed(): Promise<void> {
  console.log('🌱 Seeding database...');
  await testConnection();

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
    await db.execute({ sql: `INSERT OR IGNORE INTO roles(id,name,description) VALUES(?,?,?)`, args: [r.id, r.name, r.description] });
  }
  console.log('  ✓ Roles');

  // ── Users ──
  const pw = await bcrypt.hash('Admin@2026', 10);
  const users = [
    { id: 'usr-admin01',  name: 'Ahmad Fauzi',    username: 'ADMIN01',    email: 'admin01@spbp.polri.go.id',    role_id: 'role-admin' },
    { id: 'usr-super01',  name: 'System Admin',   username: 'SUPERADMIN', email: 'super@spbp.polri.go.id',      role_id: 'role-superadmin' },
    { id: 'usr-op01',     name: 'Budi Santoso',   username: 'OPERATOR01', email: 'operator01@spbp.polri.go.id', role_id: 'role-operator' },
    { id: 'usr-op02',     name: 'Sari Dewi',      username: 'OPERATOR02', email: 'operator02@spbp.polri.go.id', role_id: 'role-operator' },
    { id: 'usr-pengelola', name: 'Candra Wijaya', username: 'PENGELOLA01',email: 'pengelola@spbp.polri.go.id',  role_id: 'role-pengelola' },
  ];
  for (const u of users) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO users(id,name,username,email,password,role_id) VALUES(?,?,?,?,?,?)`,
      args: [u.id, u.name, u.username, u.email, pw, u.role_id],
    });
  }
  console.log('  ✓ Users (default password: Admin@2026)');

  // ── Units ──
  const units = [
    { id: 'unit-ditres',  code: 'DITRES',  name: 'DITRESKRIMSUS',   alloc: 250 },
    { id: 'unit-brimob',  code: 'BRIMOB',  name: 'BRIMOB',          alloc: 300 },
    { id: 'unit-lantas',  code: 'LANTAS',  name: 'DITLANTAS',       alloc: 200 },
    { id: 'unit-samapta', code: 'SAMAPTA', name: 'SAMAPTA',         alloc: 200 },
    { id: 'unit-intel',   code: 'INTEL',   name: 'INTELKAM',        alloc: 150 },
    { id: 'unit-krimum',  code: 'KRIMUM',  name: 'DITRESKRIMUM',    alloc: 200 },
    { id: 'unit-polres',  code: 'POLRES',  name: 'POLRES MANOKWARI', alloc: 150 },
  ];
  for (const u of units) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO units(id,code,name,default_alloc_l) VALUES(?,?,?,?)`,
      args: [u.id, u.code, u.name, u.alloc],
    });
  }
  console.log('  ✓ Units');

  // ── Products ──
  const products = [
    { id: 'prod-ptx',  code: 'PTX',   name: 'Pertamax',       type: 'Bensin', price: 12300 },
    { id: 'prod-plt',  code: 'PLT',   name: 'Pertalite',      type: 'Bensin', price: 9700  },
    { id: 'prod-ptxt', code: 'PTXT',  name: 'Pertamax Turbo', type: 'Bensin', price: 14000 },
    { id: 'prod-dxl',  code: 'DXL',   name: 'Dexlite',        type: 'Solar',  price: 13740 },
    { id: 'prod-pdex', code: 'PDEX',  name: 'Pertamina DEX',  type: 'Solar',  price: 15400 },
  ];
  for (const p of products) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO products(id,code,name,type) VALUES(?,?,?,?)`,
      args: [p.id, p.code, p.name, p.type],
    });
    // Seed current price
    await db.execute({
      sql: `INSERT OR IGNORE INTO price_histories(id,product_id,price_per_unit,effective_date,created_by) VALUES(?,?,?,?,?)`,
      args: [uuid(), p.id, p.price, '2026-08-01', 'usr-admin01'],
    });
  }
  console.log('  ✓ Products & Prices');

  // ── Pumps & Nozzles ──
  const pumps = [
    { id: 'pump-01', number: '01', location: 'Area A' },
    { id: 'pump-02', number: '02', location: 'Area A' },
    { id: 'pump-03', number: '03', location: 'Area B' },
  ];
  for (const p of pumps) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO pumps(id,number,location) VALUES(?,?,?)`,
      args: [p.id, p.number, p.location],
    });
  }
  const nozzles = [
    { id: 'nzl-01-1', number:'01', pump_id:'pump-01', product_id:'prod-plt'  },
    { id: 'nzl-01-2', number:'02', pump_id:'pump-01', product_id:'prod-ptx'  },
    { id: 'nzl-02-1', number:'01', pump_id:'pump-02', product_id:'prod-plt'  },
    { id: 'nzl-02-2', number:'02', pump_id:'pump-02', product_id:'prod-ptx'  },
    { id: 'nzl-02-3', number:'03', pump_id:'pump-02', product_id:'prod-dxl'  },
    { id: 'nzl-03-1', number:'01', pump_id:'pump-03', product_id:'prod-ptxt', status:'OFFLINE' },
    { id: 'nzl-03-2', number:'02', pump_id:'pump-03', product_id:'prod-pdex', status:'OFFLINE' },
  ];
  for (const n of nozzles) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO nozzles(id,number,pump_id,product_id,status) VALUES(?,?,?,?,?)`,
      args: [n.id, n.number, n.pump_id, n.product_id, (n as any).status || 'ACTIVE'],
    });
  }
  console.log('  ✓ Pumps & Nozzles');

  // ── Tanks ──
  const tanks = [
    { id: 'tank-01', product_id:'prod-ptx',  capacity: 16000, current: 12480 },
    { id: 'tank-02', product_id:'prod-plt',  capacity: 16000, current: 4480  },
    { id: 'tank-03', product_id:'prod-dxl',  capacity: 8000,  current: 4320  },
    { id: 'tank-04', product_id:'prod-ptxt', capacity: 4000,  current: 480   },
    { id: 'tank-05', product_id:'prod-pdex', capacity: 4000,  current: 2480  },
  ];
  for (const t of tanks) {
    const pct = (t.current / t.capacity) * 100;
    const status = pct <= 15 ? 'CRITICAL' : pct <= 30 ? 'LOW' : 'NORMAL';
    await db.execute({
      sql: `INSERT OR IGNORE INTO tanks(id,product_id,capacity_l,current_l,status) VALUES(?,?,?,?,?)`,
      args: [t.id, t.product_id, t.capacity, t.current, status],
    });
  }
  console.log('  ✓ Tanks');

  // ── Quota Period ──
  await db.execute({
    sql: `INSERT OR IGNORE INTO quota_periods(id,period,year,month,status) VALUES(?,?,?,?,?)`,
    args: ['period-aug-2026', 'August 2026', 2026, 8, 'ACTIVE'],
  });
  console.log('  ✓ Quota Period');

  // ── System Settings ──
  const settings = [
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
    await db.execute({
      sql: `INSERT OR IGNORE INTO system_settings(key,value,updated_by) VALUES(?,?,?)`,
      args: [k, v, 'usr-admin01'],
    });
  }
  console.log('  ✓ System Settings');

  console.log('\n✅ Database seeded successfully!');
  console.log('   Default login: ADMIN01 / Admin@2026');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

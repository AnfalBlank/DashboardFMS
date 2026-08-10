import { db, testConnection } from './client';
import { v4 as uuid } from 'uuid';

const allPermissions = [
  { code: 'transaction.view',   module: 'Transaction', action: 'view' },
  { code: 'transaction.create', module: 'Transaction', action: 'create' },
  { code: 'transaction.edit',   module: 'Transaction', action: 'edit' },
  { code: 'transaction.void',   module: 'Transaction', action: 'void' },
  { code: 'card.view',          module: 'Card',        action: 'view' },
  { code: 'card.create',        module: 'Card',        action: 'create' },
  { code: 'card.edit',          module: 'Card',        action: 'edit' },
  { code: 'card.block',         module: 'Card',        action: 'block' },
  { code: 'quota.view',         module: 'Quota',       action: 'view' },
  { code: 'quota.generate',     module: 'Quota',       action: 'generate' },
  { code: 'quota.topup',        module: 'Quota',       action: 'topup' },
  { code: 'quota.approve',      module: 'Quota',       action: 'approve' },
  { code: 'stock.view',         module: 'Stock',       action: 'view' },
  { code: 'stock.adjust',       module: 'Stock',       action: 'adjust' },
  { code: 'stock.approve',      module: 'Stock',       action: 'approve' },
  { code: 'report.view',        module: 'Report',      action: 'view' },
  { code: 'report.export',      module: 'Report',      action: 'export' },
  { code: 'user.manage',        module: 'User',        action: 'manage' },
  { code: 'system.manage',      module: 'System',      action: 'manage' },
  { code: 'audit.view',         module: 'Audit',       action: 'view' },
];

// Which permissions each role has
const rolePermissions: Record<string, string[]> = {
  'role-superadmin': allPermissions.map(p => p.code),
  'role-admin':      [
    'transaction.view','transaction.create','transaction.edit','transaction.void',
    'card.view','card.create','card.edit','card.block',
    'quota.view','quota.generate','quota.topup','quota.approve',
    'stock.view','stock.adjust','stock.approve',
    'report.view','report.export',
    'user.manage','system.manage','audit.view',
  ],
  'role-operator': [
    'transaction.view','transaction.create',
    'card.view',
    'quota.view',
    'stock.view',
  ],
  'role-pengelola': [
    'transaction.view',
    'stock.view','stock.adjust','stock.approve',
    'report.view',
  ],
  'role-finance': [
    'transaction.view',
    'report.view','report.export',
  ],
  'role-pimpinan': [
    'transaction.view','card.view','quota.view','stock.view',
    'report.view',
  ],
  'role-auditor': [
    'transaction.view','card.view','quota.view','stock.view',
    'report.view','audit.view',
  ],
};

async function seedPermissions(): Promise<void> {
  console.log('🔒 Seeding permissions...');
  await testConnection();

  // Insert all permission records
  for (const p of allPermissions) {
    const id = uuid();
    await db.execute({
      sql: `INSERT OR IGNORE INTO permissions(id,code,module,action) VALUES(?,?,?,?)`,
      args: [id, p.code, p.module, p.action],
    });
  }
  console.log(`  ✓ ${allPermissions.length} permissions`);

  // Link roles to permissions
  let linked = 0;
  for (const [roleId, codes] of Object.entries(rolePermissions)) {
    for (const code of codes) {
      const permRes = await db.execute({
        sql: `SELECT id FROM permissions WHERE code = ?`,
        args: [code],
      });
      const permId = (permRes.rows[0] as any)?.id;
      if (!permId) { console.warn(`  ⚠ Permission not found: ${code}`); continue; }
      await db.execute({
        sql: `INSERT OR IGNORE INTO role_permissions(role_id,permission_id) VALUES(?,?)`,
        args: [roleId, permId],
      });
      linked++;
    }
  }
  console.log(`  ✓ ${linked} role-permission links`);
  console.log('✅ Permissions seeded');
  process.exit(0);
}

seedPermissions().catch(err => { console.error(err); process.exit(1); });

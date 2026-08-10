'use client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Check, X } from 'lucide-react';

const permissions = [
  'transaction.view', 'transaction.create', 'transaction.edit', 'transaction.void',
  'card.view', 'card.create', 'card.edit', 'card.block',
  'quota.view', 'quota.generate', 'quota.topup', 'quota.approve',
  'stock.view', 'stock.adjust', 'stock.approve',
  'report.view', 'report.export',
  'user.manage', 'system.manage', 'audit.view',
];

const roleMatrix: Record<string, string[]> = {
  'Super Admin': permissions,
  'Admin SPBP': ['transaction.view','transaction.void','card.view','card.create','card.edit','card.block','quota.view','quota.generate','quota.topup','quota.approve','stock.view','report.view','report.export','audit.view'],
  'Operator': ['transaction.view','transaction.create','card.view','quota.view','stock.view'],
  'Pengelola BBM': ['stock.view','stock.adjust','stock.approve','transaction.view','report.view'],
  'Finance': ['transaction.view','report.view','report.export'],
  'Pimpinan': ['transaction.view','card.view','quota.view','stock.view','report.view'],
  'Auditor': ['transaction.view','card.view','quota.view','stock.view','report.view','audit.view'],
};

const roleNames = Object.keys(roleMatrix);

export default function RolesPage() {
  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="Matriks hak akses per role">
        <Button variant="primary" size="sm">+ Role Baru</Button>
      </PageHeader>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th className="min-w-[180px]">Permission</th>
                {roleNames.map(r => (
                  <th key={r} className="text-center min-w-[110px]">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map(perm => {
                const [module, action] = perm.split('.');
                return (
                  <tr key={perm}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral">{module}</Badge>
                        <span className="text-[12px] text-zinc-600">.{action}</span>
                      </div>
                    </td>
                    {roleNames.map(role => (
                      <td key={role} className="text-center">
                        {roleMatrix[role].includes(perm)
                          ? <Check size={14} className="mx-auto text-green-600" />
                          : <X size={14} className="mx-auto text-zinc-200" />
                        }
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

'use client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

const permGroups = [
  { module: 'Transaction', perms: ['transaction.view', 'transaction.create', 'transaction.edit', 'transaction.void'] },
  { module: 'Card', perms: ['card.view', 'card.create', 'card.edit', 'card.block'] },
  { module: 'Quota', perms: ['quota.view', 'quota.generate', 'quota.topup', 'quota.approve'] },
  { module: 'Stock', perms: ['stock.view', 'stock.adjust', 'stock.approve'] },
  { module: 'Report', perms: ['report.view', 'report.export'] },
  { module: 'System', perms: ['user.manage', 'system.manage', 'audit.view'] },
];

export default function PermissionsPage() {
  return (
    <div>
      <PageHeader title="Permissions" subtitle="Daftar permission granular yang tersedia dalam sistem">
        <Button variant="primary" size="sm">+ Permission Baru</Button>
      </PageHeader>
      <div className="grid grid-cols-3 gap-4">
        {permGroups.map(g => (
          <Card key={g.module}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold">{g.module}</h3>
              <Badge variant="neutral">{g.perms.length} permissions</Badge>
            </div>
            <div className="space-y-2">
              {g.perms.map(p => {
                const [, action] = p.split('.');
                return (
                  <div key={p} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      <span className="font-mono text-[12px] text-zinc-700">{p}</span>
                    </div>
                    <Badge variant="neutral">{action}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

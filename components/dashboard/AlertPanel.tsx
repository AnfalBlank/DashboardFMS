'use client';
import { alerts } from '@/lib/data';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function AlertPanel() {
  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-[13px] font-semibold text-zinc-900">Alert Center</h3>
          <Badge variant="critical">
            {alerts.filter(a => a.severity === 'CRITICAL').length} kritis
          </Badge>
          <Badge variant="warning">
            {alerts.filter(a => a.severity === 'WARNING').length} warning
          </Badge>
        </div>
        <Link href="/system/audit">
          <Button variant="outline" size="sm">Lihat Semua</Button>
        </Link>
      </div>
      <div>
        {alerts.map(a => (
          <div key={a.id} className="flex gap-3 px-5 py-3.5 border-b border-zinc-50 hover:bg-zinc-50 transition last:border-0">
            <div className="pt-0.5 flex-shrink-0">
              <span className={`inline-block w-2 h-2 rounded-full mt-1
                ${a.severity === 'CRITICAL' ? 'bg-red-500' :
                  a.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-zinc-900">{a.title}</p>
              <p className="text-[12px] text-zinc-400 mt-0.5 leading-snug">{a.desc}</p>
            </div>
            <span className="text-[11px] text-zinc-300 flex-shrink-0 pt-0.5">{a.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

'use client';
import { units } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { clsx } from 'clsx';

export default function UnitsPage() {
  return (
    <div>
      <PageHeader title="Units / Satker" subtitle="Kelola struktur organisasi unit dan satuan kerja">
        <Button variant="primary" size="sm">+ Unit Baru</Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {units.map(u => {
          const util = Math.round((u.used / u.quota) * 100);
          return (
            <Card key={u.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-mono">{u.code}</span>
                    <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
                  </div>
                  <h3 className="text-[15px] font-semibold text-zinc-900">{u.name}</h3>
                  <p className="text-[12px] text-zinc-400 mt-0.5">{u.commander}</p>
                </div>
                <button className="text-[12px] text-zinc-400 hover:text-zinc-700 px-3 py-1.5 hover:bg-zinc-100 rounded-lg transition">Edit</button>
              </div>

              <div className="w-full bg-zinc-100 rounded-full h-1.5 mb-3 overflow-hidden">
                <div className={clsx('h-full rounded-full', util >= 90 ? 'bg-red-500' : util >= 75 ? 'bg-amber-400' : 'bg-emerald-500')}
                  style={{ width: `${util}%` }} />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { l: 'Kartu', v: u.cards },
                  { l: 'Kendaraan', v: u.vehicles },
                  { l: 'Kuota', v: `${(u.quota / 1000).toFixed(1)}KL` },
                  { l: 'Utilisasi', v: `${util}%` },
                ].map(s => (
                  <div key={s.l} className="bg-zinc-50 rounded-xl py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">{s.l}</p>
                    <p className="text-[14px] font-semibold text-zinc-900">{s.v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between text-[12px] text-zinc-500">
                <span>Alokasi default: <span className="font-semibold text-zinc-800">{u.defaultAllocation} L/kartu</span></span>
                <span>Terpakai: <span className="font-semibold text-zinc-800">{u.used.toLocaleString('id-ID')} L</span></span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

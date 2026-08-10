'use client';
import { tanks } from '@/lib/data';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { clsx } from 'clsx';

const barColor = (status: string) => {
  if (status === 'CRITICAL') return 'bg-red-500';
  if (status === 'LOW') return 'bg-amber-400';
  if (status === 'HIGH') return 'bg-blue-500';
  return 'bg-emerald-500';
};

export function TankStrip() {
  return (
    <div className="grid grid-cols-5 gap-3 mb-5">
      {tanks.map(t => {
        const pct = Math.round((t.current / t.capacity) * 100);
        return (
          <div key={t.id} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] font-semibold tracking-[0.5px] uppercase text-zinc-400 mb-3">{t.product}</p>
            <div className="bg-zinc-100 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className={clsx('h-full rounded-full transition-all', barColor(t.status))}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-[17px] font-light text-zinc-900">{t.current.toLocaleString('id-ID')} L</span>
              <span className={clsx('text-[12px] font-semibold',
                t.status === 'CRITICAL' ? 'text-red-600' :
                t.status === 'LOW' ? 'text-amber-600' : 'text-emerald-600'
              )}>{pct}%</span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-2">Kap: {t.capacity.toLocaleString('id-ID')} L</p>
            <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
          </div>
        );
      })}
    </div>
  );
}

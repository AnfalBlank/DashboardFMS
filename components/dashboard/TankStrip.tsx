'use client';
import { useEffect, useState } from 'react';
import { api, Tank } from '@/lib/api';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { clsx } from 'clsx';

const barColor = (status: string) => {
  if (status === 'CRITICAL') return 'bg-red-500';
  if (status === 'LOW') return 'bg-amber-400';
  if (status === 'HIGH') return 'bg-blue-500';
  return 'bg-emerald-500';
};

interface TankStripProps {
  tanks?: Tank[];
}

export function TankStrip({ tanks: propTanks }: TankStripProps) {
  const [data, setData] = useState<Tank[]>(propTanks ?? []);

  useEffect(() => {
    if (propTanks && propTanks.length > 0) {
      setData(propTanks);
      return;
    }
    api.tanks.list()
      .then(res => {
        if (res?.data) setData(res.data);
      })
      .catch(() => {});
  }, [propTanks]);

  if (data.length === 0) {
    return (
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-xl border border-zinc-200 p-4 h-32 animate-pulse">
            <div className="h-2 bg-zinc-100 rounded mb-3" />
            <div className="h-1.5 bg-zinc-100 rounded-full mb-3" />
            <div className="h-5 bg-zinc-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-3 mb-5">
      {data.map(t => {
        const capacity = t.capacity_l ?? t.capacity ?? 1;
        const current = t.current_l ?? t.current ?? 0;
        const pct = Math.min(100, Math.round((current / capacity) * 100));
        const prodName = t.product_name ?? t.product ?? t.code ?? t.id;
        return (
          <div key={t.id} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] font-semibold tracking-[0.5px] uppercase text-zinc-400 mb-3 truncate">{prodName}</p>
            <div className="bg-zinc-100 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className={clsx('h-full rounded-full transition-all duration-500', barColor(t.status))}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-[17px] font-light text-zinc-900">{current.toLocaleString('id-ID')} L</span>
              <span className={clsx('text-[12px] font-semibold',
                t.status === 'CRITICAL' ? 'text-red-600' :
                t.status === 'LOW' ? 'text-amber-600' : 'text-emerald-600'
              )}>{pct}%</span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-2">Kap: {capacity.toLocaleString('id-ID')} L</p>
            <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
          </div>
        );
      })}
    </div>
  );
}

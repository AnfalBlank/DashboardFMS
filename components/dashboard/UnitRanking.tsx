'use client';
import { units } from '@/lib/data';
import { Card } from '@/components/ui/Card';

export function UnitRanking() {
  const sorted = [...units].sort((a, b) => b.used - a.used);
  const max = sorted[0].used;

  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-zinc-900">Penggunaan per Unit</h3>
        <span className="text-[12px] text-zinc-400">Total: {(48240).toLocaleString('id-ID')} L</span>
      </div>
      <div className="py-2">
        {sorted.map((u, i) => {
          const pct = (u.used / max) * 100;
          return (
            <div key={u.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-50 transition">
              <span className="text-[12px] font-semibold text-zinc-300 w-5 text-center flex-shrink-0">{i + 1}</span>
              <span className="text-[13px] font-medium text-zinc-800 w-36 flex-shrink-0 truncate">{u.name}</span>
              <div className="flex-1 bg-zinc-100 rounded-full h-1.5">
                <div className="h-full rounded-full bg-zinc-900 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[12.5px] font-semibold text-zinc-800 w-20 text-right flex-shrink-0">
                {u.used.toLocaleString('id-ID')} L
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

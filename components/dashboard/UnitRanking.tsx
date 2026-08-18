'use client';
import { useEffect, useState } from 'react';
import { api, Unit, UsageReport } from '@/lib/api';
import { Card } from '@/components/ui/Card';

interface UnitRankingItem {
  id: string;
  name: string;
  used: number;
}

export function UnitRanking({ data: propData }: { data?: UnitRankingItem[] }) {
  const [units, setUnits] = useState<UnitRankingItem[]>(propData ?? []);
  const [loading, setLoading] = useState(!propData);

  useEffect(() => {
    if (propData && propData.length > 0) {
      setUnits(propData);
      return;
    }
    setLoading(true);
    // Try fetching usage report first, fallback to master units
    api.reports.usage()
      .then(res => {
        if (res?.data?.by_unit && res.data.by_unit.length > 0) {
          const mapped = res.data.by_unit.map(u => ({
            id: u.id,
            name: u.name,
            used: u.total_l ?? 0,
          }));
          setUnits(mapped);
        } else {
          return api.master.units().then(uRes => {
            if (uRes?.data) {
              setUnits(uRes.data.map(u => ({
                id: u.id,
                name: u.name,
                used: u.used ?? 0,
              })));
            }
          });
        }
      })
      .catch(() => {
        api.master.units()
          .then(uRes => {
            if (uRes?.data) {
              setUnits(uRes.data.map(u => ({
                id: u.id,
                name: u.name,
                used: u.used ?? 0,
              })));
            }
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [propData]);

  const sorted = [...units].sort((a, b) => b.used - a.used);
  const totalUsed = sorted.reduce((sum, u) => sum + u.used, 0);
  const max = Math.max(1, sorted[0]?.used ?? 1);

  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-zinc-900">Penggunaan per Unit</h3>
        <span className="text-[12px] text-zinc-400">Total: {totalUsed.toLocaleString('id-ID')} L</span>
      </div>
      <div className="py-2">
        {loading && sorted.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-zinc-400">Memuat data unit…</div>
        ) : sorted.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-zinc-400">Belum ada data unit</div>
        ) : (
          sorted.map((u, i) => {
            const pct = totalUsed > 0 ? Math.round((u.used / max) * 100) : 0;
            return (
              <div key={u.id || u.name} className="flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-50 transition">
                <span className="text-[12px] font-semibold text-zinc-300 w-5 text-center flex-shrink-0">{i + 1}</span>
                <span className="text-[13px] font-medium text-zinc-800 w-36 flex-shrink-0 truncate">{u.name}</span>
                <div className="flex-1 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-zinc-900 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[12.5px] font-semibold text-zinc-800 w-20 text-right flex-shrink-0">
                  {u.used.toLocaleString('id-ID')} L
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

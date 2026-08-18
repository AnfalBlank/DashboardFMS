'use client';
import { useEffect, useState, useCallback } from 'react';
import { api, Pump, Nozzle } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { RefreshCw, ArrowRight } from 'lucide-react';

export default function PumpsPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loading, setLoading] = useState(true);

  const { success } = useToast();
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, nRes] = await Promise.allSettled([
        api.pumps.list(),
        api.pumps.nozzles(),
      ]);
      if (pRes.status === 'fulfilled' && pRes.value?.data) setPumps(pRes.value.data);
      if (nRes.status === 'fulfilled' && nRes.value?.data) setNozzles(nRes.value.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activePumps = pumps.filter(p => p.status === 'ACTIVE' || p.active === 1).length;

  return (
    <div>
      <PageHeader title="Pumps & Dispensers" subtitle="Monitor status pulau pompa dispenser, nozzle, dan totalizer dispensing">
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button variant="primary" size="sm" onClick={() => router.push('/totalizer')}>
          Detail Totalizer →
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Pompa Dispenser" value={`${pumps.length}`} meta={`${activePumps} aktif`} accent="black" />
        <KpiCard eyebrow="Total Nozzle Terpasang" value={`${nozzles.length}`} accent="blue" />
        <KpiCard eyebrow="Nozzle Aktif" value={`${nozzles.filter(n => n.status === 'ACTIVE').length}`} accent="green" />
        <KpiCard eyebrow="Nozzle Offline" value={`${nozzles.filter(n => n.status === 'OFFLINE').length}`} accent="amber" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {loading && pumps.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-zinc-400">Memuat data pompa…</div>
        ) : (
          pumps.map(pump => {
            const pumpNozzles = nozzles.filter(n => n.pump_id === pump.id || n.pump_number === pump.number);
            return (
              <Card key={pump.id} padding={false}>
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-zinc-900">Dispenser {pump.number}</h3>
                    <p className="text-[11.5px] text-zinc-400 mt-0.5">{pump.location || 'Pulau Pompa SPBP'}</p>
                  </div>
                  <Badge variant={statusVariant(pump.status)}>{pump.status}</Badge>
                </div>
                <div className="p-4 space-y-2.5">
                  {pumpNozzles.length === 0 ? (
                    <div className="text-[12px] text-zinc-400 py-3 text-center">Belum ada nozzle terhubung</div>
                  ) : (
                    pumpNozzles.map(n => (
                      <div key={n.id} className="rounded-xl p-3 bg-zinc-50 border border-zinc-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full">
                              N{n.number}
                            </span>
                            <span className="text-[12.5px] font-medium text-zinc-800">{n.product_name || n.product}</span>
                          </div>
                          <Badge variant={statusVariant(n.status)}>{n.status}</Badge>
                        </div>
                        <div className="text-[11.5px] text-zinc-500 flex justify-between">
                          <span>Status Dispenser:</span>
                          <span className="font-medium text-zinc-700">{pump.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-5 py-3 border-t border-zinc-50">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/totalizer')}>
                    Lihat Totalizer <ArrowRight size={12} />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

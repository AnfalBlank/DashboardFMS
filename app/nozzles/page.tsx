'use client';
import { useEffect, useState } from 'react';
import { api, Nozzle } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function NozzlesPage() {
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadNozzles = () => {
    setLoading(true);
    api.pumps.nozzles()
      .then(res => {
        if (res?.data) setNozzles(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNozzles();
  }, []);

  const activeCount = nozzles.filter(n => n.status === 'ACTIVE').length;
  const offlineCount = nozzles.filter(n => n.status === 'OFFLINE').length;

  return (
    <div>
      <PageHeader title="Nozzles & Dispensing Units" subtitle="Master data nozzle dispenser dan produk BBM yang disalurkan">
        <Button variant="outline" size="sm" onClick={loadNozzles}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button variant="primary" size="sm" onClick={() => router.push('/totalizer')}>
          Pencatatan Totalizer →
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Nozzle" value={nozzles.length.toString()} accent="black" />
        <KpiCard eyebrow="Nozzle Aktif" value={activeCount.toString()} accent="green" />
        <KpiCard eyebrow="Nozzle Offline" value={offlineCount.toString()} accent={offlineCount > 0 ? 'amber' : 'green'} />
        <KpiCard eyebrow="Integrasi Hardware" value="CONNECTED" delta="Realtime Telemetry" deltaDir="neutral" accent="blue" />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Nozzle ID</th>
                <th>Pompa Dispenser</th>
                <th>Nomor Nozzle</th>
                <th>Produk BBM</th>
                <th>Lokasi Pulau</th>
                <th>Status Nozzle</th>
              </tr>
            </thead>
            <tbody>
              {loading && nozzles.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-[13px] text-zinc-400">Memuat data nozzle…</td></tr>
              ) : nozzles.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-[13px] text-zinc-400">Belum ada nozzle terdaftar</td></tr>
              ) : (
                nozzles.map(n => (
                  <tr key={n.id}>
                    <td className="font-mono font-medium text-[12px] text-zinc-500">{n.id}</td>
                    <td className="font-semibold text-zinc-800">Pompa {n.pump_number || n.pumpNum || '—'}</td>
                    <td>
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-100 rounded-full font-semibold text-[12px] text-zinc-700">
                        N{n.number}
                      </span>
                    </td>
                    <td><Badge variant="neutral">{n.product_name || n.product}</Badge></td>
                    <td className="text-zinc-500 text-[12px]">{n.location || n.pumpLoc || 'Area Dispenser SPBP'}</td>
                    <td><Badge variant={statusVariant(n.status)}>{n.status}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

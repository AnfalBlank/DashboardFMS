'use client';
import { useState, useEffect } from 'react';
import { api, UsageReport } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function UsageReportPage() {
  const [data, setData] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  const loadData = () => {
    setLoading(true);
    api.reports.usage()
      .then(res => {
        if (res?.data) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalUsage = data?.total_consumption_l ?? data?.by_unit?.reduce((s, u) => s + (u.total_l ?? 0), 0) ?? 0;
  const unitList = data?.by_unit ?? [];
  const prodList = data?.by_product ?? [];

  return (
    <div>
      <PageHeader title="Usage & Consumption Analytics" subtitle="Analitik konsumsi bahan bakar berdasarkan satuan kerja dan jenis BBM">
        <Button variant="outline" size="sm" onClick={() => success('Export Excel', 'File Excel analitik konsumsi siap diunduh.')}>
          <Download size={13} /> Excel
        </Button>
        <Button variant="primary" size="sm" onClick={() => success('Export PDF', 'Laporan analitik siap dicetak.')}>
          <Download size={13} /> PDF
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Konsumsi', value: `${totalUsage.toLocaleString('id-ID')} L` },
          { label: 'Satker Aktif', value: `${unitList.length} Unit` },
          { label: 'Rata-rata Konsumsi / Satker', value: `${unitList.length ? Math.round(totalUsage / unitList.length).toLocaleString('id-ID') : 0} L` },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{k.label}</p>
            <p className="text-[22px] font-light text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* By Unit */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Konsumsi per Satuan Kerja (Unit)</h3>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw size={13} />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="fuel-table">
              <thead>
                <tr>
                  <th>Satker</th>
                  <th>Total Transaksi</th>
                  <th>Total Liter</th>
                </tr>
              </thead>
              <tbody>
                {loading && unitList.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-6 text-zinc-400">Memuat data konsumsi…</td></tr>
                ) : unitList.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-6 text-zinc-400">Belum ada data konsumsi satker</td></tr>
                ) : (
                  unitList.map(u => (
                    <tr key={u.id}>
                      <td className="font-medium text-zinc-900">{u.name}</td>
                      <td>{u.transactions_count ?? '—'}</td>
                      <td className="font-semibold text-zinc-900">{(u.total_l ?? 0).toLocaleString('id-ID')} L</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* By Product */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Konsumsi per Jenis Produk BBM</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="fuel-table">
              <thead>
                <tr>
                  <th>Produk BBM</th>
                  <th>Total Transaksi</th>
                  <th>Total Liter</th>
                </tr>
              </thead>
              <tbody>
                {loading && prodList.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-6 text-zinc-400">Memuat data konsumsi…</td></tr>
                ) : prodList.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-6 text-zinc-400">Belum ada data konsumsi produk</td></tr>
                ) : (
                  prodList.map(p => (
                    <tr key={p.id}>
                      <td className="font-medium text-zinc-900">{p.name}</td>
                      <td>{p.transactions_count ?? '—'}</td>
                      <td className="font-semibold text-zinc-900">{(p.total_l ?? 0).toLocaleString('id-ID')} L</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

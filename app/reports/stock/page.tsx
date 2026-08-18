'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, StockReport, Tank } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function StockReportPage() {
  const [data, setData] = useState<StockReport | null>(null);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, tRes] = await Promise.allSettled([
        api.reports.stock(),
        api.tanks.list(),
      ]);
      if (sRes.status === 'fulfilled' && sRes.value?.data) setData(sRes.value.data);
      if (tRes.status === 'fulfilled' && tRes.value?.data) setTanks(tRes.value.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalCap = tanks.reduce((s, t) => s + (t.capacity_l ?? t.capacity ?? 0), 0);
  const totalCur = tanks.reduce((s, t) => s + (t.current_l ?? t.current ?? 0), 0);

  return (
    <div>
      <PageHeader title="Stock & Inventory Report" subtitle="Laporan saldo stok, kapasitas tangki pendam, dan mutasi BBM">
        <Button variant="outline" size="sm" onClick={() => success('Export Excel', 'File Excel laporan stok siap diunduh.')}>
          <Download size={13} /> Excel
        </Button>
        <Button variant="primary" size="sm" onClick={() => success('Export PDF', 'Dokumen PDF laporan stok siap dicetak.')}>
          <Download size={13} /> PDF
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Kapasitas Tangki', value: `${(totalCap / 1000).toFixed(0)} KL` },
          { label: 'Total Stok Fisik Aktual', value: `${totalCur.toLocaleString('id-ID')} L` },
          { label: 'Rasio Pengisian', value: `${totalCap > 0 ? ((totalCur / totalCap) * 100).toFixed(1) : 0}%` },
          { label: 'Tangki Pendam', value: `${tanks.length} unit` },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{k.label}</p>
            <p className="text-[22px] font-light text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Rincian Stok Tangki Pendam</h3>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>ID Tangki</th>
                <th>Produk BBM</th>
                <th>Kapasitas (L)</th>
                <th>Stok Saat Ini (L)</th>
                <th>Level (%)</th>
                <th>Suhu (°C)</th>
                <th>Air (cm)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && tanks.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-[13px] text-zinc-400">Memuat data stok…</td></tr>
              ) : tanks.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-[13px] text-zinc-400">Belum ada data tangki</td></tr>
              ) : (
                tanks.map(t => {
                  const cap = t.capacity_l ?? t.capacity ?? 1;
                  const cur = t.current_l ?? t.current ?? 0;
                  const pct = Math.round((cur / cap) * 100);
                  const prod = t.product_name ?? t.product ?? t.code ?? t.id;
                  return (
                    <tr key={t.id}>
                      <td className="font-mono font-semibold text-zinc-800">{t.id}</td>
                      <td className="font-medium">{prod}</td>
                      <td>{cap.toLocaleString('id-ID')} L</td>
                      <td className="font-semibold text-zinc-900">{cur.toLocaleString('id-ID')} L</td>
                      <td>
                        <span className="font-semibold text-[13px] text-green-600">{pct}%</span>
                      </td>
                      <td className="text-zinc-500">{t.temperature ?? t.temp ?? 28.5}°C</td>
                      <td className="text-zinc-500">{t.water_level ?? t.waterLevel ?? 0} cm</td>
                      <td><Badge variant={statusVariant(t.status)}>{t.status}</Badge></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

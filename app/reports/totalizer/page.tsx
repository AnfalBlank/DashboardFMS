'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, PumpRecon } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function TotalizerReportPage() {
  const [reconciliations, setReconciliations] = useState<PumpRecon[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  const loadData = useCallback(async (dateStr?: string) => {
    try {
      setLoading(true);
      const pRes = await api.pumps.reconciliation(dateStr);
      if (pRes?.data) {
        setReconciliations(pRes.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(date);
  }, [date, loadData]);

  const totalUsage = reconciliations.reduce((s, r) => s + (r.totalizer_usage ?? 0), 0);
  const totalSales = reconciliations.reduce((s, r) => s + (r.system_sales ?? 0), 0);
  const totalVariance = reconciliations.reduce((s, r) => s + (r.variance_l ?? 0), 0);

  return (
    <div>
      <PageHeader title="Totalizer Dispenser Audit Report" subtitle="Laporan rekonsiliasi flow meter totalizer pompa vs transaksi digital sistem">
        <Button variant="outline" size="sm" onClick={() => success('Export Excel', 'File Excel laporan totalizer siap diunduh.')}>
          <Download size={13} /> Excel
        </Button>
        <Button variant="primary" size="sm" onClick={() => success('Export PDF', 'Dokumen PDF laporan totalizer siap dicetak.')}>
          <Download size={13} /> PDF
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">Totalizer Usage</p>
          <p className="text-[22px] font-light text-zinc-900">{totalUsage.toLocaleString('id-ID')} L</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">Transaksi Sistem</p>
          <p className="text-[22px] font-light text-zinc-900">{totalSales.toLocaleString('id-ID')} L</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">Total Variance</p>
          <p className={`text-[22px] font-light ${Math.abs(totalVariance) > 5 ? 'text-amber-600' : 'text-green-600'}`}>
            {totalVariance > 0 ? `+${totalVariance}` : totalVariance} L
          </p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">Nozzle Audit</p>
          <p className="text-[22px] font-light text-zinc-900">{reconciliations.length} Unit</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-zinc-200">
        <span className="text-[13px] font-medium text-zinc-700">Tanggal Audit:</span>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
        />
        <Button variant="outline" size="sm" onClick={() => loadData(date)} className="ml-auto">
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Nozzle ID</th>
                <th>Pompa</th>
                <th>Nomor Nozzle</th>
                <th>Produk</th>
                <th>Totalizer Usage (L)</th>
                <th>System Sales (L)</th>
                <th>Variance (L)</th>
                <th>Status Audit</th>
              </tr>
            </thead>
            <tbody>
              {loading && reconciliations.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-[13px] text-zinc-400">Memuat laporan totalizer…</td></tr>
              ) : reconciliations.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-[13px] text-zinc-400">Tidak ada data audit untuk tanggal ini</td></tr>
              ) : (
                reconciliations.map(r => (
                  <tr key={r.nozzle_id}>
                    <td className="font-mono text-[12px] text-zinc-500">{r.nozzle_id}</td>
                    <td className="font-semibold text-zinc-800">Pompa {r.pump_number}</td>
                    <td>
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-100 rounded-full font-semibold text-[12px]">
                        N{r.nozzle_number}
                      </span>
                    </td>
                    <td><Badge variant="neutral">{r.product_name}</Badge></td>
                    <td className="font-semibold text-zinc-900">{(r.totalizer_usage ?? 0).toLocaleString('id-ID')} L</td>
                    <td className="text-zinc-600">{(r.system_sales ?? 0).toLocaleString('id-ID')} L</td>
                    <td>
                      <span className={`font-semibold ${Math.abs(r.variance_l) > 5 ? 'text-amber-600' : 'text-green-600'}`}>
                        {r.variance_l > 0 ? `+${r.variance_l}` : r.variance_l} L
                      </span>
                    </td>
                    <td>
                      <Badge variant={Math.abs(r.variance_l) > 5 ? 'warning' : 'success'}>
                        {Math.abs(r.variance_l) > 5 ? 'VARIANCE' : 'MATCH'}
                      </Badge>
                    </td>
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

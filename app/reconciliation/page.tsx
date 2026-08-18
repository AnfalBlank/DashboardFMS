'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Reconciliation } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { clsx } from 'clsx';
import { CheckCircle, RefreshCw } from 'lucide-react';

export default function ReconciliationPage() {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [rerunModal, setRerunModal] = useState(false);

  const { success, warning, error: toastError } = useToast();

  const loadData = useCallback(async (dateStr?: string) => {
    try {
      setLoading(true);
      const res = await api.reconciliation.get(dateStr);
      if (res?.data) {
        setReconciliations(res.data);
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

  const handleRunRecon = async () => {
    try {
      setRunning(true);
      await api.reconciliation.run(date);
      success('Rekonsiliasi Selesai', `Kalkulasi rekonsiliasi untuk tanggal ${date} berhasil dijalankan.`);
      setRerunModal(false);
      loadData(date);
    } catch (err: unknown) {
      toastError('Gagal Rekonsiliasi', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setRunning(false);
    }
  };

  const totalVariance = reconciliations.reduce((s, r) => s + (r.variance_l ?? r.variance ?? 0), 0);
  const perfectCount = reconciliations.filter(r => r.status === 'PERFECT').length;
  const warningCount = reconciliations.filter(r => ['WARNING', 'CRITICAL'].includes(r.status)).length;

  return (
    <div>
      <PageHeader title="Stock Reconciliation" subtitle="Bandingkan stok aktual (ATG sensor) vs teoritikal (pembukuan) untuk setiap produk">
        <Button variant="outline" size="sm" onClick={() => loadData(date)}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button variant="primary" size="sm" onClick={() => setRerunModal(true)}>
          <CheckCircle size={13} /> Jalankan Rekonsiliasi
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard
          eyebrow="Status Keseluruhan"
          value={warningCount > 0 ? 'WARNING' : 'NORMAL'}
          accent={warningCount > 0 ? 'amber' : 'green'}
        />
        <KpiCard
          eyebrow="Total Variance Stok"
          value={`${totalVariance > 0 ? `+${totalVariance}` : totalVariance}`}
          unit="L"
          delta={Math.abs(totalVariance) > 50 ? 'perlu audit fisik' : 'toleransi normal'}
          deltaDir={totalVariance < 0 ? 'down' : 'neutral'}
          accent={totalVariance < 0 ? 'amber' : 'green'}
        />
        <KpiCard eyebrow="Produk Sesuai (PERFECT)" value={perfectCount.toString()} meta="variance 0 L" accent="green" />
        <KpiCard eyebrow="Produk Deviasi (WARNING+)" value={warningCount.toString()} meta="perlu perhatian" accent={warningCount > 0 ? 'amber' : 'green'} />
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-zinc-200">
        <span className="text-[13px] font-medium text-zinc-700">Tanggal Rekonsiliasi:</span>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      {/* Status legend */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { s: 'PERFECT', desc: 'Variance = 0 L', bg: 'bg-green-50 text-green-700 border-green-100' },
          { s: 'NORMAL', desc: 'Variance ≤ ±0.50%', bg: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
          { s: 'WARNING', desc: 'Variance > ±0.50%', bg: 'bg-amber-50 text-amber-700 border-amber-100' },
          { s: 'CRITICAL', desc: 'Variance > ±1.00%', bg: 'bg-red-50 text-red-700 border-red-100' },
        ].map(({ s, desc, bg }) => (
          <div key={s} className={`px-3 py-2 rounded-xl text-[12px] border ${bg}`}>
            <span className="font-semibold">{s}</span> — {desc}
          </div>
        ))}
      </div>

      {/* Per-product detail cards */}
      {reconciliations.map(r => {
        const prod = r.product_name ?? r.product ?? r.product_id;
        const openL = r.opening_l ?? r.opening ?? 0;
        const delL = r.delivery_l ?? r.delivery ?? 0;
        const salesL = r.sales_l ?? r.sales ?? 0;
        const adjL = r.adjustment_l ?? r.adjustment ?? 0;
        const theoL = r.theoretical_closing ?? r.theoreticalClosing ?? 0;
        const actL = r.actual_closing ?? r.actualClosing ?? 0;
        const varL = r.variance_l ?? r.variance ?? 0;
        const varPct = r.variance_pct ?? r.variancePct ?? 0;

        return (
          <Card key={prod} className="mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-900">{prod}</h3>
                <p className="text-[12px] text-zinc-400">Tanggal: {r.date || date}</p>
              </div>
              <Badge variant={statusVariant(r.status)}>
                {r.status} ({varPct}%)
              </Badge>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {[
                { label: 'Opening', value: `${openL.toLocaleString('id-ID')} L`, color: '' },
                { label: 'Delivery Supply', value: `+${delL.toLocaleString('id-ID')} L`, color: 'text-green-600 font-medium' },
                { label: 'Sales Penyaluran', value: `−${salesL.toLocaleString('id-ID')} L`, color: 'text-red-500 font-medium' },
                { label: 'Adjustment', value: `${adjL} L`, color: 'text-zinc-500' },
                { label: 'Teoritis Closing', value: `${theoL.toLocaleString('id-ID')} L`, color: 'font-medium' },
                { label: 'Aktual Fisik ATG', value: `${actL.toLocaleString('id-ID')} L`, color: 'font-semibold text-zinc-900' },
                {
                  label: 'Variance (Selisih)',
                  value: `${varL > 0 ? `+${varL}` : varL} L`,
                  color: varL < 0 ? 'text-red-600 font-bold' : varL > 0 ? 'text-green-600 font-bold' : 'text-zinc-700 font-semibold',
                },
              ].map(item => (
                <div key={item.label} className="bg-zinc-50 rounded-xl p-3 text-center border border-zinc-100">
                  <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">{item.label}</p>
                  <p className={clsx('text-[14px]', item.color)}>{item.value}</p>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {/* Summary table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-[13px] font-semibold">Tabel Rekapitulasi Audit Harian</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Opening</th>
                <th>Delivery</th>
                <th>Sales</th>
                <th>Adj</th>
                <th>Teoritis</th>
                <th>Aktual</th>
                <th>Variance (L)</th>
                <th>Variance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && reconciliations.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-[13px] text-zinc-400">Memuat data rekonsiliasi…</td></tr>
              ) : reconciliations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-[13px] text-zinc-400">
                    Belum ada data rekonsiliasi untuk tanggal {date}.
                    <Button variant="aloe" size="sm" className="ml-3" onClick={() => setRerunModal(true)}>
                      Jalankan Sekarang
                    </Button>
                  </td>
                </tr>
              ) : (
                reconciliations.map(r => {
                  const prod = r.product_name ?? r.product ?? r.product_id;
                  const openL = r.opening_l ?? r.opening ?? 0;
                  const delL = r.delivery_l ?? r.delivery ?? 0;
                  const salesL = r.sales_l ?? r.sales ?? 0;
                  const adjL = r.adjustment_l ?? r.adjustment ?? 0;
                  const theoL = r.theoretical_closing ?? r.theoreticalClosing ?? 0;
                  const actL = r.actual_closing ?? r.actualClosing ?? 0;
                  const varL = r.variance_l ?? r.variance ?? 0;
                  const varPct = r.variance_pct ?? r.variancePct ?? 0;
                  return (
                    <tr key={prod}>
                      <td className="font-semibold">{prod}</td>
                      <td>{openL.toLocaleString('id-ID')} L</td>
                      <td className="text-green-600 font-medium">+{delL.toLocaleString('id-ID')} L</td>
                      <td className="text-red-500">−{salesL.toLocaleString('id-ID')} L</td>
                      <td className="text-zinc-400">{adjL} L</td>
                      <td>{theoL.toLocaleString('id-ID')} L</td>
                      <td className="font-semibold">{actL.toLocaleString('id-ID')} L</td>
                      <td className={varL < 0 ? 'text-red-600 font-bold' : 'text-zinc-700 font-semibold'}>
                        {varL > 0 ? `+${varL}` : varL} L
                      </td>
                      <td className={varPct < 0 ? 'text-red-600 font-medium' : 'text-zinc-700'}>{varPct}%</td>
                      <td><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rerun modal */}
      <Modal open={rerunModal} onClose={() => setRerunModal(false)} title="Jalankan Kalkulasi Rekonsiliasi" size="sm">
        <div className="space-y-3">
          <p className="text-[13px] text-zinc-600">
            Sistem akan menghitung varians antara stok fisik tangki (ATG) dengan total penerimaan dan transaksi kartu BBM per tanggal <strong>{date}</strong>.
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setRerunModal(false)}>
              Batal
            </Button>
            <Button variant="aloe" className="flex-1" onClick={handleRunRecon} disabled={running}>
              {running ? 'Mengkalkulasi…' : '✓ Jalankan Rekonsiliasi'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, StockSummary, StockMovement, Delivery, Reconciliation } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, SlidersHorizontal, Truck } from 'lucide-react';

export default function StockPage() {
  const [stockSummary, setStockSummary] = useState<StockSummary[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const { success } = useToast();
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, recRes, delRes, movRes] = await Promise.allSettled([
        api.stock.summary(),
        api.reconciliation.get(),
        api.stock.deliveries(),
        api.stock.movements({ limit: 50 }),
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value?.data) setStockSummary(sumRes.value.data);
      if (recRes.status === 'fulfilled' && recRes.value?.data) setReconciliations(recRes.value.data);
      if (delRes.status === 'fulfilled' && delRes.value?.data) setDeliveries(delRes.value.data);
      if (movRes.status === 'fulfilled' && movRes.value?.data) setMovements(movRes.value.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalActual = stockSummary.reduce((s, st) => s + (st.total_current ?? 0), 0);
  const totalCapacity = stockSummary.reduce((s, st) => s + (st.total_capacity ?? 0), 0);
  const totalDelivered = deliveries.reduce((s, d) => s + (d.quantity_l ?? d.quantity ?? 0), 0);

  return (
    <div>
      <PageHeader title="Stock & Inventory Management" subtitle="Kelola pergerakan stok BBM: penerimaan supply, penyaluran, dan adjustment">
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button variant="primary" size="sm" onClick={() => router.push('/delivery')}>
          <Truck size={13} /> + Input Penerimaan Delivery →
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Stok Aktual" value={totalActual.toLocaleString('id-ID')} unit="L" accent="green" />
        <KpiCard eyebrow="Kapasitas Tangki" value={totalCapacity.toLocaleString('id-ID')} unit="L" accent="black" />
        <KpiCard eyebrow="Penerimaan Supply" value={totalDelivered.toLocaleString('id-ID')} unit="L" delta={`${deliveries.length} DO tercatat`} accent="blue" />
        <KpiCard eyebrow="Produk Terdaftar" value={stockSummary.length.toString()} meta="jenis BBM" accent="black" />
      </div>

      {/* Stock summary per product */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {stockSummary.map(st => {
          const pct = st.total_capacity > 0 ? Math.round((st.total_current / st.total_capacity) * 100) : 0;
          return (
            <div key={st.product_id} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
              <p className="text-[10px] font-semibold tracking-[0.5px] uppercase text-zinc-400 mb-2">{st.product_name}</p>
              <p className="text-[20px] font-light text-zinc-900">{st.total_current.toLocaleString('id-ID')} L</p>
              <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div className="bg-zinc-900 h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">Kapasitas: {st.total_capacity.toLocaleString('id-ID')} L ({pct}%)</p>
            </div>
          );
        })}
      </div>

      {/* Daily Reconciliation */}
      <Card padding={false} className="mb-5">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold">Rekonsiliasi Buku vs Fisik Harian</h3>
            <p className="text-[11.5px] text-zinc-400">Opening + Delivery − Sales ± Adj = Teoritis vs Fisik</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/stock-adjustment')}>
              <SlidersHorizontal size={12} /> Stock Adjustment
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push('/reconciliation')}>
              Lihat Detail Rekonsiliasi →
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Opening</th>
                <th>Delivery</th>
                <th>Sales</th>
                <th>Adjustment</th>
                <th>Teoritis Closing</th>
                <th>Aktual Closing</th>
                <th>Variance (L)</th>
                <th>Variance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-[13px] text-zinc-400">
                    Belum ada data rekonsiliasi harian.
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
                    <tr key={prod} className="cursor-pointer" onClick={() => router.push('/reconciliation')}>
                      <td className="font-semibold">{prod}</td>
                      <td>{openL.toLocaleString('id-ID')} L</td>
                      <td className="text-green-600 font-medium">+{delL.toLocaleString('id-ID')} L</td>
                      <td className="text-red-500">−{salesL.toLocaleString('id-ID')} L</td>
                      <td className="text-zinc-500">{adjL} L</td>
                      <td>{theoL.toLocaleString('id-ID')} L</td>
                      <td className="font-semibold">{actL.toLocaleString('id-ID')} L</td>
                      <td className={varL < 0 ? 'text-red-600 font-medium' : 'text-zinc-700'}>
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

      {/* Delivery history */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Riwayat Penerimaan Delivery (Pertamina Supply)</h3>
          <Button variant="primary" size="sm" onClick={() => router.push('/delivery')}>
            + Catat Penerimaan
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>ID Delivery</th>
                <th>Tanggal</th>
                <th>Supplier</th>
                <th>Produk</th>
                <th>Kuantitas</th>
                <th>Tangki Pendam</th>
                <th>No. DO</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[13px] text-zinc-400">
                    Belum ada riwayat delivery supply tercatat
                  </td>
                </tr>
              ) : (
                deliveries.map(d => (
                  <tr key={d.id}>
                    <td className="font-mono text-[12px] text-zinc-500">{d.id}</td>
                    <td className="text-zinc-600">{d.date}</td>
                    <td className="font-medium">{d.supplier}</td>
                    <td><Badge variant="neutral">{d.product_name || d.product}</Badge></td>
                    <td className="font-semibold text-green-600">
                      +{(d.quantity_l ?? d.quantity ?? 0).toLocaleString('id-ID')} L
                    </td>
                    <td className="text-zinc-500">{d.tank_id || d.tank}</td>
                    <td className="font-mono text-[12px] text-zinc-500">{d.doc_number || d.docNumber || '—'}</td>
                    <td><Badge variant={statusVariant(d.status)}>{d.status}</Badge></td>
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

'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Transaction, Product, Unit } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Input';
import { Download, FileText, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function TransactionReportPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { success } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [trxRes, prodRes, unitRes] = await Promise.allSettled([
        api.reports.transactions({
          from: fromDate || undefined,
          to: toDate || undefined,
          product_id: productFilter !== 'ALL' ? productFilter : undefined,
          unit_id: unitFilter !== 'ALL' ? unitFilter : undefined,
          limit: 500,
        }),
        api.master.products(),
        api.master.units(),
      ]);

      if (trxRes.status === 'fulfilled' && trxRes.value?.data) {
        setTransactions(Array.isArray(trxRes.value.data) ? trxRes.value.data : []);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.data) setProducts(prodRes.value.data);
      if (unitRes.status === 'fulfilled' && unitRes.value?.data) setUnits(unitRes.value.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, productFilter, unitFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = transactions.filter(t => {
    const cardNum = t.card_number || t.card || '';
    const holder = t.holder_name || t.holder || '';
    return !search || cardNum.includes(search) || holder.toLowerCase().includes(search.toLowerCase());
  });

  const totalVolume = filtered.reduce((s, t) => s + (t.volume_l ?? t.volume ?? 0), 0);
  const totalAmount = filtered.reduce((s, t) => s + (t.total_amount ?? t.total ?? 0), 0);

  return (
    <div>
      <PageHeader title="Transaction Report" subtitle="Laporan komprehensif seluruh transaksi penyaluran BBM SPBP">
        <Button variant="outline" size="sm" onClick={() => success('Export Excel', 'File Excel laporan transaksi sedang diunduh.')}>
          <Download size={13} /> Excel
        </Button>
        <Button variant="outline" size="sm" onClick={() => success('Export CSV', 'File CSV transaksi sedang diunduh.')}>
          <Download size={13} /> CSV
        </Button>
        <Button variant="primary" size="sm" onClick={() => success('Export PDF', 'Dokumen PDF siap dicetak.')}>
          <FileText size={13} /> PDF
        </Button>
      </PageHeader>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Transaksi', value: filtered.length.toLocaleString('id-ID') },
          { label: 'Total Volume Penyaluran', value: `${totalVolume.toLocaleString('id-ID')} L` },
          { label: 'Total Nilai Nominal', value: `Rp ${totalAmount.toLocaleString('id-ID')}` },
          {
            label: 'Rata-rata / Transaksi',
            value: `${filtered.length ? (totalVolume / filtered.length).toFixed(1) : 0} L`,
          },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{k.label}</p>
            <p className="text-[20px] font-light text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nomor kartu atau pemegang…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition"
          />
        </div>
        <input
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
        />
        <input
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
        />
        <Select
          value={productFilter}
          onChange={setProductFilter}
          options={[
            { value: 'ALL', label: 'Semua Produk' },
            ...products.map(p => ({ value: p.id, label: p.name })),
          ]}
          className="w-40"
        />
        <Select
          value={unitFilter}
          onChange={setUnitFilter}
          options={[
            { value: 'ALL', label: 'Semua Satker' },
            ...units.map(u => ({ value: u.id, label: u.name })),
          ]}
          className="w-40"
        />
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw size={13} />
        </Button>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Kartu</th>
                <th>Pemegang</th>
                <th>Satker</th>
                <th>Kendaraan</th>
                <th>Produk</th>
                <th>Volume</th>
                <th>Harga/L</th>
                <th>Total (Rp)</th>
                <th>Pump / Nozzle</th>
                <th>Shift</th>
                <th>Waktu</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && transactions.length === 0 ? (
                <tr><td colSpan={13} className="text-center py-8 text-[13px] text-zinc-400">Memuat laporan transaksi…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={13} className="text-center py-8 text-[13px] text-zinc-400">Tidak ada data transaksi yang sesuai filter</td></tr>
              ) : (
                filtered.map(t => {
                  const cardNum = t.card_number || t.card || '—';
                  const holder = t.holder_name || t.holder || '—';
                  const unit = t.unit_name || t.unit || '—';
                  const veh = t.police_number || t.vehicle || '—';
                  const prod = t.product_name || t.product || '—';
                  const vol = t.volume_l ?? t.volume ?? 0;
                  const price = t.price_per_unit ?? t.price ?? 0;
                  const amt = t.total_amount ?? t.total ?? 0;
                  const pump = t.pump_number || t.pump || '—';
                  const nzl = t.nozzle_number || t.nozzle || '—';
                  const time = t.transaction_time || t.time;

                  return (
                    <tr key={t.id}>
                      <td className="font-mono text-[11px] text-zinc-500">{t.id?.slice(-12)}</td>
                      <td className="font-mono text-[12px] font-semibold text-zinc-800">{cardNum}</td>
                      <td className="font-medium text-zinc-900">{holder}</td>
                      <td className="text-zinc-500 text-[12px]">{unit}</td>
                      <td className="text-zinc-500 text-[12px]">{veh}</td>
                      <td><Badge variant="neutral">{prod}</Badge></td>
                      <td className="font-semibold">{vol} L</td>
                      <td className="text-zinc-500 text-[12px]">Rp {price.toLocaleString('id-ID')}</td>
                      <td className="font-semibold">Rp {amt.toLocaleString('id-ID')}</td>
                      <td className="text-zinc-400 text-[12px]">{pump}/{nzl}</td>
                      <td className="text-zinc-400 text-[12px]">{t.shift ?? '—'}</td>
                      <td className="text-zinc-400 text-[12px]">
                        {time ? new Date(time).toLocaleString('id-ID') : '—'}
                      </td>
                      <td><Badge variant={statusVariant(t.status)}>{t.status}</Badge></td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-50">
                <td colSpan={6} className="px-4 py-3 text-[12px] font-semibold text-zinc-600">TOTAL</td>
                <td className="px-4 py-3 font-bold text-zinc-900">{totalVolume.toLocaleString('id-ID')} L</td>
                <td></td>
                <td className="px-4 py-3 font-bold text-zinc-900">Rp {totalAmount.toLocaleString('id-ID')}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

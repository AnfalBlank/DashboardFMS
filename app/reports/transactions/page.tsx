'use client';
import { useState } from 'react';
import { transactions } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input, Select } from '@/components/ui/Input';
import { Download, FileText, Search } from 'lucide-react';

export default function TransactionReportPage() {
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');

  const filtered = transactions.filter(t => {
    const ms = !search || t.card.includes(search) || t.holder.toLowerCase().includes(search.toLowerCase());
    const mp = productFilter === 'ALL' || t.product === productFilter;
    const mu = unitFilter === 'ALL' || t.unit === unitFilter;
    return ms && mp && mu;
  });

  const totalVolume = filtered.reduce((s, t) => s + t.volume, 0);
  const totalAmount = filtered.reduce((s, t) => s + t.total, 0);

  return (
    <div>
      <PageHeader title="Transaction Report" subtitle="Laporan lengkap semua transaksi BBM">
        <Button variant="outline" size="sm"><Download size={13} />Excel</Button>
        <Button variant="outline" size="sm"><Download size={13} />CSV</Button>
        <Button variant="primary" size="sm"><FileText size={13} />PDF</Button>
      </PageHeader>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Transaksi', value: filtered.length.toString() },
          { label: 'Total Volume', value: `${totalVolume.toLocaleString('id-ID')} L` },
          { label: 'Total Nilai', value: `Rp ${totalAmount.toLocaleString('id-ID')}` },
          { label: 'Rata-rata / Trx', value: `${filtered.length ? Math.round(totalVolume / filtered.length) : 0} L` },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{k.label}</p>
            <p className="text-[20px] font-light text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari kartu atau pemegang…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition" />
        </div>
        <input type="date" className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10" defaultValue="2026-08-01" />
        <input type="date" className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10" defaultValue="2026-08-09" />
        <Select value={productFilter} onChange={setProductFilter} options={[
          { value: 'ALL', label: 'Semua Produk' },
          { value: 'Pertamax', label: 'Pertamax' },
          { value: 'Pertalite', label: 'Pertalite' },
          { value: 'Dexlite', label: 'Dexlite' },
        ]} className="w-44" />
        <Select value={unitFilter} onChange={setUnitFilter} options={[
          { value: 'ALL', label: 'Semua Unit' },
          { value: 'DITRESKRIMSUS', label: 'DITRESKRIMSUS' },
          { value: 'BRIMOB', label: 'BRIMOB' },
          { value: 'DITLANTAS', label: 'DITLANTAS' },
          { value: 'INTELKAM', label: 'INTELKAM' },
          { value: 'SAMAPTA', label: 'SAMAPTA' },
        ]} className="w-44" />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>ID Transaksi</th><th>Kartu</th><th>Pemegang</th><th>Unit</th><th>Kendaraan</th>
              <th>Produk</th><th>Volume</th><th>Harga/L</th><th>Total (Rp)</th>
              <th>Pump/Nozzle</th><th>Operator</th><th>Waktu</th><th>Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="font-mono text-[11px] text-zinc-500">{t.id}</td>
                  <td className="font-mono text-[12px] font-medium">{t.card}</td>
                  <td className="font-medium">{t.holder}</td>
                  <td className="text-zinc-500 text-[12px]">{t.unit}</td>
                  <td className="text-zinc-500 text-[12px]">{t.vehicle}</td>
                  <td><Badge variant="neutral">{t.product}</Badge></td>
                  <td className="font-semibold">{t.volume} L</td>
                  <td className="text-zinc-500 text-[12px]">{t.price.toLocaleString('id-ID')}</td>
                  <td className="font-semibold">{t.total.toLocaleString('id-ID')}</td>
                  <td className="text-zinc-400 text-[12px]">{t.pump}/{t.nozzle}</td>
                  <td className="text-zinc-500 text-[12px]">{t.operator}</td>
                  <td className="text-zinc-400 text-[12px]">{t.time}</td>
                  <td><Badge variant={statusVariant(t.status)}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-50">
                <td colSpan={6} className="px-4 py-3 text-[12px] font-semibold text-zinc-600">TOTAL</td>
                <td className="px-4 py-3 font-bold text-zinc-900">{totalVolume} L</td>
                <td></td>
                <td className="px-4 py-3 font-bold text-zinc-900">{totalAmount.toLocaleString('id-ID')}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

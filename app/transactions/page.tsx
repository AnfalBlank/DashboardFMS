'use client';
import { useState } from 'react';
import { transactions } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Download, Filter, Search, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [detail, setDetail] = useState<typeof transactions[number] | null>(null);
  const { success, warning } = useToast();

  const filtered = transactions.filter(t => {
    const matchSearch = !search || t.id.includes(search) || t.card.includes(search) ||
      t.holder.toLowerCase().includes(search.toLowerCase()) || t.vehicle.includes(search);
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchProduct = productFilter === 'ALL' || t.product === productFilter;
    return matchSearch && matchStatus && matchProduct;
  });

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Monitor semua transaksi BBM secara realtime">
        <Button variant="outline" size="sm" onClick={() => success('Export dimulai', 'File Excel sedang disiapkan.')}><Download size={13} />Export</Button>
        <Button variant="primary" size="sm" onClick={() => success('Form transaksi manual', 'Fitur ini tersedia untuk operator.')}>+ Transaksi Manual</Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Transaksi', value: '4.821' },
          { label: 'SUCCESS', value: '4.790', sub: '99.4%' },
          { label: 'FAILED', value: '24', sub: '0.5%' },
          { label: 'VOID/CANCELLED', value: '7', sub: '0.1%' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] font-medium tracking-[0.6px] uppercase text-zinc-400 mb-2">{k.label}</p>
            <p className="text-[24px] font-light text-zinc-900">{k.value}</p>
            {k.sub && <p className="text-[12px] text-zinc-400 mt-1">{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari ID, nomor kartu, pemegang, kendaraan…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-[13px] outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-400 transition" />
        </div>
        <Select value={statusFilter} onChange={setStatusFilter} options={[
          { value: 'ALL', label: 'Semua Status' },
          { value: 'SUCCESS', label: 'SUCCESS' },
          { value: 'FAILED', label: 'FAILED' },
          { value: 'VOID', label: 'VOID' },
          { value: 'PENDING', label: 'PENDING' },
        ]} className="w-44" />
        <Select value={productFilter} onChange={setProductFilter} options={[
          { value: 'ALL', label: 'Semua Produk' },
          { value: 'Pertamax', label: 'Pertamax' },
          { value: 'Pertalite', label: 'Pertalite' },
          { value: 'Dexlite', label: 'Dexlite' },
        ]} className="w-44" />
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>ID Transaksi</th><th>Kartu</th><th>Pemegang</th><th>Kendaraan</th>
              <th>Unit</th><th>Produk</th><th>Volume</th><th>Harga/L</th><th>Total</th>
              <th>Pump</th><th>Operator</th><th>Shift</th><th>Waktu</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="font-mono text-[11.5px] text-zinc-500">{t.id}</td>
                  <td className="font-mono text-[12px] text-zinc-600 font-medium">{t.card}</td>
                  <td className="font-medium text-zinc-900">{t.holder}</td>
                  <td className="text-zinc-500 text-[12px]">{t.vehicle}</td>
                  <td className="text-zinc-500 text-[12px]">{t.unit}</td>
                  <td><Badge variant="neutral">{t.product}</Badge></td>
                  <td className="font-semibold">{t.volume} L</td>
                  <td className="text-zinc-500 text-[12px]">Rp {t.price.toLocaleString('id-ID')}</td>
                  <td className="font-semibold">Rp {t.total.toLocaleString('id-ID')}</td>
                  <td className="text-zinc-400 text-[12px]">{t.pump}/{t.nozzle}</td>
                  <td className="text-zinc-500 text-[12px]">{t.operator}</td>
                  <td className="text-zinc-400 text-[12px]">{t.shift}</td>
                  <td className="text-zinc-400 text-[12px]">{t.time}</td>
                  <td><Badge variant={statusVariant(t.status)}>{t.status}</Badge></td>
                  <td>
                    <button onClick={() => setDetail(t)} className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-[12px] text-zinc-400">Menampilkan {filtered.length} transaksi</span>
          <div className="flex gap-1.5">
            {['←','1','2','3','→'].map((p, i) => (
              <button key={p} className={`px-3 py-1.5 text-[12px] rounded-full border transition ${i === 1 ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>{p}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDetail(null)} />
          <div className="w-[420px] bg-white h-full overflow-y-auto shadow-2xl animate-fade-in">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-[15px] font-semibold">Detail Transaksi</h2>
              <button onClick={() => setDetail(null)} className="text-zinc-400 hover:text-zinc-700 text-lg">✕</button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">Transaction ID</p>
                <p className="font-mono text-[13px] text-zinc-700">{detail.id}</p>
              </div>
              <Badge variant={statusVariant(detail.status)} className="text-[12px]">{detail.status}</Badge>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Kartu', detail.card], ['Pemegang', detail.holder],
                  ['Kendaraan', detail.vehicle], ['Unit', detail.unit],
                  ['Produk', detail.product], ['Volume', `${detail.volume} L`],
                  ['Harga/L', `Rp ${detail.price.toLocaleString('id-ID')}`],
                  ['Total', `Rp ${detail.total.toLocaleString('id-ID')}`],
                  ['Pump', detail.pump], ['Nozzle', detail.nozzle],
                  ['Operator', detail.operator], ['Shift', detail.shift],
                  ['Waktu', detail.time],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">{k as string}</p>
                    <p className="text-[13.5px] font-medium text-zinc-900">{v as string}</p>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-3 font-semibold">Kuota</p>
                <div className="space-y-2">
                  {[
                    ['Sebelum', `${detail.quotaBefore} L`],
                    ['Dipotong', `${detail.quotaDeducted} L`],
                    ['Setelah', `${detail.quotaAfter} L`],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between text-[13px]">
                      <span className="text-zinc-500">{k as string}</span>
                      <span className="font-semibold text-zinc-900">{v as string}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { warning('VOID diminta', 'Menunggu approval dari admin.'); setDetail(null); }}>VOID Transaksi</Button>
                <Button variant="primary" className="flex-1" onClick={() => success('Cetak', 'Dokumen transaksi disiapkan.')}>Cetak</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

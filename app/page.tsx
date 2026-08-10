'use client';
import { KpiCard } from '@/components/ui/KpiCard';
import { Button } from '@/components/ui/Button';
import { TankStrip } from '@/components/dashboard/TankStrip';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { UnitRanking } from '@/components/dashboard/UnitRanking';
import { ConsumptionChart, StockByProductChart, QuotaDonut } from '@/components/dashboard/Charts';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { transactions, kpiData, reconciliations } from '@/lib/data';
import { Download, RefreshCw, Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { success, info } = useToast();
  const router = useRouter();
  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-light tracking-tight text-zinc-900">Fuel Monitoring</h1>
          <p className="text-[13px] text-zinc-400 mt-1">Minggu, 9 Agustus 2026 · Pembaruan terakhir: 18:31:42 WIB</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => success('Export dimulai', 'File akan diunduh dalam beberapa detik.')}><Download size={13} />Export</Button>
          <Button variant="aloe" size="sm" onClick={() => router.push('/reconciliation')}><RefreshCw size={13} />Rekonsiliasi</Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/allocation')}><Plus size={13} />Generate Kuota</Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-3 mb-5 flex-wrap">
        <Filter size={13} className="text-zinc-400 flex-shrink-0" />
        <span className="text-[11.5px] text-zinc-400 mr-1">Filter:</span>
        {['Agustus 2026','Semua Produk','Semua Unit'].map((f, i) => (
          <button key={f} className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition border ${i === 0 ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>
            {f}
          </button>
        ))}
        <div className="w-px h-5 bg-zinc-200 mx-1" />
        {['Pertamax','Pertalite','Dexlite'].map(f => (
          <button key={f} className="px-3 py-1.5 rounded-full text-[12px] font-medium border border-zinc-200 text-zinc-600 hover:border-zinc-400 transition">{f}</button>
        ))}
        <Button variant="ghost" size="sm" className="ml-auto text-zinc-400">Reset</Button>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <KpiCard eyebrow="Total Stock" value="24.240" unit="L" delta="▲ 5.000 L delivery" deltaDir="up" accent="green" />
        <KpiCard eyebrow="Penggunaan Hari Ini" value="842" unit="L" delta="58 transaksi" deltaDir="neutral" accent="blue" />
        <KpiCard eyebrow="Penggunaan Bulanan" value="48.240" unit="L" delta="4.821 transaksi" deltaDir="neutral" accent="blue" />
        <KpiCard eyebrow="Kartu Aktif" value="486" meta="dari 512 terdaftar" delta="94.9%" deltaDir="neutral" accent="black" />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Utilisasi Kuota" value="76.4" unit="%" delta="48.240 / 63.200 L" deltaDir="neutral" accent="green" />
        <KpiCard eyebrow="Sisa Kuota" value="14.960" unit="L" delta="23.6% dari total" deltaDir="neutral" accent="green" />
        <KpiCard eyebrow="Kuota Hangus" value="3.240" unit="L" delta="42 kartu" deltaDir="down" accent="amber" />
        <KpiCard eyebrow="Variance Stok" value="-0.32" unit="%" delta="−40 L dari teoritikal" deltaDir="down" accent="red" />
      </div>

      {/* Tanks */}
      <p className="text-[10.5px] font-semibold tracking-[0.6px] uppercase text-zinc-400 mb-2.5">Tank Monitoring — Realtime</p>
      <TankStrip />

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2"><ConsumptionChart /></div>
        <QuotaDonut />
      </div>

      {/* Unit + Alerts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <UnitRanking />
        <AlertPanel />
      </div>

      {/* Reconciliation summary */}
      <Card padding={false} className="mb-4">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Rekonsiliasi Stok — Hari Ini</h3>
          <Link href="/reconciliation"><Button variant="outline" size="sm">Detail</Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Produk</th><th>Opening</th><th>Delivery</th><th>Sales</th>
              <th>Teoritis Closing</th><th>Aktual Closing</th><th>Variance</th><th>Variance %</th><th>Status</th>
            </tr></thead>
            <tbody>
              {reconciliations.map(r => (
                <tr key={r.product}>
                  <td className="font-medium">{r.product}</td>
                  <td>{r.opening.toLocaleString('id-ID')} L</td>
                  <td className="text-green-600">+{r.delivery.toLocaleString('id-ID')} L</td>
                  <td className="text-red-600">−{r.sales.toLocaleString('id-ID')} L</td>
                  <td>{r.theoreticalClosing.toLocaleString('id-ID')} L</td>
                  <td>{r.actualClosing.toLocaleString('id-ID')} L</td>
                  <td className={r.variance < 0 ? 'text-red-600 font-medium' : 'text-zinc-700'}>{r.variance} L</td>
                  <td className={r.variancePct < 0 ? 'text-red-600 font-medium' : 'text-zinc-700'}>{r.variancePct}%</td>
                  <td><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stok by Product chart */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StockByProductChart />
        {/* Integration monitor */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold">Integration Monitor</h3>
            <Badge variant="success">SYNCED</Badge>
          </div>
          {[
            { label: 'Transaksi Diterima', value: '4.821', color: 'text-zinc-900' },
            { label: 'Synced', value: '4.818', color: 'text-green-600' },
            { label: 'Pending', value: '2', color: 'text-amber-600' },
            { label: 'Failed', value: '1', color: 'text-red-600' },
          ].map(i => (
            <div key={i.label} className="flex justify-between items-center py-3 border-b border-zinc-50 last:border-0">
              <span className="text-[13px] text-zinc-500">{i.label}</span>
              <span className={`text-[16px] font-light ${i.color}`}>{i.value}</span>
            </div>
          ))}
          <p className="text-[11.5px] text-zinc-400 mt-3">Last sync: 18:31:42 WIB</p>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-[13px] font-semibold">Transaksi Terkini</h3>
            <span className="text-[12px] text-zinc-400">4.821 bulan ini</span>
          </div>
          <div className="flex gap-2">
            <Link href="/transactions"><Button variant="outline" size="sm">Lihat Semua</Button></Link>
            <Button variant="primary" size="sm" onClick={() => success('Export dimulai', 'File CSV sedang disiapkan.')}><Download size={12} />Export</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>ID Transaksi</th><th>Kartu</th><th>Pemegang</th><th>Kendaraan</th>
              <th>Unit</th><th>Produk</th><th>Volume</th><th>Total</th>
              <th>Pump/Nozzle</th><th>Waktu</th><th>Status</th>
            </tr></thead>
            <tbody>
              {transactions.slice(0, 7).map(t => (
                <tr key={t.id} className="cursor-pointer">
                  <td className="font-mono text-[12px] text-zinc-500">{t.id}</td>
                  <td className="font-mono text-[12px] text-zinc-500">{t.card}</td>
                  <td className="font-medium text-zinc-900">{t.holder}</td>
                  <td className="text-zinc-500 text-[12px]">{t.vehicle}</td>
                  <td className="text-zinc-500 text-[12px]">{t.unit}</td>
                  <td><Badge variant="neutral">{t.product}</Badge></td>
                  <td className="font-semibold">{t.volume} L</td>
                  <td className="font-semibold">Rp {t.total.toLocaleString('id-ID')}</td>
                  <td className="text-zinc-400 text-[12px]">{t.pump}/{t.nozzle}</td>
                  <td className="text-zinc-400 text-[12px]">{t.time}</td>
                  <td><Badge variant={statusVariant(t.status)}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-[12px] text-zinc-400">Menampilkan 7 dari 4.821</span>
          <div className="flex gap-1.5">
            {['←','1','2','3','→'].map((p, i) => (
              <button key={p} className={`px-3 py-1.5 text-[12px] rounded-full border transition ${i === 1 ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

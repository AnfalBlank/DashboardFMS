'use client';
import { reconciliations, deliveries } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

export default function StockPage() {
  const { success } = useToast();
  const router = useRouter();

  return (
    <div>
      <PageHeader title="Stock Management" subtitle="Kelola pergerakan stok BBM: opening, delivery, sales, adjustment">
        <Button variant="outline" size="sm" onClick={() => success('Export dimulai', 'Laporan stok sedang disiapkan.')}>Export</Button>
        <Button variant="primary" size="sm" onClick={() => router.push('/delivery')}>+ Input Delivery →</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Stok Aktual"      value="24.240" unit="L" accent="green" />
        <KpiCard eyebrow="Total Stok Teoritikal"  value="24.280" unit="L" accent="blue" />
        <KpiCard eyebrow="Variance"               value="-40"    unit="L" delta="-0.16%" deltaDir="down" accent="amber" />
        <KpiCard eyebrow="Delivery Bulan Ini"     value="13.000" unit="L" accent="black" />
      </div>

      {/* Stock movement */}
      <Card padding={false} className="mb-4">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Pergerakan Stok — Agustus 2026</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => success('Export stok', 'File sedang disiapkan.')}>Export</Button>
            <Button variant="primary" size="sm" onClick={() => router.push('/stock-adjustment')}>Adjustment →</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Produk</th><th>Opening</th><th>Delivery</th><th>Sales</th>
              <th>Adjustment</th><th>Teoritis Closing</th><th>Aktual Closing</th><th>Variance</th><th>Var%</th><th>Status</th>
            </tr></thead>
            <tbody>
              {reconciliations.map(r => (
                <tr key={r.product} className="cursor-pointer" onClick={() => router.push('/reconciliation')}>
                  <td className="font-semibold">{r.product}</td>
                  <td>{r.opening.toLocaleString('id-ID')} L</td>
                  <td className="text-green-600 font-medium">+{r.delivery.toLocaleString('id-ID')} L</td>
                  <td className="text-red-500">−{r.sales.toLocaleString('id-ID')} L</td>
                  <td className="text-zinc-400">{r.adjustment} L</td>
                  <td>{r.theoreticalClosing.toLocaleString('id-ID')} L</td>
                  <td className="font-semibold">{r.actualClosing.toLocaleString('id-ID')} L</td>
                  <td className={r.variance < 0 ? 'text-red-600 font-medium' : 'text-zinc-700'}>{r.variance} L</td>
                  <td className={r.variancePct < 0 ? 'text-red-600 font-medium' : 'text-zinc-700'}>{r.variancePct}%</td>
                  <td><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delivery history */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Riwayat Delivery</h3>
          <Button variant="primary" size="sm" onClick={() => router.push('/delivery')}>+ Input Delivery →</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>ID Delivery</th><th>Tanggal</th><th>Supplier</th><th>Produk</th>
              <th>Kuantitas</th><th>Tank</th><th>No. Dokumen</th><th>Operator</th><th>Status</th>
            </tr></thead>
            <tbody>
              {deliveries.map(d => (
                <tr key={d.id}>
                  <td className="font-mono text-[12px] text-zinc-500">{d.id}</td>
                  <td className="text-zinc-600">{d.date}</td>
                  <td className="font-medium">{d.supplier}</td>
                  <td><Badge variant="neutral">{d.product}</Badge></td>
                  <td className="font-semibold text-green-600">+{d.quantity.toLocaleString('id-ID')} L</td>
                  <td className="text-zinc-500">{d.tank}</td>
                  <td className="font-mono text-[12px] text-zinc-500">{d.docNumber}</td>
                  <td className="text-zinc-500 text-[12px]">{d.operator}</td>
                  <td><Badge variant={statusVariant(d.status)}>{d.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

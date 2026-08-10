'use client';
import { reconciliations } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Download } from 'lucide-react';

export default function StockReportPage() {
  return (
    <div>
      <PageHeader title="Stock Report" subtitle="Laporan pergerakan stok BBM per produk — Agustus 2026">
        <Button variant="outline" size="sm"><Download size={13} />Excel</Button>
        <Button variant="primary" size="sm"><Download size={13} />PDF</Button>
      </PageHeader>
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Produk</th><th>Opening</th><th>Delivery</th><th>Sales</th>
              <th>Adjustment</th><th>Teoritis Closing</th><th>Aktual Closing</th>
              <th>Variance (L)</th><th>Variance %</th><th>Status</th>
            </tr></thead>
            <tbody>
              {reconciliations.map(r => (
                <tr key={r.product}>
                  <td className="font-semibold">{r.product}</td>
                  <td>{r.opening.toLocaleString('id-ID')} L</td>
                  <td className="text-green-600 font-medium">+{r.delivery.toLocaleString('id-ID')} L</td>
                  <td className="text-red-500">−{r.sales.toLocaleString('id-ID')} L</td>
                  <td className="text-zinc-400">{r.adjustment} L</td>
                  <td>{r.theoreticalClosing.toLocaleString('id-ID')} L</td>
                  <td className="font-semibold">{r.actualClosing.toLocaleString('id-ID')} L</td>
                  <td className={r.variance < 0 ? 'text-red-600 font-semibold' : 'text-zinc-700'}>{r.variance} L</td>
                  <td className={r.variancePct < 0 ? 'text-red-600 font-semibold' : 'text-zinc-700'}>{r.variancePct}%</td>
                  <td><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

'use client';
import { pumps } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Download } from 'lucide-react';

export default function TotalizerReportPage() {
  const allNozzles = pumps.flatMap(p => p.nozzles.map(n => ({ ...n, pumpNum: p.number, pumpStatus: p.status })));
  return (
    <div>
      <PageHeader title="Totalizer Report" subtitle="Laporan totalizer pump dan nozzle — Agustus 2026">
        <Button variant="outline" size="sm"><Download size={13} />Excel</Button>
        <Button variant="primary" size="sm"><Download size={13} />PDF</Button>
      </PageHeader>
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Pump</th><th>Nozzle</th><th>Produk</th><th>Opening Totalizer</th>
              <th>Closing Totalizer</th><th>Usage</th><th>System Sales</th><th>Variance (L)</th><th>Status</th>
            </tr></thead>
            <tbody>
              {allNozzles.map(n => (
                <tr key={n.id}>
                  <td className="font-semibold">Pump {n.pumpNum}</td>
                  <td className="font-mono font-medium">N{n.number}</td>
                  <td><Badge variant="neutral">{n.product}</Badge></td>
                  <td className="font-mono text-zinc-500">{n.totalizerOpen.toLocaleString('id-ID')}</td>
                  <td className="font-mono font-medium">{n.totalizerCurrent.toLocaleString('id-ID')}</td>
                  <td className="font-semibold">{n.usage.toLocaleString('id-ID')} L</td>
                  <td>{n.systemSales.toLocaleString('id-ID')} L</td>
                  <td className={n.variance > 5 ? 'text-amber-600 font-semibold' : 'text-green-600 font-medium'}>
                    {n.variance > 0 ? `+${n.variance}` : n.variance} L
                  </td>
                  <td><Badge variant={n.variance > 5 ? 'warning' : 'success'}>{n.variance > 5 ? 'VARIANCE' : 'OK'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

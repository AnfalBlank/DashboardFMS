'use client';
import { pumps } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';

export default function NozzlesPage() {
  const allNozzles = pumps.flatMap(p =>
    p.nozzles.map(n => ({ ...n, pumpNum: p.number, pumpLoc: p.location, pumpStatus: p.status }))
  );
  return (
    <div>
      <PageHeader title="Nozzles" subtitle="Master data nozzle dan status dispensing">
        <Button variant="primary" size="sm">+ Nozzle</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Nozzle" value={allNozzles.length.toString()} accent="black" />
        <KpiCard eyebrow="Aktif" value={allNozzles.filter(n => n.status === 'ACTIVE').length.toString()} accent="green" />
        <KpiCard eyebrow="Offline" value={allNozzles.filter(n => n.status === 'OFFLINE').length.toString()} accent="amber" />
        <KpiCard eyebrow="Variance Terdeteksi" value={allNozzles.filter(n => n.variance > 5).length.toString()} accent="red" />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Pump</th><th>Nozzle No.</th><th>Produk</th><th>Lokasi</th>
              <th>Totalizer Saat Ini</th><th>Usage</th><th>System Sales</th><th>Variance</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {allNozzles.map(n => (
                <tr key={n.id}>
                  <td className="font-semibold">Pump {n.pumpNum}</td>
                  <td>
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-100 rounded-full font-semibold text-[12px] text-zinc-700">
                      {n.number}
                    </span>
                  </td>
                  <td><Badge variant="neutral">{n.product}</Badge></td>
                  <td className="text-zinc-500 text-[12px]">{n.pumpLoc}</td>
                  <td className="font-mono text-[12px] text-zinc-600">{n.totalizerCurrent.toLocaleString('id-ID')}</td>
                  <td className="font-semibold">{n.usage.toLocaleString('id-ID')} L</td>
                  <td className="text-zinc-600">{n.systemSales.toLocaleString('id-ID')} L</td>
                  <td>
                    <span className={`font-semibold ${n.variance > 5 ? 'text-amber-600' : 'text-green-600'}`}>
                      {n.variance > 0 ? `+${n.variance}` : '0'} L
                    </span>
                  </td>
                  <td>
                    {n.pumpStatus === 'OFFLINE'
                      ? <Badge variant="neutral">OFFLINE</Badge>
                      : n.variance > 5
                      ? <Badge variant="warning">VARIANCE</Badge>
                      : <Badge variant="success">NORMAL</Badge>
                    }
                  </td>
                  <td>
                    <button className="text-[12px] text-zinc-400 hover:text-zinc-700 px-2 py-1 hover:bg-zinc-100 rounded-lg transition">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

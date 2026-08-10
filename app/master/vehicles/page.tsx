'use client';
import { vehicles } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export default function VehiclesPage() {
  return (
    <div>
      <PageHeader title="Vehicle Management" subtitle="Kelola kendaraan dan kaitan dengan kartu BBM">
        <Button variant="outline" size="sm">Export</Button>
        <Button variant="primary" size="sm">+ Kendaraan</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Kendaraan', value: vehicles.length.toString() },
          { label: 'Aktif', value: vehicles.filter(v => v.status === 'ACTIVE').length.toString() },
          { label: 'Tidak Aktif', value: vehicles.filter(v => v.status === 'INACTIVE').length.toString() },
          { label: 'Terhubung Kartu', value: vehicles.filter(v => v.card).length.toString() },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{k.label}</p>
            <p className="text-[24px] font-light text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Nomor Polisi</th><th>Tipe</th><th>Brand</th><th>Model</th><th>Tahun</th>
              <th>Unit</th><th>Jenis BBM</th><th>Kartu</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td className="font-mono font-semibold text-zinc-800">{v.policeNumber}</td>
                  <td><Badge variant="neutral">{v.type}</Badge></td>
                  <td className="font-medium">{v.brand}</td>
                  <td className="text-zinc-600">{v.model}</td>
                  <td className="text-zinc-500 text-[12px]">{v.year}</td>
                  <td className="text-zinc-500 text-[12px]">{v.unit}</td>
                  <td className="text-zinc-500 text-[12px]">{v.fuelType}</td>
                  <td className="font-mono text-[12px] text-zinc-600">{v.card || '—'}</td>
                  <td><Badge variant={statusVariant(v.status)}>{v.status}</Badge></td>
                  <td>
                    <button className="text-[12px] text-zinc-400 hover:text-zinc-700 px-2 py-1 hover:bg-zinc-100 rounded-lg transition">Edit</button>
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

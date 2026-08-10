'use client';
import { cards } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export default function MasterCardsPage() {
  return (
    <div>
      <PageHeader title="Master Cards" subtitle="Data master kartu BBM terdaftar">
        <Button variant="outline" size="sm">Import</Button>
        <Button variant="primary" size="sm">+ Kartu Baru</Button>
      </PageHeader>
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Nomor Kartu</th><th>Tipe</th><th>Pemegang</th><th>Unit</th><th>Kendaraan</th>
              <th>Produk</th><th>Limit/Bulan</th><th>Tgl Aktivasi</th><th>Tgl Expired</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {cards.map(c => (
                <tr key={c.id}>
                  <td className="font-mono font-semibold text-zinc-800">{c.number}</td>
                  <td><Badge variant="neutral">{c.type}</Badge></td>
                  <td className="font-medium">{c.holder}</td>
                  <td className="text-zinc-500 text-[12px]">{c.unit}</td>
                  <td className="text-zinc-500 text-[12px]">{c.vehicle}</td>
                  <td className="text-zinc-500 text-[12px]">{c.fuelType}</td>
                  <td className="font-medium">{c.monthlyLimit} L</td>
                  <td className="text-zinc-400 text-[12px]">{c.activation}</td>
                  <td className="text-zinc-400 text-[12px]">{c.expiry}</td>
                  <td><Badge variant={statusVariant(c.status)}>{c.status}</Badge></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="text-[12px] text-zinc-400 hover:text-zinc-700 px-2 py-1 hover:bg-zinc-100 rounded-lg transition">Edit</button>
                      <button className="text-[12px] text-red-400 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded-lg transition">Blokir</button>
                    </div>
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

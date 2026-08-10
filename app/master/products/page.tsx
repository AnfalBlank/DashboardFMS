'use client';
import { products, priceHistory } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ProductsPage() {
  return (
    <div>
      <PageHeader title="Products & Price" subtitle="Kelola master produk BBM dan riwayat harga">
        <Button variant="primary" size="sm">+ Produk Baru</Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-5">
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Master Produk</h3>
            <Button variant="outline" size="sm">+ Tambah</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="fuel-table">
              <thead><tr><th>Kode</th><th>Nama</th><th>Tipe</th><th>Satuan</th><th>Harga Saat Ini</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="font-mono font-semibold text-zinc-700">{p.code}</td>
                    <td className="font-medium">{p.name}</td>
                    <td><Badge variant="neutral">{p.type}</Badge></td>
                    <td className="text-zinc-500 text-[12px]">{p.unit}</td>
                    <td className="font-semibold">Rp {p.currentPrice.toLocaleString('id-ID')}</td>
                    <td><Badge variant="success">AKTIF</Badge></td>
                    <td><button className="text-[12px] text-zinc-400 hover:text-zinc-700 px-2 py-1 hover:bg-zinc-100 rounded-lg">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Riwayat Harga</h3>
            <Button variant="primary" size="sm">+ Ubah Harga</Button>
          </div>
          <div className="divide-y divide-zinc-50">
            {priceHistory.map(ph => (
              <div key={ph.product} className="px-5 py-4">
                <p className="text-[13px] font-semibold text-zinc-900 mb-3">{ph.product}</p>
                <div className="space-y-2">
                  {ph.prices.map((pr, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-[12px] text-zinc-500">{pr.effectiveDate}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-[13px]">Rp {pr.price.toLocaleString('id-ID')}</span>
                        {i === ph.prices.length - 1 && <Badge variant="success">AKTIF</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

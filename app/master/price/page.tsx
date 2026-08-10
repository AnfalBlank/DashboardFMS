'use client';
import { priceHistory, products } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export default function PricePage() {
  return (
    <div>
      <PageHeader title="Price Management" subtitle="Kelola harga BBM dengan effective date">
        <Button variant="primary" size="sm">+ Ubah Harga</Button>
      </PageHeader>

      <div className="grid grid-cols-5 gap-3 mb-5">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{p.name}</p>
            <p className="text-[20px] font-light text-zinc-900">Rp {p.currentPrice.toLocaleString('id-ID')}</p>
            <p className="text-[11px] text-zinc-400 mt-1">per liter · Agu 2026</p>
            <Badge variant="success" className="mt-2">AKTIF</Badge>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {priceHistory.map(ph => (
          <Card key={ph.product} padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold">{ph.product}</h3>
              <Button variant="outline" size="sm">+ Ubah Harga</Button>
            </div>
            <div className="divide-y divide-zinc-50">
              {[...ph.prices].reverse().map((pr, i) => (
                <div key={i} className="flex justify-between items-center px-5 py-3">
                  <div>
                    <p className="text-[12.5px] font-medium text-zinc-700">{pr.effectiveDate}</p>
                    <p className="text-[11px] text-zinc-400">Berlaku sejak tanggal tersebut</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px]">Rp {pr.price.toLocaleString('id-ID')}</span>
                    {i === 0 && <Badge variant="success">AKTIF</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

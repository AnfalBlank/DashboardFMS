'use client';
import { useState } from 'react';
import { units, products } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input, Select } from '@/components/ui/Input';

const unitAllocations = [
  { unit: 'BRIMOB', allocation: 300 },
  { unit: 'DITRESKRIMSUS', allocation: 250 },
  { unit: 'DITLANTAS', allocation: 200 },
  { unit: 'SAMAPTA', allocation: 200 },
  { unit: 'INTELKAM', allocation: 150 },
  { unit: 'DITRESKRIMUM', allocation: 200 },
  { unit: 'POLRES MANOKWARI', allocation: 150 },
];

export default function AllocationPage() {
  const [period, setPeriod] = useState('September 2026');
  const [product, setProduct] = useState('Pertamax');
  const [defaultAlloc, setDefaultAlloc] = useState('200');
  const [scope, setScope] = useState('all');
  const [confirmed, setConfirmed] = useState(false);

  const activeCards = 486;
  const totalLiter = activeCards * Number(defaultAlloc);

  return (
    <div>
      <PageHeader title="Monthly Allocation" subtitle="Generate kuota BBM bulanan secara massal">
        <Button variant="outline" size="sm">Riwayat Generate</Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-5">
        {/* Form */}
        <div className="col-span-1 space-y-4">
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Konfigurasi Generate Kuota</h3>
            <div className="space-y-3">
              <Input label="Periode" value={period} onChange={setPeriod} placeholder="mis. September 2026" />
              <Select label="Produk BBM" value={product} onChange={setProduct}
                options={products.map(p => ({ value: p.name, label: p.name }))} />
              <Select label="Scope" value={scope} onChange={setScope} options={[
                { value: 'all', label: 'Semua Kartu Aktif' },
                { value: 'unit', label: 'Per Unit / Satker' },
                { value: 'vehicle', label: 'Per Jenis Kendaraan' },
                { value: 'custom', label: 'Custom Selection' },
              ]} />
              <Input label="Default Alokasi (Liter)" value={defaultAlloc} onChange={setDefaultAlloc} type="number" placeholder="200" />

              {/* Preview box */}
              {defaultAlloc && (
                <div className="bg-[#c1fbd4]/30 border border-[#c1fbd4] rounded-xl p-4">
                  <p className="text-[10.5px] uppercase tracking-wide text-zinc-500 mb-2 font-semibold">Preview</p>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex justify-between"><span className="text-zinc-500">Kartu aktif</span><span className="font-semibold">{activeCards}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Alokasi per kartu</span><span className="font-semibold">{Number(defaultAlloc).toLocaleString('id-ID')} L</span></div>
                    <div className="w-full h-px bg-zinc-200 my-1" />
                    <div className="flex justify-between">
                      <span className="text-zinc-600 font-medium">Total kebutuhan</span>
                      <span className="font-bold text-zinc-900">{totalLiter.toLocaleString('id-ID')} L</span>
                    </div>
                  </div>
                </div>
              )}

              {!confirmed ? (
                <Button variant="primary" className="w-full" onClick={() => setConfirmed(true)}>
                  Preview & Konfirmasi
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[12.5px] text-amber-700">
                    ⚠ Tindakan ini akan membuat kuota untuk {activeCards} kartu. Tidak dapat dibatalkan.
                  </div>
                  <Button variant="aloe" className="w-full">✓ Generate Sekarang</Button>
                  <Button variant="outline" className="w-full" onClick={() => setConfirmed(false)}>Batal</Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Per-unit config */}
        <div className="col-span-2">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold">Alokasi per Unit / Satker</h3>
              <Button variant="outline" size="sm">Reset ke Default</Button>
            </div>
            <div className="divide-y divide-zinc-50">
              {unitAllocations.map((ua, i) => (
                <div key={ua.unit} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 transition">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[11px] font-semibold text-zinc-500 flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="flex-1 text-[13.5px] font-medium text-zinc-800">{ua.unit}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={ua.allocation}
                      className="w-24 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-[13px] text-right font-semibold outline-none focus:ring-2 focus:ring-black/10 transition"
                    />
                    <span className="text-[12px] text-zinc-400">L/kartu</span>
                  </div>
                  <span className="text-[12px] text-zinc-400 w-32 text-right">
                    × {units.find(u => u.name === ua.unit || u.code === ua.unit.split(' ')[0])?.cards ?? '—'} kartu
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center">
              <span className="text-[12.5px] text-zinc-500">Total estimasi semua unit</span>
              <span className="text-[16px] font-semibold text-zinc-900">
                {unitAllocations.reduce((s, ua) => {
                  const unit = units.find(u => u.name === ua.unit || u.code === ua.unit.split(' ')[0]);
                  return s + ua.allocation * (unit?.cards ?? 0);
                }, 0).toLocaleString('id-ID')} L
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

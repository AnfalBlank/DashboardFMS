'use client';
import { useState } from 'react';
import { deliveries, tanks, products } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useToast } from '@/components/ui/Toast';

export default function DeliveryPage() {
  const totalDelivered = deliveries.reduce((s, d) => s + d.quantity, 0);
  const { success } = useToast();
  const [form, setForm] = useState({ date: '', supplier: 'PT Pertamina (Persero)', doc: '', product: '', tank: '', qty: '' });

  const handleSave = () => {
    if (!form.qty || !form.product) {
      return;
    }
    success('Delivery disimpan', `${form.qty} L ${form.product || ''} berhasil dicatat.`);
    setForm({ date: '', supplier: 'PT Pertamina (Persero)', doc: '', product: '', tank: '', qty: '' });
  };

  return (
    <div>
      <PageHeader title="Delivery Management" subtitle="Catat penerimaan BBM dari supplier / depot Pertamina">
        <Button variant="primary" size="sm" onClick={() => document.getElementById('delivery-form')?.scrollIntoView({ behavior: 'smooth' })}>
          + Input Delivery
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <KpiCard eyebrow="Total Delivery Bulan Ini" value={totalDelivered.toLocaleString('id-ID')} unit="L" accent="green" />
        <KpiCard eyebrow="Jumlah DO" value={deliveries.length.toString()} meta="bulan ini" accent="black" />
        <KpiCard eyebrow="Supplier" value="1" meta="PT Pertamina (Persero)" accent="blue" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* History */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Riwayat Delivery</h3>
            <Button variant="outline" size="sm" onClick={() => success('Export delivery', 'File sedang disiapkan.')}>Export</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="fuel-table">
              <thead><tr>
                <th>ID</th><th>Tanggal</th><th>Produk</th><th>Kuantitas</th><th>Tank</th><th>No. DO</th><th>Status</th>
              </tr></thead>
              <tbody>
                {deliveries.map(d => (
                  <tr key={d.id}>
                    <td className="font-mono text-[11px] text-zinc-500">{d.id}</td>
                    <td className="text-zinc-600">{d.date}</td>
                    <td><Badge variant="neutral">{d.product}</Badge></td>
                    <td className="font-semibold text-green-600">+{d.quantity.toLocaleString('id-ID')} L</td>
                    <td className="text-zinc-500">{d.tank}</td>
                    <td className="font-mono text-[12px] text-zinc-500">{d.docNumber}</td>
                    <td><Badge variant={statusVariant(d.status)}>{d.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Input form */}
        <Card id="delivery-form" className="scroll-mt-6">
          <h3 className="text-[13px] font-semibold mb-4">Input Delivery Baru</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Tanggal Delivery</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Supplier</label>
              <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Nomor DO</label>
              <input placeholder="DO-2026-09-001" value={form.doc} onChange={e => setForm(f => ({ ...f, doc: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Produk</label>
              <select value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10">
                <option value="">Pilih produk…</option>
                {products.map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Tank Tujuan</label>
              <select value={form.tank} onChange={e => setForm(f => ({ ...f, tank: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10">
                <option value="">Pilih tank…</option>
                {tanks.map(t => <option key={t.id}>{t.id} — {t.product}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Kuantitas (Liter)</label>
              <input type="number" placeholder="0" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <Button variant="primary" className="w-full" onClick={handleSave}>Simpan Delivery</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

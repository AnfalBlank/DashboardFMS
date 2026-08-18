'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Delivery, Tank, Product } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useToast } from '@/components/ui/Toast';

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: 'PT Pertamina Patra Niaga',
    doc_number: '',
    product_id: '',
    tank_id: '',
    quantity_l: '',
    delivery_note: '',
  });

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [delRes, tRes, pRes] = await Promise.allSettled([
        api.stock.deliveries(),
        api.tanks.list(),
        api.master.products(),
      ]);
      if (delRes.status === 'fulfilled' && delRes.value?.data) setDeliveries(delRes.value.data);
      if (tRes.status === 'fulfilled' && tRes.value?.data) setTanks(tRes.value.data);
      if (pRes.status === 'fulfilled' && pRes.value?.data) {
        setProducts(pRes.value.data);
        if (pRes.value.data.length > 0 && !form.product_id) {
          setForm(f => ({ ...f, product_id: pRes.value.data[0].id }));
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [form.product_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalDelivered = deliveries.reduce((s, d) => s + (d.quantity_l ?? d.quantity ?? 0), 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.quantity_l || !form.tank_id) {
      toastError('Data Belum Lengkap', 'Pilih produk, tangki tujuan, dan masukkan kuantitas liter.');
      return;
    }

    try {
      setSubmitting(true);
      await api.stock.addDelivery({
        date: form.date,
        supplier: form.supplier,
        doc_number: form.doc_number || undefined,
        product_id: form.product_id,
        tank_id: form.tank_id,
        quantity_l: Number(form.quantity_l),
        delivery_note: form.delivery_note || 'Penerimaan BBM via Mobil Tangki Pertamina',
      });
      success('Penerimaan Delivery Disimpan', `${form.quantity_l} L berhasil ditambahkan ke tangki ${form.tank_id}.`);
      setForm({
        date: new Date().toISOString().split('T')[0],
        supplier: 'PT Pertamina Patra Niaga',
        doc_number: '',
        product_id: products[0]?.id ?? '',
        tank_id: '',
        quantity_l: '',
        delivery_note: '',
      });
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan Delivery', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Supply & Delivery Management" subtitle="Catat penerimaan BBM dari supplier / depot Pertamina Patra Niaga">
        <Button variant="primary" size="sm" onClick={() => document.getElementById('delivery-form')?.scrollIntoView({ behavior: 'smooth' })}>
          + Input Delivery Baru
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <KpiCard eyebrow="Total Delivery Tercatat" value={totalDelivered.toLocaleString('id-ID')} unit="L" accent="green" />
        <KpiCard eyebrow="Jumlah Surat Jalan / DO" value={deliveries.length.toString()} meta="dokumen terverifikasi" accent="black" />
        <KpiCard eyebrow="Supplier Utama" value="Pertamina" meta="PT Pertamina Patra Niaga" accent="blue" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* History */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Riwayat Penerimaan Supply BBM</h3>
            <span className="text-[12px] text-zinc-400">{deliveries.length} penerimaan</span>
          </div>
          <div className="overflow-x-auto">
            <table className="fuel-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tanggal</th>
                  <th>Produk</th>
                  <th>Kuantitas</th>
                  <th>Tangki</th>
                  <th>No. DO</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[13px] text-zinc-400">
                      {loading ? 'Memuat data delivery…' : 'Belum ada data penerimaan delivery supply'}
                    </td>
                  </tr>
                ) : (
                  deliveries.map(d => (
                    <tr key={d.id}>
                      <td className="font-mono text-[11px] text-zinc-500">{d.id?.slice(-8)}</td>
                      <td className="text-zinc-600">{d.date}</td>
                      <td><Badge variant="neutral">{d.product_name || d.product}</Badge></td>
                      <td className="font-semibold text-green-600">
                        +{(d.quantity_l ?? d.quantity ?? 0).toLocaleString('id-ID')} L
                      </td>
                      <td className="text-zinc-500">{d.tank_id || d.tank}</td>
                      <td className="font-mono text-[12px] text-zinc-500">{d.doc_number || d.docNumber || '—'}</td>
                      <td><Badge variant={statusVariant(d.status)}>{d.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Input form */}
        <Card id="delivery-form" className="scroll-mt-6">
          <h3 className="text-[13px] font-semibold mb-4">Form Penerimaan Delivery Baru</h3>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Tanggal Delivery *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Supplier BBM *</label>
              <input
                required
                value={form.supplier}
                onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Nomor DO / Surat Jalan *</label>
              <input
                placeholder="DO-2026-0881"
                required
                value={form.doc_number}
                onChange={e => setForm(f => ({ ...f, doc_number: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Jenis Produk BBM *</label>
              <select
                value={form.product_id}
                onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">Pilih produk BBM…</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Tangki Pendam Tujuan *</label>
              <select
                value={form.tank_id}
                onChange={e => setForm(f => ({ ...f, tank_id: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">Pilih tangki pendam…</option>
                {tanks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id} — {t.product_name || t.product || t.code} ({t.current_l ?? t.current} L / {t.capacity_l ?? t.capacity} L)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Kuantitas Supply (Liter) *</label>
              <input
                type="number"
                step="1"
                required
                placeholder="8000"
                value={form.quantity_l}
                onChange={e => setForm(f => ({ ...f, quantity_l: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Catatan Delivery</label>
              <input
                placeholder="mis. Penerimaan via Mobil Tangki Pertamina No. Pol B 9123 ABC"
                value={form.delivery_note}
                onChange={e => setForm(f => ({ ...f, delivery_note: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <Button variant="primary" type="submit" className="w-full mt-2" disabled={submitting}>
              {submitting ? 'Menyimpan Delivery…' : 'Simpan & Konfirmasi Penerimaan'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Tank, Product, StockMovement } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

export default function StockAdjustmentPage() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<'form' | 'review'>('form');
  const [form, setForm] = useState({
    tank_id: '',
    product_id: '',
    delta: '',
    reason: '',
    type: 'subtract',
  });

  const { success, error: toastError } = useToast();
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tRes, pRes, mRes] = await Promise.allSettled([
        api.tanks.list(),
        api.master.products(),
        api.stock.movements({ limit: 50 }),
      ]);
      if (tRes.status === 'fulfilled' && tRes.value?.data) {
        setTanks(tRes.value.data);
        if (tRes.value.data.length > 0 && !form.tank_id) {
          setForm(f => ({
            ...f,
            tank_id: tRes.value.data[0].id,
            product_id: tRes.value.data[0].product_id,
          }));
        }
      }
      if (pRes.status === 'fulfilled' && pRes.value?.data) setProducts(pRes.value.data);
      if (mRes.status === 'fulfilled' && mRes.value?.data) {
        // filter adjustments or movements
        setMovements(mRes.value.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [form.tank_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedTank = tanks.find(t => t.id === form.tank_id);

  const handleSubmitAdjustment = async () => {
    if (!form.delta || !form.reason) {
      toastError('Data Belum Lengkap', 'Jumlah liter dan alasan penyesuaian wajib diisi.');
      return;
    }

    const deltaNum = form.type === 'subtract' ? -Math.abs(Number(form.delta)) : Math.abs(Number(form.delta));

    try {
      setSubmitting(true);
      await api.stock.adjust({
        product_id: form.product_id || selectedTank?.product_id || '',
        tank_id: form.tank_id,
        delta_l: deltaNum,
        reason: form.reason,
      });
      success('Adjustment Disimpan', `Penyesuaian stok ${deltaNum > 0 ? `+${deltaNum}` : deltaNum} L berhasil dicatat.`);
      setStep('form');
      setForm(f => ({ ...f, delta: '', reason: '' }));
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan Adjustment', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Stock Adjustment" subtitle="Penyesuaian stok fisik tangki (akibat penguapan, kalibrasi, atau sampling)">
        <Button variant="outline" size="sm" onClick={() => router.push('/stock')}>
          Kembali ke Stok
        </Button>
      </PageHeader>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-5 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-[13px] text-amber-800">
          <span className="font-semibold">Perhatian Audit:</span> Stock adjustment mengubah data saldo stok fisik secara permanen dan otomatis dicatat ke dalam audit trail sistem.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Form */}
        <Card className="col-span-1">
          <h3 className="text-[13px] font-semibold mb-4">Form Stock Adjustment</h3>
          {step === 'form' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Pilih Tangki Pendam *</label>
                <select
                  value={form.tank_id}
                  onChange={e => {
                    const tId = e.target.value;
                    const tank = tanks.find(t => t.id === tId);
                    setForm(f => ({
                      ...f,
                      tank_id: tId,
                      product_id: tank?.product_id || f.product_id,
                    }));
                  }}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
                >
                  {tanks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} — {t.product_name ?? t.product ?? t.code} ({t.current_l ?? t.current} L)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Tipe Penyesuaian *</label>
                <div className="flex gap-2">
                  {['subtract', 'add'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-2 rounded-lg text-[12.5px] font-medium border transition ${
                        form.type === t ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      {t === 'add' ? '+ Tambah (Gain)' : '− Kurangi (Loss/Evaporation)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Jumlah Liter *</label>
                <input
                  type="number"
                  step="1"
                  value={form.delta}
                  onChange={e => setForm(f => ({ ...f, delta: e.target.value }))}
                  placeholder="50"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Alasan Penyesuaian (Wajib) *</label>
                <textarea
                  rows={3}
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="mis. Koreksi penguapan suhu udara tinggi mingguan"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition resize-none"
                />
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => setStep('review')}
                disabled={!form.delta || !form.reason}
              >
                Review Penyesuaian
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-xl p-4 space-y-2 text-[13px] border border-zinc-100">
                <p className="font-semibold text-zinc-800 mb-2">Ringkasan Konfirmasi</p>
                {[
                  ['Tangki', `${form.tank_id} (${selectedTank?.product_name || selectedTank?.product})`],
                  ['Tipe', form.type === 'add' ? 'Penambahan (+)' : 'Pengurangan (−)'],
                  ['Kuantitas', `${form.type === 'subtract' ? '-' : '+'}${form.delta} L`],
                  ['Alasan', form.reason],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex gap-2">
                    <span className="text-zinc-500 w-20 flex-shrink-0">{k as string}</span>
                    <span className="font-medium text-zinc-800">{v as string}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>
                  Kembali
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleSubmitAdjustment} disabled={submitting}>
                  {submitting ? 'Memproses…' : '✓ Simpan Penyesuaian'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* History */}
        <div className="col-span-2">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold">Riwayat Mutasi & Penyesuaian Stok</h3>
              <Button variant="outline" size="sm" onClick={loadData}>Refresh</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="fuel-table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Tipe Mutasi</th>
                    <th>Produk / Tangki</th>
                    <th>Kuantitas</th>
                    <th>Keterangan / Alasan</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-[13px] text-zinc-400">
                        {loading ? 'Memuat riwayat mutasi…' : 'Belum ada log mutasi stok tercatat'}
                      </td>
                    </tr>
                  ) : (
                    movements.map((m, i) => (
                      <tr key={m.id || i}>
                        <td className="font-mono text-[11.5px] text-zinc-500">
                          {m.created_at ? new Date(m.created_at).toLocaleString('id-ID') : (m.date ?? '—')}
                        </td>
                        <td><Badge variant={m.type === 'DELIVERY' ? 'success' : m.type === 'ADJUSTMENT' ? 'warning' : 'neutral'}>{m.type}</Badge></td>
                        <td className="font-medium">{m.product_name || m.product || m.product_id}</td>
                        <td className={m.quantity_l < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                          {m.quantity_l > 0 ? `+${m.quantity_l}` : m.quantity_l} L
                        </td>
                        <td className="text-zinc-500 text-[12px] max-w-[200px] truncate">{m.notes || m.reason || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

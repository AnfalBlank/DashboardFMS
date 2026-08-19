'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Card as CardType, Approval, Product } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { CheckCircle, XCircle, Clock, Fuel } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function TopUpPage() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
  const [form, setForm] = useState({ card_id: '', product_id: '', amount: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { success, warning, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, aRes, pRes] = await Promise.allSettled([
        api.cards.list({ limit: 100 }),
        api.system.approvals('PENDING'),
        api.master.products(),
      ]);
      if (cRes.status === 'fulfilled' && cRes.value?.data) {
        setCards(cRes.value.data);
      }
      if (aRes.status === 'fulfilled' && aRes.value?.data) {
        setPendingApprovals(aRes.value.data);
      }
      if (pRes.status === 'fulfilled' && pRes.value?.data) {
        setProducts(pRes.value.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedCard = cards.find(
    c => c.id === form.card_id || c.card_number === form.card_id || c.number === form.card_id
  );

  const handleCardChange = (cardId: string) => {
    const card = cards.find(
      c => c.id === cardId || c.card_number === cardId || c.number === cardId
    );

    let matchedProdId = card?.product_id || '';
    if (!matchedProdId && card) {
      const fuelName = (
        card.product_name ||
        card.fuel_type ||
        card.fuelType ||
        ''
      ).toLowerCase();
      const matched = products.find(
        p =>
          p.id === card.product_id ||
          p.name.toLowerCase() === fuelName ||
          p.code.toLowerCase() === fuelName
      );
      if (matched) matchedProdId = matched.id;
    }

    setForm(f => ({
      ...f,
      card_id: cardId,
      product_id: matchedProdId || f.product_id || (products[0]?.id ?? ''),
    }));
  };

  const handleSubmitTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.card_id || !form.amount || !form.reason) {
      toastError('Data Belum Lengkap', 'Pilih kartu, isi jumlah liter, dan sertakan alasan dinas.');
      return;
    }

    const matchedProd = products.find(
      p =>
        p.id === form.product_id ||
        p.id === selectedCard?.product_id ||
        p.name.toLowerCase() ===
          (
            selectedCard?.product_name ||
            selectedCard?.fuel_type ||
            selectedCard?.fuelType ||
            ''
          ).toLowerCase()
    );

    const targetProductId =
      form.product_id ||
      selectedCard?.product_id ||
      matchedProd?.id ||
      products[0]?.id;

    try {
      setSubmitting(true);
      await api.quota.topup({
        card_id: selectedCard?.id || form.card_id,
        product_id: targetProductId,
        amount_l: Number(form.amount),
        reason: form.reason,
      });
      success(
        'Top Up Kuota Berhasil',
        `Alokasi kuota sebesar ${form.amount} L berhasil ditambahkan ke kartu ${
          selectedCard?.card_number || selectedCard?.number || form.card_id
        }.`
      );
      setForm({ card_id: '', product_id: '', amount: '', reason: '' });
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Mengajukan Top Up', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.system.approve(id, 'Disetujui untuk pemenuhan tugas operasi pengamanan dinas kepolisian');
      success('Permohonan Disetujui', `Approval ${id} berhasil disetujui.`);
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Approve', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.system.reject(id, 'Ditolak karena melebihi pagu anggaran alokasi bulanan Satker');
      warning('Permohonan Ditolak', `Approval ${id} telah ditolak.`);
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Reject', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    }
  };

  return (
    <div>
      <PageHeader title="Top Up Quota" subtitle="Tambah kuota BBM kartu darurat / operasional dengan approval workflow" />

      <div className="grid grid-cols-3 gap-5">
        {/* Form */}
        <div className="col-span-1 space-y-4">
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Pengajuan Top Up Kuota</h3>
            <form onSubmit={handleSubmitTopup} className="space-y-3">
              <Select
                label="Pilih Kartu BBM *"
                value={form.card_id}
                onChange={handleCardChange}
                options={[
                  { value: '', label: 'Pilih kartu terdaftar…' },
                  ...cards.map(c => {
                    const num = c.card_number || c.number || '';
                    const holder = c.holder_name || c.holder || '';
                    const fuel = c.product_name || c.fuel_type || c.fuelType || '';
                    return { value: c.id || num, label: `${num} — ${holder}${fuel ? ` (${fuel})` : ''}` };
                  }),
                ]}
              />

              {selectedCard && (
                <div className="bg-zinc-50 rounded-xl p-3 text-[12.5px] space-y-2 border border-zinc-200">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Pemegang</span>
                    <span className="font-semibold text-zinc-900">{selectedCard.holder_name || selectedCard.holder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Satker</span>
                    <span className="font-medium">{selectedCard.unit_name || selectedCard.unit || 'SPBP'}</span>
                  </div>
                  {selectedCard.police_number && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Kendaraan Dinas</span>
                      <span className="font-mono font-medium text-zinc-800">{selectedCard.police_number}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Pagu Bulanan</span>
                    <span className="font-semibold text-zinc-900">{selectedCard.monthly_limit ?? selectedCard.monthlyLimit ?? 200} L</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-zinc-200/60">
                    <span className="text-zinc-500">Produk BBM</span>
                    <Badge variant="neutral">
                      <Fuel size={11} className="inline mr-1 opacity-70" />
                      {selectedCard.product_name || selectedCard.fuel_type || selectedCard.fuelType || 'Pertamax'}
                    </Badge>
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <Select
                  label="Produk BBM yang Di-top Up *"
                  value={form.product_id}
                  onChange={v => setForm(f => ({ ...f, product_id: v }))}
                  options={products.map(p => ({
                    value: p.id,
                    label: `${p.name} (${p.code})`,
                  }))}
                />
              )}

              <Input
                label="Jumlah Tambahan Kuota (Liter) *"
                placeholder="mis. 50"
                type="number"
                value={form.amount}
                onChange={v => setForm(f => ({ ...f, amount: v }))}
              />

              <Textarea
                label="Alasan Dinas (Wajib) *"
                placeholder="mis. Tambahan alokasi dinas patroli luar kota"
                value={form.reason}
                onChange={v => setForm(f => ({ ...f, reason: v }))}
              />

              <Button variant="primary" type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Mengirim…' : 'Submit Top Up Kuota'}
              </Button>
            </form>
          </Card>

          {/* Workflow guide */}
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Alur Approval Sistem</h3>
            <div className="space-y-3">
              {[
                { step: '1. REQUEST', desc: 'Operator/Admin mengajukan top up kuota', done: true },
                { step: '2. AUDIT & LEDGER', desc: 'Penambahan tercatat di ledger kuota & audit log', done: true },
                { step: '3. DIRECT SYNC', desc: 'Pagu bertambah otomatis dan siap dispensing', done: true },
              ].map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${s.done ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-zinc-800">{s.step}</p>
                    <p className="text-[11.5px] text-zinc-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pending approvals */}
        <div className="col-span-2">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-[13px] font-semibold">Menunggu Approval</h3>
                <Badge variant={pendingApprovals.length > 0 ? 'warning' : 'neutral'}>
                  {pendingApprovals.length} pending
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={loadData}>Refresh</Button>
            </div>
            <div className="divide-y divide-zinc-50">
              {loading && pendingApprovals.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-zinc-400">Memeriksa antrean approval…</div>
              ) : pendingApprovals.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-zinc-400">
                  <Clock size={24} className="mx-auto mb-2 text-zinc-300" />
                  Tidak ada permintaan top-up yang menunggu approval saat ini.
                </div>
              ) : (
                pendingApprovals.map(a => (
                  <div key={a.id} className="px-5 py-4 hover:bg-zinc-50 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[12px] text-zinc-500">{a.id}</span>
                          <Badge variant={a.priority === 'HIGH' ? 'critical' : 'neutral'}>{a.priority ?? 'NORMAL'}</Badge>
                          <Badge variant="warning">PENDING</Badge>
                        </div>
                        <p className="text-[13.5px] font-semibold text-zinc-900">{a.type}</p>
                        <p className="text-[12.5px] text-zinc-500 mt-1">{a.detail}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(a.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-full text-[12px] font-medium transition"
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(a.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-full text-[12px] font-medium transition"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4 text-[11.5px] text-zinc-400">
                      <span>Diajukan oleh: <span className="font-medium text-zinc-600">{a.requested_by || a.requestedBy}</span></span>
                      <span>{a.requested_at ? new Date(a.requested_at).toLocaleString('id-ID') : (a.submittedAt ?? '—')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


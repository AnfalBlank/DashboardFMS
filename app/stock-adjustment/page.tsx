'use client';
import { useState } from 'react';
import { tanks } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { AlertTriangle } from 'lucide-react';

const adjHistory = [
  { id: 'ADJ-001', date: '08 Agu 2026', product: 'Pertamax', tank: 'T-01', before: 10050, after: 10000, delta: -50, reason: 'Koreksi pengukuran', requestedBy: 'PENGELOLA01', approvedBy: 'ADMIN01', status: 'APPROVED' },
  { id: 'ADJ-002', date: '01 Agu 2026', product: 'Pertalite', tank: 'T-02', before: 8020, after: 8000, delta: -20, reason: 'Penyesuaian opening stok', requestedBy: 'PENGELOLA01', approvedBy: 'ADMIN01', status: 'APPROVED' },
];

export default function StockAdjustmentPage() {
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [form, setForm] = useState({ product: 'T-01', delta: '', reason: '', type: 'subtract' });

  return (
    <div>
      <PageHeader title="Stock Adjustment" subtitle="Penyesuaian stok manual — memerlukan approval">
        <div />
      </PageHeader>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-5 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-[13px] text-amber-800">
          <span className="font-semibold">Perhatian:</span> Stock adjustment bersifat permanen dan memerlukan alasan yang jelas serta persetujuan dari pejabat berwenang.
          Semua perubahan akan dicatat dalam audit log.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Form */}
        <Card className="col-span-1">
          <h3 className="text-[13px] font-semibold mb-4">Request Adjustment</h3>
          {step === 'form' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Tank / Produk</label>
                <select value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10">
                  {tanks.map(t => <option key={t.id} value={t.id}>{t.id} — {t.product} ({t.current.toLocaleString('id-ID')} L)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Tipe Adjustment</label>
                <div className="flex gap-2">
                  {['subtract','add'].map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`flex-1 py-2 rounded-lg text-[12.5px] font-medium border transition ${form.type === t ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>
                      {t === 'add' ? '+ Tambah' : '− Kurangi'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Jumlah (Liter)</label>
                <input type="number" value={form.delta} onChange={e => setForm(f => ({ ...f, delta: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Alasan (wajib)</label>
                <textarea rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Jelaskan alasan penyesuaian stok…"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition resize-none" />
              </div>
              <Button variant="primary" className="w-full" onClick={() => setStep('review')}
                disabled={!form.delta || !form.reason}>
                Review Adjustment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-xl p-4 space-y-2 text-[13px]">
                <p className="font-semibold text-zinc-800 mb-2">Ringkasan Adjustment</p>
                {[
                  ['Tank', form.product],
                  ['Tipe', form.type === 'add' ? 'Penambahan' : 'Pengurangan'],
                  ['Jumlah', `${form.delta} L`],
                  ['Alasan', form.reason],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex gap-2">
                    <span className="text-zinc-500 w-16 flex-shrink-0">{k as string}</span>
                    <span className="font-medium text-zinc-800">{v as string}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>Kembali</Button>
                <Button variant="primary" className="flex-1">Submit ke Approval</Button>
              </div>
            </div>
          )}
        </Card>

        {/* History */}
        <div className="col-span-2">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100">
              <h3 className="text-[13px] font-semibold">Riwayat Adjustment</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="fuel-table">
                <thead><tr>
                  <th>ID</th><th>Tanggal</th><th>Produk</th><th>Tank</th>
                  <th>Sebelum</th><th>Sesudah</th><th>Delta</th><th>Alasan</th><th>Approval</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {adjHistory.map(a => (
                    <tr key={a.id}>
                      <td className="font-mono text-[11.5px] text-zinc-500">{a.id}</td>
                      <td className="text-zinc-600">{a.date}</td>
                      <td><Badge variant="neutral">{a.product}</Badge></td>
                      <td className="text-zinc-500">{a.tank}</td>
                      <td>{a.before.toLocaleString('id-ID')} L</td>
                      <td className="font-semibold">{a.after.toLocaleString('id-ID')} L</td>
                      <td className={a.delta < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                        {a.delta > 0 ? `+${a.delta}` : a.delta} L
                      </td>
                      <td className="text-zinc-500 text-[12px] max-w-[160px] truncate">{a.reason}</td>
                      <td className="font-mono text-[12px] text-zinc-500">{a.approvedBy}</td>
                      <td><Badge variant="success">{a.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

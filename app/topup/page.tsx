'use client';
import { useState } from 'react';
import { pendingApprovals, cards } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { CheckCircle, XCircle } from 'lucide-react';

export default function TopUpPage() {
  const [form, setForm] = useState({ card: '', amount: '', reason: '' });

  const selectedCard = cards.find(c => c.number === form.card);

  return (
    <div>
      <PageHeader title="Top Up Quota" subtitle="Tambah kuota BBM kartu dengan approval workflow" />

      <div className="grid grid-cols-3 gap-5">
        {/* Form */}
        <div className="col-span-1 space-y-4">
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Request Top Up</h3>
            <div className="space-y-3">
              <Select label="Nomor Kartu" value={form.card} onChange={v => setForm(f => ({ ...f, card: v }))}
                options={[{ value: '', label: 'Pilih kartu…' }, ...cards.map(c => ({ value: c.number, label: `${c.number} — ${c.holder}` }))]} />

              {selectedCard && (
                <div className="bg-zinc-50 rounded-xl p-3 text-[12.5px] space-y-1.5">
                  <div className="flex justify-between"><span className="text-zinc-500">Pemegang</span><span className="font-medium">{selectedCard.holder}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Unit</span><span className="font-medium">{selectedCard.unit}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Sisa Kuota</span><span className="font-semibold text-zinc-900">{selectedCard.remaining} L</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Limit Bulanan</span><span className="font-medium">{selectedCard.monthlyLimit} L</span></div>
                </div>
              )}

              <Input label="Jumlah Top Up (Liter)" placeholder="mis. 50" type="number"
                value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v }))} />

              {selectedCard && form.amount && (
                <div className="bg-[#c1fbd4]/40 rounded-xl p-3 text-[12.5px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Sisa setelah top up</span>
                    <span className="font-semibold text-green-700">
                      {selectedCard.remaining + Number(form.amount)} L
                    </span>
                  </div>
                </div>
              )}

              <Textarea label="Alasan" placeholder="Jelaskan alasan top up…"
                value={form.reason} onChange={v => setForm(f => ({ ...f, reason: v }))} />

              <Button variant="primary" className="w-full">Submit untuk Approval</Button>
            </div>
          </Card>

          {/* Workflow */}
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Alur Approval</h3>
            <div className="space-y-3">
              {[
                { step: 'REQUEST', desc: 'Admin mengajukan top up', done: true },
                { step: 'PENDING APPROVAL', desc: 'Menunggu persetujuan', done: false },
                { step: 'APPROVED', desc: 'Disetujui oleh pejabat berwenang', done: false },
                { step: 'QUOTA UPDATED', desc: 'Kuota diperbarui otomatis', done: false },
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
                <Badge variant="warning">{pendingApprovals.length} pending</Badge>
              </div>
            </div>
            <div className="divide-y divide-zinc-50">
              {pendingApprovals.map(a => (
                <div key={a.id} className="px-5 py-4 hover:bg-zinc-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[12px] text-zinc-500">{a.id}</span>
                        <Badge variant={a.priority === 'HIGH' ? 'critical' : 'neutral'}>{a.priority}</Badge>
                      </div>
                      <p className="text-[13.5px] font-semibold text-zinc-900">{a.type}</p>
                      <p className="text-[12.5px] text-zinc-500 mt-1">{a.detail}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-full text-[12px] font-medium transition">
                        <CheckCircle size={12} />Approve
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-full text-[12px] font-medium transition">
                        <XCircle size={12} />Reject
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4 text-[11.5px] text-zinc-400">
                    <span>Diajukan oleh: <span className="font-medium text-zinc-600">{a.requestedBy}</span></span>
                    <span>{a.submittedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

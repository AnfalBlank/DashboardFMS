'use client';
import { pendingApprovals } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { CheckCircle, XCircle } from 'lucide-react';

const historyItems = [
  { id: 'APV-2026-091', type: 'TOP UP QUOTA', requestedBy: 'ADMIN01', detail: 'Kartu 007412 +100L', decidedBy: 'SUPERADMIN', decision: 'APPROVED', at: '08 Agu 2026 14:22' },
  { id: 'APV-2026-090', type: 'PRICE CHANGE', requestedBy: 'ADMIN01', detail: 'Pertamax Rp12.100 → Rp12.300', decidedBy: 'SUPERADMIN', decision: 'APPROVED', at: '01 Agu 2026 08:00' },
  { id: 'APV-2026-089', type: 'BLOCK CARD', requestedBy: 'ADMIN01', detail: 'Kartu 010044 — aktivitas mencurigakan', decidedBy: 'SUPERADMIN', decision: 'APPROVED', at: '09 Agu 2026 17:45' },
  { id: 'APV-2026-088', type: 'STOCK ADJUSTMENT', requestedBy: 'PENGELOLA01', detail: 'Koreksi Pertalite -20L', decidedBy: 'SUPERADMIN', decision: 'REJECTED', at: '07 Agu 2026 11:30' },
];

export default function ApprovalPage() {
  return (
    <div>
      <PageHeader title="Approval Center" subtitle="Kelola permintaan yang membutuhkan persetujuan">
        <Badge variant="warning">{pendingApprovals.length} pending</Badge>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Pending', value: pendingApprovals.length, color: 'text-amber-600' },
          { label: 'Approved (bulan ini)', value: 12, color: 'text-green-600' },
          { label: 'Rejected (bulan ini)', value: 2, color: 'text-red-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{k.label}</p>
            <p className={`text-[28px] font-light ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Pending */}
      <Card padding={false} className="mb-4">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-[13px] font-semibold">Menunggu Persetujuan</h3>
        </div>
        {pendingApprovals.length === 0 ? (
          <div className="px-5 py-10 text-center text-zinc-400 text-[13px]">Tidak ada permintaan pending</div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {pendingApprovals.map(a => (
              <div key={a.id} className="px-5 py-4 hover:bg-zinc-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[11.5px] text-zinc-400">{a.id}</span>
                      <Badge variant={a.priority === 'HIGH' ? 'critical' : 'neutral'}>{a.priority}</Badge>
                      <Badge variant="warning">PENDING</Badge>
                    </div>
                    <p className="text-[14px] font-semibold text-zinc-900">{a.type}</p>
                    <p className="text-[13px] text-zinc-500 mt-0.5">{a.detail}</p>
                    <div className="flex gap-4 mt-2 text-[11.5px] text-zinc-400">
                      <span>Oleh: <span className="font-medium text-zinc-600">{a.requestedBy}</span></span>
                      <span>{a.submittedAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-full text-[12px] font-medium transition">
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-full text-[12px] font-medium transition">
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* History */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-[13px] font-semibold">Riwayat Approval</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>ID</th><th>Tipe</th><th>Detail</th><th>Diajukan oleh</th>
              <th>Diputuskan oleh</th><th>Keputusan</th><th>Waktu</th>
            </tr></thead>
            <tbody>
              {historyItems.map(h => (
                <tr key={h.id}>
                  <td className="font-mono text-[11.5px] text-zinc-500">{h.id}</td>
                  <td><Badge variant="neutral">{h.type}</Badge></td>
                  <td className="text-zinc-600">{h.detail}</td>
                  <td className="font-mono text-[12px] text-zinc-600">{h.requestedBy}</td>
                  <td className="font-mono text-[12px] text-zinc-600">{h.decidedBy}</td>
                  <td><Badge variant={h.decision === 'APPROVED' ? 'success' : 'critical'}>{h.decision}</Badge></td>
                  <td className="text-zinc-400 text-[12px]">{h.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

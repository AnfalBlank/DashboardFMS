'use client';
import { useState } from 'react';
import { auditLogs } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';
import { Download, Search } from 'lucide-react';

const actionVariant = (action: string) => {
  if (action.includes('BLOCK') || action.includes('DELETE') || action.includes('VOID')) return 'critical';
  if (action.includes('UPDATE') || action.includes('PRICE') || action.includes('ADJUST')) return 'warning';
  if (action.includes('CREATE') || action.includes('GENERATE') || action.includes('APPROVE')) return 'success';
  return 'neutral';
};

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const { success } = useToast();

  const filtered = auditLogs.filter(l =>
    !search ||
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Riwayat lengkap semua aktivitas penting dalam sistem">
        <Button variant="outline" size="sm" onClick={() => success('Export audit log', 'File sedang disiapkan.')}>
          <Download size={13} />Export
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Entri',   value: auditLogs.length.toString() },
          { label: 'Hari Ini',      value: '3' },
          { label: 'Bulan Ini',     value: '142' },
          { label: 'User Aktif',    value: '4' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{k.label}</p>
            <p className="text-[24px] font-light text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari user, aksi, atau modul…"
          className="w-full max-w-sm pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition" />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Timestamp</th><th>User</th><th>Aksi</th><th>Modul</th>
              <th>Record ID</th><th>Sebelum</th><th>Sesudah</th><th>Alasan</th><th>IP Address</th>
            </tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td className="font-mono text-[11.5px] text-zinc-500 whitespace-nowrap">{l.timestamp}</td>
                  <td className="font-mono font-semibold text-zinc-700">{l.user}</td>
                  <td><Badge variant={actionVariant(l.action) as any}>{l.action}</Badge></td>
                  <td><Badge variant="neutral">{l.module}</Badge></td>
                  <td className="font-mono text-[12px] text-zinc-500">{l.recordId}</td>
                  <td className="text-zinc-500 text-[12px] max-w-[120px] truncate">{l.before}</td>
                  <td className="text-zinc-700 text-[12px] font-medium max-w-[120px] truncate">{l.after}</td>
                  <td className="text-zinc-500 text-[12px] max-w-[160px] truncate">{l.reason}</td>
                  <td className="font-mono text-[11.5px] text-zinc-400">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-[12px] text-zinc-400">Menampilkan {filtered.length} entri</span>
          <div className="flex gap-1.5">
            {['←','1','2','3','→'].map((p, i) => (
              <button key={p} className={`px-3 py-1.5 text-[12px] rounded-full border transition ${i === 1 ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

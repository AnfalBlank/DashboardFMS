'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, AuditLog } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Search, RefreshCw } from 'lucide-react';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAudit = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.system.audit({ limit: 100 });
      if (res?.data) {
        setLogs(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const filtered = logs.filter(l => {
    const action = l.action || '';
    const user = l.username || l.user || '';
    const target = l.target || l.resource || '';
    return !search || action.toLowerCase().includes(search.toLowerCase()) || user.toLowerCase().includes(search.toLowerCase()) || target.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader title="System Audit Trail" subtitle="Catatan log aktivitas pengguna dan perubahan data penting dalam sistem">
        <Button variant="outline" size="sm" onClick={loadAudit}>
          <RefreshCw size={13} /> Refresh
        </Button>
      </PageHeader>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari user, aktivitas aksi, atau target…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition"
          />
        </div>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Waktu Kejadian</th>
                <th>Pengguna</th>
                <th>Aksi (Action)</th>
                <th>Target / Modul</th>
                <th>Detail Informasi</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-[13px] text-zinc-400">Memuat log audit trail…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-[13px] text-zinc-400">Tidak ada catatan audit yang sesuai filter</td></tr>
              ) : (
                filtered.map((l, i) => (
                  <tr key={l.id || i}>
                    <td className="font-mono text-[11.5px] text-zinc-500">
                      {l.created_at ? new Date(l.created_at).toLocaleString('id-ID') : (l.timestamp ?? '—')}
                    </td>
                    <td className="font-medium text-zinc-900">{l.username || l.user}</td>
                    <td><Badge variant="neutral">{l.action}</Badge></td>
                    <td className="font-medium text-zinc-700">{l.target || l.resource || '—'}</td>
                    <td className="text-zinc-500 text-[12px] max-w-sm overflow-scroll">
                      {l.detail || l.description || (l.before_val && l.after_val ? <><div className='font-mono'>{JSON.stringify(JSON.parse(l.before_val!))}</div><i>to</i><pre>{JSON.stringify(JSON.parse(l.after_val!))}</pre></> : null) || '—'}
                    </td>
                    <td className="font-mono text-[11.5px] text-zinc-400">{l.ip_address || l.ip || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

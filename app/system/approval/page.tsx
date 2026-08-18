'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Approval } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Input';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function SystemApprovalPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [statusF, setStatusF] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const { success, warning, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.system.approvals(statusF !== 'ALL' ? statusF : undefined);
      if (res?.data) {
        setApprovals(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [statusF]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    try {
      await api.system.approve(id, 'Disetujui');
      success('Disetujui', `Permohonan ${id} berhasil disetujui.`);
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Approve', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.system.reject(id, 'Ditolak');
      warning('Ditolak', `Permohonan ${id} telah ditolak.`);
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Reject', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    }
  };

  return (
    <div>
      <PageHeader title="Approval Workflow Management" subtitle="Daftar pengajuan persetujuan kuota darurat, penyesuaian stok, dan otorisasi">
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw size={13} /> Refresh
        </Button>
      </PageHeader>

      <div className="flex gap-3 mb-4">
        <Select
          value={statusF}
          onChange={setStatusF}
          options={[
            { value: 'ALL', label: 'Semua Status' },
            { value: 'PENDING', label: 'PENDING' },
            { value: 'APPROVED', label: 'APPROVED' },
            { value: 'REJECTED', label: 'REJECTED' },
          ]}
          className="w-48"
        />
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>ID Approval</th>
                <th>Jenis Pengajuan</th>
                <th>Detail Permohonan</th>
                <th>Diajukan Oleh</th>
                <th>Waktu Pengajuan</th>
                <th>Prioritas</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && approvals.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-[13px] text-zinc-400">Memuat data approval…</td></tr>
              ) : approvals.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-[13px] text-zinc-400">Tidak ada permohonan approval yang sesuai filter</td></tr>
              ) : (
                approvals.map(a => (
                  <tr key={a.id}>
                    <td className="font-mono text-[12px] font-semibold text-zinc-800">{a.id}</td>
                    <td className="font-semibold text-zinc-900">{a.type}</td>
                    <td className="text-zinc-600 text-[12.5px] max-w-sm">{a.detail}</td>
                    <td className="text-zinc-700 text-[12px]">{a.requested_by || a.requestedBy}</td>
                    <td className="text-zinc-400 text-[12px]">
                      {a.requested_at ? new Date(a.requested_at).toLocaleString('id-ID') : (a.submittedAt ?? '—')}
                    </td>
                    <td>
                      <Badge variant={a.priority === 'HIGH' ? 'critical' : 'neutral'}>
                        {a.priority || 'NORMAL'}
                      </Badge>
                    </td>
                    <td><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td>
                    <td>
                      {a.status === 'PENDING' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleApprove(a.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleReject(a.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      )}
                    </td>
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

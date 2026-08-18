'use client';
import { useState, useEffect } from 'react';
import { api, User } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { RefreshCw } from 'lucide-react';

export default function MasterOperatorsPage() {
  const [operators, setOperators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOperators = () => {
    setLoading(true);
    api.master.users()
      .then(res => {
        if (res?.data) {
          const ops = res.data.filter(u => u.role?.toLowerCase().includes('operator') || u.role?.toLowerCase().includes('petugas') || u.role?.toLowerCase().includes('admin'));
          setOperators(ops.length > 0 ? ops : res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOperators();
  }, []);

  return (
    <div>
      <PageHeader title="Master Operators" subtitle="Data petugas operator pulau pompa SPBP Polda Papua Barat">
        <Button variant="outline" size="sm" onClick={loadOperators}>
          <RefreshCw size={13} /> Refresh
        </Button>
      </PageHeader>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>NRP / ID</th>
                <th>Nama Operator</th>
                <th>Peran</th>
                <th>Satuan Kerja</th>
                <th>Status Tugas</th>
              </tr>
            </thead>
            <tbody>
              {loading && operators.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-[13px] text-zinc-400">Memuat data operator…</td></tr>
              ) : operators.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-[13px] text-zinc-400">Belum ada operator terdaftar</td></tr>
              ) : (
                operators.map(u => (
                  <tr key={u.id}>
                    <td className="font-mono font-semibold text-zinc-800">{u.username}</td>
                    <td className="font-medium text-zinc-900">{u.name}</td>
                    <td><Badge variant="neutral">{u.role}</Badge></td>
                    <td className="text-zinc-600 text-[12px]">{u.unit || u.department || 'SPBP Polda Papua Barat'}</td>
                    <td><Badge variant={statusVariant(u.status || 'ACTIVE')}>{u.status || 'ACTIVE'}</Badge></td>
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

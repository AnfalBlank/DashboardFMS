'use client';
import { useState, useEffect } from 'react';
import { api, User } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { RefreshCw } from 'lucide-react';

export default function SystemUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    api.master.users()
      .then(res => {
        if (res?.data) setUsers(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <PageHeader title="System Administrators & Users" subtitle="Manajemen akun pengguna dan hak akses sistem Fuel Monitoring">
        <Button variant="outline" size="sm" onClick={loadUsers}>
          <RefreshCw size={13} /> Refresh
        </Button>
      </PageHeader>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Nama Lengkap</th>
                <th>Role</th>
                <th>Satuan Kerja</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-[13px] text-zinc-400">Memuat data pengguna…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-[13px] text-zinc-400">Belum ada user terdaftar</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td className="font-mono font-semibold text-zinc-800">{u.username}</td>
                    <td className="font-medium text-zinc-900">{u.name}</td>
                    <td><Badge variant="neutral">{u.role}</Badge></td>
                    <td className="text-zinc-600 text-[12px]">{u.unit || u.department || 'Polda Papua Barat'}</td>
                    <td className="text-zinc-500 text-[12px]">{u.email || '—'}</td>
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

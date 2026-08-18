'use client';
import { useState, useEffect } from 'react';
import { api, Role } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { RefreshCw } from 'lucide-react';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = () => {
    setLoading(true);
    api.master.roles()
      .then(res => {
        if (res?.data) setRoles(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return (
    <div>
      <PageHeader title="System Roles" subtitle="Definisi peran dan level otorisasi sistem SPBP" />

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Nama Peran (Role)</th>
                <th>Deskripsi & Tanggung Jawab</th>
                <th>Jumlah Pengguna</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && roles.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-[13px] text-zinc-400">Memuat peran sistem…</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-[13px] text-zinc-400">Belum ada role terdaftar</td></tr>
              ) : (
                roles.map(r => (
                  <tr key={r.id}>
                    <td className="font-semibold text-zinc-900">{r.name}</td>
                    <td className="text-zinc-600 text-[12.5px]">{r.description}</td>
                    <td>{r.user_count ?? r.users_count ?? 1} user</td>
                    <td><Badge variant="success">AKTIF</Badge></td>
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

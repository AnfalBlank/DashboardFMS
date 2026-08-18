'use client';
import { useState, useEffect } from 'react';
import { api, Permission } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { RefreshCw } from 'lucide-react';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPermissions = () => {
    setLoading(true);
    api.master.permissions()
      .then(res => {
        if (res?.data) setPermissions(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  return (
    <div>
      <PageHeader title="System Permissions & Access Matrix" subtitle="Daftar hak akses dan otorisasi modul fungsional FMS" />

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Modul Sistem</th>
                <th>Aksi / Otorisasi</th>
                <th>Deskripsi Hak Akses</th>
              </tr>
            </thead>
            <tbody>
              {loading && permissions.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-[13px] text-zinc-400">Memuat hak akses…</td></tr>
              ) : permissions.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-[13px] text-zinc-400">Belum ada hak akses terdaftar</td></tr>
              ) : (
                permissions.map(p => (
                  <tr key={p.id}>
                    <td className="font-mono text-[12px] text-zinc-500">{p.id}</td>
                    <td className="font-semibold text-zinc-900">{p.module}</td>
                    <td><Badge variant="neutral">{p.action}</Badge></td>
                    <td className="text-zinc-600 text-[12.5px]">{p.description}</td>
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

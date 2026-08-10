'use client';
import { users } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export default function MasterUsersPage() {
  return (
    <div>
      <PageHeader title="User Management" subtitle="Kelola pengguna sistem dan hak akses">
        <Button variant="primary" size="sm">+ User Baru</Button>
      </PageHeader>
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Nama</th><th>Username</th><th>Email</th><th>Role</th>
              <th>Unit</th><th>Status</th><th>Login Terakhir</th><th></th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td className="font-mono text-[12px] text-zinc-600">{u.username}</td>
                  <td className="text-zinc-500 text-[12px]">{u.email}</td>
                  <td><Badge variant="neutral">{u.role}</Badge></td>
                  <td className="text-zinc-500 text-[12px]">{u.unit}</td>
                  <td><Badge variant={statusVariant(u.status)}>{u.status}</Badge></td>
                  <td className="text-zinc-400 text-[12px]">{u.lastLogin}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="text-[12px] text-zinc-400 hover:text-zinc-700 px-2 py-1 hover:bg-zinc-100 rounded-lg transition">Edit</button>
                      <button className="text-[12px] text-red-400 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded-lg transition">Reset PW</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

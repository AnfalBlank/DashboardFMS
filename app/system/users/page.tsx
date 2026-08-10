'use client';
import { users } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

const roles = [
  { name: 'Super Administrator', desc: 'Akses penuh ke semua modul dan konfigurasi', users: 1, color: 'bg-red-50 text-red-700' },
  { name: 'Administrator SPBP', desc: 'Operasional sistem, kartu, kuota, laporan', users: 2, color: 'bg-blue-50 text-blue-700' },
  { name: 'Operator', desc: 'Monitoring transaksi, pump, nozzle, shift', users: 3, color: 'bg-green-50 text-green-700' },
  { name: 'Pengelola BBM', desc: 'Tank, stok, delivery, totalizer, rekonsiliasi', users: 2, color: 'bg-amber-50 text-amber-700' },
  { name: 'Finance', desc: 'Transaksi, harga, rekap, laporan nominal', users: 1, color: 'bg-purple-50 text-purple-700' },
  { name: 'Pimpinan', desc: 'Dashboard read-only, laporan eksekutif', users: 1, color: 'bg-zinc-100 text-zinc-700' },
  { name: 'Auditor', desc: 'Read-only semua modul + audit log', users: 1, color: 'bg-zinc-100 text-zinc-600' },
];

export default function SystemUsersPage() {
  return (
    <div>
      <PageHeader title="Users & Roles" subtitle="Kelola pengguna sistem, role, dan hak akses">
        <Button variant="outline" size="sm">Kelola Role</Button>
        <Button variant="primary" size="sm">+ User Baru</Button>
      </PageHeader>

      {/* Role overview */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {roles.slice(0, 4).map(r => (
          <div key={r.name} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <div className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 ${r.color}`}>{r.name}</div>
            <p className="text-[12px] text-zinc-500 leading-snug mb-3">{r.desc}</p>
            <p className="text-[20px] font-light text-zinc-900">{r.users} <span className="text-[12px] text-zinc-400">user</span></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Users table */}
        <div className="col-span-1">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold">Semua Pengguna</h3>
              <Button variant="primary" size="sm">+ Tambah</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="fuel-table">
                <thead><tr>
                  <th>Nama</th><th>Username</th><th>Role</th><th>Status</th><th>Login Terakhir</th><th></th>
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-semibold text-zinc-600 flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-[13px]">{u.name}</p>
                            <p className="text-[11.5px] text-zinc-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-[12px] text-zinc-600">{u.username}</td>
                      <td><Badge variant="neutral">{u.role}</Badge></td>
                      <td><Badge variant={statusVariant(u.status)}>{u.status}</Badge></td>
                      <td className="text-zinc-400 text-[11.5px]">{u.lastLogin}</td>
                      <td>
                        <button className="text-[12px] text-zinc-400 hover:text-zinc-700 px-2 py-1 hover:bg-zinc-100 rounded-lg transition">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Roles */}
        <div className="col-span-1">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold">Role & Permissions</h3>
              <Button variant="outline" size="sm">Edit Role</Button>
            </div>
            <div className="divide-y divide-zinc-50">
              {roles.map(r => (
                <div key={r.name} className="px-5 py-3.5 hover:bg-zinc-50 transition">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${r.color}`}>{r.name}</span>
                    </div>
                    <span className="text-[12.5px] font-semibold text-zinc-700">{r.users} user</span>
                  </div>
                  <p className="text-[12px] text-zinc-400">{r.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

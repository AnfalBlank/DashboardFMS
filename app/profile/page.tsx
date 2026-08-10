'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { auditLogs } from '@/lib/data';
import { User, Shield, Clock, Key } from 'lucide-react';

export default function ProfilePage() {
  const { success } = useToast();
  const [name, setName]   = useState('Ahmad Fauzi');
  const [email, setEmail] = useState('admin01@spbp.polri.go.id');
  const [phone, setPhone] = useState('+62 812 3456 7890');

  const userLogs = auditLogs.filter(l => l.user === 'ADMIN01');

  return (
    <div className="max-w-4xl">
      <PageHeader title="Profil Pengguna" subtitle="Kelola informasi akun dan keamanan Anda" />

      <div className="grid grid-cols-3 gap-5">
        {/* Left: avatar + info */}
        <div className="col-span-1 space-y-4">
          <Card className="text-center">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-[28px] font-bold text-white mb-3"
              style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
              AD
            </div>
            <p className="text-[15px] font-semibold text-zinc-900">Ahmad Fauzi</p>
            <p className="text-[12.5px] text-zinc-400 mt-0.5">ADMIN01</p>
            <Badge variant="success" className="mt-2">ACTIVE</Badge>
            <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2 text-[12.5px]">
              <div className="flex justify-between"><span className="text-zinc-500">Role</span><span className="font-medium">Administrator SPBP</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Unit</span><span className="font-medium">SPBP Manokwari</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Login terakhir</span><span className="font-medium">09 Agu 2026</span></div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-zinc-500" />
              <h3 className="text-[13px] font-semibold">Permission Saya</h3>
            </div>
            <div className="space-y-1.5">
              {['transaction.view','transaction.void','card.view','card.edit','card.block','quota.view','quota.generate','quota.topup','stock.view','report.view','report.export','audit.view'].map(p => (
                <div key={p} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="font-mono text-[11.5px] text-zinc-600">{p}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: edit form + activity */}
        <div className="col-span-2 space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <User size={14} className="text-zinc-500" />
              <h3 className="text-[13px] font-semibold">Informasi Profil</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input label="Nama Lengkap" value={name} onChange={setName} />
              <Input label="Username" value="ADMIN01" />
              <Input label="Email" value={email} onChange={setEmail} type="email" />
              <Input label="Nomor HP" value={phone} onChange={setPhone} />
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => success('Profil diperbarui', 'Data profil Anda berhasil disimpan.')}>
                Simpan Perubahan
              </Button>
              <Button variant="outline">Batal</Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Key size={14} className="text-zinc-500" />
              <h3 className="text-[13px] font-semibold">Ubah Password</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-4 max-w-sm">
              <Input label="Password Saat Ini" type="password" placeholder="••••••••" />
              <Input label="Password Baru" type="password" placeholder="••••••••" />
              <Input label="Konfirmasi Password Baru" type="password" placeholder="••••••••" />
            </div>
            <Button variant="primary"
              onClick={() => success('Password diperbarui', 'Password Anda berhasil diubah.')}>
              Ubah Password
            </Button>
          </Card>

          <Card padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
              <Clock size={14} className="text-zinc-500" />
              <h3 className="text-[13px] font-semibold">Aktivitas Saya</h3>
            </div>
            <div className="divide-y divide-zinc-50">
              {userLogs.map(l => (
                <div key={l.id} className="flex gap-3 px-5 py-3 hover:bg-zinc-50 transition">
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-zinc-800">{l.action} — {l.module}</p>
                    <p className="text-[12px] text-zinc-400 mt-0.5">{l.reason}</p>
                  </div>
                  <span className="text-[11.5px] text-zinc-400 flex-shrink-0">{l.timestamp}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

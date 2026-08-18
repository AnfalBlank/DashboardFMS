'use client';
import { useState, useEffect } from 'react';
import { api, User } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { KeyRound, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    api.auth.me()
      .then(res => {
        if (res?.data) setUser(res.data);
      })
      .catch(() => {});
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toastError('Password Wajib Diisi', 'Silakan isi password lama dan password baru.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Password Tidak Cocok', 'Konfirmasi password baru tidak cocok.');
      return;
    }

    try {
      setSubmitting(true);
      await api.auth.changePassword(oldPassword, newPassword);
      success('Password Berhasil Diubah', 'Gunakan password baru Anda untuk login berikutnya.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toastError('Gagal Mengubah Password', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="User Profile & Security" subtitle="Informasi akun pengguna dan pengaturan keamanan login" />

      <div className="grid grid-cols-2 gap-5">
        {/* User info */}
        <Card>
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-zinc-100">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-[18px] font-bold text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}
            >
              {(user?.name || user?.username || 'AD').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-zinc-900">{user?.name || 'Administrator SPBP'}</h3>
              <p className="text-[13px] text-zinc-400">@{user?.username || 'ADMIN01'}</p>
              <div className="mt-1">
                <Badge variant="neutral">{user?.role || 'Super Admin'}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-[13px]">
            {[
              ['Nama Lengkap', user?.name || 'Administrator SPBP'],
              ['Username Login', user?.username || 'ADMIN01'],
              ['Role / Level Hak Akses', user?.role || 'Super Admin'],
              ['Satuan Kerja', user?.unit || user?.department || 'SPBP Polda Papua Barat'],
              ['Email Dinas', user?.email || 'admin.spbp@papuabarat.polri.go.id'],
              ['Status Akun', user?.status || 'ACTIVE'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-zinc-50 last:border-0">
                <span className="text-zinc-500">{k}</span>
                <span className="font-medium text-zinc-800">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Change password */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={16} className="text-zinc-600" />
            <h3 className="text-[13px] font-semibold">Ubah Password Login</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <Input
              label="Password Saat Ini (Lama) *"
              type="password"
              value={oldPassword}
              onChange={setOldPassword}
              placeholder="••••••••"
            />
            <Input
              label="Password Baru *"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Minimal 6 karakter"
            />
            <Input
              label="Konfirmasi Password Baru *"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Ulangi password baru"
            />

            <Button variant="primary" type="submit" className="w-full mt-2" disabled={submitting}>
              {submitting ? 'Memproses…' : 'Perbarui Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

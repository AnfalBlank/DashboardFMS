'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Fuel, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login, user }         = useAuth();
  const router                  = useRouter();

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Username dan password wajib diisi'); return; }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      router.replace('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
      <div className="w-full max-w-md">
        {/* Logo card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
            <Fuel size={28} className="text-white" />
          </div>
          <h1 className="text-[22px] font-light text-zinc-900 tracking-tight">SPBP Manokwari</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Fuel Monitoring & Management System</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Polda Papua Barat</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,.08)] p-8">
          <h2 className="text-[16px] font-semibold text-zinc-900 mb-6">Masuk ke Sistem</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="mis. ADMIN01"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[13.5px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition placeholder:text-zinc-400"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-11 bg-zinc-50 border border-zinc-200 rounded-xl text-[13.5px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition placeholder:text-zinc-400"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-[14px] font-semibold text-white transition disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}
            >
              {loading ? 'Memverifikasi…' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-100">
            <p className="text-[11.5px] text-zinc-400 text-center">
              Default login: <span className="font-mono font-medium text-zinc-600">ADMIN01</span> /
              <span className="font-mono font-medium text-zinc-600"> Admin@2026</span>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-400 mt-6">
          © 2026 SPBP Polda Papua Barat — Fuel Management System v1.0
        </p>
      </div>
    </div>
  );
}

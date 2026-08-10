'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { AppShell } from './AppShell';

const PUBLIC_PATHS = ['/login'];

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname          = usePathname();
  const router            = useRouter();
  const isPublic          = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) router.replace('/login');
    if (user  &&  isPublic) router.replace('/');
  }, [user, loading, isPublic, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-zinc-400">Memuat sistem…</p>
        </div>
      </div>
    );
  }

  if (isPublic) return <>{children}</>;
  if (!user)    return null; // redirect in progress

  return <AppShell>{children}</AppShell>;
}

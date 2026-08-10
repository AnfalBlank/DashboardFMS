'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, Search, X, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { alerts } from '@/lib/data';
import { Badge } from '@/components/ui/Badge';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import Link from 'next/link';

export function Header() {
  const [notifOpen, setNotifOpen]     = useState(false);
  const [userOpen,  setUserOpen]      = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const userRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warning  = alerts.filter(a => a.severity === 'WARNING').length;

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ⌘K / Ctrl+K to open search */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 h-[60px] bg-white border-b border-slate-200 flex items-center px-6 gap-4 shadow-sm">

        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 flex-1 max-w-sm bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 hover:border-slate-300 hover:bg-slate-100 transition-all text-left"
        >
          <Search size={13} className="text-slate-400 flex-shrink-0" />
          <span className="text-[13px] text-slate-400 flex-1 select-none">Cari kartu, kendaraan, transaksi…</span>
          <kbd className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        <div className="flex items-center gap-2.5 ml-auto">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11.5px] font-semibold px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot flex-shrink-0" />
            Live
          </div>

          {/* Date */}
          <div className="text-[12px] text-slate-500 font-medium hidden lg:block">09 Agu 2026 · 18:31</div>

          <div className="w-px h-5 bg-slate-200" />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Bell size={15} />
              {(critical + warning) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-[360px] bg-white border border-slate-200 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,.18)] z-50 animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-slate-800">Notifikasi</span>
                    <Badge variant="critical">{critical} kritis</Badge>
                    <Badge variant="warning">{warning} warning</Badge>
                  </div>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 transition">
                    <X size={13} />
                  </button>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {alerts.map(a => (
                    <div key={a.id} className="flex gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition last:border-0 cursor-pointer">
                      <div className="flex-shrink-0 pt-1.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          a.severity === 'CRITICAL' ? 'bg-red-500' :
                          a.severity === 'WARNING'  ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[13px] font-semibold text-slate-800 leading-snug">{a.title}</p>
                          <span className="text-[11px] text-slate-300 flex-shrink-0 mt-0.5">{a.time}</span>
                        </div>
                        <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/system/audit" onClick={() => setNotifOpen(false)}>
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                    <p className="text-[12.5px] text-slate-500 hover:text-slate-800 font-medium text-center">
                      Lihat semua notifikasi →
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
                AD
              </div>
              <span className="text-[13px] font-medium text-slate-700">ADMIN01</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {userOpen && (
              <div className="absolute right-0 top-11 w-[220px] bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-8px_rgba(0,0,0,.18)] z-50 animate-fade-in overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <p className="text-[13px] font-semibold text-slate-800">Ahmad Fauzi</p>
                  <p className="text-[12px] text-slate-400">Administrator SPBP</p>
                </div>
                {/* Menu items */}
                <div className="py-1">
                  {[
                    { label: 'Profil Saya',         href: '/profile',  icon: <User size={13}/> },
                    { label: 'Pengaturan Sistem',    href: '/settings', icon: <Settings size={13}/> },
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setUserOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition cursor-pointer">
                        <span className="text-slate-400">{item.icon}</span>
                        <span className="text-[13px] font-medium text-slate-700">{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition">
                    <LogOut size={13} className="text-red-400" />
                    <span className="text-[13px] font-medium text-red-500">Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

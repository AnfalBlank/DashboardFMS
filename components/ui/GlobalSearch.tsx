'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, CreditCard, Car, Clock, Building2, X } from 'lucide-react';
import { cards, vehicles, transactions, units } from '@/lib/data';
import Link from 'next/link';
import { clsx } from 'clsx';

const allResults = [
  ...cards.map(c => ({
    type: 'Kartu', icon: <CreditCard size={13} />,
    label: `${c.number} — ${c.holder}`,
    sub: c.unit,
    href: '/cards',
    keywords: `${c.number} ${c.holder} ${c.unit}`.toLowerCase(),
  })),
  ...vehicles.map(v => ({
    type: 'Kendaraan', icon: <Car size={13} />,
    label: `${v.policeNumber} — ${v.brand} ${v.model}`,
    sub: v.unit,
    href: '/master/vehicles',
    keywords: `${v.policeNumber} ${v.brand} ${v.model} ${v.unit}`.toLowerCase(),
  })),
  ...transactions.slice(0, 20).map(t => ({
    type: 'Transaksi', icon: <Clock size={13} />,
    label: t.id,
    sub: `${t.holder} · ${t.product} · ${t.volume}L`,
    href: '/transactions',
    keywords: `${t.id} ${t.card} ${t.holder} ${t.vehicle}`.toLowerCase(),
  })),
  ...units.map(u => ({
    type: 'Unit', icon: <Building2 size={13} />,
    label: u.name,
    sub: `${u.cards} kartu · ${u.vehicles} kendaraan`,
    href: '/master/units',
    keywords: `${u.name} ${u.code}`.toLowerCase(),
  })),
];

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.length > 1
    ? allResults.filter(r => r.keywords.includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); setActive(0); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, results.length]);

  if (!open) return null;

  const typeColors: Record<string, string> = {
    'Kartu': 'bg-blue-50 text-blue-700',
    'Kendaraan': 'bg-green-50 text-green-700',
    'Transaksi': 'bg-zinc-100 text-zinc-600',
    'Unit': 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-[0_25px_60px_-10px_rgba(0,0,0,.35)] animate-fade-in overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100">
          <Search size={16} className="text-zinc-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0); }}
            placeholder="Cari kartu, kendaraan, transaksi, unit…"
            className="flex-1 text-[14px] text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-zinc-600">
              <X size={14} />
            </button>
          )}
          <kbd className="text-[11px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="py-2">
            {results.map((r, i) => (
              <Link key={i} href={r.href} onClick={onClose}>
                <div className={clsx(
                  'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
                  i === active ? 'bg-zinc-50' : 'hover:bg-zinc-50'
                )}>
                  <div className="text-zinc-400 flex-shrink-0">{r.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium text-zinc-900 truncate">{r.label}</p>
                    <p className="text-[12px] text-zinc-400 truncate">{r.sub}</p>
                  </div>
                  <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0', typeColors[r.type])}>
                    {r.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : query.length > 1 ? (
          <div className="py-10 text-center text-zinc-400 text-[13px]">
            Tidak ada hasil untuk &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="py-6 px-4">
            <p className="text-[11.5px] font-semibold text-zinc-400 uppercase tracking-wide mb-3">Pintasan</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Semua Transaksi', href: '/transactions', icon: <Clock size={13}/> },
                { label: 'Semua Kartu',     href: '/cards',        icon: <CreditCard size={13}/> },
                { label: 'Tank Monitoring', href: '/tanks',        icon: <Building2 size={13}/> },
                { label: 'Rekonsiliasi',    href: '/reconciliation', icon: <Search size={13}/> },
              ].map(s => (
                <Link key={s.href} href={s.href} onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[13px] font-medium text-zinc-700 transition">
                  <span className="text-zinc-400">{s.icon}</span>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-2.5 border-t border-zinc-100 flex items-center gap-4 text-[11px] text-zinc-400">
          <span><kbd className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono">↑↓</kbd> navigasi</span>
          <span><kbd className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono">↵</kbd> buka</span>
          <span><kbd className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono">ESC</kbd> tutup</span>
        </div>
      </div>
    </div>
  );
}

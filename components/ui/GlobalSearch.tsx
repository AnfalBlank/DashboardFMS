'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, CreditCard, Car, Clock, Building2, X } from 'lucide-react';
import { api, Card, Vehicle, Transaction, Unit } from '@/lib/api';
import Link from 'next/link';
import { clsx } from 'clsx';

interface SearchItem {
  type: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
  keywords: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
    setQuery('');
    setActive(0);
    setLoading(true);

    // Fetch live searchable records
    Promise.allSettled([
      api.cards.list({ limit: 50 }),
      api.master.vehicles(),
      api.transactions.list({ limit: 30 }),
      api.master.units(),
    ]).then(([cardsRes, vehRes, trxRes, unitRes]) => {
      const combined: SearchItem[] = [];

      if (cardsRes.status === 'fulfilled' && cardsRes.value?.data) {
        cardsRes.value.data.forEach((c: Card) => {
          const num = c.card_number || c.number || '';
          const holder = c.holder_name || c.holder || '';
          const unit = c.unit_name || c.unit || '';
          combined.push({
            type: 'Kartu',
            icon: <CreditCard size={13} />,
            label: `${num} — ${holder}`,
            sub: unit || 'Unit SPBP',
            href: '/cards',
            keywords: `${num} ${holder} ${unit}`.toLowerCase(),
          });
        });
      }

      if (vehRes.status === 'fulfilled' && vehRes.value?.data) {
        vehRes.value.data.forEach((v: Vehicle) => {
          const plate = v.police_number || v.policeNumber || '';
          const brand = v.brand || '';
          const model = v.model || '';
          const unit = v.unit_name || v.unit || '';
          combined.push({
            type: 'Kendaraan',
            icon: <Car size={13} />,
            label: `${plate} ${brand} ${model}`.trim(),
            sub: unit || 'Kendaraan Dinas',
            href: '/master/vehicles',
            keywords: `${plate} ${brand} ${model} ${unit}`.toLowerCase(),
          });
        });
      }

      if (trxRes.status === 'fulfilled' && trxRes.value?.data) {
        trxRes.value.data.forEach((t: Transaction) => {
          const id = t.id || '';
          const card = t.card_number || t.card || '';
          const holder = t.holder_name || t.holder || '';
          const vol = t.volume_l ?? t.volume ?? 0;
          const prod = t.product_name || t.product || '';
          combined.push({
            type: 'Transaksi',
            icon: <Clock size={13} />,
            label: id,
            sub: `${holder} · ${prod} · ${vol}L`,
            href: '/transactions',
            keywords: `${id} ${card} ${holder} ${prod}`.toLowerCase(),
          });
        });
      }

      if (unitRes.status === 'fulfilled' && unitRes.value?.data) {
        unitRes.value.data.forEach((u: Unit) => {
          const name = u.name || '';
          const code = u.code || '';
          combined.push({
            type: 'Unit',
            icon: <Building2 size={13} />,
            label: name,
            sub: `${code} · Satker Polda Papua Barat`,
            href: '/master/units',
            keywords: `${name} ${code}`.toLowerCase(),
          });
        });
      }

      setItems(combined);
      setLoading(false);
    });
  }, [open]);

  const results = query.length > 1
    ? items.filter(r => r.keywords.includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, Math.max(0, results.length - 1))); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
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
        {loading ? (
          <div className="py-10 text-center text-zinc-400 text-[13px]">
            Memuat indeks pencarian…
          </div>
        ) : results.length > 0 ? (
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
                { label: 'Semua Transaksi', href: '/transactions', icon: <Clock size={13} /> },
                { label: 'Semua Kartu', href: '/cards', icon: <CreditCard size={13} /> },
                { label: 'Tank Monitoring', href: '/tanks', icon: <Building2 size={13} /> },
                { label: 'Rekonsiliasi', href: '/reconciliation', icon: <Search size={13} /> },
              ].map(s => (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={onClose}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[13px] font-medium text-zinc-700 transition"
                >
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

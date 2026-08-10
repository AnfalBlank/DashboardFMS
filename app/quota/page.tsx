'use client';
import { useState } from 'react';
import { cards, quotaLedger } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';

export default function QuotaPage() {
  const [activePeriod, setActivePeriod] = useState('Agustus 2026');
  const { success, info } = useToast();
  const router = useRouter();

  const periods = ['Juli 2026 — CLOSED', 'Agustus 2026 — ACTIVE', 'September 2026 — PENDING'];

  return (
    <div>
      <PageHeader title="Quota Management" subtitle="Kelola kuota BBM per kartu per periode">
        <Button variant="outline" size="sm" onClick={() => success('Export dimulai', 'File quota sedang disiapkan.')}>Export</Button>
        <Button variant="aloe" size="sm" onClick={() => router.push('/allocation')}>Generate Massal →</Button>
        <Button variant="primary" size="sm" onClick={() => router.push('/topup')}>+ Top Up →</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Kuota" value="63.200" unit="L" accent="black" />
        <KpiCard eyebrow="Terpakai" value="48.240" unit="L" delta="76.4%" deltaDir="neutral" accent="green" />
        <KpiCard eyebrow="Sisa" value="14.960" unit="L" accent="blue" />
        <KpiCard eyebrow="Hangus (Jul)" value="3.240" unit="L" deltaDir="down" accent="amber" />
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-5">
        {periods.map(p => {
          const base = p.split(' —')[0];
          return (
            <button key={p} onClick={() => { setActivePeriod(base); if (p.includes('CLOSED')) info('Periode tertutup', 'Periode Juli 2026 sudah ditutup.'); }}
              className={clsx('px-4 py-2 rounded-full text-[12.5px] font-medium border transition',
                activePeriod === base ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 bg-white'
              )}>{p}</button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Quota table */}
        <div className="col-span-2">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold">Kuota per Kartu — {activePeriod}</h3>
              <Button variant="outline" size="sm" onClick={() => success('Export kuota', 'File sedang disiapkan.')}>Export</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="fuel-table">
                <thead><tr>
                  <th>Kartu</th><th>Pemegang</th><th>Unit</th><th>Produk</th>
                  <th>Alokasi</th><th>Top Up</th><th>Terpakai</th><th>Sisa</th><th>Utilisasi</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {cards.map(c => {
                    const util = Math.round((c.used / c.allocated) * 100);
                    return (
                      <tr key={c.id} className="cursor-pointer" onClick={() => router.push('/topup')}>
                        <td className="font-mono font-semibold text-zinc-700">{c.number}</td>
                        <td className="font-medium">{c.holder}</td>
                        <td className="text-zinc-500 text-[12px]">{c.unit}</td>
                        <td className="text-zinc-500 text-[12px]">{c.fuelType}</td>
                        <td>{c.allocated} L</td>
                        <td className="text-green-600">+0 L</td>
                        <td className="font-semibold">{c.used} L</td>
                        <td className={c.remaining <= 20 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{c.remaining} L</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div className={clsx('h-full rounded-full', util >= 90 ? 'bg-red-500' : util >= 75 ? 'bg-amber-400' : 'bg-emerald-500')}
                                style={{ width: `${util}%` }} />
                            </div>
                            <span className={clsx('text-[11.5px] font-semibold', util >= 90 ? 'text-red-600' : 'text-zinc-700')}>{util}%</span>
                          </div>
                        </td>
                        <td><Badge variant={statusVariant(c.status)}>{c.status}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Ledger */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100">
            <h3 className="text-[13px] font-semibold">Quota Ledger — 008231</h3>
            <p className="text-[11.5px] text-zinc-400 mt-1">AKP Hendra W.</p>
          </div>
          <div className="py-2">
            {quotaLedger.map((e, i) => (
              <div key={i} className="flex gap-3 px-5 py-3 border-b border-zinc-50 last:border-0">
                <div className="pt-0.5">
                  <span className={clsx('inline-block w-2 h-2 rounded-full',
                    e.type === 'TOPUP' ? 'bg-green-500' :
                    e.type === 'DEDUCTION' ? 'bg-red-400' : 'bg-blue-500'
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={clsx('text-[13.5px] font-semibold', e.amount > 0 ? 'text-green-600' : 'text-red-600')}>
                      {e.amount > 0 ? `+${e.amount}` : e.amount} L
                    </span>
                    <span className="text-[12.5px] font-semibold text-zinc-900">{e.balance} L</span>
                  </div>
                  <p className="text-[11.5px] text-zinc-500 mt-0.5">{e.description}</p>
                  <p className="text-[11px] text-zinc-300 mt-0.5">{e.date}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50 space-y-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-zinc-500">Saldo Saat Ini</span>
              <span className="font-semibold text-zinc-900">160 L</span>
            </div>
            <Button variant="primary" className="w-full" onClick={() => router.push('/topup')}>
              Top Up Kuota →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';
import { cards } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Download } from 'lucide-react';
import { clsx } from 'clsx';

export default function QuotaReportPage() {
  const totalAllocated = cards.reduce((s, c) => s + c.allocated, 0);
  const totalUsed = cards.reduce((s, c) => s + c.used, 0);
  const totalRemaining = cards.reduce((s, c) => s + c.remaining, 0);

  return (
    <div>
      <PageHeader title="Quota Report" subtitle="Laporan alokasi dan penggunaan kuota per kartu — Agustus 2026">
        <Button variant="outline" size="sm"><Download size={13} />Excel</Button>
        <Button variant="primary" size="sm"><Download size={13} />PDF</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Alokasi', value: `${totalAllocated.toLocaleString('id-ID')} L` },
          { label: 'Total Terpakai', value: `${totalUsed.toLocaleString('id-ID')} L` },
          { label: 'Total Sisa', value: `${totalRemaining.toLocaleString('id-ID')} L` },
          { label: 'Utilisasi Rata-rata', value: `${Math.round((totalUsed / totalAllocated) * 100)}%` },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{k.label}</p>
            <p className="text-[22px] font-light text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Kartu</th><th>Pemegang</th><th>Unit</th><th>Produk</th>
              <th>Alokasi</th><th>Top Up</th><th>Terpakai</th><th>Sisa</th><th>Hangus</th><th>Utilisasi %</th><th>Status</th>
            </tr></thead>
            <tbody>
              {cards.map(c => {
                const util = Math.round((c.used / c.allocated) * 100);
                return (
                  <tr key={c.id}>
                    <td className="font-mono font-semibold">{c.number}</td>
                    <td className="font-medium">{c.holder}</td>
                    <td className="text-zinc-500 text-[12px]">{c.unit}</td>
                    <td className="text-zinc-500 text-[12px]">{c.fuelType}</td>
                    <td>{c.allocated} L</td>
                    <td className="text-green-600">+0 L</td>
                    <td className="font-semibold">{c.used} L</td>
                    <td className={c.remaining <= 20 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{c.remaining} L</td>
                    <td className="text-amber-600">0 L</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className={clsx('h-full rounded-full', util >= 90 ? 'bg-red-500' : util >= 75 ? 'bg-amber-400' : 'bg-emerald-500')}
                            style={{ width: `${util}%` }} />
                        </div>
                        <span className={clsx('text-[12px] font-semibold', util >= 90 ? 'text-red-600' : 'text-zinc-700')}>{util}%</span>
                      </div>
                    </td>
                    <td><Badge variant={statusVariant(c.status)}>{c.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-50">
                <td colSpan={4} className="px-4 py-3 text-[12px] font-semibold text-zinc-600">TOTAL ({cards.length} kartu)</td>
                <td className="px-4 py-3 font-bold">{totalAllocated.toLocaleString('id-ID')} L</td>
                <td className="px-4 py-3 text-green-600 font-bold">+0 L</td>
                <td className="px-4 py-3 font-bold">{totalUsed.toLocaleString('id-ID')} L</td>
                <td className="px-4 py-3 font-bold">{totalRemaining.toLocaleString('id-ID')} L</td>
                <td className="px-4 py-3 text-amber-600 font-bold">0 L</td>
                <td className="px-4 py-3 font-bold">{Math.round((totalUsed / totalAllocated) * 100)}%</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, CardQuota, QuotaPeriod } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Download, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '@/components/ui/Toast';

export default function QuotaReportPage() {
  const [quotas, setQuotas] = useState<CardQuota[]>([]);
  const [periods, setPeriods] = useState<QuotaPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  useEffect(() => {
    api.quota.periods()
      .then(res => {
        if (res?.data && res.data.length > 0) {
          setPeriods(res.data);
          setSelectedPeriod(res.data[0].id || res.data[0].period);
        }
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async (periodId?: string) => {
    try {
      setLoading(true);
      const res = await api.reports.quota(periodId ? { period_id: periodId } : undefined);
      if (res?.data) {
        setQuotas(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedPeriod);
  }, [selectedPeriod, loadData]);

  const totalAllocated = quotas.reduce((s, c) => s + (c.allocated_l ?? 0), 0);
  const totalUsed = quotas.reduce((s, c) => s + (c.used_l ?? 0), 0);
  const totalRemaining = quotas.reduce((s, c) => s + (c.remaining_l ?? 0), 0);
  const totalTopup = quotas.reduce((s, c) => s + (c.topup_l ?? 0), 0);
  const totalExpired = quotas.reduce((s, c) => s + (c.expired_l ?? 0), 0);
  const avgUtil = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;

  return (
    <div>
      <PageHeader title="Quota Utilization Report" subtitle="Laporan alokasi dan realisasi pemakaian kuota BBM per kartu & satuan kerja">
        <Button variant="outline" size="sm" onClick={() => success('Export Excel', 'File Excel laporan kuota siap diunduh.')}>
          <Download size={13} /> Excel
        </Button>
        <Button variant="primary" size="sm" onClick={() => success('Export PDF', 'Dokumen PDF laporan kuota siap dicetak.')}>
          <Download size={13} /> PDF
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Alokasi', value: `${totalAllocated.toLocaleString('id-ID')} L` },
          { label: 'Total Terpakai', value: `${totalUsed.toLocaleString('id-ID')} L` },
          { label: 'Total Sisa', value: `${totalRemaining.toLocaleString('id-ID')} L` },
          { label: 'Utilisasi Rata-rata', value: `${avgUtil}%` },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{k.label}</p>
            <p className="text-[22px] font-light text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Period filter */}
      <div className="flex gap-2 mb-4 items-center flex-wrap">
        <span className="text-[12.5px] text-zinc-500 font-medium mr-2">Filter Periode:</span>
        {periods.map(p => {
          const pId = p.id || p.period;
          return (
            <button
              key={pId}
              onClick={() => setSelectedPeriod(pId)}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition',
                selectedPeriod === pId ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 bg-white'
              )}
            >
              {p.period}
            </button>
          );
        })}
        <Button variant="outline" size="sm" onClick={() => loadData(selectedPeriod)} className="ml-auto">
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Nomor Kartu</th>
                <th>Pemegang</th>
                <th>Satker</th>
                <th>Produk</th>
                <th>Alokasi</th>
                <th>Top Up</th>
                <th>Terpakai</th>
                <th>Sisa</th>
                <th>Hangus</th>
                <th>Utilisasi %</th>
              </tr>
            </thead>
            <tbody>
              {loading && quotas.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-[13px] text-zinc-400">Memuat laporan kuota…</td></tr>
              ) : quotas.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-[13px] text-zinc-400">Belum ada data kuota untuk periode ini</td></tr>
              ) : (
                quotas.map(c => {
                  const util = c.allocated_l > 0 ? Math.round((c.used_l / c.allocated_l) * 100) : 0;
                  return (
                    <tr key={c.id}>
                      <td className="font-mono font-semibold text-zinc-800">{c.card_number || c.card_id}</td>
                      <td className="font-medium text-zinc-900">{c.holder_name || '—'}</td>
                      <td className="text-zinc-500 text-[12px]">{c.unit_name || '—'}</td>
                      <td className="text-zinc-500 text-[12px]">{c.product_name || 'Pertamax'}</td>
                      <td>{c.allocated_l} L</td>
                      <td className="text-green-600">+{c.topup_l ?? 0} L</td>
                      <td className="font-semibold">{c.used_l} L</td>
                      <td className={c.remaining_l <= 20 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                        {c.remaining_l} L
                      </td>
                      <td className="text-amber-600">{c.expired_l ?? 0} L</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={clsx(
                                'h-full rounded-full',
                                util >= 90 ? 'bg-red-500' : util >= 75 ? 'bg-amber-400' : 'bg-emerald-500'
                              )}
                              style={{ width: `${Math.min(100, util)}%` }}
                            />
                          </div>
                          <span className={clsx('text-[12px] font-semibold', util >= 90 ? 'text-red-600' : 'text-zinc-700')}>
                            {util}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-50">
                <td colSpan={4} className="px-4 py-3 text-[12px] font-semibold text-zinc-600">
                  TOTAL ({quotas.length} kartu)
                </td>
                <td className="px-4 py-3 font-bold">{totalAllocated.toLocaleString('id-ID')} L</td>
                <td className="px-4 py-3 text-green-600 font-bold">+{totalTopup} L</td>
                <td className="px-4 py-3 font-bold">{totalUsed.toLocaleString('id-ID')} L</td>
                <td className="px-4 py-3 font-bold text-green-600">{totalRemaining.toLocaleString('id-ID')} L</td>
                <td className="px-4 py-3 text-amber-600 font-bold">{totalExpired} L</td>
                <td className="px-4 py-3 font-bold">{avgUtil}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

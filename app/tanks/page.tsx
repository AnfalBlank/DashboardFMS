'use client';
import { useState } from 'react';
import { tanks } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { clsx } from 'clsx';
import { Thermometer, Droplets, AlertTriangle, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const barColor = (s: string) =>
  s === 'CRITICAL' ? 'bg-red-500' :
  s === 'LOW'      ? 'bg-amber-400' :
  s === 'HIGH'     ? 'bg-blue-500'  : 'bg-emerald-500';

const readings = [
  { time: '18:31', t01: 12480, t02: 4480, t03: 4320, t04: 480, t05: 2480 },
  { time: '18:01', t01: 12510, t02: 4530, t03: 4340, t04: 495, t05: 2495 },
  { time: '17:31', t01: 12540, t02: 4580, t03: 4360, t04: 510, t05: 2510 },
  { time: '17:01', t01: 12580, t02: 4630, t03: 4380, t04: 525, t05: 2525 },
  { time: '16:31', t01: 12620, t02: 4680, t03: 4400, t04: 540, t05: 2540 },
];

export default function TanksPage() {
  const [selectedTank, setSelectedTank] = useState<string | null>(null);
  const { success, info } = useToast();
  const totalCapacity = tanks.reduce((s, t) => s + t.capacity, 0);
  const totalCurrent  = tanks.reduce((s, t) => s + t.current,  0);
  const criticalCount = tanks.filter(t => t.status === 'CRITICAL').length;
  const lowCount      = tanks.filter(t => t.status === 'LOW').length;

  return (
    <div>
      <PageHeader title="Tank Monitoring" subtitle="Pantau level BBM secara realtime dari ATG sensor">
        <Button variant="outline" size="sm" onClick={() => info('Riwayat pembacaan', 'Menampilkan 30 hari terakhir.')}>Riwayat Pembacaan</Button>
        <Button variant="primary" size="sm" onClick={() => info('Input manual', 'Form input pembacaan manual.')}>Input Manual</Button>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Kapasitas"    value={(totalCapacity / 1000).toFixed(0)} unit="KL" accent="black" />
        <KpiCard eyebrow="Total Stok"         value={(totalCurrent  / 1000).toFixed(1)} unit="KL"
          delta={`${Math.round((totalCurrent / totalCapacity) * 100)}% penuh`} deltaDir="neutral" accent="green" />
        <KpiCard eyebrow="Tank Kritis"        value={criticalCount.toString()}
          delta="perlu pengisian segera" deltaDir={criticalCount > 0 ? 'down' : 'neutral'} accent={criticalCount > 0 ? 'red' : 'green'} />
        <KpiCard eyebrow="Tank Low / Warning" value={lowCount.toString()}
          meta={`dari ${tanks.length} tank`} accent={lowCount > 0 ? 'amber' : 'green'} />
      </div>

      {/* Tank cards */}
      <div className="grid grid-cols-1 gap-4 mb-5">
        {tanks.map(t => {
          const pct = Math.round((t.current / t.capacity) * 100);
          const isSelected = selectedTank === t.id;
          return (
            <Card key={t.id} className={clsx('transition-all', isSelected && 'ring-2 ring-blue-500/30')}
              onClick={() => setSelectedTank(isSelected ? null : t.id)}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-[15px] font-semibold text-zinc-900">{t.id} — {t.product}</h3>
                    <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                  </div>
                  <p className="text-[12px] text-zinc-400">Pembacaan terakhir: {t.lastUpdate} WIB</p>
                </div>
                <div className="text-right">
                  <p className="text-[30px] font-light text-zinc-900 leading-none">{t.current.toLocaleString('id-ID')} L</p>
                  <p className="text-[12px] text-zinc-400 mt-1">dari {t.capacity.toLocaleString('id-ID')} L kapasitas</p>
                </div>
              </div>

              {/* Level bar */}
              <div className="relative w-full bg-zinc-100 rounded-full h-3 mb-4 overflow-hidden">
                <div className={clsx('h-full rounded-full transition-all duration-700', barColor(t.status))}
                  style={{ width: `${pct}%` }} />
                {/* threshold markers */}
                <div className="absolute top-0 bottom-0 w-px bg-amber-400/60" style={{ left: '30%' }} title="LOW threshold" />
                <div className="absolute top-0 bottom-0 w-px bg-red-400/60"   style={{ left: '15%' }} title="CRITICAL threshold" />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-4 px-0.5">
                <span>0</span>
                <span className="text-red-400">▲ CRITICAL 15%</span>
                <span className="text-amber-400">▲ LOW 30%</span>
                <span className="text-green-500 font-semibold">{pct}% saat ini</span>
                <span>{t.capacity.toLocaleString('id-ID')} L</span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'Level',        value: `${pct}%`,         icon: <Activity size={13}/> },
                  { label: 'Volume',       value: `${t.current.toLocaleString('id-ID')} L`, icon: <Droplets size={13}/> },
                  { label: 'Kapasitas',    value: `${t.capacity.toLocaleString('id-ID')} L`, icon: <Droplets size={13}/> },
                  { label: 'Temperatur',   value: `${t.temp}°C`,     icon: <Thermometer size={13}/> },
                  { label: 'Water Level',  value: `${t.waterLevel} cm`, icon: <AlertTriangle size={13}/> },
                ].map(s => (
                  <div key={s.label} className="bg-zinc-50 rounded-xl py-3 px-3 text-center">
                    <div className="flex justify-center text-zinc-400 mb-1">{s.icon}</div>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">{s.label}</p>
                    <p className="text-[14px] font-semibold text-zinc-900">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Threshold config note */}
              <div className="mt-4 flex items-center justify-between text-[12px] text-zinc-400">
                <span className="flex gap-4">
                  <span>🔴 CRITICAL &lt;15%</span>
                  <span>🟡 LOW &lt;30%</span>
                  <span>🔵 HIGH &gt;90%</span>
                </span>
                <Button variant="outline" size="sm" onClick={() => success('Riwayat pembacaan', `Membuka riwayat tank ${t.id}`)}>
                  Riwayat Bacaan
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Reading history table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Riwayat Pembacaan ATG — 30 Menit Terakhir</h3>
          <Button variant="outline" size="sm" onClick={() => success('Export', 'Riwayat pembacaan ATG sedang disiapkan.')}>Export</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Waktu</th>
                {tanks.map(t => <th key={t.id}>{t.id} ({t.product})</th>)}
              </tr>
            </thead>
            <tbody>
              {readings.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono text-[12px] text-zinc-500">{r.time}</td>
                  <td className="font-medium">{r.t01.toLocaleString('id-ID')} L</td>
                  <td className={r.t02 < 4800 ? 'text-amber-600 font-semibold' : 'font-medium'}>
                    {r.t02.toLocaleString('id-ID')} L
                  </td>
                  <td className="font-medium">{r.t03.toLocaleString('id-ID')} L</td>
                  <td className="text-red-600 font-semibold">{r.t04.toLocaleString('id-ID')} L</td>
                  <td className="font-medium">{r.t05.toLocaleString('id-ID')} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

'use client';
import { useEffect, useState, useCallback } from 'react';
import { KpiCard } from '@/components/ui/KpiCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { ConsumptionChart, StockByProductChart, QuotaDonut } from '@/components/dashboard/Charts';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { UnitRanking } from '@/components/dashboard/UnitRanking';
import { api, DashboardData, Tank, Transaction, Reconciliation, IntegrationStatus } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { Download, RefreshCw, Plus, Filter, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

function TankBar({ tank }: { tank: Tank }) {
  const cap = tank.capacity_l ?? tank.capacity ?? 1;
  const cur = tank.current_l ?? tank.current ?? 0;
  const pct = Math.min(100, Math.round((cur / cap) * 100));
  const color = tank.status === 'CRITICAL' ? 'bg-red-500' : tank.status === 'LOW' ? 'bg-amber-400' : 'bg-emerald-500';
  const textColor = tank.status === 'CRITICAL' ? 'text-red-600' : tank.status === 'LOW' ? 'text-amber-600' : 'text-emerald-600';
  const prodName = tank.product_name ?? tank.product ?? tank.code ?? tank.id;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
      <p className="text-[10px] font-semibold tracking-[0.5px] uppercase text-zinc-400 mb-3 truncate">{prodName}</p>
      <div className="bg-zinc-100 rounded-full h-1.5 mb-3 overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-end justify-between mb-1">
        <span className="text-[17px] font-light text-zinc-900">{cur.toLocaleString('id-ID')} L</span>
        <span className={clsx('text-[12px] font-semibold', textColor)}>{pct}%</span>
      </div>
      <p className="text-[11px] text-zinc-400 mb-2">Kap: {cap.toLocaleString('id-ID')} L</p>
      <Badge variant={statusVariant(tank.status)}>{tank.status}</Badge>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();
  const router = useRouter();

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, reconRes, integRes] = await Promise.allSettled([
        api.dashboard.get(),
        api.reconciliation.get(),
        api.system.integration(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setData(dashRes.value.data);
      }
      if (reconRes.status === 'fulfilled' && reconRes.value?.data) {
        setReconciliations(reconRes.value.data);
      }
      if (integRes.status === 'fulfilled' && integRes.value?.data) {
        setIntegration(integRes.value.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const kpi = data?.kpi;
  const tanks = data?.tanks ?? [];
  const recent = data?.recent_transactions ?? [];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-light tracking-tight text-zinc-900">Fuel Monitoring</h1>
          <p className="text-[13px] text-zinc-400 mt-1">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {data?.last_updated && ` · Update: ${new Date(data.last_updated).toLocaleTimeString('id-ID')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { loadAll(); success('Diperbarui', 'Data dashboard berhasil dimuat ulang.'); }}>
            <RefreshCw size={13} />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/reports/executive')}>
            <Download size={13} />Laporan Eksekutif
          </Button>
          <Button variant="aloe" size="sm" onClick={() => router.push('/reconciliation')}>
            <RefreshCw size={13} />Rekonsiliasi
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/allocation')}>
            <Plus size={13} />Generate Kuota
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-3 mb-5 flex-wrap">
        <Filter size={13} className="text-zinc-400 flex-shrink-0" />
        <span className="text-[11.5px] text-zinc-400 mr-1">Filter:</span>
        {['Bulan Ini', 'Semua Produk', 'Semua Unit'].map((f, i) => (
          <button
            key={f}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition border ${
              i === 0 ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
            }`}
          >
            {f}
          </button>
        ))}
        <Button variant="ghost" size="sm" className="ml-auto text-zinc-400" onClick={loadAll}>
          Reset
        </Button>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <KpiCard
          eyebrow="Total Stock"
          value={kpi ? (kpi.total_stock_l / 1000).toFixed(1) : '—'}
          unit="KL"
          delta={loading ? '…' : `${(kpi?.total_stock_l ?? 0).toLocaleString('id-ID')} L`}
          deltaDir="neutral"
          accent="green"
        />
        <KpiCard
          eyebrow="Penggunaan Hari Ini"
          value={kpi ? kpi.today_consumption_l.toLocaleString('id-ID') : '0'}
          unit="L"
          delta={kpi ? `${kpi.today_transactions} transaksi` : '0 transaksi'}
          deltaDir="neutral"
          accent="blue"
        />
        <KpiCard
          eyebrow="Penggunaan Bulanan"
          value={kpi ? kpi.monthly_consumption_l.toLocaleString('id-ID') : '0'}
          unit="L"
          delta={kpi ? `${kpi.monthly_transactions} transaksi` : '0 transaksi'}
          deltaDir="neutral"
          accent="blue"
        />
        <KpiCard
          eyebrow="Kartu Aktif"
          value={kpi ? kpi.active_cards.toString() : '0'}
          meta="kartu terdaftar"
          deltaDir="neutral"
          accent="black"
        />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard
          eyebrow="Utilisasi Kuota"
          value={kpi ? kpi.quota_utilization_pct.toFixed(1) : '0.0'}
          unit="%"
          deltaDir="neutral"
          accent="green"
        />
        <KpiCard
          eyebrow="Sisa Kuota"
          value={kpi ? (kpi.quota_remaining_l / 1000).toFixed(1) : '0.0'}
          unit="KL"
          deltaDir="neutral"
          accent="green"
        />
        <KpiCard
          eyebrow="Kuota Hangus"
          value={kpi ? kpi.quota_expired_l.toLocaleString('id-ID') : '0'}
          unit="L"
          deltaDir="down"
          accent="amber"
        />
        <KpiCard
          eyebrow="Nozzle Terpasang"
          value="7"
          unit="unit"
          meta="3 pump island"
          deltaDir="neutral"
          accent="black"
        />
      </div>

      {/* Tank Strip */}
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10.5px] font-semibold tracking-[0.6px] uppercase text-zinc-400">
          Tank Monitoring — Realtime ATG Sensor
        </p>
        <Link href="/tanks" className="text-[12px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium">
          Lihat Semua Tank <ArrowRight size={12} />
        </Link>
      </div>

      {tanks.length > 0 ? (
        <div className="grid grid-cols-5 gap-3 mb-5">
          {tanks.map(t => <TankBar key={t.id} tank={t} />)}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-3 mb-5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200 p-4 h-32 animate-pulse">
              <div className="h-2 bg-zinc-100 rounded mb-3" />
              <div className="h-1.5 bg-zinc-100 rounded-full mb-3" />
              <div className="h-5 bg-zinc-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2"><ConsumptionChart /></div>
        <QuotaDonut kpi={kpi} />
      </div>

      {/* Unit + Alerts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <UnitRanking />
        <AlertPanel onRefresh={loadAll} alerts={data?.alerts} />
      </div>

      {/* Reconciliation summary */}
      <Card padding={false} className="mb-4">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold">Rekonsiliasi Stok — Hari Ini</h3>
            <p className="text-[11.5px] text-zinc-400">Penyandingan stok buku vs stok fisik tangki</p>
          </div>
          <Link href="/reconciliation"><Button variant="outline" size="sm">Detail Rekonsiliasi</Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Opening</th>
                <th>Delivery</th>
                <th>Sales</th>
                <th>Teoritis</th>
                <th>Aktual</th>
                <th>Variance</th>
                <th>Var%</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-zinc-400 py-6 text-[13px]">
                    {loading ? 'Memuat data rekonsiliasi…' : 'Belum ada rekonsiliasi untuk hari ini'}
                  </td>
                </tr>
              ) : (
                reconciliations.map(r => {
                  const prod = r.product_name ?? r.product ?? r.product_id;
                  const openL = r.opening_l ?? r.opening ?? 0;
                  const delL = r.delivery_l ?? r.delivery ?? 0;
                  const salesL = r.sales_l ?? r.sales ?? 0;
                  const theoL = r.theoretical_closing ?? r.theoreticalClosing ?? 0;
                  const actL = r.actual_closing ?? r.actualClosing ?? 0;
                  const varL = r.variance_l ?? r.variance ?? 0;
                  const varPct = r.variance_pct ?? r.variancePct ?? 0;
                  return (
                    <tr key={prod}>
                      <td className="font-medium">{prod}</td>
                      <td>{openL.toLocaleString('id-ID')} L</td>
                      <td className="text-green-600">+{delL.toLocaleString('id-ID')} L</td>
                      <td className="text-red-600">−{salesL.toLocaleString('id-ID')} L</td>
                      <td>{theoL.toLocaleString('id-ID')} L</td>
                      <td>{actL.toLocaleString('id-ID')} L</td>
                      <td className={varL < 0 ? 'text-red-600 font-medium' : 'text-zinc-700'}>
                        {varL > 0 ? `+${varL}` : varL} L
                      </td>
                      <td className={varPct < 0 ? 'text-red-600 font-medium' : 'text-zinc-700'}>{varPct}%</td>
                      <td><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stock + Integration */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StockByProductChart tanks={tanks} />
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold">Integration Monitor</h3>
            <Badge variant={integration?.failed ? 'warning' : 'success'}>
              {integration?.failed ? 'ATTENTION' : 'SYNCED'}
            </Badge>
          </div>
          {[
            {
              label: 'Total Transaksi Diterima',
              value: (integration?.total_received ?? kpi?.monthly_transactions ?? 0).toLocaleString('id-ID'),
              color: 'text-zinc-900',
            },
            {
              label: 'Berhasil Disinkronkan',
              value: (integration?.synced ?? kpi?.monthly_transactions ?? 0).toLocaleString('id-ID'),
              color: 'text-green-600',
            },
            {
              label: 'Dalam Antrean (Pending)',
              value: (integration?.pending ?? 0).toString(),
              color: 'text-amber-600',
            },
            {
              label: 'Gagal / Anomali',
              value: (integration?.failed ?? 0).toString(),
              color: 'text-red-600',
            },
          ].map(i => (
            <div key={i.label} className="flex justify-between items-center py-3 border-b border-zinc-50 last:border-0">
              <span className="text-[13px] text-zinc-500">{i.label}</span>
              <span className={`text-[16px] font-light ${i.color}`}>{i.value}</span>
            </div>
          ))}
          <p className="text-[11.5px] text-zinc-400 mt-3">
            Last sync: {integration?.last_sync ? new Date(integration.last_sync).toLocaleTimeString('id-ID') : 'Realtime'}
          </p>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-[13px] font-semibold">Transaksi Terkini</h3>
            {kpi && <span className="text-[12px] text-zinc-400">{kpi.monthly_transactions.toLocaleString('id-ID')} transaksi</span>}
          </div>
          <div className="flex gap-2">
            <Link href="/transactions"><Button variant="outline" size="sm">Lihat Semua</Button></Link>
            <Button variant="primary" size="sm" onClick={() => router.push('/transactions')}>
              + Buat Transaksi
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Kartu</th>
                <th>Pemegang</th>
                <th>Produk</th>
                <th>Volume</th>
                <th>Total</th>
                <th>Pump</th>
                <th>Waktu</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-zinc-400 py-6 text-[13px]">
                    {loading ? 'Memuat data transaksi…' : 'Belum ada transaksi tercatat'}
                  </td>
                </tr>
              ) : (
                recent.map((t: Transaction) => {
                  const cardNum = t.card_number || t.card || '—';
                  const holder = t.holder_name || t.holder || '—';
                  const prod = t.product_name || t.product || '—';
                  const vol = t.volume_l ?? t.volume ?? 0;
                  const amt = t.total_amount ?? t.total ?? 0;
                  const pump = t.pump_number || t.pump || '—';
                  const nzl = t.nozzle_number || t.nozzle || '—';
                  const time = t.transaction_time || t.time;
                  return (
                    <tr key={t.id} className="cursor-pointer" onClick={() => router.push('/transactions')}>
                      <td className="font-mono text-[11px] text-zinc-400">{t.id?.slice(-8)}</td>
                      <td className="font-mono text-[12px] text-zinc-600 font-medium">{cardNum}</td>
                      <td className="font-medium text-zinc-900">{holder}</td>
                      <td><Badge variant="neutral">{prod}</Badge></td>
                      <td className="font-semibold">{vol} L</td>
                      <td className="font-semibold">Rp {amt.toLocaleString('id-ID')}</td>
                      <td className="text-zinc-400 text-[12px]">{pump}/{nzl}</td>
                      <td className="text-zinc-400 text-[12px]">
                        {time ? new Date(time).toLocaleTimeString('id-ID') : '—'}
                      </td>
                      <td><Badge variant={statusVariant(t.status)}>{t.status}</Badge></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

'use client';
import { kpiData, units, tanks, reconciliations, consumptionTrend } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Download } from 'lucide-react';

const COLORS = ['#000', '#16a34a', '#d97706', '#7c3aed', '#2563eb'];

export default function ExecutiveReportPage() {
  const unitData = units.map(u => ({ name: u.code, used: u.used, quota: u.quota }));
  const productData = tanks.map(t => ({ name: t.product.replace(' ', '\n'), stock: t.current }));
  const quotaData = [
    { name: 'Terpakai', value: kpiData.monthlyConsumption },
    { name: 'Sisa', value: kpiData.remainingQuota },
    { name: 'Hangus', value: kpiData.expiredQuota },
  ];

  return (
    <div>
      <PageHeader title="Executive Report" subtitle="Laporan ringkasan untuk pimpinan — Agustus 2026">
        <Button variant="outline" size="sm"><Download size={13} />Export PDF</Button>
        <Button variant="primary" size="sm"><Download size={13} />Export Excel</Button>
      </PageHeader>

      {/* Executive KPIs */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        <KpiCard eyebrow="Total Konsumsi" value="48.240" unit="L" accent="black" />
        <KpiCard eyebrow="Total Transaksi" value="4.821" accent="blue" />
        <KpiCard eyebrow="Kartu Aktif" value="486" accent="green" />
        <KpiCard eyebrow="Utilisasi Kuota" value="76.3" unit="%" accent="green" />
        <KpiCard eyebrow="Variance Stok" value="-0.32" unit="%" deltaDir="down" accent="amber" />
      </div>
      <div className="grid grid-cols-5 gap-3 mb-6">
        <KpiCard eyebrow="Total Kuota" value="63.200" unit="L" accent="black" />
        <KpiCard eyebrow="Kuota Terpakai" value="48.240" unit="L" accent="green" />
        <KpiCard eyebrow="Kuota Hangus" value="3.240" unit="L" deltaDir="down" accent="amber" />
        <KpiCard eyebrow="Stok Saat Ini" value="24.240" unit="L" accent="green" />
        <KpiCard eyebrow="Total Nilai BBM" value="Rp 593 Jt" accent="black" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Consumption trend */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100">
            <h3 className="text-[13px] font-semibold">Tren Konsumsi Harian</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={consumptionTrend.slice(0, 9)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="pertamax" stroke="#000" strokeWidth={2} dot={false} name="Pertamax" />
                <Line type="monotone" dataKey="pertalite" stroke="#16a34a" strokeWidth={2} dot={false} name="Pertalite" />
                <Line type="monotone" dataKey="dexlite" stroke="#d97706" strokeWidth={1.5} dot={false} name="Dexlite" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Usage by unit */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100">
            <h3 className="text-[13px] font-semibold">Konsumsi per Unit</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={unitData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${Number(v).toLocaleString('id-ID')} L`]} />
                <Bar dataKey="used" fill="#000" radius={[4, 4, 0, 0]} barSize={24} name="Terpakai" />
                <Bar dataKey="quota" fill="#e4e4e7" radius={[4, 4, 0, 0]} barSize={24} name="Kuota" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quota utilization donut */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100">
            <h3 className="text-[13px] font-semibold">Utilisasi Kuota</h3>
          </div>
          <div className="flex items-center gap-6 p-5">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={quotaData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" strokeWidth={0}>
                  {quotaData.map((_, i) => <Cell key={i} fill={['#000', '#e4e4e7', '#fbbf24'][i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {quotaData.map((d, i) => (
                <div key={d.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: ['#000', '#e4e4e7', '#fbbf24'][i] }} />
                    <span className="text-[12.5px] text-zinc-600">{d.name}</span>
                  </div>
                  <span className="text-[13px] font-semibold">{d.value.toLocaleString('id-ID')} L</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Stock by product */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100">
            <h3 className="text-[13px] font-semibold">Stok per Produk</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={productData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}KL`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#52525b', fontWeight: 500 }} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${Number(v).toLocaleString('id-ID')} L`]} />
                <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={12}>
                  {productData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Reconciliation summary */}
      <Card padding={false} className="mb-4">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-[13px] font-semibold">Status Rekonsiliasi Stok</h3>
        </div>
        <div className="table-scroll">
          <table className="fuel-table">
            <thead><tr>
              <th>Produk</th><th>Stok Teoritikal</th><th>Stok Aktual</th><th>Variance</th><th>Variance %</th><th>Status</th>
            </tr></thead>
            <tbody>
              {reconciliations.map(r => (
                <tr key={r.product}>
                  <td className="font-semibold">{r.product}</td>
                  <td>{r.theoreticalClosing.toLocaleString('id-ID')} L</td>
                  <td>{r.actualClosing.toLocaleString('id-ID')} L</td>
                  <td className={r.variance < 0 ? 'text-red-600 font-medium' : 'font-medium'}>{r.variance} L</td>
                  <td className={r.variancePct < 0 ? 'text-red-600 font-medium' : 'font-medium'}>{r.variancePct}%</td>
                  <td><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

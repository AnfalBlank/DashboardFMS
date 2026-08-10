'use client';
import { units, cards, transactions } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FuelUsagePage() {
  const totalVolume = transactions.reduce((s, t) => s + t.volume, 0);
  const totalAmount = transactions.reduce((s, t) => s + t.total, 0);
  const unitData = units.map(u => ({ name: u.code, used: u.used }));

  return (
    <div>
      <PageHeader title="Fuel Usage Report" subtitle="Analisis penggunaan BBM — Agustus 2026">
        <Button variant="outline" size="sm"><Download size={13} />Excel</Button>
        <Button variant="primary" size="sm"><Download size={13} />PDF</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Liter" value={`${totalVolume.toLocaleString('id-ID')}`} unit="L" accent="black" />
        <KpiCard eyebrow="Total Transaksi" value={transactions.length.toString()} accent="blue" />
        <KpiCard eyebrow="Total Nominal" value={`Rp ${(totalAmount / 1000000).toFixed(1)}Jt`} accent="green" />
        <KpiCard eyebrow="Rata-rata / Trx" value={`${Math.round(totalVolume / transactions.length)}`} unit="L" accent="black" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100"><h3 className="text-[13px] font-semibold">Usage per Unit</h3></div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={unitData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${Number(v).toLocaleString('id-ID')} L`]} />
                <Bar dataKey="used" fill="#000" radius={[4, 4, 0, 0]} barSize={28} name="Terpakai" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100"><h3 className="text-[13px] font-semibold">Top 5 Kartu Tertinggi</h3></div>
          <div className="overflow-x-auto">
            <table className="fuel-table">
              <thead><tr><th>Kartu</th><th>Pemegang</th><th>Unit</th><th>Volume</th><th>Utilisasi</th></tr></thead>
              <tbody>
                {cards.sort((a, b) => b.used - a.used).slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td className="font-mono font-semibold">{c.number}</td>
                    <td className="font-medium">{c.holder}</td>
                    <td className="text-zinc-500 text-[12px]">{c.unit}</td>
                    <td className="font-semibold">{c.used} L</td>
                    <td className="font-semibold text-zinc-700">{Math.round((c.used / c.allocated) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100"><h3 className="text-[13px] font-semibold">Penggunaan per Unit — Detail</h3></div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr><th>Unit</th><th>Jumlah Kartu</th><th>Kendaraan</th><th>Kuota</th><th>Terpakai</th><th>Sisa</th><th>Utilisasi</th></tr></thead>
            <tbody>
              {units.sort((a, b) => b.used - a.used).map(u => (
                <tr key={u.id}>
                  <td className="font-semibold">{u.name}</td>
                  <td>{u.cards}</td>
                  <td>{u.vehicles}</td>
                  <td>{u.quota.toLocaleString('id-ID')} L</td>
                  <td className="font-semibold">{u.used.toLocaleString('id-ID')} L</td>
                  <td className="text-green-600">{(u.quota - u.used).toLocaleString('id-ID')} L</td>
                  <td className="font-semibold">{Math.round((u.used / u.quota) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

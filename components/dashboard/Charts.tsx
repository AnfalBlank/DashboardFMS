'use client';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { consumptionTrend, tanks, kpiData } from '@/lib/data';
import { Card } from '@/components/ui/Card';

const COLORS = ['#000', '#16a34a', '#d97706', '#7c3aed', '#2563eb'];

export function ConsumptionChart() {
  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold">Tren Konsumsi Bulanan</h3>
        <span className="text-[12px] text-zinc-400">Agustus 2026</span>
      </div>
      <div className="px-5 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={consumptionTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v} L`]}
            />
            <Line type="monotone" dataKey="pertamax" stroke="#000" strokeWidth={2} dot={false} name="Pertamax" />
            <Line type="monotone" dataKey="pertalite" stroke="#16a34a" strokeWidth={2} dot={false} name="Pertalite" />
            <Line type="monotone" dataKey="dexlite" stroke="#d97706" strokeWidth={1.5} dot={false} name="Dexlite" />
            <Line type="monotone" dataKey="lainnya" stroke="#7c3aed" strokeWidth={1.5} dot={false} name="Lainnya" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 px-5 pb-4">
        {[['Pertamax','#000'],['Pertalite','#16a34a'],['Dexlite','#d97706'],['Lainnya','#7c3aed']].map(([l,c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c as string }} />
            <span className="text-[11.5px] text-zinc-500">{l}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function StockByProductChart() {
  const data = tanks.map(t => ({
    name: t.product.replace(' ', '\n'),
    stock: t.current,
    pct: Math.round((t.current / t.capacity) * 100),
  }));
  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-zinc-100">
        <h3 className="text-[13px] font-semibold">Stok per Produk</h3>
      </div>
      <div className="px-5 pt-4 pb-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false}
              tickFormatter={v => `${(v/1000).toFixed(0)}KL`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#52525b', fontWeight: 500 }} tickLine={false} axisLine={false} width={90} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${Number(v).toLocaleString('id-ID')} L`]}
            />
            <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={14}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function QuotaDonut() {
  const data = [
    { name: 'Terpakai', value: kpiData.monthlyConsumption },
    { name: 'Sisa', value: kpiData.remainingQuota },
    { name: 'Hangus', value: kpiData.expiredQuota },
  ];
  const DCOLORS = ['#000', '#e4e4e7', '#fbbf24'];
  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-zinc-100">
        <h3 className="text-[13px] font-semibold">Status Kuota</h3>
      </div>
      <div className="flex flex-col items-center py-4">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={DCOLORS[i]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${Number(v).toLocaleString('id-ID')} L`]}
            />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-[22px] font-light text-zinc-900 -mt-2">{kpiData.quotaUtilization}%</p>
        <p className="text-[12px] text-zinc-400">utilisasi kuota</p>
        <div className="w-full px-5 mt-4 space-y-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex justify-between items-center py-2 border-b border-zinc-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: DCOLORS[i] }} />
                <span className="text-[12.5px] text-zinc-500">{d.name}</span>
              </div>
              <span className="text-[12.5px] font-semibold text-zinc-800">{d.value.toLocaleString('id-ID')} L</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

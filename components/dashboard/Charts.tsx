'use client';
import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { api, Tank, KPI, UsageReport } from '@/lib/api';
import { Card } from '@/components/ui/Card';

const COLORS = ['#000000', '#16a34a', '#d97706', '#7c3aed', '#2563eb'];

interface TrendPoint {
  day: number | string;
  pertamax: number;
  pertalite: number;
  dexlite: number;
  lainnya?: number;
}

export function ConsumptionChart({ trend }: { trend?: TrendPoint[] }) {
  const [data, setData] = useState<TrendPoint[]>(trend ?? []);

  useEffect(() => {
    if (trend && trend.length > 0) {
      setData(trend);
      return;
    }
    api.reports.usage()
      .then(res => {
        if (res?.data?.daily_trend && res.data.daily_trend.length > 0) {
          const mapped = res.data.daily_trend.map((t, idx) => ({
            day: t.day ?? idx + 1,
            pertamax: t.pertamax ?? 0,
            pertalite: t.pertalite ?? 0,
            dexlite: t.dexlite ?? 0,
            lainnya: t.lainnya ?? 0,
          }));
          setData(mapped);
        } else {
          // If brand new day with no transactions, show baseline points
          setData(Array.from({ length: 7 }, (_, i) => ({
            day: i + 1,
            pertamax: 0,
            pertalite: 0,
            dexlite: 0,
            lainnya: 0,
          })));
        }
      })
      .catch(() => {});
  }, [trend]);

  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold">Tren Konsumsi Harian</h3>
        <span className="text-[12px] text-zinc-400">
          {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </span>
      </div>
      <div className="px-5 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${Number(v).toLocaleString('id-ID')} L`]}
            />
            <Line type="monotone" dataKey="pertamax" stroke="#000" strokeWidth={2} dot={false} name="Pertamax" />
            <Line type="monotone" dataKey="pertalite" stroke="#16a34a" strokeWidth={2} dot={false} name="Pertalite" />
            <Line type="monotone" dataKey="dexlite" stroke="#d97706" strokeWidth={1.5} dot={false} name="Dexlite" />
            <Line type="monotone" dataKey="lainnya" stroke="#7c3aed" strokeWidth={1.5} dot={false} name="Lainnya" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 px-5 pb-4">
        {[['Pertamax', '#000'], ['Pertalite', '#16a34a'], ['Dexlite', '#d97706'], ['Lainnya', '#7c3aed']].map(([l, c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }} />
            <span className="text-[11.5px] text-zinc-500">{l}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function StockByProductChart({ tanks }: { tanks?: Tank[] }) {
  const [data, setData] = useState<Array<{ name: string; stock: number; pct: number }>>([]);

  useEffect(() => {
    if (tanks && tanks.length > 0) {
      setData(tanks.map(t => {
        const cap = t.capacity_l ?? t.capacity ?? 1;
        const cur = t.current_l ?? t.current ?? 0;
        return {
          name: (t.product_name ?? t.product ?? t.code ?? t.id).replace(' ', '\n'),
          stock: cur,
          pct: Math.round((cur / cap) * 100),
        };
      }));
      return;
    }
    api.tanks.list()
      .then(res => {
        if (res?.data) {
          setData(res.data.map(t => {
            const cap = t.capacity_l ?? t.capacity ?? 1;
            const cur = t.current_l ?? t.current ?? 0;
            return {
              name: (t.product_name ?? t.product ?? t.code ?? t.id).replace(' ', '\n'),
              stock: cur,
              pct: Math.round((cur / cap) * 100),
            };
          }));
        }
      })
      .catch(() => {});
  }, [tanks]);

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
              tickFormatter={v => `${(v / 1000).toFixed(0)}KL`} />
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

export function QuotaDonut({ kpi }: { kpi?: KPI }) {
  const consumed = kpi?.monthly_consumption_l ?? 0;
  const remaining = kpi?.quota_remaining_l ?? 0;
  const expired = kpi?.quota_expired_l ?? 0;
  const utilization = kpi?.quota_utilization_pct ?? (consumed + remaining > 0 ? (consumed / (consumed + remaining)) * 100 : 0);

  const data = [
    { name: 'Terpakai', value: consumed },
    { name: 'Sisa', value: remaining },
    { name: 'Hangus', value: expired },
  ];
  const DCOLORS = ['#000000', '#e4e4e7', '#fbbf24'];

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
        <p className="text-[22px] font-light text-zinc-900 -mt-2">{utilization.toFixed(1)}%</p>
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

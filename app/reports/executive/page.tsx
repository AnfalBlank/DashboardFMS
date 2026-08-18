'use client';
import { useState, useEffect } from 'react';
import { api, ExecutiveReport } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Download, Printer } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function ExecutiveReportPage() {
  const [data, setData] = useState<ExecutiveReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  useEffect(() => {
    api.reports.executive()
      .then(res => {
        if (res?.data) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalStock = data?.stock_summary?.reduce((s, st) => s + (st.total_current ?? 0), 0) ?? 0;
  const totalVolume = data?.summary?.total_volume_l ?? data?.kpi?.monthly_consumption_l ?? 0;
  const totalAmount = data?.summary?.total_amount_rp ?? 0;
  const totalTrx = data?.summary?.total_transactions ?? data?.kpi?.monthly_transactions ?? 0;
  const topUnits = data?.top_units ?? [];

  return (
    <div>
      <PageHeader title="Executive Summary Report" subtitle="Laporan eksekutif manajemen bahan bakar minyak Polda Papua Barat">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer size={13} /> Cetak Laporan
        </Button>
        <Button variant="primary" size="sm" onClick={() => success('Export PDF', 'Dokumen PDF Executive Report sedang disiapkan.')}>
          <Download size={13} /> Download PDF
        </Button>
      </PageHeader>

      {/* Highlights */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">Total Penyaluran BBM</p>
          <p className="text-[24px] font-light text-zinc-900">{totalVolume.toLocaleString('id-ID')} L</p>
          <p className="text-[12px] text-zinc-400 mt-1">{totalTrx} transaksi</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">Total Nilai Penyaluran</p>
          <p className="text-[24px] font-light text-zinc-900">Rp {totalAmount.toLocaleString('id-ID')}</p>
          <p className="text-[12px] text-zinc-400 mt-1">Realisasi Anggaran</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">Total Stok Fisik Aktif</p>
          <p className="text-[24px] font-light text-zinc-900">{totalStock.toLocaleString('id-ID')} L</p>
          <p className="text-[12px] text-green-600 mt-1">Status Aman</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">Utilisasi Kuota Bulanan</p>
          <p className="text-[24px] font-light text-zinc-900">
            {data?.kpi?.quota_utilization_pct ? `${data.kpi.quota_utilization_pct.toFixed(1)}%` : '—'}
          </p>
          <p className="text-[12px] text-zinc-400 mt-1">Efisiensi Satker</p>
        </div>
      </div>

      {/* Top Consuming Units */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100">
            <h3 className="text-[13px] font-semibold">Top 5 Satuan Kerja Pengguna BBM Tertinggi</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topUnits} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#a1a1aa' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#52525b' }} tickLine={false} axisLine={false} width={120} />
                <Tooltip formatter={v => [`${Number(v).toLocaleString('id-ID')} L`]} />
                <Bar dataKey="total_l" fill="#000000" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Stock Breakdown */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100">
            <h3 className="text-[13px] font-semibold">Ringkasan Cadangan Stok BBM SPBP</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="fuel-table">
              <thead>
                <tr>
                  <th>Produk BBM</th>
                  <th>Stok Aktual (L)</th>
                  <th>Kapasitas Tangki (L)</th>
                  <th>Ketahanan Operasional</th>
                </tr>
              </thead>
              <tbody>
                {data?.stock_summary?.map(s => {
                  const cap = s.total_capacity || 1;
                  const cur = s.total_current || 0;
                  const days = Math.round(cur / 800); // approx 800L/day
                  return (
                    <tr key={s.product_id}>
                      <td className="font-medium">{s.product_name}</td>
                      <td className="font-semibold">{cur.toLocaleString('id-ID')} L</td>
                      <td>{cap.toLocaleString('id-ID')} L</td>
                      <td className="text-green-600 font-medium">± {days} Hari Operasi</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { reconciliations } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { clsx } from 'clsx';
import { CheckCircle } from 'lucide-react';

export default function ReconciliationPage() {
  const [closeModal, setCloseModal]   = useState(false);
  const [rerunModal, setRerunModal]   = useState(false);
  const { success, warning }          = useToast();

  return (
    <div>
      <PageHeader title="Reconciliation" subtitle="Bandingkan stok aktual vs teoritikal untuk setiap produk">
        <Button variant="outline" size="sm" onClick={() => success('Export rekonsiliasi', 'File sedang disiapkan.')}>Export</Button>
        <Button variant="aloe" size="sm" onClick={() => setRerunModal(true)}>Rekonsiliasi Sekarang</Button>
        <Button variant="primary" size="sm" onClick={() => setCloseModal(true)}>Tutup Periode</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Status Hari Ini"    value="NORMAL" accent="green" />
        <KpiCard eyebrow="Total Variance"     value="-55" unit="L" delta="-0.23%" deltaDir="down" accent="amber" />
        <KpiCard eyebrow="Produk PERFECT"     value={`${reconciliations.filter(r => r.status === 'PERFECT').length}`} accent="green" />
        <KpiCard eyebrow="Produk WARNING+"    value={`${reconciliations.filter(r => ['WARNING','CRITICAL'].includes(r.status)).length}`} accent="amber" />
      </div>

      {/* Status legend */}
      <div className="flex gap-3 mb-5">
        {[
          { s:'PERFECT',  desc:'Variance = 0',       bg:'bg-green-50 text-green-700 border-green-100' },
          { s:'NORMAL',   desc:'Variance ≤ ±0.50%',  bg:'bg-zinc-100 text-zinc-600 border-zinc-200' },
          { s:'WARNING',  desc:'Variance > ±0.50%',  bg:'bg-amber-50 text-amber-700 border-amber-100' },
          { s:'CRITICAL', desc:'Variance > ±1.00%',  bg:'bg-red-50 text-red-700 border-red-100' },
        ].map(({ s, desc, bg }) => (
          <div key={s} className={`px-3 py-2 rounded-xl text-[12px] border ${bg}`}>
            <span className="font-semibold">{s}</span> — {desc}
          </div>
        ))}
      </div>

      {/* Per-product detail */}
      {reconciliations.map(r => (
        <Card key={r.product} className="mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-zinc-900">{r.product}</h3>
              <p className="text-[12px] text-zinc-400">Agustus 2026</p>
            </div>
            <Badge variant={statusVariant(r.status)}>{r.status} {r.variancePct}%</Badge>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {[
              { label:'Opening',          value:`${r.opening.toLocaleString('id-ID')} L`, color:'' },
              { label:'Delivery',         value:`+${r.delivery.toLocaleString('id-ID')} L`, color:'text-green-600' },
              { label:'Sales',            value:`−${r.sales.toLocaleString('id-ID')} L`, color:'text-red-500' },
              { label:'Adjustment',       value:`${r.adjustment} L`, color:'' },
              { label:'Teoritis Closing', value:`${r.theoreticalClosing.toLocaleString('id-ID')} L`, color:'' },
              { label:'Aktual Closing',   value:`${r.actualClosing.toLocaleString('id-ID')} L`, color:'font-semibold' },
              { label:'Variance',         value:`${r.variance} L`, color: r.variance < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold' },
            ].map(item => (
              <div key={item.label} className="bg-zinc-50 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">{item.label}</p>
                <p className={clsx('text-[14px] font-medium text-zinc-900', item.color)}>{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Summary table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100"><h3 className="text-[13px] font-semibold">Ringkasan</h3></div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Produk</th><th>Opening</th><th>Delivery</th><th>Sales</th><th>Adj</th>
              <th>Teoritis</th><th>Aktual</th><th>Variance (L)</th><th>Variance %</th><th>Status</th>
            </tr></thead>
            <tbody>
              {reconciliations.map(r => (
                <tr key={r.product}>
                  <td className="font-semibold">{r.product}</td>
                  <td>{r.opening.toLocaleString('id-ID')} L</td>
                  <td className="text-green-600">+{r.delivery.toLocaleString('id-ID')} L</td>
                  <td className="text-red-500">−{r.sales.toLocaleString('id-ID')} L</td>
                  <td className="text-zinc-400">{r.adjustment}</td>
                  <td>{r.theoreticalClosing.toLocaleString('id-ID')} L</td>
                  <td className="font-semibold">{r.actualClosing.toLocaleString('id-ID')} L</td>
                  <td className={r.variance < 0 ? 'text-red-600 font-semibold' : 'text-zinc-700'}>{r.variance} L</td>
                  <td className={r.variancePct < 0 ? 'text-red-600 font-semibold' : 'text-zinc-700'}>{r.variancePct}%</td>
                  <td><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rerun modal */}
      <Modal open={rerunModal} onClose={() => setRerunModal(false)} title="Rekonsiliasi Sekarang" size="sm">
        <p className="text-[13px] text-zinc-600 mb-4">Sistem akan menghitung ulang variance antara stok aktual dan teoritikal berdasarkan data terkini.</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setRerunModal(false)}>Batal</Button>
          <Button variant="aloe" className="flex-1"
            onClick={() => { success('Rekonsiliasi selesai', 'Data variance telah diperbarui.'); setRerunModal(false); }}>
            <CheckCircle size={14} /> Jalankan
          </Button>
        </div>
      </Modal>

      {/* Close period modal */}
      <Modal open={closeModal} onClose={() => setCloseModal(false)} title="Tutup Periode Agustus 2026" size="sm">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-[13px] text-amber-700">
          ⚠ Tindakan ini akan mengunci seluruh transaksi dan data stok bulan Agustus 2026. Tidak dapat dibatalkan tanpa approval khusus.
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setCloseModal(false)}>Batal</Button>
          <Button variant="danger" className="flex-1"
            onClick={() => { warning('Periode ditutup', 'Agustus 2026 telah dikunci.'); setCloseModal(false); }}>
            Tutup Periode
          </Button>
        </div>
      </Modal>
    </div>
  );
}

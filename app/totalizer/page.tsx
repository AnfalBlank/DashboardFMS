'use client';
import { pumps } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';

export default function TotalizerPage() {
  const allNozzles  = pumps.flatMap(p => p.nozzles.map(n => ({ ...n, pumpNum: p.number, pumpStatus: p.status })));
  const totalUsage  = allNozzles.reduce((s, n) => s + n.usage, 0);
  const totalVar    = allNozzles.reduce((s, n) => s + n.variance, 0);
  const varCount    = allNozzles.filter(n => n.variance > 0).length;
  const { success, warning } = useToast();
  const [manualModal, setManualModal] = useState(false);
  const [openingModal, setOpeningModal] = useState(false);

  return (
    <div>
      <PageHeader title="Totalizer Management" subtitle="Monitor opening, current, dan closing totalizer per nozzle">
        <Button variant="outline" size="sm" onClick={() => setManualModal(true)}>Input Manual</Button>
        <Button variant="primary" size="sm" onClick={() => setOpeningModal(true)}>Set Opening</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Dispensing"  value={totalUsage.toLocaleString('id-ID')} unit="L" accent="black" />
        <KpiCard eyebrow="Total Variance"    value={`+${totalVar}`} unit="L"
          delta={varCount > 0 ? `${varCount} nozzle` : 'semua normal'}
          deltaDir={totalVar > 0 ? 'down' : 'up'} accent={totalVar > 0 ? 'amber' : 'green'} />
        <KpiCard eyebrow="Nozzle Aktif"      value={allNozzles.filter(n => n.status === 'ACTIVE').length.toString()} accent="green" />
        <KpiCard eyebrow="Nozzle Offline"    value={allNozzles.filter(n => n.status === 'OFFLINE').length.toString()} accent="amber" />
      </div>

      <Card padding={false} className="mb-4">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Detail Totalizer per Nozzle</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => success('Export totalizer', 'File sedang disiapkan.')}>Export</Button>
            <Button variant="aloe" size="sm"
              onClick={() => { success('Variance dihitung', `Total variance: +${totalVar} L terdeteksi.`); }}>
              Hitung Variance
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Pump</th><th>Nozzle</th><th>Produk</th><th>Opening Totalizer</th>
              <th>Current Totalizer</th><th>Actual Dispensed</th><th>System Transaksi</th>
              <th>Variance</th><th>Status</th>
            </tr></thead>
            <tbody>
              {allNozzles.map(n => (
                <tr key={n.id}>
                  <td className="font-semibold">Pump {n.pumpNum}</td>
                  <td>
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-100 rounded-full font-semibold text-[12px] text-zinc-700">
                      {n.number}
                    </span>
                  </td>
                  <td><Badge variant="neutral">{n.product}</Badge></td>
                  <td className="font-mono text-[12px] text-zinc-500">{n.totalizerOpen.toLocaleString('id-ID')}</td>
                  <td className="font-mono text-[12.5px] font-semibold text-zinc-800">{n.totalizerCurrent.toLocaleString('id-ID')}</td>
                  <td className="font-semibold">{n.usage.toLocaleString('id-ID')} L</td>
                  <td className="text-zinc-600">{n.systemSales.toLocaleString('id-ID')} L</td>
                  <td>
                    <span className={`font-semibold text-[13px] ${n.variance > 5 ? 'text-amber-600' : n.variance > 0 ? 'text-zinc-700' : 'text-green-600'}`}>
                      {n.variance > 0 ? `+${n.variance}` : '0'} L
                    </span>
                  </td>
                  <td>
                    {n.pumpStatus === 'OFFLINE' ? <Badge variant="neutral">OFFLINE</Badge>
                      : n.variance > 5 ? <Badge variant="warning">VARIANCE</Badge>
                      : <Badge variant="success">NORMAL</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-50">
                <td colSpan={5} className="px-4 py-3 text-[12px] font-semibold text-zinc-500">TOTAL</td>
                <td className="px-4 py-3 font-bold">{totalUsage.toLocaleString('id-ID')} L</td>
                <td className="px-4 py-3 font-bold">{allNozzles.reduce((s,n)=>s+n.systemSales,0).toLocaleString('id-ID')} L</td>
                <td className="px-4 py-3 font-bold text-amber-600">+{totalVar} L</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-[13px] text-amber-800">
        <span className="font-semibold">Catatan:</span> Penyesuaian totalizer manual memerlukan alasan dan approval.
      </div>

      {/* Manual input modal */}
      <Modal open={manualModal} onClose={() => setManualModal(false)} title="Input Totalizer Manual" subtitle="Hanya untuk koreksi data sensor yang tidak terbaca">
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Nozzle</label>
            <select className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10">
              {allNozzles.map(n => <option key={n.id}>Pump {n.pumpNum} — N{n.number} ({n.product})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Nilai Totalizer</label>
            <input type="number" placeholder="0" className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Alasan (wajib)</label>
            <textarea rows={2} placeholder="Jelaskan alasan koreksi…" className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setManualModal(false)}>Batal</Button>
            <Button variant="primary" className="flex-1"
              onClick={() => { warning('Menunggu approval', 'Request koreksi totalizer dikirim.'); setManualModal(false); }}>
              Submit ke Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Set opening modal */}
      <Modal open={openingModal} onClose={() => setOpeningModal(false)} title="Set Opening Totalizer" subtitle="Dilakukan pada awal shift/periode">
        <div className="space-y-3">
          {allNozzles.map(n => (
            <div key={n.id} className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-zinc-700 w-40 flex-shrink-0">P{n.pumpNum}/N{n.number} {n.product}</span>
              <input type="number" defaultValue={n.totalizerCurrent}
                className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono" />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpeningModal(false)}>Batal</Button>
            <Button variant="primary" className="flex-1"
              onClick={() => { success('Opening totalizer disimpan', 'Data berhasil dicatat.'); setOpeningModal(false); }}>
              Simpan Opening
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

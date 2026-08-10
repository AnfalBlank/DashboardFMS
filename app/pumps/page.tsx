'use client';
import { pumps } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';

export default function PumpsPage() {
  const activePumps   = pumps.filter(p => p.status === 'ACTIVE').length;
  const allNozzles    = pumps.flatMap(p => p.nozzles);
  const variantNozzles = allNozzles.filter(n => n.variance > 0);
  const { success }   = useToast();
  const router        = useRouter();
  const [addModal, setAddModal] = useState(false);

  return (
    <div>
      <PageHeader title="Pumps & Nozzles" subtitle="Monitor status pump, nozzle, dan totalizer dispensing">
        <Button variant="primary" size="sm" onClick={() => setAddModal(true)}>+ Pump</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Pump"      value={`${pumps.length}`} meta={`${activePumps} aktif`} accent="black" />
        <KpiCard eyebrow="Total Nozzle"    value={`${allNozzles.length}`} accent="blue" />
        <KpiCard eyebrow="Nozzle Variance" value={`${variantNozzles.length}`}
          delta={variantNozzles.length > 0 ? 'perlu investigasi' : 'semua normal'}
          deltaDir={variantNozzles.length > 0 ? 'down' : 'up'}
          accent={variantNozzles.length > 0 ? 'amber' : 'green'} />
        <KpiCard eyebrow="Dispensing Hari Ini" value="842" unit="L" accent="green" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {pumps.map(pump => (
          <Card key={pump.id} padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-zinc-900">Pump {pump.number}</h3>
                <p className="text-[11.5px] text-zinc-400 mt-0.5">{pump.location}</p>
              </div>
              <Badge variant={statusVariant(pump.status)}>{pump.status}</Badge>
            </div>
            <div className="p-4 space-y-2">
              {pump.nozzles.map(n => (
                <div key={n.id} className={`rounded-xl p-3 ${pump.status === 'OFFLINE' ? 'bg-zinc-50 opacity-60' : 'bg-zinc-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full">N{n.number}</span>
                      <span className="text-[12.5px] font-medium text-zinc-700">{n.product}</span>
                    </div>
                    <Badge variant={n.variance > 5 ? 'warning' : statusVariant(n.status)}>
                      {n.variance > 5 ? `+${n.variance}L ⚠` : n.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <p className="text-zinc-400">Totalizer</p>
                      <p className="font-mono font-semibold text-zinc-800">{n.totalizerCurrent.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Usage</p>
                      <p className="font-semibold text-zinc-800">{n.usage.toLocaleString('id-ID')} L</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Variance</p>
                      <p className={`font-semibold ${n.variance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {n.variance > 0 ? `+${n.variance}` : '0'} L
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-zinc-50">
              <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/totalizer')}>
                Detail Totalizer →
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Tambah Pump Baru">
        <div className="space-y-3">
          {[{ label: 'Nomor Pump', placeholder: '04' }, { label: 'Lokasi', placeholder: 'Area B' }].map(f => (
            <div key={f.label}>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">{f.label}</label>
              <input placeholder={f.placeholder}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10" />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setAddModal(false)}>Batal</Button>
            <Button variant="primary" className="flex-1"
              onClick={() => { success('Pump ditambahkan'); setAddModal(false); }}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

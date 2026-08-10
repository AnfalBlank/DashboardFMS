'use client';
import { useState } from 'react';
import { cards } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Input';
import { Search, Eye, Plus, Edit, Ban } from 'lucide-react';
import { clsx } from 'clsx';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';

export default function CardsPage() {
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('ALL');
  const [selected, setSelected] = useState<typeof cards[number] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { success, warning } = useToast();
  const router = useRouter();

  const filtered = cards.filter(c => {
    const m = !search || c.number.includes(search) ||
      c.holder.toLowerCase().includes(search.toLowerCase()) ||
      c.unit.toLowerCase().includes(search.toLowerCase());
    const s = statusF === 'ALL' || c.status === statusF;
    return m && s;
  });

  return (
    <div>
      <PageHeader title="Cards" subtitle="Kelola kartu BBM, pemegang, dan kendaraan">
        <Button variant="outline" size="sm" onClick={() => success('Export dimulai', 'File Excel kartu sedang disiapkan.')}>
          Export
        </Button>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          <Plus size={13} />Tambah Kartu
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Total Kartu',       value: '512',  color: '' },
          { label: 'Active',            value: '486',  color: 'text-green-600' },
          { label: 'Blocked',           value: '12',   color: 'text-red-600' },
          { label: 'Suspended',         value: '8',    color: 'text-amber-600' },
          { label: 'Inactive/Expired',  value: '6',    color: 'text-zinc-400' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">{k.label}</p>
            <p className={clsx('text-[24px] font-light', k.color || 'text-zinc-900')}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nomor kartu, pemegang, unit…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition" />
        </div>
        <Select value={statusF} onChange={setStatusF} options={[
          { value: 'ALL',       label: 'Semua Status' },
          { value: 'ACTIVE',    label: 'ACTIVE' },
          { value: 'BLOCKED',   label: 'BLOCKED' },
          { value: 'SUSPENDED', label: 'SUSPENDED' },
          { value: 'INACTIVE',  label: 'INACTIVE' },
          { value: 'EXPIRED',   label: 'EXPIRED' },
        ]} className="w-44" />
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr>
              <th>Nomor Kartu</th><th>Tipe</th><th>Pemegang</th><th>Unit</th><th>Kendaraan</th>
              <th>Produk</th><th>Limit/Bln</th><th>Terpakai</th><th>Sisa</th><th>Utilisasi</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(c => {
                const util = Math.round((c.used / c.allocated) * 100);
                return (
                  <tr key={c.id}>
                    <td className="font-mono font-semibold text-zinc-800">{c.number}</td>
                    <td><Badge variant="neutral">{c.type}</Badge></td>
                    <td className="font-medium">{c.holder}</td>
                    <td className="text-zinc-500 text-[12px]">{c.unit}</td>
                    <td className="text-zinc-500 text-[12px]">{c.vehicle}</td>
                    <td className="text-zinc-500 text-[12px]">{c.fuelType}</td>
                    <td>{c.monthlyLimit} L</td>
                    <td className="font-semibold">{c.used} L</td>
                    <td className={c.remaining <= 20 ? 'text-red-600 font-semibold' : 'font-semibold'}>{c.remaining} L</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className={clsx('h-full rounded-full', util >= 90 ? 'bg-red-500' : util >= 75 ? 'bg-amber-400' : 'bg-emerald-500')}
                            style={{ width: `${util}%` }} />
                        </div>
                        <span className={clsx('text-[12px] font-semibold', util >= 90 ? 'text-red-600' : util >= 75 ? 'text-amber-600' : 'text-green-600')}>
                          {util}%
                        </span>
                      </div>
                    </td>
                    <td><Badge variant={statusVariant(c.status)}>{c.status}</Badge></td>
                    <td>
                      <button onClick={() => setSelected(c)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition">
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-[12px] text-zinc-400">Menampilkan {filtered.length} dari 512 kartu</span>
          <div className="flex gap-1.5">
            {['←','1','2','3','→'].map((p, i) => (
              <button key={p} className={`px-3 py-1.5 text-[12px] rounded-full border transition ${i === 1 ? 'bg-black text-white border-black' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}>{p}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setSelected(null)} />
          <div className="w-[420px] bg-white h-full overflow-y-auto shadow-2xl animate-fade-in">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-[15px] font-semibold">Detail Kartu</h2>
              <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">✕</button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">Nomor Kartu</p>
                  <p className="text-[28px] font-light text-zinc-900 font-mono">{selected.number}</p>
                </div>
                <Badge variant={statusVariant(selected.status)} className="mt-2">{selected.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Pemegang', selected.holder],
                  ['Unit', selected.unit],
                  ['Kendaraan', selected.vehicle],
                  ['Produk', selected.fuelType],
                  ['Tipe Kartu', selected.type],
                  ['Limit Bulanan', `${selected.monthlyLimit} L`],
                  ['Tgl Aktivasi', selected.activation],
                  ['Tgl Expired', selected.expiry],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">{k as string}</p>
                    <p className="text-[13.5px] font-medium text-zinc-900">{v as string}</p>
                  </div>
                ))}
              </div>

              {/* Quota bar */}
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-3 font-semibold">Kuota Agustus 2026</p>
                <div className="space-y-2 mb-3">
                  {[['Alokasi', `${selected.allocated} L`], ['Terpakai', `${selected.used} L`], ['Sisa', `${selected.remaining} L`]].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between text-[13px]">
                      <span className="text-zinc-500">{k as string}</span>
                      <span className="font-semibold">{v as string}</span>
                    </div>
                  ))}
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-zinc-900 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.round((selected.used / selected.allocated) * 100)}%` }} />
                </div>
                <p className="text-[11.5px] text-zinc-400 mt-2 text-right">
                  {Math.round((selected.used / selected.allocated) * 100)}% terpakai
                </p>
              </div>

              {/* Quick actions */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1"
                    onClick={() => { success('Edit kartu', `Mengedit kartu ${selected.number}`); setSelected(null); }}>
                    <Edit size={13} />Edit Kartu
                  </Button>
                  <Button variant="danger" className="flex-1"
                    onClick={() => { warning('Kartu diblokir', `Kartu ${selected.number} telah diblokir.`); setSelected(null); }}>
                    <Ban size={13} />Blokir Kartu
                  </Button>
                </div>
                <Button variant="aloe" className="w-full"
                  onClick={() => { setSelected(null); router.push('/topup'); }}>
                  Top Up Kuota →
                </Button>
                <Button variant="outline" className="w-full"
                  onClick={() => { setSelected(null); router.push('/transactions'); }}>
                  Lihat Riwayat Transaksi →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Kartu Baru">
        <div className="space-y-3">
          {[
            { label: 'Nomor Kartu', placeholder: '000000' },
            { label: 'Pemegang Kartu', placeholder: 'Nama lengkap dan pangkat' },
            { label: 'Unit / Satker', placeholder: 'DITRESKRIMSUS' },
            { label: 'Nomor Kendaraan', placeholder: 'PB 0000 AA' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">{f.label}</label>
              <input placeholder={f.placeholder}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition" />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Batal</Button>
            <Button variant="primary" className="flex-1"
              onClick={() => { success('Kartu ditambahkan', 'Kartu baru berhasil didaftarkan.'); setShowAddModal(false); }}>
              Simpan Kartu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

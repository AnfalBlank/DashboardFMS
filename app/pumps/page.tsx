'use client';
import { useEffect, useState, useCallback } from 'react';
import { api, Pump, Nozzle } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { RefreshCw, ArrowRight, Plus, Edit2, Trash2, Gauge, Droplets } from 'lucide-react';

export default function PumpsPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    id: '',
    number: '',
    location: '',
    status: 'ACTIVE' as Pump['status'],
    active: 1,
  });

  // Edit Modal
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Pump | null>(null);
  const [editForm, setEditForm] = useState({
    number: '',
    location: '',
    status: 'ACTIVE' as Pump['status'],
    active: 1,
  });

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pump | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, nRes] = await Promise.allSettled([
        api.pumps.list(),
        api.pumps.nozzles(),
      ]);
      if (pRes.status === 'fulfilled' && pRes.value?.data) setPumps(pRes.value.data);
      if (nRes.status === 'fulfilled' && nRes.value?.data) setNozzles(nRes.value.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activePumps = pumps.filter((p) => p.status === 'ACTIVE' || p.active === 1).length;

  const handleOpenCreate = () => {
    const nextNum = (pumps.length + 1).toString().padStart(2, '0');
    setCreateForm({
      id: `PUMP-${nextNum}`,
      number: nextNum,
      location: `Pulau Pompa ${pumps.length + 1}`,
      status: 'ACTIVE',
      active: 1,
    });
    setCreateModal(true);
  };

  const handleCreatePump = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.number) {
      toastError('Data Belum Lengkap', 'Nomor pompa dispenser wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await api.pumps.create({
        id: createForm.id.trim() || undefined,
        number: createForm.number.trim(),
        location: createForm.location.trim() || undefined,
        status: createForm.status,
        active: Number(createForm.active),
      });

      success('Dispenser Ditambahkan', `Pompa Dispenser ${createForm.number} berhasil didaftarkan.`);
      setCreateModal(false);
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Menambah Dispenser', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (p: Pump) => {
    setEditTarget(p);
    setEditForm({
      number: p.number || '',
      location: p.location || '',
      status: p.status || 'ACTIVE',
      active: p.active !== undefined ? p.active : 1,
    });
    setEditModal(true);
  };

  const handleUpdatePump = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      setSubmitting(true);
      await api.pumps.update(editTarget.id, {
        number: editForm.number.trim(),
        location: editForm.location.trim() || undefined,
        status: editForm.status,
        active: Number(editForm.active),
      });

      success('Dispenser Diperbarui', `Informasi Dispenser ${editForm.number} berhasil disimpan.`);
      setEditModal(false);
      setEditTarget(null);
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Memperbarui Dispenser', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (p: Pump) => {
    setDeleteTarget(p);
    setDeleteModal(true);
  };

  const handleDeletePump = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      await api.pumps.delete(deleteTarget.id);
      success('Dispenser Dihapus', `Pompa Dispenser ${deleteTarget.number} berhasil dihapus.`);
      setDeleteModal(false);
      setDeleteTarget(null);
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Menghapus Dispenser', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pumps & Dispensers"
        subtitle="Kelola master pulau pompa dispenser, monitor status operasional, dan nozzle dispensing"
      >
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={() => router.push('/nozzles')}>
          <Droplets size={13} /> Kelola Nozzle →
        </Button>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus size={13} /> Tambah Dispenser
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard
          eyebrow="Total Pompa Dispenser"
          value={`${pumps.length}`}
          meta={`${activePumps} aktif`}
          accent="black"
        />
        <KpiCard eyebrow="Total Nozzle Terpasang" value={`${nozzles.length}`} accent="blue" />
        <KpiCard
          eyebrow="Nozzle Aktif"
          value={`${nozzles.filter((n) => n.status === 'ACTIVE').length}`}
          accent="green"
        />
        <KpiCard
          eyebrow="Nozzle Offline"
          value={`${nozzles.filter((n) => n.status === 'OFFLINE').length}`}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {loading && pumps.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-zinc-400">Memuat data pompa…</div>
        ) : pumps.length === 0 ? (
          <div className="col-span-3">
            <Card>
              <div className="text-center py-8 text-zinc-400">
                <Gauge size={32} className="mx-auto mb-2 opacity-40" />
                <p className="font-medium text-zinc-700">Belum ada pompa dispenser terdaftar</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Klik tombol &ldquo;Tambah Dispenser&rdquo; untuk mendaftarkan unit dispenser SPBP.
                </p>
              </div>
            </Card>
          </div>
        ) : (
          pumps.map((pump) => {
            const pumpNozzles = nozzles.filter(
              (n) => n.pump_id === pump.id || n.pump_number === pump.number,
            );
            return (
              <Card key={pump.id} padding={false}>
                <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-zinc-900">
                      Dispenser {pump.number}
                    </h3>
                    <p className="text-[11.5px] text-zinc-400 mt-0.5">
                      {pump.location || 'Pulau Pompa SPBP'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(pump.status)}>{pump.status}</Badge>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  {pumpNozzles.length === 0 ? (
                    <div className="text-[12px] text-zinc-400 py-3 text-center bg-zinc-50 rounded-xl border border-zinc-100 border-dashed">
                      Belum ada nozzle terhubung
                    </div>
                  ) : (
                    pumpNozzles.map((n) => (
                      <div key={n.id} className="rounded-xl p-3 bg-zinc-50 border border-zinc-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full">
                              N{n.number}
                            </span>
                            <span className="text-[12.5px] font-medium text-zinc-800">
                              {n.product_name || n.product}
                            </span>
                          </div>
                          <Badge variant={statusVariant(n.status)}>{n.status}</Badge>
                        </div>
                        <div className="text-[11.5px] text-zinc-500 flex justify-between">
                          <span>Status Dispenser:</span>
                          <span className="font-medium text-zinc-700">{pump.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-zinc-600 hover:text-zinc-900"
                      onClick={() => handleOpenEdit(pump)}
                    >
                      <Edit2 size={12} className="mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleOpenDelete(pump)}
                    >
                      <Trash2 size={12} className="mr-1" /> Hapus
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => router.push('/totalizer')}
                  >
                    Totalizer <ArrowRight size={11} className="ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Tambah Dispenser */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Tambah Pompa Dispenser Baru"
      >
        <form onSubmit={handleCreatePump} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                ID Dispenser
              </label>
              <input
                placeholder="mis. PUMP-01"
                value={createForm.id}
                onChange={(e) => setCreateForm((f) => ({ ...f, id: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Nomor Dispenser *
              </label>
              <input
                placeholder="mis. 01, 1, 2"
                required
                value={createForm.number}
                onChange={(e) => setCreateForm((f) => ({ ...f, number: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Lokasi / Area Pulau Pompa
            </label>
            <input
              placeholder="mis. Pulau Pompa 1 (Utara)"
              value={createForm.location}
              onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Status Operasional
              </label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value as Pump['status'] }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Aktivitas
              </label>
              <select
                value={createForm.active}
                onChange={(e) => setCreateForm((f) => ({ ...f, active: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value={1}>Aktif Digunakan</option>
                <option value={0}>Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            <Button variant="outline" type="button" className="flex-1" onClick={() => setCreateModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan Dispenser'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Dispenser */}
      <Modal
        open={editModal}
        onClose={() => {
          setEditModal(false);
          setEditTarget(null);
        }}
        title={`Edit Dispenser: ${editTarget?.number ?? ''}`}
      >
        <form onSubmit={handleUpdatePump} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                ID Dispenser
              </label>
              <input
                disabled
                value={editTarget?.id ?? ''}
                className="w-full px-3 py-2 border border-zinc-200 bg-zinc-100 rounded-lg text-[13px] font-mono text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Nomor Dispenser *
              </label>
              <input
                placeholder="mis. 01, 1, 2"
                required
                value={editForm.number}
                onChange={(e) => setEditForm((f) => ({ ...f, number: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Lokasi / Area Pulau Pompa
            </label>
            <input
              placeholder="mis. Pulau Pompa 1 (Utara)"
              value={editForm.location}
              onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Status Operasional
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as Pump['status'] }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Aktivitas
              </label>
              <select
                value={editForm.active}
                onChange={(e) => setEditForm((f) => ({ ...f, active: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value={1}>Aktif Digunakan</option>
                <option value={0}>Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => {
                setEditModal(false);
                setEditTarget(null);
              }}
            >
              Batal
            </Button>
            <Button variant="primary" type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus Dispenser */}
      <Modal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setDeleteTarget(null);
        }}
        title="Hapus Pompa Dispenser"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-zinc-600">
            Apakah Anda yakin ingin menghapus Pompa Dispenser{' '}
            <strong className="text-zinc-900 font-semibold">{deleteTarget?.number}</strong> ({deleteTarget?.location || deleteTarget?.id})?
          </p>
          <p className="text-[12px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            Peringatan: Seluruh nozzle yang terhubung ke dispenser ini juga akan terhapus dari sistem.
          </p>
          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => {
                setDeleteModal(false);
                setDeleteTarget(null);
              }}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              type="button"
              className="flex-1"
              disabled={submitting}
              onClick={handleDeletePump}
            >
              {submitting ? 'Menghapus…' : 'Hapus Dispenser'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { api, Nozzle, Pump, Product } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { RefreshCw, Plus, Edit2, Trash2, Search, Gauge, Droplets } from 'lucide-react';

export default function NozzlesPage() {
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [pumpFilter, setPumpFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    id: '',
    number: '1',
    pump_id: '',
    product_id: '',
    status: 'ACTIVE' as Nozzle['status'],
  });

  // Edit Modal
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Nozzle | null>(null);
  const [editForm, setEditForm] = useState({
    number: '1',
    pump_id: '',
    product_id: '',
    status: 'ACTIVE' as Nozzle['status'],
  });

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Nozzle | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [nRes, pRes, prRes] = await Promise.allSettled([
        api.nozzles.list(),
        api.pumps.list(),
        api.master.products(),
      ]);

      if (nRes.status === 'fulfilled' && nRes.value?.data) setNozzles(nRes.value.data);
      if (pRes.status === 'fulfilled' && pRes.value?.data) setPumps(pRes.value.data);
      if (prRes.status === 'fulfilled' && prRes.value?.data) setProducts(prRes.value.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = nozzles.filter((n) => n.status === 'ACTIVE').length;
  const offlineCount = nozzles.filter((n) => n.status === 'OFFLINE').length;

  const filteredNozzles = useMemo(() => {
    return nozzles.filter((n) => {
      const q = search.toLowerCase();
      const matchSearch =
        search === '' ||
        n.id.toLowerCase().includes(q) ||
        n.number.toLowerCase().includes(q) ||
        (n.pump_number && n.pump_number.toLowerCase().includes(q)) ||
        (n.product_name && n.product_name.toLowerCase().includes(q));

      const matchPump = pumpFilter === 'ALL' || n.pump_id === pumpFilter || n.pump_number === pumpFilter;
      const matchStatus = statusFilter === 'ALL' || n.status === statusFilter;

      return matchSearch && matchPump && matchStatus;
    });
  }, [nozzles, search, pumpFilter, statusFilter]);

  const handleOpenCreate = () => {
    setCreateForm({
      id: '',
      number: '1',
      pump_id: pumps[0]?.id || '',
      product_id: products[0]?.id || '',
      status: 'ACTIVE',
    });
    setCreateModal(true);
  };

  const handleCreateNozzle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.number || !createForm.pump_id || !createForm.product_id) {
      toastError('Data Belum Lengkap', 'Nomor nozzle, pompa dispenser, dan produk BBM wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await api.nozzles.create({
        id: createForm.id.trim() || undefined,
        number: createForm.number.trim(),
        pump_id: createForm.pump_id,
        product_id: createForm.product_id,
        status: createForm.status,
      });

      success('Nozzle Ditambahkan', `Nozzle N${createForm.number} berhasil didaftarkan.`);
      setCreateModal(false);
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Menambah Nozzle', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (n: Nozzle) => {
    setEditTarget(n);
    setEditForm({
      number: n.number || '1',
      pump_id: n.pump_id || '',
      product_id: n.product_id || '',
      status: n.status || 'ACTIVE',
    });
    setEditModal(true);
  };

  const handleUpdateNozzle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      setSubmitting(true);
      await api.nozzles.update(editTarget.id, {
        number: editForm.number.trim(),
        pump_id: editForm.pump_id,
        product_id: editForm.product_id,
        status: editForm.status,
      });

      success('Nozzle Diperbarui', `Informasi Nozzle N${editForm.number} berhasil disimpan.`);
      setEditModal(false);
      setEditTarget(null);
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Memperbarui Nozzle', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (n: Nozzle) => {
    setDeleteTarget(n);
    setDeleteModal(true);
  };

  const handleDeleteNozzle = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      await api.nozzles.delete(deleteTarget.id);
      success('Nozzle Dihapus', `Nozzle N${deleteTarget.number} berhasil dihapus.`);
      setDeleteModal(false);
      setDeleteTarget(null);
      loadData();
    } catch (err: unknown) {
      toastError('Gagal Menghapus Nozzle', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Nozzles & Dispensing Units"
        subtitle="Master data nozzle dispenser, alokasi jenis produk BBM, dan status nozzle"
      >
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={() => router.push('/pumps')}>
          <Gauge size={13} /> Kelola Dispenser →
        </Button>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus size={13} /> Tambah Nozzle
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Nozzle" value={nozzles.length.toString()} accent="black" />
        <KpiCard eyebrow="Nozzle Aktif" value={activeCount.toString()} accent="green" />
        <KpiCard
          eyebrow="Nozzle Offline"
          value={offlineCount.toString()}
          accent={offlineCount > 0 ? 'amber' : 'green'}
        />
        <KpiCard
          eyebrow="Integrasi Dispenser"
          value={`${pumps.length} Unit`}
          delta="Realtime Dispensing"
          deltaDir="neutral"
          accent="blue"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari ID, nomor, pompa, produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-zinc-200 text-xs">
            <span className="text-zinc-500 font-medium">Pompa:</span>
            <select
              value={pumpFilter}
              onChange={(e) => setPumpFilter(e.target.value)}
              className="bg-transparent font-semibold text-zinc-800 outline-none"
            >
              <option value="ALL">Semua Dispenser</option>
              {pumps.map((p) => (
                <option key={p.id} value={p.id}>
                  Dispenser {p.number}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-zinc-200 text-xs">
            <span className="text-zinc-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-zinc-800 outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>
        </div>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Nozzle ID</th>
                <th>Pompa Dispenser</th>
                <th>Nomor Nozzle</th>
                <th>Produk BBM</th>
                <th>Lokasi Pulau</th>
                <th>Status Nozzle</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && nozzles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[13px] text-zinc-400">
                    Memuat data nozzle…
                  </td>
                </tr>
              ) : filteredNozzles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[13px] text-zinc-400">
                    {search || pumpFilter !== 'ALL' || statusFilter !== 'ALL'
                      ? 'Tidak ada nozzle yang sesuai dengan kriteria filter.'
                      : 'Belum ada nozzle terdaftar. Silakan tambah nozzle baru.'}
                  </td>
                </tr>
              ) : (
                filteredNozzles.map((n) => (
                  <tr key={n.id}>
                    <td className="font-mono font-medium text-[12px] text-zinc-500">{n.id}</td>
                    <td className="font-semibold text-zinc-800">
                      Pompa {n.pump_number || n.pumpNum || '—'}
                    </td>
                    <td>
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-100 rounded-full font-semibold text-[12px] text-zinc-700">
                        N{n.number}
                      </span>
                    </td>
                    <td>
                      <Badge variant="neutral">{n.product_name || n.product}</Badge>
                    </td>
                    <td className="text-zinc-500 text-[12px]">
                      {n.location || n.pumpLoc || 'Area Dispenser SPBP'}
                    </td>
                    <td>
                      <Badge variant={statusVariant(n.status)}>{n.status}</Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-zinc-600 hover:text-zinc-900"
                          onClick={() => handleOpenEdit(n)}
                        >
                          <Edit2 size={12} className="mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleOpenDelete(n)}
                        >
                          <Trash2 size={12} className="mr-1" /> Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah Nozzle */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Tambah Nozzle Dispenser Baru"
      >
        <form onSubmit={handleCreateNozzle} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                ID Nozzle
              </label>
              <input
                placeholder="mis. NOZZLE-01-1 (opsional)"
                value={createForm.id}
                onChange={(e) => setCreateForm((f) => ({ ...f, id: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono uppercase"
              />
              <span className="text-[10.5px] text-zinc-400">Kosongkan untuk penomoran otomatis</span>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Nomor / Posisi Nozzle *
              </label>
              <input
                placeholder="mis. 1, 2, 3, 4"
                required
                value={createForm.number}
                onChange={(e) => setCreateForm((f) => ({ ...f, number: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Pompa Dispenser *
              </label>
              <select
                required
                value={createForm.pump_id}
                onChange={(e) => setCreateForm((f) => ({ ...f, pump_id: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">-- Pilih Pompa Dispenser --</option>
                {pumps.map((p) => (
                  <option key={p.id} value={p.id}>
                    Dispenser {p.number} ({p.location || p.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Produk BBM *
              </label>
              <select
                required
                value={createForm.product_id}
                onChange={(e) => setCreateForm((f) => ({ ...f, product_id: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">-- Pilih Produk BBM --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Status Nozzle
            </label>
            <select
              value={createForm.status}
              onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value as Nozzle['status'] }))}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            <Button variant="outline" type="button" className="flex-1" onClick={() => setCreateModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan Nozzle'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Nozzle */}
      <Modal
        open={editModal}
        onClose={() => {
          setEditModal(false);
          setEditTarget(null);
        }}
        title={`Edit Nozzle: ${editTarget?.id ?? ''}`}
      >
        <form onSubmit={handleUpdateNozzle} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                ID Nozzle
              </label>
              <input
                disabled
                value={editTarget?.id ?? ''}
                className="w-full px-3 py-2 border border-zinc-200 bg-zinc-100 rounded-lg text-[13px] font-mono text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Nomor Nozzle *
              </label>
              <input
                placeholder="mis. 1, 2, 3"
                required
                value={editForm.number}
                onChange={(e) => setEditForm((f) => ({ ...f, number: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Pompa Dispenser *
              </label>
              <select
                required
                value={editForm.pump_id}
                onChange={(e) => setEditForm((f) => ({ ...f, pump_id: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                {pumps.map((p) => (
                  <option key={p.id} value={p.id}>
                    Dispenser {p.number} ({p.location || p.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Produk BBM *
              </label>
              <select
                required
                value={editForm.product_id}
                onChange={(e) => setEditForm((f) => ({ ...f, product_id: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Status Nozzle
            </label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as Nozzle['status'] }))}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
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

      {/* Modal Hapus Nozzle */}
      <Modal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setDeleteTarget(null);
        }}
        title="Hapus Nozzle Dispenser"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-zinc-600">
            Apakah Anda yakin ingin menghapus Nozzle{' '}
            <strong className="text-zinc-900 font-semibold">N{deleteTarget?.number}</strong> ({deleteTarget?.product_name}) pada Pompa {deleteTarget?.pump_number}?
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
              onClick={handleDeleteNozzle}
            >
              {submitting ? 'Menghapus…' : 'Hapus Nozzle'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

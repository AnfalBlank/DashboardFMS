"use client";
import { useState, useEffect, useCallback } from "react";
import { api, Unit } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function MasterUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Unit | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "DIREKTORAT",
    parent_id: "",
    commander: "",
    default_alloc_l: "200",
  });

  const { success, error: toastError } = useToast();

  const loadUnits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.master.units();
      if (res?.data) setUnits(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) {
      toastError(
        "Data Belum Lengkap",
        "Kode dan nama satuan kerja wajib diisi.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.master.createUnit({
        code: form.code,
        name: form.name,
        type: form.type,
        parent_id: form.parent_id || undefined,
        commander: form.commander || undefined,
        default_alloc_l: Number(form.default_alloc_l || 200),
      });
      success(
        "Satker Didaftarkan",
        `Satuan kerja ${form.name} berhasil ditambahkan.`,
      );
      setAddModal(false);
      setForm({
        code: "",
        name: "",
        type: "DIREKTORAT",
        parent_id: "",
        commander: "",
        default_alloc_l: "200",
      });
      loadUnits();
    } catch (err: unknown) {
      toastError(
        "Gagal Menambah Satker",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      setSubmitting(true);
      await api.master.updateUnit(editTarget.id, {
        name: form.name,
        type: form.type,
        commander: form.commander || undefined,
        default_alloc_l: Number(form.default_alloc_l || 200),
      });
      success(
        "Satker Diperbarui",
        `Informasi ${form.name} berhasil diperbarui.`,
      );
      setEditModal(false);
      setEditTarget(null);
      loadUnits();
    } catch (err: unknown) {
      toastError(
        "Gagal Memperbarui Satker",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Master Units (Satker)"
        subtitle="Data master Satuan Kerja (Satker / Bagian) di lingkungan Polda Papua Barat"
      >
        <Button variant="outline" size="sm" onClick={loadUnits}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button variant="primary" size="sm" onClick={() => setAddModal(true)}>
          <Plus size={13} /> Tambah Satker
        </Button>
      </PageHeader>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Kode Satker</th>
                <th>Nama Satuan Kerja</th>
                <th>Tipe Satker</th>
                <th>Pimpinan / Kasat</th>
                <th>Pagu Standar / Kartu</th>
                <th>Kartu Aktif</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && units.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Memuat data satker…
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Belum ada satker terdaftar
                  </td>
                </tr>
              ) : (
                units.map((u) => (
                  <tr key={u.id}>
                    <td className="font-mono font-semibold text-zinc-800">
                      {u.code}
                    </td>
                    <td className="font-semibold text-zinc-900">{u.name}</td>
                    <td className="text-zinc-600 text-[12px]">{u.type}</td>
                    <td className="text-zinc-600">{u.commander || "—"}</td>
                    <td className="font-semibold text-zinc-900">
                      {u.default_alloc_l || u.defaultAllocation || 200} L
                    </td>
                    <td>{u.active_cards ?? u.cards ?? 0} kartu</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditTarget(u);
                          setForm({
                            code: u.code,
                            name: u.name,
                            type: u.type || "DIREKTORAT",
                            parent_id: u.parent_id || "",
                            commander: u.commander || "",
                            default_alloc_l: (
                              u.default_alloc_l ||
                              u.defaultAllocation ||
                              200
                            ).toString(),
                          });
                          setEditModal(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
                      >
                        <Edit size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Tambah Satuan Kerja Baru"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Kode Satker *
              </label>
              <input
                placeholder="DITLANTAS"
                required
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-bold"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Tipe
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="DIREKTORAT">DIREKTORAT</option>
                <option value="BIDANG">BIDANG / BIRO</option>
                <option value="SATUAN">SATUAN</option>
                <option value="POLRES">POLRES JAJARAN</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Nama Satuan Kerja *
            </label>
            <input
              placeholder="Direktorat Lalu Lintas"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Pimpinan / Pejabat
              </label>
              <input
                placeholder="Kombes Pol ..."
                value={form.commander}
                onChange={(e) =>
                  setForm((f) => ({ ...f, commander: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Pagu Standar (L/Kartu)
              </label>
              <input
                type="number"
                value={form.default_alloc_l}
                onChange={(e) =>
                  setForm((f) => ({ ...f, default_alloc_l: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => setAddModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "Menyimpan…" : "Simpan Satker"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Satuan Kerja"
      >
        <form onSubmit={handleUpdate} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Nama Satuan Kerja *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Pimpinan / Pejabat
              </label>
              <input
                value={form.commander}
                onChange={(e) =>
                  setForm((f) => ({ ...f, commander: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Pagu Standar (L/Kartu)
              </label>
              <input
                type="number"
                value={form.default_alloc_l}
                onChange={(e) =>
                  setForm((f) => ({ ...f, default_alloc_l: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => setEditModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "Menyimpan…" : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

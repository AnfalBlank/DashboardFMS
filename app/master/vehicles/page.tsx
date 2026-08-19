"use client";
import { useState, useEffect, useCallback } from "react";
import { api, Vehicle, Unit, Product } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit, RefreshCw, Fuel } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function MasterVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    police_number: "",
    brand: "Toyota",
    model: "Hilux 4x4",
    unit_id: "",
    product_id: "",
    fuel_type: "Pertamax",
    tank_capacity: "80",
    type: "PATROLI",
    status: "ACTIVE",
  });

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [vRes, uRes, pRes] = await Promise.allSettled([
        api.master.vehicles(),
        api.master.units(),
        api.master.products(),
      ]);
      if (vRes.status === "fulfilled" && vRes.value?.data)
        setVehicles(vRes.value.data);
      if (uRes.status === "fulfilled" && uRes.value?.data)
        setUnits(uRes.value.data);
      if (pRes.status === "fulfilled" && pRes.value?.data) {
        setProducts(pRes.value.data);
        if (pRes.value.data.length > 0 && !form.product_id) {
          setForm((f) => ({
            ...f,
            product_id: f.product_id || pRes.value.data[0].id,
            fuel_type: f.fuel_type || pRes.value.data[0].name,
          }));
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [form.product_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProductChange = (productId: string) => {
    const selectedProd = products.find((p) => p.id === productId);
    setForm((f) => ({
      ...f,
      product_id: productId,
      fuel_type: selectedProd ? selectedProd.name : f.fuel_type,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.police_number || !form.unit_id) {
      toastError(
        "Data Belum Lengkap",
        "Nomor polisi dan satker dinas wajib diisi.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.master.createVehicle({
        police_number: form.police_number,
        brand: form.brand,
        model: form.model,
        unit_id: form.unit_id,
        product_id: form.product_id || undefined,
        fuel_type: form.fuel_type,
        tank_capacity: Number(form.tank_capacity),
        type: form.type,
      });
      success(
        "Kendaraan Didaftarkan",
        `Kendaraan dinas ${form.police_number} berhasil didaftarkan.`,
      );
      setAddModal(false);
      setForm({
        police_number: "",
        brand: "Toyota",
        model: "Hilux 4x4",
        unit_id: "",
        product_id: products[0]?.id || "",
        fuel_type: products[0]?.name || "Pertamax",
        tank_capacity: "80",
        type: "PATROLI",
        status: "ACTIVE",
      });
      loadData();
    } catch (err: unknown) {
      toastError(
        "Gagal Menambah Kendaraan",
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
      await api.master.updateVehicle(editTarget.id, {
        brand: form.brand,
        model: form.model,
        unit_id: form.unit_id,
        product_id: form.product_id || undefined,
        fuel_type: form.fuel_type,
        tank_capacity: Number(form.tank_capacity),
        type: form.type,
        status: form.status,
      });
      success(
        "Kendaraan Diperbarui",
        `Informasi ${editTarget.police_number || editTarget.policeNumber} telah diperbarui (kartu tertaut otomatis tersinkronkan).`,
      );
      setEditModal(false);
      setEditTarget(null);
      loadData();
    } catch (err: unknown) {
      toastError(
        "Gagal Memperbarui Kendaraan",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setForm({
      police_number: "",
      brand: "Toyota",
      model: "Hilux 4x4",
      unit_id: "",
      product_id: products[0]?.id || "",
      fuel_type: products[0]?.name || "Pertamax",
      tank_capacity: "80",
      type: "PATROLI",
      status: "ACTIVE",
    });
    setAddModal(true);
  };

  return (
    <div>
      <PageHeader
        title="Master Vehicles"
        subtitle="Data armada kendaraan dinas operasional Polri dan relasi produk BBM"
      >
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          <Plus size={13} /> Tambah Kendaraan
        </Button>
      </PageHeader>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>No. Polisi</th>
                <th>Merek & Tipe</th>
                <th>Satuan Kerja (Unit)</th>
                <th>Produk BBM</th>
                <th>Kapasitas Tangki</th>
                <th>Kategori Operasional</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && vehicles.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Memuat data kendaraan…
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Belum ada kendaraan terdaftar
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="font-mono font-semibold text-zinc-800">
                      {v.police_number || v.policeNumber}
                    </td>
                    <td className="font-medium">
                      {v.brand} {v.model}
                    </td>
                    <td className="text-zinc-600 text-[12px]">
                      {v.unit_name || v.unit}
                    </td>
                    <td>
                      <Badge variant="neutral">
                        <Fuel size={11} className="inline mr-1 opacity-70" />
                        {v.product_name || v.fuel_type || v.fuelType || "Pertamax"}
                      </Badge>
                      {v.product_code && (
                        <span className="ml-1 text-[10px] text-zinc-400 font-mono">
                          ({v.product_code})
                        </span>
                      )}
                    </td>
                    <td>{v.tank_capacity || v.tankCapacity || 60} L</td>
                    <td className="text-zinc-500 text-[12px]">
                      {v.type || "PATROLI"}
                    </td>
                    <td>
                      <Badge variant={statusVariant(v.status)}>
                        {v.status}
                      </Badge>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setEditTarget(v);
                          const matchedProduct = products.find(
                            (p) =>
                              p.id === v.product_id ||
                              p.id === v.productId ||
                              p.name.toLowerCase() ===
                                (v.product_name || v.fuel_type || v.fuelType || "").toLowerCase()
                          );
                          setForm({
                            police_number:
                              v.police_number || v.policeNumber || "",
                            brand: v.brand || "",
                            model: v.model || "",
                            unit_id: v.unit_id || "",
                            product_id:
                              v.product_id ||
                              v.productId ||
                              matchedProduct?.id ||
                              "",
                            fuel_type:
                              v.product_name ||
                              v.fuel_type ||
                              v.fuelType ||
                              matchedProduct?.name ||
                              "Pertamax",
                            tank_capacity: (
                              v.tank_capacity ||
                              v.tankCapacity ||
                              60
                            ).toString(),
                            type: v.type || "PATROLI",
                            status: v.status || "ACTIVE",
                          });
                          setEditModal(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
                        title="Edit Kendaraan"
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
        title="Pendaftaran Kendaraan Dinas Baru"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Nomor Polisi Dinas *
            </label>
            <input
              placeholder="PB 1234 XX"
              required
              value={form.police_number}
              onChange={(e) =>
                setForm((f) => ({ ...f, police_number: e.target.value }))
              }
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-bold font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Merek
              </label>
              <input
                value={form.brand}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Model / Tipe
              </label>
              <input
                value={form.model}
                onChange={(e) =>
                  setForm((f) => ({ ...f, model: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Satuan Kerja (Unit) *
              </label>
              <select
                value={form.unit_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit_id: e.target.value }))
                }
                required
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">Pilih satker…</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Produk BBM Standar *
              </label>
              <select
                value={form.product_id}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                {products.length > 0 ? (
                  products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) {p.octane_cetane ? `• ${p.octane_cetane}` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="prod-ptx">Pertamax (PTX)</option>
                    <option value="prod-plt">Pertalite (PLT)</option>
                    <option value="prod-dxl">Dexlite (DXL)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Kapasitas Tangki (L)
              </label>
              <input
                type="number"
                value={form.tank_capacity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tank_capacity: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Kategori Operasional
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="PATROLI">PATROLI</option>
                <option value="OPERASIONAL">OPERASIONAL</option>
                <option value="PEJABAT">PEJABAT / VIP</option>
                <option value="LOGISTIK">LOGISTIK</option>
              </select>
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
              {submitting ? "Menyimpan…" : "Daftarkan Kendaraan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Kendaraan Dinas"
      >
        <form onSubmit={handleUpdate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Merek
              </label>
              <input
                value={form.brand}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Model / Tipe
              </label>
              <input
                value={form.model}
                onChange={(e) =>
                  setForm((f) => ({ ...f, model: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Satuan Kerja
              </label>
              <select
                value={form.unit_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit_id: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">Pilih satker…</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Produk BBM Standar
              </label>
              <select
                value={form.product_id}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-medium text-zinc-800"
              >
                {products.length > 0 ? (
                  products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="prod-ptx">Pertamax</option>
                    <option value="prod-plt">Pertalite</option>
                    <option value="prod-dxl">Dexlite</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Kapasitas Tangki (L)
              </label>
              <input
                type="number"
                value={form.tank_capacity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tank_capacity: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Status Armada
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          {/* Sync notification card */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[12px] text-blue-800 leading-relaxed flex items-start gap-2">
            <span className="text-base leading-none">💡</span>
            <div>
              <p className="font-semibold text-blue-900 mb-0.5">Sinkronisasi Otomatis Kartu BBM</p>
              <p className="text-blue-700 text-[11.5px]">
                Mengubah produk BBM kendaraan ini akan secara otomatis memperbarui jenis BBM pada seluruh kartu BBM yang tertaut ke armada ini.
              </p>
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


"use client";
import { useState, useEffect, useCallback } from "react";
import { api, Product } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

export default function MasterProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    code: "",
    name: "",
    octane_cetane: "RON 92",
    color_code: "#2563eb",
    density_standard: "750",
    description: "",
  });

  const { success, error: toastError } = useToast();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.master.products();
      if (res?.data) setProducts(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) {
      toastError("Data Belum Lengkap", "Kode dan nama produk BBM wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      await api.master.createProduct({
        code: form.code,
        name: form.name,
        octane_cetane: form.octane_cetane || undefined,
        color_code: form.color_code || undefined,
        density_standard: form.density_standard
          ? Number(form.density_standard)
          : undefined,
        description: form.description || undefined,
      });
      success(
        "Produk Ditambahkan",
        `Produk BBM ${form.name} berhasil disimpan.`,
      );
      setShowModal(false);
      setForm({
        code: "",
        name: "",
        octane_cetane: "RON 92",
        color_code: "#2563eb",
        density_standard: "750",
        description: "",
      });
      loadProducts();
    } catch (err: unknown) {
      toastError(
        "Gagal Menambah Produk",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Master Fuel Products"
        subtitle="Data master komoditas bahan bakar minyak SPBP"
      >
        <Button variant="outline" size="sm" onClick={loadProducts}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/master/price")}
        >
          Atur Harga BBM →
        </Button>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={13} /> Produk Baru
        </Button>
      </PageHeader>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Produk</th>
                <th>RON / CN</th>
                <th>Warna Indikator</th>
                <th>Density Standar (kg/m³)</th>
                <th>Harga Satuan Terakhir</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Memuat master produk…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Belum ada produk BBM terdaftar
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono font-semibold text-zinc-800">
                      {p.code}
                    </td>
                    <td className="font-semibold text-zinc-900">{p.name}</td>
                    <td>
                      <Badge variant="neutral">{p.octane_cetane ?? "—"}</Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border"
                          style={{ backgroundColor: p.color_code || "#71717a" }}
                        />
                        <span className="font-mono text-[11.5px] text-zinc-400">
                          {p.color_code || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="text-zinc-600">
                      {p.density_standard ?? 750} kg/m³
                    </td>
                    <td className="font-semibold text-zinc-900">
                      {p.current_price
                        ? `Rp ${p.current_price.toLocaleString("id-ID")} /L`
                        : "—"}
                    </td>
                    <td>
                      <Badge variant={p.active ? "success" : "neutral"}>
                        {p.active ? "AKTIF" : "NONAKTIF"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Produk BBM Baru"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Kode Produk *
              </label>
              <input
                placeholder="mis. PTX92"
                required
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Nama Produk *
              </label>
              <input
                placeholder="mis. Pertamax 92"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                RON / Cetane
              </label>
              <input
                placeholder="RON 92"
                value={form.octane_cetane}
                onChange={(e) =>
                  setForm((f) => ({ ...f, octane_cetane: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Density (kg/m³)
              </label>
              <input
                type="number"
                value={form.density_standard}
                onChange={(e) =>
                  setForm((f) => ({ ...f, density_standard: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Warna UI
              </label>
              <input
                type="color"
                value={form.color_code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, color_code: e.target.value }))
                }
                className="w-full h-9 p-1 bg-white border border-zinc-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => setShowModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "Menyimpan…" : "Simpan Produk"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

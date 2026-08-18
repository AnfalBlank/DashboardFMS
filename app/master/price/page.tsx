"use client";
import { useState, useEffect, useCallback } from "react";
import { api, FuelPrice, Product } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function MasterPricePage() {
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    product_id: "",
    price_per_liter: "",
    effective_from: new Date().toISOString().split("T")[0],
    reason: "Penyesuaian Keputusan Harga BBM Pertamina Wilayah Papua Barat",
  });

  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prRes, prodRes] = await Promise.allSettled([
        api.master.prices(),
        api.master.products(),
      ]);
      if (prRes.status === "fulfilled" && prRes.value?.data)
        setPrices(prRes.value.data);
      if (prodRes.status === "fulfilled" && prodRes.value?.data) {
        setProducts(prodRes.value.data);
        if (prodRes.value.data.length > 0 && !form.product_id) {
          setForm((f) => ({ ...f, product_id: prodRes.value.data[0].id }));
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

  const handleSetPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.price_per_liter) {
      toastError(
        "Data Belum Lengkap",
        "Pilih produk dan masukkan tarif harga per liter.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.master.setPrice({
        product_id: form.product_id,
        price_per_liter: Number(form.price_per_liter),
        effective_from: form.effective_from,
        reason: form.reason || undefined,
      });
      success("Harga Disimpan", "Tarif harga BBM baru berhasil ditetapkan.");
      setShowModal(false);
      setForm((f) => ({ ...f, price_per_liter: "" }));
      loadData();
    } catch (err: unknown) {
      toastError(
        "Gagal Menyimpan Harga",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Fuel Pricing Management"
        subtitle="Kelola riwayat penetapan harga satuan per liter produk BBM"
      >
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={13} /> Penetapan Harga Baru
        </Button>
      </PageHeader>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Produk BBM</th>
                <th>Harga Satuan (Rp/Liter)</th>
                <th>Berlaku Efektif</th>
                <th>Keterangan / Dasar Penetapan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && prices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Memuat daftar harga…
                  </td>
                </tr>
              ) : prices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Belum ada data penetapan harga
                  </td>
                </tr>
              ) : (
                prices.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold text-zinc-900">
                      {p.product_name || p.product_id}
                    </td>
                    <td className="font-bold text-[14px] text-zinc-900">
                      Rp {p.price_per_liter?.toLocaleString("id-ID")}
                    </td>
                    <td className="text-zinc-600">{p.effective_from}</td>
                    <td className="text-zinc-500 text-[12px]">
                      {p.reason || "Keputusan Resmi"}
                    </td>
                    <td>
                      <Badge variant={p.is_active ? "success" : "neutral"}>
                        {p.is_active ? "BERLAKU" : "HISTORIS"}
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
        title="Penetapan Tarif Harga BBM Baru"
      >
        <form onSubmit={handleSetPrice} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Produk BBM *
            </label>
            <select
              value={form.product_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, product_id: e.target.value }))
              }
              required
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Harga per Liter (Rp) *
              </label>
              <input
                type="number"
                required
                placeholder="13200"
                value={form.price_per_liter}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price_per_liter: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-bold"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Tanggal Berlaku Efektif *
              </label>
              <input
                type="date"
                required
                value={form.effective_from}
                onChange={(e) =>
                  setForm((f) => ({ ...f, effective_from: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Dasar Penetapan / Alasan
            </label>
            <input
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            />
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
              {submitting ? "Menyimpan…" : "Simpan Harga"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

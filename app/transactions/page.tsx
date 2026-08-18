"use client";
import { useState, useEffect, useCallback } from "react";
import { api, Transaction, Product, Nozzle, Card as CardType } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import {
  Download,
  Search,
  Eye,
  Plus,
  Ban,
  Printer,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("ALL");

  // Detail & Action Modals
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [manualModal, setManualModal] = useState(false);
  const [voidModal, setVoidModal] = useState(false);
  const [voidTarget, setVoidTarget] = useState<Transaction | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Manual Form
  const [form, setForm] = useState({
    card_number: "",
    product_id: "",
    nozzle_id: "",
    pump_id: "",
    volume_l: "",
    shift: "PAGI",
    totalizer_before: "",
    totalizer_after: "",
  });

  const { success, warning, error: toastError } = useToast();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.transactions.list({ limit: 100 });
      if (res?.data) {
        setTransactions(res.data);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    // Load metadata for manual creation modal
    Promise.allSettled([
      api.master.products(),
      api.pumps.nozzles(),
      api.cards.list({ limit: 100 }),
    ]).then(([pRes, nRes, cRes]) => {
      if (pRes.status === "fulfilled" && pRes.value?.data)
        setProducts(pRes.value.data);
      if (nRes.status === "fulfilled" && nRes.value?.data)
        setNozzles(nRes.value.data);
      if (cRes.status === "fulfilled" && cRes.value?.data)
        setCards(cRes.value.data);
    });
  }, [fetchTransactions]);

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.card_number || !form.product_id || !form.volume_l) {
      toastError(
        "Data Tidak Lengkap",
        "Nomor kartu, produk, dan volume wajib diisi.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.transactions.create({
        card_number: form.card_number,
        product_id: form.product_id,
        nozzle_id: form.nozzle_id || undefined,
        pump_id: form.pump_id || undefined,
        volume_l: Number(form.volume_l),
        shift: form.shift,
        totalizer_before: form.totalizer_before
          ? Number(form.totalizer_before)
          : undefined,
        totalizer_after: form.totalizer_after
          ? Number(form.totalizer_after)
          : undefined,
        source: "MANUAL",
        transaction_time: new Date().toISOString(),
      });
      success(
        "Transaksi Berhasil",
        "Transaksi manual berhasil dicatat ke sistem.",
      );
      setManualModal(false);
      setForm({
        card_number: "",
        product_id: "",
        nozzle_id: "",
        pump_id: "",
        volume_l: "",
        shift: "PAGI",
        totalizer_before: "",
        totalizer_after: "",
      });
      fetchTransactions();
    } catch (err: unknown) {
      toastError(
        "Gagal Mencatat Transaksi",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoidTransaction = async () => {
    if (!voidTarget || !voidReason.trim()) {
      toastError(
        "Alasan Wajib Diisi",
        "Silakan masukkan alasan pembatalan (VOID).",
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.transactions.void(voidTarget.id, voidReason);
      warning(
        "Transaksi Di-VOID",
        `Transaksi ${voidTarget.id} berhasil dibatalkan.`,
      );
      setVoidModal(false);
      setVoidTarget(null);
      setVoidReason("");
      if (detail && detail.id === voidTarget.id) setDetail(null);
      fetchTransactions();
    } catch (err: unknown) {
      toastError(
        "Gagal VOID Transaksi",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = transactions.filter((t) => {
    const cardNum = t.card_number || t.card || "";
    const holder = t.holder_name || t.holder || "";
    const veh = t.police_number || t.vehicle || "";
    const prod = t.product_name || t.product || "";
    const status = t.status || "";

    const matchSearch =
      !search ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      cardNum.toLowerCase().includes(search.toLowerCase()) ||
      holder.toLowerCase().includes(search.toLowerCase()) ||
      veh.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || status === statusFilter;
    const matchProduct = productFilter === "ALL" || prod === productFilter;
    return matchSearch && matchStatus && matchProduct;
  });

  const totalSuccess = transactions.filter(
    (t) => t.status === "SUCCESS",
  ).length;
  const totalFailed = transactions.filter(
    (t) => t.status === "FAILED" || t.status === "REJECTED",
  ).length;
  const totalVoid = transactions.filter((t) => t.status === "VOID").length;

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="Monitor semua transaksi penyaluran BBM secara realtime"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            success("Export dimulai", "File transaksi sedang disiapkan.")
          }
        >
          <Download size={13} />
          Export
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setManualModal(true)}
        >
          <Plus size={13} /> Transaksi Manual
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Total Transaksi",
            value: transactions.length.toLocaleString("id-ID"),
            sub: "semua waktu",
          },
          {
            label: "SUCCESS",
            value: totalSuccess.toLocaleString("id-ID"),
            sub:
              transactions.length > 0
                ? `${((totalSuccess / transactions.length) * 100).toFixed(1)}%`
                : "0%",
          },
          {
            label: "FAILED / REJECTED",
            value: totalFailed.toLocaleString("id-ID"),
            sub:
              transactions.length > 0
                ? `${((totalFailed / transactions.length) * 100).toFixed(1)}%`
                : "0%",
          },
          {
            label: "VOID / CANCELLED",
            value: totalVoid.toLocaleString("id-ID"),
            sub:
              transactions.length > 0
                ? `${((totalVoid / transactions.length) * 100).toFixed(1)}%`
                : "0%",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]"
          >
            <p className="text-[10px] font-medium tracking-[0.6px] uppercase text-zinc-400 mb-2">
              {k.label}
            </p>
            <p className="text-[24px] font-light text-zinc-900">{k.value}</p>
            {k.sub && <p className="text-[12px] text-zinc-400 mt-1">{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID, nomor kartu, nama pemegang, no. polisi…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-[13px] outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-400 transition"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "ALL", label: "Semua Status" },
            { value: "SUCCESS", label: "SUCCESS" },
            { value: "FAILED", label: "FAILED / REJECTED" },
            { value: "VOID", label: "VOID" },
          ]}
          className="w-44"
        />
        <Select
          value={productFilter}
          onChange={setProductFilter}
          options={[
            { value: "ALL", label: "Semua Produk" },
            ...products.map((p) => ({ value: p.name, label: p.name })),
          ]}
          className="w-44"
        />
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Kartu</th>
                <th>Pemegang</th>
                <th>Kendaraan</th>
                <th>Unit</th>
                <th>Produk</th>
                <th>Volume</th>
                <th>Harga/L</th>
                <th>Total</th>
                <th>Pump/Nozzle</th>
                <th>Shift</th>
                <th>Waktu</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Memuat data transaksi dari server…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Tidak ada data transaksi yang sesuai filter
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const cardNum = t.card_number || t.card || "—";
                  const holder = t.holder_name || t.holder || "—";
                  const veh = t.police_number || t.vehicle || "—";
                  const unit = t.unit_name || t.unit || "—";
                  const prod = t.product_name || t.product || "—";
                  const vol = t.volume_l ?? t.volume ?? 0;
                  const price = t.price_per_unit ?? t.price ?? 0;
                  const amt = t.total_amount ?? t.total ?? 0;
                  const pump = t.pump_number || t.pump || "—";
                  const nzl = t.nozzle_number || t.nozzle || "—";
                  const time = t.transaction_time || t.time;

                  return (
                    <tr key={t.id}>
                      <td className="font-mono text-[11.5px] text-zinc-500">
                        {t.id?.slice(-12)}
                      </td>
                      <td className="font-mono text-[12px] text-zinc-700 font-semibold">
                        {cardNum}
                      </td>
                      <td className="font-medium text-zinc-900">{holder}</td>
                      <td className="text-zinc-500 text-[12px]">{veh}</td>
                      <td className="text-zinc-500 text-[12px]">{unit}</td>
                      <td>
                        <Badge variant="neutral">{prod}</Badge>
                      </td>
                      <td className="font-semibold">{vol} L</td>
                      <td className="text-zinc-500 text-[12px]">
                        Rp {price.toLocaleString("id-ID")}
                      </td>
                      <td className="font-semibold">
                        Rp {amt.toLocaleString("id-ID")}
                      </td>
                      <td className="text-zinc-400 text-[12px]">
                        {pump}/{nzl}
                      </td>
                      <td className="text-zinc-400 text-[12px]">
                        {t.shift ?? "—"}
                      </td>
                      <td className="text-zinc-400 text-[12px]">
                        {time
                          ? new Date(time).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td>
                        <Badge variant={statusVariant(t.status)}>
                          {t.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetail(t)}
                            title="Lihat detail"
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
                          >
                            <Eye size={13} />
                          </button>
                          {t.status === "SUCCESS" && (
                            <button
                              onClick={() => {
                                setVoidTarget(t);
                                setVoidReason("");
                                setVoidModal(true);
                              }}
                              title="VOID Transaksi"
                              className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            >
                              <Ban size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-[12px] text-zinc-400">
            Menampilkan {filtered.length} dari {transactions.length} transaksi
          </span>
          <Button variant="outline" size="sm" onClick={fetchTransactions}>
            Refresh Data
          </Button>
        </div>
      </Card>

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDetail(null)} />
          <div className="w-[420px] bg-white h-full overflow-y-auto shadow-2xl animate-fade-in">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-[15px] font-semibold">Detail Transaksi</h2>
              <button
                onClick={() => setDetail(null)}
                className="text-zinc-400 hover:text-zinc-700 text-lg"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">
                  Transaction ID
                </p>
                <p className="font-mono text-[13px] text-zinc-700">
                  {detail.id}
                </p>
              </div>
              <Badge
                variant={statusVariant(detail.status)}
                className="text-[12px]"
              >
                {detail.status}
              </Badge>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Kartu", detail.card_number || detail.card || "—"],
                  ["Pemegang", detail.holder_name || detail.holder || "—"],
                  ["Kendaraan", detail.police_number || detail.vehicle || "—"],
                  ["Unit", detail.unit_name || detail.unit || "—"],
                  ["Produk", detail.product_name || detail.product || "—"],
                  ["Volume", `${detail.volume_l ?? detail.volume ?? 0} L`],
                  [
                    "Harga/L",
                    `Rp ${(detail.price_per_unit ?? detail.price ?? 0).toLocaleString("id-ID")}`,
                  ],
                  [
                    "Total",
                    `Rp ${(detail.total_amount ?? detail.total ?? 0).toLocaleString("id-ID")}`,
                  ],
                  [
                    "Pump / Nozzle",
                    `${detail.pump_number || detail.pump || "—"} / ${detail.nozzle_number || detail.nozzle || "—"}`,
                  ],
                  ["Shift", detail.shift ?? "—"],
                  [
                    "Waktu",
                    detail.transaction_time
                      ? new Date(detail.transaction_time).toLocaleString(
                          "id-ID",
                        )
                      : (detail.time ?? "—"),
                  ],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">
                      {k as string}
                    </p>
                    <p className="text-[13.5px] font-medium text-zinc-900">
                      {v as string}
                    </p>
                  </div>
                ))}
              </div>

              {(detail.quota_before !== undefined ||
                detail.quota_deducted !== undefined) && (
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-3 font-semibold">
                    Mutasi Kuota
                  </p>
                  <div className="space-y-2">
                    {[
                      ["Sebelum", `${detail.quota_before ?? 0} L`],
                      [
                        "Dipotong",
                        `${detail.quota_deducted ?? detail.volume_l ?? detail.volume ?? 0} L`,
                      ],
                      ["Setelah", `${detail.quota_after ?? 0} L`],
                    ].map(([k, v]) => (
                      <div
                        key={k as string}
                        className="flex justify-between text-[13px]"
                      >
                        <span className="text-zinc-500">{k as string}</span>
                        <span className="font-semibold text-zinc-900">
                          {v as string}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {detail.status === "SUCCESS" && (
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => {
                      setVoidTarget(detail);
                      setVoidReason("");
                      setVoidModal(true);
                    }}
                  >
                    <Ban size={13} /> VOID Transaksi
                  </Button>
                )}
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() =>
                    success("Cetak Struk", "Struk transaksi siap dicetak.")
                  }
                >
                  <Printer size={13} /> Cetak
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Transaction Modal */}
      <Modal
        open={manualModal}
        onClose={() => setManualModal(false)}
        title="Pencatatan Transaksi Manual"
        subtitle="Gunakan saat dispenser offline atau pengisian khusus"
      >
        <form onSubmit={handleCreateManual} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Nomor Kartu / Pemegang *
            </label>
            <select
              value={form.card_number}
              onChange={(e) =>
                setForm((f) => ({ ...f, card_number: e.target.value }))
              }
              required
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="">Pilih kartu BBM terdaftar…</option>
              {cards.map((c) => {
                const num = c.card_number || c.number;
                const holder = c.holder_name || c.holder;
                return (
                  <option key={c.id} value={num}>
                    {num} — {holder} ({c.unit_name || c.unit || "SPBP"})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                <option value="">Pilih produk…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Rp{" "}
                    {p.current_price?.toLocaleString("id-ID") ?? "—"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Volume (Liter) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="45.5"
                value={form.volume_l}
                onChange={(e) =>
                  setForm((f) => ({ ...f, volume_l: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Nozzle / Pompa
              </label>
              <select
                value={form.nozzle_id}
                onChange={(e) => {
                  const nId = e.target.value;
                  const selectedN = nozzles.find((n) => n.id === nId);
                  setForm((f) => ({
                    ...f,
                    nozzle_id: nId,
                    pump_id: selectedN?.pump_id || f.pump_id,
                  }));
                }}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">Pilih nozzle dispenser…</option>
                {nozzles.map((n) => (
                  <option key={n.id} value={n.id}>
                    Pump {n.pump_number || n.pumpNum || "—"} · N{n.number} (
                    {n.product_name || n.product})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Shift Kerja
              </label>
              <select
                value={form.shift}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shift: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="PAGI">Shift Pagi</option>
                <option value="SIANG">Shift Siang</option>
                <option value="MALAM">Shift Malam</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => setManualModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "Menyimpan…" : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* VOID Confirmation Modal */}
      <Modal
        open={voidModal}
        onClose={() => setVoidModal(false)}
        title="Batalkan (VOID) Transaksi"
        size="sm"
      >
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12.5px] text-red-700">
            ⚠ Pembatalan transaksi akan mengembalikan kuota kartu dan memulihkan
            stok tangki terkait.
          </div>
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Alasan VOID (Wajib)
            </label>
            <textarea
              rows={3}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Contoh: Salah input volume transaksi oleh operator"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setVoidModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleVoidTransaction}
              disabled={submitting || !voidReason.trim()}
            >
              {submitting ? "Memproses…" : "Konfirmasi VOID"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

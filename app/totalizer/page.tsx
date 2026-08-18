"use client";
import { useState, useEffect, useCallback } from "react";
import { api, Nozzle, Totalizer, PumpRecon } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Plus, RefreshCw } from "lucide-react";

export default function TotalizerPage() {
  const [totalizers, setTotalizers] = useState<Totalizer[]>([]);
  const [reconciliations, setReconciliations] = useState<PumpRecon[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [shiftDate, setShiftDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Totalizer Input Modal
  const [inputModal, setInputModal] = useState(false);
  const [form, setForm] = useState({
    nozzle_id: "",
    opening_value: "",
    current_value: "",
    shift_date: new Date().toISOString().split("T")[0],
    shift: "PAGI",
  });

  const { success, error: toastError } = useToast();

  const loadData = useCallback(
    async (dateStr?: string) => {
      try {
        setLoading(true);
        const [totRes, recRes, nzlRes] = await Promise.allSettled([
          api.pumps.totalizers(dateStr),
          api.pumps.reconciliation(dateStr),
          api.pumps.nozzles(),
        ]);

        if (totRes.status === "fulfilled" && totRes.value?.data)
          setTotalizers(totRes.value.data);
        if (recRes.status === "fulfilled" && recRes.value?.data)
          setReconciliations(recRes.value.data);
        if (nzlRes.status === "fulfilled" && nzlRes.value?.data) {
          setNozzles(nzlRes.value.data);
          if (nzlRes.value.data.length > 0 && !form.nozzle_id) {
            setForm((f) => ({ ...f, nozzle_id: nzlRes.value.data[0].id }));
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [form.nozzle_id],
  );

  useEffect(() => {
    loadData(shiftDate);
  }, [shiftDate, loadData]);

  const handleSaveTotalizer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nozzle_id || !form.opening_value || !form.current_value) {
      toastError(
        "Data Belum Lengkap",
        "Pilih nozzle dan isi angka totalizer awal serta akhir.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.pumps.pushTotalizer({
        nozzle_id: form.nozzle_id,
        opening_value: Number(form.opening_value),
        current_value: Number(form.current_value),
        shift_date: form.shift_date,
        shift: form.shift,
      });
      success(
        "Totalizer Tersimpan",
        "Data pembacaan totalizer shift berhasil dicatat.",
      );
      setInputModal(false);
      setForm((f) => ({ ...f, opening_value: "", current_value: "" }));
      loadData(shiftDate);
    } catch (err: unknown) {
      toastError(
        "Gagal Menyimpan Totalizer",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalReconVariance = reconciliations.reduce(
    (s, r) => s + (r.variance_l ?? 0),
    0,
  );
  const totalTotUsage = reconciliations.reduce(
    (s, r) => s + (r.totalizer_usage ?? 0),
    0,
  );
  const totalSysSales = reconciliations.reduce(
    (s, r) => s + (r.system_sales ?? 0),
    0,
  );

  return (
    <div>
      <PageHeader
        title="Totalizer Management"
        subtitle="Catat dan pantau angka totalizer meter dispenser mekanik/elektronik per shift"
      >
        <Button variant="outline" size="sm" onClick={() => loadData(shiftDate)}>
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button variant="primary" size="sm" onClick={() => setInputModal(true)}>
          <Plus size={13} /> Catat Totalizer Shift
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard
          eyebrow="Dispensing Totalizer"
          value={totalTotUsage.toLocaleString("id-ID")}
          unit="L"
          accent="black"
        />
        <KpiCard
          eyebrow="Transaksi Sistem"
          value={totalSysSales.toLocaleString("id-ID")}
          unit="L"
          accent="blue"
        />
        <KpiCard
          eyebrow="Total Variance Pompa"
          value={`${totalReconVariance > 0 ? `+${totalReconVariance}` : totalReconVariance}`}
          unit="L"
          delta={
            Math.abs(totalReconVariance) > 5
              ? "perlu kalibrasi nozzle"
              : "akurasi normal"
          }
          deltaDir={Math.abs(totalReconVariance) > 5 ? "down" : "up"}
          accent={Math.abs(totalReconVariance) > 5 ? "amber" : "green"}
        />
        <KpiCard
          eyebrow="Total Nozzle Terpasang"
          value={nozzles.length.toString()}
          meta="semua pump island"
          accent="black"
        />
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-zinc-200">
        <span className="text-[13px] font-medium text-zinc-700">
          Tanggal Shift:
        </span>
        <input
          type="date"
          value={shiftDate}
          onChange={(e) => setShiftDate(e.target.value)}
          className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      {/* Dispenser reconciliation table */}
      <Card padding={false} className="mb-5">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold">
              Rekonsiliasi Nozzle Totalizer vs Transaksi Sistem
            </h3>
            <p className="text-[11.5px] text-zinc-400">
              Membandingkan selisih antara liter flow meter pompa dengan
              transaksi kartu
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(shiftDate)}
          >
            Hitung Ulang
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Nozzle ID</th>
                <th>Pompa Dispenser</th>
                <th>Nomor Nozzle</th>
                <th>Produk BBM</th>
                <th>Usage Totalizer (L)</th>
                <th>Sales Sistem (L)</th>
                <th>Variance (L)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && reconciliations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Memuat rekonsiliasi totalizer…
                  </td>
                </tr>
              ) : reconciliations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Belum ada data totalizer tercatat untuk tanggal ini
                  </td>
                </tr>
              ) : (
                reconciliations.map((r) => (
                  <tr key={r.nozzle_id}>
                    <td className="font-mono text-[12px] text-zinc-500">
                      {r.nozzle_id}
                    </td>
                    <td className="font-semibold text-zinc-800">
                      Pompa {r.pump_number}
                    </td>
                    <td>
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-zinc-100 rounded-full font-semibold text-[12px] text-zinc-700">
                        N{r.nozzle_number}
                      </span>
                    </td>
                    <td>
                      <Badge variant="neutral">{r.product_name}</Badge>
                    </td>
                    <td className="font-semibold text-zinc-900">
                      {(r.totalizer_usage ?? 0).toLocaleString("id-ID")} L
                    </td>
                    <td className="text-zinc-600">
                      {(r.system_sales ?? 0).toLocaleString("id-ID")} L
                    </td>
                    <td>
                      <span
                        className={`font-semibold text-[13px] ${Math.abs(r.variance_l) > 5 ? "text-amber-600" : "text-green-600"}`}
                      >
                        {r.variance_l > 0 ? `+${r.variance_l}` : r.variance_l} L
                      </span>
                    </td>
                    <td>
                      <Badge
                        variant={
                          Math.abs(r.variance_l) > 5 ? "warning" : "success"
                        }
                      >
                        {Math.abs(r.variance_l) > 5 ? "VARIANCE" : "NORMAL"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-50">
                <td
                  colSpan={4}
                  className="px-4 py-3 text-[12px] font-semibold text-zinc-600"
                >
                  TOTAL
                </td>
                <td className="px-4 py-3 font-bold text-zinc-900">
                  {totalTotUsage.toLocaleString("id-ID")} L
                </td>
                <td className="px-4 py-3 font-bold text-zinc-900">
                  {totalSysSales.toLocaleString("id-ID")} L
                </td>
                <td className="px-4 py-3 font-bold text-amber-600">
                  {totalReconVariance > 0
                    ? `+${totalReconVariance}`
                    : totalReconVariance}{" "}
                  L
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Manual Input Modal */}
      <Modal
        open={inputModal}
        onClose={() => setInputModal(false)}
        title="Pencatatan Angka Totalizer Shift"
      >
        <form onSubmit={handleSaveTotalizer} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Pilih Nozzle *
            </label>
            <select
              value={form.nozzle_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, nozzle_id: e.target.value }))
              }
              required
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            >
              {nozzles.map((n) => (
                <option key={n.id} value={n.id}>
                  Pompa {n.pump_number || n.pumpNum || "—"} · N{n.number} (
                  {n.product_name || n.product})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Tanggal Shift *
              </label>
              <input
                type="date"
                required
                value={form.shift_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shift_date: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Totalizer Awal (Opening) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="10450.5"
                value={form.opening_value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, opening_value: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Totalizer Akhir (Current) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="10890.2"
                value={form.current_value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, current_value: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => setInputModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "Menyimpan…" : "Simpan Pembacaan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

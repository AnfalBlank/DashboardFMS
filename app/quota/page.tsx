"use client";
import { useState, useEffect, useCallback } from "react";
import {
  api,
  CardQuota,
  QuotaPeriod,
  QuotaLedger,
  Card as CardType,
} from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Plus, RefreshCw, SlidersHorizontal } from "lucide-react";

export default function QuotaPage() {
  const [periods, setPeriods] = useState<QuotaPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [quotas, setQuotas] = useState<CardQuota[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [selectedCardName, setSelectedCardName] = useState<string>("");
  const [ledger, setLedger] = useState<QuotaLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const { success, info } = useToast();
  const router = useRouter();

  // Load periods
  useEffect(() => {
    api.quota
      .periods()
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setPeriods(res.data);
          setSelectedPeriod(res.data[0].id || res.data[0].period);
        }
      })
      .catch(() => {});
  }, []);

  const fetchQuotas = useCallback(
    async (periodId?: string) => {
      try {
        setLoading(true);
        const res = await api.quota.list(
          periodId ? { period_id: periodId } : undefined,
        );
        if (res?.data) {
          setQuotas(res.data);
          if (res.data.length > 0 && !selectedCardId) {
            setSelectedCardId(res.data[0].card_id || res.data[0].id);
            setSelectedCardName(
              res.data[0].holder_name || res.data[0].card_number || "Kartu",
            );
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [selectedCardId],
  );

  useEffect(() => {
    fetchQuotas(selectedPeriod);
  }, [selectedPeriod, fetchQuotas]);

  // Load ledger when card selected
  useEffect(() => {
    if (!selectedCardId) return;
    setLedgerLoading(true);
    api.quota
      .ledger(selectedCardId)
      .then((res) => {
        if (res?.data) setLedger(res.data);
        else setLedger([]);
      })
      .catch(() => setLedger([]))
      .finally(() => setLedgerLoading(false));
  }, [selectedCardId]);

  const totalAllocated = quotas.reduce((s, q) => s + (q.allocated_l ?? 0), 0);
  const totalUsed = quotas.reduce((s, q) => s + (q.used_l ?? 0), 0);
  const totalRemaining = quotas.reduce((s, q) => s + (q.remaining_l ?? 0), 0);
  const totalExpired = quotas.reduce((s, q) => s + (q.expired_l ?? 0), 0);
  const avgUtil =
    totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Quota Management"
        subtitle="Kelola alokasi dan mutasi kuota BBM per kartu per periode"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchQuotas(selectedPeriod)}
        >
          <RefreshCw size={13} /> Refresh
        </Button>
        <Button
          variant="aloe"
          size="sm"
          onClick={() => router.push("/allocation")}
        >
          <SlidersHorizontal size={13} /> Generate Massal →
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push("/topup")}
        >
          <Plus size={13} /> Top Up →
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard
          eyebrow="Total Kuota"
          value={totalAllocated.toLocaleString("id-ID")}
          unit="L"
          accent="black"
        />
        <KpiCard
          eyebrow="Terpakai"
          value={totalUsed.toLocaleString("id-ID")}
          unit="L"
          delta={`${avgUtil}%`}
          deltaDir="neutral"
          accent="green"
        />
        <KpiCard
          eyebrow="Sisa"
          value={totalRemaining.toLocaleString("id-ID")}
          unit="L"
          accent="blue"
        />
        <KpiCard
          eyebrow="Hangus"
          value={totalExpired.toLocaleString("id-ID")}
          unit="L"
          deltaDir="down"
          accent="amber"
        />
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {periods.length === 0 ? (
          <button className="px-4 py-2 rounded-full text-[12.5px] font-medium border bg-black text-white border-black">
            Periode Berjalan
          </button>
        ) : (
          periods.map((p) => {
            const pId = p.id || p.period;
            const isSelected = selectedPeriod === pId;
            return (
              <button
                key={pId}
                onClick={() => {
                  setSelectedPeriod(pId);
                  if (p.status === "CLOSED")
                    info(
                      "Periode Ditutup",
                      `Periode ${p.period} sudah diarsipkan.`,
                    );
                }}
                className={clsx(
                  "px-4 py-2 rounded-full text-[12.5px] font-medium border transition",
                  isSelected
                    ? "bg-black text-white border-black shadow-sm"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400 bg-white",
                )}
              >
                {p.period} {p.status ? `— ${p.status}` : ""}
              </button>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Quota table */}
        <div className="col-span-2">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold">
                Alokasi Kuota per Kartu
              </h3>
              <span className="text-[12px] text-zinc-400">
                {quotas.length} kartu dialokasikan
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="fuel-table">
                <thead>
                  <tr>
                    <th>Kartu</th>
                    <th>Pemegang</th>
                    <th>Satuan Kerja</th>
                    <th>Produk</th>
                    <th>Alokasi</th>
                    <th>Top Up</th>
                    <th>Terpakai</th>
                    <th>Sisa</th>
                    <th>Utilisasi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && quotas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-[13px] text-zinc-400"
                      >
                        Memuat data kuota…
                      </td>
                    </tr>
                  ) : quotas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-[13px] text-zinc-400"
                      >
                        Belum ada kuota yang digenerate untuk periode ini.
                        <Button
                          variant="aloe"
                          size="sm"
                          className="ml-3"
                          onClick={() => router.push("/allocation")}
                        >
                          Generate Sekarang
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    quotas.map((q) => {
                      const util =
                        q.allocated_l > 0
                          ? Math.round((q.used_l / q.allocated_l) * 100)
                          : 0;
                      const isSelected = selectedCardId === (q.card_id || q.id);
                      return (
                        <tr
                          key={q.id}
                          className={clsx(
                            "cursor-pointer transition",
                            isSelected
                              ? "bg-zinc-50 font-medium"
                              : "hover:bg-zinc-50",
                          )}
                          onClick={() => {
                            setSelectedCardId(q.card_id || q.id);
                            setSelectedCardName(
                              q.holder_name || q.card_number || "Kartu",
                            );
                          }}
                        >
                          <td className="font-mono font-semibold text-zinc-700">
                            {q.card_number || q.card_id}
                          </td>
                          <td className="font-medium">
                            {q.holder_name || "—"}
                          </td>
                          <td className="text-zinc-500 text-[12px]">
                            {q.unit_name || "—"}
                          </td>
                          <td className="text-zinc-500 text-[12px]">
                            {q.product_name || "Pertamax"}
                          </td>
                          <td>{q.allocated_l} L</td>
                          <td className="text-green-600">
                            +{q.topup_l ?? 0} L
                          </td>
                          <td className="font-semibold">{q.used_l} L</td>
                          <td
                            className={
                              q.remaining_l <= 20
                                ? "text-red-600 font-bold"
                                : "text-green-600 font-bold"
                            }
                          >
                            {q.remaining_l} L
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                  className={clsx(
                                    "h-full rounded-full transition-all duration-500",
                                    util >= 90
                                      ? "bg-red-500"
                                      : util >= 75
                                        ? "bg-amber-400"
                                        : "bg-emerald-500",
                                  )}
                                  style={{ width: `${Math.min(100, util)}%` }}
                                />
                              </div>
                              <span
                                className={clsx(
                                  "text-[11.5px] font-semibold",
                                  util >= 90 ? "text-red-600" : "text-zinc-700",
                                )}
                              >
                                {util}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Ledger */}
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-zinc-100">
            <h3 className="text-[13px] font-semibold">
              Buku Besar Mutasi Kuota
            </h3>
            <p className="text-[11.5px] text-zinc-400 mt-1">
              {selectedCardName || "Pilih kartu pada tabel"}
            </p>
          </div>
          <div className="py-2 min-h-[220px]">
            {ledgerLoading ? (
              <div className="p-6 text-center text-[13px] text-zinc-400">
                Memuat mutasi…
              </div>
            ) : ledger.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-zinc-400">
                Belum ada riwayat mutasi kartu ini
              </div>
            ) : (
              ledger.map((e, i) => {
                const amt = e.amount_l ?? e.amount ?? 0;
                const bal = e.balance_l ?? e.balance ?? 0;
                const isTopup = e.type === "TOPUP" || e.type === "ALLOCATION";
                return (
                  <div
                    key={e.id || i}
                    className="flex gap-3 px-5 py-3 border-b border-zinc-50 last:border-0"
                  >
                    <div className="pt-0.5">
                      <span
                        className={clsx(
                          "inline-block w-2 h-2 rounded-full",
                          e.type === "TOPUP"
                            ? "bg-green-500"
                            : e.type === "DEDUCTION"
                              ? "bg-red-400"
                              : "bg-blue-500",
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={clsx(
                            "text-[13.5px] font-semibold",
                            isTopup ? "text-green-600" : "text-red-600",
                          )}
                        >
                          {amt > 0 ? `+${amt}` : amt} L
                        </span>
                        <span className="text-[12.5px] font-semibold text-zinc-900">
                          {bal} L
                        </span>
                      </div>
                      <p className="text-[11.5px] text-zinc-500 mt-0.5">
                        {e.description}
                      </p>
                      <p className="text-[11px] text-zinc-300 mt-0.5">
                        {e.created_at
                          ? new Date(e.created_at).toLocaleDateString("id-ID")
                          : (e.date ?? "—")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50 space-y-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => router.push("/topup")}
            >
              + Top Up Kuota →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

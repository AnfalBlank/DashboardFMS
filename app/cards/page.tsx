"use client";
import { useState, useEffect, useCallback } from "react";
import {
  api,
  Card as CardType,
  Unit,
  Vehicle,
  CardQuota,
  Transaction,
} from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Input";
import {
  Search,
  Eye,
  Plus,
  Edit,
  Ban,
  CheckCircle2,
  History,
} from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

export default function CardsPage() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("ALL");
  const [unitF, setUnitF] = useState("ALL");

  // Detail drawer
  const [selected, setSelected] = useState<CardType | null>(null);
  const [cardQuota, setCardQuota] = useState<CardQuota | null>(null);
  const [cardTrx, setCardTrx] = useState<Transaction[]>([]);

  // Add / Edit Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<CardType | null>(null);

  // Block / Unblock Modal
  const [blockModal, setBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockTarget, setBlockTarget] = useState<CardType | null>(null);
  const [isUnblocking, setIsUnblocking] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const { success, warning, error: toastError } = useToast();
  const router = useRouter();

  // Form state
  const [form, setForm] = useState({
    card_number: "",
    card_type: "REGULER",
    holder_name: "",
    unit_id: "",
    vehicle_id: "",
    fuel_type: "Pertamax",
    monthly_limit: "200",
    expiry_date: "2027-12-31",
    activation_date: new Date().toISOString().split("T")[0],
    rfid_uid: "",
    notes: "",
  });

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.cards.list({ limit: 100 });
      if (res?.data) {
        setCards(res.data);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
    Promise.allSettled([api.master.units(), api.master.vehicles()]).then(
      ([uRes, vRes]) => {
        if (uRes.status === "fulfilled" && uRes.value?.data)
          setUnits(uRes.value.data);
        if (vRes.status === "fulfilled" && vRes.value?.data)
          setVehicles(vRes.value.data);
      },
    );
  }, [fetchCards]);

  const handleSelectCard = async (c: CardType) => {
    setSelected(c);
    try {
      const [qRes, tRes] = await Promise.allSettled([
        api.cards.quota(c.id || c.card_number),
        api.cards.transactions(c.id || c.card_number, { limit: 10 }),
      ]);
      if (
        qRes.status === "fulfilled" &&
        qRes.value?.data &&
        qRes.value.data.length > 0
      ) {
        setCardQuota(qRes.value.data[0]);
      } else {
        setCardQuota(null);
      }
      if (tRes.status === "fulfilled" && tRes.value?.data) {
        setCardTrx(tRes.value.data);
      } else {
        setCardTrx([]);
      }
    } catch {
      // ignore
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.card_number || !form.holder_name) {
      toastError(
        "Data Belum Lengkap",
        "Nomor kartu dan nama pemegang wajib diisi.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.cards.create({
        card_number: form.card_number,
        card_type: form.card_type,
        holder_name: form.holder_name,
        unit_id: form.unit_id || undefined,
        vehicle_id: form.vehicle_id || undefined,
        fuel_type: form.fuel_type,
        monthly_limit: Number(form.monthly_limit),
        expiry_date: form.expiry_date,
        activation_date: form.activation_date,
        rfid_uid: form.rfid_uid || undefined,
        notes: form.notes || undefined,
      });
      success(
        "Kartu Didaftarkan",
        `Kartu ${form.card_number} berhasil didaftarkan ke sistem.`,
      );
      setShowAddModal(false);
      setForm({
        card_number: "",
        card_type: "REGULER",
        holder_name: "",
        unit_id: "",
        vehicle_id: "",
        fuel_type: "Pertamax",
        monthly_limit: "200",
        expiry_date: "2027-12-31",
        activation_date: new Date().toISOString().split("T")[0],
        rfid_uid: "",
        notes: "",
      });
      fetchCards();
    } catch (err: unknown) {
      toastError(
        "Gagal Menambah Kartu",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      setSubmitting(true);
      await api.cards.update(editTarget.id || editTarget.card_number, {
        holder_name: form.holder_name,
        unit_id: form.unit_id || undefined,
        vehicle_id: form.vehicle_id || undefined,
        fuel_type: form.fuel_type,
        monthly_limit: Number(form.monthly_limit),
        notes: form.notes,
      });
      success(
        "Kartu Diperbarui",
        `Informasi kartu ${editTarget.card_number || editTarget.number} telah disimpan.`,
      );
      setShowEditModal(false);
      setEditTarget(null);
      if (
        selected &&
        (selected.id === editTarget.id ||
          selected.card_number === editTarget.card_number)
      ) {
        setSelected({
          ...selected,
          holder_name: form.holder_name,
          holder: form.holder_name,
          fuel_type: form.fuel_type,
          fuelType: form.fuel_type,
          monthly_limit: Number(form.monthly_limit),
          monthlyLimit: Number(form.monthly_limit),
        });
      }
      fetchCards();
    } catch (err: unknown) {
      toastError(
        "Gagal Memperbarui Kartu",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlockAction = async () => {
    if (!blockTarget) return;

    try {
      setSubmitting(true);
      if (isUnblocking) {
        await api.cards.unblock(
          blockTarget.id || blockTarget.card_number,
          blockReason || "Membuka blokir kartu",
        );
        success(
          "Blokir Dibuka",
          `Kartu ${blockTarget.card_number || blockTarget.number} telah diaktifkan kembali.`,
        );
      } else {
        await api.cards.block(
          blockTarget.id || blockTarget.card_number,
          blockReason || "Diblokir oleh administrator",
        );
        warning(
          "Kartu Diblokir",
          `Kartu ${blockTarget.card_number || blockTarget.number} telah diblokir dari transaksi.`,
        );
      }
      setBlockModal(false);
      setBlockTarget(null);
      setBlockReason("");
      if (selected) {
        setSelected({
          ...selected,
          status: isUnblocking ? "ACTIVE" : "BLOCKED",
        });
      }
      fetchCards();
    } catch (err: unknown) {
      toastError(
        "Aksi Gagal",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = cards.filter((c) => {
    const num = c.card_number || c.number || "";
    const holder = c.holder_name || c.holder || "";
    const unit = c.unit_name || c.unit || "";
    const status = c.status || "";

    const matchSearch =
      !search ||
      num.toLowerCase().includes(search.toLowerCase()) ||
      holder.toLowerCase().includes(search.toLowerCase()) ||
      unit.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusF === "ALL" || status === statusF;
    const matchUnit = unitF === "ALL" || unit === unitF;
    return matchSearch && matchStatus && matchUnit;
  });

  const activeCount = cards.filter((c) => c.status === "ACTIVE").length;
  const blockedCount = cards.filter((c) => c.status === "BLOCKED").length;
  const suspendedCount = cards.filter((c) => c.status === "SUSPENDED").length;
  const inactiveCount = cards.filter(
    (c) => c.status === "INACTIVE" || c.status === "EXPIRED",
  ).length;

  return (
    <div>
      <PageHeader
        title="Cards & RFID"
        subtitle="Kelola kartu BBM, alokasi pagu kuota, dan kendaraan dinas"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            success("Export dimulai", "File Excel kartu sedang disiapkan.")
          }
        >
          Export
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={13} />
          Tambah Kartu
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: "Total Kartu", value: cards.length.toString(), color: "" },
          {
            label: "Active",
            value: activeCount.toString(),
            color: "text-green-600",
          },
          {
            label: "Blocked",
            value: blockedCount.toString(),
            color: "text-red-600",
          },
          {
            label: "Suspended",
            value: suspendedCount.toString(),
            color: "text-amber-600",
          },
          {
            label: "Inactive / Expired",
            value: inactiveCount.toString(),
            color: "text-zinc-400",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]"
          >
            <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">
              {k.label}
            </p>
            <p
              className={clsx(
                "text-[24px] font-light",
                k.color || "text-zinc-900",
              )}
            >
              {k.value}
            </p>
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
            placeholder="Cari nomor kartu, nama pemegang, satuan kerja…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-full text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition"
          />
        </div>
        <Select
          value={statusF}
          onChange={setStatusF}
          options={[
            { value: "ALL", label: "Semua Status" },
            { value: "ACTIVE", label: "ACTIVE" },
            { value: "BLOCKED", label: "BLOCKED" },
            { value: "SUSPENDED", label: "SUSPENDED" },
            { value: "INACTIVE", label: "INACTIVE" },
          ]}
          className="w-44"
        />
        <Select
          value={unitF}
          onChange={setUnitF}
          options={[
            { value: "ALL", label: "Semua Unit" },
            ...units.map((u) => ({ value: u.name, label: u.name })),
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
                <th>Nomor Kartu</th>
                <th>Tipe</th>
                <th>Pemegang</th>
                <th>Satuan Kerja</th>
                <th>Kendaraan</th>
                <th>Produk</th>
                <th>Limit/Bln</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && cards.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Memuat data kartu dari server…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-8 text-[13px] text-zinc-400"
                  >
                    Tidak ada data kartu yang ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const num = c.card_number || c.number || "—";
                  const holder = c.holder_name || c.holder || "—";
                  const unit = c.unit_name || c.unit || "—";
                  const veh = c.police_number || c.vehicle || "—";
                  const fuel = c.fuel_type || c.fuelType || "Pertamax";
                  const limit = c.monthly_limit ?? c.monthlyLimit ?? 0;

                  return (
                    <tr key={c.id}>
                      <td className="font-mono font-semibold text-zinc-800">
                        {num}
                      </td>
                      <td>
                        <Badge variant="neutral">
                          {c.card_type || c.type || "REGULER"}
                        </Badge>
                      </td>
                      <td className="font-medium text-zinc-900">{holder}</td>
                      <td className="text-zinc-500 text-[12px]">{unit}</td>
                      <td className="text-zinc-500 text-[12px]">{veh}</td>
                      <td className="text-zinc-500 text-[12px]">{fuel}</td>
                      <td className="font-semibold">{limit} L</td>
                      <td>
                        <Badge variant={statusVariant(c.status)}>
                          {c.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSelectCard(c)}
                            title="Detail kartu"
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setEditTarget(c);
                              setForm({
                                card_number: c.card_number || c.number || "",
                                card_type: c.card_type || c.type || "REGULER",
                                holder_name: c.holder_name || c.holder || "",
                                unit_id: c.unit_id || "",
                                vehicle_id: c.vehicle_id || "",
                                fuel_type:
                                  c.fuel_type || c.fuelType || "Pertamax",
                                monthly_limit: (
                                  c.monthly_limit ??
                                  c.monthlyLimit ??
                                  200
                                ).toString(),
                                expiry_date:
                                  c.expiry_date || c.expiry || "2027-12-31",
                                activation_date:
                                  c.activation_date || c.activation || "",
                                rfid_uid: c.rfid_uid || "",
                                notes: c.notes || "",
                              });
                              setShowEditModal(true);
                            }}
                            title="Edit kartu"
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setBlockTarget(c);
                              setIsUnblocking(c.status === "BLOCKED");
                              setBlockReason("");
                              setBlockModal(true);
                            }}
                            title={
                              c.status === "BLOCKED"
                                ? "Buka blokir"
                                : "Blokir kartu"
                            }
                            className={clsx(
                              "p-1.5 rounded-lg transition",
                              c.status === "BLOCKED"
                                ? "text-green-600 hover:bg-green-50"
                                : "text-red-500 hover:bg-red-50",
                            )}
                          >
                            {c.status === "BLOCKED" ? (
                              <CheckCircle2 size={13} />
                            ) : (
                              <Ban size={13} />
                            )}
                          </button>
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
            Menampilkan {filtered.length} dari {cards.length} kartu
          </span>
          <Button variant="outline" size="sm" onClick={fetchCards}>
            Refresh
          </Button>
        </div>
      </Card>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setSelected(null)}
          />
          <div className="w-[440px] bg-white h-full overflow-y-auto shadow-2xl animate-fade-in">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-[15px] font-semibold">Detail Kartu BBM</h2>
              <button
                onClick={() => setSelected(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">
                    Nomor Kartu
                  </p>
                  <p className="text-[26px] font-light text-zinc-900 font-mono">
                    {selected.card_number || selected.number}
                  </p>
                </div>
                <Badge
                  variant={statusVariant(selected.status)}
                  className="mt-2"
                >
                  {selected.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Pemegang", selected.holder_name || selected.holder || "—"],
                  ["Unit / Satker", selected.unit_name || selected.unit || "—"],
                  [
                    "Kendaraan",
                    selected.police_number || selected.vehicle || "—",
                  ],
                  [
                    "Produk BBM",
                    selected.fuel_type || selected.fuelType || "—",
                  ],
                  [
                    "Tipe Kartu",
                    selected.card_type || selected.type || "REGULER",
                  ],
                  [
                    "Limit Bulanan",
                    `${selected.monthly_limit ?? selected.monthlyLimit ?? 0} L`,
                  ],
                  ["RFID UID", selected.rfid_uid || "—"],
                  [
                    "Tgl Expired",
                    selected.expiry_date || selected.expiry || "—",
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

              {/* Quota bar */}
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-3 font-semibold">
                  Status Kuota Periode Berjalan
                </p>
                {cardQuota ? (
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-zinc-500">Alokasi</span>
                      <span className="font-semibold">
                        {cardQuota.allocated_l} L
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-zinc-500">Terpakai</span>
                      <span className="font-semibold text-zinc-900">
                        {cardQuota.used_l} L
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-zinc-500">Sisa Kuota</span>
                      <span
                        className={
                          cardQuota.remaining_l <= 20
                            ? "text-red-600 font-bold"
                            : "text-green-600 font-bold"
                        }
                      >
                        {cardQuota.remaining_l} L
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-2.5 overflow-hidden mt-2">
                      <div
                        className="bg-zinc-900 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${cardQuota.allocated_l > 0 ? Math.min(100, Math.round((cardQuota.used_l / cardQuota.allocated_l) * 100)) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[12px] text-zinc-400">
                    Pagu default:{" "}
                    {selected.monthly_limit ?? selected.monthlyLimit ?? 200} L /
                    bulan
                  </p>
                )}
              </div>

              {/* Recent card transactions */}
              {cardTrx.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-2 font-semibold flex items-center gap-1">
                    <History size={12} /> Riwayat Transaksi Terakhir
                  </p>
                  <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl overflow-hidden">
                    {cardTrx.slice(0, 4).map((t) => (
                      <div
                        key={t.id}
                        className="p-3 text-[12px] flex justify-between items-center hover:bg-zinc-50"
                      >
                        <div>
                          <p className="font-medium text-zinc-900">
                            {t.volume_l ?? t.volume} L{" "}
                            {t.product_name ?? t.product}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {t.transaction_time
                              ? new Date(t.transaction_time).toLocaleDateString(
                                  "id-ID",
                                )
                              : "—"}
                          </p>
                        </div>
                        <Badge variant={statusVariant(t.status)}>
                          {t.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setEditTarget(selected);
                      setForm({
                        card_number:
                          selected.card_number || selected.number || "",
                        card_type:
                          selected.card_type || selected.type || "REGULER",
                        holder_name:
                          selected.holder_name || selected.holder || "",
                        unit_id: selected.unit_id || "",
                        vehicle_id: selected.vehicle_id || "",
                        fuel_type:
                          selected.fuel_type || selected.fuelType || "Pertamax",
                        monthly_limit: (
                          selected.monthly_limit ??
                          selected.monthlyLimit ??
                          200
                        ).toString(),
                        expiry_date:
                          selected.expiry_date ||
                          selected.expiry ||
                          "2027-12-31",
                        activation_date:
                          selected.activation_date || selected.activation || "",
                        rfid_uid: selected.rfid_uid || "",
                        notes: selected.notes || "",
                      });
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={13} /> Edit Kartu
                  </Button>
                  <Button
                    variant={selected.status === "BLOCKED" ? "aloe" : "danger"}
                    className="flex-1"
                    onClick={() => {
                      setBlockTarget(selected);
                      setIsUnblocking(selected.status === "BLOCKED");
                      setBlockReason("");
                      setBlockModal(true);
                    }}
                  >
                    {selected.status === "BLOCKED" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Ban size={13} />
                    )}
                    {selected.status === "BLOCKED" ? "Buka Blokir" : "Blokir"}
                  </Button>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setSelected(null);
                    router.push("/topup");
                  }}
                >
                  Top Up Kuota Darurat →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Pendaftaran Kartu BBM / RFID Baru"
      >
        <form onSubmit={handleCreateCard} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Nomor Kartu *
              </label>
              <input
                placeholder="CRD-2026-099"
                required
                value={form.card_number}
                onChange={(e) =>
                  setForm((f) => ({ ...f, card_number: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Tipe Kartu
              </label>
              <select
                value={form.card_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, card_type: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="REGULER">REGULER</option>
                <option value="KHUSUS">KHUSUS / OPERASIONAL</option>
                <option value="DARURAT">DARURAT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Nama Pemegang / NRP *
            </label>
            <input
              placeholder="Bripka Joko Susilo"
              required
              value={form.holder_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, holder_name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Satuan Kerja (Unit)
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
                Kendaraan Dinas Tertaut
              </label>
              <select
                value={form.vehicle_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vehicle_id: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">Pilih kendaraan…</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.police_number || v.policeNumber} ({v.brand} {v.model})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Jenis BBM
              </label>
              <select
                value={form.fuel_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fuel_type: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="Pertamax">Pertamax</option>
                <option value="Pertalite">Pertalite</option>
                <option value="Dexlite">Dexlite</option>
                <option value="Pertamax Turbo">Pertamax Turbo</option>
                <option value="Pertamina DEX">Pertamina DEX</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Limit Bulanan (L)
              </label>
              <input
                type="number"
                value={form.monthly_limit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthly_limit: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              RFID UID / Serial Hardware
            </label>
            <input
              placeholder="E28068940000"
              value={form.rfid_uid}
              onChange={(e) =>
                setForm((f) => ({ ...f, rfid_uid: e.target.value }))
              }
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => setShowAddModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "Menyimpan…" : "Daftarkan Kartu"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Card Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Kartu BBM"
      >
        <form onSubmit={handleUpdateCard} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Nama Pemegang *
            </label>
            <input
              required
              value={form.holder_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, holder_name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            />
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
                Limit Bulanan (L)
              </label>
              <input
                type="number"
                value={form.monthly_limit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthly_limit: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Catatan Operasional
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => setShowEditModal(false)}
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

      {/* Block / Unblock Modal */}
      <Modal
        open={blockModal}
        onClose={() => setBlockModal(false)}
        title={isUnblocking ? "Buka Blokir Kartu" : "Blokir Kartu BBM"}
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-zinc-600">
            {isUnblocking
              ? `Apakah Anda yakin ingin mengaktifkan kembali kartu ${blockTarget?.card_number || blockTarget?.number}?`
              : `Kartu ${blockTarget?.card_number || blockTarget?.number} tidak akan dapat digunakan untuk pengisian dispenser.`}
          </p>
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Alasan Tindakan
            </label>
            <textarea
              rows={2}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder={
                isUnblocking
                  ? "Kartu ditemukan kembali & diverifikasi"
                  : "Kartu hilang atau aktivitas mencurigakan"
              }
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setBlockModal(false)}
            >
              Batal
            </Button>
            <Button
              variant={isUnblocking ? "aloe" : "danger"}
              className="flex-1"
              onClick={handleBlockAction}
              disabled={submitting}
            >
              {submitting
                ? "Memproses…"
                : isUnblocking
                  ? "Buka Blokir"
                  : "Blokir Kartu"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";
import {
  api,
  Card as CardType,
  Unit,
  Vehicle,
  Product,
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
  Fuel,
  Lock,
  Car,
  Radio,
} from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

export default function CardsPage() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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

  // Form states (separated to prevent state contamination between Add & Edit)
  const initialCreateForm = {
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
  };

  const [createForm, setCreateForm] = useState(initialCreateForm);

  const [editForm, setEditForm] = useState({
    holder_name: "",
    unit_id: "",
    vehicle_id: "",
    fuel_type: "Pertamax",
    monthly_limit: "200",
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
    Promise.allSettled([
      api.master.units(),
      api.master.vehicles(),
      api.master.products(),
    ]).then(([uRes, vRes, pRes]) => {
      if (uRes.status === "fulfilled" && uRes.value?.data)
        setUnits(uRes.value.data);
      if (vRes.status === "fulfilled" && vRes.value?.data)
        setVehicles(vRes.value.data);
      if (pRes.status === "fulfilled" && pRes.value?.data)
        setProducts(pRes.value.data);
    });
  }, [fetchCards]);

  const openAddModal = () => {
    setCreateForm({
      ...initialCreateForm,
      fuel_type: products[0]?.name || "Pertamax",
      activation_date: new Date().toISOString().split("T")[0],
    });
    setShowAddModal(true);
  };

  const openEditModal = (target: CardType) => {
    setEditTarget(target);
    const targetVeh = vehicles.find((v) => v.id === target.vehicle_id);
    setEditForm({
      holder_name: target.holder_name || target.holder || "",
      unit_id: target.unit_id || "",
      vehicle_id: target.vehicle_id || "",
      fuel_type:
        target.product_name ||
        target.fuel_type ||
        target.fuelType ||
        targetVeh?.product_name ||
        targetVeh?.fuel_type ||
        products[0]?.name ||
        "Pertamax",
      monthly_limit: (
        target.monthly_limit ??
        target.monthlyLimit ??
        200
      ).toString(),
      rfid_uid: target.rfid_uid || target.rfidUid || "",
      notes: target.notes || "",
    });
    setShowEditModal(true);
  };

  const handleCreateVehicleChange = (vehicleId: string) => {
    const selectedVeh = vehicles.find((v) => v.id === vehicleId);
    const vFuel =
      selectedVeh?.product_name ||
      selectedVeh?.fuel_type ||
      selectedVeh?.fuelType ||
      "";
    setCreateForm((f) => ({
      ...f,
      vehicle_id: vehicleId,
      fuel_type: vehicleId && vFuel ? vFuel : f.fuel_type,
      unit_id: f.unit_id || selectedVeh?.unit_id || "",
    }));
  };

  const handleEditVehicleChange = (vehicleId: string) => {
    const selectedVeh = vehicles.find((v) => v.id === vehicleId);
    const vFuel =
      selectedVeh?.product_name ||
      selectedVeh?.fuel_type ||
      selectedVeh?.fuelType ||
      "";
    setEditForm((f) => ({
      ...f,
      vehicle_id: vehicleId,
      fuel_type: vehicleId && vFuel ? vFuel : f.fuel_type,
      unit_id: f.unit_id || selectedVeh?.unit_id || "",
    }));
  };

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
    if (!createForm.card_number || !createForm.holder_name) {
      toastError(
        "Data Belum Lengkap",
        "Nomor kartu dan nama pemegang wajib diisi.",
      );
      return;
    }

    try {
      setSubmitting(true);
      const selectedVeh = vehicles.find((v) => v.id === createForm.vehicle_id);
      const fuelToUse = selectedVeh
        ? selectedVeh.product_name ||
          selectedVeh.fuel_type ||
          selectedVeh.fuelType ||
          createForm.fuel_type
        : createForm.fuel_type;

      await api.cards.create({
        card_number: createForm.card_number,
        card_type: createForm.card_type as "REGULER" | "KHUSUS",
        holder_name: createForm.holder_name,
        unit_id: createForm.unit_id || undefined,
        vehicle_id: createForm.vehicle_id || undefined,
        fuel_type: fuelToUse,
        monthly_limit: Number(createForm.monthly_limit),
        expiry_date: createForm.expiry_date,
        activation_date: createForm.activation_date,
        rfid_uid: createForm.rfid_uid || undefined,
        notes: createForm.notes || undefined,
      });
      success(
        "Kartu Didaftarkan",
        `Kartu ${createForm.card_number} berhasil didaftarkan ke sistem.`,
      );
      setShowAddModal(false);
      setCreateForm({
        ...initialCreateForm,
        fuel_type: products[0]?.name || "Pertamax",
        activation_date: new Date().toISOString().split("T")[0],
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
      const selectedVeh = vehicles.find((v) => v.id === editForm.vehicle_id);
      const fuelToUse = selectedVeh
        ? selectedVeh.product_name ||
          selectedVeh.fuel_type ||
          selectedVeh.fuelType ||
          editForm.fuel_type
        : editForm.fuel_type;

      await api.cards.update(editTarget.id || editTarget.card_number, {
        holder_name: editForm.holder_name,
        unit_id: editForm.unit_id || undefined,
        vehicle_id: editForm.vehicle_id || undefined,
        fuel_type: fuelToUse,
        monthly_limit: Number(editForm.monthly_limit),
        rfid_uid: editForm.rfid_uid || undefined,
        notes: editForm.notes,
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
          holder_name: editForm.holder_name,
          holder: editForm.holder_name,
          unit_id: editForm.unit_id,
          vehicle_id: editForm.vehicle_id,
          police_number:
            selectedVeh?.police_number || selectedVeh?.policeNumber || "",
          vehicle:
            selectedVeh?.police_number || selectedVeh?.policeNumber || "",
          product_name: fuelToUse,
          fuel_type: fuelToUse,
          fuelType: fuelToUse,
          monthly_limit: Number(editForm.monthly_limit),
          monthlyLimit: Number(editForm.monthly_limit),
          rfid_uid: editForm.rfid_uid,
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
          onClick={openAddModal}
        >
          <Plus size={13} />
          Tambah Kartu
        </Button>
      </PageHeader>

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
                <th>Produk BBM</th>
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
                  const fuel =
                    c.product_name || c.fuel_type || c.fuelType || "Pertamax";
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
                      <td className="text-zinc-500 text-[12px]">
                        {veh !== "—" ? (
                          <span className="font-mono font-medium text-zinc-700">
                            {veh}
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td>
                        <Badge variant="neutral">
                          <Fuel size={11} className="inline mr-1 opacity-70" />
                          {fuel}
                        </Badge>
                      </td>
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
                            onClick={() => openEditModal(c)}
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
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-zinc-400 hover:text-red-600 hover:bg-red-50",
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
      </Card>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-[480px] bg-white h-full shadow-2xl z-10 overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                  Detail Kartu BBM
                </p>
                <h2 className="text-[20px] font-semibold text-zinc-900 font-mono">
                  {selected.card_number || selected.number}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-500">Status Kartu</span>
                <Badge variant={statusVariant(selected.status)}>
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
                    selected.product_name ||
                      selected.fuel_type ||
                      selected.fuelType ||
                      "—",
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

              {/* Linked vehicle sync badge */}
              {(selected.vehicle_id ||
                selected.police_number ||
                selected.vehicle) && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[12px] text-emerald-800 flex items-center gap-2">
                  <Car size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold">Tersinkronisasi Kendaraan:</span>{" "}
                    Jenis BBM kartu ini otomatis diselaraskan dengan spesifikasi BBM armada dinas{" "}
                    <span className="font-mono font-bold">
                      {selected.police_number || selected.vehicle}
                    </span>
                    .
                  </div>
                </div>
              )}

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
                    onClick={() => selected && openEditModal(selected)}
                  >
                    <Edit size={13} /> Edit
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
                      <>
                        <CheckCircle2 size={13} /> Buka Blokir
                      </>
                    ) : (
                      <>
                        <Ban size={13} /> Blokir Kartu
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/topup")}
                >
                  <Plus size={13} /> Top Up Kuota Kartu Ini →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Pendaftaran Kartu BBM & RFID Baru"
      >
        <form onSubmit={handleCreateCard} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Nomor Kartu BBM *
              </label>
              <input
                placeholder="008231"
                required
                value={createForm.card_number}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, card_number: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-bold font-mono"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                UID RFID Tag (Opsional)
              </label>
              <div className="relative">
                <input
                  placeholder="mis. E28068940000"
                  value={createForm.rfid_uid}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, rfid_uid: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono pl-8"
                />
                <Radio
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Tipe Kartu
              </label>
              <select
                value={createForm.card_type}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, card_type: e.target.value }))
                }
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="REGULER">REGULER</option>
                <option value="KHUSUS">KHUSUS / OPERASIONAL</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Nama Pemegang / NRP *
              </label>
              <input
                placeholder="Bripka Joko Susilo"
                required
                value={createForm.holder_name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, holder_name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Satuan Kerja (Unit)
              </label>
              <select
                value={createForm.unit_id}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, unit_id: e.target.value }))
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
                value={createForm.vehicle_id}
                onChange={(e) => handleCreateVehicleChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">Tanpa kendaraan khusus…</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.police_number || v.policeNumber} ({v.brand} {v.model}) •{" "}
                    {v.product_name || v.fuel_type || v.fuelType || "Pertamax"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Produk / Jenis BBM
              </label>
              {createForm.vehicle_id ? (
                <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[13px] text-emerald-900 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Fuel size={13} className="text-emerald-700" />
                    {createForm.fuel_type}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                    <Lock size={10} /> Auto-Sync
                  </span>
                </div>
              ) : (
                <select
                  value={createForm.fuel_type}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, fuel_type: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
                >
                  {products.length > 0 ? (
                    products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Pertamax">Pertamax</option>
                      <option value="Pertalite">Pertalite</option>
                      <option value="Dexlite">Dexlite</option>
                      <option value="Pertamax Turbo">Pertamax Turbo</option>
                      <option value="Pertamina DEX">Pertamina DEX</option>
                    </>
                  )}
                </select>
              )}
              {createForm.vehicle_id && (
                <p className="text-[11px] text-emerald-700 mt-1">
                  🔒 Produk BBM otomatis disinkronkan dari armada kendaraan dinas.
                </p>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Limit Bulanan (L)
              </label>
              <input
                type="number"
                value={createForm.monthly_limit}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    monthly_limit: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
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
        onClose={() => {
          setShowEditModal(false);
          setEditTarget(null);
        }}
        title="Edit Kartu BBM"
      >
        <form onSubmit={handleUpdateCard} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Nama Pemegang *
              </label>
              <input
                required
                value={editForm.holder_name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, holder_name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                UID RFID Tag
              </label>
              <div className="relative">
                <input
                  placeholder="mis. E28068940000"
                  value={editForm.rfid_uid}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, rfid_uid: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono pl-8"
                />
                <Radio
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Satuan Kerja
              </label>
              <select
                value={editForm.unit_id}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, unit_id: e.target.value }))
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
                value={editForm.vehicle_id}
                onChange={(e) => handleEditVehicleChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">Tanpa kendaraan khusus…</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.police_number || v.policeNumber} ({v.brand} {v.model}) •{" "}
                    {v.product_name || v.fuel_type || v.fuelType || "Pertamax"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Produk / Jenis BBM
              </label>
              {editForm.vehicle_id ? (
                <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[13px] text-emerald-900 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Fuel size={13} className="text-emerald-700" />
                    {editForm.fuel_type}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                    <Lock size={10} /> Auto-Sync
                  </span>
                </div>
              ) : (
                <select
                  value={editForm.fuel_type}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, fuel_type: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
                >
                  {products.length > 0 ? (
                    products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Pertamax">Pertamax</option>
                      <option value="Pertalite">Pertalite</option>
                      <option value="Dexlite">Dexlite</option>
                      <option value="Pertamax Turbo">Pertamax Turbo</option>
                      <option value="Pertamina DEX">Pertamina DEX</option>
                    </>
                  )}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Limit Bulanan (L)
              </label>
              <input
                type="number"
                value={editForm.monthly_limit}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    monthly_limit: e.target.value,
                  }))
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
              value={editForm.notes}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, notes: e.target.value }))
              }
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => {
                setShowEditModal(false);
                setEditTarget(null);
              }}
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

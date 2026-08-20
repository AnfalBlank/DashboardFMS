'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Tank, TankReading, Product } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { clsx } from 'clsx';
import {
  Thermometer,
  Droplets,
  AlertTriangle,
  Activity,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Database,
  Layers,
  Radio,
  Palette,
  Cpu,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const barColor = (s: string) =>
  s === 'CRITICAL'
    ? 'bg-red-500'
    : s === 'LOW'
      ? 'bg-amber-400'
      : s === 'HIGH'
        ? 'bg-blue-500'
        : 'bg-emerald-500';

const colorDotClass = (color?: string) => {
  switch (color) {
    case 'green':
      return 'bg-emerald-500 border-emerald-600';
    case 'red':
      return 'bg-rose-500 border-rose-600';
    case 'yellow':
      return 'bg-amber-400 border-amber-500';
    case 'blue':
    default:
      return 'bg-blue-500 border-blue-600';
  }
};

export default function TanksPage() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTank, setSelectedTank] = useState<string | null>(null);
  const [readings, setReadings] = useState<TankReading[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Reading Modal
  const [readingModal, setReadingModal] = useState(false);
  const [readingTankId, setReadingTankId] = useState('');
  const [readingForm, setReadingForm] = useState({
    volume_l: '',
    height_cm: '',
    water_level: '0',
    temperature: '28.5',
  });

  // Threshold / Calibration Modal
  const [thresholdModal, setThresholdModal] = useState(false);
  const [thresholdTank, setThresholdTank] = useState<Tank | null>(null);
  const [thresholdForm, setThresholdForm] = useState({
    current_l: '',
    threshold_low: '30',
    threshold_critical: '15',
    threshold_high: '90',
    reason: '',
  });

  // Create Tank Modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    id: '',
    product_id: '',
    capacity_l: '20000',
    current_l: '10000',
    oil_color: 'blue' as 'blue' | 'green' | 'red' | 'yellow',
    water_color: 'blue' as 'blue' | 'yellow',
    active: 1,
    id_port: '1',
    id_polling: '1',
    id_tank_enabler: '1',
    threshold_low: '30',
    threshold_critical: '15',
    threshold_high: '90',
    status: 'NORMAL' as Tank['status'],
  });

  // Edit Tank Modal
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Tank | null>(null);
  const [editForm, setEditForm] = useState({
    product_id: '',
    capacity_l: '',
    current_l: '',
    oil_color: 'blue' as 'blue' | 'green' | 'red' | 'yellow',
    water_color: 'blue' as 'blue' | 'yellow',
    active: 1,
    id_port: '',
    id_polling: '',
    id_tank_enabler: '',
    status: 'NORMAL' as Tank['status'],
    threshold_low: '30',
    threshold_critical: '15',
    threshold_high: '90',
    reason: '',
  });

  // Delete Tank Modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tank | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const fetchTanks = useCallback(async () => {
    try {
      setLoading(true);
      const [tankRes, prodRes] = await Promise.allSettled([
        api.tanks.list(),
        api.master.products(),
      ]);

      if (tankRes.status === 'fulfilled' && tankRes.value?.data) {
        setTanks(tankRes.value.data);
        if (!selectedTank && tankRes.value.data.length > 0) {
          setSelectedTank(tankRes.value.data[0].id);
        }
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
        setProducts(prodRes.value.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [selectedTank]);

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  // Fetch readings when a tank is selected
  useEffect(() => {
    if (!selectedTank) return;
    api.tanks
      .readings(selectedTank, 20)
      .then((res) => {
        if (res?.data) setReadings(res.data);
        else setReadings([]);
      })
      .catch(() => setReadings([]));
  }, [selectedTank]);

  const totalCapacity = tanks.reduce((s, t) => s + (t.capacity_l ?? t.capacity ?? 0), 0);
  const totalCurrent = tanks.reduce((s, t) => s + (t.current_l ?? t.current ?? 0), 0);
  const criticalCount = tanks.filter((t) => t.status === 'CRITICAL').length;
  const lowCount = tanks.filter((t) => t.status === 'LOW').length;

  const handleOpenCreate = () => {
    setCreateForm({
      id: '',
      product_id: products[0]?.id || '',
      capacity_l: '20000',
      current_l: '10000',
      oil_color: 'blue',
      water_color: 'blue',
      active: 1,
      id_port: '1',
      id_polling: '1',
      id_tank_enabler: (tanks.length + 1).toString(),
      threshold_low: '30',
      threshold_critical: '15',
      threshold_high: '90',
      status: 'NORMAL',
    });
    setCreateModal(true);
  };

  const handleCreateTank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.product_id || !createForm.capacity_l) {
      toastError('Data Belum Lengkap', 'Pilih produk BBM dan kapasitas tangki.');
      return;
    }

    try {
      setSubmitting(true);
      await api.tanks.create({
        id: createForm.id.trim() || undefined,
        product_id: createForm.product_id,
        capacity_l: Number(createForm.capacity_l),
        current_l: Number(createForm.current_l || 0),
        oil_color: createForm.oil_color,
        water_color: createForm.water_color,
        active: Number(createForm.active),
        id_port: createForm.id_port !== '' ? Number(createForm.id_port) : undefined,
        id_polling: createForm.id_polling !== '' ? Number(createForm.id_polling) : undefined,
        id_tank_enabler: createForm.id_tank_enabler !== '' ? Number(createForm.id_tank_enabler) : undefined,
        threshold_low: Number(createForm.threshold_low || 30),
        threshold_critical: Number(createForm.threshold_critical || 15),
        threshold_high: Number(createForm.threshold_high || 90),
        status: createForm.status,
      });

      success('Tangki Ditambahkan', 'Data tangki pendam baru berhasil didaftarkan.');
      setCreateModal(false);
      fetchTanks();
    } catch (err: unknown) {
      toastError('Gagal Menambah Tangki', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (t: Tank) => {
    setEditTarget(t);
    setEditForm({
      product_id: t.product_id || '',
      capacity_l: (t.capacity_l ?? t.capacity ?? 0).toString(),
      current_l: (t.current_l ?? t.current ?? 0).toString(),
      oil_color: (t.oil_color as 'blue' | 'green' | 'red' | 'yellow') || 'blue',
      water_color: (t.water_color as 'blue' | 'yellow') || 'blue',
      active: t.active !== undefined ? t.active : 1,
      id_port: t.id_port !== undefined && t.id_port !== null ? t.id_port.toString() : '',
      id_polling: t.id_polling !== undefined && t.id_polling !== null ? t.id_polling.toString() : '',
      id_tank_enabler: t.id_tank_enabler !== undefined && t.id_tank_enabler !== null ? t.id_tank_enabler.toString() : '',
      status: t.status,
      threshold_low: (t.threshold_low ?? 30).toString(),
      threshold_critical: (t.threshold_critical ?? 15).toString(),
      threshold_high: (t.threshold_high ?? 90).toString(),
      reason: '',
    });
    setEditModal(true);
  };

  const handleUpdateTank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      setSubmitting(true);
      await api.tanks.update(editTarget.id, {
        product_id: editForm.product_id,
        capacity_l: Number(editForm.capacity_l),
        current_l: Number(editForm.current_l),
        oil_color: editForm.oil_color,
        water_color: editForm.water_color,
        active: Number(editForm.active),
        id_port: editForm.id_port !== '' ? Number(editForm.id_port) : undefined,
        id_polling: editForm.id_polling !== '' ? Number(editForm.id_polling) : undefined,
        id_tank_enabler: editForm.id_tank_enabler !== '' ? Number(editForm.id_tank_enabler) : undefined,
        status: editForm.status,
        threshold_low: Number(editForm.threshold_low),
        threshold_critical: Number(editForm.threshold_critical),
        threshold_high: Number(editForm.threshold_high),
        reason: editForm.reason || 'Perbaruan data & spesifikasi tangki pendam',
      });

      success('Tangki Diperbarui', `Informasi tangki ${editTarget.id} berhasil disimpan.`);
      setEditModal(false);
      setEditTarget(null);
      fetchTanks();
    } catch (err: unknown) {
      toastError('Gagal Memperbarui Tangki', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (t: Tank) => {
    setDeleteTarget(t);
    setDeleteModal(true);
  };

  const handleDeleteTank = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      await api.tanks.delete(deleteTarget.id);
      success('Tangki Dihapus', `Tangki ${deleteTarget.id} berhasil dihapus dari sistem.`);
      setDeleteModal(false);
      if (selectedTank === deleteTarget.id) setSelectedTank(null);
      setDeleteTarget(null);
      fetchTanks();
    } catch (err: unknown) {
      toastError('Gagal Menghapus Tangki', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePushReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readingTankId || !readingForm.volume_l) {
      toastError('Data Belum Lengkap', 'Pilih tangki dan masukkan volume hasil pengukuran.');
      return;
    }

    try {
      setSubmitting(true);
      await api.tanks.pushReading(readingTankId, {
        volume_l: Number(readingForm.volume_l),
        height_cm: readingForm.height_cm ? Number(readingForm.height_cm) : undefined,
        water_level: Number(readingForm.water_level || 0),
        temperature: Number(readingForm.temperature || 28),
        source: 'MANUAL',
        read_at: new Date().toISOString(),
      });
      success('Pengukuran Disimpan', 'Data pembacaan manual ATG berhasil dicatat.');
      setReadingModal(false);
      setReadingForm({ volume_l: '', height_cm: '', water_level: '0', temperature: '28.5' });
      fetchTanks();
    } catch (err: unknown) {
      toastError('Gagal Menyimpan Bacaan', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thresholdTank) return;

    try {
      setSubmitting(true);
      await api.tanks.update(thresholdTank.id, {
        current_l: thresholdForm.current_l ? Number(thresholdForm.current_l) : undefined,
        threshold_low: Number(thresholdForm.threshold_low),
        threshold_critical: Number(thresholdForm.threshold_critical),
        threshold_high: Number(thresholdForm.threshold_high),
        reason: thresholdForm.reason || 'Kalibrasi konfigurasi ambang batas alarm fisik',
      });
      success('Konfigurasi Disimpan', `Threshold & stok tangki ${thresholdTank.id} berhasil diperbarui.`);
      setThresholdModal(false);
      setThresholdTank(null);
      fetchTanks();
    } catch (err: unknown) {
      toastError('Gagal Memperbarui Tangki', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tank & Storage Management"
        subtitle="Kelola master tangki pendam SPBP, pantau level realtime sensor ATG, dan kalibrasi threshold"
      >
        <Button variant="outline" size="sm" onClick={() => fetchTanks()}>
          Refresh Data
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setReadingTankId(selectedTank || (tanks[0]?.id ?? ''));
            setReadingModal(true);
          }}
        >
          <Database size={13} /> Ukur Manual ATG
        </Button>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus size={13} /> Tambah Tangki
        </Button>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard
          eyebrow="Total Kapasitas"
          value={(totalCapacity / 1000).toFixed(0)}
          unit="KL"
          accent="black"
        />
        <KpiCard
          eyebrow="Total Stok Saat Ini"
          value={(totalCurrent / 1000).toFixed(1)}
          unit="KL"
          delta={`${totalCapacity > 0 ? Math.round((totalCurrent / totalCapacity) * 100) : 0}% terisi`}
          deltaDir="neutral"
          accent="green"
        />
        <KpiCard
          eyebrow="Tangki Kritis"
          value={criticalCount.toString()}
          delta={criticalCount > 0 ? 'Perlu supply Pertamina segera' : 'Level aman'}
          deltaDir={criticalCount > 0 ? 'down' : 'neutral'}
          accent={criticalCount > 0 ? 'red' : 'green'}
        />
        <KpiCard
          eyebrow="Tangki Low / Warning"
          value={lowCount.toString()}
          meta={`dari ${tanks.length} tangki pendam`}
          accent={lowCount > 0 ? 'amber' : 'green'}
        />
      </div>

      {/* Tank cards */}
      <div className="grid grid-cols-1 gap-4 mb-5">
        {loading && tanks.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">Memuat data tangki pendam…</div>
        ) : tanks.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-zinc-400">
              <Layers size={32} className="mx-auto mb-2 opacity-40" />
              <p className="font-medium text-zinc-700">Belum ada tangki pendam terdaftar</p>
              <p className="text-xs text-zinc-400 mt-1">
                Klik tombol &ldquo;Tambah Tangki&rdquo; untuk mendaftarkan tangki penyimpanan BBM.
              </p>
            </div>
          </Card>
        ) : (
          tanks.map((t) => {
            const cap = t.capacity_l ?? t.capacity ?? 1;
            const cur = t.current_l ?? t.current ?? 0;
            const pct = Math.min(100, Math.round((cur / cap) * 100));
            const isSelected = selectedTank === t.id;
            const prodName = t.product_name ?? t.product ?? t.code ?? t.id;
            const isActive = t.active === 1 || t.active === undefined;

            return (
              <Card
                key={t.id}
                className={clsx('transition-all cursor-pointer', isSelected && 'ring-2 ring-blue-500/40')}
                onClick={() => setSelectedTank(t.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
                      <h3 className="text-[15px] font-semibold text-zinc-900">
                        {t.id} — {prodName}
                      </h3>
                      <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                      <Badge variant={isActive ? 'success' : 'neutral'}>
                        {isActive ? 'AKTIF' : 'NONAKTIF'}
                      </Badge>
                      {/* Oil color indicator */}
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                        <span className={clsx('w-2 h-2 rounded-full border', colorDotClass(t.oil_color))} />
                        Oil: {t.oil_color || 'blue'}
                      </span>
                      {/* Water color indicator */}
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                        <span className={clsx('w-2 h-2 rounded-full border', colorDotClass(t.water_color))} />
                        Water: {t.water_color || 'blue'}
                      </span>
                      {/* Port & Polling info */}
                      {(t.id_port !== undefined && t.id_port !== null) || (t.id_polling !== undefined && t.id_polling !== null) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono text-zinc-600 bg-zinc-100 border border-zinc-200">
                          <Radio size={11} className="text-zinc-500" />
                          P:{t.id_port ?? '-'} | Poll:{t.id_polling ?? '-'}
                        </span>
                      ) : null}
                      {/* Enabler Tank ID */}
                      {t.id_tank_enabler !== undefined && t.id_tank_enabler !== null ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
                          <Cpu size={11} className="text-emerald-600" />
                          Enabler Tank: {t.id_tank_enabler}
                        </span>
                      ) : null}
                      {isSelected && <Badge variant="neutral">Dipilih</Badge>}
                    </div>
                    <p className="text-[12px] text-zinc-400">
                      Update terakhir:{' '}
                      {t.last_reading_at
                        ? new Date(t.last_reading_at).toLocaleTimeString('id-ID')
                        : 'Realtime sensor'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[30px] font-light text-zinc-900 leading-none">
                      {cur.toLocaleString('id-ID')} L
                    </p>
                    <p className="text-[12px] text-zinc-400 mt-1">
                      dari {cap.toLocaleString('id-ID')} L kapasitas maksimal
                    </p>
                  </div>
                </div>

                {/* Level bar */}
                <div className="relative w-full bg-zinc-100 rounded-full h-3 mb-4 overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-700', barColor(t.status))}
                    style={{ width: `${pct}%` }}
                  />
                  {/* threshold markers */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-amber-400/80"
                    style={{ left: `${t.threshold_low ?? 30}%` }}
                    title="LOW threshold"
                  />
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-400/80"
                    style={{ left: `${t.threshold_critical ?? 15}%` }}
                    title="CRITICAL threshold"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-4 px-0.5">
                  <span>0 L</span>
                  <span className="text-red-500 font-medium">
                    ▲ CRITICAL {t.threshold_critical ?? 15}%
                  </span>
                  <span className="text-amber-500 font-medium">
                    ▲ LOW {t.threshold_low ?? 30}%
                  </span>
                  <span className="text-green-600 font-semibold">{pct}% terisi</span>
                  <span>{cap.toLocaleString('id-ID')} L</span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: 'Level', value: `${pct}%`, icon: <Activity size={13} /> },
                    { label: 'Volume Stok', value: `${cur.toLocaleString('id-ID')} L`, icon: <Droplets size={13} /> },
                    { label: 'Kapasitas', value: `${cap.toLocaleString('id-ID')} L`, icon: <Droplets size={13} /> },
                    { label: 'Temperatur', value: `${t.temperature ?? t.temp ?? 28.5}°C`, icon: <Thermometer size={13} /> },
                    { label: 'Water Level', value: `${t.water_level ?? t.waterLevel ?? 0} cm`, icon: <AlertTriangle size={13} /> },
                  ].map((s) => (
                    <div key={s.label} className="bg-zinc-50 rounded-xl py-3 px-3 text-center">
                      <div className="flex justify-center text-zinc-400 mb-1">{s.icon}</div>
                      <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">{s.label}</p>
                      <p className="text-[14px] font-semibold text-zinc-900">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions & thresholds */}
                <div className="mt-4 flex items-center justify-between text-[12px] text-zinc-400 pt-2 border-t border-zinc-100">
                  <span className="flex gap-4">
                    <span>🔴 CRITICAL &lt;{t.threshold_critical ?? 15}%</span>
                    <span>🟡 LOW &lt;{t.threshold_low ?? 30}%</span>
                    <span>🔵 HIGH &gt;{t.threshold_high ?? 90}%</span>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(t);
                      }}
                    >
                      <Edit2 size={12} /> Edit Tangki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setThresholdTank(t);
                        setThresholdForm({
                          current_l: cur.toString(),
                          threshold_low: (t.threshold_low ?? 30).toString(),
                          threshold_critical: (t.threshold_critical ?? 15).toString(),
                          threshold_high: (t.threshold_high ?? 90).toString(),
                          reason: '',
                        });
                        setThresholdModal(true);
                      }}
                    >
                      <Sliders size={12} /> Set Threshold
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDelete(t);
                      }}
                    >
                      <Trash2 size={12} /> Hapus
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Reading history table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold">
              Riwayat Pembacaan ATG — {selectedTank || 'Pilih Tangki'}
            </h3>
            <p className="text-[11.5px] text-zinc-400">
              Log pembacaan berkala dari sensor ATG / manual dipping
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => success('Export', 'Riwayat pembacaan ATG siap diunduh.')}>
            Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead>
              <tr>
                <th>Waktu Pembacaan</th>
                <th>Tangki</th>
                <th>Volume (L)</th>
                <th>Tinggi (cm)</th>
                <th>Level Air (cm)</th>
                <th>Suhu (°C)</th>
                <th>Sumber</th>
              </tr>
            </thead>
            <tbody>
              {readings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[13px] text-zinc-400">
                    Belum ada riwayat pembacaan untuk tangki ini
                  </td>
                </tr>
              ) : (
                readings.map((r, i) => (
                  <tr key={r.id || i}>
                    <td className="font-mono text-[12px] text-zinc-500">
                      {r.read_at ? new Date(r.read_at).toLocaleString('id-ID') : '—'}
                    </td>
                    <td className="font-semibold">{r.tank_id || selectedTank}</td>
                    <td className="font-semibold text-zinc-900">
                      {r.volume_l?.toLocaleString('id-ID')} L
                    </td>
                    <td className="text-zinc-600">{r.height_cm ?? '—'} cm</td>
                    <td className="text-zinc-600">{r.water_level ?? 0} cm</td>
                    <td className="text-zinc-600">{r.temperature ?? 28.5}°C</td>
                    <td>
                      <Badge variant={r.source === 'SENSOR' ? 'success' : 'neutral'}>
                        {r.source || 'SENSOR'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah Tangki Baru */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Tambah Tangki Pendam Baru"
      >
        <form onSubmit={handleCreateTank} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                ID / Kode Tangki
              </label>
              <input
                placeholder="mis. TANK-04 (opsional)"
                value={createForm.id}
                onChange={(e) => setCreateForm((f) => ({ ...f, id: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-mono uppercase"
              />
              <span className="text-[10.5px] text-zinc-400">Kosongkan untuk penomoran otomatis</span>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Kapasitas Maksimal (Liter) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="20000"
                value={createForm.capacity_l}
                onChange={(e) => setCreateForm((f) => ({ ...f, capacity_l: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Stok Fisik Awal (Liter)
              </label>
              <input
                type="number"
                min="0"
                placeholder="10000"
                value={createForm.current_l}
                onChange={(e) => setCreateForm((f) => ({ ...f, current_l: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          {/* Section: Warna & Status Aktif */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-zinc-800 font-semibold text-[12px]">
              <Palette size={14} className="text-zinc-600" />
              <span>Atribut Warna & Status Operasional</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Warna Minyak (oil_color) *
                </label>
                <select
                  value={createForm.oil_color}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      oil_color: e.target.value as 'blue' | 'green' | 'red' | 'yellow',
                    }))
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10 font-medium"
                >
                  <option value="blue">🔵 Blue</option>
                  <option value="green">🟢 Green</option>
                  <option value="red">🔴 Red</option>
                  <option value="yellow">🟡 Yellow</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Warna Air (water_color) *
                </label>
                <select
                  value={createForm.water_color}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      water_color: e.target.value as 'blue' | 'yellow',
                    }))
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10 font-medium"
                >
                  <option value="blue">🔵 Blue</option>
                  <option value="yellow">🟡 Yellow</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Status Aktif (active) *
                </label>
                <select
                  value={createForm.active}
                  onChange={(e) => setCreateForm((f) => ({ ...f, active: Number(e.target.value) }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10 font-medium"
                >
                  <option value={1}>1 (Aktif)</option>
                  <option value={0}>0 (Nonaktif)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1 border-t border-zinc-200/60">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  ID Port ATG (id_port)
                </label>
                <input
                  type="number"
                  placeholder="mis. 1"
                  value={createForm.id_port}
                  onChange={(e) => setCreateForm((f) => ({ ...f, id_port: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  ID Polling ATG (id_polling)
                </label>
                <input
                  type="number"
                  placeholder="mis. 1"
                  value={createForm.id_polling}
                  onChange={(e) => setCreateForm((f) => ({ ...f, id_polling: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  ID Tank Enabler
                </label>
                <input
                  type="number"
                  placeholder="mis. 1"
                  value={createForm.id_tank_enabler}
                  onChange={(e) => setCreateForm((f) => ({ ...f, id_tank_enabler: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
            <p className="text-[12px] font-semibold text-zinc-800">Ambang Batas Alarm Status (%)</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-red-600 font-medium mb-0.5">Critical (%)</label>
                <input
                  type="number"
                  value={createForm.threshold_critical}
                  onChange={(e) => setCreateForm((f) => ({ ...f, threshold_critical: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-[11px] text-amber-600 font-medium mb-0.5">Low (%)</label>
                <input
                  type="number"
                  value={createForm.threshold_low}
                  onChange={(e) => setCreateForm((f) => ({ ...f, threshold_low: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-[11px] text-blue-600 font-medium mb-0.5">High (%)</label>
                <input
                  type="number"
                  value={createForm.threshold_high}
                  onChange={(e) => setCreateForm((f) => ({ ...f, threshold_high: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            <Button variant="outline" type="button" className="flex-1" onClick={() => setCreateModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan Tangki'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Tangki */}
      <Modal
        open={editModal}
        onClose={() => {
          setEditModal(false);
          setEditTarget(null);
        }}
        title={`Edit Tangki: ${editTarget?.id ?? ''}`}
      >
        <form onSubmit={handleUpdateTank} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                ID / Kode Tangki
              </label>
              <input
                disabled
                value={editTarget?.id ?? ''}
                className="w-full px-3 py-2 border border-zinc-200 bg-zinc-100 rounded-lg text-[13px] font-mono text-zinc-500 cursor-not-allowed"
              />
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Kapasitas (L) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={editForm.capacity_l}
                onChange={(e) => setEditForm((f) => ({ ...f, capacity_l: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Stok Fisik (L)
              </label>
              <input
                type="number"
                min="0"
                value={editForm.current_l}
                onChange={(e) => setEditForm((f) => ({ ...f, current_l: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                Status Operasional
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as Tank['status'] }))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="LOW">LOW</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="SENSOR_ERROR">SENSOR_ERROR</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>
          </div>

          {/* Section: Warna & Port/Polling Edit */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-zinc-800 font-semibold text-[12px]">
              <Palette size={14} className="text-zinc-600" />
              <span>Atribut Warna & Parameter Port ATG</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Warna Minyak (oil_color) *
                </label>
                <select
                  value={editForm.oil_color}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      oil_color: e.target.value as 'blue' | 'green' | 'red' | 'yellow',
                    }))
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10 font-medium"
                >
                  <option value="blue">🔵 Blue</option>
                  <option value="green">🟢 Green</option>
                  <option value="red">🔴 Red</option>
                  <option value="yellow">🟡 Yellow</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Warna Air (water_color) *
                </label>
                <select
                  value={editForm.water_color}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      water_color: e.target.value as 'blue' | 'yellow',
                    }))
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10 font-medium"
                >
                  <option value="blue">🔵 Blue</option>
                  <option value="yellow">🟡 Yellow</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Status Aktif (active) *
                </label>
                <select
                  value={editForm.active}
                  onChange={(e) => setEditForm((f) => ({ ...f, active: Number(e.target.value) }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10 font-medium"
                >
                  <option value={1}>1 (Aktif)</option>
                  <option value={0}>0 (Nonaktif)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1 border-t border-zinc-200/60">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  ID Port ATG (id_port)
                </label>
                <input
                  type="number"
                  placeholder="mis. 1"
                  value={editForm.id_port}
                  onChange={(e) => setEditForm((f) => ({ ...f, id_port: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  ID Polling ATG (id_polling)
                </label>
                <input
                  type="number"
                  placeholder="mis. 1"
                  value={editForm.id_polling}
                  onChange={(e) => setEditForm((f) => ({ ...f, id_polling: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  ID Tank Enabler
                </label>
                <input
                  type="number"
                  placeholder="mis. 1"
                  value={editForm.id_tank_enabler}
                  onChange={(e) => setEditForm((f) => ({ ...f, id_tank_enabler: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
            <div>
              <label className="block text-[11px] text-red-600 font-medium mb-0.5">Critical (%)</label>
              <input
                type="number"
                value={editForm.threshold_critical}
                onChange={(e) => setEditForm((f) => ({ ...f, threshold_critical: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[11px] text-amber-600 font-medium mb-0.5">Low (%)</label>
              <input
                type="number"
                value={editForm.threshold_low}
                onChange={(e) => setEditForm((f) => ({ ...f, threshold_low: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[11px] text-blue-600 font-medium mb-0.5">High (%)</label>
              <input
                type="number"
                value={editForm.threshold_high}
                onChange={(e) => setEditForm((f) => ({ ...f, threshold_high: e.target.value }))}
                className="w-full px-2.5 py-1.5 border border-zinc-200 bg-white rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Alasan Perubahan Data
            </label>
            <input
              placeholder="mis. Kalibrasi fisik atau perubahan komoditas tangki"
              value={editForm.reason}
              onChange={(e) => setEditForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            />
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

      {/* Modal Hapus Tangki */}
      <Modal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setDeleteTarget(null);
        }}
        title="Hapus Tangki Pendam"
      >
        <div className="space-y-3">
          <p className="text-[13px] text-zinc-600">
            Apakah Anda yakin ingin menghapus tangki pendam{' '}
            <strong className="text-zinc-900 font-semibold">{deleteTarget?.id}</strong> ({deleteTarget?.product_name})?
          </p>
          <p className="text-[12px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            Peringatan: Seluruh riwayat pembacaan sensor ATG pada tangki ini juga akan dihapus.
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
              onClick={handleDeleteTank}
            >
              {submitting ? 'Menghapus…' : 'Hapus Tangki'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Push Reading Modal */}
      <Modal open={readingModal} onClose={() => setReadingModal(false)} title="Input Pengukuran Tangki Manual">
        <form onSubmit={handlePushReading} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">Pilih Tangki *</label>
            <select
              value={readingTankId}
              onChange={(e) => setReadingTankId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            >
              {tanks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} — {t.product_name ?? t.product ?? t.code} ({t.current_l ?? t.current} L)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">Volume Terukur (L) *</label>
              <input
                type="number"
                step="1"
                required
                placeholder="12500"
                value={readingForm.volume_l}
                onChange={(e) => setReadingForm((f) => ({ ...f, volume_l: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">Tinggi Cairan (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="280.5"
                value={readingForm.height_cm}
                onChange={(e) => setReadingForm((f) => ({ ...f, height_cm: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">Level Air Dasar (cm)</label>
              <input
                type="number"
                step="0.1"
                value={readingForm.water_level}
                onChange={(e) => setReadingForm((f) => ({ ...f, water_level: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">Suhu Tangki (°C)</label>
              <input
                type="number"
                step="0.1"
                value={readingForm.temperature}
                onChange={(e) => setReadingForm((f) => ({ ...f, temperature: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            <Button variant="outline" type="button" className="flex-1" onClick={() => setReadingModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan Pembacaan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Threshold / Calibration Modal */}
      <Modal
        open={thresholdModal}
        onClose={() => setThresholdModal(false)}
        title="Konfigurasi Ambang Batas & Kalibrasi Tangki"
      >
        <form onSubmit={handleUpdateThreshold} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">
              Stok Fisik Saat Ini (Liter)
            </label>
            <input
              type="number"
              value={thresholdForm.current_l}
              onChange={(e) => setThresholdForm((f) => ({ ...f, current_l: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">Critical (%)</label>
              <input
                type="number"
                value={thresholdForm.threshold_critical}
                onChange={(e) => setThresholdForm((f) => ({ ...f, threshold_critical: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">Low (%)</label>
              <input
                type="number"
                value={thresholdForm.threshold_low}
                onChange={(e) => setThresholdForm((f) => ({ ...f, threshold_low: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">High (%)</label>
              <input
                type="number"
                value={thresholdForm.threshold_high}
                onChange={(e) => setThresholdForm((f) => ({ ...f, threshold_high: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">Alasan Penyesuaian</label>
            <input
              placeholder="mis. Kalibrasi fisik tangki pendam bulanan"
              value={thresholdForm.reason}
              onChange={(e) => setThresholdForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            <Button variant="outline" type="button" className="flex-1" onClick={() => setThresholdModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan Konfigurasi'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

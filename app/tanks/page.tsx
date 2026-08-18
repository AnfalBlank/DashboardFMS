'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Tank, TankReading } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { clsx } from 'clsx';
import { Thermometer, Droplets, AlertTriangle, Activity, Sliders, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const barColor = (s: string) =>
  s === 'CRITICAL' ? 'bg-red-500' :
  s === 'LOW'      ? 'bg-amber-400' :
  s === 'HIGH'     ? 'bg-blue-500'  : 'bg-emerald-500';

export default function TanksPage() {
  const [tanks, setTanks] = useState<Tank[]>([]);
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

  const [submitting, setSubmitting] = useState(false);
  const { success, warning, error: toastError } = useToast();

  const fetchTanks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.tanks.list();
      if (res?.data) {
        setTanks(res.data);
        if (!selectedTank && res.data.length > 0) {
          setSelectedTank(res.data[0].id);
        }
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
    api.tanks.readings(selectedTank, 20)
      .then(res => {
        if (res?.data) setReadings(res.data);
        else setReadings([]);
      })
      .catch(() => setReadings([]));
  }, [selectedTank]);

  const totalCapacity = tanks.reduce((s, t) => s + (t.capacity_l ?? t.capacity ?? 0), 0);
  const totalCurrent  = tanks.reduce((s, t) => s + (t.current_l ?? t.current ?? 0),  0);
  const criticalCount = tanks.filter(t => t.status === 'CRITICAL').length;
  const lowCount      = tanks.filter(t => t.status === 'LOW').length;

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
      <PageHeader title="Tank & Storage Monitoring" subtitle="Pantau level stok tangki pendam SPBP secara realtime dari sensor ATG">
        <Button variant="outline" size="sm" onClick={() => fetchTanks()}>
          Refresh Data
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setReadingTankId(selectedTank || (tanks[0]?.id ?? ''));
            setReadingModal(true);
          }}
        >
          <Plus size={13} /> Input Ukur Manual ATG
        </Button>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Total Kapasitas" value={(totalCapacity / 1000).toFixed(0)} unit="KL" accent="black" />
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
        ) : (
          tanks.map(t => {
            const cap = t.capacity_l ?? t.capacity ?? 1;
            const cur = t.current_l ?? t.current ?? 0;
            const pct = Math.min(100, Math.round((cur / cap) * 100));
            const isSelected = selectedTank === t.id;
            const prodName = t.product_name ?? t.product ?? t.code ?? t.id;

            return (
              <Card
                key={t.id}
                className={clsx('transition-all cursor-pointer', isSelected && 'ring-2 ring-blue-500/40')}
                onClick={() => setSelectedTank(t.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-[15px] font-semibold text-zinc-900">{t.id} — {prodName}</h3>
                      <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                      {isSelected && <Badge variant="neutral">Dipilih</Badge>}
                    </div>
                    <p className="text-[12px] text-zinc-400">
                      Update terakhir: {t.last_reading_at ? new Date(t.last_reading_at).toLocaleTimeString('id-ID') : 'Realtime sensor'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[30px] font-light text-zinc-900 leading-none">{cur.toLocaleString('id-ID')} L</p>
                    <p className="text-[12px] text-zinc-400 mt-1">dari {cap.toLocaleString('id-ID')} L kapasitas maksimal</p>
                  </div>
                </div>

                {/* Level bar */}
                <div className="relative w-full bg-zinc-100 rounded-full h-3 mb-4 overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-700', barColor(t.status))}
                    style={{ width: `${pct}%` }}
                  />
                  {/* threshold markers */}
                  <div className="absolute top-0 bottom-0 w-px bg-amber-400/80" style={{ left: `${t.threshold_low ?? 30}%` }} title="LOW threshold" />
                  <div className="absolute top-0 bottom-0 w-px bg-red-400/80" style={{ left: `${t.threshold_critical ?? 15}%` }} title="CRITICAL threshold" />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-4 px-0.5">
                  <span>0 L</span>
                  <span className="text-red-500 font-medium">▲ CRITICAL {t.threshold_critical ?? 15}%</span>
                  <span className="text-amber-500 font-medium">▲ LOW {t.threshold_low ?? 30}%</span>
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
                  ].map(s => (
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
                      <Sliders size={12} /> Set Threshold & Kalibrasi
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
            <h3 className="text-[13px] font-semibold">Riwayat Pembacaan ATG — {selectedTank || 'Pilih Tangki'}</h3>
            <p className="text-[11.5px] text-zinc-400">Log pembacaan berkala dari sensor ATG / manual dipping</p>
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
                    <td className="font-semibold text-zinc-900">{r.volume_l?.toLocaleString('id-ID')} L</td>
                    <td className="text-zinc-600">{r.height_cm ?? '—'} cm</td>
                    <td className="text-zinc-600">{r.water_level ?? 0} cm</td>
                    <td className="text-zinc-600">{r.temperature ?? 28.5}°C</td>
                    <td><Badge variant={r.source === 'SENSOR' ? 'success' : 'neutral'}>{r.source || 'SENSOR'}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Push Reading Modal */}
      <Modal open={readingModal} onClose={() => setReadingModal(false)} title="Input Pengukuran Tangki Manual">
        <form onSubmit={handlePushReading} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">Pilih Tangki *</label>
            <select
              value={readingTankId}
              onChange={e => setReadingTankId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            >
              {tanks.map(t => (
                <option key={t.id} value={t.id}>{t.id} — {t.product_name ?? t.product ?? t.code} ({t.current_l ?? t.current} L)</option>
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
                onChange={e => setReadingForm(f => ({ ...f, volume_l: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">Tinggi Cairan (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="280.5"
                value={readingForm.height_cm}
                onChange={e => setReadingForm(f => ({ ...f, height_cm: e.target.value }))}
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
                onChange={e => setReadingForm(f => ({ ...f, water_level: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">Suhu Tangki (°C)</label>
              <input
                type="number"
                step="0.1"
                value={readingForm.temperature}
                onChange={e => setReadingForm(f => ({ ...f, temperature: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
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
      <Modal open={thresholdModal} onClose={() => setThresholdModal(false)} title="Konfigurasi Ambang Batas & Kalibrasi Tangki">
        <form onSubmit={handleUpdateThreshold} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">Stok Fisik Saat Ini (Liter)</label>
            <input
              type="number"
              value={thresholdForm.current_l}
              onChange={e => setThresholdForm(f => ({ ...f, current_l: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10 font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">Critical (%)</label>
              <input
                type="number"
                value={thresholdForm.threshold_critical}
                onChange={e => setThresholdForm(f => ({ ...f, threshold_critical: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">Low (%)</label>
              <input
                type="number"
                value={thresholdForm.threshold_low}
                onChange={e => setThresholdForm(f => ({ ...f, threshold_low: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1">High (%)</label>
              <input
                type="number"
                value={thresholdForm.threshold_high}
                onChange={e => setThresholdForm(f => ({ ...f, threshold_high: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-600 mb-1">Alasan Penyesuaian</label>
            <input
              placeholder="mis. Kalibrasi fisik tangki pendam bulanan"
              value={thresholdForm.reason}
              onChange={e => setThresholdForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="flex gap-2 pt-2">
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

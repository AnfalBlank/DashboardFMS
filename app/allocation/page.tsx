'use client';
import { useState, useEffect } from 'react';
import { api, Unit, Product, Card as CardType } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertTriangle, Sparkles, Fuel, RefreshCw, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function AllocationPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const now = new Date();
  const currentMonth = now.toLocaleString('en-US', { month: 'long' });
  const currentYear = now.getFullYear();

  const [period, setPeriod] = useState(`${currentMonth} ${currentYear}`);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [productMode, setProductMode] = useState<'auto' | 'override'>('auto');
  const [productId, setProductId] = useState('');
  const [limitMode, setLimitMode] = useState<'card_limit' | 'custom'>('card_limit');
  const [defaultAlloc, setDefaultAlloc] = useState('200');
  const [scope, setScope] = useState('all');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { success, error: toastError } = useToast();
  const router = useRouter();

  useEffect(() => {
    Promise.allSettled([
      api.master.units(),
      api.master.products(),
      api.cards.list({ limit: 500 }),
    ]).then(([uRes, pRes, cRes]) => {
      if (uRes.status === 'fulfilled' && uRes.value?.data) {
        setUnits(uRes.value.data);
      }
      if (pRes.status === 'fulfilled' && pRes.value?.data) {
        setProducts(pRes.value.data);
        if (pRes.value.data.length > 0) {
          setProductId(pRes.value.data[0].id);
        }
      }
      if (cRes.status === 'fulfilled' && cRes.value?.data) {
        setCards(cRes.value.data);
      }
      setLoading(false);
    });
  }, []);

  const targetCards = cards.filter(c => {
    if (c.status === 'INACTIVE' || c.status === 'BLOCKED') return false;
    if (scope === 'unit' && selectedUnitId) {
      return c.unit_id === selectedUnitId;
    }
    return true;
  });

  const totalCardsCount = targetCards.length > 0
    ? targetCards.length
    : (scope === 'unit' && selectedUnitId
        ? (units.find(u => u.id === selectedUnitId)?.active_cards ?? 40)
        : units.reduce((s, u) => s + (u.active_cards ?? u.cards ?? 0), 0) || 486);

  const totalEstimatedLiters = limitMode === 'card_limit'
    ? (targetCards.length > 0
        ? targetCards.reduce((s, c) => s + (c.monthly_limit ?? c.monthlyLimit ?? 200), 0)
        : totalCardsCount * 200)
    : totalCardsCount * Number(defaultAlloc || 0);

  const handleGenerate = async () => {
    if (productMode === 'override' && !productId) {
      toastError('Data Belum Lengkap', 'Pilih produk BBM untuk mode override manual.');
      return;
    }
    if (limitMode === 'custom' && (!defaultAlloc || Number(defaultAlloc) <= 0)) {
      toastError('Data Belum Lengkap', 'Alokasi custom liter per kartu wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await api.quota.generate({
        period,
        year: Number(year),
        month: Number(month),
        scope,
        unit_id: scope === 'unit' ? selectedUnitId : undefined,
        product_id: productMode === 'override' && productId ? productId : undefined,
        default_l: limitMode === 'custom' && defaultAlloc ? Number(defaultAlloc) : undefined,
      });
      success(
        'Kuota Berhasil Digenerate',
        `Alokasi untuk periode ${period} berhasil dibuat dengan penyesuaian otomatis per armada kartu.`
      );
      router.push('/quota');
    } catch (err: unknown) {
      toastError('Gagal Generate Kuota', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Monthly Quota Allocation"
        subtitle="Generate alokasi kuota BBM bulanan secara massal dengan Auto-Detect BBM armada dinas"
      >
        <Button variant="outline" size="sm" onClick={() => router.push('/quota')}>
          Lihat Daftar Kuota
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-5">
        {/* Form */}
        <div className="col-span-1 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold">Konfigurasi Generate Kuota</h3>
              <Badge variant="success">
                <Sparkles size={11} className="inline mr-1 text-emerald-600" />
                Auto-Detect
              </Badge>
            </div>

            <div className="space-y-3.5">
              <Input
                label="Nama Periode *"
                value={period}
                onChange={setPeriod}
                placeholder="mis. September 2026"
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Bulan"
                  value={month.toString()}
                  onChange={v => {
                    setMonth(Number(v));
                    const mNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                    setPeriod(`${mNames[Number(v)-1]} ${year}`);
                  }}
                  options={[
                    { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
                    { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
                    { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
                    { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
                    { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
                    { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
                  ]}
                />
                <Input
                  label="Tahun"
                  type="number"
                  value={year.toString()}
                  onChange={v => {
                    setYear(Number(v));
                    const mNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                    setPeriod(`${mNames[month-1]} ${v}`);
                  }}
                />
              </div>

              <Select
                label="Scope Target Alokasi"
                value={scope}
                onChange={setScope}
                options={[
                  { value: 'all', label: 'Semua Kartu Aktif SPBP' },
                  { value: 'unit', label: 'Hanya Satker / Unit Tertentu' },
                ]}
              />

              {scope === 'unit' && (
                <Select
                  label="Pilih Satker Target *"
                  value={selectedUnitId}
                  onChange={setSelectedUnitId}
                  options={[
                    { value: '', label: 'Pilih satker dinas…' },
                    ...units.map(u => ({ value: u.id, label: `${u.name} (${u.code})` }))
                  ]}
                />
              )}

              {/* Product Mode Selection */}
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                  Penentuan Produk BBM
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setProductMode('auto')}
                    className={`px-3 py-2 rounded-lg text-[12px] font-medium border text-left transition ${
                      productMode === 'auto'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-semibold text-emerald-800">
                      <Sparkles size={12} /> Auto-Detect
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Sesuai armada & kartu</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductMode('override')}
                    className={`px-3 py-2 rounded-lg text-[12px] font-medium border text-left transition ${
                      productMode === 'override'
                        ? 'border-zinc-900 bg-zinc-900 text-white ring-2 ring-black/20'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <div className="font-semibold">Override Manual</div>
                    <p className={`text-[10px] mt-0.5 ${productMode === 'override' ? 'text-zinc-300' : 'text-zinc-500'}`}>1 Produk seragam</p>
                  </button>
                </div>

                {productMode === 'auto' ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-[11.5px] text-emerald-800 leading-relaxed">
                    💡 <strong>Smart Auto-Detect:</strong> Produk BBM akan otomatis ditentukan dari jenis BBM kendaraan dinas & master kartu masing-masing (Pertamax, Dexlite, Solar, dsb).
                  </div>
                ) : (
                  <Select
                    label="Pilih Produk BBM Seragam *"
                    value={productId}
                    onChange={setProductId}
                    options={products.map(p => ({ value: p.id, label: `${p.name} (${p.code})` }))}
                  />
                )}
              </div>

              {/* Quota Limit Mode */}
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 mb-1">
                  Pagu / Volume Kuota
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setLimitMode('card_limit')}
                    className={`px-3 py-2 rounded-lg text-[12px] font-medium border text-left transition ${
                      limitMode === 'card_limit'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <div className="font-semibold text-emerald-800">Limit Tiap Kartu</div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Sesuai pagu master</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLimitMode('custom')}
                    className={`px-3 py-2 rounded-lg text-[12px] font-medium border text-left transition ${
                      limitMode === 'custom'
                        ? 'border-zinc-900 bg-zinc-900 text-white ring-2 ring-black/20'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <div className="font-semibold">Nilai Seragam</div>
                    <p className={`text-[10px] mt-0.5 ${limitMode === 'custom' ? 'text-zinc-300' : 'text-zinc-500'}`}>Override Liter</p>
                  </button>
                </div>

                {limitMode === 'custom' ? (
                  <Input
                    label="Volume Default per Kartu (Liter) *"
                    value={defaultAlloc}
                    onChange={setDefaultAlloc}
                    type="number"
                    placeholder="200"
                  />
                ) : (
                  <p className="text-[11px] text-zinc-500">
                    Menggunakan pagu bulanan (misal 200L, 250L, 300L) yang telah terdaftar pada masing-masing kartu.
                  </p>
                )}
              </div>

              {/* Preview calculation */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5">
                <p className="text-[10.5px] uppercase tracking-wide text-zinc-500 mb-2 font-semibold">Estimasi Alokasi Periode</p>
                <div className="space-y-1.5 text-[12.5px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Target Kartu</span>
                    <span className="font-semibold">{totalCardsCount} kartu aktif</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Metode Produk</span>
                    <span className="font-medium text-emerald-700">
                      {productMode === 'auto' ? 'Auto-Detect Armada' : products.find(p => p.id === productId)?.name || 'Custom'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Metode Pagu</span>
                    <span className="font-medium text-zinc-800">
                      {limitMode === 'card_limit' ? 'Pagu Masing-Masing' : `${defaultAlloc} L / kartu`}
                    </span>
                  </div>
                  <div className="w-full h-px bg-zinc-200 my-1" />
                  <div className="flex justify-between">
                    <span className="text-zinc-600 font-medium">Estimasi Total Liter</span>
                    <span className="font-bold text-zinc-900">{totalEstimatedLiters.toLocaleString('id-ID')} L</span>
                  </div>
                </div>
              </div>

              {!confirmed ? (
                <Button variant="primary" className="w-full" onClick={() => setConfirmed(true)}>
                  Preview & Konfirmasi
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[12px] text-amber-800 flex items-start gap-2">
                    <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      Tindakan ini akan mengenerate alokasi kuota bulanan untuk periode <strong>{period}</strong>.
                    </span>
                  </div>
                  <Button variant="aloe" className="w-full" onClick={handleGenerate} disabled={submitting}>
                    <CheckCircle size={14} /> {submitting ? 'Memproses…' : '✓ Generate Sekarang'}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setConfirmed(false)}>
                    Batal
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Per-unit breakdown */}
        <div className="col-span-2">
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-semibold">Pagu Default per Satuan Kerja</h3>
                <p className="text-[11.5px] text-zinc-400">Pagu alokasi standar berdasarkan struktur dinas</p>
              </div>
              <span className="text-[12px] text-zinc-400">{units.length} Satker terdaftar</span>
            </div>
            <div className="divide-y divide-zinc-50">
              {units.map((u, i) => (
                <div key={u.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 transition">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[11px] font-semibold text-zinc-500 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13.5px] font-medium text-zinc-800">{u.name}</p>
                    <p className="text-[11.5px] text-zinc-400">{u.commander || 'Pimpinan Satker'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-zinc-900">{u.default_alloc_l || u.defaultAllocation || 200} L</span>
                    <span className="text-[11.5px] text-zinc-400 block">/ kartu</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


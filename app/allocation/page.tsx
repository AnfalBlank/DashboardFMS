'use client';
import { useState, useEffect } from 'react';
import { api, Unit, Product } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function AllocationPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const now = new Date();
  const currentMonth = now.toLocaleString('en-US', { month: 'long' });
  const currentYear = now.getFullYear();

  const [period, setPeriod] = useState(`${currentMonth} ${currentYear}`);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [productId, setProductId] = useState('');
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
    ]).then(([uRes, pRes]) => {
      if (uRes.status === 'fulfilled' && uRes.value?.data) {
        setUnits(uRes.value.data);
      }
      if (pRes.status === 'fulfilled' && pRes.value?.data) {
        setProducts(pRes.value.data);
        if (pRes.value.data.length > 0) {
          setProductId(pRes.value.data[0].id);
        }
      }
      setLoading(false);
    });
  }, []);

  const totalCards = units.reduce((s, u) => s + (u.active_cards ?? u.cards ?? 0), 0) || 486;
  const totalLiter = totalCards * Number(defaultAlloc || 0);

  const handleGenerate = async () => {
    if (!productId || !defaultAlloc) {
      toastError('Data Belum Lengkap', 'Produk BBM dan alokasi default wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      await api.quota.generate({
        period,
        year: Number(year),
        month: Number(month),
        product_id: productId,
        default_l: Number(defaultAlloc),
        scope,
        unit_id: scope === 'unit' ? selectedUnitId : undefined,
      });
      success('Kuota Berhasil Digenerate', `Alokasi untuk periode ${period} berhasil dibuat.`);
      router.push('/quota');
    } catch (err: unknown) {
      toastError('Gagal Generate Kuota', err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Monthly Quota Allocation" subtitle="Generate alokasi kuota BBM bulanan secara massal">
        <Button variant="outline" size="sm" onClick={() => router.push('/quota')}>
          Lihat Daftar Kuota
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-5">
        {/* Form */}
        <div className="col-span-1 space-y-4">
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Konfigurasi Generate Kuota</h3>
            <div className="space-y-3">
              <Input
                label="Nama Periode"
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
                label="Produk BBM"
                value={productId}
                onChange={setProductId}
                options={products.map(p => ({ value: p.id, label: `${p.name} (${p.code})` }))}
              />

              <Select
                label="Scope Target"
                value={scope}
                onChange={setScope}
                options={[
                  { value: 'all', label: 'Semua Kartu Aktif SPBP' },
                  { value: 'unit', label: 'Hanya Satker / Unit Tertentu' },
                ]}
              />

              {scope === 'unit' && (
                <Select
                  label="Pilih Satker"
                  value={selectedUnitId}
                  onChange={setSelectedUnitId}
                  options={units.map(u => ({ value: u.id, label: `${u.name} (${u.code})` }))}
                />
              )}

              <Input
                label="Default Alokasi (Liter / Kartu)"
                value={defaultAlloc}
                onChange={setDefaultAlloc}
                type="number"
                placeholder="200"
              />

              {/* Preview calculation */}
              {defaultAlloc && (
                <div className="bg-[#c1fbd4]/30 border border-[#c1fbd4] rounded-xl p-4">
                  <p className="text-[10.5px] uppercase tracking-wide text-zinc-500 mb-2 font-semibold">Estimasi Kebutuhan</p>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Estimasi kartu</span>
                      <span className="font-semibold">{totalCards} kartu</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Alokasi per kartu</span>
                      <span className="font-semibold">{Number(defaultAlloc).toLocaleString('id-ID')} L</span>
                    </div>
                    <div className="w-full h-px bg-zinc-200 my-1" />
                    <div className="flex justify-between">
                      <span className="text-zinc-600 font-medium">Total liter BBM</span>
                      <span className="font-bold text-zinc-900">{totalLiter.toLocaleString('id-ID')} L</span>
                    </div>
                  </div>
                </div>
              )}

              {!confirmed ? (
                <Button variant="primary" className="w-full" onClick={() => setConfirmed(true)} disabled={!defaultAlloc}>
                  Preview & Konfirmasi
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[12.5px] text-amber-700 flex items-start gap-2">
                    <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                    <span>Tindakan ini akan membuat alokasi kuota untuk periode <strong>{period}</strong>.</span>
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

'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Settings, Bell, Shield, Database, Sliders } from 'lucide-react';

export default function SettingsPage() {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general',       label: 'Umum',           icon: <Settings size={14}/> },
    { id: 'quota',         label: 'Kebijakan Kuota', icon: <Sliders size={14}/> },
    { id: 'thresholds',    label: 'Threshold',       icon: <Shield size={14}/> },
    { id: 'notifications', label: 'Notifikasi',      icon: <Bell size={14}/> },
    { id: 'backup',        label: 'Backup & Data',   icon: <Database size={14}/> },
  ];

  return (
    <div className="max-w-4xl">
      <PageHeader title="System Settings" subtitle="Konfigurasi global sistem Fuel Management" />

      {/* Tab nav */}
      <div className="flex gap-1 bg-white border border-zinc-200 rounded-xl p-1 mb-5">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition flex-1 justify-center ${
              activeTab === t.id ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Informasi Organisasi</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input label="Nama Organisasi" value="SPBP Polda Papua Barat" />
              <Input label="Lokasi" value="Manokwari, Papua Barat" />
              <Select label="Timezone" value="Asia/Jakarta" options={[
                { value: 'Asia/Jakarta',   label: 'WIB — Asia/Jakarta (UTC+7)' },
                { value: 'Asia/Makassar',  label: 'WITA — Asia/Makassar (UTC+8)' },
                { value: 'Asia/Jayapura',  label: 'WIT — Asia/Jayapura (UTC+9)' },
              ]} />
              <Select label="Mata Uang" value="IDR" options={[
                { value: 'IDR', label: 'IDR — Rupiah Indonesia' },
              ]} />
              <Select label="Satuan Volume Default" value="Liter" options={[
                { value: 'Liter',    label: 'Liter (L)' },
                { value: 'Kiloliter', label: 'Kiloliter (KL)' },
              ]} />
            </div>
            <Button variant="primary" onClick={() => success('Pengaturan disimpan', 'Konfigurasi umum berhasil diperbarui.')}>
              Simpan
            </Button>
          </Card>
        </div>
      )}

      {/* Quota policy */}
      {activeTab === 'quota' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Kebijakan Kuota</h3>
            <div className="space-y-4">
              <Select label="Kebijakan Sisa Kuota Akhir Bulan" value="expire" options={[
                { value: 'expire',   label: 'Hanguskan sisa kuota (default)' },
                { value: 'carryover', label: 'Bawa ke bulan berikutnya' },
              ]} />
              <Select label="Kebijakan Transaksi Melebihi Kuota" value="reject" options={[
                { value: 'reject',   label: 'Tolak transaksi (default)' },
                { value: 'approval', label: 'Izinkan dengan approval' },
                { value: 'overdraft', label: 'Izinkan overdraft' },
              ]} />
              <Select label="Generate Kuota Otomatis" value="manual" options={[
                { value: 'manual', label: 'Manual oleh admin' },
                { value: 'auto',   label: 'Otomatis tiap awal bulan' },
              ]} />
              <div className="flex items-center justify-between py-3 border-t border-zinc-100">
                <div>
                  <p className="text-[13.5px] font-medium text-zinc-800">Require Approval untuk Top Up</p>
                  <p className="text-[12px] text-zinc-400">Setiap top up kuota harus melalui approval</p>
                </div>
                <button className="w-11 h-6 bg-zinc-900 rounded-full relative flex-shrink-0">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow transition" />
                </button>
              </div>
            </div>
            <Button variant="primary" className="mt-4" onClick={() => success('Kebijakan kuota disimpan')}>
              Simpan
            </Button>
          </Card>
        </div>
      )}

      {/* Thresholds */}
      {activeTab === 'thresholds' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Threshold Stok Tank</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Input label="LOW threshold (%)" value="30" type="number" />
              <Input label="CRITICAL threshold (%)" value="15" type="number" />
              <Input label="HIGH threshold (%)" value="90" type="number" />
            </div>
            <Button variant="primary" onClick={() => success('Threshold stok disimpan')}>Simpan</Button>
          </Card>

          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Threshold Variance Rekonsiliasi</h3>
            <div className="space-y-3 mb-4">
              {[
                { label: 'PERFECT',  value: '0',    color: 'text-green-600' },
                { label: 'NORMAL',   value: '0.5',  color: 'text-zinc-700' },
                { label: 'WARNING',  value: '1.0',  color: 'text-amber-600' },
                { label: 'CRITICAL', value: '2.0',  color: 'text-red-600' },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-4">
                  <span className={`w-20 text-[12.5px] font-semibold ${t.color}`}>{t.label}</span>
                  <Input value={t.value} type="number" className="flex-1" />
                  <span className="text-[12.5px] text-zinc-400">%</span>
                </div>
              ))}
            </div>
            <Button variant="primary" onClick={() => success('Threshold rekonsiliasi disimpan')}>Simpan</Button>
          </Card>

          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Threshold Anomali Transaksi</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input label="Volume maks per transaksi (L)" value="100" type="number" />
              <Input label="Frekuensi max (trx / 10 menit)" value="3" type="number" />
              <Input label="Konsumsi maks vs kuota (%)" value="80" type="number" />
            </div>
            <Button variant="primary" onClick={() => success('Threshold anomali disimpan')}>Simpan</Button>
          </Card>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Saluran Notifikasi</h3>
            <div className="space-y-4">
              {[
                { channel: 'Dashboard', desc: 'Tampilkan di notification center', active: true },
                { channel: 'Email', desc: 'Kirim ke email terdaftar', active: true },
                { channel: 'Telegram', desc: 'Kirim via Telegram Bot', active: false },
                { channel: 'WhatsApp API', desc: 'Kirim via WhatsApp Business API', active: false },
              ].map(n => (
                <div key={n.channel} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                  <div>
                    <p className="text-[13.5px] font-medium text-zinc-800">{n.channel}</p>
                    <p className="text-[12px] text-zinc-400">{n.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={n.active ? 'success' : 'neutral'}>{n.active ? 'AKTIF' : 'NONAKTIF'}</Badge>
                    <button className={`w-11 h-6 rounded-full relative flex-shrink-0 transition ${n.active ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${n.active ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" className="mt-2" onClick={() => success('Pengaturan notifikasi disimpan')}>Simpan</Button>
          </Card>

          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Konfigurasi Telegram Bot</h3>
            <div className="space-y-3 mb-4">
              <Input label="Bot Token" placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyz" />
              <Input label="Chat ID / Group ID" placeholder="-1001234567890" />
            </div>
            <Button variant="outline" onClick={() => success('Test notifikasi dikirim', 'Cek Telegram Anda.')}>
              Test Kirim Notifikasi
            </Button>
          </Card>
        </div>
      )}

      {/* Backup */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Konfigurasi Backup</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select label="Frekuensi Backup" value="daily" options={[
                { value: 'daily',   label: 'Harian (setiap tengah malam)' },
                { value: 'hourly',  label: 'Per jam' },
                { value: 'weekly',  label: 'Mingguan' },
              ]} />
              <Input label="Retensi Backup (hari)" value="30" type="number" />
            </div>
            <div className="space-y-3 mb-4">
              {[
                { label: 'Backup otomatis', active: true },
                { label: 'Enkripsi backup', active: true },
                { label: 'Backup incremental', active: false },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-zinc-100 last:border-0">
                  <span className="text-[13.5px] font-medium text-zinc-800">{s.label}</span>
                  <button className={`w-11 h-6 rounded-full relative flex-shrink-0 transition ${s.active ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${s.active ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => success('Konfigurasi backup disimpan')}>Simpan</Button>
              <Button variant="aloe" onClick={() => success('Backup dimulai', 'Backup manual sedang diproses.')}>
                Backup Sekarang
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-[13px] font-semibold mb-4">Riwayat Backup</h3>
            <div className="divide-y divide-zinc-50">
              {[
                { date: '09 Agu 2026 00:00', size: '284 MB', status: 'SUCCESS' },
                { date: '08 Agu 2026 00:00', size: '281 MB', status: 'SUCCESS' },
                { date: '07 Agu 2026 00:00', size: '279 MB', status: 'SUCCESS' },
                { date: '06 Agu 2026 00:00', size: '276 MB', status: 'FAILED'  },
              ].map((b, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[13px] font-medium text-zinc-800">{b.date}</p>
                    <p className="text-[12px] text-zinc-400">{b.size}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={b.status === 'SUCCESS' ? 'success' : 'critical'}>{b.status}</Badge>
                    {b.status === 'SUCCESS' && (
                      <Button variant="outline" size="sm"
                        onClick={() => success('Restore dimulai', 'Proses restore sedang berlangsung.')}>
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

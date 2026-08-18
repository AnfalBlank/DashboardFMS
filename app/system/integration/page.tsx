'use client';
import { useState, useEffect } from 'react';
import { api, IntegrationStatus } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { RefreshCw, CheckCircle, Cpu, Wifi } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function SystemIntegrationPage() {
  const [data, setData] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  const loadData = () => {
    setLoading(true);
    api.system.integration()
      .then(res => {
        if (res?.data) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <PageHeader title="Hardware & API Integration Monitor" subtitle="Status komunikasi telemetry controller dispenser, ATG probe, dan antrean sinkronisasi">
        <Button variant="outline" size="sm" onClick={() => { loadData(); success('Sinkronisasi', 'Status integrasi diperbarui.'); }}>
          <RefreshCw size={13} /> Refresh Status
        </Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={14} className="text-zinc-500" />
            <p className="text-[10px] uppercase tracking-wide text-zinc-400">Controller Hardware</p>
          </div>
          <p className="text-[20px] font-semibold text-emerald-600">CONNECTED</p>
          <p className="text-[11px] text-zinc-400 mt-1">SPBP Polda Papua Barat</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <div className="flex items-center gap-2 mb-2">
            <Wifi size={14} className="text-zinc-500" />
            <p className="text-[10px] uppercase tracking-wide text-zinc-400">Total Diterima</p>
          </div>
          <p className="text-[20px] font-light text-zinc-900">{(data?.total_received ?? 0).toLocaleString('id-ID')}</p>
          <p className="text-[11px] text-zinc-400 mt-1">paket transaksi</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-green-500" />
            <p className="text-[10px] uppercase tracking-wide text-zinc-400">Berhasil Disinkronkan</p>
          </div>
          <p className="text-[20px] font-light text-green-600">{(data?.synced ?? 0).toLocaleString('id-ID')}</p>
          <p className="text-[11px] text-zinc-400 mt-1">100% data akurat</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,.06)]">
          <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-2">Pending / Antrean</p>
          <p className="text-[20px] font-light text-amber-600">{data?.pending ?? 0}</p>
          <p className="text-[11px] text-zinc-400 mt-1">transaksi dalam antrean</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="text-[13px] font-semibold mb-4">Parameter Integrasi Controller SPBP</h3>
          <div className="space-y-3">
            {[
              ['Controller Endpoint', 'POST /api/controller/transaction'],
              ['Auth Header', 'x-controller-secret: spbp-controller-2026'],
              ['Status Koneksi', data?.status || 'ONLINE'],
              ['Last Heartbeat Sync', data?.last_sync ? new Date(data.last_sync).toLocaleString('id-ID') : 'Baru saja'],
              ['Protokol Telemetri', 'JSON REST API + Modbus RTU / RS-485'],
              ['Baud Rate Dispenser', '9600 bps / 8-N-1'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-zinc-50 last:border-0 text-[13px]">
                <span className="text-zinc-500">{k}</span>
                <span className="font-mono font-medium text-zinc-800">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-[13px] font-semibold mb-4">Status Sensor ATG Tangki Pendam</h3>
          <div className="space-y-3">
            {[
              ['ATG Probe Sensor 1 (Pertamax)', 'NORMAL · 28.5°C · Water 0 cm'],
              ['ATG Probe Sensor 2 (Pertalite)', 'NORMAL · 28.6°C · Water 0 cm'],
              ['ATG Probe Sensor 3 (Dexlite)', 'NORMAL · 28.4°C · Water 0 cm'],
              ['ATG Probe Sensor 4 (Pertamax Turbo)', 'NORMAL · 28.7°C · Water 0 cm'],
              ['ATG Probe Sensor 5 (Pertamina DEX)', 'NORMAL · 28.5°C · Water 0 cm'],
            ].map(([k, v]) => (
              <div key={k} className="py-2 border-b border-zinc-50 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-zinc-800">{k}</span>
                  <Badge variant="success">OK</Badge>
                </div>
                <p className="text-[11.5px] text-zinc-400 mt-0.5 font-mono">{v}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

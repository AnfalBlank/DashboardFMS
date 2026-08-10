'use client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const integrations = [
  { name: 'Fuel Server', type: 'TCP/IP', host: '192.168.10.5:4001', status: 'CONNECTED', lastSync: '18:31:42', syncCount: 4821 },
  { name: 'ATG Sensor', type: 'Modbus', host: '192.168.10.10:502', status: 'CONNECTED', lastSync: '18:31:38', syncCount: 1440 },
  { name: 'Card Reader', type: 'USB/RS232', host: 'COM3', status: 'OFFLINE', lastSync: '17:55:00', syncCount: 0 },
  { name: 'Telegram Bot', type: 'HTTPS', host: 'api.telegram.org', status: 'CONNECTED', lastSync: '18:00:00', syncCount: 12 },
];

const syncLogs = [
  { time: '18:31:42', source: 'Fuel Server', type: 'TRANSACTION', records: 3, status: 'SYNCED' },
  { time: '18:31:38', source: 'ATG Sensor', type: 'TANK_READING', records: 5, status: 'SYNCED' },
  { time: '18:30:42', source: 'Fuel Server', type: 'TRANSACTION', records: 2, status: 'SYNCED' },
  { time: '18:29:11', source: 'Fuel Server', type: 'TRANSACTION', records: 1, status: 'FAILED' },
  { time: '18:28:42', source: 'ATG Sensor', type: 'TANK_READING', records: 5, status: 'SYNCED' },
];

export default function IntegrationPage() {
  return (
    <div>
      <PageHeader title="Integration Monitor" subtitle="Status koneksi dan sinkronisasi sistem eksternal">
        <Button variant="outline" size="sm">Test Koneksi</Button>
        <Button variant="primary" size="sm">Sync Manual</Button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard eyebrow="Trx Diterima" value="4.821" accent="black" />
        <KpiCard eyebrow="Synced" value="4.818" accent="green" />
        <KpiCard eyebrow="Pending" value="2" deltaDir="neutral" accent="amber" />
        <KpiCard eyebrow="Failed" value="1" deltaDir="down" accent="red" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {integrations.map(i => (
          <Card key={i.name}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-semibold">{i.name}</h3>
                  <Badge variant={i.status === 'CONNECTED' ? 'success' : 'neutral'}>{i.status}</Badge>
                </div>
                <p className="text-[12px] text-zinc-400">{i.type} · {i.host}</p>
              </div>
              {i.status === 'CONNECTED'
                ? <CheckCircle size={18} className="text-green-500" />
                : <XCircle size={18} className="text-zinc-300" />
              }
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">Last Sync</p>
                <p className="text-[14px] font-semibold text-zinc-800 font-mono">{i.lastSync}</p>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-1">Records</p>
                <p className="text-[14px] font-semibold text-zinc-800">{i.syncCount.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-[13px] font-semibold">Sync Log Terbaru</h3>
        </div>
        <div className="table-scroll">
          <table className="fuel-table">
            <thead><tr><th>Waktu</th><th>Sumber</th><th>Tipe Data</th><th>Records</th><th>Status</th></tr></thead>
            <tbody>
              {syncLogs.map((l, i) => (
                <tr key={i}>
                  <td className="font-mono text-[12px]">{l.time}</td>
                  <td className="font-medium">{l.source}</td>
                  <td><Badge variant="neutral">{l.type}</Badge></td>
                  <td className="font-semibold">{l.records}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {l.status === 'SYNCED'
                        ? <CheckCircle size={13} className="text-green-500" />
                        : <XCircle size={13} className="text-red-500" />
                      }
                      <Badge variant={l.status === 'SYNCED' ? 'success' : 'critical'}>{l.status}</Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

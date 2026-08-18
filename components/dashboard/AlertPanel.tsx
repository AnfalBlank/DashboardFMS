'use client';
import { useEffect, useState } from 'react';
import { api, Alert } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Bell } from 'lucide-react';
import Link from 'next/link';

interface AlertPanelProps {
  alerts?: Alert[];
  onRefresh?: () => void;
}

export function AlertPanel({ alerts: propAlerts, onRefresh }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>(propAlerts ?? []);
  const [loading, setLoading] = useState(!propAlerts);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.alerts();
      if (res?.data) {
        setAlerts(res.data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propAlerts) {
      setAlerts(propAlerts);
    } else {
      fetchAlerts();
    }
  }, [propAlerts]);

  const handleMarkRead = async (id: string | number) => {
    try {
      await api.dashboard.markRead(id);
      setAlerts(prev => prev.filter(a => String(a.id) !== String(id)));
      if (onRefresh) onRefresh();
    } catch {
      // silent
    }
  };

  const criticalCount = alerts.filter(a => a.type === 'CRITICAL' || a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.type === 'WARNING' || a.severity === 'WARNING').length;

  return (
    <Card padding={false}>
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-[13px] font-semibold text-zinc-900">Alert Center</h3>
          {criticalCount > 0 && (
            <Badge variant="critical">
              {criticalCount} kritis
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="warning">
              {warningCount} warning
            </Badge>
          )}
          {alerts.length === 0 && !loading && (
            <Badge variant="success">Sistem Normal</Badge>
          )}
        </div>
        <Link href="/system/audit">
          <Button variant="outline" size="sm">Lihat Semua</Button>
        </Link>
      </div>
      <div>
        {loading && alerts.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-zinc-400">Memuat alert…</div>
        ) : alerts.length === 0 ? (
          <div className="py-8 px-5 text-center">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <Check size={16} />
            </div>
            <p className="text-[13px] font-medium text-zinc-800">Tidak ada alert aktif</p>
            <p className="text-[11.5px] text-zinc-400 mt-0.5">Semua parameter operasional SPBP berada dalam batas aman.</p>
          </div>
        ) : (
          alerts.slice(0, 5).map(a => {
            const isCritical = a.type === 'CRITICAL' || a.severity === 'CRITICAL';
            const isWarning = a.type === 'WARNING' || a.severity === 'WARNING';
            const descText = a.message ?? a.desc ?? '';
            const timeText = a.created_at ? new Date(a.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : (a.time ?? 'Baru saja');
            return (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-zinc-50 hover:bg-zinc-50 transition last:border-0 group">
                <div className="pt-1 flex-shrink-0">
                  <span className={`inline-block w-2 h-2 rounded-full
                    ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-zinc-900">{a.title}</p>
                  {descText && <p className="text-[12px] text-zinc-400 mt-0.5 leading-snug">{descText}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                  <span className="text-[11px] text-zinc-300">{timeText}</span>
                  <button
                    onClick={() => handleMarkRead(a.id)}
                    title="Tandai sudah dibaca"
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded transition"
                  >
                    <Check size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

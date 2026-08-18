'use client';
import { useEffect, useState } from 'react';
import { api, Card as CardType } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, statusVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRouter } from 'next/navigation';

export default function MasterCardsPage() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.cards.list({ limit: 100 })
      .then(res => {
        if (res?.data) setCards(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Master Cards" subtitle="Data master kartu BBM & RFID terdaftar">
        <Button variant="primary" size="sm" onClick={() => router.push('/cards')}>
          + Kelola Kartu
        </Button>
      </PageHeader>
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
                <th>Limit/Bulan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && cards.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-6 text-[13px] text-zinc-400">Memuat data kartu…</td></tr>
              ) : cards.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-6 text-[13px] text-zinc-400">Belum ada kartu terdaftar</td></tr>
              ) : (
                cards.map(c => (
                  <tr key={c.id} className="cursor-pointer" onClick={() => router.push('/cards')}>
                    <td className="font-mono font-semibold text-zinc-800">{c.card_number || c.number}</td>
                    <td><Badge variant="neutral">{c.card_type || c.type || 'REGULER'}</Badge></td>
                    <td className="font-medium">{c.holder_name || c.holder}</td>
                    <td className="text-zinc-500 text-[12px]">{c.unit_name || c.unit}</td>
                    <td className="text-zinc-500 text-[12px]">{c.police_number || c.vehicle || '—'}</td>
                    <td className="text-zinc-500 text-[12px]">{c.fuel_type || c.fuelType || 'Pertamax'}</td>
                    <td className="font-medium">{c.monthly_limit ?? c.monthlyLimit ?? 0} L</td>
                    <td><Badge variant={statusVariant(c.status)}>{c.status}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

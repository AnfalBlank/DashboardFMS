'use client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

const operators = [
  { id: 'OP01', name: 'Budi Santoso', username: 'OPERATOR01', shift: 'PAGI', status: 'ACTIVE', trxToday: 24 },
  { id: 'OP02', name: 'Sari Dewi', username: 'OPERATOR02', shift: 'SIANG', status: 'ACTIVE', trxToday: 18 },
  { id: 'OP03', name: 'Tono Prasetyo', username: 'OPERATOR03', shift: 'MALAM', status: 'ACTIVE', trxToday: 16 },
  { id: 'OP04', name: 'Rini Wulandari', username: 'OPERATOR04', shift: 'PAGI', status: 'INACTIVE', trxToday: 0 },
];

export default function OperatorsPage() {
  return (
    <div>
      <PageHeader title="Operators" subtitle="Kelola operator SPBP dan shift kerja">
        <Button variant="primary" size="sm">+ Operator</Button>
      </PageHeader>
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="fuel-table">
            <thead><tr><th>Nama</th><th>Username</th><th>Shift</th><th>Trx Hari Ini</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {operators.map(o => (
                <tr key={o.id}>
                  <td className="font-medium">{o.name}</td>
                  <td className="font-mono text-[12px] text-zinc-600">{o.username}</td>
                  <td><Badge variant="neutral">{o.shift}</Badge></td>
                  <td className="font-semibold">{o.trxToday}</td>
                  <td><Badge variant={o.status === 'ACTIVE' ? 'success' : 'neutral'}>{o.status}</Badge></td>
                  <td><button className="text-[12px] text-zinc-400 hover:text-zinc-700 px-2 py-1 hover:bg-zinc-100 rounded-lg transition">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

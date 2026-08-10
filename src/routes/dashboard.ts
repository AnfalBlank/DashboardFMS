import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { authenticate } from '../middleware/auth';
import { toNum } from '../utils/db';



const router = Router();
router.use(authenticate);

// GET /api/dashboard — main KPI summary
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);
  const nowMonth = new Date().toISOString().slice(0, 7);

  const [stockRes, todayTrxRes, monthTrxRes, cardRes, quotaRes, alertRes, tankRes, recentTrxRes] = await Promise.all([
    // Total stock
    db.execute({
      sql: `SELECT COALESCE(SUM(current_l),0) as total_stock FROM tanks`,
      args: [],
    }),
    // Today's consumption
    db.execute({
      sql: `SELECT COALESCE(SUM(volume_l),0) as today_l, COUNT(*) as today_trx
            FROM transactions WHERE DATE(transaction_time) = ? AND status='SUCCESS'`,
      args: [today],
    }),
    // Monthly consumption
    db.execute({
      sql: `SELECT COALESCE(SUM(volume_l),0) as month_l, COUNT(*) as month_trx
            FROM transactions WHERE strftime('%Y-%m', transaction_time) = ? AND status='SUCCESS'`,
      args: [nowMonth],
    }),
    // Active cards
    db.execute({
      sql: `SELECT COUNT(*) as active_cards FROM cards WHERE status='ACTIVE'`,
      args: [],
    }),
    // Quota stats
    db.execute({
      sql: `SELECT COALESCE(SUM(allocated_l),0) as total_alloc,
                   COALESCE(SUM(used_l),0) as total_used,
                   COALESCE(SUM(remaining_l),0) as total_remaining,
                   COALESCE(SUM(expired_l),0) as total_expired
            FROM card_quotas cq
            JOIN quota_periods qp ON qp.id = cq.period_id
            WHERE qp.status = 'ACTIVE'`,
      args: [],
    }),
    // Active alerts
    db.execute({
      sql: `SELECT * FROM notifications WHERE read = 0 ORDER BY created_at DESC LIMIT 10`,
      args: [],
    }),
    // All tanks
    db.execute({
      sql: `SELECT t.*, p.name as product_name, p.code
            FROM tanks t JOIN products p ON p.id = t.product_id ORDER BY p.name`,
      args: [],
    }),
    // Recent 10 transactions
    db.execute({
      sql: `SELECT t.id, t.transaction_time, t.volume_l, t.total_amount, t.status,
                   c.card_number, c.holder_name, p.name as product_name,
                   pm.number as pump_number, n.number as nozzle_number
            FROM transactions t
            JOIN cards c ON c.id = t.card_id
            JOIN products p ON p.id = t.product_id
            LEFT JOIN pumps pm ON pm.id = t.pump_id
            LEFT JOIN nozzles n ON n.id = t.nozzle_id
            ORDER BY t.transaction_time DESC LIMIT 10`,
      args: [],
    }),
  ]);

  const stock    = (stockRes.rows[0] as any) ?? {};
  const today_   = (todayTrxRes.rows[0] as any) ?? {};
  const month_   = (monthTrxRes.rows[0] as any) ?? {};
  const cards_   = (cardRes.rows[0] as any) ?? {};
  const quota_   = (quotaRes.rows[0] as any) ?? {};

  const totalAlloc = toNum(quota_.total_alloc);
  const totalUsed  = toNum(quota_.total_used);
  const utilPct    = totalAlloc > 0 ? Math.round((totalUsed / totalAlloc) * 10000) / 100 : 0;

  res.json({
    success: true,
    data: {
      kpi: {
        total_stock_l:          toNum(stock.total_stock),
        today_consumption_l:    toNum(today_.today_l),
        today_transactions:     toNum(today_.today_trx),
        monthly_consumption_l:  toNum(month_.month_l),
        monthly_transactions:   toNum(month_.month_trx),
        active_cards:           toNum(cards_.active_cards),
        quota_utilization_pct:  utilPct,
        quota_remaining_l:      toNum(quota_.total_remaining),
        quota_expired_l:        toNum(quota_.total_expired),
      },
      tanks:              tankRes.rows,
      alerts:             alertRes.rows,
      recent_transactions: recentTrxRes.rows,
      last_updated:       new Date().toISOString(),
    },
  });
});

// GET /api/dashboard/alerts
router.get('/alerts', async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

// POST /api/dashboard/alerts/:id/read
router.post('/alerts/:id/read', async (req: Request, res: Response): Promise<void> => {
  await db.execute({ sql: `UPDATE notifications SET read = 1 WHERE id = ?`, args: [req.params.id] });
  res.json({ success: true });
});

export default router;

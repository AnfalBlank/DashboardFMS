import { Router } from 'express';
import { db } from '../db/client';
import { authenticate, authorize } from '../middleware/auth';
import { toNum } from '../utils/db';
import { w } from '../utils/wrap';

const router = Router();
router.use(authenticate, authorize('report.view'));

// GET /api/reports/transactions
router.get('/transactions', w(async (req, res) => {
  const { from, to, unit_id, product_id, limit = '500' } = req.query as Record<string, string>;
  let sql = `
    SELECT t.*, c.card_number, c.holder_name, u.name as unit_name,
           p.name as product_name, v.police_number
    FROM transactions t
    JOIN cards c ON c.id = t.card_id
    JOIN products p ON p.id = t.product_id
    LEFT JOIN units u ON u.id = c.unit_id
    LEFT JOIN vehicles v ON v.id = c.vehicle_id
    WHERE t.status = 'SUCCESS'`;
  const args: (string | number)[] = [];
  if (from)       { sql += ` AND DATE(t.transaction_time) >= ?`; args.push(from); }
  if (to)         { sql += ` AND DATE(t.transaction_time) <= ?`; args.push(to); }
  if (unit_id)    { sql += ` AND c.unit_id = ?`;                 args.push(unit_id); }
  if (product_id) { sql += ` AND t.product_id = ?`;              args.push(product_id); }
  sql += ` ORDER BY t.transaction_time DESC LIMIT ?`;
  args.push(Number(limit));

  const result = await db.execute({ sql, args });
  const rows = result.rows as any[];
  const total_volume = rows.reduce((s, r) => s + toNum(r.volume_l), 0);
  const total_amount = rows.reduce((s, r) => s + toNum(r.total_amount), 0);
  res.json({
    success: true, data: rows,
    summary: {
      total_transactions: rows.length,
      total_volume_l:     Math.round(total_volume * 100) / 100,
      total_amount_idr:   Math.round(total_amount),
      avg_volume_l:       rows.length > 0 ? Math.round(total_volume / rows.length * 100) / 100 : 0,
    },
  });
}));

// GET /api/reports/quota
router.get('/quota', w(async (req, res) => {
  const { period_id } = req.query as Record<string, string>;
  const result = await db.execute({
    sql: `SELECT cq.*, c.card_number, c.holder_name, u.name as unit_name,
                 p.name as product_name, qp.period
          FROM card_quotas cq
          JOIN cards c ON c.id = cq.card_id
          JOIN products p ON p.id = cq.product_id
          LEFT JOIN units u ON u.id = c.unit_id
          JOIN quota_periods qp ON qp.id = cq.period_id
          WHERE ${period_id ? 'cq.period_id = ?' : "qp.status = 'ACTIVE'"}
          ORDER BY c.card_number`,
    args: period_id ? [period_id] : [],
  });
  const rows = result.rows as any[];
  res.json({
    success: true, data: rows,
    summary: {
      total_allocated: rows.reduce((s, r) => s + toNum(r.allocated_l), 0),
      total_used:      rows.reduce((s, r) => s + toNum(r.used_l), 0),
      total_remaining: rows.reduce((s, r) => s + toNum(r.remaining_l), 0),
      total_topup:     rows.reduce((s, r) => s + toNum(r.topup_l), 0),
      total_expired:   rows.reduce((s, r) => s + toNum(r.expired_l), 0),
    },
  });
}));

// GET /api/reports/stock
router.get('/stock', w(async (_req, res) => {
  const result = await db.execute({
    sql: `SELECT r.*, p.name as product_name FROM reconciliations r
          JOIN products p ON p.id = r.product_id
          ORDER BY r.date DESC, p.name`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
}));

// GET /api/reports/usage
router.get('/usage', w(async (req, res) => {
  const { from, to } = req.query as Record<string, string>;
  const dateFilter = from && to ? `AND DATE(t.transaction_time) BETWEEN '${from}' AND '${to}'` : '';

  const [byUnit, byCard] = await Promise.all([
    db.execute({
      sql: `SELECT u.id, u.name, COUNT(t.id) as trx_count,
                   COALESCE(SUM(t.volume_l), 0) as total_l,
                   COALESCE(SUM(t.total_amount), 0) as total_amount
            FROM units u
            LEFT JOIN cards c ON c.unit_id = u.id
            LEFT JOIN transactions t ON t.card_id = c.id AND t.status = 'SUCCESS' ${dateFilter}
            GROUP BY u.id, u.name ORDER BY total_l DESC`,
      args: [],
    }),
    db.execute({
      sql: `SELECT c.card_number, c.holder_name, u.name as unit_name,
                   COUNT(t.id) as trx_count,
                   COALESCE(SUM(t.volume_l), 0) as total_l,
                   COALESCE(SUM(t.total_amount), 0) as total_amount
            FROM cards c
            LEFT JOIN units u ON u.id = c.unit_id
            LEFT JOIN transactions t ON t.card_id = c.id AND t.status = 'SUCCESS' ${dateFilter}
            GROUP BY c.id ORDER BY total_l DESC LIMIT 50`,
      args: [],
    }),
  ]);
  res.json({ success: true, data: { by_unit: byUnit.rows, by_card: byCard.rows } });
}));

// GET /api/reports/totalizer
router.get('/totalizer', w(async (_req, res) => {
  const result = await db.execute({
    sql: `SELECT t.*, n.number as nozzle_number, pm.number as pump_number,
                 pr.name as product_name,
                 (t.current_value - t.opening_value) as usage_l
          FROM totalizers t
          JOIN nozzles n ON n.id = t.nozzle_id
          JOIN pumps pm ON pm.id = n.pump_id
          JOIN products pr ON pr.id = n.product_id
          ORDER BY t.shift_date DESC, pm.number, n.number`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
}));

// GET /api/reports/executive
router.get('/executive', w(async (req, res) => {
  const { month, year } = req.query as Record<string, string>;
  const y = year  ?? new Date().getFullYear().toString();
  const m = month ?? String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `${y}-${m.padStart(2, '0')}`;

  const [trxRes, stockRes, quotaRes, reconcileRes, topCardsRes] = await Promise.all([
    db.execute({
      sql: `SELECT COUNT(*) as total_trx, COALESCE(SUM(volume_l),0) as total_volume,
                   COALESCE(SUM(total_amount),0) as total_amount
            FROM transactions WHERE strftime('%Y-%m', transaction_time) = ? AND status='SUCCESS'`,
      args: [prefix],
    }),
    db.execute({ sql: `SELECT p.name, t.current_l, t.capacity_l, t.status FROM tanks t JOIN products p ON p.id = t.product_id`, args: [] }),
    db.execute({
      sql: `SELECT COALESCE(SUM(allocated_l),0) as total_alloc,
                   COALESCE(SUM(used_l),0) as total_used,
                   COALESCE(SUM(remaining_l),0) as total_remaining,
                   COALESCE(SUM(expired_l),0) as total_expired
            FROM card_quotas cq JOIN quota_periods qp ON qp.id = cq.period_id
            WHERE qp.year = ? AND qp.month = ?`,
      args: [Number(y), Number(m)],
    }),
    db.execute({
      sql: `SELECT COALESCE(AVG(variance_pct),0) as avg_variance
            FROM reconciliations WHERE strftime('%Y-%m', date) = ?`,
      args: [prefix],
    }),
    db.execute({
      sql: `SELECT c.card_number, c.holder_name, u.name as unit_name,
                   COALESCE(SUM(t.volume_l),0) as total_l
            FROM cards c
            LEFT JOIN units u ON u.id = c.unit_id
            LEFT JOIN transactions t ON t.card_id = c.id
              AND strftime('%Y-%m', t.transaction_time) = ? AND t.status = 'SUCCESS'
            GROUP BY c.id ORDER BY total_l DESC LIMIT 10`,
      args: [prefix],
    }),
  ]);

  res.json({
    success: true,
    data: {
      transactions: trxRes.rows[0],
      stock:        stockRes.rows,
      quota:        quotaRes.rows[0],
      avg_variance: toNum((reconcileRes.rows[0] as any)?.avg_variance),
      top_cards:    topCardsRes.rows,
      period:       prefix,
    },
  });
}));

export default router;

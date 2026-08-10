import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { authenticate, authorize } from '../middleware/auth';
import { logAudit } from '../middleware/audit';
import { v4 as uuid } from 'uuid';
import { toNum } from '../utils/db';
import { w } from '../utils/wrap';

const router = Router();
router.use(authenticate);

// GET /api/reconciliation
router.get('/', authorize('stock.view'), w(async (req, res) => {
  const { date } = req.query as Record<string, string>;
  const result = await db.execute({
    sql: `SELECT r.*, p.name as product_name
          FROM reconciliations r JOIN products p ON p.id = r.product_id
          WHERE r.date = ${date ? '?' : "DATE('now')"}
          ORDER BY p.name`,
    args: date ? [date] : [],
  });
  res.json({ success: true, data: result.rows });
}));

// POST /api/reconciliation/run
router.post('/run', authorize('stock.view'), w(async (req, res) => {
  const { date } = req.body;
  const targetDate: string = date ?? new Date().toISOString().slice(0, 10);

  const thresholdRes = await db.execute({
    sql: `SELECT key, value FROM system_settings WHERE key IN ('variance_normal','variance_warning','variance_critical')`,
    args: [],
  });
  const thresholds: Record<string, number> = {};
  for (const row of thresholdRes.rows as any[]) thresholds[row.key] = Number(row.value);

  const products = await db.execute({ sql: `SELECT * FROM products WHERE active = 1`, args: [] });
  const results: Record<string, unknown>[] = [];

  for (const prod of products.rows as any[]) {
    const openingRes = await db.execute({
      sql: `SELECT balance_l FROM stock_movements
            WHERE product_id = ? AND DATE(created_at) < ? AND type IN ('CLOSING','OPENING')
            ORDER BY created_at DESC LIMIT 1`,
      args: [prod.id, targetDate],
    });
    const opening = toNum((openingRes.rows[0] as any)?.balance_l);

    const deliveryRes = await db.execute({
      sql: `SELECT COALESCE(SUM(quantity_l), 0) as total FROM deliveries
            WHERE product_id = ? AND date = ? AND status = 'CONFIRMED'`,
      args: [prod.id, targetDate],
    });
    const delivery = toNum((deliveryRes.rows[0] as any)?.total);

    const salesRes = await db.execute({
      sql: `SELECT COALESCE(SUM(volume_l), 0) as total FROM transactions
            WHERE product_id = ? AND DATE(transaction_time) = ? AND status = 'SUCCESS'`,
      args: [prod.id, targetDate],
    });
    const sales = toNum((salesRes.rows[0] as any)?.total);

    const adjRes = await db.execute({
      sql: `SELECT COALESCE(SUM(quantity_l), 0) as total FROM stock_movements
            WHERE product_id = ? AND DATE(created_at) = ? AND type = 'ADJUSTMENT'`,
      args: [prod.id, targetDate],
    });
    const adjustment = toNum((adjRes.rows[0] as any)?.total);

    const theoreticalClosing = opening + delivery - sales + adjustment;

    const actualRes = await db.execute({
      sql: `SELECT COALESCE(SUM(current_l), 0) as total FROM tanks WHERE product_id = ?`,
      args: [prod.id],
    });
    const actualClosing = toNum((actualRes.rows[0] as any)?.total);

    const varianceL   = actualClosing - theoreticalClosing;
    const variancePct = theoreticalClosing > 0 ? (varianceL / theoreticalClosing) * 100 : 0;
    const absVarPct   = Math.abs(variancePct);
    const status = varianceL === 0 ? 'PERFECT'
      : absVarPct <= (thresholds.variance_normal ?? 0.5)  ? 'NORMAL'
      : absVarPct <= (thresholds.variance_warning ?? 1.0) ? 'WARNING'
      : 'CRITICAL';

    const reconId = uuid();
    await db.execute({
      sql: `INSERT OR REPLACE INTO reconciliations
            (id,product_id,date,opening_l,delivery_l,sales_l,adjustment_l,
             theoretical_closing,actual_closing,variance_l,variance_pct,status,created_by)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [reconId, prod.id, targetDate, opening, delivery, sales, adjustment,
             theoreticalClosing, actualClosing, varianceL,
             Math.round(variancePct * 100) / 100, status, req.user!.userId],
    });

    results.push({ product: prod.name, opening, delivery, sales, adjustment,
                   theoreticalClosing, actualClosing, varianceL,
                   variancePct: Math.round(variancePct * 100) / 100, status });
  }

  await logAudit(req.user!.userId, 'RUN_RECONCILIATION', 'Reconciliation', targetDate,
    null, { date: targetDate, products: results.length }, null, req.ip);
  res.json({ success: true, data: results });
}));

export default router;

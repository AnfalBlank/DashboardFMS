import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/client';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { logAudit } from '../middleware/audit';
import { v4 as uuid } from 'uuid';
import { toNum } from '../utils/db';



const router = Router();
router.use(authenticate);

// GET /api/pumps
router.get('/', authorize('transaction.view'), async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT p.*, COUNT(n.id) as nozzle_count
          FROM pumps p LEFT JOIN nozzles n ON n.pump_id = p.id
          GROUP BY p.id ORDER BY p.number`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

// GET /api/nozzles
router.get('/nozzles', authorize('transaction.view'), async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT n.*, p.number as pump_number, p.location, pr.name as product_name
          FROM nozzles n
          JOIN pumps p ON p.id = n.pump_id
          JOIN products pr ON pr.id = n.product_id
          ORDER BY p.number, n.number`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

// GET /api/pumps/totalizers
router.get('/totalizers', authorize('transaction.view'), async (req: Request, res: Response): Promise<void> => {
  const { date } = req.query as Record<string, string>;
  const targetDate = date ?? new Date().toISOString().slice(0, 10);

  const result = await db.execute({
    sql: `SELECT t.*, n.number as nozzle_number, n.product_id, pr.name as product_name,
                 pm.number as pump_number,
                 (t.current_value - t.opening_value) as actual_dispensed,
                 (SELECT COALESCE(SUM(tx.volume_l), 0)
                  FROM transactions tx
                  WHERE tx.nozzle_id = n.id
                    AND DATE(tx.transaction_time) = ?
                    AND tx.status = 'SUCCESS') as system_sales
          FROM totalizers t
          JOIN nozzles n ON n.id = t.nozzle_id
          JOIN products pr ON pr.id = n.product_id
          JOIN pumps pm ON pm.id = n.pump_id
          WHERE t.shift_date = ?
          ORDER BY pm.number, n.number`,
    args: [targetDate, targetDate],
  });
  res.json({ success: true, data: result.rows });
});

const totalizerSchema = z.object({
  nozzle_id:     z.string().min(1),
  opening_value: z.number().min(0),
  current_value: z.number().min(0),
  shift_date:    z.string(),
  shift:         z.enum(['PAGI','SIANG','MALAM']).default('PAGI'),
});

// POST /api/pumps/totalizers — controller pushes totalizer reading
router.post('/totalizers', validate(totalizerSchema), async (req: Request, res: Response): Promise<void> => {
  const b = req.body;
  const id = uuid();

  // Upsert totalizer for this nozzle+date+shift
  const existing = await db.execute({
    sql: `SELECT id FROM totalizers WHERE nozzle_id = ? AND shift_date = ? AND shift = ?`,
    args: [b.nozzle_id, b.shift_date, b.shift],
  });

  if (existing.rows[0]) {
    await db.execute({
      sql: `UPDATE totalizers SET current_value = ?, updated_at = datetime('now') WHERE id = ?`,
      args: [b.current_value, (existing.rows[0] as any).id],
    });
    res.json({ success: true, data: { id: (existing.rows[0] as any).id, updated: true } });
  } else {
    await db.execute({
      sql: `INSERT INTO totalizers(id,nozzle_id,opening_value,current_value,shift_date,shift)
            VALUES(?,?,?,?,?,?)`,
      args: [id, b.nozzle_id, b.opening_value, b.current_value, b.shift_date, b.shift],
    });
    res.status(201).json({ success: true, data: { id, updated: false } });
  }
});

// GET /api/pumps/reconciliation — totalizer vs system transactions
router.get('/reconciliation', authorize('transaction.view'), async (req: Request, res: Response): Promise<void> => {
  const { date } = req.query as Record<string, string>;
  const targetDate = date ?? new Date().toISOString().slice(0, 10);

  const result = await db.execute({
    sql: `SELECT
            n.id as nozzle_id, n.number as nozzle_number, pm.number as pump_number,
            pr.name as product_name,
            COALESCE(t.current_value - t.opening_value, 0) as totalizer_usage,
            COALESCE((
              SELECT SUM(tx.volume_l) FROM transactions tx
              WHERE tx.nozzle_id = n.id AND DATE(tx.transaction_time) = ? AND tx.status='SUCCESS'
            ), 0) as system_sales,
            COALESCE(t.current_value - t.opening_value, 0) -
            COALESCE((
              SELECT SUM(tx.volume_l) FROM transactions tx
              WHERE tx.nozzle_id = n.id AND DATE(tx.transaction_time) = ? AND tx.status='SUCCESS'
            ), 0) as variance_l
          FROM nozzles n
          JOIN pumps pm ON pm.id = n.pump_id
          JOIN products pr ON pr.id = n.product_id
          LEFT JOIN totalizers t ON t.nozzle_id = n.id AND t.shift_date = ?
          ORDER BY pm.number, n.number`,
    args: [targetDate, targetDate, targetDate],
  });
  res.json({ success: true, data: result.rows });
});

export default router;

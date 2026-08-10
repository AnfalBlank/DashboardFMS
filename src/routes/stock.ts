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

// GET /api/stock — current stock summary per product
router.get('/', authorize('stock.view'), async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT t.product_id, p.name as product_name, p.code,
                 SUM(t.capacity_l) as total_capacity,
                 SUM(t.current_l) as total_current,
                 MIN(t.status) as worst_status
          FROM tanks t JOIN products p ON p.id = t.product_id
          GROUP BY t.product_id, p.name, p.code
          ORDER BY p.name`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

// GET /api/stock/movements
router.get('/movements', authorize('stock.view'), async (req: Request, res: Response): Promise<void> => {
  const { product_id, from, to, limit = '50' } = req.query as Record<string, string>;
  let sql = `SELECT sm.*, p.name as product_name FROM stock_movements sm JOIN products p ON p.id = sm.product_id WHERE 1=1`;
  const args: (string | number)[] = [];
  if (product_id) { sql += ` AND sm.product_id = ?`; args.push(product_id); }
  if (from) { sql += ` AND sm.created_at >= ?`; args.push(from); }
  if (to)   { sql += ` AND sm.created_at <= ?`; args.push(to + ' 23:59:59'); }
  sql += ` ORDER BY sm.created_at DESC LIMIT ?`;
  args.push(Number(limit));
  const result = await db.execute({ sql, args });
  res.json({ success: true, data: result.rows });
});

// GET /api/stock/deliveries
router.get('/deliveries', authorize('stock.view'), async (req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT d.*, p.name as product_name, t.capacity_l as tank_capacity
          FROM deliveries d
          JOIN products p ON p.id = d.product_id
          LEFT JOIN tanks t ON t.id = d.tank_id
          ORDER BY d.created_at DESC LIMIT 100`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

const deliverySchema = z.object({
  date:         z.string().min(1),
  supplier:     z.string().min(1),
  product_id:   z.string().min(1),
  quantity_l:   z.number().positive(),
  tank_id:      z.string().optional(),
  doc_number:   z.string().optional(),
  delivery_note: z.string().optional(),
});

// POST /api/stock/deliveries
router.post('/deliveries', authorize('stock.view'), validate(deliverySchema), async (req: Request, res: Response): Promise<void> => {
  const b = req.body;
  const id = uuid();

  await db.execute({
    sql: `INSERT INTO deliveries(id,date,supplier,product_id,quantity_l,tank_id,doc_number,delivery_note,created_by)
          VALUES(?,?,?,?,?,?,?,?,?)`,
    args: [id, b.date, b.supplier, b.product_id, b.quantity_l, b.tank_id ?? null,
           b.doc_number ?? null, b.delivery_note ?? null, req.user!.userId],
  });

  // Update tank and record movement (status PENDING, confirmed later)
  if (b.tank_id) {
    await db.execute({
      sql: `UPDATE tanks SET current_l = current_l + ?, updated_at = datetime('now') WHERE id = ?`,
      args: [b.quantity_l, b.tank_id],
    });
    // Get new balance
    const tankRes = await db.execute({ sql: `SELECT current_l FROM tanks WHERE id = ?`, args: [b.tank_id] });
    const newBalance = Number((tankRes.rows[0] as any)?.current_l ?? 0);
    await db.execute({
      sql: `INSERT INTO stock_movements(id,product_id,tank_id,type,quantity_l,balance_l,ref_id,notes,created_by)
            VALUES(?,?,?,?,?,?,?,?,?)`,
      args: [uuid(), b.product_id, b.tank_id, 'DELIVERY', b.quantity_l, newBalance, id, b.delivery_note ?? null, req.user!.userId],
    });
    // Confirm delivery
    await db.execute({ sql: `UPDATE deliveries SET status='CONFIRMED', confirmed_by=?, confirmed_at=datetime('now') WHERE id=?`, args: [req.user!.userId, id] });
  }

  await logAudit(req.user!.userId, 'CREATE_DELIVERY', 'Stock', id, null, b, null, req.ip);
  res.status(201).json({ success: true, data: { id } });
});

const adjustSchema = z.object({
  product_id: z.string().min(1),
  tank_id:    z.string().optional(),
  delta_l:    z.number(),
  reason:     z.string().min(5),
});

// POST /api/stock/adjustment
router.post('/adjustment', authorize('stock.adjust'), validate(adjustSchema), async (req: Request, res: Response): Promise<void> => {
  const b = req.body;

  let newBalance = 0;
  if (b.tank_id) {
    await db.execute({
      sql: `UPDATE tanks SET current_l = MAX(0, current_l + ?), updated_at = datetime('now') WHERE id = ?`,
      args: [b.delta_l, b.tank_id],
    });
    const r = await db.execute({ sql: `SELECT current_l FROM tanks WHERE id = ?`, args: [b.tank_id] });
    newBalance = Number((r.rows[0] as any)?.current_l ?? 0);
  }

  const mvId = uuid();
  await db.execute({
    sql: `INSERT INTO stock_movements(id,product_id,tank_id,type,quantity_l,balance_l,notes,created_by)
          VALUES(?,?,?,?,?,?,?,?)`,
    args: [mvId, b.product_id, b.tank_id ?? null, 'ADJUSTMENT', b.delta_l, newBalance, b.reason, req.user!.userId],
  });

  await logAudit(req.user!.userId, 'STOCK_ADJUSTMENT', 'Stock', mvId, null,
    { delta: b.delta_l, reason: b.reason }, b.reason, req.ip);

  res.status(201).json({ success: true, data: { movement_id: mvId, new_balance_l: newBalance } });
});

export default router;

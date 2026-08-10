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

// GET /api/tanks
router.get('/', authorize('stock.view'), async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT t.*, p.name as product_name, p.code as product_code
          FROM tanks t JOIN products p ON p.id = t.product_id
          ORDER BY p.name`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

// GET /api/tanks/:id
router.get('/:id', authorize('stock.view'), async (req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT t.*, p.name as product_name FROM tanks t JOIN products p ON p.id = t.product_id WHERE t.id = ?`,
    args: [req.params.id],
  });
  if (!result.rows[0]) { res.status(404).json({ success: false, message: 'Tank tidak ditemukan' }); return; }
  res.json({ success: true, data: result.rows[0] });
});

// GET /api/tanks/:id/readings
router.get('/:id/readings', authorize('stock.view'), async (req: Request, res: Response): Promise<void> => {
  const { limit = '50' } = req.query as Record<string, string>;
  const result = await db.execute({
    sql: `SELECT * FROM tank_readings WHERE tank_id = ? ORDER BY read_at DESC LIMIT ?`,
    args: [req.params.id, Number(limit)],
  });
  res.json({ success: true, data: result.rows });
});

const readingSchema = z.object({
  volume_l:    z.number().min(0),
  height_cm:   z.number().optional(),
  water_level: z.number().optional(),
  temperature: z.number().optional(),
  source:      z.enum(['SENSOR', 'MANUAL']).default('SENSOR'),
  read_at:     z.string().optional(),
});

// POST /api/tanks/:id/readings  — accepts sensor pushes
router.post('/:id/readings', validate(readingSchema), async (req: Request, res: Response): Promise<void> => {
  const tank = (await db.execute({ sql: `SELECT * FROM tanks WHERE id = ?`, args: [req.params.id] })).rows[0] as any;
  if (!tank) { res.status(404).json({ success: false, message: 'Tank tidak ditemukan' }); return; }

  const b = req.body;
  const pct = (b.volume_l / toNum(tank.capacity_l, 1)) * 100;
  const thresholdCritical = toNum(tank.threshold_critical, 15);
  const thresholdLow      = toNum(tank.threshold_low, 30);
  const thresholdHigh     = toNum(tank.threshold_high, 90);

  const status = pct <= thresholdCritical ? 'CRITICAL'
    : pct <= thresholdLow  ? 'LOW'
    : pct >= thresholdHigh ? 'HIGH'
    : 'NORMAL';

  // Update tank current level
  await db.execute({
    sql: `UPDATE tanks SET current_l = ?, status = ?, last_reading_at = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [b.volume_l, status, b.read_at ?? new Date().toISOString(), req.params.id],
  });

  // Insert reading history
  const readingId = uuid();
  await db.execute({
    sql: `INSERT INTO tank_readings(id,tank_id,volume_l,height_cm,water_level,temperature,source,read_at,created_by)
          VALUES(?,?,?,?,?,?,?,?,?)`,
    args: [readingId, req.params.id, b.volume_l, b.height_cm ?? null, b.water_level ?? null,
           b.temperature ?? null, b.source, b.read_at ?? new Date().toISOString(),
           req.user?.userId ?? null],
  });

  // Generate notification if critical/low
  if (status === 'CRITICAL' || status === 'LOW') {
    await db.execute({
      sql: `INSERT INTO notifications(id,type,title,message,module,ref_id)
            VALUES(?,?,?,?,?,?)`,
      args: [uuid(), status === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
             `Stok ${tank.product_id} ${status}`,
             `Tank ${req.params.id} tersisa ${b.volume_l.toLocaleString()} L (${pct.toFixed(1)}%)`,
             'inventory', req.params.id],
    });
  }

  res.status(201).json({ success: true, data: { id: readingId, status, pct: Math.round(pct) } });
});

// PUT /api/tanks/:id — manual update (requires approval normally)
router.put('/:id', authorize('stock.adjust'), async (req: Request, res: Response): Promise<void> => {
  const { current_l, threshold_low, threshold_critical, threshold_high } = req.body;
  await db.execute({
    sql: `UPDATE tanks SET
          current_l = COALESCE(?, current_l),
          threshold_low = COALESCE(?, threshold_low),
          threshold_critical = COALESCE(?, threshold_critical),
          threshold_high = COALESCE(?, threshold_high),
          updated_at = datetime('now')
          WHERE id = ?`,
    args: [current_l ?? null, threshold_low ?? null, threshold_critical ?? null, threshold_high ?? null, req.params.id],
  });
  await logAudit(req.user!.userId, 'UPDATE_TANK', 'Tank', req.params.id, null, req.body, req.body.reason, req.ip);
  res.json({ success: true, message: 'Tank berhasil diperbarui' });
});

export default router;

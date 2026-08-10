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

// GET /api/cards
router.get('/', authorize('card.view'), async (req: Request, res: Response): Promise<void> => {
  const { search, status, unit, limit = '100', offset = '0' } = req.query as Record<string, string>;

  let sql = `
    SELECT c.*, u.name as unit_name, v.police_number, v.brand, v.model
    FROM cards c
    LEFT JOIN units u ON u.id = c.unit_id
    LEFT JOIN vehicles v ON v.id = c.vehicle_id
    WHERE 1=1`;
  const args: (string | number)[] = [];

  if (search) { sql += ` AND (c.card_number LIKE ? OR c.holder_name LIKE ?)`; args.push(`%${search}%`, `%${search}%`); }
  if (status) { sql += ` AND c.status = ?`; args.push(status); }
  if (unit)   { sql += ` AND c.unit_id = ?`; args.push(unit); }

  const countRes = await db.execute({ sql: `SELECT COUNT(*) as total FROM (${sql}) x`, args });
  const total = toNum((countRes.rows[0] as any)?.total);

  sql += ` ORDER BY c.card_number ASC LIMIT ? OFFSET ?`;
  args.push(Number(limit), Number(offset));

  const result = await db.execute({ sql, args });
  res.json({ success: true, data: result.rows, meta: { total } });
});

// GET /api/cards/:id
router.get('/:id', authorize('card.view'), async (req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT c.*, u.name as unit_name, v.police_number, v.brand, v.model, v.year
          FROM cards c
          LEFT JOIN units u ON u.id = c.unit_id
          LEFT JOIN vehicles v ON v.id = c.vehicle_id
          WHERE c.id = ? OR c.card_number = ?`,
    args: [req.params.id, req.params.id],
  });
  if (!result.rows[0]) { res.status(404).json({ success: false, message: 'Kartu tidak ditemukan' }); return; }
  res.json({ success: true, data: result.rows[0] });
});

// GET /api/cards/:id/transactions
router.get('/:id/transactions', authorize('transaction.view'), async (req: Request, res: Response): Promise<void> => {
  const { limit = '20', offset = '0' } = req.query as Record<string, string>;
  const result = await db.execute({
    sql: `SELECT t.*, p.name as product_name, n.number as nozzle_number, pm.number as pump_number
          FROM transactions t
          JOIN products p ON p.id = t.product_id
          LEFT JOIN nozzles n ON n.id = t.nozzle_id
          LEFT JOIN pumps pm ON pm.id = t.pump_id
          WHERE t.card_id = (SELECT id FROM cards WHERE id = ? OR card_number = ?)
          ORDER BY t.transaction_time DESC LIMIT ? OFFSET ?`,
    args: [req.params.id, req.params.id, Number(limit), Number(offset)],
  });
  res.json({ success: true, data: result.rows });
});

// GET /api/cards/:id/quota
router.get('/:id/quota', authorize('quota.view'), async (req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT cq.*, qp.period, qp.year, qp.month, qp.status as period_status,
                 p.name as product_name
          FROM card_quotas cq
          JOIN quota_periods qp ON qp.id = cq.period_id
          JOIN products p ON p.id = cq.product_id
          WHERE cq.card_id = (SELECT id FROM cards WHERE id = ? OR card_number = ?)
          ORDER BY qp.year DESC, qp.month DESC`,
    args: [req.params.id, req.params.id],
  });
  res.json({ success: true, data: result.rows });
});

const createCardSchema = z.object({
  card_number:     z.string().min(1),
  card_type:       z.enum(['REGULER','KHUSUS']).default('REGULER'),
  holder_name:     z.string().min(1),
  unit_id:         z.string().optional(),
  vehicle_id:      z.string().optional(),
  fuel_type:       z.string().optional(),
  monthly_limit:   z.number().positive().default(200),
  expiry_date:     z.string().optional(),
  activation_date: z.string().optional(),
  rfid_uid:        z.string().optional(),
  notes:           z.string().optional(),
});

// POST /api/cards
router.post('/', authorize('card.create'), validate(createCardSchema), async (req: Request, res: Response): Promise<void> => {
  const id = uuid();
  const b = req.body;
  await db.execute({
    sql: `INSERT INTO cards(id,card_number,card_type,holder_name,unit_id,vehicle_id,fuel_type,monthly_limit,expiry_date,activation_date,rfid_uid,notes)
          VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, b.card_number, b.card_type, b.holder_name, b.unit_id ?? null,
           b.vehicle_id ?? null, b.fuel_type ?? null, b.monthly_limit,
           b.expiry_date ?? null, b.activation_date ?? null, b.rfid_uid ?? null, b.notes ?? null],
  });
  await logAudit(req.user!.userId, 'CREATE_CARD', 'Card', id, null, b, null, req.ip);
  res.status(201).json({ success: true, data: { id } });
});

// PUT /api/cards/:id
router.put('/:id', authorize('card.edit'), async (req: Request, res: Response): Promise<void> => {
  const before = (await db.execute({ sql: `SELECT * FROM cards WHERE id = ?`, args: [req.params.id] })).rows[0];
  if (!before) { res.status(404).json({ success: false, message: 'Kartu tidak ditemukan' }); return; }
  const { holder_name, unit_id, vehicle_id, fuel_type, monthly_limit, notes } = req.body;
  await db.execute({
    sql: `UPDATE cards SET holder_name=COALESCE(?,holder_name), unit_id=COALESCE(?,unit_id),
          vehicle_id=COALESCE(?,vehicle_id), fuel_type=COALESCE(?,fuel_type),
          monthly_limit=COALESCE(?,monthly_limit), notes=COALESCE(?,notes), updated_at=datetime('now')
          WHERE id=?`,
    args: [holder_name ?? null, unit_id ?? null, vehicle_id ?? null, fuel_type ?? null, monthly_limit ?? null, notes ?? null, req.params.id],
  });
  await logAudit(req.user!.userId, 'UPDATE_CARD', 'Card', req.params.id, before, req.body, null, req.ip);
  res.json({ success: true, message: 'Kartu berhasil diperbarui' });
});

// POST /api/cards/:id/block
router.post('/:id/block', authorize('card.block'), async (req: Request, res: Response): Promise<void> => {
  const { reason } = req.body;
  const before = (await db.execute({ sql: `SELECT * FROM cards WHERE id = ?`, args: [req.params.id] })).rows[0] as any;
  if (!before) { res.status(404).json({ success: false, message: 'Kartu tidak ditemukan' }); return; }
  await db.execute({
    sql: `UPDATE cards SET status='BLOCKED', updated_at=datetime('now') WHERE id=?`,
    args: [req.params.id],
  });
  await logAudit(req.user!.userId, 'BLOCK_CARD', 'Card', req.params.id, { status: before.status }, { status: 'BLOCKED' }, reason, req.ip);
  res.json({ success: true, message: 'Kartu berhasil diblokir' });
});

// POST /api/cards/:id/unblock
router.post('/:id/unblock', authorize('card.block'), async (req: Request, res: Response): Promise<void> => {
  const { reason } = req.body;
  await db.execute({
    sql: `UPDATE cards SET status='ACTIVE', updated_at=datetime('now') WHERE id=?`,
    args: [req.params.id],
  });
  await logAudit(req.user!.userId, 'UNBLOCK_CARD', 'Card', req.params.id, { status: 'BLOCKED' }, { status: 'ACTIVE' }, reason, req.ip);
  res.json({ success: true, message: 'Kartu berhasil diaktifkan' });
});

export default router;

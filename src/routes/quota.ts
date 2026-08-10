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

// GET /api/quota — list all card quotas for active period
router.get('/', authorize('quota.view'), async (req: Request, res: Response): Promise<void> => {
  const { period_id, card_id, unit_id } = req.query as Record<string, string>;

  let sql = `
    SELECT cq.*, c.card_number, c.holder_name, c.unit_id, c.fuel_type,
           u.name as unit_name, p.name as product_name,
           qp.period, qp.year, qp.month
    FROM card_quotas cq
    JOIN cards c ON c.id = cq.card_id
    JOIN quota_periods qp ON qp.id = cq.period_id
    JOIN products p ON p.id = cq.product_id
    LEFT JOIN units u ON u.id = c.unit_id
    WHERE 1=1`;
  const args: (string | number)[] = [];

  if (period_id) { sql += ` AND cq.period_id = ?`; args.push(period_id); }
  else           { sql += ` AND qp.status = 'ACTIVE'`; }
  if (card_id)   { sql += ` AND cq.card_id = ?`; args.push(card_id); }
  if (unit_id)   { sql += ` AND c.unit_id = ?`; args.push(unit_id); }

  sql += ` ORDER BY c.card_number ASC`;
  const result = await db.execute({ sql, args });
  res.json({ success: true, data: result.rows });
});

// GET /api/quota/periods — list all periods
router.get('/periods', authorize('quota.view'), async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({ sql: `SELECT * FROM quota_periods ORDER BY year DESC, month DESC`, args: [] });
  res.json({ success: true, data: result.rows });
});

// GET /api/quota/ledger/:cardId — quota ledger for a card
router.get('/ledger/:cardId', authorize('quota.view'), async (req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT ql.*, qp.period
          FROM quota_ledger ql
          JOIN card_quotas cq ON cq.id = ql.quota_id
          JOIN quota_periods qp ON qp.id = cq.period_id
          WHERE ql.card_id = ?
          ORDER BY ql.created_at DESC LIMIT 50`,
    args: [req.params.cardId],
  });
  res.json({ success: true, data: result.rows });
});

const generateSchema = z.object({
  period:      z.string().min(1),
  year:        z.number().int(),
  month:       z.number().int().min(1).max(12),
  product_id:  z.string().min(1),
  default_l:   z.number().positive(),
  scope:       z.enum(['all', 'unit', 'custom']).default('all'),
  unit_id:     z.string().optional(),
  card_ids:    z.array(z.string()).optional(),
});

// POST /api/quota/generate — bulk generate
router.post('/generate', authorize('quota.generate'), validate(generateSchema), async (req: Request, res: Response): Promise<void> => {
  const b = req.body;

  // Create or get period
  let periodId: string;
  const existPeriod = await db.execute({
    sql: `SELECT id FROM quota_periods WHERE year = ? AND month = ?`,
    args: [b.year, b.month],
  });
  if (existPeriod.rows[0]) {
    periodId = (existPeriod.rows[0] as any).id;
  } else {
    periodId = uuid();
    await db.execute({
      sql: `INSERT INTO quota_periods(id,period,year,month,status) VALUES(?,?,?,?,?)`,
      args: [periodId, b.period, b.year, b.month, 'ACTIVE'],
    });
  }

  // Determine target cards
  let cardSql = `SELECT id FROM cards WHERE status = 'ACTIVE'`;
  const cardArgs: string[] = [];
  if (b.scope === 'unit' && b.unit_id) { cardSql += ` AND unit_id = ?`; cardArgs.push(b.unit_id); }
  if (b.scope === 'custom' && b.card_ids?.length) {
    const ph = b.card_ids.map(() => '?').join(',');
    cardSql += ` AND id IN (${ph})`;
    cardArgs.push(...b.card_ids);
  }
  const cardsResult = await db.execute({ sql: cardSql, args: cardArgs });
  const cardIds = cardsResult.rows.map((r: any) => r.id as string);

  let created = 0;
  for (const cardId of cardIds) {
    const qId = uuid();
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO card_quotas(id,card_id,period_id,product_id,allocated_l,used_l,remaining_l)
              VALUES(?,?,?,?,?,0,?)`,
        args: [qId, cardId, periodId, b.product_id, b.default_l, b.default_l],
      });
      await db.execute({
        sql: `INSERT INTO quota_ledger(id,quota_id,card_id,type,amount_l,balance_l,description,created_by)
              VALUES(?,?,?,?,?,?,?,?)`,
        args: [uuid(), qId, cardId, 'ALLOCATION', b.default_l, b.default_l, `Monthly Allocation ${b.period}`, req.user!.userId],
      });
      created++;
    } catch { /* skip duplicates */ }
  }

  await logAudit(req.user!.userId, 'GENERATE_QUOTA', 'Quota', periodId, null,
    { period: b.period, cards: created, default_l: b.default_l }, null, req.ip);

  res.status(201).json({
    success: true,
    data: { period_id: periodId, cards_processed: cardIds.length, quotas_created: created, total_l: created * b.default_l },
  });
});

const topupSchema = z.object({
  card_id:    z.string().min(1),
  product_id: z.string().min(1),
  amount_l:   z.number().positive(),
  reason:     z.string().min(1),
});

// POST /api/quota/topup
router.post('/topup', authorize('quota.topup'), validate(topupSchema), async (req: Request, res: Response): Promise<void> => {
  const b = req.body;

  const quotaRes = await db.execute({
    sql: `SELECT cq.* FROM card_quotas cq
          JOIN quota_periods qp ON qp.id = cq.period_id
          WHERE cq.card_id = ? AND cq.product_id = ? AND qp.status = 'ACTIVE' LIMIT 1`,
    args: [b.card_id, b.product_id],
  });
  const quota = quotaRes.rows[0] as any;
  if (!quota) { res.status(404).json({ success: false, message: 'Kuota tidak ditemukan untuk periode aktif' }); return; }

  const newRemaining = toNum(quota.remaining_l) + b.amount_l;
  await db.execute({
    sql: `UPDATE card_quotas SET remaining_l = ?, topup_l = topup_l + ?, allocated_l = allocated_l + ?, updated_at = datetime('now') WHERE id = ?`,
    args: [newRemaining, b.amount_l, b.amount_l, quota.id],
  });
  await db.execute({
    sql: `INSERT INTO quota_ledger(id,quota_id,card_id,type,amount_l,balance_l,description,created_by)
          VALUES(?,?,?,?,?,?,?,?)`,
    args: [uuid(), quota.id, b.card_id, 'TOPUP', b.amount_l, newRemaining, `Top Up: ${b.reason}`, req.user!.userId],
  });

  await logAudit(req.user!.userId, 'TOPUP_QUOTA', 'Quota', quota.id,
    { remaining_l: quota.remaining_l }, { remaining_l: newRemaining, topup: b.amount_l }, b.reason, req.ip);

  res.json({ success: true, data: { quota_id: quota.id, new_remaining_l: newRemaining } });
});

export default router;

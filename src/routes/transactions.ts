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

// ── Helper: get active price ──
async function getActivePrice(productId: string): Promise<number> {
  const r = await db.execute({
    sql: `SELECT price_per_unit FROM price_histories
          WHERE product_id = ? ORDER BY effective_date DESC LIMIT 1`,
    args: [productId],
  });
  return Number((r.rows[0] as any)?.price_per_unit ?? 0);
}

// GET /api/transactions
router.get('/', authorize('transaction.view'), async (req: Request, res: Response): Promise<void> => {
  const { card, unit, product, status, from, to, limit = '50', offset = '0' } = req.query as Record<string, string>;

  let sql = `
    SELECT t.*, c.card_number, c.holder_name, c.unit_id,
           p.name as product_name, n.number as nozzle_number,
           pm.number as pump_number, u.name as unit_name
    FROM transactions t
    JOIN cards c ON c.id = t.card_id
    JOIN products p ON p.id = t.product_id
    LEFT JOIN nozzles n ON n.id = t.nozzle_id
    LEFT JOIN pumps pm ON pm.id = t.pump_id
    LEFT JOIN units u ON u.id = c.unit_id
    WHERE 1=1`;
  const args: (string | number)[] = [];

  if (card)    { sql += ` AND (c.card_number LIKE ? OR c.holder_name LIKE ?)`; args.push(`%${card}%`, `%${card}%`); }
  if (unit)    { sql += ` AND c.unit_id = ?`; args.push(unit); }
  if (product) { sql += ` AND t.product_id = ?`; args.push(product); }
  if (status)  { sql += ` AND t.status = ?`; args.push(status); }
  if (from)    { sql += ` AND t.transaction_time >= ?`; args.push(from); }
  if (to)      { sql += ` AND t.transaction_time <= ?`; args.push(to + ' 23:59:59'); }

  // Count
  const countResult = await db.execute({ sql: `SELECT COUNT(*) as total FROM (${sql}) x`, args });
  const total = toNum((countResult.rows[0] as any)?.total);

  sql += ` ORDER BY t.transaction_time DESC LIMIT ? OFFSET ?`;
  args.push(Number(limit), Number(offset));

  const result = await db.execute({ sql, args });
  res.json({ success: true, data: result.rows, meta: { total, limit: Number(limit), offset: Number(offset) } });
});

// GET /api/transactions/:id
router.get('/:id', authorize('transaction.view'), async (req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT t.*, c.card_number, c.holder_name, c.unit_id,
                 p.name as product_name, n.number as nozzle_number,
                 pm.number as pump_number, u.name as unit_name,
                 v.police_number
          FROM transactions t
          JOIN cards c ON c.id = t.card_id
          JOIN products p ON p.id = t.product_id
          LEFT JOIN nozzles n ON n.id = t.nozzle_id
          LEFT JOIN pumps pm ON pm.id = t.pump_id
          LEFT JOIN units u ON u.id = c.unit_id
          LEFT JOIN vehicles v ON v.id = c.vehicle_id
          WHERE t.id = ?`,
    args: [req.params.id],
  });
  if (!result.rows[0]) { res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' }); return; }
  res.json({ success: true, data: result.rows[0] });
});

const createTrxSchema = z.object({
  card_number:      z.string().min(1),
  product_id:       z.string().min(1),
  nozzle_id:        z.string().optional(),
  pump_id:          z.string().optional(),
  volume_l:         z.number().positive(),
  shift:            z.enum(['PAGI','SIANG','MALAM']).default('PAGI'),
  totalizer_before: z.number().optional(),
  totalizer_after:  z.number().optional(),
  source:           z.enum(['CONTROLLER','MANUAL','API']).default('MANUAL'),
  transaction_time: z.string().optional(),
});

// POST /api/transactions  (controller pushes here, or manual)
router.post('/', authorize('transaction.create'), validate(createTrxSchema), async (req: Request, res: Response): Promise<void> => {
  const body = req.body;

  // 1. Find card
  const cardRes = await db.execute({ sql: `SELECT * FROM cards WHERE card_number = ?`, args: [body.card_number] });
  const card = cardRes.rows[0] as any;
  if (!card) { res.status(404).json({ success: false, message: 'Kartu tidak ditemukan' }); return; }
  if (card.status !== 'ACTIVE') { res.status(400).json({ success: false, message: `Kartu berstatus ${card.status}` }); return; }

  // 2. Find active quota
  const quotaRes = await db.execute({
    sql: `SELECT cq.* FROM card_quotas cq
          JOIN quota_periods qp ON qp.id = cq.period_id
          WHERE cq.card_id = ? AND cq.product_id = ? AND qp.status = 'ACTIVE'
          LIMIT 1`,
    args: [card.id, body.product_id],
  });
  const quota = quotaRes.rows[0] as any;

  // 3. Check quota sufficiency
  let quotaBefore = 0, quotaDeducted = 0, quotaAfter = 0;
  let txStatus: string = 'SUCCESS';

  if (quota) {
    quotaBefore = toNum(quota.remaining_l);
    const setting = await db.execute({ sql: `SELECT value FROM system_settings WHERE key = 'quota_overflow'`, args: [] });
    const policy = (setting.rows[0] as any)?.value ?? 'reject';

    if (body.volume_l > quotaBefore) {
      if (policy === 'reject') {
        res.status(400).json({
          success: false,
          message: `Kuota tidak cukup. Sisa: ${quotaBefore} L, Diminta: ${body.volume_l} L`,
        });
        return;
      }
    }
    quotaDeducted = Math.min(body.volume_l, quotaBefore);
    quotaAfter    = Math.max(0, quotaBefore - body.volume_l);
    txStatus      = 'SUCCESS';
  }

  // 4. Get active price
  const price = await getActivePrice(body.product_id);
  const total  = price * body.volume_l;

  // 5. Insert transaction
  const txId = uuid();
  await db.execute({
    sql: `INSERT INTO transactions
          (id,card_id,product_id,nozzle_id,pump_id,operator_id,shift,volume_l,price_per_unit,total_amount,
           totalizer_before,totalizer_after,quota_before,quota_deducted,quota_after,status,source,transaction_time)
          VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      txId, card.id, body.product_id, body.nozzle_id ?? null, body.pump_id ?? null,
      req.user!.userId, body.shift, body.volume_l, price, total,
      body.totalizer_before ?? null, body.totalizer_after ?? null,
      quotaBefore, quotaDeducted, quotaAfter,
      txStatus, body.source,
      body.transaction_time ?? new Date().toISOString(),
    ],
  });

  // 6. Deduct quota if success
  if (txStatus === 'SUCCESS' && quota) {
    await db.execute({
      sql: `UPDATE card_quotas SET used_l = used_l + ?, remaining_l = remaining_l - ?, updated_at = datetime('now') WHERE id = ?`,
      args: [quotaDeducted, quotaDeducted, quota.id],
    });
    await db.execute({
      sql: `INSERT INTO quota_ledger(id,quota_id,card_id,type,amount_l,balance_l,ref_id,description,created_by)
            VALUES(?,?,?,?,?,?,?,?,?)`,
      args: [uuid(), quota.id, card.id, 'DEDUCTION', -quotaDeducted, quotaAfter, txId, 'Fuel Transaction', req.user!.userId],
    });
    // Update tank stock
    await db.execute({
      sql: `UPDATE tanks SET current_l = MAX(0, current_l - ?), updated_at = datetime('now')
            WHERE product_id = ?`,
      args: [body.volume_l, body.product_id],
    });
  }

  await logAudit(req.user!.userId, 'CREATE_TRANSACTION', 'Transaction', txId, null, { volume: body.volume_l }, null, req.ip);

  res.status(201).json({ success: true, data: { id: txId, status: txStatus, quota_after: quotaAfter } });
});

// POST /api/transactions/:id/void
router.post('/:id/void', authorize('transaction.void'), async (req: Request, res: Response): Promise<void> => {
  const { reason } = req.body;
  if (!reason) { res.status(400).json({ success: false, message: 'Alasan void wajib diisi' }); return; }

  const txRes = await db.execute({ sql: `SELECT * FROM transactions WHERE id = ?`, args: [req.params.id] });
  const tx = txRes.rows[0] as any;
  if (!tx) { res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' }); return; }
  if (tx.status !== 'SUCCESS') { res.status(400).json({ success: false, message: 'Hanya transaksi SUCCESS yang bisa di-VOID' }); return; }

  await db.execute({
    sql: `UPDATE transactions SET status='VOID', void_reason=?, voided_by=?, voided_at=datetime('now') WHERE id=?`,
    args: [reason, req.user!.userId, req.params.id],
  });

  // Reverse quota
  if (tx.quota_deducted > 0) {
    const quotaRes = await db.execute({
      sql: `SELECT cq.* FROM card_quotas cq
            JOIN quota_periods qp ON qp.id = cq.period_id
            WHERE cq.card_id = ? AND cq.product_id = ? AND qp.status = 'ACTIVE' LIMIT 1`,
      args: [tx.card_id, tx.product_id],
    });
    const quota = quotaRes.rows[0] as any;
    if (quota) {
      await db.execute({
        sql: `UPDATE card_quotas SET used_l = used_l - ?, remaining_l = remaining_l + ?, updated_at = datetime('now') WHERE id = ?`,
        args: [tx.quota_deducted, tx.quota_deducted, quota.id],
      });
      await db.execute({
        sql: `INSERT INTO quota_ledger(id,quota_id,card_id,type,amount_l,balance_l,ref_id,description,created_by)
              VALUES(?,?,?,?,?,?,?,?,?)`,
        args: [uuid(), quota.id, tx.card_id, 'REVERSAL', tx.quota_deducted,
               toNum(quota.remaining_l) + toNum(tx.quota_deducted),
               req.params.id, `VOID: ${reason}`, req.user!.userId],
      });
    }
  }

  await logAudit(req.user!.userId, 'VOID_TRANSACTION', 'Transaction', req.params.id, { status: 'SUCCESS' }, { status: 'VOID', reason }, reason, req.ip);
  res.json({ success: true, message: 'Transaksi berhasil di-void' });
});

export default router;

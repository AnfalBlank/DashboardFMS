import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { authenticate, authorize } from '../middleware/auth';
import { logAudit } from '../middleware/audit';
import { toNum } from '../utils/db';



const router = Router();
router.use(authenticate);

// ── Audit Log ──
router.get('/audit', authorize('audit.view'), async (req: Request, res: Response): Promise<void> => {
  const { module, user_id, from, to, limit = '100', offset = '0' } = req.query as Record<string, string>;
  let sql = `SELECT al.*, u.username, u.name as user_name
             FROM audit_logs al LEFT JOIN users u ON u.id = al.user_id WHERE 1=1`;
  const args: (string | number)[] = [];
  if (module)  { sql += ` AND al.module = ?`;          args.push(module); }
  if (user_id) { sql += ` AND al.user_id = ?`;         args.push(user_id); }
  if (from)    { sql += ` AND al.created_at >= ?`;     args.push(from); }
  if (to)      { sql += ` AND al.created_at <= ?`;     args.push(to + ' 23:59:59'); }
  const countRes = await db.execute({ sql: `SELECT COUNT(*) as total FROM (${sql}) x`, args });
  const total = toNum((countRes.rows[0] as any)?.total);
  sql += ` ORDER BY al.created_at DESC LIMIT ? OFFSET ?`;
  args.push(Number(limit), Number(offset));
  const result = await db.execute({ sql, args });
  res.json({ success: true, data: result.rows, meta: { total } });
});

// ── Approvals ──
router.get('/approvals', authorize('quota.approve'), async (req: Request, res: Response): Promise<void> => {
  const { status = 'PENDING' } = req.query as Record<string, string>;
  const result = await db.execute({
    sql: `SELECT a.*, u.username as requested_by_name, r.username as reviewed_by_name
          FROM approvals a
          JOIN users u ON u.id = a.requested_by
          LEFT JOIN users r ON r.id = a.reviewed_by
          WHERE a.status = ? ORDER BY a.requested_at DESC`,
    args: [status],
  });
  res.json({ success: true, data: result.rows });
});

router.post('/approvals/:id/approve', authorize('quota.approve'), async (req: Request, res: Response): Promise<void> => {
  const { note } = req.body;
  const apvRes = await db.execute({ sql: `SELECT * FROM approvals WHERE id = ?`, args: [req.params.id] });
  const apv = apvRes.rows[0] as any;
  if (!apv) { res.status(404).json({ success: false, message: 'Approval request tidak ditemukan' }); return; }

  await db.execute({
    sql: `UPDATE approvals SET status='APPROVED', reviewed_by=?, review_note=?, reviewed_at=datetime('now') WHERE id=?`,
    args: [req.user!.userId, note ?? null, req.params.id],
  });
  await logAudit(req.user!.userId, 'APPROVE', 'Approval', req.params.id, { status: 'PENDING' }, { status: 'APPROVED' }, note, req.ip);
  res.json({ success: true, message: 'Disetujui' });
});

router.post('/approvals/:id/reject', authorize('quota.approve'), async (req: Request, res: Response): Promise<void> => {
  const { note } = req.body;
  if (!note) { res.status(400).json({ success: false, message: 'Alasan penolakan wajib diisi' }); return; }
  await db.execute({
    sql: `UPDATE approvals SET status='REJECTED', reviewed_by=?, review_note=?, reviewed_at=datetime('now') WHERE id=?`,
    args: [req.user!.userId, note, req.params.id],
  });
  await logAudit(req.user!.userId, 'REJECT', 'Approval', req.params.id, { status: 'PENDING' }, { status: 'REJECTED' }, note, req.ip);
  res.json({ success: true, message: 'Ditolak' });
});

// ── System Settings ──
router.get('/settings', authorize('system.manage'), async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({ sql: `SELECT * FROM system_settings ORDER BY key`, args: [] });
  // Convert array to object
  const settings: Record<string, string> = {};
  for (const row of result.rows as any[]) settings[row.key] = row.value;
  res.json({ success: true, data: settings });
});

router.put('/settings', authorize('system.manage'), async (req: Request, res: Response): Promise<void> => {
  const updates = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(updates)) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO system_settings(key,value,updated_by,updated_at) VALUES(?,?,?,datetime('now'))`,
      args: [key, String(value), req.user!.userId],
    });
  }
  await logAudit(req.user!.userId, 'UPDATE_SETTINGS', 'System', 'system_settings', null, updates, null, req.ip);
  res.json({ success: true, message: 'Pengaturan disimpan' });
});

// ── Notifications ──
router.get('/notifications', async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

router.put('/notifications/read-all', async (req: Request, res: Response): Promise<void> => {
  await db.execute({ sql: `UPDATE notifications SET read = 1`, args: [] });
  res.json({ success: true });
});

// ── Integration Monitor ──
router.get('/integration', authorize('system.manage'), async (_req: Request, res: Response): Promise<void> => {
  const [trxRes, todayRes] = await Promise.all([
    db.execute({ sql: `SELECT COUNT(*) as total, SUM(CASE WHEN synced=1 THEN 1 ELSE 0 END) as synced FROM transactions`, args: [] }),
    db.execute({ sql: `SELECT COUNT(*) as today FROM transactions WHERE DATE(created_at) = DATE('now')`, args: [] }),
  ]);
  res.json({
    success: true,
    data: {
      total_received:  (trxRes.rows[0] as any)?.total ?? 0,
      synced:          (trxRes.rows[0] as any)?.synced ?? 0,
      pending:         0,
      failed:          0,
      today:           (todayRes.rows[0] as any)?.today ?? 0,
      last_sync:       new Date().toISOString(),
    },
  });
});

export default router;

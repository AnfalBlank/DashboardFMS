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

// ══════════════ PRODUCTS ══════════════

router.get('/products', async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT p.*,
          (SELECT ph.price_per_unit FROM price_histories ph
           WHERE ph.product_id = p.id
           ORDER BY ph.effective_date DESC LIMIT 1) as current_price
          FROM products p ORDER BY p.name`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

router.post('/products', authorize('system.manage'), async (req: Request, res: Response): Promise<void> => {
  const { code, name, type, unit = 'Liter' } = req.body;
  if (!code || !name || !type) { res.status(400).json({ success: false, message: 'code, name, type wajib diisi' }); return; }
  const id = uuid();
  await db.execute({ sql: `INSERT INTO products(id,code,name,type,unit) VALUES(?,?,?,?,?)`, args: [id, code, name, type, unit] });
  await logAudit(req.user!.userId, 'CREATE_PRODUCT', 'Master', id, null, req.body, null, req.ip);
  res.status(201).json({ success: true, data: { id } });
});

// ══════════════ PRICES ══════════════

router.get('/prices', async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT ph.*, p.name as product_name, p.code
          FROM price_histories ph JOIN products p ON p.id = ph.product_id
          ORDER BY p.name, ph.effective_date DESC`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

const priceSchema = z.object({
  product_id:     z.string().min(1),
  price_per_unit: z.number().positive(),
  effective_date: z.string().min(1),
});

router.post('/prices', authorize('system.manage'), validate(priceSchema), async (req: Request, res: Response): Promise<void> => {
  const b = req.body;
  const id = uuid();
  // Get previous price for audit
  const prev = await db.execute({
    sql: `SELECT price_per_unit FROM price_histories WHERE product_id = ? ORDER BY effective_date DESC LIMIT 1`,
    args: [b.product_id],
  });
  await db.execute({
    sql: `INSERT INTO price_histories(id,product_id,price_per_unit,effective_date,created_by) VALUES(?,?,?,?,?)`,
    args: [id, b.product_id, b.price_per_unit, b.effective_date, req.user!.userId],
  });
  await logAudit(req.user!.userId, 'PRICE_CHANGE', 'Master', b.product_id,
    { price: (prev.rows[0] as any)?.price_per_unit }, { price: b.price_per_unit, effective: b.effective_date }, null, req.ip);
  res.status(201).json({ success: true, data: { id } });
});

// ══════════════ VEHICLES ══════════════

router.get('/vehicles', authorize('card.view'), async (req: Request, res: Response): Promise<void> => {
  const { unit_id } = req.query as Record<string, string>;
  let sql = `SELECT v.*, u.name as unit_name FROM vehicles v LEFT JOIN units u ON u.id = v.unit_id WHERE 1=1`;
  const args: string[] = [];
  if (unit_id) { sql += ` AND v.unit_id = ?`; args.push(unit_id); }
  sql += ` ORDER BY v.police_number`;
  const result = await db.execute({ sql, args });
  res.json({ success: true, data: result.rows });
});

const vehicleSchema = z.object({
  police_number: z.string().min(1),
  type:          z.string().optional(),
  brand:         z.string().optional(),
  model:         z.string().optional(),
  year:          z.number().optional(),
  unit_id:       z.string().optional(),
  fuel_type:     z.string().optional(),
  notes:         z.string().optional(),
});

router.post('/vehicles', authorize('card.create'), validate(vehicleSchema), async (req: Request, res: Response): Promise<void> => {
  const b = req.body;
  const id = uuid();
  await db.execute({
    sql: `INSERT INTO vehicles(id,police_number,type,brand,model,year,unit_id,fuel_type,notes) VALUES(?,?,?,?,?,?,?,?,?)`,
    args: [id, b.police_number, b.type ?? null, b.brand ?? null, b.model ?? null,
           b.year ?? null, b.unit_id ?? null, b.fuel_type ?? null, b.notes ?? null],
  });
  await logAudit(req.user!.userId, 'CREATE_VEHICLE', 'Master', id, null, b, null, req.ip);
  res.status(201).json({ success: true, data: { id } });
});

router.put('/vehicles/:id', authorize('card.edit'), async (req: Request, res: Response): Promise<void> => {
  const { type, brand, model, year, unit_id, fuel_type, status, notes } = req.body;
  await db.execute({
    sql: `UPDATE vehicles SET
          type=COALESCE(?,type), brand=COALESCE(?,brand), model=COALESCE(?,model),
          year=COALESCE(?,year), unit_id=COALESCE(?,unit_id), fuel_type=COALESCE(?,fuel_type),
          status=COALESCE(?,status), notes=COALESCE(?,notes)
          WHERE id=?`,
    args: [type ?? null, brand ?? null, model ?? null, year ?? null, unit_id ?? null,
           fuel_type ?? null, status ?? null, notes ?? null, req.params.id],
  });
  await logAudit(req.user!.userId, 'UPDATE_VEHICLE', 'Master', req.params.id, null, req.body, null, req.ip);
  res.json({ success: true, message: 'Kendaraan diperbarui' });
});

// ══════════════ UNITS ══════════════

router.get('/units', async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT u.*,
          (SELECT COUNT(*) FROM cards c WHERE c.unit_id = u.id AND c.status='ACTIVE') as active_cards,
          (SELECT COUNT(*) FROM vehicles v WHERE v.unit_id = u.id AND v.status='ACTIVE') as active_vehicles
          FROM units u ORDER BY u.name`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

const unitSchema = z.object({
  code:            z.string().min(1),
  name:            z.string().min(1),
  parent_id:       z.string().optional(),
  commander:       z.string().optional(),
  default_alloc_l: z.number().positive().default(200),
});

router.post('/units', authorize('system.manage'), validate(unitSchema), async (req: Request, res: Response): Promise<void> => {
  const b = req.body;
  const id = uuid();
  await db.execute({
    sql: `INSERT INTO units(id,code,name,parent_id,commander,default_alloc_l) VALUES(?,?,?,?,?,?)`,
    args: [id, b.code, b.name, b.parent_id ?? null, b.commander ?? null, b.default_alloc_l],
  });
  await logAudit(req.user!.userId, 'CREATE_UNIT', 'Master', id, null, b, null, req.ip);
  res.status(201).json({ success: true, data: { id } });
});

router.put('/units/:id', authorize('system.manage'), async (req: Request, res: Response): Promise<void> => {
  const { name, commander, default_alloc_l, status } = req.body;
  await db.execute({
    sql: `UPDATE units SET name=COALESCE(?,name), commander=COALESCE(?,commander),
          default_alloc_l=COALESCE(?,default_alloc_l), status=COALESCE(?,status) WHERE id=?`,
    args: [name ?? null, commander ?? null, default_alloc_l ?? null, status ?? null, req.params.id],
  });
  await logAudit(req.user!.userId, 'UPDATE_UNIT', 'Master', req.params.id, null, req.body, null, req.ip);
  res.json({ success: true, message: 'Unit diperbarui' });
});

// ══════════════ USERS ══════════════

router.get('/users', authorize('user.manage'), async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT u.id, u.name, u.username, u.email, r.name as role, u.unit_id,
                 un.name as unit_name, u.status, u.last_login, u.created_at
          FROM users u
          JOIN roles r ON r.id = u.role_id
          LEFT JOIN units un ON un.id = u.unit_id
          ORDER BY u.name`,
    args: [],
  });
  res.json({ success: true, data: result.rows });
});

// ══════════════ ROLES ══════════════

router.get('/roles', authorize('user.manage'), async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({ sql: `SELECT * FROM roles ORDER BY name`, args: [] });
  res.json({ success: true, data: result.rows });
});

router.get('/permissions', authorize('user.manage'), async (_req: Request, res: Response): Promise<void> => {
  const result = await db.execute({ sql: `SELECT * FROM permissions ORDER BY module, action`, args: [] });
  res.json({ success: true, data: result.rows });
});

export default router;

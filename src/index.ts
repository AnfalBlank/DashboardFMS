import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import { testConnection } from './db/client';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRouter           from './routes/auth';
import dashboardRouter      from './routes/dashboard';
import transactionsRouter   from './routes/transactions';
import cardsRouter          from './routes/cards';
import quotaRouter          from './routes/quota';
import tanksRouter          from './routes/tanks';
import stockRouter          from './routes/stock';
import pumpsRouter          from './routes/pumps';
import reconciliationRouter from './routes/reconciliation';
import reportsRouter        from './routes/reports';
import masterRouter         from './routes/master';
import systemRouter         from './routes/system';

// ── Keep process alive ──
process.on('unhandledRejection', (reason) => console.error('[UnhandledRejection]', reason));
process.on('uncaughtException',  (err)    => console.error('[UncaughtException]', err.message));

const app  = express();
const PORT = Number(process.env.PORT ?? 4000);

// ── Security middleware ──
app.use(helmet());
app.use(cors({
  origin:      process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use('/api/', rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000),
  max:      Number(process.env.RATE_LIMIT_MAX ?? 500),
  message:  { success: false, message: 'Terlalu banyak request, coba lagi nanti.' },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health check ──
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Fuel Monitoring API', ts: new Date().toISOString() });
});

// ── API Routes ──
app.use('/api/auth',           authRouter);
app.use('/api/dashboard',      dashboardRouter);
app.use('/api/transactions',   transactionsRouter);
app.use('/api/cards',          cardsRouter);
app.use('/api/quota',          quotaRouter);
app.use('/api/tanks',          tanksRouter);
app.use('/api/stock',          stockRouter);
app.use('/api/pumps',          pumpsRouter);
app.use('/api/nozzles',        pumpsRouter);
app.use('/api/reconciliation', reconciliationRouter);
app.use('/api/reports',        reportsRouter);
app.use('/api/master',         masterRouter);
app.use('/api/system',         systemRouter);

// ── Controller push endpoint (from fuel pump controller) ──
app.post('/api/controller/transaction', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const secret = req.headers['x-controller-secret'];
    if (secret !== (process.env.CONTROLLER_SECRET ?? 'spbp-controller-2026')) {
      res.status(401).json({ success: false, message: 'Unauthorized controller' });
      return;
    }
    const { db }     = await import('./db/client');
    const { v4: uuid } = await import('uuid');
    const { toNum }  = await import('./utils/db');
    const body = req.body;

    const cardRes = await db.execute({ sql: `SELECT * FROM cards WHERE card_number = ?`, args: [body.card_number] });
    const card = cardRes.rows[0] as any;
    if (!card) { res.status(404).json({ success: false, message: 'Kartu tidak ditemukan' }); return; }

    // Find product
    const prodRes = await db.execute({
      sql: `SELECT id FROM products WHERE code = ? OR id = ? LIMIT 1`,
      args: [body.product_code ?? '', body.product_id ?? ''],
    });
    const productId = (prodRes.rows[0] as any)?.id;
    if (!productId) { res.status(404).json({ success: false, message: 'Produk tidak ditemukan' }); return; }

    const quotaRes = await db.execute({
      sql: `SELECT cq.* FROM card_quotas cq JOIN quota_periods qp ON qp.id = cq.period_id
            WHERE cq.card_id = ? AND cq.product_id = ? AND qp.status = 'ACTIVE' LIMIT 1`,
      args: [card.id, productId],
    });
    const quota = quotaRes.rows[0] as any;

    const priceRes = await db.execute({
      sql: `SELECT price_per_unit FROM price_histories WHERE product_id = ? ORDER BY effective_date DESC LIMIT 1`,
      args: [productId],
    });
    const price = toNum((priceRes.rows[0] as any)?.price_per_unit);
    const vol   = toNum(body.volume_l);
    const total = price * vol;

    const quotaBefore   = toNum(quota?.remaining_l);
    const quotaDeducted = Math.min(vol, quotaBefore);
    const quotaAfter    = Math.max(0, quotaBefore - vol);
    const txStatus      = vol > quotaBefore ? 'FAILED' : 'SUCCESS';

    const txId = uuid();
    await db.execute({
      sql: `INSERT INTO transactions
            (id,card_id,product_id,nozzle_id,pump_id,operator_id,shift,volume_l,
             price_per_unit,total_amount,totalizer_before,totalizer_after,
             quota_before,quota_deducted,quota_after,status,source,transaction_time)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        txId, card.id, productId,
        body.nozzle_id ?? null, body.pump_id ?? null,
        'usr-admin01', body.shift ?? 'PAGI', vol, price, total,
        body.totalizer_before ?? null, body.totalizer_after ?? null,
        quotaBefore, quotaDeducted, quotaAfter, txStatus, 'CONTROLLER',
        body.transaction_time ?? new Date().toISOString(),
      ],
    });

    if (txStatus === 'SUCCESS' && quota) {
      await db.execute({
        sql: `UPDATE card_quotas SET used_l = used_l + ?, remaining_l = remaining_l - ?, updated_at = datetime('now') WHERE id = ?`,
        args: [quotaDeducted, quotaDeducted, quota.id],
      });
      await db.execute({
        sql: `UPDATE tanks SET current_l = MAX(0, current_l - ?), updated_at = datetime('now') WHERE product_id = ?`,
        args: [vol, productId],
      });
    }
    res.status(201).json({ success: true, data: { id: txId, status: txStatus } });
  } catch (err) {
    next(err);
  }
});

// ── 404 & Error handler ──
app.use(notFound);
app.use(errorHandler);

// ── Start ──
async function start(): Promise<void> {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🚀 Fuel Monitoring API — port ${PORT} — ${process.env.NODE_ENV}`);
    console.log(`   DB: ${process.env.TURSO_URL}\n`);
    console.log('   GET  /health');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/dashboard');
    console.log('   GET  /api/transactions   POST /api/transactions');
    console.log('   GET  /api/cards');
    console.log('   GET  /api/quota          POST /api/quota/generate   POST /api/quota/topup');
    console.log('   GET  /api/tanks          POST /api/tanks/:id/readings');
    console.log('   GET  /api/stock          POST /api/stock/deliveries  POST /api/stock/adjustment');
    console.log('   GET  /api/pumps          GET  /api/pumps/nozzles     GET /api/pumps/totalizers');
    console.log('   GET  /api/reconciliation POST /api/reconciliation/run');
    console.log('   GET  /api/reports/executive  /reports/transactions  /reports/quota  /reports/stock');
    console.log('   GET  /api/master/products  /master/prices  /master/vehicles  /master/units');
    console.log('   GET  /api/system/audit   /system/approvals  /system/settings');
    console.log('   POST /api/controller/transaction  ← fuel pump controller push\n');
  });
}

start().catch(err => { console.error('Startup failed:', err); process.exit(1); });

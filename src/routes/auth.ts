import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db/client';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { logAudit } from '../middleware/audit';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const result = await db.execute({
    sql: `SELECT u.*, r.name as role_name
          FROM users u
          JOIN roles r ON r.id = u.role_id
          WHERE u.username = ? AND u.status = 'ACTIVE'`,
    args: [username],
  });

  const user = result.rows[0] as any;
  if (!user) {
    res.status(401).json({ success: false, message: 'Username atau password salah' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ success: false, message: 'Username atau password salah' });
    return;
  }

  // Update last login
  await db.execute({
    sql: `UPDATE users SET last_login = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
    args: [user.id],
  });

  const payload = {
    userId:   user.id,
    username: user.username,
    roleId:   user.role_id,
    roleName: user.role_name,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) ?? '8h',
  });

  await logAudit(user.id, 'LOGIN', 'Auth', user.id, null, null, null, req.ip);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id:       user.id,
        name:     user.name,
        username: user.username,
        email:    user.email,
        role:     user.role_name,
        status:   user.status,
      },
    },
  });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  const result = await db.execute({
    sql: `SELECT u.id, u.name, u.username, u.email, r.name as role, u.status, u.last_login
          FROM users u JOIN roles r ON r.id = u.role_id
          WHERE u.id = ?`,
    args: [req.user!.userId],
  });
  res.json({ success: true, data: result.rows[0] ?? null });
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
  await logAudit(req.user!.userId, 'LOGOUT', 'Auth', req.user!.userId, null, null, null, req.ip);
  res.json({ success: true, message: 'Logout berhasil' });
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: 'currentPassword dan newPassword wajib diisi' });
    return;
  }

  const result = await db.execute({ sql: `SELECT * FROM users WHERE id = ?`, args: [req.user!.userId] });
  const user = result.rows[0] as any;
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    res.status(401).json({ success: false, message: 'Password saat ini salah' });
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await db.execute({
    sql: `UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [hashed, req.user!.userId],
  });

  await logAudit(req.user!.userId, 'CHANGE_PASSWORD', 'Auth', req.user!.userId, null, null, null, req.ip);
  res.json({ success: true, message: 'Password berhasil diubah' });
});

export default router;

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';

export interface AuthPayload {
  userId: string;
  username: string;
  roleId: string;
  roleName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token tidak valid atau sudah expired' });
  }
}

import { toNum } from '../utils/db';

export function authorize(...permCodes: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi' });
      return;
    }
    if (req.user.roleName === 'Super Administrator') { next(); return; }
    if (permCodes.length === 0) { next(); return; }

    const placeholders = permCodes.map(() => '?').join(',');
    const result = await db.execute({
      sql: `SELECT COUNT(*) as cnt FROM role_permissions rp
            JOIN permissions p ON p.id = rp.permission_id
            WHERE rp.role_id = ? AND p.code IN (${placeholders})`,
      args: [req.user.roleId, ...permCodes],
    });
    if (toNum((result.rows[0] as any)?.cnt) > 0) { next(); return; }
    res.status(403).json({ success: false, message: 'Akses ditolak — permission tidak cukup' });
  };
}

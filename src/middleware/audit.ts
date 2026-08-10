import { db } from '../db/client';
import { v4 as uuid } from 'uuid';

export async function logAudit(
  userId:   string | null | undefined,
  action:   string,
  module:   string,
  recordId?: string | null,
  before?:  unknown,
  after?:   unknown,
  reason?:  string | null,
  ip?:      string | null
): Promise<void> {
  try {
    await db.execute({
      sql: `INSERT INTO audit_logs(id,user_id,action,module,record_id,before_val,after_val,reason,ip_address)
            VALUES(?,?,?,?,?,?,?,?,?)`,
      args: [
        uuid(),
        userId   ?? null,
        action,
        module,
        recordId ?? null,
        before   ? JSON.stringify(before) : null,
        after    ? JSON.stringify(after)  : null,
        reason   ?? null,
        ip       ?? null,
      ],
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

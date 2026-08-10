import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_URL and TURSO_AUTH_TOKEN must be set in .env');
}

export const db = createClient({
  url:       process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function testConnection(): Promise<void> {
  try {
    await db.execute('SELECT 1');
    console.log('✓ Turso DB connected:', process.env.TURSO_URL);
  } catch (err) {
    console.error('✗ Turso DB connection failed:', err);
    throw err;
  }
}

import { db, testConnection } from './client';
import { schema } from './schema';

async function migrate(): Promise<void> {
  console.log('🔄 Running migrations...');
  await testConnection();

  for (const sql of schema) {
    try {
      await db.execute(sql);
      // Extract table name for logging
      const match = sql.match(/CREATE (?:TABLE|INDEX) IF NOT EXISTS (\S+)/);
      if (match) console.log(`  ✓ ${match[1]}`);
    } catch (err) {
      console.error('Migration failed on:', sql.slice(0, 60) + '...');
      throw err;
    }
  }

  console.log('✅ All migrations completed');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

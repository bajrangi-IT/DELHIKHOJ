import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import fs from 'node:fs';
import path from 'node:path';

async function test() {
  const dataDir = path.resolve(process.cwd(), '.data/pglite');
  const client = new PGlite(dataDir);
  const migrationPath = path.resolve(process.cwd(), 'drizzle/0000_breezy_blazing_skull.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  for (const s of sql.split('--> statement-breakpoint')) {
    const q = s.trim();
    if (q) {
      try { await client.exec(q); } catch (e) {
        if (!e.message.includes('already exists')) console.error(e.message);
      }
    }
  }
  const res = await client.query('SELECT count(*) as count FROM users');
  console.log('PGlite users table ready:', res.rows[0]);
}
test().catch(console.error);

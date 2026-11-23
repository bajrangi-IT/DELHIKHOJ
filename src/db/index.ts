import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const globalForDb = globalThis as typeof globalThis & {
  __supabasePool?: Pool;
  __supabaseDb?: ReturnType<typeof drizzle<typeof schema>>;
};

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.rffobuzlddftfulsjyac:DelhiKhoj2026SafeDB!@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

/**
 * Dedicated connection pool to Supabase PostgreSQL (Mumbai / ap-south-1)
 * Uses Supabase connection pooler with SSL.
 */
export const pool: Pool =
  globalForDb.__supabasePool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

export type AppDb = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Universal Drizzle ORM client connected to Supabase
 */
export const db: AppDb =
  globalForDb.__supabaseDb ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__supabasePool = pool;
  globalForDb.__supabaseDb = db;
}

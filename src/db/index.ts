import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "@/db/schema";
import fs from "node:fs";
import path from "node:path";

const globalForDb = globalThis as typeof globalThis & {
  __arenaPgliteClient?: PGlite;
  __arenaPool?: Pool;
  __arenaDb?: any;
};

const hasDatabaseUrl = Boolean(
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.startsWith("postgres://") || process.env.DATABASE_URL.startsWith("postgresql://"))
);

export const pool: Pool | null = hasDatabaseUrl
  ? globalForDb.__arenaPool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 10,
    })
  : null;

function getClient(): PGlite | null {
  if (hasDatabaseUrl) return null;
  if (globalForDb.__arenaPgliteClient) {
    return globalForDb.__arenaPgliteClient;
  }

  const isBuilding =
    process.env.npm_lifecycle_event === "build" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    typeof process.env.NEXT_PRIVATE_BUILD_WORKER !== "undefined";

  const isEphemeral = isBuilding || Boolean(process.env.RENDER);

  let client: PGlite;
  if (isEphemeral) {
    client = new PGlite();
  } else {
    const dataDir = path.resolve(process.cwd(), ".data/pglite");
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      client = new PGlite(dataDir);
    } catch {
      client = new PGlite();
    }
  }

  globalForDb.__arenaPgliteClient = client;
  return client;
}

export const pgliteClient = getClient();

export type AppDb = ReturnType<typeof drizzlePglite<typeof schema>>;

export const db: AppDb =
  (globalForDb.__arenaDb ??
  (pool ? (drizzleNodePg(pool, { schema }) as unknown as AppDb) : drizzlePglite(pgliteClient!, { schema }))) as AppDb;

if (process.env.NODE_ENV !== "production") {
  if (pgliteClient) globalForDb.__arenaPgliteClient = pgliteClient;
  if (pool) globalForDb.__arenaPool = pool;
  globalForDb.__arenaDb = db;
}

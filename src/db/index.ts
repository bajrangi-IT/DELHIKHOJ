import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "@/db/schema";
import fs from "node:fs";
import path from "node:path";

const globalForDb = globalThis as typeof globalThis & {
  __arenaPgliteClient?: PGlite;
  __arenaDb?: ReturnType<typeof drizzle>;
};

function getClient(): PGlite {
  if (globalForDb.__arenaPgliteClient) {
    return globalForDb.__arenaPgliteClient;
  }

  // During static page generation in multi-worker builds, use in-memory to prevent file lock contention
  const isMultiWorker = typeof process.env.NEXT_PRIVATE_BUILD_WORKER !== "undefined";

  let client: PGlite;
  if (isMultiWorker) {
    client = new PGlite();
  } else {
    const dataDir = path.resolve(process.cwd(), ".data/pglite");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    try {
      client = new PGlite(dataDir);
    } catch {
      client = new PGlite();
    }
  }

  globalForDb.__arenaPgliteClient = client;
  return client;
}

export const pgliteClient = getClient();

export const db =
  globalForDb.__arenaDb ?? drizzle(pgliteClient, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaPgliteClient = pgliteClient;
  globalForDb.__arenaDb = db;
}

export const pool = {} as any;

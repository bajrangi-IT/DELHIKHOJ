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

  // During static page generation and multi-worker builds, use in-memory to prevent file lock contention
  const isBuilding =
    process.env.npm_lifecycle_event === "build" ||
    process.env.NEXT_PHASE === "phase-production-build" ||
    typeof process.env.NEXT_PRIVATE_BUILD_WORKER !== "undefined";

  let client: PGlite;
  if (isBuilding) {
    client = new PGlite();
  } else {
    const dataDir = process.env.RENDER
      ? "/tmp/pglite"
      : path.resolve(process.cwd(), ".data/pglite");
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

export const db =
  globalForDb.__arenaDb ?? drizzle(pgliteClient, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaPgliteClient = pgliteClient;
  globalForDb.__arenaDb = db;
}

export const pool = {} as any;

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { savedItems } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { fail, ok, parseBody, z } from "@/lib/api";

const schema = z.object({ kind: z.enum(["destination", "market", "event", "product"]), refId: z.string().min(1).max(100) });

export async function GET() {
  const user = await apiUser();
  if (!user) return ok({ items: [], authenticated: false });
  const rows = await db.select().from(savedItems).where(eq(savedItems.userId, user.id));
  return ok({ items: rows.map((r) => `${r.kind}:${r.refId}`), authenticated: true });
}

/** Toggle saved state. */
export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return fail("Please log in to save places", 401);
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  const cond = and(eq(savedItems.userId, user.id), eq(savedItems.kind, p.data.kind), eq(savedItems.refId, p.data.refId));
  const removed = await db.delete(savedItems).where(cond).returning({ id: savedItems.id });
  if (removed.length) return ok({ saved: false });
  await db.insert(savedItems).values({ userId: user.id, ...p.data }).onConflictDoNothing();
  return ok({ saved: true });
}

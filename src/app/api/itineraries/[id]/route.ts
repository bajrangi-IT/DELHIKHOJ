import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { itineraries } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { fail, ok, parseBody, z } from "@/lib/api";
import { stopSchema } from "@/lib/schemas";

const schema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  tripDate: z.string().max(20).nullable().optional(),
  stops: z.array(stopSchema).min(1).max(40).optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await apiUser();
  if (!user) return fail("Please log in", 401);
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  const rows = await db.update(itineraries).set({ ...p.data, updatedAt: new Date() }).where(and(eq(itineraries.id, id), eq(itineraries.userId, user.id))).returning({ id: itineraries.id });
  return rows.length ? ok() : fail("Not found", 404);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await apiUser();
  if (!user) return fail("Please log in", 401);
  const rows = await db.delete(itineraries).where(and(eq(itineraries.id, id), eq(itineraries.userId, user.id))).returning({ id: itineraries.id });
  return rows.length ? ok() : fail("Not found", 404);
}

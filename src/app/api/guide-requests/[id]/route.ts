import { eq } from "drizzle-orm";
import { db } from "@/db";
import { guideRequests, guides } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { fail, ok, parseBody, z } from "@/lib/api";

const schema = z.object({ status: z.enum(["accepted", "declined", "cancelled"]) });

/** Guide (owner) can accept/decline; requesting tourist can cancel. Enforced server-side. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await apiUser();
  if (!user) return fail("Please log in", 401);
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  const [r] = await db.select({ r: guideRequests, g: guides }).from(guideRequests).innerJoin(guides, eq(guides.id, guideRequests.guideId)).where(eq(guideRequests.id, id));
  if (!r) return fail("Not found", 404);
  const isGuideOwner = r.g.userId === user.id;
  const isRequester = r.r.userId === user.id;
  const allowed =
    user.role === "admin" ||
    (isGuideOwner && ["accepted", "declined"].includes(p.data.status)) ||
    (isRequester && p.data.status === "cancelled");
  if (!allowed) return fail("You are not allowed to do that", 403);
  await db.update(guideRequests).set({ status: p.data.status, updatedAt: new Date() }).where(eq(guideRequests.id, id));
  return ok();
}

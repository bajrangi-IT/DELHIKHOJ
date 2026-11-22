import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { guideRequests, guides } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { fail, ok, parseBody, z } from "@/lib/api";

const schema = z.object({
  guideId: z.string().uuid(),
  tourDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  timeSlot: z.enum(["morning", "afternoon", "evening", "full-day"]),
  groupSize: z.number().int().min(1).max(30),
  destination: z.string().max(120).optional(),
  message: z.string().max(600).optional(),
});

export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return fail("Please log in to send a request", 401);
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  if (new Date(p.data.tourDate + "T23:59:59") < new Date()) return fail("Choose a future date", 422);
  const [g] = await db.select().from(guides).where(and(eq(guides.id, p.data.guideId), eq(guides.status, "approved")));
  if (!g) return fail("Guide not found", 404);
  const [row] = await db.insert(guideRequests).values({ ...p.data, userId: user.id }).returning();
  return ok({ request: row }, 201);
}

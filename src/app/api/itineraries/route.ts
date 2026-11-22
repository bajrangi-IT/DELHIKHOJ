import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { itineraries } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { fail, ok, parseBody, z } from "@/lib/api";
import { stopSchema } from "@/lib/schemas";

const schema = z.object({
  title: z.string().trim().min(2, "Give your plan a title").max(120),
  tripDate: z.string().max(20).optional().nullable(),
  config: z.record(z.string(), z.unknown()).default({}),
  stops: z.array(stopSchema).min(1, "Add at least one stop").max(40),
});

export async function GET() {
  const user = await apiUser();
  if (!user) return fail("Please log in", 401);
  const rows = await db.select().from(itineraries).where(eq(itineraries.userId, user.id)).orderBy(desc(itineraries.updatedAt));
  return ok({ itineraries: rows });
}

export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return fail("Please log in to save your plan", 401);
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  const [row] = await db.insert(itineraries).values({ ...p.data, tripDate: p.data.tripDate ?? null, userId: user.id }).returning();
  return ok({ itinerary: row }, 201);
}

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, sellers } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { fail, ok, parseBody, z } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10, "Describe the product").max(800),
  category: z.enum(["handicraft", "textiles", "jewellery", "souvenir", "art", "food"]),
  priceInr: z.number().int().min(1).max(10_000_000).nullable().optional(),
  availability: z.enum(["available", "made-to-order", "out-of-stock"]).default("available"),
});

async function mySeller(userId: string) {
  const [s] = await db.select().from(sellers).where(eq(sellers.userId, userId));
  return s ?? null;
}

export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return fail("Please log in", 401);
  const s = await mySeller(user.id);
  if (!s || s.status !== "approved") return fail("Your seller profile must be approved first", 403);
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  await db.insert(products).values({ ...p.data, priceInr: p.data.priceInr ?? null, sellerId: s.id });
  return ok({}, 201);
}

export async function DELETE(req: Request) {
  const user = await apiUser();
  if (!user) return fail("Please log in", 401);
  const s = await mySeller(user.id);
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!s || !/^[0-9a-f-]{36}$/i.test(id)) return fail("Not found", 404);
  const rows = await db.delete(products).where(and(eq(products.id, id), eq(products.sellerId, s.id))).returning({ id: products.id });
  return rows.length ? ok() : fail("Not found", 404);
}

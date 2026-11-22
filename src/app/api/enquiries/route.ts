import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { ok, parseBody, rateLimited, fail, z } from "@/lib/api";

const schema = z.object({
  sellerId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "Write at least 10 characters").max(800),
});

export async function POST(req: Request) {
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  if (rateLimited(`enq:${p.data.email}`, 5, 300_000)) return fail("Too many enquiries. Please wait a few minutes.", 429);
  const user = await apiUser();
  await db.insert(enquiries).values({ ...p.data, userId: user?.id ?? null });
  return ok({ message: "Enquiry sent. The seller will contact you by email." }, 201);
}

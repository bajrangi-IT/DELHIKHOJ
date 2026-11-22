import { eq } from "drizzle-orm";
import { db } from "@/db";
import { guides, sellers } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { fail, ok, parseBody, z } from "@/lib/api";

const list = z.array(z.string().trim().min(1).max(40)).min(1, "Add at least one").max(10);
const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("guide"),
    name: z.string().trim().min(2).max(80),
    bio: z.string().trim().min(40, "Tell visitors about yourself (at least 40 characters)").max(1200),
    languages: list, specialities: list, areas: list, tourTypes: list,
    experienceYears: z.number().int().min(0).max(60),
    priceNote: z.string().trim().max(80).default("Contact for price"),
    availability: z.string().trim().max(200).default("Send a request with your preferred date"),
  }),
  z.object({
    type: z.literal("seller"),
    businessName: z.string().trim().min(2).max(100),
    locality: z.string().trim().min(2).max(80),
    description: z.string().trim().min(40, "Describe your business (at least 40 characters)").max(1200),
    contactPhone: z.string().trim().max(20).optional(),
  }),
]);

/** Submits a PENDING profile. Admin approval is required before it is listed publicly. */
export async function POST(req: Request) {
  const user = await apiUser();
  if (!user) return fail("Please log in first", 401);
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  const d = p.data;
  if (d.type === "guide") {
    const [ex] = await db.select({ id: guides.id }).from(guides).where(eq(guides.userId, user.id));
    if (ex) return fail("You have already submitted a guide profile.", 409);
    const { type, ...rest } = d; void type;
    await db.insert(guides).values({ ...rest, userId: user.id, contactEmail: user.email, status: "pending" });
  } else {
    const [ex] = await db.select({ id: sellers.id }).from(sellers).where(eq(sellers.userId, user.id));
    if (ex) return fail("You have already submitted a seller profile.", 409);
    const slug = `${d.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;
    await db.insert(sellers).values({ businessName: d.businessName, locality: d.locality, description: d.description, contactPhone: d.contactPhone, slug, userId: user.id, contactEmail: user.email, status: "pending" });
  }
  return ok({ message: "Submitted for admin review. It will appear publicly once approved." }, 201);
}

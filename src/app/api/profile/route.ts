import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { apiUser, hashPassword, verifyPassword } from "@/lib/auth";
import { fail, ok, parseBody, z } from "@/lib/api";

const INTERESTS = ["history", "food", "markets", "architecture", "photography", "family", "culture", "nature"] as const;

const schema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).regex(/^[0-9+\-\s]*$/, "Invalid phone").optional(),
  language: z.enum(["en", "hi"]).optional(),
  interests: z.array(z.enum(INTERESTS)).max(8).optional(),
  onboarded: z.boolean().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Use at least 8 characters").regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number").optional(),
});

export async function PUT(req: Request) {
  const user = await apiUser();
  if (!user) return fail("Please log in", 401);
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  const { currentPassword, newPassword, ...rest } = p.data;
  const patch: Partial<typeof users.$inferInsert> = { ...rest, updatedAt: new Date() };
  if (newPassword) {
    const [row] = await db.select().from(users).where(eq(users.id, user.id));
    if (!currentPassword || !verifyPassword(currentPassword, row.passwordHash)) return fail("Current password is incorrect", 403);
    patch.passwordHash = hashPassword(newPassword);
  }
  await db.update(users).set(patch).where(eq(users.id, user.id));
  return ok({ message: "Saved" });
}

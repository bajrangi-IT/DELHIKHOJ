import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, sessions, users } from "@/db/schema";
import { hashPassword, sha256 } from "@/lib/auth";
import { fail, ok, parseBody, z } from "@/lib/api";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Use at least 8 characters").regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number"),
});

export async function POST(req: Request) {
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  const [r] = await db
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.tokenHash, sha256(p.data.token)), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date())));
  if (!r) return fail("This reset link is invalid or has expired.", 400);
  await db.update(users).set({ passwordHash: hashPassword(p.data.password), updatedAt: new Date() }).where(eq(users.id, r.userId));
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, r.id));
  await db.delete(sessions).where(eq(sessions.userId, r.userId));
  return ok({ redirect: "/login?reset=1" });
}

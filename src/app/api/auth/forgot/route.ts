import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, users } from "@/db/schema";
import { sha256 } from "@/lib/auth";
import { ok, parseBody, rateLimited, fail, z } from "@/lib/api";
import { ensureSeeded } from "@/lib/seed";

const schema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email") });

/**
 * No email provider is configured in this build, so instead of silently pretending to send mail
 * we return the one-time reset link directly (clearly labelled demo behaviour).
 */
export async function POST(req: Request) {
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  if (rateLimited(`forgot:${p.data.email}`, 5)) return fail("Too many requests. Please wait.", 429);
  await ensureSeeded();
  const [u] = await db.select().from(users).where(eq(users.email, p.data.email));
  let resetLink: string | null = null;
  if (u) {
    const token = randomBytes(32).toString("hex");
    await db.insert(passwordResets).values({ userId: u.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 3600_000) });
    resetLink = `/reset-password?token=${token}`;
  }
  return ok({
    message: "If that email has an account, a reset link has been created.",
    emailDelivery: "not-configured",
    resetLink,
  });
}

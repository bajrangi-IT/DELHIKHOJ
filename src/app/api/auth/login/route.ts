import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { fail, ok, parseBody, rateLimited, z } from "@/lib/api";
import { ensureSeeded } from "@/lib/seed";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  next: z.string().optional(),
});

export async function POST(req: Request) {
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  const { email, password, next } = p.data;
  if (rateLimited(`login:${email}`, 8)) return fail("Too many attempts. Please wait a minute.", 429);
  await ensureSeeded();
  const [u] = await db.select().from(users).where(eq(users.email, email));
  if (!u || !verifyPassword(password, u.passwordHash)) return fail("Incorrect email or password", 401);
  await createSession(u.id);
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const dest = !u.onboarded ? "/onboarding" : safeNext ?? (u.role === "admin" ? "/admin" : "/dashboard");
  return ok({ redirect: dest });
}

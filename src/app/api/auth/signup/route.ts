import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { fail, ok, parseBody, rateLimited, z } from "@/lib/api";
import { ensureSeeded } from "@/lib/seed";

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include a letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
    phone: z.string().trim().max(20).regex(/^[0-9+\-\s]*$/, "Phone can contain digits, + and -").optional().or(z.literal("")),
    language: z.enum(["en", "hi"]).default("en"),
    consent: z.literal(true, { message: "You must accept the Terms and Privacy Policy" }),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export async function POST(req: Request) {
  if (rateLimited(`signup:${req.headers.get("x-forwarded-for") ?? "local"}`, 10)) return fail("Too many attempts. Try again soon.", 429);
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  const d = p.data;
  await ensureSeeded();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, d.email));
  if (existing) return fail("An account with this email already exists. Try logging in.", 409);
  const [u] = await db
    .insert(users)
    .values({ email: d.email, fullName: d.fullName, phone: d.phone || null, language: d.language, passwordHash: hashPassword(d.password) })
    .returning({ id: users.id });
  await createSession(u.id);
  return ok({ redirect: "/onboarding" }, 201);
}

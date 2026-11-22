import "server-only";
import { NextResponse } from "next/server";
import { z, type ZodType } from "zod";

export const ok = (data: Record<string, unknown> = {}, status = 200) => NextResponse.json({ ok: true, ...data }, { status });
export const fail = (error: string, status = 400, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: false, error, ...extra }, { status });

export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<{ data: T } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: fail("Invalid request body") };
  }
  const r = schema.safeParse(raw);
  if (!r.success) {
    const first = r.error.issues[0];
    return { error: fail(`${first.path.join(".") || "input"}: ${first.message}`, 422) };
  }
  return { data: r.data };
}

export { z };

/** In-memory limiter — generous in dev to prevent friction during testing. */
const hits = new Map<string, { n: number; t: number }>();
export function rateLimited(key: string, max = 30, windowMs = 60_000) {
  if (process.env.NODE_ENV !== "production") return false;
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now - h.t > windowMs) {
    hits.set(key, { n: 1, t: now });
    return false;
  }
  h.n += 1;
  return h.n > max;
}

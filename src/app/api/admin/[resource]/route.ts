import { eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { attractions, auditLogs, destinations, events, guides, markets, products, sellers, users } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

type FieldType = "text" | "num" | "bool" | "list" | "date" | "json";
type Cfg = { table: PgTable; fields: Record<string, FieldType>; create: boolean; optionalNum?: string[] };

/** Whitelisted, typed fields per resource: anything not listed here can never be written from the client. */
const RESOURCES: Record<string, Cfg> = {
  destinations: { table: destinations, create: true, fields: { slug: "text", name: "text", nameHi: "text", category: "text", era: "text", locality: "text", address: "text", lat: "num", lng: "num", image: "text", summary: "text", whyVisit: "text", history: "text", architecture: "text", facts: "json", sources: "json", hours: "text", fee: "text", rules: "text", facilities: "text", accessibility: "text", ticketUrl: "text", ticketProvider: "text", unesco: "bool", published: "bool", sortOrder: "num" } },
  events: { table: events, create: true, optionalNum: ["lat", "lng"], fields: { title: "text", type: "text", description: "text", image: "text", venue: "text", locality: "text", lat: "num", lng: "num", startsAt: "date", endsAt: "date", isFree: "bool", priceNote: "text", familyFriendly: "bool", organiser: "text", sourceUrl: "text", bookingUrl: "text", isDemo: "bool", published: "bool" } },
  attractions: { table: attractions, create: true, fields: { slug: "text", name: "text", type: "text", locality: "text", description: "text", lat: "num", lng: "num", published: "bool" } },
  markets: { table: markets, create: true, fields: { slug: "text", name: "text", locality: "text", speciality: "text", description: "text", image: "text", lat: "num", lng: "num", hours: "text", published: "bool" } },
  guides: { table: guides, create: false, fields: { status: "text" } },
  sellers: { table: sellers, create: false, fields: { status: "text" } },
  products: { table: products, create: false, fields: { published: "bool", availability: "text" } },
  users: { table: users, create: false, fields: { role: "text" } },
};
const ENUMS: Record<string, string[]> = { status: ["pending", "approved", "rejected"], role: ["tourist", "guide", "seller", "admin"] };
const NOT_NULL_TEXT = new Set(["name", "title", "slug", "summary", "description", "venue", "category", "type", "locality", "speciality"]);

function coerce(body: Record<string, unknown>, cfg: Cfg) {
  const out: Record<string, unknown> = {};
  for (const [k, t] of Object.entries(cfg.fields)) {
    if (!(k in body)) continue;
    const v = body[k];
    if (t === "text") {
      const s = typeof v === "string" ? v.trim() : "";
      if (s === "" && NOT_NULL_TEXT.has(k)) throw new Error(`${k} is required`);
      if (k in ENUMS && !ENUMS[k].includes(s)) throw new Error(`Invalid ${k}`);
      out[k] = s === "" ? null : s.slice(0, 5000);
    } else if (t === "num") {
      if ((v === "" || v === null) && cfg.optionalNum?.includes(k)) { out[k] = null; continue; }
      const n = Number(v);
      if (v === "" || v === null || !Number.isFinite(n)) throw new Error(`${k} must be a number`);
      out[k] = n;
    } else if (t === "bool") out[k] = v === true || v === "true";
    else if (t === "date") {
      if (v === "" || v == null) out[k] = null;
      else { const d = new Date(String(v)); if (isNaN(+d)) throw new Error(`${k} is not a valid date`); out[k] = d; }
    } else if (t === "list") out[k] = Array.isArray(v) ? v : String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    else if (t === "json") {
      try { out[k] = typeof v === "string" ? JSON.parse(v || "[]") : v; } catch { throw new Error(`${k} must be valid JSON`); }
    }
  }
  return out;
}

async function guard(resource: string) {
  const user = await apiUser();
  if (!user) return { err: fail("Please log in", 401) } as const;
  if (user.role !== "admin") return { err: fail("Admin access required", 403) } as const; // server-validated
  const cfg = RESOURCES[resource];
  if (!cfg) return { err: fail("Unknown resource", 404) } as const;
  return { user, cfg } as const;
}

type Ctx = { params: Promise<{ resource: string }> };
const idOf = (req: Request) => new URL(req.url).searchParams.get("id") ?? "";
const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);
const tbl = (c: Cfg) => c.table as unknown as typeof destinations; // all admin tables expose a uuid `id`

async function audit(adminId: string, action: string, resource: string, refId?: string) {
  await db.insert(auditLogs).values({ adminId, action, resource, refId });
}

export async function POST(req: Request, ctx: Ctx) {
  const { resource } = await ctx.params;
  const g = await guard(resource);
  if ("err" in g) return g.err;
  if (!g.cfg.create) return fail("Create not supported", 405);
  try {
    const values = coerce(await req.json(), g.cfg);
    const [row] = await db.insert(g.cfg.table).values(values as never).returning();
    await audit(g.user.id, "create", resource, (row as { id: string }).id);
    return ok({ row }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message.slice(0, 200) : "Could not save", 422);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { resource } = await ctx.params;
  const g = await guard(resource);
  if ("err" in g) return g.err;
  const id = idOf(req);
  if (!isUuid(id)) return fail("Invalid id");
  try {
    const values = coerce(await req.json(), g.cfg);
    if (!Object.keys(values).length) return fail("Nothing to update");
    if (resource === "users" && id === g.user.id) return fail("You cannot change your own role", 403);
    const rows = await db.update(g.cfg.table).set(values as never).where(eq(tbl(g.cfg).id, id)).returning();
    if (!rows.length) return fail("Not found", 404);
    // Approving a guide/seller grants that role to the owner (unless they are already admin).
    if ((resource === "guides" || resource === "sellers") && values.status === "approved") {
      const owner = (rows[0] as { userId: string | null }).userId;
      if (owner) await db.update(users).set({ role: resource === "guides" ? "guide" : "seller" }).where(eq(users.id, owner));
    }
    await audit(g.user.id, "update", resource, id);
    return ok();
  } catch (e) {
    return fail(e instanceof Error ? e.message.slice(0, 200) : "Could not update", 422);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { resource } = await ctx.params;
  const g = await guard(resource);
  if ("err" in g) return g.err;
  const id = idOf(req);
  if (!isUuid(id)) return fail("Invalid id");
  if (resource === "users" && id === g.user.id) return fail("You cannot delete yourself", 403);
  const rows = await db.delete(g.cfg.table).where(eq(tbl(g.cfg).id, id)).returning();
  if (!rows.length) return fail("Not found", 404);
  await audit(g.user.id, "delete", resource, id);
  return ok();
}

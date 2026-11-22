import "server-only";
import fs from "node:fs";
import path from "node:path";
import { and, count, eq, lt } from "drizzle-orm";
import { db, pgliteClient } from "@/db";
import {
  attractions, destinations, events, guides, markets, products, sellers, users,
} from "@/db/schema";
import { assets, getMonumentImage, getMarketImage } from "@/lib/assets";
import {
  attractionSeed, destinationSeed, eventSeed, guideSeed, marketSeed, sellerSeed,
} from "@/lib/seed-data";
import { hashPassword } from "@/lib/auth-hash";

let seeding: Promise<void> | null = null;

async function ensureSchema() {
  try {
    const migrationPath = path.resolve(process.cwd(), "drizzle/0000_breezy_blazing_skull.sql");
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, "utf8");
      const stmts = sql.split("--> statement-breakpoint");
      for (const stmt of stmts) {
        const q = stmt.trim();
        if (q) {
          try {
            await pgliteClient.exec(q);
          } catch (e: any) {
            if (!e.message?.includes("already exists")) {
              // silent ignore if already exists
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("Schema initialization error:", err);
  }
}

/**
 * Idempotent seeding: runs once per server process. Content is upserted by its
 * unique key, so adding new places to delhi-data.ts is picked up on restart
 * without wiping existing data. Demo events that have expired are replaced.
 */
export function ensureSeeded() {
  if (!seeding) seeding = run().catch((e) => { seeding = null; throw e; });
  return seeding;
}

async function run() {
  await ensureSchema();

  await db.insert(destinations).values(
    destinationSeed.map((d) => ({
      ...d,
      facts: [...d.facts],
      sources: [...d.sources],
      image: assets.monuments[d.slug] ?? getMonumentImage(d.slug),
    })),
  ).onConflictDoNothing();
  
  await db.insert(attractions).values(attractionSeed.map((a) => ({ ...a }))).onConflictDoNothing();
  
  await db.insert(markets).values(
    marketSeed.map((m) => ({
      ...m,
      image: m.image ? (assets.markets[m.image] ?? assets.markets[m.slug] ?? getMarketImage(m.slug)) : getMarketImage(m.slug),
    })),
  ).onConflictDoNothing();

  // refresh demo events: drop expired demo events, reseed if none left upcoming
  await db.delete(events).where(and(eq(events.isDemo, true), lt(events.startsAt, new Date())));
  const demoLeft = await db.select({ n: count() }).from(events).where(eq(events.isDemo, true));
  if (!demoLeft[0].n) await db.insert(events).values(eventSeed().map((e) => ({ ...e, isDemo: true })));

  const demoUsers = [
    { email: "demo@delhikikhoj.test", fullName: "Demo Traveller", role: "tourist", pw: "Demo@1234" },
    { email: "admin@delhikikhoj.test", fullName: "Demo Admin", role: "admin", pw: "Admin@1234" },
    { email: "guide@delhikikhoj.test", fullName: "Demo Guide Account", role: "guide", pw: "Guide@1234" },
    { email: "seller@delhikikhoj.test", fullName: "Demo Seller Account", role: "seller", pw: "Seller@1234" },
  ];
  for (const u of demoUsers) {
    await db.insert(users).values({
      email: u.email, fullName: u.fullName, role: u.role, passwordHash: hashPassword(u.pw),
      isDemo: true, onboarded: true, interests: ["history", "food"],
    }).onConflictDoNothing();
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await db.insert(users).values({
      email: process.env.ADMIN_EMAIL.toLowerCase(), fullName: "Administrator", role: "admin",
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD), onboarded: true,
    }).onConflictDoNothing();
  }

  const [guideUser] = await db.select().from(users).where(eq(users.email, "guide@delhikikhoj.test"));
  const [sellerUser] = await db.select().from(users).where(eq(users.email, "seller@delhikikhoj.test"));

  for (const [i, g] of guideSeed.entries()) {
    const [ex] = await db.select({ id: guides.id }).from(guides).where(eq(guides.name, g.name));
    if (ex) continue;
    await db.insert(guides).values({
      ...g, languages: [...g.languages], specialities: [...g.specialities], areas: [...g.areas], tourTypes: [...g.tourTypes],
      status: "approved", isDemo: true, userId: i === 0 ? guideUser?.id : null,
      contactEmail: "guide@delhikikhoj.test",
    });
  }
  for (const [i, s] of sellerSeed.entries()) {
    const { products: ps, ...rest } = s;
    const [ex] = await db.select({ id: sellers.id }).from(sellers).where(eq(sellers.slug, rest.slug));
    if (ex) continue;
    const [row] = await db.insert(sellers).values({
      ...rest, status: "approved", isDemo: true, userId: i === 0 ? sellerUser?.id : null,
      image: s.image ?? assets.artisans.crafts, contactEmail: "seller@delhikikhoj.test",
    }).returning();
    if (row) {
      await db.insert(products).values(
        ps.map((p) => ({ ...p, sellerId: row.id, image: p.image ?? s.image ?? assets.artisans.crafts, priceInr: null })),
      );
    }
  }
}

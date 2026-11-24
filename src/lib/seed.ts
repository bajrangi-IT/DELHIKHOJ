import "server-only";
import fs from "node:fs";
import path from "node:path";
import { and, count, eq, lt } from "drizzle-orm";
import { db, pool } from "@/db";
import {
  attractions, destinations, events, guides, markets, products, sellers, users,
} from "@/db/schema";
import { assets, getMonumentImage, getMarketImage } from "@/lib/assets";
import {
  attractionSeed, destinationSeed, eventSeed, guideSeed, marketSeed, sellerSeed,
} from "@/lib/seed-data";
import { hashPassword } from "@/lib/auth-hash";

let seeding: Promise<void> | null = null;
let schemaEnsured = false;
let isFullySeeded = Boolean(process.env.DATABASE_URL);

async function ensureSchema() {
  if (schemaEnsured || isFullySeeded) return;
  try {
    const migrationPath = path.resolve(process.cwd(), "drizzle/0000_breezy_blazing_skull.sql");
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, "utf8");
      const stmts = sql.split("--> statement-breakpoint");
      for (const stmt of stmts) {
        const q = stmt.trim();
        if (q) {
          try {
            await pool.query(q);
          } catch {
            // ignore if table/constraint already exists
          }
        }
      }
    }
    schemaEnsured = true;
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
  if (isFullySeeded) return Promise.resolve();
  if (!seeding) seeding = run().then(() => { isFullySeeded = true; }).catch((e) => { seeding = null; throw e; });
  return seeding;
}

async function run() {
  await ensureSchema();

  try {
    await db.insert(destinations).values(
      destinationSeed.map((d) => ({
        ...d,
        facts: [...d.facts],
        sources: [...d.sources],
        image: assets.monuments[d.slug] ?? getMonumentImage(d.slug),
      })),
    ).onConflictDoNothing();
  } catch (err) {
    console.warn("Seeding destinations error:", err);
  }
  
  try {
    await db.insert(attractions).values(attractionSeed.map((a) => ({ ...a }))).onConflictDoNothing();
  } catch (err) {
    console.warn("Seeding attractions error:", err);
  }
  
  try {
    await db.insert(markets).values(
      marketSeed.map((m) => ({
        ...m,
        image: assets.markets[m.slug] ?? getMarketImage(m.slug),
      })),
    ).onConflictDoNothing();
  } catch (err) {
    console.warn("Seeding markets error:", err);
  }

  // refresh demo events: drop expired demo events, reseed if none left upcoming
  await db.delete(events).where(and(eq(events.isDemo, true), lt(events.startsAt, new Date())));
  const demoLeft = await db.select({ n: count() }).from(events).where(eq(events.isDemo, true));
  if (!demoLeft[0].n) await db.insert(events).values(eventSeed().map((e) => ({ ...e, isDemo: true })));

  const demoUsers = [
    { email: "demo@delhikikhoj.test", fullName: "Demo Traveller", role: "tourist", passwordHash: "6168942468ea6a8f60163b3554e60d77:e6d7c795509edf2aff68bb3df5f1aa29629dfc058136eb8985a64ee62308305cfd0f5a9277c3a79ce52f798821888a55d0047e9f4c65b3fc6c6d0000d5d5d07e" },
    { email: "admin@delhikikhoj.test", fullName: "Demo Admin", role: "admin", passwordHash: "ee6d6eb9684947354a60f5fb43798ad9:0342e173cee44cbb4f550ed2e35ba2dd17be3250cada029f201a8af7bcbb8cb5a83d33d4f30353b431a2c1105c6d4e8157d170b64b7b27a7e1391556cabfe94b" },
    { email: "guide@delhikikhoj.test", fullName: "Demo Guide Account", role: "guide", passwordHash: "cdb5516cc15a1cb5b4d1f91fd735fe8a:3188131a5b2318509304b70b31c827bb5047f1942de6da7dc158fba578e65c3148f13f0f667d2c9d469af4baaab8a83dc7ecda60932faa6e4c092d0f26bb1d6e" },
    { email: "seller@delhikikhoj.test", fullName: "Demo Seller Account", role: "seller", passwordHash: "da2c05c2ec4d45624dd75ab298fab09f:f59b9997a8e6b4522f1e65a95d9f85083372306e715e15b9dadf6d1f1830309f5c2172ba8803f5778e57dc5db531df698e8c4913cf08bf9c69d85f004edea8f1" },
  ];
  for (const u of demoUsers) {
    await db.insert(users).values({
      email: u.email, fullName: u.fullName, role: u.role, passwordHash: u.passwordHash,
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

  // Clean up legacy demo guide and seller profiles
  try {
    await db.delete(guides).where(eq(guides.isDemo, true));
    await db.delete(sellers).where(eq(sellers.isDemo, true));
  } catch {
    // ignore
  }

  for (const [i, g] of guideSeed.entries()) {
    const [ex] = await db.select({ id: guides.id }).from(guides).where(eq(guides.name, g.name));
    if (ex) continue;
    await db.insert(guides).values({
      name: g.name,
      bio: g.bio,
      languages: [...g.languages],
      specialities: [...g.specialities],
      areas: [...g.areas],
      tourTypes: [...g.tourTypes],
      experienceYears: g.experienceYears,
      priceNote: g.priceNote,
      hourlyRate: g.hourlyRate,
      rating: g.rating,
      reviewsCount: g.reviewsCount,
      badge: g.badge,
      status: "approved",
      verified: true,
      isDemo: false,
      userId: i === 0 ? guideUser?.id : null,
      contactEmail: g.contactEmail ?? "guide@delhikikhoj.test",
      contactPhone: g.contactPhone ?? "+91 98110 00000",
    });
  }

  for (const [i, s] of sellerSeed.entries()) {
    const { products: ps, ...rest } = s;
    let [row] = await db.select().from(sellers).where(eq(sellers.slug, rest.slug));
    if (!row) {
      const [inserted] = await db.insert(sellers).values({
        slug: rest.slug,
        businessName: rest.businessName,
        locality: rest.locality,
        description: rest.description,
        status: "approved",
        isDemo: false,
        userId: i === 0 ? sellerUser?.id : null,
        image: s.image ?? assets.artisans.crafts,
        contactEmail: s.contactEmail ?? "seller@delhikikhoj.test",
        contactPhone: s.contactPhone ?? "+91 98100 00000",
      }).returning();
      row = inserted;
    }
    if (row) {
      for (const p of ps) {
        const [pex] = await db
          .select({ id: products.id })
          .from(products)
          .where(and(eq(products.sellerId, row.id), eq(products.name, p.name)));
        if (!pex) {
          await db.insert(products).values({
            name: p.name,
            description: p.description,
            category: p.category,
            priceInr: p.priceInr ?? 850,
            sellerId: row.id,
            image: p.image ?? s.image ?? assets.artisans.crafts,
            availability: "available",
            published: true,
          });
        }
      }
    }
  }
}

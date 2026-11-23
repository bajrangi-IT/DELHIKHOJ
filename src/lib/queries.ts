import "server-only";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  attractions, destinations, events, guides, markets, products, sellers, savedItems,
} from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { syncRealTimeEvents } from "@/lib/live-events";
import { haversineKm } from "@/lib/utils";

const queryCache = new Map<string, { val: any; expires: number }>();
function withCache<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const item = queryCache.get(key);
  if (item && item.expires > Date.now()) {
    return Promise.resolve(item.val as T);
  }
  return fn().then((res) => {
    queryCache.set(key, { val: res, expires: Date.now() + ttlSeconds * 1000 });
    return res;
  });
}

export function clearQueryCache(pattern?: string) {
  if (!pattern) {
    queryCache.clear();
    return;
  }
  for (const k of queryCache.keys()) {
    if (k.includes(pattern)) queryCache.delete(k);
  }
}

export async function listDestinations(all = false) {
  return withCache(`destinations_${all}`, 60, async () => {
    await ensureSeeded();
    const q = db.select().from(destinations);
    return all ? q.orderBy(asc(destinations.sortOrder)) : q.where(eq(destinations.published, true)).orderBy(asc(destinations.sortOrder));
  });
}

export async function getDestination(slug: string) {
  return withCache(`dest_${slug}`, 60, async () => {
    await ensureSeeded();
    const [d] = await db.select().from(destinations).where(and(eq(destinations.slug, slug), eq(destinations.published, true)));
    return d ?? null;
  });
}

export async function listAttractions() {
  return withCache("attractions", 60, async () => {
    await ensureSeeded();
    return db.select().from(attractions).where(eq(attractions.published, true));
  });
}

export async function listMarkets() {
  return withCache("markets", 60, async () => {
    await ensureSeeded();
    return db.select().from(markets).where(eq(markets.published, true));
  });
}

export async function getMarket(slug: string) {
  return withCache(`market_${slug}`, 60, async () => {
    await ensureSeeded();
    const [m] = await db.select().from(markets).where(eq(markets.slug, slug));
    return m ?? null;
  });
}

export async function listEvents() {
  await ensureSeeded();
  try {
    await syncRealTimeEvents();
  } catch (e) {
    console.error("syncRealTimeEvents error:", e);
  }
  return db.select().from(events).where(eq(events.published, true)).orderBy(asc(events.startsAt));
}

export async function upcomingEvents(limit = 4) {
  await ensureSeeded();
  try {
    await syncRealTimeEvents();
  } catch (e) {
    console.error("syncRealTimeEvents error:", e);
  }
  return db.select().from(events).where(and(eq(events.published, true), gte(events.startsAt, new Date()))).orderBy(asc(events.startsAt)).limit(limit);
}

export async function listGuides() {
  await ensureSeeded();
  return db.select().from(guides).where(eq(guides.status, "approved")).orderBy(desc(guides.createdAt));
}

export async function getGuide(id: string) {
  await ensureSeeded();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [g] = await db.select().from(guides).where(and(eq(guides.id, id), eq(guides.status, "approved")));
  return g ?? null;
}

export async function listProducts() {
  await ensureSeeded();
  return db
    .select({ p: products, s: sellers })
    .from(products)
    .innerJoin(sellers, eq(sellers.id, products.sellerId))
    .where(and(eq(products.published, true), eq(sellers.status, "approved")))
    .orderBy(desc(products.createdAt));
}

export async function getProduct(id: string) {
  await ensureSeeded();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = await db
    .select({ p: products, s: sellers })
    .from(products)
    .innerJoin(sellers, eq(sellers.id, products.sellerId))
    .where(and(eq(products.id, id), eq(products.published, true), eq(sellers.status, "approved")));
  return rows[0] ?? null;
}

export async function listSellers() {
  await ensureSeeded();
  return db.select().from(sellers).where(eq(sellers.status, "approved"));
}

export async function nearbyOf(lat: number, lng: number, opts: { radiusKm?: number; excludeSlug?: string } = {}) {
  const radius = opts.radiusKm ?? 4;
  const [ds, as, ms] = await Promise.all([listDestinations(), listAttractions(), listMarkets()]);
  const items = [
    ...ds.map((d) => ({ kind: "destination" as const, slug: d.slug, name: d.name, type: d.category, lat: d.lat, lng: d.lng, description: d.summary, image: d.image })),
    ...as.map((a) => ({ kind: "attraction" as const, slug: a.slug, name: a.name, type: a.type, lat: a.lat, lng: a.lng, description: a.description, image: null as string | null })),
    ...ms.map((m) => ({ kind: "market" as const, slug: m.slug, name: m.name, type: "market", lat: m.lat, lng: m.lng, description: m.description, image: m.image })),
  ];
  return items
    .filter((i) => i.slug !== opts.excludeSlug)
    .map((i) => ({ ...i, km: haversineKm({ lat, lng }, i) }))
    .filter((i) => i.km <= radius)
    .sort((a, b) => a.km - b.km);
}

export async function savedIds(userId: string) {
  const rows = await db.select().from(savedItems).where(eq(savedItems.userId, userId));
  return rows;
}

export async function destinationsBySlugs(slugs: string[]) {
  if (!slugs.length) return [];
  return db.select().from(destinations).where(inArray(destinations.slug, slugs));
}

export const countSql = sql<number>`count(*)::int`;

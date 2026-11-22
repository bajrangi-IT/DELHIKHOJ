import fs from "node:fs";
import path from "node:path";
import { destinationSeed, attractionSeed, marketSeed } from "../src/lib/delhi-data";
import { assets, getMonumentImage, getMarketImage } from "../src/lib/assets";
import { eventSeed, guideSeed, sellerSeed } from "../src/lib/seed-data";

function sqlEscape(val: any, isArrayText = false): string {
  if (val === undefined) return "true";
  if (val === null) return "NULL";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (isArrayText && Array.isArray(val)) {
    return `ARRAY[${val.map((s) => `'${String(s).replace(/'/g, "''")}'`).join(", ")}]::text[]`;
  }
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

const out: string[] = [];

// 1. Destinations
for (const d of destinationSeed) {
  const img = assets.monuments[d.slug] ?? getMonumentImage(d.slug);
  const isPub = (d as any).published !== false;
  out.push(`INSERT INTO "destinations" ("slug", "name", "name_hi", "category", "era", "locality", "address", "lat", "lng", "image", "summary", "why_visit", "history", "architecture", "facts", "sources", "hours", "fee", "rules", "facilities", "accessibility", "ticket_url", "ticket_provider", "unesco", "published", "sort_order")
VALUES (${sqlEscape(d.slug)}, ${sqlEscape(d.name)}, ${sqlEscape(d.nameHi)}, ${sqlEscape(d.category)}, ${sqlEscape(d.era)}, ${sqlEscape(d.locality)}, ${sqlEscape(d.address)}, ${d.lat}, ${d.lng}, ${sqlEscape(img)}, ${sqlEscape(d.summary)}, ${sqlEscape(d.whyVisit)}, ${sqlEscape(d.history)}, ${sqlEscape(d.architecture)}, ${sqlEscape(d.facts)}, ${sqlEscape(d.sources)}, ${sqlEscape(d.hours)}, ${sqlEscape(d.fee)}, ${sqlEscape(d.rules)}, ${sqlEscape(d.facilities)}, ${sqlEscape(d.accessibility)}, ${sqlEscape(d.ticketUrl)}, ${sqlEscape(d.ticketProvider)}, ${Boolean(d.unesco)}, ${isPub}, ${(d as any).sortOrder ?? 100})
ON CONFLICT ("slug") DO UPDATE SET "image" = EXCLUDED."image", "summary" = EXCLUDED."summary";`);
}

// 2. Attractions
for (const a of attractionSeed) {
  const isPub = (a as any).published !== false;
  out.push(`INSERT INTO "attractions" ("slug", "name", "type", "locality", "description", "lat", "lng", "published")
VALUES (${sqlEscape(a.slug)}, ${sqlEscape(a.name)}, ${sqlEscape(a.type)}, ${sqlEscape(a.locality)}, ${sqlEscape(a.description)}, ${a.lat}, ${a.lng}, ${isPub})
ON CONFLICT ("slug") DO NOTHING;`);
}

// 3. Markets
for (const m of marketSeed) {
  const img = m.image ? (assets.markets[m.image] ?? assets.markets[m.slug] ?? getMarketImage(m.slug)) : getMarketImage(m.slug);
  const isPub = (m as any).published !== false;
  out.push(`INSERT INTO "markets" ("slug", "name", "locality", "speciality", "description", "image", "lat", "lng", "hours", "published")
VALUES (${sqlEscape(m.slug)}, ${sqlEscape(m.name)}, ${sqlEscape(m.locality)}, ${sqlEscape(m.speciality)}, ${sqlEscape(m.description)}, ${sqlEscape(img)}, ${m.lat}, ${m.lng}, ${sqlEscape(m.hours)}, ${isPub})
ON CONFLICT ("slug") DO UPDATE SET "image" = EXCLUDED."image";`);
}

// 4. Demo Events
const events = eventSeed();
for (const e of events) {
  out.push(`INSERT INTO "events" ("title", "type", "description", "image", "venue", "locality", "lat", "lng", "starts_at", "ends_at", "is_free", "price_note", "family_friendly", "organiser", "source_url", "booking_url", "is_demo", "published")
VALUES (${sqlEscape(e.title)}, ${sqlEscape(e.type)}, ${sqlEscape(e.description)}, ${sqlEscape(e.image)}, ${sqlEscape(e.venue)}, ${sqlEscape(e.locality)}, ${e.lat}, ${e.lng}, ${sqlEscape(e.startsAt.toISOString())}, NULL, ${e.isFree}, ${sqlEscape(e.priceNote)}, ${e.familyFriendly}, ${sqlEscape(e.organiser)}, ${sqlEscape(e.sourceUrl)}, ${sqlEscape(e.bookingUrl)}, true, true);`);
}

// 5. Demo Guides
for (const g of guideSeed) {
  out.push(`INSERT INTO "guides" ("name", "bio", "image", "languages", "specialities", "areas", "experience_years", "tour_types", "price_note", "availability", "contact_email", "status", "is_demo")
VALUES (${sqlEscape(g.name)}, ${sqlEscape(g.bio)}, NULL, ${sqlEscape(g.languages, true)}, ${sqlEscape(g.specialities, true)}, ${sqlEscape(g.areas, true)}, ${g.experienceYears}, ${sqlEscape(g.tourTypes, true)}, ${sqlEscape(g.priceNote)}, 'Send a request with your preferred date', 'demo-guide@delhikikhoj.test', 'approved', true);`);
}

// 6. Demo Users
const demoUsers = [
  { email: "demo@delhikikhoj.test", fullName: "Demo Traveller", role: "tourist", passwordHash: "6168942468ea6a8f60163b3554e60d77:e6d7c795509edf2aff68bb3df5f1aa29629dfc058136eb8985a64ee62308305cfd0f5a9277c3a79ce52f798821888a55d0047e9f4c65b3fc6c6d0000d5d5d07e" },
  { email: "admin@delhikikhoj.test", fullName: "Demo Admin", role: "admin", passwordHash: "ee6d6eb9684947354a60f5fb43798ad9:0342e173cee44cbb4f550ed2e35ba2dd17be3250cada029f201a8af7bcbb8cb5a83d33d4f30353b431a2c1105c6d4e8157d170b64b7b27a7e1391556cabfe94b" },
  { email: "guide@delhikikhoj.test", fullName: "Demo Guide Account", role: "guide", passwordHash: "cdb5516cc15a1cb5b4d1f91fd735fe8a:3188131a5b2318509304b70b31c827bb5047f1942de6da7dc158fba578e65c3148f13f0f667d2c9d469af4baaab8a83dc7ecda60932faa6e4c092d0f26bb1d6e" },
  { email: "seller@delhikikhoj.test", fullName: "Demo Seller Account", role: "seller", passwordHash: "da2c05c2ec4d45624dd75ab298fab09f:f59b9997a8e6b4522f1e65a95d9f85083372306e715e15b9dadf6d1f1830309f5c2172ba8803f5778e57dc5db531df698e8c4913cf08bf9c69d85f004edea8f1" },
];

for (const u of demoUsers) {
  out.push(`INSERT INTO "users" ("email", "full_name", "role", "password_hash", "onboarded", "is_demo")
VALUES (${sqlEscape(u.email)}, ${sqlEscape(u.fullName)}, ${sqlEscape(u.role)}, ${sqlEscape(u.passwordHash)}, true, true)
ON CONFLICT ("email") DO NOTHING;`);
}

// 7. Demo Sellers and Products
for (const s of sellerSeed) {
  out.push(`INSERT INTO "sellers" ("slug", "business_name", "locality", "description", "image", "contact_email", "contact_phone", "status", "is_demo")
VALUES (${sqlEscape(s.slug)}, ${sqlEscape(s.businessName)}, ${sqlEscape(s.locality)}, ${sqlEscape(s.description)}, ${sqlEscape(s.image)}, 'artisan@delhikikhoj.test', '+91 98111 00000', 'approved', true)
ON CONFLICT ("slug") DO NOTHING;`);

  for (const p of s.products) {
    out.push(`INSERT INTO "products" ("seller_id", "name", "description", "category", "price_inr", "image", "availability", "published")
SELECT "id", ${sqlEscape(p.name)}, ${sqlEscape(p.description)}, ${sqlEscape(p.category)}, 1200, ${sqlEscape(p.image)}, 'available', true
FROM "sellers" WHERE "slug" = ${sqlEscape(s.slug)};`);
  }
}

const outputPath = path.resolve(process.cwd(), "drizzle/seed.sql");
fs.writeFileSync(outputPath, out.join("\n\n"), "utf8");
console.log(`Generated ${out.length} seed statements in ${outputPath}`);

import { fail, ok, parseBody, z } from "@/lib/api";
import { getDestination, nearbyOf } from "@/lib/queries";
import { haversineKm } from "@/lib/utils";
import type { Stop } from "@/db/schema";

const schema = z.object({
  destinationSlug: z.string().min(1, "Choose a destination"),
  start: z.object({ name: z.string(), lat: z.number(), lng: z.number() }),
  duration: z.enum(["half-day", "full-day", "multi-day"]),
  days: z.number().int().min(2).max(5).default(2),
  travellers: z.number().int().min(1).max(30).default(2),
  budget: z.enum(["budget", "mid", "premium"]).default("mid"),
  interests: z.array(z.string()).max(8).default([]),
  walking: z.enum(["low", "medium", "high"]).default("medium"),
  transport: z.enum(["driving", "transit", "walking", "bicycling"]).default("transit"),
  date: z.string().optional(),
});

const INTEREST_TYPES: Record<string, string[]> = {
  history: ["monument", "memorial", "religious"],
  architecture: ["monument", "religious", "memorial"],
  food: ["restaurant", "cafe", "market"],
  markets: ["market"],
  photography: ["garden", "hidden", "monument"],
  family: ["garden", "museum"],
  culture: ["cultural", "museum"],
  nature: ["garden"],
};
const VISIT_MIN: Record<string, number> = { monument: 90, memorial: 40, religious: 45, museum: 90, garden: 60, market: 60, restaurant: 50, cafe: 40, cultural: 45, hidden: 45 };
const SPEED_KMH = { walking: 4.5, bicycling: 12, transit: 18, driving: 22 };

export async function POST(req: Request) {
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  const c = p.data;
  const main = await getDestination(c.destinationSlug);
  if (!main) return fail("Destination not found", 404);

  const radius = c.walking === "low" ? 3 : c.walking === "medium" ? 5 : 8;
  const pool = await nearbyOf(main.lat, main.lng, { radiusKm: c.duration === "multi-day" ? 25 : radius, excludeSlug: main.slug });
  const wanted = new Set(c.interests.flatMap((i) => INTEREST_TYPES[i] ?? []));
  const scored = pool
    .map((i) => ({ i, s: (wanted.has(i.type) ? 5 : 0) + (i.kind === "destination" ? 2 : 0) - i.km * 0.4 }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.i);

  const dayCount = c.duration === "multi-day" ? c.days : 1;
  const minutesPerDay = c.duration === "half-day" ? 240 : 480;
  const speed = SPEED_KMH[c.transport];
  const legMinutes = (km: number) => Math.max(5, Math.round(((km * 1.35) / speed) * 60)); // 1.35 = road-detour factor assumption

  const used = new Set<string>([main.slug]);
  const days: { stops: Stop[]; legs: { km: number; minutes: number }[] }[] = [];
  let anchor = { lat: main.lat, lng: main.lng };

  for (let d = 0; d < dayCount; d++) {
    const stops: Stop[] = [];
    const legs: { km: number; minutes: number }[] = [];
    let used_min = 0;
    let cur = d === 0 ? { lat: main.lat, lng: main.lng } : anchor;
    const first = d === 0
      ? { kind: "destination" as const, slug: main.slug, name: main.name, lat: main.lat, lng: main.lng, type: main.category }
      : null;
    if (first) {
      stops.push({ id: crypto.randomUUID(), kind: first.kind, slug: first.slug, name: first.name, lat: first.lat, lng: first.lng, minutes: VISIT_MIN[first.type] ?? 60, note: "Your main destination" });
      used_min += VISIT_MIN[first.type] ?? 60;
    }
    const candidates = scored.filter((s) => !used.has(s.slug));
    while (candidates.length) {
      // nearest-neighbour among the top-scored candidates keeps the route compact
      const top = candidates.slice(0, 6).map((x) => ({ x, km: haversineKm(cur, x) })).sort((a, b) => a.km - b.km)[0];
      const visit = VISIT_MIN[top.x.type] ?? 45;
      const leg = stops.length ? legMinutes(top.km) : 0;
      if (used_min + visit + leg > minutesPerDay) break;
      candidates.splice(candidates.indexOf(top.x), 1);
      used.add(top.x.slug);
      if (stops.length) legs.push({ km: +top.km.toFixed(1), minutes: leg });
      stops.push({ id: crypto.randomUUID(), kind: top.x.kind, slug: top.x.slug, name: top.x.name, lat: top.x.lat, lng: top.x.lng, minutes: visit, note: top.x.type });
      used_min += visit + leg;
      cur = top.x;
    }
    anchor = cur;
    days.push({ stops, legs });
  }

  const title = `${main.name} — ${c.duration.replace("-", " ")} plan`;
  return ok({
    title,
    config: c,
    days,
    firstLeg: { km: +haversineKm(c.start, main).toFixed(1), minutes: legMinutes(haversineKm(c.start, main)) },
    assumptions: [
      "Distances are straight-line (haversine); travel times add a 1.35 detour factor and average speeds — they are estimates, not routed times. Use the route links for live directions.",
      "Opening hours, entry fees and ticket availability are NOT included because they are not verified in this app. Use each stop's official link.",
      `Budget tier selected: ${c.budget}. No costs are invented — check fees with the official providers; budget for ${c.travellers} traveller(s) is yours to set.`,
    ],
  });
}

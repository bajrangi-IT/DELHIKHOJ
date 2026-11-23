import "server-only";
import { listAttractions, listDestinations, listMarkets, nearbyOf } from "@/lib/queries";
import { REAL_DELHI_LIVE_EVENTS } from "@/lib/live-events";
import { getLiveDelhiKnowledge, findNearbyLandmarks, LiveDelhiEntity } from "@/lib/live-knowledge";

const STOP = new Set("the a an in at to of for is are what where how do i me my want go visit best near about tell show can you which with and or on from".split(" "));
const TYPE_WORDS: Record<string, string[]> = {
  restaurant: ["food", "eat", "restaurant", "lunch", "dinner", "kebab", "paratha", "hungry", "street"],
  cafe: ["cafe", "coffee", "tea"],
  market: ["market", "shopping", "shop", "buy", "bazaar", "souvenir", "craft", "handicraft", "spice"],
  garden: ["garden", "park", "nature", "walk", "peaceful", "quiet", "birds"],
  museum: ["museum", "gallery", "art", "exhibit"],
  religious: ["mosque", "masjid", "temple", "gurdwara", "gurudwara", "prayer"],
  memorial: ["memorial", "war", "soldier", "lutyens", "colonial"],
  hidden: ["hidden", "offbeat", "lesser", "secret", "local"],
  cultural: ["culture", "cultural", "observatory", "gurdwara", "convention", "mandapam"],
  monument: ["monument", "fort", "tomb", "minar", "mughal", "sultanate", "unesco", "history", "historic", "heritage", "baoli", "stepwell"],
  event: ["event", "fair", "trade", "iitf", "expo", "festival", "show", "exhibition", "mela", "walk"],
};

export type Hit = {
  kind: "destination" | "attraction" | "market" | "event" | "live";
  slug: string;
  name: string;
  nameHi?: string | null;
  type: string;
  locality: string | null;
  lat: number;
  lng: number;
  description: string;
  href: string;
  score: number;
  image?: string | null;
  venue?: string | null;
  isLive?: boolean;
};

export function tokenize(q: string) {
  return q.toLowerCase().split(/[^a-z0-9\u0900-\u097f']+/).filter((t) => t && !STOP.has(t));
}

export async function searchCorpus(q: string, limit = 8): Promise<Hit[]> {
  const cleanQ = q.trim().toLowerCase();
  const tokens = tokenize(q);
  if (!tokens.length) return [];

  const wantedTypes = new Set<string>();
  for (const [type, words] of Object.entries(TYPE_WORDS)) {
    if (tokens.some((t) => words.includes(t))) wantedTypes.add(type);
  }

  const [ds, as, ms] = await Promise.all([listDestinations(), listAttractions(), listMarkets()]);

  const rows: Omit<Hit, "score">[] = [
    // Destinations
    ...ds.map((d) => ({
      kind: "destination" as const,
      slug: d.slug,
      name: d.name,
      nameHi: d.nameHi,
      type: d.category,
      locality: d.locality,
      lat: d.lat,
      lng: d.lng,
      image: d.image,
      href: `/destination/${d.slug}`,
      description: [d.summary, d.whyVisit, d.history, d.era, ...d.facts].filter(Boolean).join(" "),
    })),
    // Live Events
    ...REAL_DELHI_LIVE_EVENTS.map((e) => ({
      kind: "event" as const,
      slug: e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: e.title,
      type: "event",
      locality: e.locality,
      lat: e.lat,
      lng: e.lng,
      image: e.image,
      href: `/events`,
      venue: e.venue,
      isLive: true,
      description: `${e.description} Venue: ${e.venue}. Organiser: ${e.organiser}. Price: ${e.isFree ? "Free" : e.priceNote ?? "Ticketed"}.`,
    })),
    // Attractions
    ...as.map((a) => ({
      kind: "attraction" as const,
      slug: a.slug,
      name: a.name,
      type: a.type,
      locality: a.locality,
      lat: a.lat,
      lng: a.lng,
      href: `/nearby?focus=${a.slug}`,
      description: a.description,
    })),
    // Markets
    ...ms.map((m) => ({
      kind: "market" as const,
      slug: m.slug,
      name: m.name,
      type: "market",
      locality: m.locality,
      lat: m.lat,
      lng: m.lng,
      image: m.image ? `/assets/markets/${m.image}.jpg` : undefined,
      href: `/market/${m.slug}`,
      description: `${m.description} ${m.speciality}`,
    })),
  ];

  const scored = rows.map((r) => {
    const nameLower = `${r.name} ${r.nameHi ?? ""}`.toLowerCase();
    const locLower = (r.locality ?? "").toLowerCase();
    const textLower = r.description.toLowerCase();
    let score = 0;

    // Direct whole-phrase matches get huge boost
    if (nameLower.includes(cleanQ)) score += 30;
    if (cleanQ.includes(nameLower)) score += 25;
    if (nameLower.startsWith(cleanQ)) score += 15;

    for (const t of tokens) {
      if (nameLower.includes(t)) score += 10;
      if (locLower.includes(t)) score += 4;
      if (r.type.includes(t)) score += 4;
      if (textLower.includes(t)) score += 1.5;
    }
    if (wantedTypes.has(r.type)) score += 4;
    return { ...r, score };
  });

  const matched = scored.filter((s) => s.score >= 4).sort((a, b) => b.score - a.score);

  // Check Live Knowledge for exact or high-confidence entity resolution
  try {
    const live = await getLiveDelhiKnowledge(q);
    if (live) {
      const existingIdx = matched.findIndex((m) => m.name.toLowerCase() === live.name.toLowerCase());
      if (existingIdx >= 0) {
        // Boost existing item to top
        const item = matched.splice(existingIdx, 1)[0];
        item.score = 200;
        matched.unshift(item);
      } else {
        // Prepend live entity
        matched.unshift({
          kind: live.kind === "event" ? "event" : "destination",
          slug: live.slug,
          name: live.name,
          nameHi: live.nameHi,
          type: live.category,
          locality: live.locality ?? "Delhi NCR",
          lat: live.lat,
          lng: live.lng,
          image: live.image,
          href: live.external ? live.sourceUrl : (live.kind === "event" ? "/events" : `/destination/${live.slug}`),
          venue: live.venue,
          description: live.summary,
          score: 200,
        });
      }
    }
  } catch {
    // ignore
  }

  return matched.slice(0, limit);
}

export async function answerQuestion(question: string) {
  const cleanQ = question.trim();
  // 1. Check live knowledge first for exact entity resolution
  const live = await getLiveDelhiKnowledge(cleanQ);

  if (live) {
    const nearby = await findNearbyLandmarks(live.lat, live.lng, 4);
    return {
      liveEntity: live,
      dest: live.kind === "destination" && !live.external ? {
        slug: live.slug,
        name: live.name,
        nameHi: live.nameHi,
        summary: live.summary,
        facts: live.facts,
        image: live.image,
        locality: live.locality,
        sources: [{ title: `${live.name} - Official Information`, publisher: live.publisher, url: live.sourceUrl, checked: null }],
        lat: live.lat,
        lng: live.lng,
        fee: live.ticketNote ?? "Check official venue",
        hours: live.timings ?? "Check schedule",
      } : null,
      nearby,
      hits: await searchCorpus(cleanQ, 5),
    };
  }

  // 2. Fallback to corpus search
  const hits = await searchCorpus(cleanQ, 6);
  const dests = await listDestinations();
  const top = hits.find((h) => h.kind === "destination" && h.score >= 10);
  const dest = top ? dests.find((d) => d.slug === top.slug) ?? null : null;
  const nearby = dest ? (await nearbyOf(dest.lat, dest.lng, { radiusKm: 3, excludeSlug: dest.slug })).slice(0, 5) : [];

  return { liveEntity: null, dest, nearby, hits };
}

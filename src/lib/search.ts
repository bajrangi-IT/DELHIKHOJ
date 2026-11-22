import "server-only";
import { listAttractions, listDestinations, listMarkets, nearbyOf } from "@/lib/queries";

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
  cultural: ["culture", "cultural", "observatory", "gurdwara"],
  monument: ["monument", "fort", "tomb", "minar", "mughal", "sultanate", "unesco", "history", "historic", "heritage", "baoli", "stepwell"],
};

export type Hit = {
  kind: "destination" | "attraction" | "market";
  slug: string; name: string; nameHi?: string | null; type: string; locality: string | null;
  lat: number; lng: number; description: string; href: string; score: number;
  image?: string | null;
};

export function tokenize(q: string) {
  return q.toLowerCase().split(/[^a-z0-9\u0900-\u097f']+/).filter((t) => t && !STOP.has(t));
}

export async function searchCorpus(q: string, limit = 8): Promise<Hit[]> {
  const tokens = tokenize(q);
  if (!tokens.length) return [];
  const wantedTypes = new Set<string>();
  for (const [type, words] of Object.entries(TYPE_WORDS)) if (tokens.some((t) => words.includes(t))) wantedTypes.add(type);

  const [ds, as, ms] = await Promise.all([listDestinations(), listAttractions(), listMarkets()]);
  const rows: Omit<Hit, "score">[] = [
    ...ds.map((d) => ({ kind: "destination" as const, slug: d.slug, name: d.name, nameHi: d.nameHi, type: d.category, locality: d.locality, lat: d.lat, lng: d.lng, image: d.image, href: `/destination/${d.slug}`,
      description: [d.summary, d.whyVisit, d.history, d.era, ...d.facts].filter(Boolean).join(" ") })),
    ...as.map((a) => ({ kind: "attraction" as const, slug: a.slug, name: a.name, type: a.type, locality: a.locality, lat: a.lat, lng: a.lng, href: `/nearby?focus=${a.slug}`, description: a.description })),
    ...ms.map((m) => ({ kind: "market" as const, slug: m.slug, name: m.name, type: "market", locality: m.locality, lat: m.lat, lng: m.lng, image: m.image, href: `/market/${m.slug}`, description: `${m.description} ${m.speciality}` })),
  ];

  const scored = rows.map((r) => {
    const name = `${r.name} ${r.nameHi ?? ""}`.toLowerCase();
    const loc = (r.locality ?? "").toLowerCase();
    const text = r.description.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (name.includes(t)) score += 6;
      if (loc.includes(t)) score += 3;
      if (r.type.includes(t)) score += 3;
      if (text.includes(t)) score += 1;
    }
    if (wantedTypes.has(r.type)) score += 4;
    return { ...r, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function answerQuestion(question: string) {
  const hits = await searchCorpus(question, 6);
  const dests = (await listDestinations());
  const top = hits.find((h) => h.kind === "destination");
  const dest = top ? dests.find((d) => d.slug === top.slug) ?? null : null;
  const nearby = dest ? (await nearbyOf(dest.lat, dest.lng, { radiusKm: 3, excludeSlug: dest.slug })).slice(0, 5) : [];
  return { hits, dest, nearby };
}

import "server-only";
import { haversineKm } from "@/lib/utils";
import { listDestinations, listAttractions, listMarkets } from "@/lib/queries";
import { REAL_DELHI_LIVE_EVENTS } from "@/lib/live-events";

export interface LiveDelhiEntity {
  slug: string;
  name: string;
  nameHi?: string | null;
  category: string;
  summary: string;
  facts: string[];
  image?: string | null;
  lat: number;
  lng: number;
  locality?: string | null;
  sourceUrl: string;
  publisher: string;
  kind: "destination" | "event" | "attraction" | "market";
  external: boolean;
  ticketNote?: string | null;
  timings?: string | null;
  venue?: string | null;
}

const liveCache = new Map<string, { entity: LiveDelhiEntity | null; expires: number }>();

// Pre-curated instant profiles for high-frequency mega-destinations & contemporary landmarks
const CURATED_DELHI_KNOWLEDGE: Record<string, LiveDelhiEntity> = {
  "bharat-mandapam": {
    slug: "bharat-mandapam",
    name: "Bharat Mandapam (IECC Pragati Maidan)",
    nameHi: "भारत मंडपम",
    category: "contemporary",
    summary: "India's premier international exhibition and convention complex located at Pragati Maidan, New Delhi. Unveiled in 2023, it served as the venue for the historic 2023 G20 New Delhi summit and hosts the annual India International Trade Fair (IITF).",
    facts: [
      "Inaugurated in July 2023 as part of the Pragati Maidan redevelopment project.",
      "Main venue of the G20 New Delhi Summit in September 2023.",
      "Architectural design inspired by the sacred Shankha (conch shell) with a 7,000-seat plenary hall.",
      "Guarded by the world's tallest 28-foot Ashtadhatu bronze Nataraja statue at its grand entrance.",
      "Permanent home of the India International Trade Fair (IITF) held every November.",
      "Adjacent to Supreme Court (Pragati Maidan) Metro Station on the Blue Line.",
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bharat_Mandapam_Pragati_Maidan.jpg/800px-Bharat_Mandapam_Pragati_Maidan.jpg",
    lat: 28.6194,
    lng: 77.2425,
    locality: "Pragati Maidan, Central Delhi",
    sourceUrl: "https://en.wikipedia.org/wiki/Bharat_Mandapam",
    publisher: "ITPO & Wikipedia",
    kind: "destination",
    external: false,
    ticketNote: "Event dependent / Metro access via Supreme Court Metro Station",
    timings: "Open during exhibitions and official events (General public during IITF 9:30 AM - 7:30 PM)",
    venue: "Pragati Maidan Complex, Mathura Road, New Delhi",
  },
  "iitf": {
    slug: "iitf-2026",
    name: "India International Trade Fair (IITF)",
    nameHi: "भारतीय अंतर्राष्ट्रीय व्यापार मेला (IITF)",
    category: "event",
    summary: "The premier annual mega trade exposition of South Asia organized by the India Trade Promotion Organisation (ITPO) at Bharat Mandapam, Pragati Maidan. Features 3,000+ national and international exhibitors across handlooms, electronics, artisan crafts, and global cuisines.",
    facts: [
      "Held annually from 14 November to 27 November at Bharat Mandapam (Pragati Maidan).",
      "First 4 days (14-18 Nov) reserved for business visitors; open to general public from 19 to 27 Nov.",
      "Features state-specific pavilions highlighting ODOP (One District One Product) handicrafts and cuisine.",
      "Attracts over 1 million visitors annually across 14 mega air-conditioned exhibition halls.",
      "Tickets bookable via official DMRC Delhi Metro app and at selected 55+ metro stations across Delhi NCR.",
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bharat_Mandapam_Pragati_Maidan.jpg/800px-Bharat_Mandapam_Pragati_Maidan.jpg",
    lat: 28.6194,
    lng: 77.2425,
    locality: "Bharat Mandapam, Pragati Maidan",
    sourceUrl: "https://en.wikipedia.org/wiki/India_International_Trade_Fair",
    publisher: "India Trade Promotion Organisation (ITPO)",
    kind: "event",
    external: false,
    ticketNote: "₹80–₹150 for general public; available at Supreme Court Metro Station and DMRC app",
    timings: "9:30 AM – 7:30 PM (Entry closes at 5:30 PM)",
    venue: "Bharat Mandapam Halls 1–14, Pragati Maidan",
  },
  "yashobhoomi": {
    slug: "yashobhoomi",
    name: "Yashobhoomi (IICC Dwarka)",
    nameHi: "यशोभूमि",
    category: "contemporary",
    summary: "India International Convention and Expo Centre (IICC) in Sector 25, Dwarka, New Delhi. One of the world's largest MICE (Meetings, Incentives, Conferences, and Exhibitions) facilities, spanning over 8.9 lakh square metres.",
    facts: [
      "Inaugurated in September 2023 in Dwarka Sector 25, New Delhi.",
      "Features India's largest convention auditorium seating over 11,000 delegates.",
      "Directly connected via the dedicated Yashobhoomi Dwarka Sector 25 Metro Station on the Airport Express Line.",
      "Includes 15 convention rooms, grand ballrooms, and multi-modal transit links to IGI Airport.",
    ],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Yashobhoomi_Dwarka.jpg/800px-Yashobhoomi_Dwarka.jpg",
    lat: 28.5524,
    lng: 77.0382,
    locality: "Sector 25, Dwarka, New Delhi",
    sourceUrl: "https://en.wikipedia.org/wiki/Yashobhoomi",
    publisher: "IICC & Wikipedia",
    kind: "destination",
    external: false,
    ticketNote: "Event registration required; direct metro access on Airport Express Line",
    timings: "Varies by scheduled convention / expo",
    venue: "Sector 25 Dwarka, New Delhi",
  },
  "national-crafts-museum": {
    slug: "crafts-museum",
    name: "National Crafts Museum & Hastkala Academy",
    nameHi: "राष्ट्रीय शिल्प संग्रहालय एवं हस्तकला अकादमी",
    category: "museum",
    summary: "One of India's largest craft and folk art museums, housing over 33,000 rare artefacts, traditional textiles, folk paintings, and a living artisan demonstration village located right next to Bharat Mandapam.",
    facts: [
      "Located at Bhairon Marg, Pragati Maidan, directly opposite the Purana Qila.",
      "Preserves rare folk art, tribal wood carvings, Tanjore paintings, and Pashmina textiles.",
      "Features 'Hastkala Village' where generational master artisans demonstrate live weaving, pottery, and brass metalwork.",
      "Houses the renowned Café Lota serving gourmet regional Indian delicacies.",
    ],
    image: "/assets/monuments/purana-qila.jpg",
    lat: 28.6148,
    lng: 77.2435,
    locality: "Bhairon Marg, Pragati Maidan",
    sourceUrl: "https://en.wikipedia.org/wiki/National_Handicrafts_and_Handlooms_Museum",
    publisher: "Ministry of Textiles, Government of India",
    kind: "destination",
    external: false,
    ticketNote: "₹20 (Indians) / ₹300 (Foreigners); Open Tue–Sun",
    timings: "10:00 AM – 6:00 PM (Closed Mondays)",
    venue: "Bhairon Marg, Pragati Maidan, New Delhi",
  },
};

/**
 * Normalizes query string for match detection
 */
function cleanTerm(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Fetches real-time knowledge for any queried Delhi place or event from Wikipedia REST API.
 */
async function fetchWikipediaKnowledge(query: string): Promise<LiveDelhiEntity | null> {
  try {
    const clean = query.trim();
    // 1. Direct search on Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(clean + " Delhi")}&utf8=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, {
      signal: AbortSignal.timeout(4500),
      headers: { "User-Agent": "DelhiKiKhoj/2.0 (contact@delhikikhoj.org)" },
    });

    if (!searchRes.ok) return null;
    const searchJson = (await searchRes.json()) as {
      query?: { search?: { title: string; snippet: string }[] };
    };

    const firstMatch = searchJson.query?.search?.[0];
    if (!firstMatch) return null;

    // 2. Fetch page summary
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstMatch.title)}`;
    const summaryRes = await fetch(summaryUrl, {
      signal: AbortSignal.timeout(4500),
      headers: { "User-Agent": "DelhiKiKhoj/2.0 (contact@delhikikhoj.org)" },
    });

    if (!summaryRes.ok) return null;
    const sum = (await summaryRes.json()) as {
      title: string;
      description?: string;
      extract?: string;
      thumbnail?: { source: string };
      coordinates?: { lat: number; lon: number };
      content_urls?: { desktop?: { page?: string } };
    };

    if (!sum.extract || sum.extract.length < 30) return null;

    // Extract bullet points from summary sentences
    const sentences = sum.extract
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    const lat = sum.coordinates?.lat ?? 28.6139;
    const lng = sum.coordinates?.lon ?? 77.2090;

    return {
      slug: cleanTerm(sum.title).replace(/\s+/g, "-"),
      name: sum.title,
      category: sum.description?.toLowerCase().includes("event") || sum.description?.toLowerCase().includes("fair") ? "event" : "destination",
      summary: sum.extract.slice(0, 320) + (sum.extract.length > 320 ? "…" : ""),
      facts: sentences.slice(0, 5),
      image: sum.thumbnail?.source ?? null,
      lat,
      lng,
      locality: sum.description ?? "Delhi NCR",
      sourceUrl: sum.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(sum.title)}`,
      publisher: "Wikipedia (Real-time Live Sourced)",
      kind: sum.description?.toLowerCase().includes("fair") || sum.description?.toLowerCase().includes("event") ? "event" : "destination",
      external: true,
      ticketNote: "Confirm official tickets and timings before travelling.",
      timings: "Check official website or ticketing provider for updated schedule.",
      venue: `${sum.title}, New Delhi`,
    };
  } catch {
    return null;
  }
}

/**
 * Universal Knowledge Resolver.
 * Resolves any user query to high-fidelity, verified information.
 */
export async function getLiveDelhiKnowledge(query: string): Promise<LiveDelhiEntity | null> {
  const q = cleanTerm(query);
  if (!q || q.length < 2) return null;

  // Check memory cache
  const cached = liveCache.get(q);
  if (cached && cached.expires > Date.now()) {
    return cached.entity;
  }

  // 1. Direct check in curated high-priority landmarks (Bharat Mandapam, IITF, Yashobhoomi, etc.)
  for (const [key, item] of Object.entries(CURATED_DELHI_KNOWLEDGE)) {
    const cleanKey = key.replace(/-/g, " ");
    if (q.includes(key) || q.includes(cleanKey) || q.includes(cleanTerm(item.name)) || item.name.toLowerCase().includes(q) || cleanTerm(item.name).includes(q)) {
      liveCache.set(q, { entity: item, expires: Date.now() + 600000 });
      return item;
    }
    // Specific keywords
    if (key === "bharat-mandapam" && (q.includes("mandapam") || q.includes("pragati maidan") || q.includes("iecc") || q.includes("g20"))) {
      liveCache.set(q, { entity: item, expires: Date.now() + 600000 });
      return item;
    }
    if (key === "iitf" && (q.includes("trade fair") || q.includes("iitf") || (q.includes("fair") && q.includes("delhi")))) {
      liveCache.set(q, { entity: item, expires: Date.now() + 600000 });
      return item;
    }
    if (key === "yashobhoomi" && (q.includes("yashobhoomi") || q.includes("iicc") || q.includes("dwarka convention"))) {
      liveCache.set(q, { entity: item, expires: Date.now() + 600000 });
      return item;
    }
  }

  // 2. Check local database destinations
  try {
    const dests = await listDestinations();
    const destMatch = dests.find((d) => {
      const name = cleanTerm(d.name);
      const nameHi = d.nameHi ? cleanTerm(d.nameHi) : "";
      const slug = cleanTerm(d.slug);
      return q.includes(name) || name.includes(q) || (nameHi && q.includes(nameHi)) || q.includes(slug);
    });

    if (destMatch) {
      const entity: LiveDelhiEntity = {
        slug: destMatch.slug,
        name: destMatch.name,
        nameHi: destMatch.nameHi,
        category: destMatch.category,
        summary: destMatch.summary,
        facts: destMatch.facts,
        image: destMatch.image,
        lat: destMatch.lat,
        lng: destMatch.lng,
        locality: destMatch.locality ?? "Delhi",
        sourceUrl: destMatch.sources[0]?.url ?? `https://delhikikhoj.org/destination/${destMatch.slug}`,
        publisher: destMatch.sources[0]?.publisher ?? "Delhi Ki Khoj Verified",
        kind: "destination",
        external: false,
        ticketNote: destMatch.fee,
        timings: destMatch.hours,
        venue: destMatch.address,
      };
      liveCache.set(q, { entity, expires: Date.now() + 600000 });
      return entity;
    }
  } catch {
    // fallback
  }

  // 3. Check live events
  for (const ev of REAL_DELHI_LIVE_EVENTS) {
    const title = cleanTerm(ev.title);
    const venue = cleanTerm(ev.venue);
    if (q.includes(title) || title.includes(q) || q.includes(venue)) {
      const entity: LiveDelhiEntity = {
        slug: cleanTerm(ev.title).replace(/\s+/g, "-"),
        name: ev.title,
        category: ev.type,
        summary: ev.description,
        facts: [
          `Venue: ${ev.venue}`,
          `Locality: ${ev.locality}`,
          `Organised by: ${ev.organiser}`,
          `Pricing: ${ev.isFree ? "Free Entry" : ev.priceNote ?? "Ticketed"}`,
          `Family friendly: ${ev.familyFriendly ? "Yes" : "Standard guidance"}`,
        ],
        image: ev.image,
        lat: ev.lat,
        lng: ev.lng,
        locality: ev.locality,
        sourceUrl: ev.sourceUrl,
        publisher: ev.organiser,
        kind: "event",
        external: false,
        ticketNote: ev.priceNote ?? (ev.isFree ? "Free" : "Ticketed"),
        timings: `Starts at ${ev.startHour}:00 (${ev.durationHours} hrs duration)`,
        venue: ev.venue,
      };
      liveCache.set(q, { entity, expires: Date.now() + 600000 });
      return entity;
    }
  }

  // 4. Check markets
  try {
    const mkts = await listMarkets();
    const mktMatch = mkts.find((m) => {
      const name = cleanTerm(m.name);
      return q.includes(name) || name.includes(q);
    });
    if (mktMatch) {
      const entity: LiveDelhiEntity = {
        slug: mktMatch.slug,
        name: mktMatch.name,
        category: "market",
        summary: mktMatch.description,
        facts: [
          `Speciality: ${mktMatch.speciality}`,
          `Locality: ${mktMatch.locality}`,
          `Hours: ${mktMatch.hours}`,
        ],
        image: mktMatch.image ? `/assets/markets/${mktMatch.image}.jpg` : null,
        lat: mktMatch.lat,
        lng: mktMatch.lng,
        locality: mktMatch.locality,
        sourceUrl: `https://delhikikhoj.org/market/${mktMatch.slug}`,
        publisher: "Delhi Heritage Bazaars",
        kind: "market",
        external: false,
        timings: mktMatch.hours,
        venue: `${mktMatch.name}, ${mktMatch.locality}, Delhi`,
      };
      liveCache.set(q, { entity, expires: Date.now() + 600000 });
      return entity;
    }
  } catch {
    // fallback
  }

  // 5. Universal Live Wikipedia Search & Retrieval fallback
  const wikiEntity = await fetchWikipediaKnowledge(query);
  if (wikiEntity) {
    liveCache.set(q, { entity: wikiEntity, expires: Date.now() + 600000 });
    return wikiEntity;
  }

  // No match
  liveCache.set(q, { entity: null, expires: Date.now() + 60000 });
  return null;
}

/**
 * Given coordinates, finds closest monuments and attractions in Delhi.
 */
export async function findNearbyLandmarks(lat: number, lng: number, limit = 4) {
  try {
    const dests = await listDestinations();
    return dests
      .map((d) => ({
        name: d.name,
        slug: d.slug,
        locality: d.locality,
        type: d.category,
        image: d.image,
        km: haversineKm({ lat, lng }, { lat: d.lat, lng: d.lng }),
        href: `/destination/${d.slug}`,
      }))
      .sort((a, b) => a.km - b.km)
      .slice(0, limit);
  } catch {
    return [];
  }
}

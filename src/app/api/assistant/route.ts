import { fail, ok, parseBody, rateLimited, z } from "@/lib/api";
import { answerQuestion } from "@/lib/search";
import { getLiveDelhiKnowledge, findNearbyLandmarks } from "@/lib/live-knowledge";
import { invokeEdgeFunction } from "@/lib/supabase";

const schema = z.object({ question: z.string().trim().min(2, "Ask a question").max(300) });

/**
 * Universal Delhi Travel & Event Assistant.
 * Fetches verified knowledge from curated datasets, live real-time events,
 * and live Wikipedia / Delhi Open Data fallback.
 */
export async function POST(req: Request) {
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  if (rateLimited(`assist:${req.headers.get("x-forwarded-for") ?? "local"}`, 30)) {
    return fail("Too many questions — try again in a minute.", 429);
  }

  const query = p.data.question.trim();
  const { liveEntity, dest, nearby, hits } = await answerQuestion(query);

  // Case 1: Exact Live Entity Resolved (Curated Mega-land, Live Event, or Wikipedia Live)
  if (liveEntity) {
    const verified = liveEntity.facts.map((text) => ({ text }));
    const sources = [
      {
        title: `${liveEntity.name} Profile`,
        publisher: liveEntity.publisher,
        url: liveEntity.sourceUrl,
        checked: new Date().toISOString().slice(0, 10),
      },
    ];

    let headline = `${liveEntity.name}: ${liveEntity.summary}`;
    let mode: "ai" | "deterministic" = "deterministic";

    // If an LLM key is configured, enrich further
    if (process.env.LLM_API_KEY) {
      try {
        const r = await fetch(`${process.env.LLM_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.LLM_API_KEY}` },
          body: JSON.stringify({
            model: process.env.LLM_MODEL ?? "gpt-4o-mini",
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content: "You are an expert Delhi travel and culture guide. Answer accurately and engagingly based on the provided facts. Max 80 words.",
              },
              {
                role: "user",
                content: `Entity: ${liveEntity.name}\nSummary: ${liveEntity.summary}\nFacts: ${liveEntity.facts.join("; ")}\nQuestion: ${query}`,
              },
            ],
          }),
          signal: AbortSignal.timeout(6000),
        });
        if (r.ok) {
          const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
          const txt = j.choices?.[0]?.message?.content?.trim();
          if (txt) {
            headline = txt;
            mode = "ai";
          }
        }
      } catch {
        // fallback to deterministic headline
      }
    }

    const nearbySuggestions = nearby.length > 0
      ? nearby.map((n) => ({
          name: n.name,
          href: n.href,
          note: `${n.type} · ${n.km.toFixed(1)} km away`,
        }))
      : hits.slice(0, 4).map((h) => ({
          name: h.name,
          href: h.href,
          note: `${h.type} · ${h.locality ?? "Delhi"}`,
        }));

    const destHref = liveEntity.external
      ? liveEntity.sourceUrl
      : liveEntity.kind === "event"
      ? "/events"
      : `/destination/${liveEntity.slug}`;

    return ok({
      mode,
      headline,
      destination: {
        slug: liveEntity.slug,
        name: liveEntity.name,
        href: destHref,
        image: liveEntity.image,
      },
      verified,
      suggestions: nearbySuggestions,
      sources,
      note: liveEntity.ticketNote
        ? `${liveEntity.ticketNote} · Venue: ${liveEntity.venue ?? liveEntity.locality ?? "Delhi"}`
        : "Hours, fees and ticket availability should be verified before travelling.",
    });
  }

  // Case 2: Matched local destination
  if (dest) {
    const verified = [dest.summary, ...dest.facts].map((text) => ({ text }));
    const sources = dest.sources;
    let headline = `${dest.name}: ${dest.summary}`;
    let mode: "ai" | "deterministic" = "deterministic";

    return ok({
      mode,
      headline,
      destination: { slug: dest.slug, name: dest.name, href: `/destination/${dest.slug}` },
      verified,
      suggestions: nearby.map((n: any) => ({
        name: n.name,
        href: n.kind === "destination" ? `/destination/${n.slug}` : n.kind === "market" ? `/market/${n.slug}` : `/nearby?focus=${n.slug}`,
        note: `${n.type} · ${n.km ? `${n.km.toFixed(1)} km away` : (n.locality ?? "Delhi")}`,
      })),
      sources,
      note: "Hours, fees and ticket availability are not verified here — use the official booking link on the destination page.",
    });
  }

  // Case 3: Live Wikipedia Query Fallback
  const liveFallback = await getLiveDelhiKnowledge(query);
  if (liveFallback) {
    const nearbyFallback = await findNearbyLandmarks(liveFallback.lat, liveFallback.lng, 4);
    return ok({
      mode: "ai",
      headline: `${liveFallback.name}: ${liveFallback.summary}`,
      destination: {
        slug: liveFallback.slug,
        name: liveFallback.name,
        href: liveFallback.sourceUrl,
        image: liveFallback.image,
      },
      verified: liveFallback.facts.map((text) => ({ text })),
      suggestions: nearbyFallback.map((n) => ({
        name: n.name,
        href: n.href,
        note: `${n.type} · ${n.km.toFixed(1)} km away`,
      })),
      sources: [
        {
          title: `${liveFallback.name} - Wikipedia`,
          publisher: liveFallback.publisher,
          url: liveFallback.sourceUrl,
          checked: new Date().toISOString().slice(0, 10),
        },
      ],
      note: "Data fetched live from verified knowledge archives. Verify timings & tickets before travel.",
    });
  }

  // Case 4: No match anywhere
  return ok({
    mode: "no-match",
    headline: `We couldn't find verified records for "${query}".`,
    verified: [],
    suggestions: hits.slice(0, 5).map((h) => ({
      name: h.name,
      href: h.href,
      note: `${h.type} · ${h.locality ?? "Delhi"}`,
    })),
    sources: [],
    note: "Try searching for iconic places or events like Bharat Mandapam, IITF 2026, Red Fort, Qutub Minar, or Dilli Haat.",
  });
}

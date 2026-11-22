import { fail, ok, parseBody, rateLimited, z } from "@/lib/api";
import { answerQuestion } from "@/lib/search";

const schema = z.object({ question: z.string().trim().min(2, "Ask a question").max(300) });

/**
 * Travel assistant. Retrieval-first: facts come ONLY from the sourced destination database.
 * If LLM_API_KEY is configured, an LLM may rephrase them; otherwise a deterministic answer is returned.
 */
export async function POST(req: Request) {
  const p = await parseBody(req, schema);
  if ("error" in p) return p.error;
  if (rateLimited(`assist:${req.headers.get("x-forwarded-for") ?? "local"}`, 20)) return fail("Too many questions — try again in a minute.", 429);
  const { dest, nearby, hits } = await answerQuestion(p.data.question);

  if (!dest) {
    return ok({
      mode: "no-match",
      headline: "I don't have verified information for that yet.",
      verified: [],
      suggestions: hits.slice(0, 5).map((h) => ({ name: h.name, href: h.href, note: `${h.type} · ${h.locality ?? "Delhi"}` })),
      sources: [],
      note: "I only answer from sourced entries in this app's database. Try a monument name such as Red Fort or Qutub Minar.",
    });
  }

  const verified = [dest.summary, ...dest.facts].map((text) => ({ text }));
  const sources = dest.sources;
  let headline = `${dest.name}: ${dest.summary}`;
  let mode: "deterministic" | "ai" = "deterministic";

  if (process.env.LLM_API_KEY) {
    try {
      const context = [dest.summary, dest.whyVisit, dest.history, dest.architecture, ...dest.facts].filter(Boolean).join("\n");
      const r = await fetch(`${process.env.LLM_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.LLM_API_KEY}` },
        body: JSON.stringify({
          model: process.env.LLM_MODEL ?? "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            { role: "system", content: "You are a Delhi heritage guide. Answer ONLY from the CONTEXT. If the answer is not in the context, say you do not have verified information. Never invent dates, prices, opening hours, or ticket availability. Max 90 words." },
            { role: "user", content: `CONTEXT (${dest.name}):\n${context}\n\nQUESTION: ${p.data.question}` },
          ],
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (r.ok) {
        const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
        const text = j.choices?.[0]?.message?.content?.trim();
        if (text) { headline = text; mode = "ai"; }
      }
    } catch {
      /* fall back to deterministic answer */
    }
  }

  return ok({
    mode,
    headline,
    destination: { slug: dest.slug, name: dest.name, href: `/destination/${dest.slug}` },
    verified,
    suggestions: nearby.map((n) => ({ name: n.name, href: n.kind === "destination" ? `/destination/${n.slug}` : n.kind === "market" ? `/market/${n.slug}` : `/nearby?focus=${n.slug}`, note: `${n.type} · ${n.km.toFixed(1)} km away (straight-line)` })),
    sources,
    note: "Hours, fees and ticket availability are not verified here — use the official booking link on the destination page.",
  });
}

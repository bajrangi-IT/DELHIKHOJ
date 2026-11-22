import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { searchCorpus } from "@/lib/search";
import { listDestinations } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 200);
  if (!q.trim()) {
    const popular = (await listDestinations()).slice(0, 6).map((d) => ({ slug: d.slug, name: d.name, href: `/destination/${d.slug}` }));
    return ok({ results: [], popular });
  }
  const results = (await searchCorpus(q, 8)).map(({ description, ...r }) => ({ ...r, description: description.slice(0, 160) }));
  return ok({ results });
}

import { NextRequest } from "next/server";
import { ok } from "@/lib/api";

/** Place search biased to Delhi via OpenStreetMap Nominatim. Falls back to empty results (UI offers presets). */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 120);
  if (q.length < 3) return ok({ results: [] });
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&viewbox=76.8,28.9,77.4,28.4&bounded=1&q=${encodeURIComponent(q)}`,
      { headers: { "User-Agent": "TheDelhiKiKhoj/1.0 (heritage tourism app)" }, signal: AbortSignal.timeout(6000) },
    );
    if (!r.ok) throw new Error("bad status");
    const j = (await r.json()) as { display_name: string; lat: string; lon: string }[];
    return ok({ results: j.map((x) => ({ name: x.display_name.split(",").slice(0, 3).join(","), lat: +x.lat, lng: +x.lon })) });
  } catch {
    return ok({ results: [], unavailable: true });
  }
}

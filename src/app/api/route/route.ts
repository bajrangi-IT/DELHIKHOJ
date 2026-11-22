import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";

/** Distance/time from an OSRM-compatible routing provider. Never invents numbers: on failure returns available:false. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const parse = (v: string | null) => {
    const [lat, lng] = (v ?? "").split(",").map(Number);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  };
  const from = parse(sp.get("from"));
  const to = parse(sp.get("to"));
  if (!from || !to) return fail("from and to must be 'lat,lng'");
  const mode = sp.get("mode") === "walking" ? "foot" : sp.get("mode") === "bicycling" ? "bike" : "driving";
  const base = process.env.OSRM_BASE_URL ?? "https://router.project-osrm.org";
  try {
    const r = await fetch(`${base}/route/v1/${mode}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`, {
      signal: AbortSignal.timeout(7000),
      headers: { "User-Agent": "TheDelhiKiKhoj/1.0" },
    });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const j = (await r.json()) as { routes?: { distance: number; duration: number }[] };
    const route = j.routes?.[0];
    if (!route) throw new Error("no route");
    return ok({ available: true, provider: "OSRM (OpenStreetMap data)", distanceKm: +(route.distance / 1000).toFixed(1), minutes: Math.round(route.duration / 60), mode });
  } catch {
    return ok({ available: false, provider: "OSRM", reason: "Routing provider unavailable right now. Use the Google Maps link for live directions." });
  }
}

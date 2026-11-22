"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import MapView from "./MapView";
import type { MapMarker } from "./LeafletMap";
import { haversineKm } from "@/lib/utils";
import SmartImage from "@/components/SmartImage";

export type Poi = MapMarker & { locality?: string | null; category: string; image?: string | null };
const CATS: [string, string][] = [["monument", "Heritage monuments"], ["museum", "Museums"], ["market", "Markets"], ["restaurant", "Restaurants"], ["cafe", "Cafes"], ["garden", "Gardens"], ["event", "Cultural events"], ["hidden", "Local experiences"], ["cultural", "Cultural sites"]];

export default function NearbyExplorer({ pois, focus }: { pois: Poi[]; focus?: string }) {
  const [on, setOn] = useState<Set<string>>(new Set(CATS.map((c) => c[0])));
  const [loc, setLoc] = useState("");
  const [view, setView] = useState<"map" | "list">("map");
  const [src, setSrc] = useState<"osm" | "google">("osm");
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(0);
  const [msg, setMsg] = useState("");

  const shown = useMemo(() => {
    let r = pois.filter((p) => on.has(p.category) || (p.category === "memorial" && on.has("monument")) || (p.category === "religious" && on.has("monument")));
    if (loc.trim()) r = r.filter((p) => `${p.locality ?? ""} ${p.name}`.toLowerCase().includes(loc.toLowerCase()));
    if (me && radius) r = r.filter((p) => haversineKm(me, p) <= radius);
    return me ? [...r].sort((a, b) => haversineKm(me, a) - haversineKm(me, b)) : r;
  }, [pois, on, loc, me, radius]);

  const markers = useMemo(() => [...shown, ...(me ? [{ id: "me", name: "You are here", type: "user", lat: me.lat, lng: me.lng }] : [])], [shown, me]);

  function near() {
    setMsg("");
    if (!navigator.geolocation) return setMsg("Location isn't supported on this device.");
    navigator.geolocation.getCurrentPosition((p) => { setMe({ lat: p.coords.latitude, lng: p.coords.longitude }); setRadius(3); }, () => setMsg("Location permission denied. You can still search by locality."));
  }
  const toggle = (k: string) => setOn((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1"><label htmlFor="loc" className="label">Search by locality or name</label><input id="loc" className="input" placeholder="e.g. Mehrauli, Old Delhi, Khan Market" value={loc} onChange={(e) => setLoc(e.target.value)} /></div>
        <button onClick={near} className="btn btn-ghost">📍 Nearby me</button>
        {me && <div><label htmlFor="rad" className="label">Radius</label><select id="rad" className="input" value={radius} onChange={(e) => setRadius(+e.target.value)}>{[1, 2, 3, 5, 10, 0].map((r) => <option key={r} value={r}>{r ? `${r} km` : "Any"}</option>)}</select></div>}
        <div className="flex rounded-full border border-ivory/20 p-1" role="group" aria-label="View mode">
          {(["map", "list"] as const).map((v) => <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={`rounded-full px-4 py-1.5 text-sm capitalize ${view === v ? "bg-gold text-ink" : ""}`}>{v}</button>)}
        </div>
        {view === "map" && (
          <div className="flex rounded-full border border-ivory/20 p-1" role="group" aria-label="Map data source">
            {([["osm", "OpenStreetMap"], ["google", "Google Maps"]] as const).map(([k, l]) => <button key={k} aria-pressed={src === k} onClick={() => setSrc(k)} className={`rounded-full px-4 py-1.5 text-sm ${src === k ? "bg-gold text-ink" : ""}`}>{l}</button>)}
          </div>
        )}
      </div>
      {msg && <p role="status" className="mt-2 text-sm text-ivory/70">{msg}</p>}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Category filters">
        {CATS.map(([k, l]) => <button key={k} onClick={() => toggle(k)} aria-pressed={on.has(k)} className={`chip min-h-9 px-4 ${on.has(k) ? "chip-on" : ""}`}>{l}</button>)}
      </div>
      <p className="mt-3 text-sm text-ivory/60" role="status">{shown.length} place(s) shown. Guides aren&apos;t pinned (they cover areas, not a fixed point) — see <Link className="text-gold underline" href="/guides">guides</Link>.</p>

      <div className={`mt-4 grid gap-4 ${view === "map" ? "lg:grid-cols-[1fr_360px]" : ""}`}>
        {view === "map" && <div className="h-[60vh] min-h-[380px] overflow-hidden rounded-2xl border border-ivory/10"><MapView markers={markers} focusId={focus} className="h-full w-full" /></div>}
        <ul className={`max-h-[60vh] space-y-2 overflow-y-auto pr-1 ${view === "list" ? "grid max-h-none gap-3 space-y-0 sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
          {shown.length === 0 && <li className="card">Nothing matches these filters. Try enabling more categories.</li>}
          {shown.map((p) => (
            <li key={p.id} className="card !p-4 flex gap-4 items-start">
              {p.image && (
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-ivory/10">
                  <SmartImage src={p.image} alt={p.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-gold">{p.category}{me ? ` · ${haversineKm(me, p).toFixed(1)} km` : ""}</p>
                <p className="font-serif text-xl truncate">{p.href ? <Link href={p.href} className="hover:text-gold">{p.name}</Link> : p.name}</p>
                {p.locality && <p className="text-xs text-ivory/50">{p.locality}</p>}
                <a className="mt-1 inline-block text-sm text-gold underline underline-offset-4" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}>Directions ↗</a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { START_PRESETS, directionsUrl } from "@/lib/utils";

type Pt = { name: string; lat: number; lng: number };
type Mode = "driving" | "walking" | "transit" | "bicycling";
type Result = { available: boolean; distanceKm?: number; minutes?: number; provider?: string; reason?: string } | null;

export default function RouteBox({ dest }: { dest: { name: string; lat: number; lng: number } }) {
  const [start, setStart] = useState<Pt>(START_PRESETS[0]);
  const [mode, setMode] = useState<Mode>("driving");
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Pt[]>([]);
  const [msg, setMsg] = useState("");
  const [res, setRes] = useState<Result>(null);
  const [busy, setBusy] = useState(false);

  async function search() {
    setMsg("");
    if (q.trim().length < 3) return setMsg("Type at least 3 characters");
    const j = await (await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)).json();
    setFound(j.results ?? []);
    if (!j.results?.length) setMsg(j.unavailable ? "Place search is unavailable right now — pick a preset instead." : "No matches in Delhi. Try another name.");
  }
  function locate() {
    setMsg("");
    if (!navigator.geolocation) return setMsg("Location is not supported on this device.");
    navigator.geolocation.getCurrentPosition(
      (p) => setStart({ name: "My location", lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setMsg("Location permission denied — choose a starting point instead."),
    );
  }
  async function getRoute() {
    setBusy(true); setRes(null);
    const m = mode === "transit" ? "driving" : mode;
    try {
      const j = await (await fetch(`/api/route?from=${start.lat},${start.lng}&to=${dest.lat},${dest.lng}&mode=${m}`)).json();
      setRes(j);
    } catch { setRes({ available: false, reason: "Network error." }); }
    setBusy(false);
  }

  return (
    <div className="card">
      <label className="label" htmlFor="start-sel">Starting point</label>
      <select id="start-sel" className="input" value={start.name} onChange={(e) => { const p = [...START_PRESETS, ...found, start].find((x) => x.name === e.target.value); if (p) setStart(p); setRes(null); }}>
        {[...START_PRESETS, ...found, ...(START_PRESETS.some((p) => p.name === start.name) || found.some((p) => p.name === start.name) ? [] : [start])].map((p) => <option key={p.name}>{p.name}</option>)}
      </select>
      <div className="mt-3 flex gap-2">
        <input className="input" aria-label="Search a starting place in Delhi" placeholder="Or search a place (e.g. Saket Metro)" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())} />
        <button type="button" onClick={search} className="btn btn-ghost">Find</button>
      </div>
      <button type="button" onClick={locate} className="mt-2 text-sm text-gold underline underline-offset-4">Use my current location</button>
      {msg && <p role="status" className="mt-2 text-sm text-ivory/70">{msg}</p>}

      <fieldset className="mt-4">
        <legend className="label">Travel mode</legend>
        <div className="flex flex-wrap gap-2">
          {(["driving", "walking", "transit", "bicycling"] as Mode[]).map((m) => (
            <button type="button" key={m} onClick={() => { setMode(m); setRes(null); }} aria-pressed={mode === m} className={`chip min-h-9 px-4 ${mode === m ? "chip-on" : ""}`}>{m === "transit" ? "Public transport" : m[0].toUpperCase() + m.slice(1)}</button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 flex flex-wrap gap-3">
        {mode !== "transit" && <button type="button" onClick={getRoute} disabled={busy} className="btn btn-gold">{busy ? "Calculating…" : "Get distance & time"}</button>}
        <a className="btn btn-ghost" target="_blank" rel="noopener noreferrer" href={directionsUrl(dest, start, mode)}>Open in Google Maps ↗</a>
      </div>
      {mode === "transit" && <p className="mt-3 text-sm text-ivory/60">Public-transport times depend on live schedules, which this app doesn&apos;t have. Google Maps will show current metro, bus and rail options.</p>}
      {res && (
        <div role="status" className="mt-4 rounded-xl border border-ivory/10 bg-ink/60 p-4">
          {res.available ? (
            <><p className="font-serif text-3xl text-gold">{res.distanceKm} km · ~{res.minutes} min</p><p className="text-xs text-ivory/50">Route estimate from {res.provider}. Real traffic is not included.</p></>
          ) : <p className="text-sm text-ivory/70">{res.reason ?? "Routing unavailable."} Use the Google Maps button for live directions.</p>}
        </div>
      )}
    </div>
  );
}

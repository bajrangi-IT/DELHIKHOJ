"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { START_PRESETS, directionsUrl, haversineKm } from "@/lib/utils";
import type { Stop } from "@/db/schema";

type Cat = { kind: Stop["kind"]; slug: string; name: string; lat: number; lng: number; type: string };
type Cfg = { destinationSlug: string; startName: string; duration: "half-day" | "full-day" | "multi-day"; days: number; travellers: number; budget: string; interests: string[]; walking: string; transport: "driving" | "transit" | "walking" | "bicycling"; date: string };
type Initial = { id: string; title: string; tripDate: string | null; stops: Stop[]; config: Record<string, unknown> } | null;

const INTERESTS = ["history", "architecture", "food", "markets", "photography", "family", "culture", "nature"];
const SPEED = { walking: 4.5, bicycling: 12, transit: 18, driving: 22 };
const MIN_PER_DAY = { "half-day": 240, "full-day": 480, "multi-day": 480 };

export default function PlanClient({ catalog, destinations, defaultDest, initial, loggedIn }: { catalog: Cat[]; destinations: { slug: string; name: string }[]; defaultDest: string; initial: Initial; loggedIn: boolean }) {
  const router = useRouter();
  const ic = (initial?.config ?? {}) as Partial<Cfg> & { dayCounts?: number[] };
  const [cfg, setCfg] = useState<Cfg>({ destinationSlug: ic.destinationSlug ?? defaultDest, startName: ic.startName ?? START_PRESETS[0].name, duration: ic.duration ?? "full-day", days: ic.days ?? 2, travellers: ic.travellers ?? 2, budget: ic.budget ?? "mid", interests: ic.interests ?? ["history"], walking: ic.walking ?? "medium", transport: ic.transport ?? "transit", date: initial?.tripDate ?? ic.date ?? "" });
  const [stops, setStops] = useState<Stop[]>(initial?.stops ?? []);
  const [dayCounts, setDayCounts] = useState<number[]>(ic.dayCounts ?? (initial ? [initial.stops.length] : []));
  const [title, setTitle] = useState(initial?.title ?? "");
  const [id, setId] = useState(initial?.id ?? null);
  const [assump, setAssump] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [add, setAdd] = useState("");

  const start = START_PRESETS.find((p) => p.name === cfg.startName) ?? START_PRESETS[0];
  const set = <K extends keyof Cfg>(k: K, v: Cfg[K]) => setCfg((c) => ({ ...c, [k]: v }));

  const days = useMemo(() => { let i = 0; return dayCounts.map((n) => { const s = stops.slice(i, i + n); i += n; return s; }); }, [stops, dayCounts]);
  const leg = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => { const km = haversineKm(a, b); return { km: +km.toFixed(1), min: Math.max(5, Math.round(((km * 1.35) / SPEED[cfg.transport]) * 60)) }; };

  async function generate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ destinationSlug: cfg.destinationSlug, start, duration: cfg.duration, days: cfg.days, travellers: cfg.travellers, budget: cfg.budget, interests: cfg.interests, walking: cfg.walking, transport: cfg.transport, date: cfg.date || undefined }) });
    const j = await r.json(); setBusy(false);
    if (!j.ok) return setMsg({ t: "err", m: j.error });
    const ds = j.days as { stops: Stop[] }[];
    setStops(ds.flatMap((d) => d.stops)); setDayCounts(ds.map((d) => d.stops.length)); setTitle(j.title); setAssump(j.assumptions); setId(null);
    setMsg({ t: "ok", m: `Generated ${ds.length} day plan with ${ds.reduce((n, d) => n + d.stops.length, 0)} stops.` });
  }

  function indexOf(day: number, i: number) { return dayCounts.slice(0, day).reduce((a, b) => a + b, 0) + i; }
  function remove(day: number, i: number) {
    const k = indexOf(day, i); setStops(stops.filter((_, x) => x !== k));
    setDayCounts(dayCounts.map((n, d) => (d === day ? n - 1 : n)).filter((n) => n > 0));
  }
  function move(day: number, i: number, dir: -1 | 1) {
    const j = i + dir; if (j < 0 || j >= dayCounts[day]) return;
    const a = indexOf(day, i), b = indexOf(day, j); const n = [...stops]; [n[a], n[b]] = [n[b], n[a]]; setStops(n);
  }
  function addStop() {
    const c = catalog.find((x) => x.slug === add); if (!c) return setMsg({ t: "err", m: "Choose a place to add" });
    if (stops.some((s) => s.slug === c.slug)) return setMsg({ t: "err", m: "That stop is already in your plan" });
    const last = Math.max(0, dayCounts.length - 1);
    const k = indexOf(last, dayCounts[last] ?? 0);
    const n = [...stops]; n.splice(k, 0, { id: crypto.randomUUID(), kind: c.kind, slug: c.slug, name: c.name, lat: c.lat, lng: c.lng, minutes: 60, note: c.type });
    setStops(n); setDayCounts(dayCounts.length ? dayCounts.map((x, d) => (d === last ? x + 1 : x)) : [1]); setAdd(""); setMsg(null);
  }
  const setMinutes = (k: number, m: number) => setStops(stops.map((s, x) => (x === k ? { ...s, minutes: Math.max(5, Math.min(600, m || 5)) } : s)));

  async function save() {
    setMsg(null);
    if (!stops.length) return setMsg({ t: "err", m: "Generate or add stops before saving" });
    if (title.trim().length < 2) return setMsg({ t: "err", m: "Give your plan a title" });
    const body = { title, tripDate: cfg.date || null, stops, config: { ...cfg, dayCounts } };
    const r = await fetch(id ? `/api/itineraries/${id}` : "/api/itineraries", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { title, tripDate: cfg.date || null, stops } : body) });
    if (r.status === 401) return router.push(`/login?next=${encodeURIComponent("/plan-trip")}`);
    const j = await r.json();
    if (!j.ok) return setMsg({ t: "err", m: j.error });
    if (!id && j.itinerary) { setId(j.itinerary.id); }
    setMsg({ t: "ok", m: "Plan saved to My Trips." }); router.refresh();
  }
  async function share() {
    const text = `${title}\n` + days.map((d, i) => `Day ${i + 1}: ${d.map((s) => s.name).join(" → ")}`).join("\n");
    try { if (navigator.share) await navigator.share({ title, text }); else { await navigator.clipboard.writeText(text); setMsg({ t: "ok", m: "Plan text copied to clipboard." }); } } catch { setMsg({ t: "err", m: "Sharing was cancelled or not available." }); }
  }
  function routeLink(d: Stop[]) {
    if (!d.length) return "#";
    const origin = d === days[0] ? `${start.lat},${start.lng}` : `${d[0].lat},${d[0].lng}`;
    const dest = d[d.length - 1];
    const wp = d.slice(0, -1).map((s) => `${s.lat},${s.lng}`).join("|");
    const p = new URLSearchParams({ api: "1", origin, destination: `${dest.lat},${dest.lng}`, travelmode: cfg.transport });
    if (wp) p.set("waypoints", wp);
    return `https://www.google.com/maps/dir/?${p}`;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={generate} className="card no-print h-fit space-y-4 lg:sticky lg:top-24">
        <h2 className="font-serif text-2xl">Your trip</h2>
        <div><label className="label" htmlFor="p-start">Starting location</label><select id="p-start" className="input" value={cfg.startName} onChange={(e) => set("startName", e.target.value)}>{START_PRESETS.map((p) => <option key={p.name}>{p.name}</option>)}</select></div>
        <div><label className="label" htmlFor="p-dest">Destination</label><select id="p-dest" className="input" value={cfg.destinationSlug} onChange={(e) => set("destinationSlug", e.target.value)}>{destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="p-date">Travel date</label><input id="p-date" type="date" className="input" value={cfg.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => set("date", e.target.value)} /></div>
          <div><label className="label" htmlFor="p-trav">Travellers</label><input id="p-trav" type="number" min={1} max={30} className="input" value={cfg.travellers} onChange={(e) => set("travellers", Math.max(1, +e.target.value || 1))} /></div>
        </div>
        <div><label className="label" htmlFor="p-dur">Duration</label><select id="p-dur" className="input" value={cfg.duration} onChange={(e) => set("duration", e.target.value as Cfg["duration"])}><option value="half-day">Half day (~4 h)</option><option value="full-day">Full day (~8 h)</option><option value="multi-day">Multi-day</option></select></div>
        {cfg.duration === "multi-day" && <div><label className="label" htmlFor="p-days">Number of days</label><input id="p-days" type="number" min={2} max={5} className="input" value={cfg.days} onChange={(e) => set("days", Math.min(5, Math.max(2, +e.target.value || 2)))} /></div>}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="p-bud">Budget range</label><select id="p-bud" className="input" value={cfg.budget} onChange={(e) => set("budget", e.target.value)}><option value="budget">Budget</option><option value="mid">Mid-range</option><option value="premium">Premium</option></select></div>
          <div><label className="label" htmlFor="p-walk">Walking</label><select id="p-walk" className="input" value={cfg.walking} onChange={(e) => set("walking", e.target.value)}><option value="low">Minimal</option><option value="medium">Moderate</option><option value="high">Love it</option></select></div>
        </div>
        <div><label className="label" htmlFor="p-tr">Preferred transport</label><select id="p-tr" className="input" value={cfg.transport} onChange={(e) => set("transport", e.target.value as Cfg["transport"])}><option value="transit">Metro / public transport</option><option value="driving">Car / cab</option><option value="walking">Walking</option><option value="bicycling">Cycling</option></select></div>
        <fieldset><legend className="label">Interests</legend><div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <button type="button" key={i} aria-pressed={cfg.interests.includes(i)} onClick={() => set("interests", cfg.interests.includes(i) ? cfg.interests.filter((x) => x !== i) : [...cfg.interests, i])} className={`chip min-h-9 px-3 capitalize ${cfg.interests.includes(i) ? "chip-on" : ""}`}>{i}</button>)}</div></fieldset>
        <button className="btn btn-gold w-full" disabled={busy}>{busy ? "Planning…" : "Generate itinerary"}</button>
      </form>

      <div>
        {msg && <p role={msg.t === "err" ? "alert" : "status"} className={`no-print mb-4 rounded-xl p-3 text-sm ${msg.t === "err" ? "bg-maroon/50 text-red-100" : "bg-emerald/25 text-emerald-100"}`}>{msg.m}</p>}
        {!stops.length ? (
          <div className="card text-center"><p className="font-serif text-3xl">Your itinerary will appear here</p><p className="mt-2 text-ivory/60">Choose a destination and press Generate. Then edit, reorder, save, share or export to PDF.</p></div>
        ) : (
          <div className="print-area space-y-6">
            <div className="no-print flex flex-wrap items-end gap-3">
              <div className="min-w-56 flex-1"><label className="label" htmlFor="p-title">Plan title</label><input id="p-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <button onClick={save} className="btn btn-gold">{id ? "Update plan" : loggedIn ? "Save plan" : "Log in to save"}</button>
              <button onClick={() => window.print()} className="btn btn-ghost">Export PDF</button>
              <button onClick={share} className="btn btn-ghost">Share</button>
            </div>
            <h2 className="hidden font-serif text-3xl print:block">{title}</h2>
            <p className="hidden text-sm print:block">Start: {start.name} · {cfg.travellers} traveller(s){cfg.date ? ` · ${cfg.date}` : ""} · The Delhi Ki Khoj</p>
            {days.map((d, di) => (
              <section key={di} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-2xl text-gold">{days.length > 1 ? `Day ${di + 1}` : cfg.duration === "half-day" ? "Half-day plan" : "Full-day plan"}</h3>
                  <p className="text-sm text-ivory/60">{d.reduce((n, s) => n + s.minutes, 0)} min at stops{d.length > 1 ? ` · ${d.slice(1).reduce((n, s, i) => n + leg(d[i], s).min, 0)} min travel (est.)` : ""} {d.reduce((n, s) => n + s.minutes, 0) > MIN_PER_DAY[cfg.duration] && <span className="tag-unverified">Over budgeted time</span>}</p>
                </div>
                {di === 0 && d[0] && <p className="mt-2 text-sm text-ivory/60">From {start.name}: ~{leg(start, d[0]).km} km straight-line, ~{leg(start, d[0]).min} min (estimate).</p>}
                <ol className="mt-4 space-y-3">
                  {d.map((s, i) => (
                    <li key={s.id}>
                      {i > 0 && <p className="mb-2 ml-4 border-l border-gold/40 pl-4 text-xs text-ivory/50">↓ ~{leg(d[i - 1], s).km} km · ~{leg(d[i - 1], s).min} min ({cfg.transport})</p>}
                      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ivory/10 bg-ink/50 p-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold font-semibold text-ink">{i + 1}</span>
                        <div className="min-w-40 flex-1"><p className="font-serif text-xl">{s.name}</p><p className="text-xs capitalize text-ivory/50">{s.note}</p></div>
                        <label className="no-print text-xs text-ivory/60">Minutes <input type="number" aria-label={`Minutes at ${s.name}`} className="input !min-h-9 !w-20 !py-1" value={s.minutes} onChange={(e) => setMinutes(indexOf(di, i), +e.target.value)} /></label>
                        <span className="hidden text-sm print:inline">{s.minutes} min</span>
                        <div className="no-print flex gap-1">
                          <button type="button" aria-label={`Move ${s.name} up`} disabled={i === 0} onClick={() => move(di, i, -1)} className="btn btn-ghost !min-h-9 !px-3">↑</button>
                          <button type="button" aria-label={`Move ${s.name} down`} disabled={i === d.length - 1} onClick={() => move(di, i, 1)} className="btn btn-ghost !min-h-9 !px-3">↓</button>
                          <button type="button" aria-label={`Remove ${s.name}`} onClick={() => remove(di, i)} className="btn btn-danger !min-h-9 !px-3">✕</button>
                        </div>
                        {s.kind === "destination" && <a className="no-print text-sm text-gold underline" href={`/destination/${s.slug}`}>Tickets & info</a>}
                      </div>
                    </li>
                  ))}
                </ol>
                {d.length > 0 && <a className="no-print btn btn-ghost mt-4" target="_blank" rel="noopener noreferrer" href={routeLink(d)}>Open this day&apos;s route in Google Maps ↗</a>}
                {d.length > 0 && <p className="hidden text-xs print:block">Route: {routeLink(d)}</p>}
              </section>
            ))}
            <div className="no-print flex flex-wrap items-end gap-3">
              <div className="min-w-56 flex-1"><label className="label" htmlFor="p-add">Add a stop</label><select id="p-add" className="input" value={add} onChange={(e) => setAdd(e.target.value)}><option value="">Choose a place…</option>{catalog.filter((c) => !stops.some((s) => s.slug === c.slug)).map((c) => <option key={c.slug} value={c.slug}>{c.name} ({c.type})</option>)}</select></div>
              <button onClick={addStop} className="btn btn-ghost">+ Add stop</button>
            </div>
            {assump.length > 0 && <div className="card text-sm text-ivory/70"><h3 className="eyebrow">Assumptions & what is not included</h3><ul className="mt-2 list-disc space-y-1 pl-5">{assump.map((a) => <li key={a}>{a}</li>)}</ul></div>}
          </div>
        )}
      </div>
    </div>
  );
}

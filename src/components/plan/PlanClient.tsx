"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { haversineKm } from "@/lib/utils";
import type { Stop } from "@/db/schema";
import NearestGuides, { GuideItem } from "@/components/travel/NearestGuides";
import TicketBookingWidget from "@/components/travel/TicketBookingWidget";
import {
  DELHI_FOODS,
  DELHI_HOTELS,
  DELHI_STARTING_LOCATIONS,
  FoodSpot,
  generateComprehensiveTimeline,
  HotelRecommendation,
  ItineraryTimingSlot,
  StartingLocation,
} from "@/lib/itinerary-details";

type Cat = { kind: Stop["kind"]; slug: string; name: string; lat: number; lng: number; type: string };
type Cfg = {
  destinationSlug: string;
  startName: string;
  startLat: number;
  startLng: number;
  duration: "half-day" | "full-day" | "multi-day";
  days: number;
  travellers: number;
  budget: "budget" | "mid" | "premium";
  interests: string[];
  walking: "low" | "medium" | "high";
  transport: "driving" | "transit" | "walking" | "bicycling";
  date: string;
};
type Initial = { id: string; title: string; tripDate: string | null; stops: Stop[]; config: Record<string, unknown> } | null;

const INTERESTS = ["history", "architecture", "food", "markets", "photography", "family", "culture", "nature"];
const SPEED = { walking: 4.5, bicycling: 12, transit: 18, driving: 22 };
const MIN_PER_DAY = { "half-day": 240, "full-day": 480, "multi-day": 480 };

export default function PlanClient({
  catalog,
  destinations,
  defaultDest,
  initial,
  loggedIn,
  availableGuides = [],
}: {
  catalog: Cat[];
  destinations: { slug: string; name: string }[];
  defaultDest: string;
  initial: Initial;
  loggedIn: boolean;
  availableGuides?: GuideItem[];
}) {
  const router = useRouter();
  const ic = (initial?.config ?? {}) as Partial<Cfg> & { dayCounts?: number[] };

  const defaultStartLocation = DELHI_STARTING_LOCATIONS[2]; // NDLS or Connaught Place

  const [cfg, setCfg] = useState<Cfg>({
    destinationSlug: ic.destinationSlug ?? defaultDest,
    startName: ic.startName ?? defaultStartLocation.name,
    startLat: ic.startLat ?? defaultStartLocation.lat,
    startLng: ic.startLng ?? defaultStartLocation.lng,
    duration: ic.duration ?? "full-day",
    days: ic.days ?? 2,
    travellers: ic.travellers ?? 2,
    budget: (ic.budget as Cfg["budget"]) ?? "mid",
    interests: ic.interests ?? ["history", "food"],
    walking: (ic.walking as Cfg["walking"]) ?? "medium",
    transport: (ic.transport as Cfg["transport"]) ?? "transit",
    date: initial?.tripDate ?? ic.date ?? "",
  });

  // Search Bar States
  const [startQuery, setStartQuery] = useState(cfg.startName);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);

  const initialDestObj = destinations.find((d) => d.slug === cfg.destinationSlug) || destinations[0];
  const [destQuery, setDestQuery] = useState(initialDestObj?.name || "");
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const [stops, setStops] = useState<Stop[]>(initial?.stops ?? []);
  const [dayCounts, setDayCounts] = useState<number[]>(ic.dayCounts ?? (initial ? [initial.stops.length] : []));
  const [title, setTitle] = useState(initial?.title ?? "");
  const [id, setId] = useState(initial?.id ?? null);
  const [assump, setAssump] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [add, setAdd] = useState("");

  // Comprehensive details state
  const [timeline, setTimeline] = useState<ItineraryTimingSlot[]>([]);
  const [hotels, setHotels] = useState<HotelRecommendation[]>([]);
  const [foods, setFoods] = useState<FoodSpot[]>([]);
  const [activeTab, setActiveTab] = useState<"schedule" | "stops" | "hotels" | "foods" | "tickets" | "guides">("schedule");

  const set = <K extends keyof Cfg>(k: K, v: Cfg[K]) => setCfg((c) => ({ ...c, [k]: v }));

  // Autocomplete filters
  const filteredStartLocations = useMemo(() => {
    if (!startQuery.trim()) return DELHI_STARTING_LOCATIONS.slice(0, 6);
    return DELHI_STARTING_LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(startQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(startQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(startQuery.toLowerCase())
    );
  }, [startQuery]);

  const filteredDestinations = useMemo(() => {
    if (!destQuery.trim()) return destinations.slice(0, 6);
    return destinations.filter((d) => d.name.toLowerCase().includes(destQuery.toLowerCase()));
  }, [destQuery, destinations]);

  const days = useMemo(() => {
    let i = 0;
    return dayCounts.map((n) => {
      const s = stops.slice(i, i + n);
      i += n;
      return s;
    });
  }, [stops, dayCounts]);

  const startCoords = { lat: cfg.startLat, lng: cfg.startLng };

  const leg = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const km = haversineKm(a, b);
    return { km: +km.toFixed(1), min: Math.max(5, Math.round(((km * 1.35) / SPEED[cfg.transport]) * 60)) };
  };

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      const r = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationSlug: cfg.destinationSlug,
          start: { name: cfg.startName, lat: cfg.startLat, lng: cfg.startLng },
          duration: cfg.duration,
          days: cfg.days,
          travellers: cfg.travellers,
          budget: cfg.budget,
          interests: cfg.interests,
          walking: cfg.walking,
          transport: cfg.transport,
          date: cfg.date || undefined,
        }),
      });

      const j = await r.json();
      setBusy(false);

      if (!j.ok) return setMsg({ t: "err", m: j.error });

      const ds = j.days as { stops: Stop[] }[];
      setStops(ds.flatMap((d) => d.stops));
      setDayCounts(ds.map((d) => d.stops.length));
      setTitle(j.title);
      setAssump(j.assumptions || []);
      setId(null);

      // Populate timeline, hotels and foods
      const generatedTimeline =
        j.timeline ||
        generateComprehensiveTimeline(
          cfg.startName,
          destQuery || "Monument",
          ds.flatMap((d) => d.stops),
          cfg.transport
        );
      setTimeline(generatedTimeline);

      const relevantHotels = j.hotels || DELHI_HOTELS.slice(0, 4);
      setHotels(relevantHotels);

      const relevantFoods = j.foods || DELHI_FOODS.slice(0, 4);
      setFoods(relevantFoods);

      setMsg({
        t: "ok",
        m: `Generated comprehensive itinerary with ${ds.reduce((n, d) => n + d.stops.length, 0)} stops, hourly schedule, stay options & food spots.`,
      });
    } catch {
      setBusy(false);
      setMsg({ t: "err", m: "Failed to generate itinerary. Please try again." });
    }
  }

  function indexOf(day: number, i: number) {
    return dayCounts.slice(0, day).reduce((a, b) => a + b, 0) + i;
  }

  function remove(day: number, i: number) {
    const k = indexOf(day, i);
    setStops(stops.filter((_, x) => x !== k));
    setDayCounts(dayCounts.map((n, d) => (d === day ? n - 1 : n)).filter((n) => n > 0));
  }

  function move(day: number, i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= dayCounts[day]) return;
    const a = indexOf(day, i),
      b = indexOf(day, j);
    const n = [...stops];
    [n[a], n[b]] = [n[b], n[a]];
    setStops(n);
  }

  function addStop() {
    const c = catalog.find((x) => x.slug === add);
    if (!c) return setMsg({ t: "err", m: "Choose a place to add" });
    if (stops.some((s) => s.slug === c.slug)) return setMsg({ t: "err", m: "That stop is already in your plan" });
    const last = Math.max(0, dayCounts.length - 1);
    const k = indexOf(last, dayCounts[last] ?? 0);
    const n = [...stops];
    n.splice(k, 0, {
      id: crypto.randomUUID(),
      kind: c.kind,
      slug: c.slug,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      minutes: 60,
      note: c.type,
    });
    setStops(n);
    setDayCounts(dayCounts.length ? dayCounts.map((x, d) => (d === last ? x + 1 : x)) : [1]);
    setAdd("");
    setMsg(null);
  }

  const setMinutes = (k: number, m: number) =>
    setStops(stops.map((s, x) => (x === k ? { ...s, minutes: Math.max(5, Math.min(600, m || 5)) } : s)));

  async function save() {
    setMsg(null);
    if (!stops.length) return setMsg({ t: "err", m: "Generate or add stops before saving" });
    if (title.trim().length < 2) return setMsg({ t: "err", m: "Give your plan a title" });

    const body = { title, tripDate: cfg.date || null, stops, config: { ...cfg, dayCounts } };
    const r = await fetch(id ? `/api/itineraries/${id}` : "/api/itineraries", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { title, tripDate: cfg.date || null, stops } : body),
    });

    if (r.status === 401) return router.push(`/login?next=${encodeURIComponent("/plan-trip")}`);
    const j = await r.json();
    if (!j.ok) return setMsg({ t: "err", m: j.error });

    if (!id && j.itinerary) {
      setId(j.itinerary.id);
    }
    setMsg({ t: "ok", m: "Plan saved to My Trips." });
    router.refresh();
  }

  async function share() {
    const text =
      `${title}\n` + days.map((d, i) => `Day ${i + 1}: ${d.map((s) => s.name).join(" → ")}`).join("\n");
    try {
      if (navigator.share) await navigator.share({ title, text });
      else {
        await navigator.clipboard.writeText(text);
        setMsg({ t: "ok", m: "Plan text copied to clipboard." });
      }
    } catch {
      setMsg({ t: "err", m: "Sharing was cancelled or not available." });
    }
  }

  function routeLink(d: Stop[]) {
    if (!d.length) return "#";
    const origin = d === days[0] ? `${startCoords.lat},${startCoords.lng}` : `${d[0].lat},${d[0].lng}`;
    const dest = d[d.length - 1];
    const wp = d.slice(0, -1).map((s) => `${s.lat},${s.lng}`).join("|");
    const p = new URLSearchParams({
      api: "1",
      origin,
      destination: `${dest.lat},${dest.lng}`,
      travelmode: cfg.transport,
    });
    if (wp) p.set("waypoints", wp);
    return `https://www.google.com/maps/dir/?${p}`;
  }

  const selectedDestinationName =
    destinations.find((d) => d.slug === cfg.destinationSlug)?.name || destQuery || "Delhi Monument";

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      {/* Search & Planner Control Panel */}
      <form onSubmit={generate} className="card no-print h-fit space-y-4 lg:sticky lg:top-24 shadow-2xl border-gold/30">
        <div className="border-b border-ivory/10 pb-3">
          <span className="tag-verified">Intelligent Itinerary Generator</span>
          <h2 className="font-serif text-2xl text-ivory mt-1">Route & Preferences</h2>
          <p className="text-xs text-ivory/60">Search starting point & destination to generate whole trip</p>
        </div>

        {/* 1. Search Bar: Starting Location */}
        <div className="relative">
          <label className="label flex items-center justify-between text-xs" htmlFor="p-start-search">
            <span>📍 Starting Point / Hotel / Station</span>
            <span className="text-[10px] text-gold">Searchable</span>
          </label>
          <div className="relative">
            <input
              id="p-start-search"
              type="text"
              autoComplete="off"
              className="input !py-2 !text-sm pl-8"
              placeholder="e.g. Airport, Connaught Place, Hotel in Aerocity..."
              value={startQuery}
              onChange={(e) => {
                setStartQuery(e.target.value);
                setShowStartSuggestions(true);
              }}
              onFocus={() => setShowStartSuggestions(true)}
            />
            <span className="absolute left-2.5 top-2.5 text-xs text-ivory/50">🔍</span>
            {startQuery && (
              <button
                type="button"
                onClick={() => {
                  setStartQuery("");
                  setShowStartSuggestions(true);
                }}
                className="absolute right-2.5 top-2.5 text-xs text-ivory/40 hover:text-ivory"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showStartSuggestions && (
            <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-ivory/20 bg-ink/95 p-1 shadow-2xl backdrop-blur-xl">
              {filteredStartLocations.map((loc) => (
                <button
                  type="button"
                  key={loc.name}
                  onClick={() => {
                    setStartQuery(loc.name);
                    set("startName", loc.name);
                    set("startLat", loc.lat);
                    set("startLng", loc.lng);
                    setShowStartSuggestions(false);
                  }}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-xs transition-colors hover:bg-gold/15"
                >
                  <span className="text-base mt-0.5">
                    {loc.category === "Airport" ? "✈️" : loc.category === "Railway Station" ? "🚆" : "🏨"}
                  </span>
                  <div>
                    <p className="font-semibold text-ivory">{loc.name}</p>
                    <p className="text-[11px] text-ivory/50">{loc.category} · {loc.description}</p>
                  </div>
                </button>
              ))}
              {startQuery.trim() && !filteredStartLocations.some((l) => l.name.toLowerCase() === startQuery.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => {
                    set("startName", startQuery.trim());
                    setShowStartSuggestions(false);
                  }}
                  className="w-full border-t border-ivory/10 p-2 text-left text-xs text-gold hover:bg-gold/10"
                >
                  Use custom location: &ldquo;{startQuery.trim()}&rdquo; →
                </button>
              )}
            </div>
          )}

          {/* Quick preset chips */}
          <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
            {["Airport (T3)", "NDLS Railway", "Connaught Place", "Aerocity", "Saket"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  const match = DELHI_STARTING_LOCATIONS.find((l) => l.name.includes(preset));
                  if (match) {
                    setStartQuery(match.name);
                    set("startName", match.name);
                    set("startLat", match.lat);
                    set("startLng", match.lng);
                  }
                  setShowStartSuggestions(false);
                }}
                className="rounded-full bg-ivory/10 px-2 py-0.5 text-ivory/70 hover:bg-gold/20 hover:text-gold"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Search Bar: Destination Point */}
        <div className="relative">
          <label className="label flex items-center justify-between text-xs" htmlFor="p-dest-search">
            <span>🏛️ Destination Monument / Zone</span>
            <span className="text-[10px] text-gold">Searchable</span>
          </label>
          <div className="relative">
            <input
              id="p-dest-search"
              type="text"
              autoComplete="off"
              className="input !py-2 !text-sm pl-8"
              placeholder="e.g. Red Fort, Qutub Minar, Humayun's Tomb..."
              value={destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                setShowDestSuggestions(true);
              }}
              onFocus={() => setShowDestSuggestions(true)}
            />
            <span className="absolute left-2.5 top-2.5 text-xs text-ivory/50">🏛️</span>
            {destQuery && (
              <button
                type="button"
                onClick={() => {
                  setDestQuery("");
                  setShowDestSuggestions(true);
                }}
                className="absolute right-2.5 top-2.5 text-xs text-ivory/40 hover:text-ivory"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDestSuggestions && (
            <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-ivory/20 bg-ink/95 p-1 shadow-2xl backdrop-blur-xl">
              {filteredDestinations.map((d) => (
                <button
                  type="button"
                  key={d.slug}
                  onClick={() => {
                    setDestQuery(d.name);
                    set("destinationSlug", d.slug);
                    setShowDestSuggestions(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs transition-colors hover:bg-gold/15"
                >
                  <span className="font-semibold text-ivory">{d.name}</span>
                  <span className="chip text-[10px] text-gold border-gold/30">View Route</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick monument preset chips */}
          <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
            {["Red Fort", "Qutub Minar", "Humayun's Tomb", "Lotus Temple", "India Gate"].map((monument) => (
              <button
                key={monument}
                type="button"
                onClick={() => {
                  const match = destinations.find((d) => d.name.toLowerCase().includes(monument.toLowerCase()));
                  if (match) {
                    setDestQuery(match.name);
                    set("destinationSlug", match.slug);
                  }
                  setShowDestSuggestions(false);
                }}
                className="rounded-full bg-ivory/10 px-2 py-0.5 text-ivory/70 hover:bg-gold/20 hover:text-gold"
              >
                {monument}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Date & Travellers */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-xs" htmlFor="p-date">
              Travel Date
            </label>
            <input
              id="p-date"
              type="date"
              className="input !py-1.5 !text-xs"
              value={cfg.date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>
          <div>
            <label className="label text-xs" htmlFor="p-trav">
              Travellers
            </label>
            <input
              id="p-trav"
              type="number"
              min={1}
              max={30}
              className="input !py-1.5 !text-xs"
              value={cfg.travellers}
              onChange={(e) => set("travellers", Math.max(1, +e.target.value || 1))}
            />
          </div>
        </div>

        {/* Duration & Budget */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-xs" htmlFor="p-dur">
              Duration
            </label>
            <select
              id="p-dur"
              className="input !py-1.5 !text-xs"
              value={cfg.duration}
              onChange={(e) => set("duration", e.target.value as Cfg["duration"])}
            >
              <option value="half-day">Half day (~4 h)</option>
              <option value="full-day">Full day (~8 h)</option>
              <option value="multi-day">Multi-day</option>
            </select>
          </div>
          <div>
            <label className="label text-xs" htmlFor="p-bud">
              Budget & Stays
            </label>
            <select
              id="p-bud"
              className="input !py-1.5 !text-xs"
              value={cfg.budget}
              onChange={(e) => set("budget", e.target.value as Cfg["budget"])}
            >
              <option value="budget">Budget / Hostels</option>
              <option value="mid">Mid-range Boutique</option>
              <option value="premium">Luxury Heritage</option>
            </select>
          </div>
        </div>

        {/* Transport Mode */}
        <div>
          <label className="label text-xs" htmlFor="p-tr">
            Preferred Transport
          </label>
          <select
            id="p-tr"
            className="input !py-1.5 !text-xs"
            value={cfg.transport}
            onChange={(e) => set("transport", e.target.value as Cfg["transport"])}
          >
            <option value="transit">🚇 Metro / E-Rickshaw transit</option>
            <option value="driving">🚗 Private Cab / Taxi</option>
            <option value="walking">🚶 Walking Heritage Corridor</option>
            <option value="bicycling">🚲 Bicycle / Green corridor</option>
          </select>
        </div>

        {/* Interests */}
        <fieldset>
          <legend className="label text-xs">Trip Interests</legend>
          <div className="flex flex-wrap gap-1.5">
            {INTERESTS.map((i) => (
              <button
                type="button"
                key={i}
                aria-pressed={cfg.interests.includes(i)}
                onClick={() =>
                  set("interests", cfg.interests.includes(i) ? cfg.interests.filter((x) => x !== i) : [...cfg.interests, i])
                }
                className={`chip min-h-7 px-2.5 text-xs capitalize ${cfg.interests.includes(i) ? "chip-on" : ""}`}
              >
                {i}
              </button>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn btn-gold w-full text-sm font-semibold !min-h-11 shadow-lg" disabled={busy}>
          {busy ? "Generating Whole Itinerary…" : "✨ Generate Whole Itinerary"}
        </button>
      </form>

      {/* Output Results Area */}
      <div>
        {msg && (
          <p
            role={msg.t === "err" ? "alert" : "status"}
            className={`no-print mb-4 rounded-xl p-3 text-sm ${
              msg.t === "err" ? "bg-maroon/50 text-red-100" : "bg-emerald/25 text-emerald-100"
            }`}
          >
            {msg.m}
          </p>
        )}

        {!stops.length ? (
          <div className="card text-center p-12 space-y-4 border-gold/30">
            <span className="text-5xl">🧭</span>
            <h3 className="font-serif text-3xl text-ivory">Search & Generate Your Whole Itinerary</h3>
            <p className="max-w-lg mx-auto text-sm text-ivory/60 leading-relaxed">
              Type your hotel or starting station, choose your destination monument, and hit <strong>Generate Whole Itinerary</strong>.
              You will get complete hourly timings, curated hotel stays, iconic food spots, fast-track digital ticket passes, and local guides in one unified plan.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="chip text-xs">⏱️ Hourly Timings</span>
              <span className="chip text-xs">🏨 Stay & Hotels</span>
              <span className="chip text-xs">🍲 Iconic Delhi Foods</span>
              <span className="chip text-xs">🎟️ Digital Fast-Track Tickets</span>
              <span className="chip text-xs">🧭 Licensed Guides</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plan Header & Action Bar */}
            <div className="card p-6 border-gold/40 bg-gradient-to-br from-charcoal/90 to-ink space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="tag-verified">Complete Generated Delhi Itinerary</span>
                  <h2 className="font-serif text-3xl text-ivory mt-1">{title}</h2>
                  <p className="text-xs text-ivory/60 mt-0.5">
                    Starting from <strong>{cfg.startName}</strong> · {cfg.travellers} Traveller{cfg.travellers > 1 ? "s" : ""} · Mode: {cfg.transport}
                  </p>
                </div>

                <div className="no-print flex flex-wrap gap-2">
                  <button onClick={save} className="btn btn-gold !min-h-9 text-xs">
                    {id ? "Update Saved Plan" : loggedIn ? "Save to My Trips" : "Log in to Save"}
                  </button>
                  <button onClick={() => window.print()} className="btn btn-ghost !min-h-9 text-xs">
                    🖨️ Export PDF
                  </button>
                  <button onClick={share} className="btn btn-ghost !min-h-9 text-xs">
                    🔗 Share
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2 border-t border-ivory/10 pt-3">
                {[
                  { id: "schedule", label: "⏱️ Timings & Schedule" },
                  { id: "stops", label: "🏛️ Route Stops & Map" },
                  { id: "hotels", label: "🏨 Stays & Hotels" },
                  { id: "foods", label: "🍲 Iconic Foods Along Route" },
                  { id: "tickets", label: "🎟️ Fast-Track Passes" },
                  { id: "guides", label: "🧭 Licensed Guides" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-gold text-ink shadow-md shadow-gold/25"
                        : "bg-charcoal/80 text-ivory/70 hover:bg-charcoal hover:text-gold"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: ⏱️ HOURLY TIMINGS & SCHEDULE */}
            {activeTab === "schedule" && (
              <div className="card space-y-4">
                <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                  <div>
                    <h3 className="font-serif text-2xl text-ivory">Detailed Hourly Timings</h3>
                    <p className="text-xs text-ivory/60">Optimized chronological timeline from departure to sunset wrap</p>
                  </div>
                  <span className="chip text-gold text-xs">Full Day Plan</span>
                </div>

                <div className="relative border-l-2 border-gold/40 pl-6 ml-3 space-y-6">
                  {timeline.map((slot, idx) => (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-ink bg-gold ring-4 ring-gold/20" />
                      <div className="rounded-xl bg-charcoal/60 p-4 border border-ivory/10 hover:border-gold/30 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-gold">{slot.time}</span>
                          <span className="rounded-full bg-ivory/10 px-2 py-0.5 text-[10px] uppercase font-semibold text-ivory/70">
                            {slot.durationMinutes} mins · {slot.type}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-ivory mt-1">{slot.title}</h4>
                        <p className="text-xs text-ivory/70 mt-1 leading-relaxed">{slot.description}</p>
                        <p className="text-[11px] text-ivory/50 mt-2">📍 {slot.locationName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: 🏛️ ROUTE STOPS & MAP */}
            {activeTab === "stops" && (
              <div className="space-y-4">
                {days.map((d, di) => (
                  <section key={di} className="card space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ivory/10 pb-3">
                      <h3 className="font-serif text-2xl text-gold">
                        {days.length > 1 ? `Day ${di + 1}` : cfg.duration === "half-day" ? "Half-day Plan" : "Full-day Plan"}
                      </h3>
                      <p className="text-xs text-ivory/60">
                        {d.reduce((n, s) => n + s.minutes, 0)} min at stops · {d.length} locations
                      </p>
                    </div>

                    <p className="text-xs text-ivory/70">
                      Starting from <strong>{cfg.startName}</strong>: ~{leg(startCoords, d[0] || startCoords).km} km straight-line transit.
                    </p>

                    <ol className="space-y-3">
                      {d.map((s, i) => (
                        <li key={s.id}>
                          {i > 0 && (
                            <p className="mb-2 ml-4 border-l border-gold/40 pl-4 text-xs text-ivory/50">
                              ↓ ~{leg(d[i - 1], s).km} km · ~{leg(d[i - 1], s).min} min ({cfg.transport})
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ivory/10 bg-ink/50 p-3.5">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold font-bold text-ink text-sm">
                              {i + 1}
                            </span>
                            <div className="min-w-40 flex-1">
                              <p className="font-serif text-xl font-bold text-ivory">{s.name}</p>
                              <p className="text-xs capitalize text-ivory/50">{s.note}</p>
                            </div>

                            <label className="no-print text-xs text-ivory/60 flex items-center gap-1.5">
                              <span>Duration:</span>
                              <input
                                type="number"
                                className="input !min-h-8 !w-20 !py-1 text-xs"
                                value={s.minutes}
                                onChange={(e) => setMinutes(indexOf(di, i), +e.target.value)}
                              />
                              <span>min</span>
                            </label>

                            <div className="no-print flex gap-1">
                              <button
                                type="button"
                                disabled={i === 0}
                                onClick={() => move(di, i, -1)}
                                className="btn btn-ghost !min-h-8 !px-2.5 text-xs"
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={i === d.length - 1}
                                onClick={() => move(di, i, 1)}
                                className="btn btn-ghost !min-h-8 !px-2.5 text-xs"
                                title="Move down"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(di, i)}
                                className="btn btn-danger !min-h-8 !px-2.5 text-xs"
                                title="Remove stop"
                              >
                                ✕
                              </button>
                            </div>

                            {s.kind === "destination" && (
                              <Link className="no-print text-xs text-gold underline whitespace-nowrap" href={`/destination/${s.slug}`}>
                                Visitor Details →
                              </Link>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>

                    {d.length > 0 && (
                      <div className="pt-2">
                        <a
                          className="btn btn-ghost text-xs w-full text-center"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={routeLink(d)}
                        >
                          🗺️ Open Complete Day Route in Google Maps Live Directions ↗
                        </a>
                      </div>
                    )}
                  </section>
                ))}

                {/* Add Stop Widget */}
                <div className="card no-print flex flex-wrap items-end gap-3">
                  <div className="min-w-56 flex-1">
                    <label className="label text-xs" htmlFor="p-add-stop">
                      Add another Delhi stop to itinerary
                    </label>
                    <select
                      id="p-add-stop"
                      className="input !py-1.5 text-xs"
                      value={add}
                      onChange={(e) => setAdd(e.target.value)}
                    >
                      <option value="">Choose a destination or bazaar…</option>
                      {catalog
                        .filter((c) => !stops.some((s) => s.slug === c.slug))
                        .map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name} ({c.type})
                          </option>
                        ))}
                    </select>
                  </div>
                  <button onClick={addStop} className="btn btn-ghost !min-h-10 text-xs">
                    + Add Stop
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: 🏨 RECOMMENDED STAYS & HOTELS */}
            {activeTab === "hotels" && (
              <div className="card space-y-4">
                <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                  <div>
                    <h3 className="font-serif text-2xl text-ivory">Recommended Stays & Hotels</h3>
                    <p className="text-xs text-ivory/60">
                      Curated accommodations near {cfg.startName} and {selectedDestinationName}
                    </p>
                  </div>
                  <span className="chip text-xs capitalize text-gold border-gold/30">{cfg.budget} Tier</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {hotels.map((hotel) => (
                    <div key={hotel.name} className="card p-4 border-ivory/15 bg-charcoal/60 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="chip text-[10px] text-gold border-gold/30">{hotel.category}</span>
                          <h4 className="font-serif text-xl font-bold text-ivory mt-1">{hotel.name}</h4>
                          <p className="text-xs text-ivory/60">📍 {hotel.area}</p>
                        </div>
                        <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-bold text-gold">
                          ★ {hotel.rating}
                        </span>
                      </div>

                      <p className="text-xs text-ivory/75 leading-relaxed">{hotel.highlight}</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {hotel.amenities.map((a) => (
                          <span key={a} className="rounded bg-ivory/5 px-2 py-0.5 text-[10px] text-ivory/60">
                            {a}
                          </span>
                        ))}
                      </div>

                      <div className="border-t border-ivory/10 pt-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-ivory/50">Estimated Rate</span>
                          <p className="font-serif font-bold text-gold">{hotel.pricePerNight}</p>
                        </div>
                        <p className="text-[11px] text-emerald-300 italic">{hotel.bookingTip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: 🍲 ICONIC FOODS ALONG ROUTE */}
            {activeTab === "foods" && (
              <div className="card space-y-4">
                <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                  <div>
                    <h3 className="font-serif text-2xl text-ivory">Curated Delhi Heritage Dining</h3>
                    <p className="text-xs text-ivory/60">Legendary culinary institutions along the itinerary route</p>
                  </div>
                  <span className="chip text-xs text-gold border-gold/30">Authentic Taste</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {foods.map((food) => (
                    <div key={food.name} className="card p-4 border-ivory/15 bg-charcoal/60 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-serif text-xl font-bold text-ivory">{food.name}</h4>
                          <p className="text-xs text-ivory/60">📍 {food.locality}</p>
                        </div>
                        <span className="chip text-[10px] text-emerald-300 border-emerald-500/40">
                          {food.timing}
                        </span>
                      </div>

                      <div className="rounded-lg bg-charcoal/80 p-2.5 text-xs space-y-1">
                        <p className="text-gold font-semibold">🌟 Signature Dish:</p>
                        <p className="text-ivory/90">{food.signatureDish}</p>
                      </div>

                      <p className="text-xs text-ivory/70 leading-relaxed">{food.vibe}</p>

                      <div className="border-t border-ivory/10 pt-2 flex items-center justify-between text-xs">
                        <span className="text-ivory/50">Average Cost: <strong className="text-ivory">{food.avgCostForTwo}</strong></span>
                        <span className="text-[11px] text-sand">{food.whyGo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: 🎟️ FAST-TRACK PASSES & TICKETING */}
            {activeTab === "tickets" && (
              <div className="space-y-4">
                <div className="card p-6 border-gold/40 space-y-3">
                  <span className="tag-verified">Fast-Track Entry Pass</span>
                  <h3 className="font-serif text-3xl text-ivory">Digital Monument Entry Passes</h3>
                  <p className="text-sm text-ivory/70">
                    Official entry rates synced with Archaeological Survey of India (ASI). Generate digital fast-track entry passes with QR barcodes to skip queues at the ticket counter.
                  </p>
                </div>

                {/* Embedded Live Ticket Booking Widget */}
                <TicketBookingWidget
                  destinationSlug={cfg.destinationSlug}
                  destinationName={selectedDestinationName}
                />
              </div>
            )}

            {/* TAB 6: 🧭 LICENSED GUIDES */}
            {activeTab === "guides" && (
              <div className="space-y-4">
                {availableGuides.length > 0 ? (
                  <NearestGuides
                    destinationName={selectedDestinationName}
                    initialGuides={availableGuides.slice(0, 4)}
                  />
                ) : (
                  <p className="card p-6 text-center text-ivory/60">
                    Loading licensed local guides for {selectedDestinationName}…
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

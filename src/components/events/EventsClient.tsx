"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import SaveButton from "@/components/SaveButton";
import SmartImage from "@/components/SmartImage";
import { haversineKm } from "@/lib/utils";

export type Ev = {
  id: string;
  title: string;
  type: string;
  description: string;
  image: string | null;
  venue: string;
  locality: string | null;
  lat: number | null;
  lng: number | null;
  startsAt: string;
  endsAt?: string | null;
  isFree: boolean;
  priceNote: string | null;
  familyFriendly: boolean;
  organiser: string | null;
  sourceUrl: string | null;
  bookingUrl: string | null;
  isDemo: boolean;
};

export default function EventsClient({ events }: { events: Ev[] }) {
  const [type, setType] = useState("");
  const [loc, setLoc] = useState("");
  const [price, setPrice] = useState("");
  const [fam, setFam] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [past, setPast] = useState(false);

  // Near Me Live GPS State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [maxRadiusKm, setMaxRadiusKm] = useState(0); // 0 = all
  const [sortByDistance, setSortByDistance] = useState(false);

  // Host/Submit Event Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("heritage-walk");
  const [newVenue, setNewVenue] = useState("");
  const [newLocality, setNewLocality] = useState("Old Delhi");
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 16);
  });
  const [newDesc, setNewDesc] = useState("");
  const [newOrganiser, setNewOrganiser] = useState("");
  const [newFree, setNewFree] = useState(true);
  const [submittingEvent, setSubmittingEvent] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const types = [...new Set(events.map((e) => e.type))];
  const locs = [...new Set(events.map((e) => e.locality).filter(Boolean))] as string[];
  const now = Date.now();
  const todayDateStr = new Date().toISOString().slice(0, 10);

  function detectNearMe() {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
        setGpsLoading(false);
      },
      () => {
        // Fallback to Central Delhi (Connaught Place)
        setUserCoords({ lat: 28.6289, lng: 77.2195 });
        setSortByDistance(true);
        setGpsError("Could not access live GPS. Showing distance from Central Delhi (Connaught Place).");
        setGpsLoading(false);
      },
      { timeout: 7000 }
    );
  }

  // Filter and sort events
  const list = useMemo(() => {
    let filtered = events.filter((e) => {
      const t = new Date(e.startsAt).getTime();
      const matchesPast = past || t >= now;
      const matchesType = !type || e.type === type;
      const matchesLoc = !loc || e.locality === loc;
      const matchesPrice = !price || (price === "free" ? e.isFree : !e.isFree);
      const matchesFam = !fam || e.familyFriendly;
      const matchesFrom = !from || t >= new Date(from).getTime();
      const matchesTo = !to || t <= new Date(to + "T23:59:59").getTime();

      let matchesRadius = true;
      if (userCoords && maxRadiusKm > 0 && e.lat != null && e.lng != null) {
        const d = haversineKm(userCoords, { lat: e.lat, lng: e.lng });
        matchesRadius = d <= maxRadiusKm;
      }

      return matchesPast && matchesType && matchesLoc && matchesPrice && matchesFam && matchesFrom && matchesTo && matchesRadius;
    });

    if (sortByDistance && userCoords) {
      filtered = [...filtered].sort((a, b) => {
        const distA = a.lat != null && a.lng != null ? haversineKm(userCoords, { lat: a.lat, lng: a.lng }) : 999;
        const distB = b.lat != null && b.lng != null ? haversineKm(userCoords, { lat: b.lat, lng: b.lng }) : 999;
        return distA - distB;
      });
    }

    return filtered;
  }, [events, type, loc, price, fam, from, to, past, now, userCoords, maxRadiusKm, sortByDistance]);

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingEvent(true);
    setSubmitSuccess(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          venue: newVenue,
          locality: newLocality,
          startsAt: newDate,
          description: newDesc,
          organiser: newOrganiser,
          isFree: newFree,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit event.");
      }

      setSubmitSuccess("Your heritage event has been published live to the Delhi cultural calendar!");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      alert(err.message || "Failed to submit event. Please make sure you are signed in.");
    } finally {
      setSubmittingEvent(false);
    }
  }

  function getTimingBadge(startsAtStr: string) {
    const eventDate = new Date(startsAtStr);
    const eventDateStr = eventDate.toISOString().slice(0, 10);
    const dayDiff = Math.round((new Date(eventDateStr).getTime() - new Date(todayDateStr).getTime()) / (24 * 60 * 60 * 1000));
    const dayOfWeek = eventDate.getDay(); // 0 is Sun, 6 is Sat

    if (dayDiff === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 text-[11px] font-bold text-red-300 border border-red-500/30">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" /> LIVE TODAY
        </span>
      );
    }
    if (dayDiff === 1) {
      return (
        <span className="inline-flex items-center rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-bold text-gold border border-gold/30">
          ✨ TOMORROW
        </span>
      );
    }
    if ((dayOfWeek === 0 || dayOfWeek === 6) && dayDiff <= 6 && dayDiff >= 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
          📅 THIS WEEKEND
        </span>
      );
    }
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Real-time Near Me Geolocation Banner */}
      <div className="card border-gold/40 bg-gradient-to-r from-charcoal/90 via-ink to-charcoal/90 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="tag-verified">Real-Time Delhi Cultural Events</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-ivory">Find Live Events & Heritage Walks Near You</h2>
          <p className="text-xs text-ivory/70">
            {userCoords
              ? `Showing real-time distance from your location (${userCoords.lat.toFixed(3)}, ${userCoords.lng.toFixed(3)})`
              : "Discover live Sufi nights, night sound & light shows, and morning heritage walks happening around Delhi."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={detectNearMe}
            disabled={gpsLoading}
            className={`btn ${
              userCoords ? "btn-gold font-bold shadow-md shadow-gold/20" : "btn-gold"
            } !min-h-10 text-xs px-4`}
          >
            <span>{gpsLoading ? "⏳ Locating You…" : userCoords ? "📍 Refine Live Location" : "📍 Find Events Near Me"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-ghost !min-h-10 text-xs px-4"
          >
            + Host Heritage Walk
          </button>
        </div>
      </div>

      {gpsError && (
        <p className="rounded-xl bg-gold/15 p-3 text-xs text-gold border border-gold/30">
          {gpsError}
        </p>
      )}

      {/* Filter and Search Bar */}
      <div className="card space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" role="search" aria-label="Filter events">
          <div>
            <label className="label text-xs" htmlFor="e-from">From Date</label>
            <input
              id="e-from"
              type="date"
              className="input !py-1.5 !text-xs"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="label text-xs" htmlFor="e-to">To Date</label>
            <input
              id="e-to"
              type="date"
              className="input !py-1.5 !text-xs"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div>
            <label className="label text-xs" htmlFor="e-type">Event Category</label>
            <select
              id="e-type"
              className="input !py-1.5 !text-xs capitalize"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Categories</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t.replace("-", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs" htmlFor="e-loc">Locality</label>
            <select
              id="e-loc"
              className="input !py-1.5 !text-xs"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
            >
              <option value="">All of Delhi</option>
              {locs.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs" htmlFor="e-price">Pricing</label>
            <select
              id="e-price"
              className="input !py-1.5 !text-xs"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            >
              <option value="">Free & Paid</option>
              <option value="free">Free Admission</option>
              <option value="paid">Ticketed</option>
            </select>
          </div>
          {userCoords ? (
            <div>
              <label className="label text-xs" htmlFor="e-radius">Radius (Near Me)</label>
              <select
                id="e-radius"
                className="input !py-1.5 !text-xs"
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
              >
                <option value={0}>Any Distance</option>
                <option value={3}>Within 3 km</option>
                <option value={6}>Within 6 km</option>
                <option value={10}>Within 10 km</option>
                <option value={15}>Within 15 km</option>
              </select>
            </div>
          ) : (
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={detectNearMe}
                className="btn btn-ghost !min-h-10 text-xs w-full text-center"
              >
                📍 Enable Near Me
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ivory/10 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-ivory/80">
              <input
                type="checkbox"
                checked={fam}
                onChange={(e) => setFam(e.target.checked)}
                className="rounded accent-gold h-4 w-4"
              />
              Family friendly only
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-ivory/80">
              <input
                type="checkbox"
                checked={past}
                onChange={(e) => setPast(e.target.checked)}
                className="rounded accent-gold h-4 w-4"
              />
              Show past archive
            </label>
          </div>

          <div className="flex items-center gap-2 text-ivory/60">
            <span>Showing <strong>{list.length}</strong> live events in Delhi</span>
            {userCoords && (
              <button
                type="button"
                onClick={() => setSortByDistance(!sortByDistance)}
                className={`chip !text-[11px] ${sortByDistance ? "chip-on" : ""}`}
              >
                {sortByDistance ? "✓ Sorted by Distance" : "Sort by Distance"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {list.length === 0 ? (
        <div className="card text-center p-10 space-y-3">
          <span className="text-4xl">🎪</span>
          <h3 className="font-serif text-2xl text-ivory">No live events match these filters</h3>
          <p className="text-sm text-ivory/60 max-w-md mx-auto">
            Try adjusting your distance radius, date range, or category filter to discover more upcoming walks.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setType("");
                setLoc("");
                setPrice("");
                setMaxRadiusKm(0);
                setFrom("");
                setTo("");
              }}
              className="btn btn-gold text-xs"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {list.map((e) => {
            const isPast = new Date(e.startsAt).getTime() < now;
            let distanceKm: number | null = null;
            if (userCoords && e.lat != null && e.lng != null) {
              distanceKm = Math.round(haversineKm(userCoords, { lat: e.lat, lng: e.lng }) * 10) / 10;
            }

            return (
              <li
                key={e.id}
                className={`card flex flex-col justify-between overflow-hidden !p-0 border-ivory/10 hover:border-gold/40 transition-all shadow-xl ${
                  isPast ? "opacity-60" : ""
                }`}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <SmartImage
                    src={e.image}
                    alt={e.title}
                    fallbackLabel={e.type.replace("-", " ")}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
                    <div className="flex flex-wrap gap-1.5">
                      {getTimingBadge(e.startsAt)}
                      <span className="chip !text-[10px] !bg-ink/80 backdrop-blur-sm border-ivory/20 capitalize">
                        {e.type.replace("-", " ")}
                      </span>
                    </div>

                    {distanceKm !== null && (
                      <span className="rounded-full bg-gold/90 text-ink px-2.5 py-0.5 text-[11px] font-bold shadow-md">
                        📍 {distanceKm} km away
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-gold">
                        🕒 {new Date(e.startsAt).toLocaleString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Kolkata",
                        })}
                      </span>
                      <span className="rounded-full bg-ivory/10 px-2 py-0.5 text-[10px] text-ivory/70">
                        {e.isFree ? "Free Entry" : e.priceNote ?? "Ticketed"}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-ivory mt-1">{e.title}</h3>
                    <p className="text-xs text-ivory/70 mt-1">
                      📍 <strong>{e.venue}</strong> {e.locality ? `· ${e.locality}` : ""}
                    </p>
                    <p className="text-xs text-ivory/75 mt-2 line-clamp-3 leading-relaxed">
                      {e.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-ivory/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {e.bookingUrl ? (
                        <a
                          className="btn btn-gold !min-h-9 text-xs"
                          href={e.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Book Tickets ↗
                        </a>
                      ) : (
                        <span className="text-[11px] text-emerald-300 font-semibold">
                          ✓ Walk-in Welcome
                        </span>
                      )}

                      {e.lat != null && e.lng != null && (
                        <a
                          className="btn btn-ghost !min-h-9 text-xs"
                          href={`https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Get live route directions"
                        >
                          🗺️ Directions ↗
                        </a>
                      )}
                    </div>

                    <SaveButton kind="event" refId={e.id} compact />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Host / Submit Event Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/80 backdrop-blur-md overflow-y-auto">
          <div className="card w-full max-w-xl max-h-[92vh] overflow-y-auto border-gold/40 bg-ink shadow-2xl p-5 sm:p-7 space-y-4 my-auto">
            <div className="flex items-start justify-between border-b border-ivory/10 pb-3">
              <div>
                <span className="tag-verified text-[10px]">Host or Register an Event</span>
                <h3 className="font-serif text-2xl text-ivory mt-1">Submit a Heritage Walk or Cultural Event</h3>
                <p className="text-xs text-ivory/60">
                  Publish your guided heritage walk, artisan workshop, or cultural gathering on Delhi Ki Khoj.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-ivory/60 hover:text-ivory p-1 text-lg"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-6 text-center space-y-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40">
                <span className="text-4xl">🎉</span>
                <h4 className="font-serif text-2xl text-ivory font-bold">{submitSuccess}</h4>
                <p className="text-xs text-ivory/70">Reloading event calendar now...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateEvent} className="space-y-3.5">
                <div>
                  <label className="label text-xs" htmlFor="new-title">Event Title *</label>
                  <input
                    id="new-title"
                    type="text"
                    required
                    placeholder="e.g. Sunset Baoli Photography & History Walk"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="input !py-1.5 !text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs" htmlFor="new-cat">Category</label>
                    <select
                      id="new-cat"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="input !py-1.5 !text-sm capitalize"
                    >
                      <option value="heritage-walk">Heritage Walk</option>
                      <option value="craft-fair">Artisan Craft Fair</option>
                      <option value="performance">Music & Qawwali</option>
                      <option value="museum">Museum Exhibition</option>
                      <option value="workshop">Cultural Workshop</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs" htmlFor="new-loc">Delhi Locality</label>
                    <input
                      id="new-loc"
                      type="text"
                      placeholder="e.g. Mehrauli, Nizamuddin, Old Delhi"
                      value={newLocality}
                      onChange={(e) => setNewLocality(e.target.value)}
                      className="input !py-1.5 !text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-xs" htmlFor="new-ven">Meeting Point / Venue *</label>
                  <input
                    id="new-ven"
                    type="text"
                    required
                    placeholder="e.g. Jama Masjid Gate 3 or Sunder Nursery Lake"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="input !py-1.5 !text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs" htmlFor="new-time">Start Date & Time *</label>
                    <input
                      id="new-time"
                      type="datetime-local"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="input !py-1.5 !text-sm"
                    />
                  </div>
                  <div>
                    <label className="label text-xs" htmlFor="new-org">Host / Organiser Name</label>
                    <input
                      id="new-org"
                      type="text"
                      placeholder="e.g. ASI Licensed Storyteller"
                      value={newOrganiser}
                      onChange={(e) => setNewOrganiser(e.target.value)}
                      className="input !py-1.5 !text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-xs" htmlFor="new-desc">Event Overview *</label>
                  <textarea
                    id="new-desc"
                    required
                    rows={2}
                    placeholder="Describe the walk itinerary, route, what visitors will see, and footwear/dress instructions..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="input !py-1.5 !text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="new-free"
                    type="checkbox"
                    checked={newFree}
                    onChange={(e) => setNewFree(e.target.checked)}
                    className="rounded accent-gold h-4 w-4"
                  />
                  <label htmlFor="new-free" className="text-xs text-ivory/80 cursor-pointer">
                    Free admission / No ticket required
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-ivory/10">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="btn btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEvent}
                    className="btn btn-gold text-xs font-semibold"
                  >
                    {submittingEvent ? "Publishing Event..." : "Publish Event Live"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

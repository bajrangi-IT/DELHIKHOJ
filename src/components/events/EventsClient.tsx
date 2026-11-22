"use client";
import { useMemo, useState } from "react";
import SaveButton from "@/components/SaveButton";
import SmartImage from "@/components/SmartImage";

export type Ev = { id: string; title: string; type: string; description: string; image: string | null; venue: string; locality: string | null; startsAt: string; isFree: boolean; priceNote: string | null; familyFriendly: boolean; organiser: string | null; sourceUrl: string | null; bookingUrl: string | null; isDemo: boolean };

export default function EventsClient({ events }: { events: Ev[] }) {
  const [type, setType] = useState("");
  const [loc, setLoc] = useState("");
  const [price, setPrice] = useState("");
  const [fam, setFam] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [past, setPast] = useState(false);
  const types = [...new Set(events.map((e) => e.type))];
  const locs = [...new Set(events.map((e) => e.locality).filter(Boolean))] as string[];
  const now = Date.now();

  const list = useMemo(() => events.filter((e) => {
    const t = new Date(e.startsAt).getTime();
    return (past || t >= now) && (!type || e.type === type) && (!loc || e.locality === loc) && (!price || (price === "free" ? e.isFree : !e.isFree)) && (!fam || e.familyFriendly) && (!from || t >= new Date(from).getTime()) && (!to || t <= new Date(to + "T23:59:59").getTime());
  }), [events, type, loc, price, fam, from, to, past, now]);

  return (
    <div>
      <div className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-6" role="search" aria-label="Filter events">
        <div><label className="label" htmlFor="e-from">From</label><input id="e-from" type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label" htmlFor="e-to">To</label><input id="e-to" type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div><label className="label" htmlFor="e-type">Type</label><select id="e-type" className="input" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{types.map((t) => <option key={t} value={t}>{t.replace("-", " ")}</option>)}</select></div>
        <div><label className="label" htmlFor="e-loc">Location</label><select id="e-loc" className="input" value={loc} onChange={(e) => setLoc(e.target.value)}><option value="">Anywhere</option>{locs.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label className="label" htmlFor="e-price">Price</label><select id="e-price" className="input" value={price} onChange={(e) => setPrice(e.target.value)}><option value="">Free or paid</option><option value="free">Free</option><option value="paid">Paid</option></select></div>
        <div className="flex flex-col justify-end gap-2 text-sm"><label className="flex min-h-6 items-center gap-2"><input type="checkbox" checked={fam} onChange={(e) => setFam(e.target.checked)} /> Family friendly</label><label className="flex min-h-6 items-center gap-2"><input type="checkbox" checked={past} onChange={(e) => setPast(e.target.checked)} /> Show past events</label></div>
      </div>
      <p className="mt-4 text-sm text-ivory/60" role="status">{list.length} event(s)</p>
      {list.length === 0 ? <p className="card mt-4">No events match these filters.</p> : (
        <ul className="mt-4 grid gap-5 md:grid-cols-2">
          {list.map((e) => {
            const isPast = new Date(e.startsAt).getTime() < now;
            return (
              <li key={e.id} className={`card overflow-hidden !p-0 ${isPast ? "opacity-60" : ""}`}>
                <SmartImage src={e.image} alt={e.title} fallbackLabel={e.type.replace("-", " ")} className="h-40 w-full" />
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs"><span className="text-gold">{new Date(e.startsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</span>{isPast && <span className="tag-unverified">Past</span>}{e.isDemo && <span className="tag-demo">Demo data</span>}</div>
                  <h3 className="mt-2 font-serif text-2xl">{e.title}</h3>
                  <p className="text-sm text-ivory/60">{e.venue} · {e.isFree ? "Free" : e.priceNote ?? "Paid"}{e.familyFriendly ? " · Family friendly" : ""}</p>
                  <p className="mt-3 text-sm text-ivory/75">{e.description}</p>
                  <p className="mt-2 text-xs text-ivory/50">Organiser: {e.organiser ?? "not verified"} · Source: {e.sourceUrl ? <a className="text-gold underline" href={e.sourceUrl} target="_blank" rel="noopener noreferrer">link ↗</a> : "none (demonstration entry)"}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {e.bookingUrl ? <a className="btn btn-gold" href={e.bookingUrl} target="_blank" rel="noopener noreferrer">Booking link ↗</a> : <span className="text-xs text-ivory/50">No booking link available</span>}
                    <SaveButton kind="event" refId={e.id} compact />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

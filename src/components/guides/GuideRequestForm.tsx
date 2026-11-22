"use client";
import Link from "next/link";
import { useState } from "react";

export default function GuideRequestForm({ guideId, loggedIn, destinations }: { guideId: string; loggedIn: boolean; destinations: string[] }) {
  const [s, setS] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);
  if (!loggedIn) return <div className="card"><p>Please <Link className="text-gold underline" href={`/login?next=/guides/${guideId}`}>log in</Link> or <Link className="text-gold underline" href="/signup">sign up</Link> to send a booking request.</p></div>;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setS(null);
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/guide-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guideId, tourDate: f.get("tourDate"), timeSlot: f.get("timeSlot"), groupSize: Number(f.get("groupSize")), destination: f.get("destination") || undefined, message: f.get("message") || undefined }) });
    const j = await r.json(); setBusy(false);
    if (j.ok) { setS({ t: "ok", m: "Request sent. Status: pending. Track it in My Guide Requests — the guide must accept it; nothing is booked or paid yet." }); (e.target as HTMLFormElement).reset(); } else setS({ t: "err", m: j.error });
  }
  return (
    <form onSubmit={submit} className="card space-y-4">
      <h2 className="font-serif text-2xl">Request this guide</h2>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="r-date">Preferred date</label><input id="r-date" name="tourDate" type="date" required className="input" min={new Date().toISOString().slice(0, 10)} /></div>
        <div><label className="label" htmlFor="r-slot">Time</label><select id="r-slot" name="timeSlot" className="input"><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="full-day">Full day</option></select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="r-size">Group size</label><input id="r-size" name="groupSize" type="number" min={1} max={30} defaultValue={2} className="input" /></div>
        <div><label className="label" htmlFor="r-dest">Destination</label><select id="r-dest" name="destination" className="input"><option value="">Not decided</option>{destinations.map((d) => <option key={d}>{d}</option>)}</select></div>
      </div>
      <div><label className="label" htmlFor="r-msg">Message (optional)</label><textarea id="r-msg" name="message" rows={3} maxLength={600} className="input" /></div>
      <button className="btn btn-gold w-full" disabled={busy}>{busy ? "Sending…" : "Send request"}</button>
      {s && <p role={s.t === "err" ? "alert" : "status"} className={`rounded-xl p-3 text-sm ${s.t === "err" ? "bg-maroon/50" : "bg-emerald/25"}`}>{s.m} {s.t === "ok" && <Link href="/my-guide-requests" className="underline">View requests</Link>}</p>}
    </form>
  );
}

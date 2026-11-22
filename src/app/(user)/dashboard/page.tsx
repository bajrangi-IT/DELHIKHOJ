import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { guideRequests, guides, itineraries, savedItems, userActivity } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { destinationsBySlugs } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser("/dashboard");
  const { denied } = await searchParams;
  const [trips, saved, reqs, activity] = await Promise.all([
    db.select().from(itineraries).where(eq(itineraries.userId, user.id)).orderBy(desc(itineraries.updatedAt)).limit(4),
    db.select().from(savedItems).where(eq(savedItems.userId, user.id)).orderBy(desc(savedItems.createdAt)),
    db.select({ r: guideRequests, g: guides }).from(guideRequests).innerJoin(guides, eq(guides.id, guideRequests.guideId)).where(eq(guideRequests.userId, user.id)).orderBy(desc(guideRequests.createdAt)).limit(4),
    db.select().from(userActivity).where(eq(userActivity.userId, user.id)).orderBy(desc(userActivity.createdAt)).limit(30),
  ]);
  const recentSlugs = [...new Set(activity.map((a) => a.refId))].slice(0, 5);
  const recent = await destinationsBySlugs(recentSlugs);
  const savedDest = await destinationsBySlugs(saved.filter((s) => s.kind === "destination").map((s) => s.refId));
  const count = (k: string) => saved.filter((s) => s.kind === k).length;

  return (
    <div className="space-y-10">
      {denied && <p role="alert" className="rounded-xl bg-maroon/50 p-3 text-sm">You don&apos;t have permission to open the admin area.</p>}
      <header><p className="eyebrow">Your journey</p><h1 className="h-section mt-1">Namaste, {user.fullName.split(" ")[0]}</h1><p className="text-ivory/60 capitalize">Role: {user.role}{user.isDemo ? " · demo account" : ""}</p></header>
      <ul className="grid gap-4 sm:grid-cols-4">{[["Trips", trips.length], ["Saved places", count("destination")], ["Favourite markets", count("market")], ["Saved events", count("event")]].map(([l, n]) => <li key={l} className="card"><p className="font-serif text-4xl text-gold">{n}</p><p className="text-xs uppercase tracking-widest text-ivory/60">{l}</p></li>)}</ul>

      <section><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Upcoming trips & plans</h2><Link href="/plan-trip" className="btn btn-gold !min-h-9">+ New plan</Link></div>
        {trips.length ? <ul className="mt-3 grid gap-3 md:grid-cols-2">{trips.map((t) => <li key={t.id} className="card"><p className="font-serif text-xl">{t.title}</p><p className="text-sm text-ivory/60">{t.tripDate ?? "No date set"} · {t.stops.length} stops</p><Link href={`/plan-trip?load=${t.id}`} className="mt-2 inline-block text-sm text-gold underline">Open & edit</Link></li>)}</ul> : <p className="card mt-3 text-ivory/70">No plans yet. <Link href="/plan-trip" className="text-gold underline">Create your first itinerary</Link>.</p>}
      </section>
      <section><h2 className="font-serif text-2xl">Saved destinations</h2>
        {savedDest.length ? <ul className="mt-3 flex flex-wrap gap-2">{savedDest.map((d) => <li key={d.slug}><Link href={`/destination/${d.slug}`} className="chip chip-on min-h-9 px-4">{d.name}</Link></li>)}</ul> : <p className="mt-3 text-ivory/60">Nothing saved. Open a destination and press Save.</p>}
        <Link href="/saved-places" className="mt-2 inline-block text-sm text-gold underline">Manage all saved items</Link>
      </section>
      <section><h2 className="font-serif text-2xl">Guide requests</h2>
        {reqs.length ? <ul className="mt-3 space-y-2">{reqs.map(({ r, g }) => <li key={r.id} className="card !p-4 flex flex-wrap justify-between gap-2"><span>{g.name} · {r.tourDate} ({r.timeSlot})</span><span className="chip capitalize">{r.status}</span></li>)}</ul> : <p className="mt-3 text-ivory/60">No requests yet. <Link href="/guides" className="text-gold underline">Find a guide</Link>.</p>}
      </section>
      <section><h2 className="font-serif text-2xl">Recently explored</h2>
        {recent.length ? <ul className="mt-3 flex flex-wrap gap-2">{recent.map((d) => <li key={d.slug}><Link href={`/destination/${d.slug}`} className="chip min-h-9 px-4 hover:border-gold">{d.name}</Link></li>)}</ul> : <p className="mt-3 text-ivory/60">Destinations you open will show up here.</p>}
      </section>
      <section><h2 className="font-serif text-2xl">Travel preferences</h2><p className="mt-3 text-ivory/70">Language: {user.language === "hi" ? "हिन्दी" : "English"} · Interests: {user.interests.length ? user.interests.join(", ") : "none chosen"} · <Link href="/profile" className="text-gold underline">Edit</Link></p></section>
    </div>
  );
}

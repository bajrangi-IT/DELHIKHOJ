import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { itineraries } from "@/db/schema";
import PlanClient from "@/components/plan/PlanClient";
import { getCurrentUser } from "@/lib/auth";
import { listAttractions, listDestinations, listMarkets } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Plan your trip", description: "Generate, edit, save and export a Delhi itinerary around any destination.", alternates: { canonical: "/plan-trip" } };

export default async function PlanTrip({ searchParams }: { searchParams: Promise<{ dest?: string; load?: string }> }) {
  const { dest, load } = await searchParams;
  const user = await getCurrentUser();
  const [ds, as, ms] = await Promise.all([listDestinations(), listAttractions(), listMarkets()]);
  let initial = null;
  if (user && load && /^[0-9a-f-]{36}$/i.test(load)) {
    const [it] = await db.select().from(itineraries).where(and(eq(itineraries.id, load), eq(itineraries.userId, user.id)));
    if (it) initial = { id: it.id, title: it.title, tripDate: it.tripDate, stops: it.stops, config: it.config };
  }
  const catalog = [
    ...ds.map((d) => ({ kind: "destination" as const, slug: d.slug, name: d.name, lat: d.lat, lng: d.lng, type: d.category })),
    ...ms.map((m) => ({ kind: "market" as const, slug: m.slug, name: m.name, lat: m.lat, lng: m.lng, type: "market" })),
    ...as.map((a) => ({ kind: "attraction" as const, slug: a.slug, name: a.name, lat: a.lat, lng: a.lng, type: a.type })),
  ];
  const defaultDest = ds.some((d) => d.slug === dest) ? dest! : ds[0]?.slug ?? "";
  return (
    <div className="wrap section">
      <p className="eyebrow">Itinerary planner</p>
      <h1 className="h-display mt-3 !text-5xl sm:!text-6xl">Plan your journey</h1>
      <p className="lead mt-3 mb-10 max-w-2xl">Stops are chosen by proximity and your interests. Travel times are estimates; fees, hours and tickets are never invented.</p>
      <PlanClient key={initial?.id ?? defaultDest} catalog={catalog} destinations={ds.map((d) => ({ slug: d.slug, name: d.name }))} defaultDest={defaultDest} initial={initial} loggedIn={!!user} />
    </div>
  );
}

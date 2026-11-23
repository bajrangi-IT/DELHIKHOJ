import type { Metadata } from "next";
import NearbyExplorer, { type Poi } from "@/components/map/NearbyExplorer";
import { listAttractions, listDestinations, listMarkets, upcomingEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Interactive Delhi map", description: "Filter heritage monuments, museums, markets, restaurants, gardens and events on a map of Delhi.", alternates: { canonical: "/nearby" } };

export default async function Nearby({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const [ds, as, ms, evs] = await Promise.all([listDestinations(), listAttractions(), listMarkets(), upcomingEvents(20)]);
  const pois: Poi[] = [
    ...ds.map((d) => ({ id: d.slug, name: d.name, type: d.category, category: d.category === "garden" ? "garden" : d.category === "museum" ? "museum" : "monument", lat: d.lat, lng: d.lng, locality: d.locality, href: `/destination/${d.slug}`, desc: d.summary, image: d.image })),
    ...as.map((a) => ({ id: a.slug, name: a.name, type: a.type, category: a.type, lat: a.lat, lng: a.lng, locality: a.locality, desc: a.description, image: null })),
    ...ms.map((m) => ({ id: m.slug, name: m.name, type: "market", category: "market", lat: m.lat, lng: m.lng, locality: m.locality, href: `/market/${m.slug}`, desc: m.description, image: m.image })),
    ...evs.filter((e) => e.lat != null && e.lng != null).map((e) => ({ id: e.id, name: e.title, type: "event", category: "event", lat: e.lat!, lng: e.lng!, locality: e.locality, href: "/events", desc: e.description, image: e.image })),
  ];
  return (
    <div className="wrap section">
      <p className="eyebrow">Map</p>
      <h1 className="h-display mt-3">Delhi, mapped</h1>
      <p className="lead mt-3 max-w-2xl">Coordinates are approximate site centre points. Map data © OpenStreetMap contributors.</p>
      <div className="mt-8"><NearbyExplorer pois={pois} focus={focus} /></div>
    </div>
  );
}

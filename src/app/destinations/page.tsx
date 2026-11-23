import type { Metadata } from "next";
import Link from "next/link";
import DestinationCard from "@/components/DestinationCard";
import { listDestinations } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Destinations", description: "Monuments, tombs, gardens, mosques and museums across Delhi.", alternates: { canonical: "/destinations" } };

export default async function Destinations({ searchParams }: { searchParams: Promise<{ cat?: string; era?: string }> }) {
  const { cat, era } = await searchParams;
  const all = await listDestinations();
  const cats = [...new Set(all.map((d) => d.category))];
  const list = all.filter((d) => (!cat || d.category === cat) && (!era || (d.era ?? "").toLowerCase().includes(era.toLowerCase())));
  return (
    <div className="wrap section">
      <p className="eyebrow">Discover</p>
      <h1 className="h-display mt-3">Destinations</h1>
      <p className="lead mt-4 max-w-2xl">Every page has history with sources, visitor information, how to reach, nearby discoveries and local experiences.</p>
      <nav aria-label="Filter by category" className="mt-8 flex flex-wrap gap-2">
        <Link href="/destinations" className={`chip min-h-9 px-4 ${!cat ? "chip-on" : ""}`}>All</Link>
        {cats.map((c) => <Link key={c} href={`/destinations?cat=${c}`} className={`chip min-h-9 px-4 capitalize ${cat === c ? "chip-on" : ""}`}>{c}</Link>)}
      </nav>
      {list.length === 0 ? (
        <p className="card mt-10">No destinations match this filter. <Link className="text-gold underline" href="/destinations">Clear filter</Link></p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{list.map((d) => <DestinationCard key={d.slug} d={d} />)}</div>
      )}
    </div>
  );
}

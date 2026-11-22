import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SmartImage from "@/components/SmartImage";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import { getMarket, nearbyOf } from "@/lib/queries";
import { directionsUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const m = await getMarket((await params).slug);
  return m ? { title: m.name, description: m.description.slice(0, 155) } : { title: "Market not found" };
}

export default async function MarketPage({ params }: P) {
  const m = await getMarket((await params).slug);
  if (!m || !m.published) notFound();
  const near = (await nearbyOf(m.lat, m.lng, { radiusKm: 3, excludeSlug: m.slug })).slice(0, 6);
  return (
    <div className="wrap section">
      <Link href="/markets" className="text-sm text-gold">← All markets</Link>
      <div className="mt-4 grid gap-10 lg:grid-cols-2">
        <SmartImage src={m.image} alt={m.name} fallbackLabel={m.name} priority className="aspect-[4/3] w-full rounded-3xl border border-ivory/10" />
        <div>
          <p className="eyebrow">{m.locality}</p>
          <h1 className="h-display mt-2 !text-5xl">{m.name}</h1>
          <p className="lead mt-4">{m.description}</p>
          <p className="mt-4 text-sm"><strong className="text-gold">Known for:</strong> {m.speciality}</p>
          <p className="mt-2 text-sm text-ivory/60">Hours: {m.hours ?? "Not verified"}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3"><SaveButton kind="market" refId={m.slug} /><ShareButton title={m.name} /><a className="btn btn-gold" href={directionsUrl(m)} target="_blank" rel="noopener noreferrer">Directions ↗</a></div>
        </div>
      </div>
      <h2 className="h-section mt-16">Nearby</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{near.map((n) => <li key={n.slug} className="card !p-4"><p className="text-xs uppercase tracking-widest text-gold">{n.type} · {n.km.toFixed(1)} km</p><p className="font-serif text-xl">{n.name}</p></li>)}{!near.length && <li className="card">Nothing nearby in our database yet.</li>}</ul>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import DestinationCard from "@/components/DestinationCard";
import { listDestinations } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Heritage of Delhi", description: "UNESCO World Heritage Sites and living heritage across Delhi.", alternates: { canonical: "/heritage" } };

export default async function Heritage() {
  const all = await listDestinations();
  const unesco = all.filter((d) => d.unesco);
  const rest = all.filter((d) => !d.unesco);
  return (
    <div className="wrap section">
      <p className="eyebrow">Heritage</p>
      <h1 className="h-display mt-3 !text-5xl sm:!text-6xl">Delhi&apos;s living heritage</h1>
      <p className="lead mt-3 max-w-2xl">Delhi is home to several UNESCO World Heritage Sites and many more protected monuments. Heritage here is also lived: in markets, food lanes, crafts and neighbourhoods.</p>
      <h2 className="h-section mt-14">UNESCO World Heritage Sites</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{unesco.map((d) => <DestinationCard key={d.slug} d={d} />)}</div>
      <h2 className="h-section mt-16">More to discover</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{rest.map((d) => <DestinationCard key={d.slug} d={d} />)}</div>
      <div className="card mt-16"><h2 className="font-serif text-3xl">Visit responsibly</h2><ul className="mt-3 list-disc space-y-1 pl-5 text-ivory/75"><li>Don&apos;t climb on or write on monuments; follow site staff.</li><li>Dress modestly at religious places and remove footwear where asked.</li><li>Hire local guides and buy directly from local artisans.</li></ul><Link href="/historical-timeline" className="btn btn-ghost mt-5">See the timeline</Link></div>
    </div>
  );
}

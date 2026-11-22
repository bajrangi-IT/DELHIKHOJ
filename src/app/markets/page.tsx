import type { Metadata } from "next";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { listMarkets } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Local markets", description: "Traditional markets of Delhi — what to buy, eat and see.", alternates: { canonical: "/markets" } };

export default async function Markets() {
  const ms = await listMarkets();
  return (
    <div className="wrap section">
      <p className="eyebrow">Local discovery</p>
      <h1 className="h-display mt-3 !text-5xl sm:!text-6xl">Markets of Delhi</h1>
      <ul className="mt-10 grid gap-5 md:grid-cols-2">
        {ms.map((m) => (
          <li key={m.slug} className="reveal"><Link href={`/market/${m.slug}`} className="card group block overflow-hidden !p-0">
            <SmartImage src={m.image} alt={m.name} fallbackLabel={m.name} className="h-56 w-full transition duration-700 group-hover:scale-105" />
            <div className="p-6"><p className="eyebrow">{m.locality}</p><h2 className="mt-1 font-serif text-3xl">{m.name}</h2><p className="mt-2 text-sm text-ivory/70">{m.speciality}</p></div>
          </Link></li>
        ))}
      </ul>
      <p className="mt-10 text-ivory/70">Looking for artisans? Browse <Link className="text-gold underline" href="/local-products">local products</Link>.</p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Local products & artisans", description: "Handicrafts, textiles and traditional products from Delhi's local sellers.", alternates: { canonical: "/local-products" } };

export default async function LocalProducts({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const all = await listProducts();
  const cats = [...new Set(all.map((x) => x.p.category))];
  const list = all.filter((x) => !cat || x.p.category === cat);
  return (
    <div className="wrap section">
      <p className="eyebrow">Support local</p>
      <h1 className="h-display mt-3 !text-5xl sm:!text-6xl">Local products</h1>
      <p className="lead mt-3 max-w-2xl">Enquire directly with sellers. Prices are shown only when the seller provides them. No payments are processed on this site.</p>
      <nav aria-label="Categories" className="mt-8 flex flex-wrap gap-2"><Link href="/local-products" className={`chip min-h-9 px-4 ${!cat ? "chip-on" : ""}`}>All</Link>{cats.map((c) => <Link key={c} href={`/local-products?cat=${c}`} className={`chip min-h-9 px-4 capitalize ${cat === c ? "chip-on" : ""}`}>{c}</Link>)}</nav>
      {list.length === 0 ? <p className="card mt-8">No products listed yet. <Link className="text-gold underline" href="/become-seller">Become a seller</Link></p> : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ p, s }) => (
            <li key={p.id}><Link href={`/product/${p.id}`} className="card group block overflow-hidden !p-0">
              <SmartImage src={p.image} alt={p.name} fallbackLabel={p.category} className="h-48 w-full transition duration-700 group-hover:scale-105" />
              <div className="p-5"><div className="flex items-center gap-2">{s.isDemo && <span className="tag-demo">Demo</span>}<span className="text-xs capitalize text-gold">{p.category}</span></div><h2 className="mt-2 font-serif text-2xl">{p.name}</h2><p className="text-sm text-ivory/60">{s.businessName}</p><p className="mt-2 text-sm">{p.priceInr ? `₹${p.priceInr.toLocaleString("en-IN")}` : "Price on enquiry"}</p></div>
            </Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Local to Global · Delhi Artisan Crafts & Heritage Products",
  description: "Handicrafts, block-printed textiles, Dariba silver jewellery and traditional spices direct from Delhi makers.",
  alternates: { canonical: "/local-products" },
};

export default async function LocalProducts({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const all = await listProducts();
  const cats = [...new Set(all.map((x) => x.p.category))];
  const list = all.filter((x) => !cat || x.p.category === cat);

  return (
    <div className="wrap section">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ivory/10 pb-4">
        <div>
          <span className="tag-verified">Local to Global Vision · Vocal for Local 🇮🇳</span>
          <h1 className="h-display mt-2">Delhi Artisan Marketplace</h1>
          <p className="lead mt-2 max-w-2xl text-ivory/80">
            Order authentic handcrafted goods directly from generational artisans. Free delivery to your Delhi hotel or doorstep.
          </p>
        </div>
        <Link href="/become-seller" className="btn btn-gold text-xs">
          + Register as Artisan / Seller
        </Link>
      </div>

      <nav aria-label="Categories" className="mt-8 flex flex-wrap gap-2">
        <Link href="/local-products" className={`chip min-h-9 px-4 ${!cat ? "chip-on" : ""}`}>
          All Crafts
        </Link>
        {cats.map((c) => (
          <Link
            key={c}
            href={`/local-products?cat=${c}`}
            className={`chip min-h-9 px-4 capitalize ${cat === c ? "chip-on" : ""}`}
          >
            {c}
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <div className="card mt-8 text-center p-10">
          <p className="font-serif text-2xl text-ivory">No products found in this category</p>
          <p className="mt-2 text-sm text-ivory/60">
            Artisans are continuously listing new authentic products.
          </p>
          <div className="mt-4">
            <Link className="btn btn-gold text-xs" href="/become-seller">
              Become a Seller
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ p, s }) => (
            <li key={p.id}>
              <Link
                href={`/product/${p.id}`}
                className="card group block overflow-hidden !p-0 border-ivory/10 transition-all hover:border-gold/40 hover:shadow-2xl"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <SmartImage
                    src={p.image ?? s.image}
                    alt={p.name}
                    fallbackLabel={p.category}
                    className="h-full w-full transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-semibold text-gold">
                      {p.category}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                      Direct Order Ready
                    </span>
                  </div>
                  <h2 className="mt-2 font-serif text-2xl font-bold text-ivory group-hover:text-gold transition-colors">
                    {p.name}
                  </h2>
                  <p className="text-xs text-ivory/60 mt-0.5">
                    Artisan: <strong>{s.businessName}</strong> ({s.locality})
                  </p>
                  <p className="mt-2 text-xs text-ivory/70 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-ivory/10 pt-3">
                    <p className="font-serif text-xl font-bold text-gold">
                      {p.priceInr ? `₹${p.priceInr.toLocaleString("en-IN")}` : "Price on enquiry"}
                    </p>
                    <span className="btn btn-gold !min-h-8 !py-1 !px-3 text-xs">
                      Buy Directly →
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

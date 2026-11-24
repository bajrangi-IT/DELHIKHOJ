import type { Metadata } from "next";
import Link from "next/link";
import { listProducts } from "@/lib/queries";
import ArtisanMarketplaceClient from "@/components/shop/ArtisanMarketplaceClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Local to Global · Delhi Artisan Crafts & Heritage Products",
  description: "Authentic Dariba silver filigree, Ruh Gulab ittar, Delhi Blue Pottery, and Kashmiri Pashmina direct from generational master craftsmen.",
  alternates: { canonical: "/local-products" },
};

export default async function LocalProducts({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const all = await listProducts();

  return (
    <div className="wrap section">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="tag-verified">Local to Global Vision</span>
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs text-gold font-semibold border border-gold/30">
              Vocal for Local 🇮🇳
            </span>
          </div>
          <h1 className="h-display mt-3">Delhi Artisan Marketplace</h1>
          <p className="lead mt-2 max-w-2xl text-ivory/80">
            Order authentic handcrafted goods directly from generational artisans. Free delivery to your Delhi hotel or residence, with 0% middleman commission.
          </p>
        </div>
        <Link href="/become-seller" className="btn btn-gold text-xs whitespace-nowrap shadow-md shadow-gold/20">
          + Register as Artisan / Seller
        </Link>
      </div>

      <ArtisanMarketplaceClient products={all} initialCategory={cat ?? ""} />
    </div>
  );
}

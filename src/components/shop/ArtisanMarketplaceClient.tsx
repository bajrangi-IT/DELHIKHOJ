"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";

type ProductWithSeller = {
  p: {
    id: string;
    name: string;
    description: string;
    category: string;
    priceInr: number | null;
    image: string | null;
    availability: string;
  };
  s: {
    id: string;
    slug: string;
    businessName: string;
    locality: string;
    description: string;
    image: string | null;
    contactPhone?: string | null;
  };
};

const CATEGORIES = [
  { id: "", label: "All Crafts", icon: "🌟", color: "from-gold/20 to-gold/5" },
  { id: "fragrances", label: "Pure Ittar & Scents", icon: "🪔", color: "from-amber-500/20 to-amber-500/5" },
  { id: "jewellery", label: "Silver & Meenakari", icon: "💍", color: "from-cyan-500/20 to-cyan-500/5" },
  { id: "pottery", label: "Delhi Blue Pottery", icon: "🏺", color: "from-blue-500/20 to-blue-500/5" },
  { id: "textiles", label: "Zardozi & Pashmina", icon: "🧵", color: "from-purple-500/20 to-purple-500/5" },
  { id: "spices", label: "Khari Baoli Spices", icon: "🌶️", color: "from-red-500/20 to-red-500/5" },
  { id: "woodcraft", label: "Wood Carvings", icon: "🪵", color: "from-emerald-500/20 to-emerald-500/5" },
  { id: "handicraft", label: "Mughal Folk Arts", icon: "🎨", color: "from-rose-500/20 to-rose-500/5" },
];

export default function ArtisanMarketplaceClient({
  products,
  initialCategory = "",
}: {
  products: ProductWithSeller[];
  initialCategory?: string;
}) {
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("");

  const localities = useMemo(() => {
    return Array.from(new Set(products.map((item) => item.s.locality)));
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(({ p, s }) => {
      const matchCat = !selectedCat || p.category === selectedCat;
      const matchLoc = !selectedLocality || s.locality === selectedLocality;
      const matchQuery =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchLoc && matchQuery;
    });
  }, [products, selectedCat, selectedLocality, searchQuery]);

  return (
    <div className="space-y-10">
      {/* 1. Circular Genre / Category Avatar Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider font-semibold text-gold/90">
            Explore by Craft Genre · What to Buy in Delhi
          </p>
          <span className="text-xs text-ivory/50">8 Heritage Traditions</span>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer focus:outline-none"
              >
                <div
                  className={`relative grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full border-2 transition-all duration-300 shadow-lg ${
                    active
                      ? "border-gold bg-gold/25 scale-105 shadow-gold/30"
                      : "border-ivory/20 bg-charcoal/70 group-hover:border-gold/60 group-hover:bg-charcoal"
                  }`}
                >
                  <span className="text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110">
                    {cat.icon}
                  </span>
                  {active && (
                    <span className="absolute -bottom-1 h-2 w-2 rounded-full bg-gold shadow-sm shadow-gold" />
                  )}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-medium text-center whitespace-nowrap max-w-[80px] sm:max-w-[90px] truncate ${
                    active ? "text-gold font-bold" : "text-ivory/70 group-hover:text-ivory"
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Search & Locality Filter Row */}
      <div className="card !p-4 sm:!p-5 bg-charcoal/80 border-ivory/15 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Dariba silver, Ruh Gulab ittar, Pashmina, Blue Pottery, spices…"
              className="input !py-2.5 !text-sm pl-9 pr-8 w-full"
            />
            <span className="absolute left-3 top-3 text-xs text-ivory/50">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-xs text-ivory/40 hover:text-ivory"
              >
                ✕
              </button>
            )}
          </div>

          {/* Locality Dropdown */}
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="input !py-2.5 !text-xs sm:w-56"
          >
            <option value="">All Delhi Localities</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters / Reset */}
        {(selectedCat || selectedLocality || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-ivory/10 text-xs">
            <span className="text-ivory/50">Filtering:</span>
            {selectedCat && (
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-gold border border-gold/30 flex items-center gap-1">
                Category: {CATEGORIES.find((c) => c.id === selectedCat)?.label}
                <button type="button" onClick={() => setSelectedCat("")} className="hover:text-white">✕</button>
              </span>
            )}
            {selectedLocality && (
              <span className="rounded-full bg-ivory/10 px-2.5 py-0.5 text-ivory border border-ivory/20 flex items-center gap-1">
                Locality: {selectedLocality}
                <button type="button" onClick={() => setSelectedLocality("")} className="hover:text-white">✕</button>
              </span>
            )}
            {searchQuery && (
              <span className="rounded-full bg-ivory/10 px-2.5 py-0.5 text-ivory border border-ivory/20 flex items-center gap-1">
                &ldquo;{searchQuery}&rdquo;
                <button type="button" onClick={() => setSearchQuery("")} className="hover:text-white">✕</button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedCat("");
                setSelectedLocality("");
                setSearchQuery("");
              }}
              className="text-gold underline hover:brightness-125 ml-auto cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Product Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="font-serif text-xl sm:text-2xl text-ivory">
            {selectedCat
              ? `${CATEGORIES.find((c) => c.id === selectedCat)?.label} Collection`
              : "All Handcrafted Artisan Products"}
          </p>
          <span className="text-xs text-ivory/60">{filtered.length} products available</span>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center space-y-3">
            <span className="text-4xl">🔍</span>
            <h3 className="font-serif text-2xl text-ivory">No artisan crafts matched your search</h3>
            <p className="text-xs sm:text-sm text-ivory/60 max-w-md mx-auto">
              Try adjusting your craft genre, search term, or clearing locality filters to browse other traditional Delhi works.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCat("");
                setSelectedLocality("");
                setSearchQuery("");
              }}
              className="btn btn-gold text-xs !mt-4"
            >
              View All Delhi Crafts
            </button>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ p, s }) => {
              const cleanPhone = (s.contactPhone || "+91 98102 74819").replace(/[^0-9]/g, "");
              const waText = encodeURIComponent(
                `Namaste ${s.businessName}! I found your "${p.name}" (₹${p.priceInr}) on Delhi Ki Khoj. I would like to enquire / order directly.`
              );
              const waUrl = `https://wa.me/91${cleanPhone.slice(-10)}?text=${waText}`;

              return (
                <li key={p.id}>
                  <div className="card group flex flex-col justify-between overflow-hidden !p-0 border-ivory/15 transition-all hover:border-gold/50 hover:shadow-2xl hover:shadow-gold/10 h-full">
                    <div>
                      {/* Product Visual */}
                      <Link href={`/product/${p.id}`} className="block relative aspect-[4/3] w-full overflow-hidden bg-ink">
                        <SmartImage
                          src={p.image ?? s.image}
                          alt={p.name}
                          fallbackLabel={p.category}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-ink/80 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-gold border border-gold/30 uppercase tracking-wider">
                          {p.category}
                        </span>
                        <span className="absolute top-3 right-3 rounded-full bg-emerald-500/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                          Direct Artisan
                        </span>
                      </Link>

                      {/* Content */}
                      <div className="p-5 space-y-2.5">
                        <Link href={`/product/${p.id}`}>
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-ivory group-hover:text-gold transition-colors line-clamp-1">
                            {p.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-1.5 text-xs text-ivory/60">
                          <span>🏛️</span>
                          <span className="font-semibold text-sand truncate">{s.businessName}</span>
                          <span>·</span>
                          <span className="text-ivory/50 truncate">{s.locality}</span>
                        </div>

                        <p className="text-xs text-ivory/70 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    {/* Pricing & Order CTA */}
                    <div className="p-5 pt-3 border-t border-ivory/10 space-y-3 bg-charcoal/40">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-ivory/50">Fair Artisan Price</span>
                        <span className="font-serif text-2xl font-bold text-gold">
                          ₹{p.priceInr ? p.priceInr.toLocaleString("en-IN") : "850"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/product/${p.id}`}
                          className="btn btn-ghost !min-h-9 !py-1 text-xs text-center justify-center font-semibold"
                        >
                          View Details
                        </Link>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-gold !min-h-9 !py-1 text-xs text-center justify-center font-semibold flex items-center gap-1"
                          title="Chat & Order via WhatsApp"
                        >
                          <span>💬 WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

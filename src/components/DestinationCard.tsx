"use client";
import Link from "next/link";
import { useRef } from "react";
import SmartImage from "@/components/SmartImage";

export type CardData = { slug: string; name: string; nameHi?: string | null; category: string; era?: string | null; summary: string; image?: string | null; locality?: string | null };

/** Image-led card with cinematic reveal and subtle 3D tilt (CSS perspective). */
export default function DestinationCard({ d, href }: { d: CardData; href?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  function move(e: React.MouseEvent) {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches || document.documentElement.dataset.motion === "off") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(0)`;
  }
  function leave() { if (ref.current) ref.current.style.transform = ""; }
  return (
    <Link ref={ref} href={href ?? `/destination/${d.slug}`} onMouseMove={move} onMouseLeave={leave}
      className="reveal group relative block overflow-hidden rounded-2xl border border-ivory/10 bg-charcoal transition-transform duration-200 will-change-transform focus-visible:outline-gold">
      <div className="relative aspect-[4/5] overflow-hidden">
        <SmartImage src={d.image} alt={`Photograph of ${d.name}, ${d.locality ?? "Delhi"}`} fallbackLabel={d.name} className="h-full w-full transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[11px] uppercase tracking-[0.25em] text-gold">{d.category}{d.era ? ` · ${d.era}` : ""}</p>
          <h3 className="mt-1 font-serif text-3xl leading-tight">{d.name}</h3>
          {d.nameHi && <p className="text-sm text-ivory/60" lang="hi">{d.nameHi}</p>}
          <p className="mt-2 line-clamp-2 max-h-0 text-sm text-ivory/75 opacity-0 transition-all duration-500 group-hover:max-h-20 group-hover:opacity-100 group-focus-visible:max-h-20 group-focus-visible:opacity-100">{d.summary}</p>
        </div>
      </div>
    </Link>
  );
}

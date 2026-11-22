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
      <div className="relative aspect-[16/11] overflow-hidden">
        <SmartImage
          src={d.image}
          alt={`Photograph of ${d.name}, ${d.locality ?? "Delhi"}`}
          fallbackLabel={d.name}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[11px] uppercase tracking-[0.25em] text-gold">{d.category}{d.era ? ` · ${d.era}` : ""}</p>
          <h3 className="mt-1 font-serif text-2xl sm:text-3xl leading-tight text-ivory font-bold">{d.name}</h3>
          {d.nameHi && <p className="text-xs text-sand/80 font-serif" lang="hi">{d.nameHi}</p>}
          <p className="mt-1 line-clamp-2 text-xs text-ivory/80 leading-relaxed">{d.summary}</p>
        </div>
      </div>
    </Link>
  );
}

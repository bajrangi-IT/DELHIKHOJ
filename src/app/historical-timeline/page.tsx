import type { Metadata } from "next";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { assets } from "@/lib/assets";
import { eras } from "@/lib/eras";

export const metadata: Metadata = { title: "Historical timeline of Delhi", description: "Five eras of Delhi — from early settlements to modern capital — with sources.", alternates: { canonical: "/historical-timeline" } };

export default function Timeline() {
  return (
    <div className="wrap section">
      <p className="eyebrow">Time travel</p>
      <h1 className="h-display mt-3 !text-5xl sm:!text-6xl">Delhi through the ages</h1>
      <p className="lead mt-3 max-w-2xl">Broad era summaries with widely cited date ranges. Images are AI-generated illustrations — not archival photographs.</p>
      <ol className="relative mt-14 space-y-16 border-l border-gold/30 pl-6 sm:pl-10">
        {eras.map((e, i) => (
          <li key={e.key} className="reveal relative grid gap-6 md:grid-cols-2">
            <span className="absolute -left-[33px] top-2 h-4 w-4 rounded-full bg-gold sm:-left-[49px]" aria-hidden />
            <SmartImage src={assets.eras[e.key]} alt={`${e.title} — AI-generated illustration`} className={`aspect-video w-full rounded-2xl border border-ivory/10 ${i % 2 ? "md:order-2" : ""}`} />
            <div>
              <p className="eyebrow">{e.span}</p>
              <h2 className="h-section mt-2">{e.title}</h2>
              <p className="lead mt-3">{e.blurb}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-ivory/75">{e.details.map((d) => <li key={d}>{d}</li>)}</ul>
              <p className="mt-3 text-xs text-ivory/55">Sources: {e.sources.map((s) => <a key={s.url} className="mr-3 text-gold underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.publisher} ↗</a>)}</p>
              <Link href={`/destination/${e.linkSlug}`} className="btn btn-ghost mt-4">{e.linkLabel}</Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

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
      <h1 className="h-display mt-3">Delhi through the ages</h1>
      <p className="lead mt-3 max-w-2xl">Broad era summaries with widely cited date ranges and authentic heritage photography.</p>
      <ol className="relative mt-12 sm:mt-16 space-y-12 sm:space-y-16 border-l-2 border-gold/40 ml-2 sm:ml-4 pl-5 sm:pl-8">
        {eras.map((e, i) => (
          <li key={e.key} className="reveal relative grid gap-5 sm:gap-6 md:grid-cols-2">
            <span className="absolute -left-[27px] sm:-left-[39px] top-2 h-3.5 w-3.5 rounded-full bg-gold border-2 border-ink ring-4 ring-gold/20" aria-hidden />
            <SmartImage src={assets.eras[e.key]} alt={`Photograph of ${e.title}`} className={`aspect-video w-full rounded-2xl border border-ivory/10 ${i % 2 ? "md:order-2" : ""}`} />
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

"use client";
import Link from "next/link";
import { assets, sequenceFrames } from "@/lib/assets";
import { eras } from "@/lib/eras";
import { useMotionAllowed } from "@/lib/motion";
import { useSectionProgress } from "@/lib/useSectionProgress";
import SequenceCanvas from "./SequenceCanvas";
import SmartImage from "@/components/SmartImage";

export default function EraSequence() {
  const motion = useMotionAllowed();
  const { sectionRef, progressRef, progress } = useSectionProgress(!!motion);
  const dense = sequenceFrames("eraJourney");
  const frames = dense.length ? dense : eras.map((e) => assets.eras[e.key]);
  const idx = Math.min(eras.length - 1, Math.floor(progress * eras.length * 0.999));
  const era = eras[idx];

  if (motion === null) return <div className="skeleton mx-auto my-20 h-96 max-w-5xl" />;

  if (!motion) {
    return (
      <section className="wrap section" aria-labelledby="time-travel">
        <p className="eyebrow">Time travel</p>
        <h2 id="time-travel" className="h-section mt-3">Five eras of Delhi</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-2">
          {eras.map((e) => (
            <li key={e.key} className="card overflow-hidden !p-0">
              <SmartImage src={assets.eras[e.key]} alt={`${e.title} (AI-generated illustration)`} className="aspect-video w-full" />
              <div className="p-6"><p className="eyebrow">{e.span}</p><h3 className="mt-1 font-serif text-3xl">{e.title}</h3><p className="mt-2 text-ivory/75">{e.blurb}</p></div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${eras.length * 100 + 100}vh` }} aria-labelledby="time-travel">
      <div className="sticky top-0 h-screen overflow-hidden">
        <SequenceCanvas frames={frames} progress={progressRef} className="absolute inset-0 h-full w-full" label="Scroll-driven sequence through the eras of Delhi (AI-generated illustrations)" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />
        <div className="wrap relative flex h-full flex-col justify-center">
          <p className="eyebrow">The time-travel experience</p>
          <h2 id="time-travel" className="sr-only">Eras of Delhi</h2>
          <div key={era.key} className="mt-4 max-w-xl animate-[fadein_.8s_ease]">
            <p className="font-serif text-2xl text-gold">{era.span}</p>
            <h3 className="font-serif text-5xl leading-tight sm:text-7xl">{era.title}</h3>
            <p className="lead mt-4">{era.blurb}</p>
            <ul className="mt-4 space-y-2 text-sm text-ivory/70">{era.details.map((d) => <li key={d}>— {d}</li>)}</ul>
            <Link href={`/destination/${era.linkSlug}`} className="btn btn-gold mt-6">{era.linkLabel}</Link>
          </div>
          <ol className="absolute bottom-10 left-5 right-5 flex gap-2 sm:left-8" aria-label="Era progress">
            {eras.map((e, i) => (
              <li key={e.key} className={`h-1 flex-1 rounded ${i <= idx ? "bg-gold" : "bg-ivory/20"}`} aria-current={i === idx} title={e.title} />
            ))}
          </ol>
        </div>
      </div>
      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}

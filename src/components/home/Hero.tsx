"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { assets } from "@/lib/assets";
import { isLowEnd, useMotionAllowed, webglSupported } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const motion = useMotionAllowed();
  const [gl, setGl] = useState(false);
  const [videoOk, setVideoOk] = useState(true);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => setGl(webglSupported() && !isLowEnd()), []);

  useEffect(() => {
    if (!motion || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-in", { y: 40, opacity: 0, duration: 1.4, stagger: 0.18, ease: "power3.out", delay: 0.2 });
      gsap.fromTo(bg.current, { scale: 1.05 }, { scale: 1.3, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-copy", { y: -80, opacity: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "70% top", scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [motion]);

  return (
    <section ref={root} className="relative -mt-16 flex h-[100svh] min-h-[600px] items-center overflow-hidden" aria-label="Introduction">
      <div ref={bg} className="absolute inset-0 will-change-transform">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${assets.hero.poster})` }} role="img" aria-label="Panoramic view of heritage monuments in Delhi" />
        {assets.hero.video && videoOk && motion && (
          <video ref={video} className="absolute inset-0 h-full w-full object-cover" src={assets.hero.video} poster={assets.hero.poster} muted loop playsInline autoPlay onError={() => setVideoOk(false)} />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/60" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      {motion && gl && <HeroScene />}

      <div className="hero-copy wrap relative z-10 pt-16">
        <p className="hero-in eyebrow">Delhi · Heritage · Discovery</p>
        <h1 className="hero-in h-display mt-4 max-w-4xl text-ivory">THE DELHI <span className="text-gold">KI KHOJ</span></h1>
        <p className="hero-in lead mt-6 max-w-2xl">Every street has a story. Every monument holds a memory. Discover the Delhi beyond the ordinary.</p>
        <div className="hero-in mt-8 sm:mt-9 flex flex-col sm:flex-row gap-3 max-w-md sm:max-w-none">
          <Link href="/explore" className="btn btn-gold w-full sm:w-auto text-center justify-center">EXPLORE DELHI</Link>
          <Link href="/plan-trip" className="btn btn-ghost w-full sm:w-auto text-center justify-center">PLAN YOUR JOURNEY</Link>
        </div>
      </div>
      <a href="#welcome" className="scroll-cue absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-xs uppercase tracking-[0.3em] text-ivory/70" aria-label="Scroll to continue">
        Scroll<span className="mx-auto mt-2 block h-8 w-px bg-gold" />
      </a>
    </section>
  );
}

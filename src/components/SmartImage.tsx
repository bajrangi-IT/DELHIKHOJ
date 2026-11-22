"use client";
import { useState } from "react";

/** Intentional fallback artwork when an asset is missing — never a broken image or empty black box. */
export function FallbackArt({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label ? `${label} (heritage placeholder)` : "Heritage placeholder"}
      className={`jali relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-maroon/70 via-charcoal to-ink ${className}`}
    >
      <svg viewBox="0 0 120 120" className="h-1/2 max-h-40 w-1/2 max-w-40 text-gold/50" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
        <path d="M10 110V60a50 50 0 0 1 100 0v50M30 110V64a30 30 0 0 1 60 0v46M60 14V4M52 110V84a8 8 0 0 1 16 0v26" />
      </svg>
      {label && <span className="absolute bottom-3 left-4 right-4 font-serif text-xl text-ivory/80">{label}</span>}
    </div>
  );
}

export default function SmartImage({
  src, alt, className = "", fallbackLabel, priority = false,
}: { src?: string | null; alt: string; className?: string; fallbackLabel?: string; priority?: boolean }) {
  const [bad, setBad] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || bad) return <FallbackArt label={fallbackLabel ?? alt} className={className} />;

  return (
    <div className={`relative overflow-hidden bg-charcoal/50 ${className}`}>
      {!loaded && <div className="skeleton absolute inset-0 h-full w-full" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setBad(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

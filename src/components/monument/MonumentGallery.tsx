"use client";

import { useState } from "react";
import SmartImage from "@/components/SmartImage";
import type { MonumentViewAngle } from "@/lib/assets";

interface Props {
  views: MonumentViewAngle[];
  monumentName: string;
}

export default function MonumentGallery({ views, monumentName }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const active = views[activeIdx] ?? views[0];

  function next() {
    setActiveIdx((prev) => (prev + 1) % views.length);
  }

  function prev() {
    setActiveIdx((prev) => (prev - 1 + views.length) % views.length);
  }

  return (
    <div className="card !p-4 sm:!p-6 space-y-4 border border-gold/20 bg-charcoal/70 backdrop-blur-md">
      {/* Gallery Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ivory/10 pb-3">
        <div>
          <span className="tag-verified text-[10px]">Architectural Visual Archive</span>
          <h3 className="font-serif text-xl sm:text-2xl text-ivory mt-0.5">
            📸 More Images & Perspectives
          </h3>
          <p className="text-xs text-ivory/60">
            High-resolution curated exterior, golden hour, and architectural views of {monumentName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gold font-mono bg-gold/10 px-2.5 py-1 rounded-full border border-gold/25">
            {activeIdx + 1} / {views.length} Views
          </span>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="btn btn-ghost !min-h-8 !py-1 !px-2.5 text-xs text-ivory/80 hover:text-gold"
            title="Expand to Fullscreen"
          >
            🔍 Fullscreen
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-ivory/15 bg-ink shadow-2xl group">
        <SmartImage
          src={active.url}
          alt={`${monumentName} - ${active.label}`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="rounded-full bg-ink/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-gold border border-gold/30 shadow-md">
            {active.id === "facade"
              ? "🏛️ Grand Facade"
              : active.id === "sunset"
              ? "🌅 Golden Hour & Dusk"
              : active.id === "detail"
              ? "🔍 Architectural Detail"
              : "✨ Panoramic & Aerial"}
          </span>
        </div>

        {/* Navigation Arrows */}
        {views.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-ink/70 text-ivory backdrop-blur-md border border-ivory/20 hover:border-gold hover:text-gold transition-colors shadow-lg"
              aria-label="Previous view"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-ink/70 text-ivory backdrop-blur-md border border-ivory/20 hover:border-gold hover:text-gold transition-colors shadow-lg"
              aria-label="Next view"
            >
              ›
            </button>
          </>
        )}

        {/* Bottom Caption Overlay */}
        <div className="absolute bottom-3 inset-x-3 rounded-xl bg-ink/85 backdrop-blur-md p-3 border border-ivory/15 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-serif text-base sm:text-lg text-ivory font-bold">{active.label}</h4>
            <p className="text-xs text-sand/85 line-clamp-1 sm:line-clamp-none">{active.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="text-xs text-gold underline hover:brightness-125 whitespace-nowrap cursor-pointer"
          >
            Click to expand ↗
          </button>
        </div>
      </div>

      {/* Thumbnails Row */}
      {views.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
          {views.map((v, idx) => (
            <button
              type="button"
              key={v.id + idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative flex items-center gap-2 rounded-xl p-1.5 text-left border transition-all cursor-pointer ${
                activeIdx === idx
                  ? "border-gold bg-gold/15 shadow-md shadow-gold/20"
                  : "border-ivory/10 hover:border-ivory/30 bg-charcoal/40"
              }`}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ink border border-ivory/10">
                <SmartImage src={v.url} alt={v.label} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${activeIdx === idx ? "text-gold" : "text-ivory/90"}`}>
                  {v.label}
                </p>
                <p className="text-[10px] text-ivory/50 capitalize truncate">
                  {v.id === "facade" ? "Exterior" : v.id === "sunset" ? "Evening" : v.id === "detail" ? "Carvings" : "Aerial"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4"
          onClick={() => setFullscreen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full bg-ivory/15 text-ivory text-xl hover:bg-gold hover:text-ink transition-colors cursor-pointer"
              aria-label="Close fullscreen view"
            >
              ✕
            </button>

            <div className="relative w-full max-h-[75vh] overflow-hidden rounded-2xl border border-gold/30 shadow-2xl">
              <SmartImage
                src={active.url}
                alt={`${monumentName} - ${active.label}`}
                className="w-full max-h-[75vh] object-contain bg-black"
              />
            </div>

            <div className="mt-4 text-center space-y-1">
              <p className="font-serif text-xl sm:text-2xl text-ivory font-bold">{active.label}</p>
              <p className="text-sm text-sand/80 max-w-2xl">{active.description}</p>
              <p className="text-xs text-gold/70 font-mono pt-1">
                {activeIdx + 1} of {views.length} · {monumentName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

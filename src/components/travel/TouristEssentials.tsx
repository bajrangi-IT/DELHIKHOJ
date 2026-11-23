import React from "react";
import { getEssentialsForDestination } from "@/lib/tourist-essentials";

interface TouristEssentialsProps {
  slug: string;
  name: string;
  locality?: string | null;
}

export default function TouristEssentials({ slug, name, locality }: TouristEssentialsProps) {
  const essentials = getEssentialsForDestination(slug, name, locality);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ivory/10 pb-4">
        <div>
          <span className="tag-verified">Verified Delhi Travel Advisory</span>
          <h3 className="h-section mt-2 text-xl sm:text-2xl lg:text-3xl">Essential Visitor Guide for {name}</h3>
          <p className="mt-1 text-sm text-ivory/70">
            Crucial guidelines, entrance fees, dress codes, and transport access every tourist must know before visiting.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Hours & Best Time */}
        <div className="card space-y-2 border-gold/20">
          <div className="flex items-center gap-2 text-gold">
            <span className="text-xl">🕒</span>
            <span className="eyebrow !text-gold">Timings & Best Hours</span>
          </div>
          <p className="font-semibold text-ivory">{essentials.timings}</p>
          <p className="text-xs text-ivory/70">
            <strong className="text-gold">Best visit window:</strong> {essentials.bestTime}
          </p>
          <div className="rounded-lg bg-maroon/20 px-2.5 py-1 text-xs text-red-200">
            <strong>Closed:</strong> {essentials.closedOn}
          </div>
        </div>

        {/* Entrance Fees */}
        <div className="card space-y-2 border-gold/20">
          <div className="flex items-center gap-2 text-gold">
            <span className="text-xl">🎟️</span>
            <span className="eyebrow !text-gold">Official Entry Fees</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between border-b border-ivory/10 py-1">
              <span className="text-ivory/80">Indian Citizens / SAARC:</span>
              <span className="font-semibold text-emerald-300">
                {essentials.fees.indian === 0 ? "Free Entry" : `₹${essentials.fees.indian}`}
              </span>
            </div>
            <div className="flex justify-between border-b border-ivory/10 py-1">
              <span className="text-ivory/80">Foreign Visitors:</span>
              <span className="font-semibold text-gold">
                {essentials.fees.foreigner === 0 ? "Free Entry" : `₹${essentials.fees.foreigner}`}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ivory/80">Children under 15:</span>
              <span className="font-semibold text-ivory">{essentials.fees.childrenUnder15}</span>
            </div>
          </div>
        </div>

        {/* Delhi Metro & Transport */}
        <div className="card space-y-2 border-gold/20">
          <div className="flex items-center gap-2 text-gold">
            <span className="text-xl">🚇</span>
            <span className="eyebrow !text-gold">Nearest Delhi Metro</span>
          </div>
          <p className="font-semibold text-ivory">{essentials.metroStation}</p>
          <p className="text-xs text-ivory/80">
            <strong className="text-gold">Exit Gate:</strong> {essentials.metroGate}
          </p>
          <p className="text-xs text-ivory/60">
            <strong>Line:</strong> {essentials.metroLine}
          </p>
        </div>

        {/* Dress Code & Etiquette */}
        <div className="card space-y-2 border-ivory/10">
          <div className="flex items-center gap-2 text-gold">
            <span className="text-xl">👕</span>
            <span className="eyebrow !text-gold">Dress Code & Etiquette</span>
          </div>
          <p className="text-xs leading-relaxed text-ivory/80">{essentials.dressCode}</p>
        </div>

        {/* Photography & Electronics */}
        <div className="card space-y-2 border-ivory/10">
          <div className="flex items-center gap-2 text-gold">
            <span className="text-xl">📸</span>
            <span className="eyebrow !text-gold">Photography Rules</span>
          </div>
          <p className="text-xs leading-relaxed text-ivory/80">{essentials.photography}</p>
          <p className="text-[11px] text-ivory/50">
            <strong>Cloakroom:</strong> {essentials.cloakroom}
          </p>
        </div>

        {/* Safety & Scam Alerts */}
        <div className="card space-y-2 border-maroon/40 bg-maroon/10">
          <div className="flex items-center gap-2 text-red-300">
            <span className="text-xl">🛡️</span>
            <span className="eyebrow !text-red-300">Tourist Safety & Advisory</span>
          </div>
          <ul className="list-disc space-y-1 pl-4 text-xs text-ivory/80">
            {essentials.safetyTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

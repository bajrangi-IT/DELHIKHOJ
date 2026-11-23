import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About", description: "Why THE DELHI KI KHOJ exists and how it handles information honestly.", alternates: { canonical: "/about" } };

export default function About() {
  return (
    <div className="wrap section mx-auto max-w-3xl">
      <p className="eyebrow">About</p>
      <h1 className="h-display mt-3">Discover Delhi. Experience its history. Support its people.</h1>
      <div className="mt-8 space-y-5 text-lg text-ivory/80">
        <p>THE DELHI KI KHOJ (&ldquo;the search for Delhi&rdquo;) helps travellers go deeper than the famous skyline: understand a place, plan the day around it, and spend money with local guides, artisans and sellers.</p>
        <h2 className="h-section text-xl sm:text-2xl lg:text-3xl">How we treat information</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Historical text is an editorial summary with source links. We label what we haven&apos;t verified.</li>
          <li>Opening hours, fees, event schedules and ticket availability change — we link to official providers instead of guessing.</li>
          <li>Guide and seller profiles are reviewed by an admin before being listed. Sample profiles are marked DEMO. We don&apos;t publish invented reviews.</li>
          <li>Visuals are AI-generated illustrations, not archival photographs, and are described that way.</li>
          <li>We are an independent project, not a government body. No payments are processed on this site.</li>
        </ul>
        <p><Link href="/explore" className="btn btn-gold">Start exploring</Link></p>
      </div>
    </div>
  );
}

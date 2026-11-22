import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <div className="wrap section mx-auto max-w-3xl space-y-4 text-ivory/80">
      <h1 className="h-section">Privacy Policy</h1>
      <p className="text-sm text-ivory/50">Project policy summary — have it reviewed by a qualified professional before public launch.</p>
      <h2 className="font-serif text-2xl text-ivory">What we store</h2>
      <p>Account details (name, email, optional phone, language, interests), hashed passwords (never plain text), saved places, itineraries, guide requests, enquiries and contact messages.</p>
      <h2 className="font-serif text-2xl text-ivory">Cookies</h2>
      <p>One essential, httpOnly session cookie keeps you logged in. We also keep a motion preference and recent searches in your browser&apos;s local storage; they never leave your device.</p>
      <h2 className="font-serif text-2xl text-ivory">Third parties</h2>
      <p>Maps load tiles from OpenStreetMap. Route estimates use an OSRM-compatible service and place search uses OpenStreetMap Nominatim; coordinates you enter may be sent to them. Ticket links leave this site for the provider&apos;s own policies. Fonts are loaded from Google Fonts.</p>
      <h2 className="font-serif text-2xl text-ivory">Your choices</h2>
      <p>You can edit your profile and delete saved items at any time. To delete your account, contact us via the Contact page.</p>
    </div>
  );
}

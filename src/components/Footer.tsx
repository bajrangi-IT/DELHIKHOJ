import Link from "next/link";

const cols = [
  { title: "Discover", links: [["/explore", "AI Explore"], ["/destinations", "Destinations"], ["/heritage", "Heritage"], ["/historical-timeline", "Timeline"], ["/nearby", "Map"]] },
  { title: "Experience", links: [["/events", "Events"], ["/guides", "Local guides"], ["/markets", "Markets"], ["/local-products", "Local products"], ["/plan-trip", "Plan a trip"]] },
  { title: "Join", links: [["/signup", "Create account"], ["/login", "Log in"], ["/become-guide", "Become a guide"], ["/become-seller", "Become a seller"]] },
  { title: "Company", links: [["/about", "About"], ["/contact", "Contact"], ["/privacy", "Privacy"], ["/terms", "Terms"]] },
];

export default function Footer() {
  return (
    <footer className="border-t border-ivory/10 bg-charcoal/40">
      <div className="wrap grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-1">
          <p className="font-serif text-2xl">THE <span className="text-gold">DELHI KI KHOJ</span></p>
          <p className="mt-3 text-sm text-ivory/60">Discover Delhi. Experience Its History. Support Its People.</p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="eyebrow !font-sans">{c.title}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {c.links.map(([h, l]) => (
                <li key={h}><Link className="text-ivory/70 hover:text-gold" href={h}>{l}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-ivory/10 py-5 text-center text-xs text-ivory/50">
        <p className="wrap">Independent project — not affiliated with any government body. Hero and destination visuals feature authentic photographs of Delhi&apos;s monuments and heritage. Official hours, fees and tickets must be confirmed with the providers.</p>
      </div>
    </footer>
  );
}

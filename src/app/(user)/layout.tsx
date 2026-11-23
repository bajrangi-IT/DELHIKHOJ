import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Distinct role configurations
  const roleConfig = {
    tourist: {
      title: "Explorer Hub",
      badge: "🧭 Traveller & Explorer",
      badgeClass: "bg-gold/15 text-gold border-gold/30",
      description: "Delhi Tourism & Heritage Pass Holder",
      nav: [
        { href: "/dashboard", label: "🧳 Traveller Dashboard" },
        { href: "/my-bookings", label: "🎟️ My Passes & Orders" },
        { href: "/my-trips", label: "🗺️ My Planned Trips" },
        { href: "/saved-places", label: "❤️ Saved Heritage Sites" },
        { href: "/my-guide-requests", label: "🚶 Guided Tour Requests" },
        { href: "/profile", label: "👤 Explorer Profile" },
        { href: "/settings", label: "⚙️ Account Settings" },
      ],
      bottomLinks: [
        { href: "/become-seller", label: "🏺 Sell Authentic Crafts", desc: "For Delhi artisans & makers" },
        { href: "/become-guide", label: "🧭 Become a Tour Guide", desc: "For ASI licensed storytellers" },
      ],
    },
    seller: {
      title: "Artisan Workshop",
      badge: "🏺 Delhi Artisan Craftsman",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      description: "Vocal for Local · Direct Craft Sales",
      nav: [
        { href: "/seller-dashboard", label: "🏺 Workshop Portal" },
        { href: "/seller-dashboard", label: "📦 Incoming Tourist Orders" },
        { href: "/seller-dashboard", label: "🛍️ Product Inventory" },
        { href: "/seller-dashboard", label: "💰 10% Commission Ledger" },
        { href: "/seller-dashboard", label: "💬 Customer Enquiries" },
        { href: "/profile", label: "👤 Workshop Profile" },
        { href: "/settings", label: "⚙️ Store Settings" },
      ],
      bottomLinks: [
        { href: "/local-products", label: "🛍️ Public Marketplace", desc: "Preview your listed items" },
        { href: "/dashboard", label: "🧳 Traveller Experience", desc: "Browse as a tourist" },
      ],
    },
    guide: {
      title: "Guide Dispatch",
      badge: "📜 ASI Licensed Guide",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      description: "Heritage Walks & Monument Storyteller",
      nav: [
        { href: "/guide-dashboard", label: "🧭 Guide Hub" },
        { href: "/guide-dashboard", label: "📅 Tour Booking Requests" },
        { href: "/guide-dashboard", label: "💰 Tour Earnings & Payouts" },
        { href: "/guides", label: "🏛️ Public Guide Directory" },
        { href: "/profile", label: "👤 Guide Profile" },
        { href: "/settings", label: "⚙️ Settings" },
      ],
      bottomLinks: [
        { href: "/destinations", label: "🏛️ Explore Monuments", desc: "Delhi 7 Cities database" },
        { href: "/dashboard", label: "🧳 Traveller View", desc: "Browse as a visitor" },
      ],
    },
    admin: {
      title: "Platform Console",
      badge: "🛡️ Platform Administrator",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      description: "Delhi Ki Khoj Superadmin Portal",
      nav: [
        { href: "/admin", label: "📊 Revenue & Overview" },
        { href: "/admin/users", label: "👥 Users Management" },
        { href: "/admin/sellers", label: "🏺 Artisan Verification" },
        { href: "/admin/guides", label: "🧭 Guide Licenses" },
        { href: "/admin/destinations", label: "🏛️ Monuments & Content" },
        { href: "/admin/products", label: "🛍️ Marketplace Products" },
        { href: "/profile", label: "👤 Profile" },
        { href: "/settings", label: "⚙️ Settings" },
      ],
      bottomLinks: [
        { href: "/dashboard", label: "🧳 Traveller Dashboard", desc: "View user interface" },
        { href: "/seller-dashboard", label: "🏺 Seller Portal", desc: "View artisan interface" },
      ],
    },
  };

  const currentRole = (user.role in roleConfig ? user.role : "tourist") as keyof typeof roleConfig;
  const cfg = roleConfig[currentRole];

  return (
    <div className="wrap grid gap-8 py-10 lg:grid-cols-[250px_1fr]">
      {/* Sidebar Navigation */}
      <aside aria-label="Account Portal" className="lg:sticky lg:top-24 lg:h-fit space-y-6">
        {/* User Identity Card */}
        <div className="card !p-4 border-ivory/15 bg-charcoal/80 space-y-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold font-bold text-lg border border-gold/40">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-serif text-base font-bold text-ivory truncate">{user.fullName}</p>
              <p className="text-[11px] text-ivory/50 truncate">{user.email}</p>
            </div>
          </div>

          <div>
            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.badgeClass}`}>
              {cfg.badge}
            </span>
            <p className="mt-1 text-[11px] text-ivory/60">{cfg.description}</p>
          </div>
        </div>

        {/* Specialized Navigation Menu */}
        <nav className="card !p-3 border-ivory/10 space-y-1">
          <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ivory/50">
            {cfg.title} Navigation
          </p>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {cfg.nav.map((item, idx) => (
              <li key={`${item.href}-${idx}`}>
                <Link
                  href={item.href}
                  className="block whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium text-ivory/80 transition-colors hover:bg-gold/15 hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Partner & Switch Roles Card */}
        {cfg.bottomLinks.length > 0 && (
          <div className="card !p-3 border-ivory/10 bg-ink/60 space-y-2">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-ivory/40">
              {currentRole === "tourist" ? "Partner with Delhi Ki Khoj" : "Cross-Portal Navigation"}
            </p>
            {cfg.bottomLinks.map((bl) => (
              <Link
                key={bl.href}
                href={bl.href}
                className="block rounded-lg p-2 transition-colors hover:bg-charcoal"
              >
                <p className="text-xs font-semibold text-gold">{bl.label} →</p>
                <p className="text-[10px] text-ivory/50">{bl.desc}</p>
              </Link>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0">{children}</main>
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type U = { fullName: string; role: string } | null;

const NAV_ITEMS = [
  { href: "/destinations", label: "Destinations" },
  {
    label: "Heritage & Map",
    href: "/heritage",
    sub: [
      { href: "/heritage", label: "7 Cities of Delhi" },
      { href: "/historical-timeline", label: "Chronological Timeline" },
      { href: "/nearby", label: "Interactive GIS Map" },
      { href: "/events", label: "Heritage Walks & Events" },
    ],
  },
  { href: "/guides", label: "Local Guides" },
  {
    label: "Local to Global",
    href: "/local-products",
    badge: "Vocal for Local",
    sub: [
      { href: "/local-products", label: "Artisan Handicrafts" },
      { href: "/markets", label: "Historic Bazaars & Spices" },
    ],
  },
];

export default function Navbar({ user }: { user: U }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    setOpen(false);
    setActiveMenu(null);
  }, [path]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    // Always keep motion ON
    try {
      localStorage.removeItem("dkk-motion");
      document.documentElement.dataset.motion = "on";
    } catch {
      // ignore
    }
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/";
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        scrolled || open
          ? "bg-ink/95 backdrop-blur-md border-b border-ivory/10 shadow-lg shadow-black/40"
          : "bg-gradient-to-b from-ink/90 via-ink/50 to-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink focus:font-semibold focus:shadow-lg focus:z-50"
      >
        Skip to content
      </a>

      <nav className="wrap flex h-16 items-center justify-between gap-2 lg:gap-3 xl:gap-4" aria-label="Main">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 group transition-transform duration-200 active:scale-95 shrink-0"
          >
            <span className="font-serif text-sm sm:text-base xl:text-xl font-bold tracking-wider text-ivory whitespace-nowrap">
              THE <span className="text-gold">DELHI KI KHOJ</span>
            </span>
          </Link>
          <span className="hidden 2xl:inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold border border-gold/30 whitespace-nowrap">
            Local to Global 🌐
          </span>
        </div>

        {/* Streamlined Desktop Navigation */}
        <ul className="hidden items-center gap-1 xl:gap-2 lg:flex shrink-0">
          {NAV_ITEMS.map((item) => {
            const hasSub = Boolean(item.sub);
            const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));

            if (!hasSub) {
              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 text-xs xl:text-sm font-medium rounded-full whitespace-nowrap shrink-0 transition-all duration-200 ${
                      active
                        ? "text-gold bg-gold/15 font-semibold shadow-sm shadow-gold/20"
                        : "text-ivory/80 hover:text-gold hover:bg-ivory/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={item.label}
                className="relative shrink-0"
                onMouseEnter={() => setActiveMenu(item.label)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-2.5 py-1.5 xl:px-3.5 xl:py-2 text-xs xl:text-sm font-medium rounded-full whitespace-nowrap shrink-0 transition-all duration-200 ${
                    active
                      ? "text-gold bg-gold/15 font-semibold"
                      : "text-ivory/80 hover:text-gold hover:bg-ivory/5"
                  }`}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-300 whitespace-nowrap">
                      ★
                    </span>
                  )}
                  <span className="text-[10px] opacity-60">▾</span>
                </Link>

                {activeMenu === item.label && (
                  <div className="absolute left-0 top-full pt-1.5 w-56 z-50">
                    <div className="rounded-2xl border border-ivory/15 bg-ink/95 p-2 shadow-2xl backdrop-blur-xl">
                      {item.sub!.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block rounded-xl px-3 py-2 text-xs whitespace-nowrap transition-colors ${
                            path === sub.href
                              ? "bg-gold/20 text-gold font-semibold"
                              : "text-ivory/80 hover:bg-charcoal hover:text-gold"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}

          {/* Standout Plan CTA */}
          <li className="shrink-0">
            <Link
              href="/plan-trip"
              className="ml-1 xl:ml-2 inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold text-ink shadow-md shadow-gold/20 hover:brightness-110 whitespace-nowrap shrink-0 transition-all duration-200 active:scale-95"
            >
              <span>🧭 Plan Trip</span>
            </Link>
          </li>
        </ul>

        {/* Right Action Icons & User Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/my-bookings"
                className="hidden xl:inline-flex items-center rounded-full border border-gold/30 px-3 py-1 text-xs text-gold hover:bg-gold/10 whitespace-nowrap shrink-0 transition-colors"
              >
                🎟️ Passes & Orders
              </Link>
              <Link
                href={
                  user.role === "admin"
                    ? "/admin"
                    : user.role === "seller"
                    ? "/seller-dashboard"
                    : user.role === "guide"
                    ? "/guide-dashboard"
                    : "/dashboard"
                }
                className="btn btn-gold !min-h-8 !py-1 !px-3 text-xs whitespace-nowrap shrink-0 hidden sm:inline-flex"
              >
                {user.role === "admin"
                  ? "Admin"
                  : user.role === "seller"
                  ? "Artisan"
                  : user.role === "guide"
                  ? "Guide Hub"
                  : "Dashboard"}
              </Link>
              <button
                onClick={logout}
                className="btn btn-ghost !min-h-8 !py-1 !px-2.5 text-xs whitespace-nowrap shrink-0 hidden sm:inline-flex"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/login"
                className="btn btn-ghost !min-h-8 !py-1 !px-3 text-xs whitespace-nowrap shrink-0 hidden sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn btn-gold !min-h-8 !py-1 !px-3 text-xs whitespace-nowrap shrink-0 hidden sm:inline-flex"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-ivory/20 hover:border-gold transition-colors shrink-0 lg:hidden cursor-pointer"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            <span aria-hidden className="text-lg">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain border-t border-ivory/10 bg-ink/98 backdrop-blur-xl px-4 pb-8 pt-3 lg:hidden space-y-3"
        >
          {/* User Status in Mobile Drawer */}
          {user ? (
            <div className="flex items-center justify-between rounded-xl bg-charcoal/80 p-3 border border-ivory/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/20 text-gold font-bold text-xs border border-gold/30">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-sm font-semibold text-ivory truncate">{user.fullName}</p>
                  <span className="chip !text-[10px] !py-0 !px-2 border-gold/30 text-gold capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
              <Link href="/plan-trip" className="btn btn-gold !min-h-8 !py-1 !px-3 text-xs whitespace-nowrap">
                🧭 Plan Trip
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
              <span className="text-xs font-semibold text-gold whitespace-nowrap">Local to Global Delhi 🌐</span>
              <Link href="/plan-trip" className="btn btn-gold !min-h-8 text-xs px-3 whitespace-nowrap">
                🧭 Plan Trip
              </Link>
            </div>
          )}

          <ul className="grid gap-1">
            {[
              { href: "/destinations", label: "🏛️ Destinations & Monuments" },
              { href: "/heritage", label: "📜 Heritage of Delhi (7 Cities)" },
              { href: "/historical-timeline", label: "⏳ Historical Timeline" },
              { href: "/nearby", label: "🗺️ Interactive GIS Map" },
              { href: "/guides", label: "🧭 Verified Local Guides" },
              { href: "/local-products", label: "🛍️ Artisan Handicrafts (Local to Global)" },
              { href: "/markets", label: "🏪 Historic Bazaars & Spices" },
              { href: "/events", label: "🎪 Cultural Events & Walks" },
            ].map((navLink) => (
              <li key={navLink.href}>
                <Link
                  href={navLink.href}
                  className={`flex min-h-[44px] items-center rounded-xl px-3.5 py-2 text-sm transition-colors ${
                    path === navLink.href
                      ? "bg-gold/15 text-gold font-semibold shadow-sm shadow-gold/10"
                      : "text-ivory/80 hover:bg-charcoal hover:text-ivory"
                  }`}
                >
                  {navLink.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 pt-3 border-t border-ivory/10">
            {user ? (
              <>
                <Link href="/my-bookings" className="btn btn-ghost w-full text-center text-xs whitespace-nowrap !min-h-10">
                  🎟️ My Bookings, Passes & Orders
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={
                      user.role === "admin"
                        ? "/admin"
                        : user.role === "seller"
                        ? "/seller-dashboard"
                        : user.role === "guide"
                        ? "/guide-dashboard"
                        : "/dashboard"
                    }
                    className="btn btn-gold text-center text-xs whitespace-nowrap !min-h-10"
                  >
                    {user.role === "admin"
                      ? "Admin Portal"
                      : user.role === "seller"
                      ? "Artisan Portal"
                      : user.role === "guide"
                      ? "Guide Portal"
                      : "Dashboard"}
                  </Link>
                  <button onClick={logout} className="btn btn-ghost text-center text-xs whitespace-nowrap !min-h-10">
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" className="btn btn-ghost text-center text-xs whitespace-nowrap !min-h-10">
                  Log in
                </Link>
                <Link href="/signup" className="btn btn-gold text-center text-xs whitespace-nowrap !min-h-10">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

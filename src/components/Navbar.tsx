"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type U = { fullName: string; role: string } | null;
const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/destinations", label: "Destinations" },
  { href: "/heritage", label: "Heritage" },
  { href: "/historical-timeline", label: "Timeline" },
  { href: "/nearby", label: "Map" },
  { href: "/events", label: "Events" },
  { href: "/guides", label: "Guides" },
  { href: "/markets", label: "Markets" },
  { href: "/local-products", label: "Crafts" },
  { href: "/plan-trip", label: "Plan Trip" },
];

export default function Navbar({ user }: { user: U }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [motionOff, setMotionOff] = useState(false);
  const path = usePathname();
  const router = useRouter();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    setMotionOff(localStorage.getItem("dkk-motion") === "off");
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  function toggleMotion() {
    const next = !motionOff;
    setMotionOff(next);
    localStorage.setItem("dkk-motion", next ? "off" : "on");
    window.dispatchEvent(new Event("dkk-motion"));
  }

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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out ${
        scrolled || open
          ? "bg-ink/95 backdrop-blur-md border-b border-ivory/10 shadow-lg shadow-black/30"
          : "bg-gradient-to-b from-ink/80 via-ink/40 to-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink focus:font-semibold focus:shadow-lg focus:z-50"
      >
        Skip to content
      </a>
      <nav className="wrap flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Link
          href="/"
          className="font-serif text-xl leading-none tracking-wide text-ivory sm:text-2xl transition-transform duration-300 hover:scale-[1.02] active:scale-95"
        >
          THE <span className="text-gold">DELHI KI KHOJ</span>
        </Link>
        <ul className="hidden items-center gap-1 xl:gap-2 lg:flex">
          {LINKS.map((l) => {
            const active = path === l.href || (l.href !== "/" && path.startsWith(l.href));
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3 py-1.5 text-xs xl:text-sm font-medium rounded-full transition-all duration-300 active:scale-95 ${
                    active
                      ? "text-gold bg-gold/15 shadow-sm shadow-gold/20 font-semibold"
                      : "text-ivory/75 hover:text-gold hover:bg-ivory/5"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMotion}
            aria-pressed={motionOff}
            title="Turn animations on or off"
            className="hidden min-h-9 rounded-full border border-ivory/20 px-3 text-xs text-ivory/70 hover:border-gold hover:text-gold transition-all duration-200 active:scale-95 sm:block cursor-pointer"
          >
            Motion: {motionOff ? "Off" : "On"}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                className="btn btn-gold !min-h-9 !px-4 text-xs hidden sm:inline-flex"
              >
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
              <button
                onClick={logout}
                className="btn btn-ghost !min-h-9 !px-4 text-xs hidden sm:inline-flex"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="btn btn-ghost !min-h-9 !px-4 text-xs hidden sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn btn-gold !min-h-9 !px-4 text-xs hidden sm:inline-flex"
              >
                Sign up
              </Link>
            </div>
          )}
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-ivory/20 hover:border-gold transition-colors duration-200 lg:hidden cursor-pointer"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            <span aria-hidden className="text-xl transition-transform duration-200">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </nav>
      {open && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-ivory/10 bg-ink/95 backdrop-blur-md px-5 pb-8 pt-4 lg:hidden animate-[fadein_.25s_ease]"
        >
          <ul className="grid gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block rounded-xl px-4 py-3 text-base transition-colors ${
                    path.startsWith(l.href) ? "bg-gold/15 text-gold font-semibold" : "hover:bg-charcoal text-ivory/80"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3 pt-3 border-t border-ivory/10">
            {user ? (
              <>
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="btn btn-gold flex-1 text-center"
                >
                  {user.role === "admin" ? "Admin" : "Dashboard"}
                </Link>
                <button onClick={logout} className="btn btn-ghost flex-1 text-center">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost flex-1 text-center">
                  Log in
                </Link>
                <Link href="/signup" className="btn btn-gold flex-1 text-center">
                  Sign up
                </Link>
              </>
            )}
            <button
              onClick={toggleMotion}
              className="btn btn-ghost w-full text-center text-xs"
            >
              Motion: {motionOff ? "Off" : "On"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

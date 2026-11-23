"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";

type Hit = {
  kind: string;
  slug: string;
  name: string;
  type: string;
  locality: string | null;
  href: string;
  image?: string | null;
  venue?: string;
  isLive?: boolean;
};

export default function PlanSearch({ popular }: { popular: { slug: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function onChange(val: string) {
    setQ(val);
    setErr("");
    clearTimeout(timer.current);
    if (val.trim().length < 2) {
      setHits([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setHits(data.results);
          setIsOpen(true);
        } else {
          setHits([]);
          setIsOpen(false);
        }
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) return setErr("Type a place or a question first");
    setIsOpen(false);
    router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl" role="search">
      <label htmlFor="home-q" className="sr-only">
        Where in Delhi do you want to go?
      </label>
      
      {/* Search Input Row with Directly Attached Dropdown */}
      <div className="flex flex-col gap-3 sm:flex-row relative" ref={containerRef}>
        <div className="relative flex-1">
          <input
            id="home-q"
            value={q}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              if (hits.length > 0) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsOpen(false);
            }}
            className="input !min-h-14 text-lg w-full pr-10"
            placeholder="Search Bharat Mandapam, IITF 2026, Red Fort, or any place…"
            autoComplete="off"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gold animate-spin text-sm">
              ⏳
            </div>
          )}

          {/* Autocomplete Suggestions Box — Absolutely Anchored Under Search Bar */}
          {isOpen && hits.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-y-auto rounded-2xl border border-gold/40 bg-ink/95 p-2 shadow-2xl shadow-black/80 backdrop-blur-2xl">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold/80 flex items-center justify-between border-b border-ivory/10">
                <span>Matching Places & Events in Delhi</span>
                <span>{hits.length} found</span>
              </div>
              <ul className="mt-1 space-y-1" role="listbox">
                {hits.map((h) => (
                  <li key={h.kind + h.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        setQ(h.name);
                        setIsOpen(false);
                        if (h.href.startsWith("http")) {
                          window.open(h.href, "_blank", "noopener,noreferrer");
                        } else {
                          router.push(h.href);
                        }
                      }}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-gold/15 transition-colors group cursor-pointer"
                    >
                      {h.image && (
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gold/20 bg-charcoal">
                          <SmartImage
                            src={h.image}
                            alt={h.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ivory block truncate group-hover:text-gold text-sm sm:text-base">
                            {h.name}
                          </span>
                          {h.isLive && (
                            <span className="shrink-0 rounded-full bg-red-500/20 px-1.5 py-0.2 text-[9px] font-bold text-red-300 border border-red-500/30">
                              LIVE
                            </span>
                          )}
                        </div>
                        <span className="block text-xs text-ivory/60 truncate">
                          {h.venue ? `📍 ${h.venue}` : h.locality ?? "Delhi NCR"}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium capitalize text-gold/90 shrink-0 bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
                        {h.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button className="btn btn-gold !min-h-14 !px-8 text-base font-bold shrink-0 shadow-lg shadow-gold/20">
          SEARCH
        </button>
      </div>

      {err && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {err}
        </p>
      )}

      <p className="mt-4 text-sm text-ivory/60">
        Popular:{" "}
        {popular.map((p, i) => (
          <button
            type="button"
            key={p.slug}
            onClick={() => router.push(`/destination/${p.slug}`)}
            className="mr-2 underline decoration-gold/50 underline-offset-4 hover:text-gold"
          >
            {p.name}
            {i < popular.length - 1 ? "," : ""}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setQ("Bharat Mandapam");
            router.push(`/explore?q=Bharat%20Mandapam`);
          }}
          className="mr-2 text-gold underline decoration-gold/50 underline-offset-4 hover:brightness-125 font-medium"
        >
          Bharat Mandapam (IECC)
        </button>
        <button
          type="button"
          onClick={() => {
            setQ("IITF 2026");
            router.push(`/explore?q=IITF%202026`);
          }}
          className="text-red-300 underline decoration-red-400/50 underline-offset-4 hover:brightness-125 font-medium"
        >
          IITF 2026 🎪
        </button>
      </p>
    </form>
  );
}

"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import SmartImage from "@/components/SmartImage";

type Hit = {
  kind: string;
  slug: string;
  name: string;
  type: string;
  locality: string | null;
  href: string;
  description: string;
  image?: string | null;
  venue?: string;
  isLive?: boolean;
};

type Answer = {
  mode: string;
  headline: string;
  destination?: { slug: string; name: string; href: string; image?: string | null };
  verified: { text: string }[];
  suggestions: { name: string; href: string; note: string }[];
  sources: { title: string; publisher: string; url: string; checked?: string | null }[];
  note?: string;
};

type SR = {
  new (): {
    lang: string;
    interimResults: boolean;
    onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start: () => void;
  };
};

const EXAMPLES = [
  "Bharat Mandapam",
  "IITF 2026 Trade Fair",
  "Yashobhoomi Dwarka",
  "Why is Humayun's Tomb important?",
  "Best food near Jama Masjid",
  "Quiet garden with old tombs",
  "Tallest minaret in Delhi",
  "Akshardham Temple",
];

export default function ExploreClient({
  initialQ,
  popular,
}: {
  initialQ: string;
  popular: { slug: string; name: string }[];
}) {
  const [q, setQ] = useState(initialQ);
  const [hits, setHits] = useState<Hit[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem("dkk-recent") ?? "[]"));
    } catch {
      /* ignore */
    }
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    setVoiceOk(!!(w.SpeechRecognition || w.webkitSpeechRecognition));

    function handleClickOutside(e: MouseEvent) {
      if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
        setIsSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ask = useCallback(
    async (text: string) => {
      const t = text.trim();
      setErr("");
      setIsSuggestOpen(false);
      if (t.length < 2) return setErr("Type a destination or a question first.");
      setLoading(true);
      setAnswer(null);
      try {
        const [a, s] = await Promise.all([
          fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: t }),
          }).then((r) => r.json()),
          fetch(`/api/search?q=${encodeURIComponent(t)}`).then((r) => r.json()),
        ]);
        if (!a.ok) setErr(a.error ?? "Something went wrong.");
        else setAnswer(a);
        setHits(s.results ?? []);
        const next = [t, ...recent.filter((x) => x !== t)].slice(0, 6);
        setRecent(next);
        localStorage.setItem("dkk-recent", JSON.stringify(next));
      } catch {
        setErr("Network problem — please try again.");
      }
      setLoading(false);
    },
    [recent]
  );

  useEffect(() => {
    if (initialQ) ask(initialQ);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  function onChange(v: string) {
    setQ(v);
    clearTimeout(timer.current);
    if (v.trim().length < 2) {
      setHits([]);
      setIsSuggestOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const j = await fetch(`/api/search?q=${encodeURIComponent(v.trim())}`)
        .then((r) => r.json())
        .catch(() => null);
      if (j?.ok && j.results?.length > 0) {
        setHits(j.results);
        setIsSuggestOpen(true);
      } else {
        setHits([]);
        setIsSuggestOpen(false);
      }
    }, 200);
  }

  function voice() {
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Rec) return;
    const r = new Rec();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setQ(t);
      ask(t);
    };
    r.onerror = () => {
      setErr("Voice input failed or was blocked. Please type instead.");
      setListening(false);
    };
    r.onend = () => setListening(false);
    setListening(true);
    r.start();
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
        role="search"
        className="mx-auto max-w-3xl"
      >
        <label htmlFor="q" className="sr-only">
          Where in Delhi do you want to go?
        </label>
        
        {/* Search Input Row with Directly Attached Dropdown */}
        <div className="flex flex-col gap-3 sm:flex-row relative" ref={inputContainerRef}>
          <div className="relative flex-1">
            <input
              id="q"
              value={q}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => {
                if (hits.length > 0) setIsSuggestOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsSuggestOpen(false);
              }}
              placeholder="Search Bharat Mandapam, IITF 2026, or ask any question…"
              className="input !min-h-14 text-lg w-full pr-10"
              autoComplete="off"
            />

            {/* Suggestions Dropdown — Positioned directly beneath input box */}
            {isSuggestOpen && hits.length > 0 && (
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
                          setIsSuggestOpen(false);
                          ask(h.name);
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

          {voiceOk && (
            <button
              type="button"
              onClick={voice}
              aria-pressed={listening}
              className="btn btn-ghost !min-h-14 shrink-0"
            >
              {listening ? "Listening…" : "🎤 Voice"}
            </button>
          )}
          <button
            className="btn btn-gold !min-h-14 !px-8 text-base font-bold shrink-0 shadow-lg shadow-gold/20"
            disabled={loading}
          >
            {loading ? "Searching…" : "ASK"}
          </button>
        </div>

        {err && (
          <p role="alert" className="mt-2 text-sm text-red-300">
            {err}
          </p>
        )}
      </form>

      {/* Quick Discovery Tags */}
      <div className="mx-auto mt-6 max-w-3xl space-y-4 text-sm">
        {recent.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ivory/50">Recent:</span>
            {recent.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setQ(r);
                  ask(r);
                }}
                className="chip hover:border-gold"
              >
                {r}
              </button>
            ))}
            <button
              type="button"
              className="text-xs text-ivory/40 underline"
              onClick={() => {
                setRecent([]);
                localStorage.removeItem("dkk-recent");
              }}
            >
              clear
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ivory/50">Popular:</span>
          {popular.map((p) => (
            <Link key={p.slug} href={`/destination/${p.slug}`} className="chip hover:border-gold">
              {p.name}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setQ("Bharat Mandapam");
              ask("Bharat Mandapam");
            }}
            className="chip hover:border-gold text-gold font-medium"
          >
            Bharat Mandapam
          </button>
          <button
            type="button"
            onClick={() => {
              setQ("IITF 2026");
              ask("IITF 2026");
            }}
            className="chip hover:border-red-400 text-red-300 font-medium"
          >
            IITF 2026 🎪
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ivory/50">Try:</span>
          {EXAMPLES.map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => {
                setQ(x);
                ask(x);
              }}
              className="chip hover:border-gold"
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="mx-auto mt-10 max-w-3xl space-y-3" aria-label="Loading answer">
          <div className="skeleton h-8 w-2/3" />
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
        </div>
      )}

      {/* Rich Answer Layout */}
      {answer && (
        <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="card !p-6 sm:!p-8" aria-live="polite">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="eyebrow !mb-0">
                {answer.mode === "ai"
                  ? "✨ Verified Delhi Knowledge & Fact Archive"
                  : answer.mode === "no-match"
                  ? "No verified match"
                  : "🏛️ Verified Heritage & Event Archive"}
              </span>
              {answer.destination?.name && (
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold border border-gold/30">
                  Verified Result
                </span>
              )}
            </div>

            {/* If destination has an image, show hero visual */}
            {answer.destination?.image && (
              <div className="mt-4 h-48 sm:h-64 w-full overflow-hidden rounded-2xl border border-ivory/15 bg-charcoal">
                <SmartImage
                  src={answer.destination.image}
                  alt={answer.destination.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <h2 className="mt-4 font-serif text-2xl sm:text-3xl leading-snug text-ivory">
              {answer.headline}
            </h2>

            {answer.destination && (
              <div className="mt-5 flex flex-wrap gap-3">
                {answer.destination.href.startsWith("http") ? (
                  <a
                    href={answer.destination.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold inline-flex items-center gap-2"
                  >
                    <span>Official Guide / Source ↗</span>
                  </a>
                ) : (
                  <Link href={answer.destination.href} className="btn btn-gold">
                    Open full {answer.destination.name} guide →
                  </Link>
                )}
              </div>
            )}

            {answer.verified.length > 0 && (
              <div className="mt-6 border-t border-ivory/10 pt-5">
                <span className="tag-verified">Verified Sourced Facts</span>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-ivory/85 text-sm sm:text-base leading-relaxed">
                  {answer.verified.map((v, i) => (
                    <li key={i}>{v.text}</li>
                  ))}
                </ul>
              </div>
            )}

            {answer.sources.length > 0 && (
              <div className="mt-6 border-t border-ivory/10 pt-4 text-xs text-ivory/60 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ivory/80">Sources:</span>
                {answer.sources.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold underline hover:brightness-125 mr-2"
                  >
                    {s.publisher} ↗
                  </a>
                ))}
              </div>
            )}

            {answer.note && (
              <p className="mt-5 rounded-xl bg-gold/10 border border-gold/20 p-3.5 text-xs text-gold/90 leading-relaxed">
                ℹ️ {answer.note}
              </p>
            )}
          </section>

          {/* Side Column: Nearby Landmarks & Related Search Hits */}
          <section className="space-y-4">
            {answer.suggestions.length > 0 && (
              <div className="card !p-5">
                <span className="tag-verified !bg-gold/15 !text-gold !border-gold/30">
                  Nearby Landmarks & Connections
                </span>
                <ul className="mt-3 space-y-3">
                  {answer.suggestions.map((s) => (
                    <li key={s.name} className="border-b border-ivory/10 pb-2.5 last:border-b-0 last:pb-0">
                      {s.href.startsWith("http") ? (
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-serif text-lg text-ivory hover:text-gold block"
                        >
                          {s.name} ↗
                        </a>
                      ) : (
                        <Link href={s.href} className="font-serif text-lg text-ivory hover:text-gold block">
                          {s.name}
                        </Link>
                      )}
                      <p className="text-xs text-ivory/55 mt-0.5">{s.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hits.length > 0 && (
              <div className="card !p-5">
                <p className="eyebrow !mb-2">Other Related Places in Delhi</p>
                <ul className="space-y-3 text-sm">
                  {hits.slice(0, 5).map((h) => (
                    <li key={h.kind + h.slug} className="flex items-center gap-3">
                      {h.image && (
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-ivory/10 bg-charcoal">
                          <SmartImage src={h.image} alt={h.name} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {h.href.startsWith("http") ? (
                          <a
                            href={h.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-ivory hover:text-gold block truncate"
                          >
                            {h.name} ↗
                          </a>
                        ) : (
                          <Link href={h.href} className="font-medium text-ivory hover:text-gold block truncate">
                            {h.name}
                          </Link>
                        )}
                        <span className="text-xs text-ivory/50 capitalize block truncate">
                          {h.type}
                          {h.venue ? ` · ${h.venue}` : h.locality ? ` · ${h.locality}` : ""}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

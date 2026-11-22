"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Hit = { kind: string; slug: string; name: string; type: string; locality: string | null; href: string; description: string };
type Answer = {
  mode: string; headline: string; destination?: { slug: string; name: string; href: string };
  verified: { text: string }[]; suggestions: { name: string; href: string; note: string }[];
  sources: { title: string; publisher: string; url: string; checked?: string | null }[]; note?: string;
};
type SR = { new (): { lang: string; interimResults: boolean; onresult: ((e: { results: { 0: { 0: { transcript: string } } } }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void } };

const EXAMPLES = ["Why is Humayun's Tomb important?", "Best food near Jama Masjid", "Quiet garden with old tombs", "Tallest minaret in Delhi", "Hidden stepwell near Connaught Place"];

export default function ExploreClient({ initialQ, popular }: { initialQ: string; popular: { slug: string; name: string }[] }) {
  const [q, setQ] = useState(initialQ);
  const [hits, setHits] = useState<Hit[]>([]);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem("dkk-recent") ?? "[]")); } catch { /* ignore */ }
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    setVoiceOk(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const ask = useCallback(async (text: string) => {
    const t = text.trim();
    setErr("");
    if (t.length < 2) return setErr("Type a destination or a question first.");
    setLoading(true); setAnswer(null);
    try {
      const [a, s] = await Promise.all([
        fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: t }) }).then((r) => r.json()),
        fetch(`/api/search?q=${encodeURIComponent(t)}`).then((r) => r.json()),
      ]);
      if (!a.ok) setErr(a.error ?? "Something went wrong."); else setAnswer(a);
      setHits(s.results ?? []);
      const next = [t, ...recent.filter((x) => x !== t)].slice(0, 6);
      setRecent(next); localStorage.setItem("dkk-recent", JSON.stringify(next));
    } catch { setErr("Network problem — please try again."); }
    setLoading(false);
  }, [recent]);

  useEffect(() => { if (initialQ) ask(initialQ); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function onChange(v: string) {
    setQ(v);
    clearTimeout(timer.current);
    if (v.trim().length < 2) return setHits([]);
    timer.current = setTimeout(async () => {
      const j = await fetch(`/api/search?q=${encodeURIComponent(v)}`).then((r) => r.json()).catch(() => null);
      if (j?.ok) setHits(j.results);
    }, 250);
  }

  function voice() {
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Rec) return;
    const r = new Rec();
    r.lang = "en-IN"; r.interimResults = false;
    r.onresult = (e) => { const t = e.results[0][0].transcript; setQ(t); ask(t); };
    r.onerror = () => { setErr("Voice input failed or was blocked. Please type instead."); setListening(false); };
    r.onend = () => setListening(false);
    setListening(true); r.start();
  }

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} role="search" className="mx-auto max-w-3xl">
        <label htmlFor="q" className="sr-only">Where in Delhi do you want to go?</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input id="q" value={q} onChange={(e) => onChange(e.target.value)} placeholder="Where in Delhi do you want to go?" className="input !min-h-14 text-lg" autoComplete="off" />
          {voiceOk && <button type="button" onClick={voice} aria-pressed={listening} className="btn btn-ghost !min-h-14">{listening ? "Listening…" : "🎤 Voice"}</button>}
          <button className="btn btn-gold !min-h-14 !px-8" disabled={loading}>{loading ? "Searching…" : "ASK"}</button>
        </div>
        {err && <p role="alert" className="mt-2 text-sm text-red-300">{err}</p>}
        {hits.length > 0 && !answer && !loading && (
          <ul className="card mt-2 !p-2" aria-label="Suggestions">
            {hits.slice(0, 5).map((h) => <li key={h.kind + h.slug}><Link href={h.href} className="flex justify-between rounded-lg px-3 py-2 hover:bg-ink"><span>{h.name}</span><span className="text-xs capitalize text-ivory/50">{h.type}</span></Link></li>)}
          </ul>
        )}
      </form>

      <div className="mx-auto mt-6 max-w-3xl space-y-4 text-sm">
        {recent.length > 0 && <div className="flex flex-wrap items-center gap-2"><span className="text-ivory/50">Recent:</span>{recent.map((r) => <button key={r} type="button" onClick={() => { setQ(r); ask(r); }} className="chip hover:border-gold">{r}</button>)}<button type="button" className="text-xs text-ivory/40 underline" onClick={() => { setRecent([]); localStorage.removeItem("dkk-recent"); }}>clear</button></div>}
        <div className="flex flex-wrap items-center gap-2"><span className="text-ivory/50">Popular:</span>{popular.map((p) => <Link key={p.slug} href={`/destination/${p.slug}`} className="chip hover:border-gold">{p.name}</Link>)}</div>
        <div className="flex flex-wrap items-center gap-2"><span className="text-ivory/50">Try:</span>{EXAMPLES.map((x) => <button key={x} type="button" onClick={() => { setQ(x); ask(x); }} className="chip hover:border-gold">{x}</button>)}</div>
      </div>

      {loading && <div className="mx-auto mt-10 max-w-3xl space-y-3" aria-label="Loading answer"><div className="skeleton h-8 w-2/3" /><div className="skeleton h-24" /><div className="skeleton h-24" /></div>}

      {answer && (
        <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="card" aria-live="polite">
            <p className="eyebrow">{answer.mode === "ai" ? "AI-written from sourced facts" : answer.mode === "no-match" ? "No verified match" : "From sourced database"}</p>
            <h2 className="mt-2 font-serif text-3xl leading-snug">{answer.headline}</h2>
            {answer.destination && <Link href={answer.destination.href} className="btn btn-gold mt-5">Open full {answer.destination.name} guide</Link>}
            {answer.verified.length > 0 && (
              <div className="mt-6"><span className="tag-verified">Sourced facts</span>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-ivory/80">{answer.verified.map((v) => <li key={v.text}>{v.text}</li>)}</ul></div>
            )}
            {answer.sources.length > 0 && <div className="mt-5 text-xs text-ivory/60">Sources: {answer.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="mr-3 text-gold underline">{s.publisher} ↗</a>)}</div>}
            {answer.note && <p className="mt-4 rounded-lg bg-gold/10 p-3 text-xs text-gold">{answer.note}</p>}
          </section>
          <section className="space-y-4">
            {answer.suggestions.length > 0 && (
              <div className="card"><span className="tag-unverified">Suggestions (generated by proximity)</span>
                <ul className="mt-3 space-y-3">{answer.suggestions.map((s) => <li key={s.name}><Link href={s.href} className="font-serif text-xl hover:text-gold">{s.name}</Link><p className="text-xs text-ivory/55">{s.note}</p></li>)}</ul></div>
            )}
            {hits.length > 0 && (
              <div className="card"><p className="eyebrow">Related places</p>
                <ul className="mt-3 space-y-2 text-sm">{hits.map((h) => <li key={h.kind + h.slug}><Link href={h.href} className="hover:text-gold">{h.name}</Link> <span className="text-ivory/50 capitalize">· {h.type}</span></li>)}</ul></div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

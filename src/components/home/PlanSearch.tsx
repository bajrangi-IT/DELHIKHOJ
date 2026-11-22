"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PlanSearch({ popular }: { popular: { slug: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) return setErr("Type a place or a question first");
    router.push(`/explore?q=${encodeURIComponent(q.trim())}`);
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl" role="search">
      <label htmlFor="home-q" className="sr-only">Where in Delhi do you want to go?</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input id="home-q" value={q} onChange={(e) => { setQ(e.target.value); setErr(""); }} className="input !min-h-14 text-lg" placeholder="Where in Delhi do you want to go?" />
        <button className="btn btn-gold !min-h-14 !px-8">SEARCH</button>
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-red-300">{err}</p>}
      <p className="mt-4 text-sm text-ivory/60">Popular: {popular.map((p, i) => (
        <button type="button" key={p.slug} onClick={() => router.push(`/destination/${p.slug}`)} className="mr-2 underline decoration-gold/50 underline-offset-4 hover:text-gold">{p.name}{i < popular.length - 1 ? "," : ""}</button>
      ))}</p>
    </form>
  );
}

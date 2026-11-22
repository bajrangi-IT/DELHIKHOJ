"use client";
import { useState } from "react";

export default function ShareButton({ title, text, path }: { title: string; text?: string; path?: string }) {
  const [msg, setMsg] = useState("");
  async function share() {
    const url = path ? new URL(path, location.origin).toString() : location.href;
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else { await navigator.clipboard.writeText(url); setMsg("Link copied"); }
    } catch {
      try { await navigator.clipboard.writeText(url); setMsg("Link copied"); } catch { setMsg("Copy the address bar link to share"); }
    }
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={share} className="btn btn-ghost"><span aria-hidden>↗</span> Share</button>
      <span role="status" className="text-xs text-ivory/60">{msg}</span>
    </span>
  );
}

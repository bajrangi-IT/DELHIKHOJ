"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SaveButton({ kind, refId, initial, compact = false }: { kind: "destination" | "market" | "event" | "product"; refId: string; initial?: boolean; compact?: boolean }) {
  const [saved, setSaved] = useState(initial ?? false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (initial !== undefined) return;
    fetch("/api/saved").then((r) => r.json()).then((j) => setSaved((j.items ?? []).includes(`${kind}:${refId}`))).catch(() => {});
  }, [initial, kind, refId]);

  async function toggle() {
    setBusy(true);
    setMsg("");
    const r = await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, refId }) });
    setBusy(false);
    if (r.status === 401) return router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
    const j = await r.json();
    if (j.ok) { setSaved(j.saved); setMsg(j.saved ? "Saved to your account" : "Removed"); router.refresh(); } else setMsg(j.error ?? "Could not save");
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={toggle} disabled={busy} aria-pressed={saved} className={`btn ${saved ? "btn-gold" : "btn-ghost"} ${compact ? "!px-4" : ""}`}>
        <span aria-hidden>{saved ? "♥" : "♡"}</span> {saved ? "Saved" : "Save"}
      </button>
      <span role="status" className="text-xs text-ivory/60">{msg}</span>
    </span>
  );
}

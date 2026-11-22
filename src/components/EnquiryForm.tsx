"use client";
import { useState } from "react";

/** Generic validated form posting JSON. mode=enquiry → seller/product enquiry; mode=contact → site contact. */
export default function EnquiryForm({ mode, sellerId, productId, defaultName = "", defaultEmail = "" }: { mode: "enquiry" | "contact"; sellerId?: string; productId?: string; defaultName?: string; defaultEmail?: string }) {
  const [s, setS] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setS(null);
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const body = mode === "enquiry" ? { sellerId, productId, name: f.name, email: f.email, message: f.message } : f;
    const r = await fetch(mode === "enquiry" ? "/api/enquiries" : "/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json(); setBusy(false);
    if (j.ok) { setS({ t: "ok", m: j.message }); (e.target as HTMLFormElement).reset(); } else setS({ t: "err", m: j.error });
  }
  return (
    <form onSubmit={submit} className="card space-y-4">
      <h2 className="font-serif text-2xl">{mode === "enquiry" ? "Send an enquiry" : "Write to us"}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label" htmlFor={`${mode}-name`}>Name</label><input id={`${mode}-name`} name="name" required minLength={2} defaultValue={defaultName} className="input" /></div>
        <div><label className="label" htmlFor={`${mode}-email`}>Email</label><input id={`${mode}-email`} type="email" name="email" required defaultValue={defaultEmail} className="input" /></div>
      </div>
      {mode === "contact" && <div><label className="label" htmlFor="c-sub">Subject</label><input id="c-sub" name="subject" required minLength={3} className="input" /></div>}
      <div><label className="label" htmlFor={`${mode}-msg`}>Message</label><textarea id={`${mode}-msg`} name="message" required minLength={10} rows={4} className="input" /></div>
      <button className="btn btn-gold" disabled={busy}>{busy ? "Sending…" : "Send"}</button>
      {s && <p role={s.t === "err" ? "alert" : "status"} className={`rounded-xl p-3 text-sm ${s.t === "err" ? "bg-maroon/50" : "bg-emerald/25"}`}>{s.m}</p>}
    </form>
  );
}

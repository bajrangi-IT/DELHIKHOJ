"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type St = { t: "ok" | "err"; m: string } | null;
const INTERESTS = ["history", "food", "markets", "architecture", "photography", "family", "culture", "nature"];
const Msg = ({ s }: { s: St }) => s ? <p role={s.t === "err" ? "alert" : "status"} className={`rounded-xl p-3 text-sm ${s.t === "err" ? "bg-maroon/50 text-red-100" : "bg-emerald/25 text-emerald-100"}`}>{s.m}</p> : null;

export function ActionButton({ url, method = "POST", body, label, confirmText, variant = "ghost", onDoneRedirect }: { url: string; method?: string; body?: unknown; label: string; confirmText?: string; variant?: "ghost" | "danger" | "gold"; onDoneRedirect?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function run() {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(true); setErr("");
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({ ok: false, error: "Unexpected response" }));
    setBusy(false);
    if (j.ok) { if (onDoneRedirect) router.push(onDoneRedirect); router.refresh(); } else setErr(j.error ?? "Failed");
  }
  return <span className="inline-flex flex-col"><button onClick={run} disabled={busy} className={`btn btn-${variant} !min-h-9 !px-4`}>{busy ? "…" : label}</button>{err && <span role="alert" className="mt-1 text-xs text-red-300">{err}</span>}</span>;
}

export function ProfileForm({ user }: { user: { fullName: string; phone: string | null; language: string; interests: string[]; email: string } }) {
  const router = useRouter();
  const [sel, setSel] = useState(user.interests);
  const [s, setS] = useState<St>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setS(null);
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: f.get("fullName"), phone: f.get("phone") ?? "", language: f.get("language"), interests: sel }) });
    const j = await r.json(); setBusy(false);
    if (j.ok) { setS({ t: "ok", m: "Profile saved." }); router.refresh(); } else setS({ t: "err", m: j.error });
  }
  return (
    <form onSubmit={submit} className="card max-w-xl space-y-4">
      <div><label className="label" htmlFor="pf-email">Email</label><input id="pf-email" className="input opacity-60" value={user.email} disabled readOnly /></div>
      <div><label className="label" htmlFor="pf-name">Full name</label><input id="pf-name" name="fullName" defaultValue={user.fullName} required minLength={2} className="input" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="pf-phone">Phone</label><input id="pf-phone" name="phone" defaultValue={user.phone ?? ""} className="input" /></div>
        <div><label className="label" htmlFor="pf-lang">Language</label><select id="pf-lang" name="language" defaultValue={user.language} className="input"><option value="en">English</option><option value="hi">हिन्दी</option></select></div>
      </div>
      <fieldset><legend className="label">Interests</legend><div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <button type="button" key={i} aria-pressed={sel.includes(i)} onClick={() => setSel(sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i])} className={`chip min-h-9 px-4 capitalize ${sel.includes(i) ? "chip-on" : ""}`}>{i}</button>)}</div></fieldset>
      <button className="btn btn-gold" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
      <Msg s={s} />
    </form>
  );
}

export function PasswordForm() {
  const [s, setS] = useState<St>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setS(null);
    const f = new FormData(e.currentTarget);
    if (f.get("newPassword") !== f.get("confirm")) return setS({ t: "err", m: "New passwords do not match" });
    setBusy(true);
    const r = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: f.get("currentPassword"), newPassword: f.get("newPassword") }) });
    const j = await r.json(); setBusy(false);
    if (j.ok) { setS({ t: "ok", m: "Password changed." }); (e.target as HTMLFormElement).reset(); } else setS({ t: "err", m: j.error });
  }
  return (
    <form onSubmit={submit} className="card max-w-xl space-y-4">
      <h2 className="font-serif text-2xl">Change password</h2>
      <div><label className="label" htmlFor="pw-cur">Current password</label><input id="pw-cur" name="currentPassword" type="password" required autoComplete="current-password" className="input" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="pw-new">New password</label><input id="pw-new" name="newPassword" type="password" required minLength={8} autoComplete="new-password" className="input" /></div>
        <div><label className="label" htmlFor="pw-conf">Confirm</label><input id="pw-conf" name="confirm" type="password" required autoComplete="new-password" className="input" /></div>
      </div>
      <button className="btn btn-gold" disabled={busy}>{busy ? "Saving…" : "Update password"}</button>
      <Msg s={s} />
    </form>
  );
}

export function LanguageForm({ language }: { language: string }) {
  const router = useRouter();
  const [s, setS] = useState<St>(null);
  async function change(v: string) {
    const r = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language: v }) });
    const j = await r.json();
    setS(j.ok ? { t: "ok", m: "Language preference saved." } : { t: "err", m: j.error }); router.refresh();
  }
  return (
    <div className="card max-w-xl space-y-3"><h2 className="font-serif text-2xl">Language</h2>
      <label className="label" htmlFor="lang-sel">Preferred language</label>
      <select id="lang-sel" defaultValue={language} onChange={(e) => change(e.target.value)} className="input"><option value="en">English</option><option value="hi">हिन्दी (Hindi)</option></select>
      <p className="text-xs text-ivory/50">Hindi content is currently available for destination names only; full translation is on the roadmap.</p><Msg s={s} /></div>
  );
}

const csv = (v: FormDataEntryValue | null) => String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);

export function BecomeForm({ type }: { type: "guide" | "seller" }) {
  const [s, setS] = useState<St>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setS(null);
    const f = new FormData(e.currentTarget);
    const body = type === "guide"
      ? { type, name: f.get("name"), bio: f.get("bio"), languages: csv(f.get("languages")), specialities: csv(f.get("specialities")), areas: csv(f.get("areas")), tourTypes: csv(f.get("tourTypes")), experienceYears: Number(f.get("experienceYears")), priceNote: f.get("priceNote") || "Contact for price", availability: f.get("availability") || "Send a request with your preferred date" }
      : { type, businessName: f.get("businessName"), locality: f.get("locality"), description: f.get("description"), contactPhone: f.get("contactPhone") || undefined };
    const r = await fetch("/api/become", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json(); setBusy(false);
    if (j.ok) { setS({ t: "ok", m: j.message }); router.refresh(); } else setS({ t: "err", m: j.error });
  }
  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-4">
      {type === "guide" ? (<>
        <div><label className="label" htmlFor="b-name">Public name</label><input id="b-name" name="name" required minLength={2} className="input" /></div>
        <div><label className="label" htmlFor="b-bio">About you</label><textarea id="b-bio" name="bio" required minLength={40} rows={4} className="input" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="b-lang">Languages (comma separated)</label><input id="b-lang" name="languages" required placeholder="English, Hindi" className="input" /></div>
          <div><label className="label" htmlFor="b-spec">Specialities</label><input id="b-spec" name="specialities" required placeholder="Mughal history, Food walks" className="input" /></div>
          <div><label className="label" htmlFor="b-areas">Areas you cover</label><input id="b-areas" name="areas" required placeholder="Old Delhi, Mehrauli" className="input" /></div>
          <div><label className="label" htmlFor="b-types">Tour types</label><input id="b-types" name="tourTypes" required placeholder="Walking tour, Half-day" className="input" /></div>
          <div><label className="label" htmlFor="b-exp">Years of experience</label><input id="b-exp" name="experienceYears" type="number" min={0} max={60} defaultValue={1} className="input" /></div>
          <div><label className="label" htmlFor="b-price">Price note</label><input id="b-price" name="priceNote" placeholder="Contact for price" className="input" /></div>
        </div>
        <div><label className="label" htmlFor="b-av">Availability</label><input id="b-av" name="availability" placeholder="Weekends and mornings" className="input" /></div>
      </>) : (<>
        <div><label className="label" htmlFor="b-bn">Business name</label><input id="b-bn" name="businessName" required minLength={2} className="input" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="b-loc">Locality</label><input id="b-loc" name="locality" required className="input" /></div>
          <div><label className="label" htmlFor="b-ph">Phone (optional)</label><input id="b-ph" name="contactPhone" className="input" /></div>
        </div>
        <div><label className="label" htmlFor="b-desc">Describe your business</label><textarea id="b-desc" name="description" required minLength={40} rows={4} className="input" /></div>
      </>)}
      <button className="btn btn-gold" disabled={busy}>{busy ? "Submitting…" : "Submit for review"}</button>
      <Msg s={s} />
    </form>
  );
}

export function ProductForm() {
  const router = useRouter();
  const [s, setS] = useState<St>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setS(null);
    const f = new FormData(e.currentTarget);
    const price = String(f.get("priceInr") ?? "").trim();
    const r = await fetch("/api/seller/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.get("name"), description: f.get("description"), category: f.get("category"), availability: f.get("availability"), priceInr: price ? Number(price) : null }) });
    const j = await r.json(); setBusy(false);
    if (j.ok) { setS({ t: "ok", m: "Product added." }); (e.target as HTMLFormElement).reset(); router.refresh(); } else setS({ t: "err", m: j.error });
  }
  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-4">
      <h2 className="font-serif text-2xl">Add a product</h2>
      <div><label className="label" htmlFor="pr-name">Name</label><input id="pr-name" name="name" required minLength={2} className="input" /></div>
      <div><label className="label" htmlFor="pr-desc">Description</label><textarea id="pr-desc" name="description" required minLength={10} rows={3} className="input" /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label" htmlFor="pr-cat">Category</label><select id="pr-cat" name="category" className="input">{["handicraft", "textiles", "jewellery", "souvenir", "art", "food"].map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label" htmlFor="pr-av">Availability</label><select id="pr-av" name="availability" className="input"><option value="available">Available</option><option value="made-to-order">Made to order</option><option value="out-of-stock">Out of stock</option></select></div>
        <div><label className="label" htmlFor="pr-price">Price ₹ (optional)</label><input id="pr-price" name="priceInr" type="number" min={1} className="input" /></div>
      </div>
      <button className="btn btn-gold" disabled={busy}>{busy ? "Adding…" : "Add product"}</button><Msg s={s} />
    </form>
  );
}

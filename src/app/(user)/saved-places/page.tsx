import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { events, markets, products, savedItems } from "@/db/schema";
import { ActionButton } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";
import { destinationsBySlugs } from "@/lib/queries";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Saved places" };

export default async function Saved() {
  const user = await requireUser("/saved-places");
  const rows = await db.select().from(savedItems).where(eq(savedItems.userId, user.id)).orderBy(desc(savedItems.createdAt));
  const ids = (k: string) => rows.filter((r) => r.kind === k).map((r) => r.refId);
  const uuid = (a: string[]) => a.filter((x) => /^[0-9a-f-]{36}$/i.test(x));
  const [ds, ms, evs, ps] = await Promise.all([
    destinationsBySlugs(ids("destination")),
    ids("market").length ? db.select().from(markets).where(inArray(markets.slug, ids("market"))) : [],
    uuid(ids("event")).length ? db.select().from(events).where(inArray(events.id, uuid(ids("event")))) : [],
    uuid(ids("product")).length ? db.select().from(products).where(inArray(products.id, uuid(ids("product")))) : [],
  ]);
  const Row = ({ href, title, sub, kind, refId }: { href: string; title: string; sub?: string; kind: string; refId: string }) => (
    <li className="card !p-4 flex flex-wrap items-center justify-between gap-3"><div><Link href={href} className="font-serif text-xl hover:text-gold">{title}</Link>{sub && <p className="text-xs text-ivory/50">{sub}</p>}</div><ActionButton url="/api/saved" body={{ kind, refId }} label="Remove" variant="danger" /></li>
  );
  const empty = !ds.length && !ms.length && !evs.length && !ps.length;
  return (
    <div className="space-y-8"><h1 className="h-section">Saved places</h1>
      {empty && <p className="card">Nothing saved yet. Explore <Link href="/destinations" className="text-gold underline">destinations</Link>, <Link href="/markets" className="text-gold underline">markets</Link> or <Link href="/events" className="text-gold underline">events</Link>.</p>}
      {ds.length > 0 && <section><h2 className="font-serif text-2xl text-gold">Destinations</h2><ul className="mt-3 space-y-2">{ds.map((d) => <Row key={d.slug} href={`/destination/${d.slug}`} title={d.name} sub={d.locality ?? ""} kind="destination" refId={d.slug} />)}</ul></section>}
      {ms.length > 0 && <section><h2 className="font-serif text-2xl text-gold">Markets</h2><ul className="mt-3 space-y-2">{ms.map((m) => <Row key={m.slug} href={`/market/${m.slug}`} title={m.name} sub={m.locality} kind="market" refId={m.slug} />)}</ul></section>}
      {evs.length > 0 && <section><h2 className="font-serif text-2xl text-gold">Events</h2><ul className="mt-3 space-y-2">{evs.map((e) => <Row key={e.id} href="/events" title={e.title} sub={fmtDate(e.startsAt)} kind="event" refId={e.id} />)}</ul></section>}
      {ps.length > 0 && <section><h2 className="font-serif text-2xl text-gold">Products</h2><ul className="mt-3 space-y-2">{ps.map((p) => <Row key={p.id} href={`/product/${p.id}`} title={p.name} kind="product" refId={p.id} />)}</ul></section>}
    </div>
  );
}

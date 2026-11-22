import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, destinations, enquiries, events, guideRequests, guides, itineraries, orders, products, sellers, ticketBookings, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const n = async (t: Parameters<typeof db.select>[0] extends never ? never : unknown, q: Promise<{ c: number }[]>) => { void t; return (await q)[0]?.c ?? 0; };

export default async function AdminHome() {
  await requireAdmin();
  const c = sql<number>`count(*)::int`;
  const [u, d, e, g, gp, s, sp, p, gr, tb, ord, it, en, cm] = await Promise.all([
    n(0, db.select({ c }).from(users)),
    n(0, db.select({ c }).from(destinations)),
    n(0, db.select({ c }).from(events)),
    n(0, db.select({ c }).from(guides)),
    n(0, db.select({ c }).from(guides).where(eq(guides.status, "pending"))),
    n(0, db.select({ c }).from(sellers)),
    n(0, db.select({ c }).from(sellers).where(eq(sellers.status, "pending"))),
    n(0, db.select({ c }).from(products)),
    n(0, db.select({ c }).from(guideRequests)),
    n(0, db.select({ c }).from(ticketBookings)),
    n(0, db.select({ c }).from(orders)),
    n(0, db.select({ c }).from(itineraries)),
    n(0, db.select({ c }).from(enquiries)),
    n(0, db.select({ c }).from(contactMessages)),
  ]);

  const stats: [string, number, string?][] = [
    ["Users", u, "/admin/users"],
    ["Destinations", d, "/admin/destinations"],
    ["Ticket Passes", tb],
    ["Artisan Orders", ord],
    ["Guide Tours", gr],
    ["Guides", g, "/admin/guides"],
    ["Guides pending", gp, "/admin/guides"],
    ["Sellers", s, "/admin/sellers"],
    ["Sellers pending", sp, "/admin/sellers"],
    ["Products", p, "/admin/products"],
    ["Events", e, "/admin/events"],
    ["Itineraries", it],
    ["Enquiries", en, "/admin/content"],
    ["Contact messages", cm, "/admin/content"],
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <span className="tag-verified">Platform Management</span>
          <h1 className="h-section mt-1">Platform overview</h1>
        </div>
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([l, v, h]) => (
          <li key={l} className="card">
            <p className="font-serif text-5xl text-gold">{v}</p>
            {h ? (
              <Link href={h} className="text-xs uppercase tracking-widest text-ivory/70 hover:text-gold">
                {l} →
              </Link>
            ) : (
              <p className="text-xs uppercase tracking-widest text-ivory/70">{l}</p>
            )}
          </li>
        ))}
      </ul>
      {(gp > 0 || sp > 0) && (
        <p className="card mt-6 border-gold/40">
          Awaiting review: {gp} guide profile(s), {sp} seller profile(s).
        </p>
      )}
    </div>
  );
}

import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  contactMessages,
  destinations,
  enquiries,
  events,
  guideRequests,
  guides,
  itineraries,
  orders,
  products,
  sellers,
  ticketBookings,
  users,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const n = async (t: Parameters<typeof db.select>[0] extends never ? never : unknown, q: Promise<{ c: number }[]>) => {
  void t;
  return (await q)[0]?.c ?? 0;
};

export default async function AdminHome() {
  await requireAdmin();
  const c = sql<number>`count(*)::int`;

  const [
    u,
    d,
    e,
    g,
    gp,
    s,
    sp,
    p,
    gr,
    tb,
    ord,
    it,
    en,
    cm,
    artisanFinancials,
    ticketFinancials,
    guideFinancials,
  ] = await Promise.all([
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

    // Financial aggregates for platform revenue & monetization
    db
      .select({
        totalAmount: sql<number>`COALESCE(sum(${orders.totalPriceInr}), 0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(orders),

    db
      .select({
        totalAmount: sql<number>`COALESCE(sum(${ticketBookings.totalPriceInr}), 0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(ticketBookings),

    db
      .select({
        acceptedCount: sql<number>`count(*)::int`,
      })
      .from(guideRequests)
      .where(eq(guideRequests.status, "accepted")),
  ]);

  // Business Model Commission Calculations
  const artisanGMV = artisanFinancials[0]?.totalAmount ?? 0;
  const artisanCommission = Math.round(artisanGMV * 0.10); // 10% platform fee on crafts
  const artisanNetPayout = artisanGMV - artisanCommission;

  const ticketGMV = ticketFinancials[0]?.totalAmount ?? 0;
  const ticketCount = ticketFinancials[0]?.count ?? 0;
  const ticketCommission = ticketCount * 30; // ₹30 fast-track convenience fee per pass

  const guideAccepted = guideFinancials[0]?.acceptedCount ?? 0;
  const guideGMV = guideAccepted * 2400; // Average tour gross
  const guideCommission = Math.round(guideGMV * 0.10); // 10% platform facilitation fee

  const totalPlatformGMV = artisanGMV + ticketGMV + guideGMV;
  const totalPlatformCommission = artisanCommission + ticketCommission + guideCommission;

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
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
        <div>
          <span className="tag-verified">Platform Management & Economics</span>
          <h1 className="h-section mt-1">Platform Overview & Revenue Engine</h1>
        </div>
      </div>

      {/* Startup Monetization & Platform Commission Engine */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ivory">💰 Platform Monetization & Commissions</h2>
            <p className="text-xs text-ivory/60">
              Real-time revenue captured from artisan marketplace (10%), digital ticket passes (₹30/pass), and local guide tours (10%).
            </p>
          </div>
          <span className="rounded-full bg-gold/20 px-3 py-1 font-mono text-xs font-bold text-gold">
            Live Commission Sync
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card border-ivory/15 bg-charcoal/80">
            <span className="text-xs uppercase tracking-wider text-ivory/50">Total Gross Merchandise (GMV)</span>
            <p className="font-serif text-3xl font-bold text-ivory mt-1">
              ₹{totalPlatformGMV.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-ivory/60 mt-1">
              Across craft orders, passes & tours
            </p>
          </div>

          <div className="card border-gold/40 bg-gold/10">
            <span className="text-xs uppercase tracking-wider text-gold font-semibold">Total Platform Commission</span>
            <p className="font-serif text-3xl font-bold text-gold mt-1">
              ₹{totalPlatformCommission.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-gold/80 mt-1">
              Net startup revenue retained
            </p>
          </div>

          <div className="card border-emerald-500/40 bg-emerald-500/10">
            <span className="text-xs uppercase tracking-wider text-emerald-300">Artisan Disbursed Payout</span>
            <p className="font-serif text-3xl font-bold text-emerald-300 mt-1">
              ₹{artisanNetPayout.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-emerald-200/70 mt-1">
              90% net sales paid to Delhi craftsmen
            </p>
          </div>

          <div className="card border-blue-500/40 bg-blue-500/10">
            <span className="text-xs uppercase tracking-wider text-blue-300">Pass Convenience Fees</span>
            <p className="font-serif text-3xl font-bold text-blue-300 mt-1">
              ₹{ticketCommission.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-blue-200/70 mt-1">
              From {ticketCount} digital fast-track passes
            </p>
          </div>
        </div>

        {/* Revenue Breakdown by Stream */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-4 border-ivory/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ivory">🏺 Artisan Crafts Marketplace</span>
              <span className="chip text-[10px] text-gold border-gold/30">10% Take Rate</span>
            </div>
            <p className="text-xs text-ivory/70">
              Orders GMV: <strong className="text-ivory">₹{artisanGMV.toLocaleString("en-IN")}</strong>
            </p>
            <p className="text-xs text-gold">
              Platform Commission: <strong>₹{artisanCommission.toLocaleString("en-IN")}</strong>
            </p>
          </div>

          <div className="card p-4 border-ivory/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ivory">🎟️ Digital Monument Passes</span>
              <span className="chip text-[10px] text-blue-300 border-blue-500/30">₹30 / Pass</span>
            </div>
            <p className="text-xs text-ivory/70">
              Tickets Issued: <strong className="text-ivory">{ticketCount}</strong>
            </p>
            <p className="text-xs text-blue-300">
              Convenience Revenue: <strong>₹{ticketCommission.toLocaleString("en-IN")}</strong>
            </p>
          </div>

          <div className="card p-4 border-ivory/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ivory">🧭 Heritage Guide Facilitation</span>
              <span className="chip text-[10px] text-emerald-300 border-emerald-500/30">10% Tour Fee</span>
            </div>
            <p className="text-xs text-ivory/70">
              Confirmed Tours: <strong className="text-ivory">{guideAccepted}</strong>
            </p>
            <p className="text-xs text-emerald-300">
              Tour Commission: <strong>₹{guideCommission.toLocaleString("en-IN")}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Operational Stats Grid */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-ivory">Platform Catalog & Entities</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </section>

      {(gp > 0 || sp > 0) && (
        <div className="card border-gold/40 bg-gold/5 p-4 flex items-center justify-between">
          <p className="text-sm text-ivory">
            ⚠️ Awaiting review: <strong>{gp}</strong> guide profile(s), <strong>{sp}</strong> seller profile(s).
          </p>
          <div className="flex gap-2">
            {gp > 0 && (
              <Link href="/admin/guides" className="btn btn-gold !min-h-8 text-xs">
                Review Guides
              </Link>
            )}
            {sp > 0 && (
              <Link href="/admin/sellers" className="btn btn-gold !min-h-8 text-xs">
                Review Sellers
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

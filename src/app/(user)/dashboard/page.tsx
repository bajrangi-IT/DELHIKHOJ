import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  guideRequests,
  guides,
  itineraries,
  orders,
  products,
  savedItems,
  sellers,
  ticketBookings,
  userActivity,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { destinationsBySlugs } from "@/lib/queries";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Traveller Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser("/dashboard");

  // Strict role isolation: redirect sellers & guides to their dedicated portals
  if (user.role === "seller") {
    redirect("/seller-dashboard");
  }
  if (user.role === "guide") {
    redirect("/guide-dashboard");
  }

  const { denied } = await searchParams;

  const [tickets, artisanOrders, trips, saved, reqs, activity] = await Promise.all([
    // Digital Passes
    db
      .select()
      .from(ticketBookings)
      .where(eq(ticketBookings.userId, user.id))
      .orderBy(desc(ticketBookings.createdAt))
      .limit(4),

    // Artisan Product Orders
    db
      .select({ o: orders, p: products, s: sellers })
      .from(orders)
      .innerJoin(products, eq(products.id, orders.productId))
      .innerJoin(sellers, eq(sellers.id, orders.sellerId))
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))
      .limit(4),

    // Itineraries
    db
      .select()
      .from(itineraries)
      .where(eq(itineraries.userId, user.id))
      .orderBy(desc(itineraries.updatedAt))
      .limit(4),

    // Saved Items
    db
      .select()
      .from(savedItems)
      .where(eq(savedItems.userId, user.id))
      .orderBy(desc(savedItems.createdAt)),

    // Guide Tour Requests
    db
      .select({ r: guideRequests, g: guides })
      .from(guideRequests)
      .innerJoin(guides, eq(guides.id, guideRequests.guideId))
      .where(eq(guideRequests.userId, user.id))
      .orderBy(desc(guideRequests.createdAt))
      .limit(4),

    // Recent Activity
    db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, user.id))
      .orderBy(desc(userActivity.createdAt))
      .limit(30),
  ]);

  const recentSlugs = [...new Set(activity.map((a) => a.refId))].slice(0, 5);
  const recent = await destinationsBySlugs(recentSlugs);
  const savedDest = await destinationsBySlugs(saved.filter((s) => s.kind === "destination").map((s) => s.refId));
  const count = (k: string) => saved.filter((s) => s.kind === k).length;

  return (
    <div className="space-y-10">
      {denied && (
        <p role="alert" className="rounded-xl bg-maroon/50 p-3 text-sm">
          You don&apos;t have permission to open the admin area.
        </p>
      )}

      {/* Traveller Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-5">
        <div>
          <span className="tag-verified">Traveller Experience Portal</span>
          <h1 className="h-section mt-1">Namaste, {user.fullName.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-ivory/60">
            Role: <span className="text-gold font-semibold capitalize">{user.role}</span>
            {user.isDemo ? " · demo traveller account" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/my-bookings" className="btn btn-ghost text-xs whitespace-nowrap">
            🎟️ All Passes & Orders →
          </Link>
          <Link href="/plan-trip" className="btn btn-gold text-xs whitespace-nowrap">
            🧭 Plan New Trip
          </Link>
        </div>
      </header>

      {/* Quick Metrics */}
      <ul className="grid gap-4 sm:grid-cols-4">
        {[
          ["Fast-Track Passes", tickets.length],
          ["Artisan Orders", artisanOrders.length],
          ["Planned Trips", trips.length],
          ["Guide Bookings", reqs.length],
        ].map(([l, n]) => (
          <li key={String(l)} className="card">
            <p className="font-serif text-4xl text-gold">{n}</p>
            <p className="text-xs uppercase tracking-widest text-ivory/60">{l}</p>
          </li>
        ))}
      </ul>

      {/* 1. Active Digital Monument Passes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ivory">🎟️ Digital Monument Passes</h2>
            <p className="text-xs text-ivory/60">Fast-track entry passes for Delhi heritage monuments</p>
          </div>
          <Link href="/my-bookings" className="text-xs text-gold underline">
            View all ({tickets.length})
          </Link>
        </div>

        {tickets.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {tickets.map((t) => (
              <div key={t.id} className="card border-gold/30 bg-gradient-to-br from-charcoal/80 to-ink/90 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-gold">{t.bookingRef}</span>
                    <h3 className="font-serif text-xl font-bold text-ivory mt-0.5">{t.destinationName}</h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/40 capitalize">
                    {t.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-ivory/70 space-y-0.5">
                  <p>📅 {t.visitDate} · {t.slotTime}</p>
                  <p>👥 {t.adults} Indian, {t.foreignerCount} Foreigner, {t.children} Children</p>
                  {t.includeGuide && <p className="text-gold font-medium">✓ Guide Included</p>}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-ivory/10 pt-2 text-xs">
                  <span className="font-serif text-sm font-bold text-gold">₹{t.totalPriceInr}</span>
                  <Link href="/my-bookings" className="text-gold hover:underline">
                    Show Gate Pass →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center p-6 text-ivory/70">
            <p className="font-serif text-lg">No monument passes booked yet.</p>
            <p className="mt-1 text-xs text-ivory/50">Explore Delhi monuments and get instant digital entry passes.</p>
            <div className="mt-3">
              <Link href="/destinations" className="btn btn-gold !min-h-8 text-xs">
                Explore Monuments & Passes →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 2. Artisan Handicraft Orders */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ivory">🛍️ Authentic Artisan Orders</h2>
            <p className="text-xs text-ivory/60">Direct craft purchases supporting Delhi craftsmen</p>
          </div>
          <Link href="/local-products" className="text-xs text-gold underline">
            Browse Crafts →
          </Link>
        </div>

        {artisanOrders.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {artisanOrders.map(({ o, p, s }) => (
              <div key={o.id} className="card p-4 border-ivory/15 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-gold">{o.orderNumber}</span>
                    <h3 className="font-serif text-lg text-ivory mt-0.5">
                      {o.quantity}x {p.name}
                    </h3>
                    <p className="text-xs text-ivory/50">Crafted by {s.businessName} · {s.locality}</p>
                  </div>
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-200 border border-blue-500/40 capitalize">
                    {o.status}
                  </span>
                </div>
                <div className="text-xs text-ivory/70">
                  <p>📍 Delivery to: {o.deliveryAddress}</p>
                  <p>💳 {o.paymentMethod}</p>
                </div>
                <div className="flex items-center justify-between border-t border-ivory/10 pt-2 text-xs">
                  <span className="font-serif text-base font-bold text-gold">₹{o.totalPriceInr.toLocaleString("en-IN")}</span>
                  <Link href="/my-bookings" className="text-gold hover:underline">
                    Track Order →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center p-6 text-ivory/70">
            <p className="font-serif text-lg">No artisan orders placed yet.</p>
            <p className="mt-1 text-xs text-ivory/50">Support local Delhi craftsmen with authentic handcrafted souvenirs.</p>
            <div className="mt-3">
              <Link href="/local-products" className="btn btn-gold !min-h-8 text-xs">
                Explore Local Handicrafts →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 3. Upcoming Trips & Plans */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Upcoming Trips & Custom Plans</h2>
          <Link href="/plan-trip" className="btn btn-gold !min-h-9 text-xs">
            + New Plan
          </Link>
        </div>
        {trips.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {trips.map((t) => (
              <li key={t.id} className="card">
                <p className="font-serif text-xl">{t.title}</p>
                <p className="text-sm text-ivory/60">
                  {t.tripDate ?? "No date set"} · {t.stops.length} stops
                </p>
                <Link href={`/plan-trip?load=${t.id}`} className="mt-2 inline-block text-sm text-gold underline">
                  Open & Edit Itinerary →
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card text-ivory/70">
            No custom itineraries yet.{" "}
            <Link href="/plan-trip" className="text-gold underline">
              Create your first itinerary
            </Link>
            .
          </p>
        )}
      </section>

      {/* 4. Guide Tour Requests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Guide Tour Requests</h2>
          <Link href="/guides" className="text-xs text-gold underline">
            Find More Guides →
          </Link>
        </div>
        {reqs.length ? (
          <ul className="space-y-2">
            {reqs.map(({ r, g }) => (
              <li key={r.id} className="card !p-4 flex flex-wrap justify-between gap-2">
                <div>
                  <span className="font-serif text-lg text-ivory">{g.name}</span>
                  <p className="text-xs text-ivory/60">
                    📅 {r.tourDate} ({r.timeSlot}) · {r.groupSize} people
                    {r.destination ? ` · ${r.destination}` : ""}
                  </p>
                </div>
                <span className="chip capitalize self-center">{r.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card text-ivory/60">
            No guide tour requests yet.{" "}
            <Link href="/guides" className="text-gold underline">
              Find an ASI licensed local guide
            </Link>
            .
          </p>
        )}
      </section>

      {/* 5. Saved Destinations */}
      <section className="space-y-3">
        <h2 className="font-serif text-2xl">Saved Destinations & Heritage Sites</h2>
        {savedDest.length ? (
          <ul className="flex flex-wrap gap-2">
            {savedDest.map((d) => (
              <li key={d.slug}>
                <Link href={`/destination/${d.slug}`} className="chip chip-on min-h-9 px-4">
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card text-ivory/60">Nothing saved yet. Open any destination and press Save.</p>
        )}
        <div>
          <Link href="/saved-places" className="text-sm text-gold underline">
            Manage all saved items ({count("destination") + count("market") + count("event")})
          </Link>
        </div>
      </section>

      {/* 6. Recently Explored */}
      <section className="space-y-3">
        <h2 className="font-serif text-2xl">Recently Explored</h2>
        {recent.length ? (
          <ul className="flex flex-wrap gap-2">
            {recent.map((d) => (
              <li key={d.slug}>
                <Link href={`/destination/${d.slug}`} className="chip min-h-9 px-4 hover:border-gold">
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ivory/60">Destinations you explore will show up here.</p>
        )}
      </section>

      {/* 7. Travel Preferences */}
      <section className="card space-y-2">
        <h2 className="font-serif text-xl">Travel Preferences</h2>
        <p className="text-sm text-ivory/70">
          Preferred Language: {user.language === "hi" ? "हिन्दी" : "English"} · Interests:{" "}
          {user.interests.length ? user.interests.join(", ") : "Heritage, Architecture, Food"} ·{" "}
          <Link href="/profile" className="text-gold underline">
            Edit Preferences
          </Link>
        </p>
      </section>
    </div>
  );
}

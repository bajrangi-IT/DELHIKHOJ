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
import { REAL_DELHI_LIVE_EVENTS } from "@/lib/live-events";

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
      .limit(10),

    // Recent Activity
    db
      .select()
      .from(userActivity)
      .where(eq(userActivity.userId, user.id))
      .orderBy(desc(userActivity.createdAt))
      .limit(30),
  ]);

  const acceptedReqs = reqs.filter((item) => item.r.status === "accepted");
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

      {/* Guide Tour Approval Notification Banner */}
      {acceptedReqs.length > 0 && (
        <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-charcoal/95 p-5 shadow-2xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="rounded-full bg-emerald-500/25 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/40">
                  Tour Approved & Confirmed
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-ivory">
                🎉 Good news! {acceptedReqs[0].g.name} accepted your tour request!
              </h2>
              <p className="text-xs text-ivory/80">
                📅 <strong>Tour Date:</strong> {acceptedReqs[0].r.tourDate} ({acceptedReqs[0].r.timeSlot}) · 👥 <strong>Group:</strong> {acceptedReqs[0].r.groupSize} Persons
                {acceptedReqs[0].r.destination ? ` · 🏛️ ${acceptedReqs[0].r.destination}` : ""}
              </p>
              <p className="text-xs text-emerald-200/90">
                Connect directly with your verified ASI guide to coordinate meeting points, timing, and tour tips!
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {acceptedReqs[0].g.contactPhone ? (
                <a
                  href={`https://wa.me/91${acceptedReqs[0].g.contactPhone.replace(/[^0-9]/g, "").slice(-10)}?text=${encodeURIComponent(
                    `Namaste ${acceptedReqs[0].g.name}! I booked a guided heritage tour with you on Delhi Ki Khoj for ${acceptedReqs[0].r.tourDate} (${acceptedReqs[0].r.timeSlot}). Excited for our tour! Could you please share the meeting point details?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-ivory shadow-lg hover:bg-emerald-500 transition-all transform hover:scale-[1.02]"
                >
                  <span>💬 Chat with Guide on WhatsApp</span>
                </a>
              ) : null}
              <Link href="/my-guide-requests" className="btn btn-ghost text-xs">
                View All Bookings →
              </Link>
            </div>
          </div>
        </div>
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
          <div>
            <h2 className="font-serif text-2xl text-ivory">🚶 Heritage Guide Tour Requests</h2>
            <p className="text-xs text-ivory/60">Direct walking tours led by licensed ASI historians & guides</p>
          </div>
          <Link href="/guides" className="text-xs text-gold underline">
            Find More Guides →
          </Link>
        </div>
        {reqs.length ? (
          <ul className="space-y-3">
            {reqs.map(({ r, g }) => (
              <li key={r.id} className="card !p-5 flex flex-wrap items-center justify-between gap-4 border-ivory/15">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-xl text-ivory font-bold">{g.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize border ${
                        r.status === "accepted"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : r.status === "declined"
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : "bg-gold/20 text-gold border-gold/40"
                      }`}
                    >
                      {r.status === "accepted" ? "✓ Confirmed & Approved" : r.status === "declined" ? "✕ Declined" : "⏳ Awaiting Guide Confirmation"}
                    </span>
                  </div>
                  <p className="text-xs text-ivory/70">
                    📅 <strong>Tour Date:</strong> {r.tourDate} ({r.timeSlot}) · 👥 <strong>Group:</strong> {r.groupSize} People
                    {r.destination ? ` · 🏛️ ${r.destination}` : ""}
                  </p>
                  {r.message && <p className="text-xs text-sand/80 italic">&ldquo;{r.message}&rdquo;</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {r.status === "accepted" && g.contactPhone && (
                    <a
                      href={`https://wa.me/91${g.contactPhone.replace(/[^0-9]/g, "").slice(-10)}?text=${encodeURIComponent(
                        `Namaste ${g.name}! My tour booking for ${r.tourDate} (${r.timeSlot}) on Delhi Ki Khoj is confirmed. Let's coordinate our meeting location!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/50 transition-colors shadow-sm"
                    >
                      <span>💬 Chat with Guide on WhatsApp</span>
                    </a>
                  )}
                  <Link href="/my-guide-requests" className="text-xs text-gold underline">
                    Manage Request →
                  </Link>
                </div>
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

      {/* 5. Suggested Cultural Events & Heritage Walks Near You */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ivory">🌟 Suggested Cultural Events & Walks Near You</h2>
            <p className="text-xs text-ivory/60">Live verified Delhi heritage festivals, sound & light shows, and fairs</p>
          </div>
          <Link href="/events" className="text-xs text-gold underline">
            View All Live Events ({REAL_DELHI_LIVE_EVENTS.length}) →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REAL_DELHI_LIVE_EVENTS.slice(0, 4).map((e) => (
            <div
              key={e.title}
              className="card !p-0 overflow-hidden border-ivory/15 bg-charcoal/80 flex flex-col justify-between hover:border-gold/50 transition-all group"
            >
              <div className="relative h-36 w-full overflow-hidden bg-ink">
                {e.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.image}
                    alt={e.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-3xl text-gold/30">
                    🏛️
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="rounded-full bg-charcoal/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold border border-gold/30">
                    {e.type}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-serif text-base font-bold text-ivory line-clamp-1 group-hover:text-gold transition-colors">
                    {e.title}
                  </h3>
                  <p className="text-xs text-ivory/60 line-clamp-2 mt-1">{e.description}</p>
                </div>

                <div className="space-y-1 border-t border-ivory/10 pt-2 text-[11px] text-ivory/70">
                  <p className="truncate">📍 {e.venue}</p>
                  <p className="text-sand">🎟️ {e.priceNote || "Free Entry"}</p>
                </div>

                <div className="pt-1">
                  <a
                    href={e.sourceUrl || e.bookingUrl || "/events"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-gold/15 py-1.5 text-xs font-semibold text-gold border border-gold/30 hover:bg-gold hover:text-ink transition-colors"
                  >
                    <span>Official Info & Tickets ↗</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
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

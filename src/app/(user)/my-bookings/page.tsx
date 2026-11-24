import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { guideRequests, guides, orders, products, sellers, ticketBookings } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";
import { ActionButton } from "@/components/account/AccountForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My bookings & passes" };

const tone: Record<string, string> = {
  pending: "text-gold bg-gold/10 border-gold/30",
  confirmed: "text-blue-200 bg-blue-500/10 border-blue-500/30",
  accepted: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  shipped: "text-purple-300 bg-purple-500/10 border-purple-500/30",
  delivered: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  declined: "text-red-300 bg-red-500/10 border-red-500/30",
  cancelled: "text-ivory/50 bg-ivory/5 border-ivory/20",
};

export default async function MyBookings() {
  const user = await requireUser("/my-bookings");

  const [tickets, guideTours, productOrders] = await Promise.all([
    // 1. Digital Passes
    db
      .select()
      .from(ticketBookings)
      .where(eq(ticketBookings.userId, user.id))
      .orderBy(desc(ticketBookings.createdAt)),

    // 2. Guide Tours
    db
      .select({ r: guideRequests, g: guides })
      .from(guideRequests)
      .innerJoin(guides, eq(guides.id, guideRequests.guideId))
      .where(eq(guideRequests.userId, user.id))
      .orderBy(desc(guideRequests.createdAt)),

    // 3. Artisan Orders
    db
      .select({ o: orders, p: products, s: sellers })
      .from(orders)
      .innerJoin(products, eq(products.id, orders.productId))
      .innerJoin(sellers, eq(sellers.id, orders.sellerId))
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt)),
  ]);

  return (
    <div className="space-y-12">
      <div className="border-b border-ivory/10 pb-5">
        <span className="tag-verified">Traveller Booking Hub</span>
        <h1 className="h-section mt-2 text-2xl sm:text-3xl lg:text-4xl">My Bookings & Passes</h1>
        <p className="mt-1 text-sm text-ivory/70">
          Access your digital monument passes, scheduled heritage guides, and authentic artisan product orders.
        </p>
      </div>

      {/* 1. Digital Passes Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl text-ivory">🎟️ Digital Monument Passes</h2>
            <p className="text-xs text-ivory/60">
              Verified digital entry tickets for Delhi monuments and archaeological sites.
            </p>
          </div>
          <span className="rounded-full bg-gold/20 px-3 py-1 font-mono text-xs font-bold text-gold">
            {tickets.length} Pass{tickets.length === 1 ? "" : "es"}
          </span>
        </div>

        {!tickets.length ? (
          <div className="card text-center p-6">
            <p className="font-serif text-xl text-ivory">No digital passes booked yet</p>
            <p className="mt-1 text-sm text-ivory/60">
              Book fast-track digital passes for Red Fort, Qutub Minar, and other iconic destinations.
            </p>
            <div className="mt-4">
              <Link href="/destinations" className="btn btn-gold text-xs">
                Explore Destinations & Book Passes →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="card flex flex-col justify-between border-gold/40 bg-gradient-to-br from-charcoal/80 to-ink/90 p-5 shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="tag-verified text-[11px]">Instant Digital Pass</span>
                      <h3 className="font-serif text-2xl font-bold text-ivory mt-1">
                        {t.destinationName}
                      </h3>
                    </div>
                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      {t.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-ivory/80">
                    <p>
                      📅 <strong>Visit Date:</strong> {t.visitDate}
                    </p>
                    <p>
                      ⏰ <strong>Time Slot:</strong> {t.slotTime}
                    </p>
                    <p>
                      👥 <strong>Visitors:</strong> {t.adults} Indian, {t.foreignerCount} Foreigner, {t.children} Children
                    </p>
                    {t.includeGuide && (
                      <p className="text-gold font-medium">
                        ✓ Includes Licensed Guide Assistance
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-ivory/10 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-ivory/50">Pass Reference</span>
                      <p className="font-mono text-base font-bold text-gold">{t.bookingRef}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-ivory/50">Total Amount</span>
                      <p className="font-serif text-xl font-bold text-ivory">
                        {t.totalPriceInr === 0 ? "Free" : `₹${t.totalPriceInr}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-charcoal/60 px-3 py-2 text-[11px] text-ivory/70">
                    <span>Scan & show barcode at monument gate</span>
                    <span className="font-bold text-emerald-400">✓ Valid for Entry</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Guide Tours Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl text-ivory">🧭 Heritage Guide Tours</h2>
            <p className="text-xs text-ivory/60">
              Personalized tours with licensed storytelling experts and historians.
            </p>
          </div>
          <span className="rounded-full bg-gold/20 px-3 py-1 font-mono text-xs font-bold text-gold">
            {guideTours.length} Tour{guideTours.length === 1 ? "" : "s"}
          </span>
        </div>

        {!guideTours.length ? (
          <div className="card text-center p-6">
            <p className="font-serif text-xl text-ivory">No guide bookings yet</p>
            <p className="mt-1 text-sm text-ivory/60">
              Browse top-rated licensed guides with ratings and reviews for Delhi heritage walks.
            </p>
            <div className="mt-4">
              <Link href="/guides" className="btn btn-gold text-xs">
                Find Nearest Guides →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {guideTours.map(({ r, g }) => (
              <div
                key={r.id}
                className="card flex flex-col justify-between gap-4 border-ivory/10 md:flex-row md:items-center"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <Link href={`/guides/${g.id}`} className="font-serif text-2xl font-bold text-ivory hover:text-gold">
                      {g.name}
                    </Link>
                    <span className="tag-verified text-xs">{g.badge || "ASI Licensed"}</span>
                    <span className="text-xs text-gold">★ {g.rating?.toFixed(1) || "4.9"}</span>
                  </div>

                  <p className="mt-1 text-xs text-ivory/60">
                    Languages: {g.languages.join(", ")} · Rate: ₹{g.hourlyRate || 800}/hr
                  </p>

                  <div className="mt-2 text-xs text-ivory/80 space-y-0.5">
                    <p>
                      📅 <strong>Tour Date:</strong> {r.tourDate} · ⏰ {r.timeSlot} · 👥 {r.groupSize} People
                    </p>
                    {r.destination && (
                      <p>
                        📍 <strong>Destination:</strong> {r.destination}
                      </p>
                    )}
                    {r.message && (
                      <p className="text-sand/80">
                        &ldquo;{r.message}&rdquo;
                      </p>
                    )}
                  </div>

                  {r.status === "accepted" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {g.contactPhone && (
                        <a
                          href={`https://wa.me/91${g.contactPhone.replace(/[^0-9]/g, "").slice(-10)}?text=${encodeURIComponent(
                            `Namaste ${g.name}! My tour booking for ${r.tourDate} (${r.timeSlot}) on Delhi Ki Khoj is confirmed. Let's coordinate our meeting location!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/30 px-3.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/50 transition-colors shadow-sm"
                        >
                          <span>💬 Chat on WhatsApp</span>
                        </a>
                      )}
                      <a
                        href={`mailto:${g.contactEmail || "guide@delhikikhoj.test"}?subject=${encodeURIComponent(
                          `Delhi Ki Khoj Tour Confirmation - ${r.tourDate}`
                        )}`}
                        className="inline-flex items-center gap-1 rounded-full bg-ivory/10 px-3 py-1 text-xs text-ivory/70 hover:text-gold transition-colors"
                      >
                        ✉️ {g.contactEmail || "Email Guide"}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-row items-center justify-between md:flex-col md:items-end gap-2 border-t border-ivory/10 pt-3 md:border-t-0 md:pt-0">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      tone[r.status] || "text-ivory"
                    }`}
                  >
                    {r.status}
                  </span>

                  {["pending", "accepted"].includes(r.status) && (
                    <ActionButton
                      url={`/api/guide-requests/${r.id}`}
                      method="PATCH"
                      body={{ status: "cancelled" }}
                      label="Cancel Tour"
                      variant="danger"
                      confirmText="Cancel this guide tour?"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Artisan Orders Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl text-ivory">🛍️ Artisan Craft Orders</h2>
            <p className="text-xs text-ivory/60">
              Orders placed directly with Delhi artisans, spice masters, and weavers.
            </p>
          </div>
          <span className="rounded-full bg-gold/20 px-3 py-1 font-mono text-xs font-bold text-gold">
            {productOrders.length} Order{productOrders.length === 1 ? "" : "s"}
          </span>
        </div>

        {!productOrders.length ? (
          <div className="card text-center p-6">
            <p className="font-serif text-xl text-ivory">No artisan craft orders yet</p>
            <p className="mt-1 text-sm text-ivory/60">
              Shop authentic handicrafts, Dariba silver, and Old Delhi spices directly from verified makers.
            </p>
            <div className="mt-4">
              <Link href="/local-products" className="btn btn-gold text-xs">
                Explore Artisan Marketplace →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {productOrders.map(({ o, p, s }) => (
              <div
                key={o.id}
                className="card flex flex-col justify-between gap-4 border-ivory/10 md:flex-row md:items-center"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-gold">{o.orderNumber}</span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        tone[o.status] || "text-ivory"
                      }`}
                    >
                      {o.status}
                    </span>
                    <span className="text-xs text-ivory/50">{fmtDate(o.createdAt)}</span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-ivory mt-1">
                    {o.quantity}x {p.name}
                  </h3>

                  <p className="text-xs text-ivory/60">
                    Artisan: <strong>{s.businessName}</strong> ({s.locality})
                  </p>

                  <div className="mt-2 text-xs text-ivory/80 space-y-0.5">
                    <p>
                      📍 <strong>Delivery Address:</strong> {o.deliveryAddress}
                    </p>
                    <p>
                      💳 <strong>Payment:</strong> {o.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between md:flex-col md:items-end gap-2 border-t border-ivory/10 pt-3 md:border-t-0 md:pt-0">
                  <span className="text-[11px] text-ivory/50">Total Paid / Due</span>
                  <p className="font-serif text-2xl font-bold text-gold">
                    ₹{o.totalPriceInr.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-emerald-300">
                    {o.status === "delivered" ? "✓ Delivered" : "🚚 In Progress"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

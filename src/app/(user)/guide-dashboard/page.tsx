import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { guideRequests, guides, users } from "@/db/schema";
import { ActionButton } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Guide Dashboard" };

export default async function GuideDashboard() {
  const user = await requireUser("/guide-dashboard");
  const [g] = await db.select().from(guides).where(eq(guides.userId, user.id));

  if (!g) {
    return (
      <div className="space-y-6">
        <header className="border-b border-ivory/10 pb-4">
          <span className="tag-verified">Licensed Guide Hub</span>
          <h1 className="h-section mt-1">Guide Dashboard</h1>
          <p className="mt-1 text-sm text-ivory/60">
            You are currently signed in as <strong className="text-gold">{user.fullName}</strong> ({user.role}).
          </p>
        </header>

        <div className="card max-w-2xl space-y-4 border-gold/30 p-8 text-center">
          <span className="text-4xl">🧭</span>
          <h2 className="font-serif text-2xl text-ivory">Register as an ASI Licensed Guide</h2>
          <p className="text-sm text-ivory/70 leading-relaxed">
            Lead bespoke heritage tours across Delhi&apos;s 7 historical cities. Connect directly with verified international & domestic tourists. Set your availability and earn ₹800 - ₹2,500/hour with 90% net payout.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/become-guide" className="btn btn-gold text-xs">
              Apply as a Local Guide →
            </Link>
            <Link href="/dashboard" className="btn btn-ghost text-xs">
              Go to Traveller Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const reqs = await db
    .select({ r: guideRequests, u: users })
    .from(guideRequests)
    .innerJoin(users, eq(users.id, guideRequests.userId))
    .where(eq(guideRequests.guideId, g.id))
    .orderBy(desc(guideRequests.createdAt));

  // Financial calculations
  const standardTourRate = g.hourlyRate ? g.hourlyRate * 3 : 2400; // Average 3-hr heritage tour
  const acceptedTours = reqs.filter(({ r }) => r.status === "accepted").length;
  const pendingTours = reqs.filter(({ r }) => r.status === "pending").length;
  const estimatedGrossEarnings = acceptedTours * standardTourRate;
  const platformFee = Math.round(estimatedGrossEarnings * 0.10); // 10% platform facilitation fee
  const netGuidePayout = estimatedGrossEarnings - platformFee;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-5">
        <div>
          <span className="tag-verified">{g.badge || "ASI Licensed"} Heritage Guide</span>
          <h1 className="h-section mt-2 text-2xl sm:text-3xl lg:text-4xl">{g.name}</h1>
          <p className="mt-1 text-sm text-ivory/70">
            Rate: <strong className="text-gold">₹{g.hourlyRate}/hr</strong> · Profile Status:{" "}
            <span className={`chip capitalize font-semibold ${g.status === "approved" ? "chip-on" : ""}`}>{g.status}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {g.status === "approved" && (
            <Link href={`/guides/${g.id}`} className="btn btn-ghost text-xs whitespace-nowrap">
              View Public Guide Profile →
            </Link>
          )}
        </div>
      </div>

      {/* Guide Financial Summary Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ivory">Tour Bookings & Payout Summary</h2>
          <span className="text-xs text-ivory/50">10% Platform Facilitation Fee · 90% Net Guide Payout</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card border-ivory/15 bg-charcoal/60">
            <span className="text-xs uppercase tracking-wider text-ivory/50">Gross Tour Volume</span>
            <p className="font-serif text-3xl font-bold text-ivory mt-1">
              ₹{estimatedGrossEarnings.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-ivory/60 mt-1">From {acceptedTours} confirmed tour bookings</p>
          </div>

          <div className="card border-gold/30 bg-gold/5">
            <span className="text-xs uppercase tracking-wider text-gold">Platform Fee (10%)</span>
            <p className="font-serif text-3xl font-bold text-gold mt-1">
              -₹{platformFee.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-gold/80 mt-1">Tourist matching, insurance & support</p>
          </div>

          <div className="card border-emerald-500/40 bg-emerald-500/10">
            <span className="text-xs uppercase tracking-wider text-emerald-300">Net Guide Payout (90%)</span>
            <p className="font-serif text-3xl font-bold text-emerald-300 mt-1">
              ₹{netGuidePayout.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-emerald-200/70 mt-1">Directly payable upon tour completion</p>
          </div>

          <div className="card border-ivory/15 bg-charcoal/60">
            <span className="text-xs uppercase tracking-wider text-ivory/50">Booking Requests</span>
            <p className="font-serif text-3xl font-bold text-ivory mt-1">
              {reqs.length}
            </p>
            <p className="text-[11px] text-ivory/60 mt-1">
              {pendingTours} pending review · {acceptedTours} confirmed
            </p>
          </div>
        </div>
      </section>

      {/* Booking Requests List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ivory">Tour Booking Requests</h2>
          <span className="text-xs text-ivory/60">Direct requests from tourists & visiting delegations</span>
        </div>

        {!reqs.length ? (
          <p className="card p-8 text-center text-ivory/70">
            No booking requests yet. When tourists request a guided walk with you, it will appear here.
          </p>
        ) : (
          <ul className="space-y-3">
            {reqs.map(({ r, u }) => (
              <li key={r.id} className="card flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-2xl text-ivory">{u.fullName}</span>
                    <span className="chip capitalize font-semibold">{r.status}</span>
                  </div>
                  <p className="text-xs text-ivory/70">
                    📅 <strong>Tour Date:</strong> {r.tourDate} · ⏰ <strong>Time:</strong> {r.timeSlot} · 👥 <strong>Group:</strong> {r.groupSize} people
                    {r.destination ? ` · 🏛️ ${r.destination}` : ""}
                  </p>
                  {r.message && (
                    <p className="rounded-lg bg-charcoal/80 p-2.5 text-xs text-sand/90 italic">
                      &ldquo;{r.message}&rdquo;
                    </p>
                  )}
                  <p className="text-[11px] text-ivory/50">
                    Contact: {u.email} {u.phone ? `· ${u.phone}` : ""}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    {u.phone ? (
                      <a
                        href={`https://wa.me/91${u.phone.replace(/[^0-9]/g, "").slice(-10)}?text=${encodeURIComponent(
                          `Namaste ${u.fullName}! I am ${g.name}, your heritage guide on Delhi Ki Khoj. Regarding your tour booking for ${r.tourDate} (${r.timeSlot}): let's connect and coordinate our meeting place!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-colors shadow-sm"
                      >
                        <span>💬 Chat with Tourist on WhatsApp</span>
                      </a>
                    ) : (
                      <a
                        href={`mailto:${u.email}?subject=${encodeURIComponent(
                          `Delhi Ki Khoj Tour Confirmation - ${r.tourDate}`
                        )}&body=${encodeURIComponent(
                          `Namaste ${u.fullName},\n\nI am ${g.name}, your heritage guide on Delhi Ki Khoj. I received your tour booking for ${r.tourDate} (${r.timeSlot}).`
                        )}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ivory/10 px-3 py-1 text-xs text-ivory/80 border border-ivory/20 hover:text-gold transition-colors"
                      >
                        <span>✉️ Email Tourist</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-xs text-ivory/60">
                    <span>Est. Tour Rate: <strong className="text-gold">₹{standardTourRate}</strong></span>
                    <span className="block text-[10px]">Net Payout: ₹{standardTourRate - Math.round(standardTourRate * 0.10)}</span>
                  </div>

                  {r.status === "accepted" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                      ✅ Confirmed & Accepted
                    </span>
                  )}

                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <ActionButton
                        url={`/api/guide-requests/${r.id}`}
                        method="PATCH"
                        body={{ status: "accepted" }}
                        label="Accept Tour"
                        variant="gold"
                      />
                      <ActionButton
                        url={`/api/guide-requests/${r.id}`}
                        method="PATCH"
                        body={{ status: "declined" }}
                        label="Decline"
                        variant="danger"
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { guideRequests, guides } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My bookings" };

export default async function MyBookings() {
  const user = await requireUser("/my-bookings");
  const rows = await db.select({ r: guideRequests, g: guides }).from(guideRequests).innerJoin(guides, eq(guides.id, guideRequests.guideId)).where(and(eq(guideRequests.userId, user.id), eq(guideRequests.status, "accepted"))).orderBy(desc(guideRequests.tourDate));
  return (
    <div><h1 className="h-section">My bookings</h1>
      <div className="card mt-4 text-sm text-ivory/70"><p>This site doesn&apos;t sell tickets or take payments. Monument and museum tickets are booked on the official provider&apos;s site, so they can&apos;t appear here. Below are guide tours that the guide has <strong>accepted</strong>.</p></div>
      {!rows.length ? <p className="card mt-6">No accepted guide tours yet. <Link href="/my-guide-requests" className="text-gold underline">See your requests</Link>.</p> : (
        <ul className="mt-6 space-y-3">{rows.map(({ r, g }) => <li key={r.id} className="card"><p className="font-serif text-2xl">{g.name}</p><p className="text-sm text-ivory/70">{r.tourDate} · {r.timeSlot} · {r.groupSize} people · <span className="text-emerald-300">Accepted by guide</span></p><p className="text-xs text-ivory/50">Contact: {g.contactEmail ?? "via guide profile"} — agree meeting point and price directly.</p></li>)}</ul>
      )}
    </div>
  );
}

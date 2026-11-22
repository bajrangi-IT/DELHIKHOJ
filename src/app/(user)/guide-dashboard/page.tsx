import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { guideRequests, guides, users } from "@/db/schema";
import { ActionButton } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Guide dashboard" };

export default async function GuideDashboard() {
  const user = await requireUser("/guide-dashboard");
  const [g] = await db.select().from(guides).where(eq(guides.userId, user.id));
  if (!g) return <div><h1 className="h-section">Guide dashboard</h1><p className="card mt-6">You don&apos;t have a guide profile yet. <Link href="/become-guide" className="text-gold underline">Create one</Link>.</p></div>;
  const reqs = await db.select({ r: guideRequests, u: users }).from(guideRequests).innerJoin(users, eq(users.id, guideRequests.userId)).where(eq(guideRequests.guideId, g.id)).orderBy(desc(guideRequests.createdAt));
  return (
    <div><h1 className="h-section">Guide dashboard</h1>
      <p className="mt-2 text-ivory/70">{g.name} · profile status: <span className="chip capitalize">{g.status}</span> {g.status === "approved" && <Link href={`/guides/${g.id}`} className="ml-2 text-gold underline">View public profile</Link>}</p>
      <h2 className="mt-8 font-serif text-2xl">Booking requests</h2>
      {!reqs.length ? <p className="card mt-3">No requests yet.</p> : <ul className="mt-3 space-y-3">{reqs.map(({ r, u }) => (
        <li key={r.id} className="card flex flex-wrap items-start justify-between gap-3"><div><p className="font-serif text-xl">{u.fullName}</p><p className="text-sm text-ivory/60">{r.tourDate} · {r.timeSlot} · {r.groupSize} people{r.destination ? ` · ${r.destination}` : ""}</p>{r.message && <p className="mt-1 text-sm">“{r.message}”</p>}<p className="mt-1 text-xs text-ivory/50">Traveller email: {u.email}</p></div>
          <div className="text-right"><p className="mb-2 text-sm font-semibold capitalize">{r.status}</p>{r.status === "pending" && <div className="flex gap-2"><ActionButton url={`/api/guide-requests/${r.id}`} method="PATCH" body={{ status: "accepted" }} label="Accept" variant="gold" /><ActionButton url={`/api/guide-requests/${r.id}`} method="PATCH" body={{ status: "declined" }} label="Decline" variant="danger" /></div>}</div></li>
      ))}</ul>}
    </div>
  );
}

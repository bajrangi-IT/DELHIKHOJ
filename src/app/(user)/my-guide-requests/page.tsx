import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { guideRequests, guides } from "@/db/schema";
import { ActionButton } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My guide requests" };

const tone: Record<string, string> = { pending: "text-gold", accepted: "text-emerald-300", declined: "text-red-300", cancelled: "text-ivory/50" };

export default async function MyGuideRequests() {
  const user = await requireUser("/my-guide-requests");
  const rows = await db.select({ r: guideRequests, g: guides }).from(guideRequests).innerJoin(guides, eq(guides.id, guideRequests.guideId)).where(eq(guideRequests.userId, user.id)).orderBy(desc(guideRequests.createdAt));
  return (
    <div><h1 className="h-section">Guide requests</h1>
      <p className="mt-2 text-sm text-ivory/60">A request is not a confirmed booking until the guide accepts it. Payment is arranged directly with the guide.</p>
      {!rows.length ? <p className="card mt-6">No requests yet. <Link href="/guides" className="text-gold underline">Browse guides</Link>.</p> : (
        <ul className="mt-6 space-y-4">{rows.map(({ r, g }) => (
          <li key={r.id} className="card flex flex-wrap items-start justify-between gap-3">
            <div><Link href={`/guides/${g.id}`} className="font-serif text-2xl hover:text-gold">{g.name}</Link><p className="text-sm text-ivory/60">{r.tourDate} · {r.timeSlot} · {r.groupSize} people{r.destination ? ` · ${r.destination}` : ""}</p>{r.message && <p className="mt-1 text-sm text-ivory/70">“{r.message}”</p>}</div>
            <div className="text-right"><p className={`text-sm font-semibold capitalize ${tone[r.status]}`}>{r.status}</p>{["pending", "accepted"].includes(r.status) && <div className="mt-2"><ActionButton url={`/api/guide-requests/${r.id}`} method="PATCH" body={{ status: "cancelled" }} label="Cancel request" variant="danger" confirmText="Cancel this request?" /></div>}</div>
          </li>
        ))}</ul>
      )}
    </div>
  );
}

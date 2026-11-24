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
            <div className="text-right space-y-2">
              <p className={`text-sm font-semibold capitalize ${tone[r.status]}`}>
                {r.status === "accepted" ? "✓ Confirmed & Accepted" : r.status}
              </p>
              {r.status === "accepted" && g.contactPhone && (
                <div>
                  <a
                    href={`https://wa.me/91${g.contactPhone.replace(/[^0-9]/g, "").slice(-10)}?text=${encodeURIComponent(
                      `Namaste ${g.name}! My tour booking for ${r.tourDate} (${r.timeSlot}) on Delhi Ki Khoj is confirmed. Let's coordinate our meeting location!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/30 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/50 transition-colors shadow-sm"
                  >
                    <span>💬 Chat on WhatsApp</span>
                  </a>
                </div>
              )}
              {["pending", "accepted"].includes(r.status) && (
                <div className="mt-1">
                  <ActionButton
                    url={`/api/guide-requests/${r.id}`}
                    method="PATCH"
                    body={{ status: "cancelled" }}
                    label="Cancel request"
                    variant="danger"
                    confirmText="Cancel this request?"
                  />
                </div>
              )}
            </div>
          </li>
        ))}</ul>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { itineraries } from "@/db/schema";
import { ActionButton } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My trips" };

export default async function MyTrips() {
  const user = await requireUser("/my-trips");
  const trips = await db.select().from(itineraries).where(eq(itineraries.userId, user.id)).orderBy(desc(itineraries.updatedAt));
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="h-section">My trips</h1><Link href="/plan-trip" className="btn btn-gold">+ New plan</Link></div>
      {!trips.length ? <p className="card mt-6">No saved itineraries yet. <Link href="/plan-trip" className="text-gold underline">Plan one</Link>.</p> : (
        <ul className="mt-6 space-y-4">{trips.map((t) => (
          <li key={t.id} className="card"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-serif text-2xl">{t.title}</h2><p className="text-sm text-ivory/60">{t.tripDate ?? "No date"} · updated {fmtDate(t.updatedAt)}</p><p className="mt-2 text-sm text-ivory/75">{t.stops.map((s) => s.name).join(" → ")}</p></div>
            <div className="flex gap-2"><Link href={`/plan-trip?load=${t.id}`} className="btn btn-ghost !min-h-9 !px-4">Open & edit</Link><ActionButton url={`/api/itineraries/${t.id}`} method="DELETE" label="Delete" variant="danger" confirmText="Delete this plan?" /></div></div></li>
        ))}</ul>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sellers } from "@/db/schema";
import { BecomeForm } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Become a seller" };

export default async function BecomeSeller() {
  const user = await requireUser("/become-seller");
  const [s] = await db.select().from(sellers).where(eq(sellers.userId, user.id));
  return (
    <div><h1 className="h-section">Become a local seller</h1>
      {s ? <div className="card mt-6 max-w-2xl"><p>Your business <strong>{s.businessName}</strong> is <span className="chip capitalize">{s.status}</span>.</p>{s.status === "approved" ? <p className="mt-3"><Link href="/seller-dashboard" className="btn btn-gold">Open seller dashboard</Link></p> : <p className="mt-2 text-sm text-ivory/60">An admin reviews every seller before listing.</p>}</div>
        : <><p className="mb-6 mt-2 max-w-2xl text-ivory/70">List your craft or shop. Customers contact you directly through enquiries; no payments happen on this site.</p><BecomeForm type="seller" /></>}
    </div>
  );
}

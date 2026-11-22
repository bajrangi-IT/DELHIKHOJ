import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { guides } from "@/db/schema";
import { BecomeForm } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Become a guide" };

export default async function BecomeGuide() {
  const user = await requireUser("/become-guide");
  const [g] = await db.select().from(guides).where(eq(guides.userId, user.id));
  return (
    <div><h1 className="h-section">Become a local guide</h1>
      {g ? <div className="card mt-6 max-w-2xl"><p>Your profile <strong>{g.name}</strong> is <span className="chip capitalize">{g.status}</span>.</p>{g.status === "approved" ? <p className="mt-3"><Link href="/guide-dashboard" className="btn btn-gold">Open guide dashboard</Link></p> : <p className="mt-2 text-sm text-ivory/60">An admin reviews every profile before it is listed.</p>}</div>
        : <><p className="mb-6 mt-2 max-w-2xl text-ivory/70">Submit your profile for admin review. Credentials are shown as self-reported; don&apos;t claim a licence you don&apos;t hold.</p><BecomeForm type="guide" /></>}
    </div>
  );
}

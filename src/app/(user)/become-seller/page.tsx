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
    <div className="space-y-6">
      <header className="border-b border-ivory/10 pb-4">
        <span className="tag-verified">Artisan Workshop Onboarding</span>
        <h1 className="h-section mt-1">Become a Local Artisan Seller</h1>
        <p className="mt-1 text-sm text-ivory/70">
          List your authentic Delhi handicrafts, textiles, pottery, and heritage products for visiting tourists.
        </p>
      </header>

      {s ? (
        <div className="card max-w-2xl space-y-3">
          <p>
            Your business <strong>{s.businessName}</strong> status is{" "}
            <span className="chip capitalize">{s.status}</span>.
          </p>
          {s.status === "approved" ? (
            <p className="mt-3">
              <Link href="/seller-dashboard" className="btn btn-gold text-xs">
                Open Seller Dashboard →
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-sm text-ivory/60">
              An administrator will review and verify your workshop profile shortly. Once approved, you can add products to the public marketplace.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="card max-w-2xl border-gold/30 bg-gold/5 p-4 text-xs text-ivory/80 space-y-1">
            <p className="font-semibold text-gold text-sm">💡 Startup Business Model & Payout Guarantee:</p>
            <p>• Zero upfront listing fee. Only pay 10% platform facilitation fee upon successful customer sales.</p>
            <p>• 90% net earnings transferred directly to your UPI / Bank account.</p>
            <p>• Local delivery support directly to tourists at Delhi hotels and residences.</p>
          </div>
          <BecomeForm type="seller" />
        </>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, products, sellers } from "@/db/schema";
import { ActionButton, ProductForm } from "@/components/account/AccountForms";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Seller dashboard" };

export default async function SellerDashboard() {
  const user = await requireUser("/seller-dashboard");
  const [s] = await db.select().from(sellers).where(eq(sellers.userId, user.id));
  if (!s) return <div><h1 className="h-section">Seller dashboard</h1><p className="card mt-6">No seller profile yet. <Link href="/become-seller" className="text-gold underline">Create one</Link>.</p></div>;
  const [ps, en] = await Promise.all([db.select().from(products).where(eq(products.sellerId, s.id)).orderBy(desc(products.createdAt)), db.select().from(enquiries).where(eq(enquiries.sellerId, s.id)).orderBy(desc(enquiries.createdAt))]);
  return (
    <div className="space-y-8"><h1 className="h-section">Seller dashboard</h1>
      <p className="text-ivory/70">{s.businessName} · status <span className="chip capitalize">{s.status}</span></p>
      {s.status !== "approved" ? <p className="card">Product management unlocks once an admin approves your profile.</p> : <ProductForm />}
      <section><h2 className="font-serif text-2xl">Your products</h2><ul className="mt-3 space-y-2">{ps.map((p) => <li key={p.id} className="card !p-4 flex items-center justify-between gap-3"><span>{p.name} <span className="text-xs text-ivory/50">· {p.category} · {p.priceInr ? `₹${p.priceInr}` : "price on enquiry"}</span></span><ActionButton url={`/api/seller/products?id=${p.id}`} method="DELETE" label="Delete" variant="danger" confirmText="Delete product?" /></li>)}{!ps.length && <li className="card">No products yet.</li>}</ul></section>
      <section><h2 className="font-serif text-2xl">Enquiries</h2><ul className="mt-3 space-y-2">{en.map((e) => <li key={e.id} className="card !p-4"><p className="text-xs text-ivory/50">{e.name} · {e.email} · {fmtDate(e.createdAt)}</p><p className="mt-1 text-sm">{e.message}</p></li>)}{!en.length && <li className="card">No enquiries yet.</li>}</ul></section>
    </div>
  );
}

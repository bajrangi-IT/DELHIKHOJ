import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import SaveButton from "@/components/SaveButton";
import SmartImage from "@/components/SmartImage";
import { getCurrentUser } from "@/lib/auth";
import { getProduct } from "@/lib/queries";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const r = await getProduct((await params).id);
  return r ? { title: r.p.name, description: r.p.description.slice(0, 150) } : { title: "Product not found" };
}

export default async function ProductPage({ params }: P) {
  const r = await getProduct((await params).id);
  if (!r) notFound();
  const user = await getCurrentUser();
  const { p, s } = r;
  return (
    <div className="wrap section grid gap-10 lg:grid-cols-2">
      <div>
        <Link href="/local-products" className="text-sm text-gold">← All products</Link>
        <SmartImage src={p.image ?? s.image} alt={p.name} fallbackLabel={p.name} priority className="mt-4 aspect-[4/3] w-full rounded-3xl border border-ivory/10" />
      </div>
      <div>
        {s.isDemo && <span className="tag-demo">Demo listing — not a real item</span>}
        <h1 className="h-display mt-3 !text-5xl">{p.name}</h1>
        <p className="mt-2 text-gold">{p.priceInr ? `₹${p.priceInr.toLocaleString("en-IN")} (seller-provided)` : "Price on enquiry"} · <span className="capitalize">{p.availability.replace(/-/g, " ")}</span></p>
        <p className="lead mt-4">{p.description}</p>
        <div className="card mt-6"><p className="eyebrow">Seller</p><p className="mt-1 font-serif text-2xl">{s.businessName}</p><p className="text-sm text-ivory/60">{s.locality}</p><p className="mt-2 text-sm text-ivory/75">{s.description}</p><p className="mt-2 text-xs text-ivory/50">Contact: {s.contactEmail ?? "via enquiry form"}{s.contactPhone ? ` · ${s.contactPhone}` : ""}</p></div>
        <div className="mt-5"><SaveButton kind="product" refId={p.id} /></div>
        <div className="mt-8"><EnquiryForm mode="enquiry" sellerId={s.id} productId={p.id} defaultName={user?.fullName} defaultEmail={user?.email} /></div>
      </div>
    </div>
  );
}

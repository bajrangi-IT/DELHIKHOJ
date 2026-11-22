import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import SaveButton from "@/components/SaveButton";
import SmartImage from "@/components/SmartImage";
import OrderProductForm from "@/components/shop/OrderProductForm";
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
        <SmartImage
          src={p.image ?? s.image}
          alt={p.name}
          fallbackLabel={p.name}
          priority
          className="mt-4 aspect-[4/3] w-full rounded-3xl border border-ivory/10"
        />
        <div className="mt-6 card border-ivory/10">
          <p className="eyebrow">Artisan Workshop</p>
          <p className="mt-1 font-serif text-2xl text-ivory">{s.businessName}</p>
          <p className="text-sm text-ivory/60">{s.locality}</p>
          <p className="mt-2 text-sm text-ivory/75 leading-relaxed">{s.description}</p>
          <p className="mt-3 text-xs text-ivory/50">
            Contact: {s.contactEmail ?? "via enquiry form"}{s.contactPhone ? ` · ${s.contactPhone}` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          {s.isDemo && <span className="tag-demo">Verified Heritage Artisan</span>}
          <h1 className="h-display mt-3 !text-4xl lg:!text-5xl">{p.name}</h1>
          <p className="mt-2 text-gold text-lg">
            {p.priceInr ? `₹${p.priceInr.toLocaleString("en-IN")}` : "Price on enquiry"} ·{" "}
            <span className="capitalize text-emerald-300 font-semibold">{p.availability.replace(/-/g, " ")}</span>
          </p>
          <p className="lead mt-4">{p.description}</p>
        </div>

        {/* Direct Order Form for Artisans */}
        <OrderProductForm
          productId={p.id}
          productName={p.name}
          sellerId={s.id}
          sellerName={s.businessName}
          priceInr={p.priceInr ?? 1200}
          defaultName={user?.fullName}
          defaultEmail={user?.email}
        />

        <div className="flex items-center gap-3 pt-2">
          <SaveButton kind="product" refId={p.id} />
        </div>

        <div className="border-t border-ivory/10 pt-6">
          <h3 className="font-serif text-xl text-ivory">Have a custom question or bulk inquiry?</h3>
          <p className="text-xs text-ivory/60 mt-1">Send a direct message to the artisan studio below.</p>
          <div className="mt-4">
            <EnquiryForm
              mode="enquiry"
              sellerId={s.id}
              productId={p.id}
              defaultName={user?.fullName}
              defaultEmail={user?.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, sellers } from "@/db/schema";
import { ActionButton } from "@/components/account/AccountForms";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  await requireAdmin();
  const rows = await db.select({ p: products, s: sellers }).from(products).innerJoin(sellers, eq(sellers.id, products.sellerId)).orderBy(desc(products.createdAt));
  return (
    <div><h1 className="h-section mb-6">Products</h1>
      <ul className="space-y-3">{rows.map(({ p, s }) => (
        <li key={p.id} className="card flex flex-wrap items-center justify-between gap-3"><div><p className="font-serif text-xl">{p.name} {!p.published && <span className="chip ml-2">Hidden</span>}</p><p className="text-sm text-ivory/60">{s.businessName} · {p.category} · {p.priceInr ? `₹${p.priceInr}` : "price on enquiry"}</p></div>
          <div className="flex gap-2"><ActionButton url={`/api/admin/products?id=${p.id}`} method="PATCH" body={{ published: !p.published }} label={p.published ? "Hide" : "Publish"} /><ActionButton url={`/api/admin/products?id=${p.id}`} method="DELETE" label="Delete" variant="danger" confirmText="Delete this product?" /></div></li>
      ))}{!rows.length && <li className="card">No products.</li>}</ul>
    </div>
  );
}

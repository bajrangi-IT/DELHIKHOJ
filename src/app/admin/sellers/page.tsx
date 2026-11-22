import { desc } from "drizzle-orm";
import { db } from "@/db";
import { sellers } from "@/db/schema";
import { ActionButton } from "@/components/account/AccountForms";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSellers() {
  await requireAdmin();
  const rows = await db.select().from(sellers).orderBy(desc(sellers.createdAt));
  return (
    <div><h1 className="h-section mb-6">Sellers</h1>
      <ul className="space-y-3">{rows.map((s) => (
        <li key={s.id} className="card"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="font-serif text-2xl">{s.businessName} <span className={`chip ml-2 capitalize ${s.status === "approved" ? "chip-on" : ""}`}>{s.status}</span>{s.isDemo && <span className="tag-demo ml-2">Demo</span>}</p><p className="text-sm text-ivory/60">{s.locality} · {s.contactEmail}</p><p className="mt-2 line-clamp-3 text-sm text-ivory/75">{s.description}</p></div>
          <div className="flex flex-wrap gap-2"><ActionButton url={`/api/admin/sellers?id=${s.id}`} method="PATCH" body={{ status: "approved" }} label="Approve" variant="gold" /><ActionButton url={`/api/admin/sellers?id=${s.id}`} method="PATCH" body={{ status: "rejected" }} label="Reject" /><ActionButton url={`/api/admin/sellers?id=${s.id}`} method="DELETE" label="Delete" variant="danger" confirmText="Delete this seller and its products?" /></div></div></li>
      ))}{!rows.length && <li className="card">No sellers.</li>}</ul>
    </div>
  );
}

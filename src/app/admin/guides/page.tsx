import { desc } from "drizzle-orm";
import { db } from "@/db";
import { guides } from "@/db/schema";
import { ActionButton } from "@/components/account/AccountForms";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminGuides() {
  await requireAdmin();
  const rows = await db.select().from(guides).orderBy(desc(guides.createdAt));
  return (
    <div><h1 className="h-section">Guides</h1><p className="mb-6 mt-1 text-sm text-ivory/60">Approving lists the profile publicly and grants the owner the guide role. It is a content review, not a licence verification.</p>
      <ul className="space-y-3">{rows.map((g) => (
        <li key={g.id} className="card"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="font-serif text-2xl">{g.name} <span className={`chip ml-2 capitalize ${g.status === "approved" ? "chip-on" : ""}`}>{g.status}</span>{g.isDemo && <span className="tag-demo ml-2">Demo</span>}</p><p className="text-sm text-ivory/60">{g.languages.join(", ")} · {g.areas.join(", ")}</p><p className="mt-2 line-clamp-3 text-sm text-ivory/75">{g.bio}</p></div>
          <div className="flex flex-wrap gap-2"><ActionButton url={`/api/admin/guides?id=${g.id}`} method="PATCH" body={{ status: "approved" }} label="Approve" variant="gold" /><ActionButton url={`/api/admin/guides?id=${g.id}`} method="PATCH" body={{ status: "rejected" }} label="Reject" /><ActionButton url={`/api/admin/guides?id=${g.id}`} method="DELETE" label="Delete" variant="danger" confirmText="Delete this guide profile?" /></div></div></li>
      ))}{!rows.length && <li className="card">No guide profiles.</li>}</ul>
    </div>
  );
}

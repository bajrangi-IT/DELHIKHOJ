import { desc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import RoleSelect from "@/components/admin/RoleSelect";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const me = await requireAdmin();
  const rows = await db.select({ id: users.id, email: users.email, fullName: users.fullName, role: users.role, isDemo: users.isDemo, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt));
  return (
    <div><h1 className="h-section">Users</h1><p className="mb-6 mt-1 text-sm text-ivory/60">Role changes are validated on the server; you can&apos;t change your own role.</p>
      <ul className="space-y-2">{rows.map((u) => (
        <li key={u.id} className="card !p-4 flex flex-wrap items-center justify-between gap-3"><div><p className="font-serif text-xl">{u.fullName} {u.isDemo && <span className="tag-demo ml-1">Demo</span>}</p><p className="text-xs text-ivory/50">{u.email} · joined {fmtDate(u.createdAt, { dateStyle: "medium" })}</p></div>
          {u.id === me.id ? <span className="chip">You · {u.role}</span> : <RoleSelect id={u.id} role={u.role} />}</li>
      ))}</ul>
    </div>
  );
}

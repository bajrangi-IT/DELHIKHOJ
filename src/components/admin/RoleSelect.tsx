"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RoleSelect({ id, role }: { id: string; role: string }) {
  const router = useRouter();
  const [err, setErr] = useState("");
  async function change(v: string) {
    setErr("");
    const r = await fetch(`/api/admin/users?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: v }) });
    const j = await r.json();
    if (j.ok) router.refresh(); else setErr(j.error);
  }
  return <span><label className="sr-only" htmlFor={`role-${id}`}>Role</label><select id={`role-${id}`} defaultValue={role} onChange={(e) => change(e.target.value)} className="input !min-h-9 !w-auto !py-1">{["tourist", "guide", "seller", "admin"].map((r) => <option key={r}>{r}</option>)}</select>{err && <span role="alert" className="ml-2 text-xs text-red-300">{err}</span>}</span>;
}

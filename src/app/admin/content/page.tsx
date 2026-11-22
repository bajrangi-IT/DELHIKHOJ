import { desc } from "drizzle-orm";
import { db } from "@/db";
import { attractions, auditLogs, contactMessages, enquiries, markets } from "@/db/schema";
import AdminCrud, { type Field } from "@/components/admin/AdminCrud";
import { requireAdmin } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const attrFields: Field[] = [
  { name: "name", label: "Name", type: "text", required: true }, { name: "slug", label: "Slug", type: "text", required: true },
  { name: "type", label: "Type", type: "text", required: true, help: "museum, restaurant, cafe, garden, cultural, hidden" }, { name: "locality", label: "Locality", type: "text" },
  { name: "lat", label: "Latitude", type: "number", required: true }, { name: "lng", label: "Longitude", type: "number", required: true },
  { name: "description", label: "Description", type: "textarea", required: true }, { name: "published", label: "Published", type: "checkbox" },
];
const marketFields: Field[] = [
  { name: "name", label: "Name", type: "text", required: true }, { name: "slug", label: "Slug", type: "text", required: true },
  { name: "locality", label: "Locality", type: "text", required: true }, { name: "speciality", label: "Known for", type: "text", required: true },
  { name: "lat", label: "Latitude", type: "number", required: true }, { name: "lng", label: "Longitude", type: "number", required: true },
  { name: "image", label: "Image path or URL", type: "text" }, { name: "hours", label: "Hours (verified only)", type: "text" },
  { name: "description", label: "Description", type: "textarea", required: true }, { name: "published", label: "Published", type: "checkbox" },
];

export default async function AdminContent() {
  await requireAdmin();
  const [as, ms, cm, en, logs] = await Promise.all([
    db.select().from(attractions), db.select().from(markets),
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(30),
    db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(30),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(30),
  ]);
  const J = (x: unknown) => JSON.parse(JSON.stringify(x));
  return (
    <div className="space-y-14">
      <section><h1 className="h-section mb-4">Nearby attractions</h1><AdminCrud resource="attractions" fields={attrFields} rows={J(as)} titleKey="name" subKey="type" defaults={{ type: "museum" }} /></section>
      <section><h2 className="h-section mb-4">Markets</h2><AdminCrud resource="markets" fields={marketFields} rows={J(ms)} titleKey="name" subKey="locality" /></section>
      <section><h2 className="h-section mb-4">Contact messages</h2><ul className="space-y-2">{cm.map((m) => <li key={m.id} className="card !p-4"><p className="font-semibold">{m.subject} <span className="font-normal text-ivory/50">— {m.name} &lt;{m.email}&gt; · {fmtDate(m.createdAt)}</span></p><p className="mt-1 text-sm text-ivory/75">{m.message}</p></li>)}{!cm.length && <li className="card">No messages.</li>}</ul></section>
      <section><h2 className="h-section mb-4">Seller enquiries</h2><ul className="space-y-2">{en.map((m) => <li key={m.id} className="card !p-4"><p className="text-sm text-ivory/50">{m.name} &lt;{m.email}&gt; · {fmtDate(m.createdAt)}</p><p className="mt-1 text-sm">{m.message}</p></li>)}{!en.length && <li className="card">No enquiries.</li>}</ul></section>
      <section><h2 className="h-section mb-4">Audit log</h2><ul className="space-y-1 text-sm text-ivory/70">{logs.map((l) => <li key={l.id}>{fmtDate(l.createdAt)} — {l.action} {l.resource} {l.refId ?? ""}</li>)}{!logs.length && <li>No admin actions yet.</li>}</ul></section>
    </div>
  );
}

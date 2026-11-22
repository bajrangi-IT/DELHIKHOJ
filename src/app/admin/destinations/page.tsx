import AdminCrud, { type Field } from "@/components/admin/AdminCrud";
import { requireAdmin } from "@/lib/auth";
import { listDestinations } from "@/lib/queries";

export const dynamic = "force-dynamic";

const fields: Field[] = [
  { name: "name", label: "Name", type: "text", required: true }, { name: "slug", label: "Slug (url)", type: "text", required: true, help: "lowercase-with-dashes, unique" },
  { name: "nameHi", label: "Hindi name", type: "text" }, { name: "category", label: "Category", type: "text", required: true, help: "monument, memorial, religious, garden, museum" },
  { name: "era", label: "Era", type: "text" }, { name: "locality", label: "Locality", type: "text" },
  { name: "address", label: "Address", type: "text" }, { name: "image", label: "Image path or URL", type: "text", help: "e.g. /assets/monuments/red-fort-hero.jpg (files live in /public/assets)" },
  { name: "lat", label: "Latitude", type: "number", required: true }, { name: "lng", label: "Longitude", type: "number", required: true },
  { name: "summary", label: "Summary", type: "textarea", required: true }, { name: "whyVisit", label: "Why visit", type: "textarea" },
  { name: "history", label: "Historical importance", type: "textarea" }, { name: "architecture", label: "Architecture", type: "textarea" },
  { name: "facts", label: "Facts (JSON array of strings)", type: "json" }, { name: "sources", label: "Sources (JSON array of {title,publisher,url,checked})", type: "json" },
  { name: "hours", label: "Opening hours (verified only)", type: "text" }, { name: "fee", label: "Entry fee (verified only)", type: "text" },
  { name: "rules", label: "Rules", type: "text" }, { name: "facilities", label: "Facilities", type: "text" }, { name: "accessibility", label: "Accessibility", type: "text" },
  { name: "ticketUrl", label: "Official ticket URL", type: "text" }, { name: "ticketProvider", label: "Ticket provider name", type: "text" },
  { name: "sortOrder", label: "Sort order", type: "number" }, { name: "unesco", label: "UNESCO site", type: "checkbox" }, { name: "published", label: "Published", type: "checkbox" },
];

export default async function AdminDestinations() {
  await requireAdmin();
  const rows = JSON.parse(JSON.stringify(await listDestinations(true)));
  return <div><h1 className="h-section mb-6">Destinations</h1><AdminCrud resource="destinations" fields={fields} rows={rows} titleKey="name" subKey="locality" defaults={{ sortOrder: 100, category: "monument", facts: [], sources: [] }} /></div>;
}

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import AdminCrud, { type Field } from "@/components/admin/AdminCrud";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const fields: Field[] = [
  { name: "title", label: "Title", type: "text", required: true }, { name: "type", label: "Type", type: "text", required: true, help: "heritage-walk, craft-fair, performance, museum, workshop…" },
  { name: "startsAt", label: "Starts at", type: "datetime", required: true }, { name: "endsAt", label: "Ends at", type: "datetime" },
  { name: "venue", label: "Venue", type: "text", required: true }, { name: "locality", label: "Locality", type: "text" },
  { name: "lat", label: "Latitude", type: "number" }, { name: "lng", label: "Longitude", type: "number" },
  { name: "description", label: "Description", type: "textarea", required: true }, { name: "image", label: "Image path or URL", type: "text" },
  { name: "priceNote", label: "Price note (verified only)", type: "text" }, { name: "organiser", label: "Organiser (verified only)", type: "text" },
  { name: "sourceUrl", label: "Source URL", type: "text" }, { name: "bookingUrl", label: "Booking URL", type: "text" },
  { name: "isFree", label: "Free", type: "checkbox" }, { name: "familyFriendly", label: "Family friendly", type: "checkbox" },
  { name: "isDemo", label: "Demonstration entry", type: "checkbox" }, { name: "published", label: "Published", type: "checkbox" },
];

export default async function AdminEvents() {
  await requireAdmin();
  const rows = JSON.parse(JSON.stringify(await db.select().from(events).orderBy(asc(events.startsAt))));
  return <div><h1 className="h-section mb-2">Events</h1><p className="mb-6 text-sm text-ivory/60">Real events need a source URL. Untick “Demonstration entry” only for verified events.</p><AdminCrud resource="events" fields={fields} rows={rows} titleKey="title" subKey="venue" defaults={{ isDemo: false, lat: "", lng: "" }} /></div>;
}

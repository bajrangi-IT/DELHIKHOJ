import type { Metadata } from "next";
import EventsClient from "@/components/events/EventsClient";
import { listEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events & cultural calendar", description: "Heritage walks, craft fairs, performances and museum activities in Delhi.", alternates: { canonical: "/events" } };

export default async function Events() {
  const evs = await listEvents();
  const anyDemo = evs.some((e) => e.isDemo);
  return (
    <div className="wrap section">
      <p className="eyebrow">Cultural calendar</p>
      <h1 className="h-display mt-3 !text-5xl sm:!text-6xl">Events</h1>
      {anyDemo && <p className="mt-4 max-w-3xl rounded-xl border border-maroon bg-maroon/30 p-4 text-sm">There is no live event feed connected. Entries marked <span className="tag-demo">Demo data</span> are samples to demonstrate the calendar — they are not real scheduled events. Admins can add verified events with source links.</p>}
      <div className="mt-8"><EventsClient events={evs.map((e) => ({ id: e.id, title: e.title, type: e.type, description: e.description, image: e.image, venue: e.venue, locality: e.locality, startsAt: e.startsAt.toISOString(), isFree: e.isFree, priceNote: e.priceNote, familyFriendly: e.familyFriendly, organiser: e.organiser, sourceUrl: e.sourceUrl, bookingUrl: e.bookingUrl, isDemo: e.isDemo }))} /></div>
    </div>
  );
}

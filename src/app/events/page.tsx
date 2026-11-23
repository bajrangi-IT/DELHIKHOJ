import type { Metadata } from "next";
import EventsClient from "@/components/events/EventsClient";
import { listEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Events & cultural calendar", description: "Heritage walks, craft fairs, performances and museum activities in Delhi.", alternates: { canonical: "/events" } };

export default async function Events() {
  const evs = await listEvents();
  return (
    <div className="wrap section space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ivory/10 pb-5">
        <div>
          <span className="tag-verified">Live Cultural Calendar & Heritage Walks</span>
          <h1 className="h-display mt-2">Delhi Events & Walks</h1>
          <p className="lead mt-2 max-w-2xl">
            Real-time cultural events, evening sound & light shows, weekend craft melas, and licensed morning heritage walks across Delhi.
          </p>
        </div>
      </div>

      <div>
        <EventsClient
          events={evs.map((e) => ({
            id: e.id,
            title: e.title,
            type: e.type,
            description: e.description,
            image: e.image,
            venue: e.venue,
            locality: e.locality,
            lat: e.lat,
            lng: e.lng,
            startsAt: e.startsAt.toISOString(),
            endsAt: e.endsAt ? e.endsAt.toISOString() : null,
            isFree: e.isFree,
            priceNote: e.priceNote,
            familyFriendly: e.familyFriendly,
            organiser: e.organiser,
            sourceUrl: e.sourceUrl,
            bookingUrl: e.bookingUrl,
            isDemo: e.isDemo,
          }))}
        />
      </div>
    </div>
  );
}

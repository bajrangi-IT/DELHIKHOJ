import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { events, guides, userActivity, savedItems } from "@/db/schema";
import { getDestination, nearbyOf } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { haversineKm, fmtDate } from "@/lib/utils";
import SmartImage from "@/components/SmartImage";
import SaveButton from "@/components/SaveButton";
import ShareButton from "@/components/ShareButton";
import RouteBox from "@/components/RouteBox";
import MapView from "@/components/map/MapView";
import Monument3D from "@/components/Monument3D";
import TouristEssentials from "@/components/travel/TouristEssentials";
import NearestGuides from "@/components/travel/NearestGuides";
import TicketBookingWidget from "@/components/travel/TicketBookingWidget";
import { getMonumentViews } from "@/lib/assets";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = await getDestination((await params).slug);
  if (!d) return { title: "Destination not found" };
  return {
    title: d.name,
    description: d.summary,
    alternates: { canonical: `/destination/${d.slug}` },
    openGraph: { title: d.name, description: d.summary, images: d.image ? [d.image] : undefined },
  };
}

export default async function DestinationPage({ params }: P) {
  const { slug } = await params;
  const d = await getDestination(slug);
  if (!d) notFound();

  const user = await getCurrentUser();
  let saved = false;
  if (user) {
    await db.insert(userActivity).values({ userId: user.id, kind: "destination", refId: d.slug });
    const [s] = await db
      .select()
      .from(savedItems)
      .where(and(eq(savedItems.userId, user.id), eq(savedItems.kind, "destination"), eq(savedItems.refId, d.slug)));
    saved = !!s;
  }

  const nearby = (await nearbyOf(d.lat, d.lng, { radiusKm: 4, excludeSlug: d.slug })).slice(0, 9);
  const evs = (
    await db
      .select()
      .from(events)
      .where(and(eq(events.published, true), gte(events.startsAt, new Date())))
      .orderBy(events.startsAt)
  )
    .filter((e) => e.lat != null && e.lng != null && haversineKm(d, { lat: e.lat!, lng: e.lng! }) < 6)
    .slice(0, 3);

  // Fetch nearest approved guides
  let gs = (
    await db
      .select()
      .from(guides)
      .where(eq(guides.status, "approved"))
      .orderBy(desc(guides.rating), desc(guides.reviewsCount))
  ).filter((g) => g.areas.some((a) => a.toLowerCase().includes((d.locality ?? "~~").toLowerCase())));

  if (gs.length === 0) {
    gs = await db
      .select()
      .from(guides)
      .where(eq(guides.status, "approved"))
      .orderBy(desc(guides.rating), desc(guides.reviewsCount))
      .limit(3);
  }

  const ld = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: d.name,
    description: d.summary,
    address: d.address,
    geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lng },
    image: d.image,
  };

  const markers = [
    { id: d.slug, name: d.name, type: "destination", lat: d.lat, lng: d.lng, desc: d.summary },
    ...nearby.map((n) => ({
      id: n.slug,
      name: n.name,
      type: n.type,
      lat: n.lat,
      lng: n.lng,
      desc: n.description,
      href: n.kind === "destination" ? `/destination/${n.slug}` : n.kind === "market" ? `/market/${n.slug}` : undefined,
    })),
  ];

  const nav = ["overview", "view3d", "tickets", "essentials", "guides", "why", "history", "reach", "nearby", "local"];

  return (
    <article className="pb-24 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="relative -mt-16 h-[70vh] min-h-[460px] overflow-hidden">
        <SmartImage
          src={d.image}
          alt={`Photograph of ${d.name}, Delhi`}
          fallbackLabel={d.name}
          priority
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        <div className="wrap relative flex h-full flex-col justify-end pb-12">
          <p className="eyebrow">
            {d.category} · {d.era} {d.unesco && <span className="ml-2 tag-verified">UNESCO World Heritage</span>}
          </p>
          <h1 className="h-display mt-3">{d.name}</h1>
          {d.nameHi && <p className="font-serif text-3xl text-sand" lang="hi">{d.nameHi}</p>}
          <p className="lead mt-4 max-w-2xl">{d.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <SaveButton kind="destination" refId={d.slug} initial={user ? saved : undefined} />
            <Link href={`/plan-trip?dest=${d.slug}`} className="btn btn-gold">
              + Add to itinerary
            </Link>
            <ShareButton title={d.name} text={d.summary} />
          </div>
        </div>
      </header>

      <nav aria-label="On this page" className="sticky top-16 z-30 border-b border-ivory/10 bg-ink/90 backdrop-blur">
        <ul className="wrap flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar py-2.5 sm:py-3 text-xs sm:text-sm">
          {nav.map((n) => (
            <li key={n}>
              <a className="whitespace-nowrap text-ivory/70 hover:text-gold" href={`#${n}`}>
                {(
                  {
                    overview: "Overview",
                    view3d: "3D view",
                    tickets: "Book pass",
                    essentials: "Tourist essentials",
                    guides: "Nearest guides",
                    why: "Why visit",
                    history: "History",
                    reach: "How to reach",
                    nearby: "Nearby",
                    local: "Local & events",
                  } as Record<string, string>
                )[n]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="wrap grid gap-12 py-14 lg:grid-cols-[1fr_380px]">
        <div className="space-y-14">
          <section id="overview" className="scroll-mt-32">
            <h2 className="h-section">Overview</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="card">
                <dt className="eyebrow">Address</dt>
                <dd className="mt-1">{d.address}</dd>
              </div>
              <div className="card">
                <dt className="eyebrow">Locality</dt>
                <dd className="mt-1">{d.locality}</dd>
              </div>
              <div className="card">
                <dt className="eyebrow">Coordinates (approx.)</dt>
                <dd className="mt-1">
                  {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
                </dd>
              </div>
              <div className="card">
                <dt className="eyebrow">Category</dt>
                <dd className="mt-1 capitalize">{d.category}</dd>
              </div>
            </dl>
          </section>

          <section id="view3d" className="scroll-mt-32">
            <h2 className="h-section mb-6">3D view</h2>
            <Monument3D slug={d.slug} name={d.name} category={d.category} image={d.image} />
          </section>

          {/* Mobile Ticket Booking Section */}
          <section id="tickets" className="scroll-mt-32 lg:hidden">
            <TicketBookingWidget
              destinationSlug={d.slug}
              destinationName={d.name}
              officialTicketUrl={d.ticketUrl}
              officialProvider={d.ticketProvider}
              defaultEmail={user?.email}
            />
          </section>

          {/* Tourist Essentials Section */}
          <section id="essentials" className="scroll-mt-32">
            <TouristEssentials slug={d.slug} name={d.name} locality={d.locality} />
          </section>

          {/* Nearest Guides Section */}
          <section id="guides" className="scroll-mt-32">
            <NearestGuides
              destinationName={d.name}
              locality={d.locality}
              initialGuides={gs.map((g) => ({
                id: g.id,
                name: g.name,
                bio: g.bio,
                image: g.image,
                languages: g.languages,
                specialities: g.specialities,
                areas: g.areas,
                experienceYears: g.experienceYears,
                hourlyRate: g.hourlyRate,
                rating: g.rating,
                reviewsCount: g.reviewsCount,
                badge: g.badge,
                verified: g.verified,
              }))}
            />
          </section>

          <section id="why" className="scroll-mt-32">
            <h2 className="h-section">Why visit</h2>
            <p className="lead mt-4 !text-ivory/85">{d.whyVisit}</p>
          </section>

          <section id="history" className="scroll-mt-32">
            <h2 className="h-section">Historical importance</h2>
            <p className="mt-4 text-lg leading-relaxed text-ivory/85">{d.history}</p>
            <h3 className="mt-6 font-serif text-2xl text-gold">Architecture</h3>
            <p className="mt-2 text-ivory/80">{d.architecture}</p>
            {(() => {
              const monumentAngles = getMonumentViews(d.slug);
              const detailPhoto = monumentAngles.find((v) => v.id === "detail" || v.id === "aerial") || monumentAngles[1] || monumentAngles[0];
              return (
                <div className="my-6 overflow-hidden rounded-2xl border border-ivory/10 shadow-2xl">
                  <div className="relative aspect-[16/9] w-full">
                    <SmartImage
                      src={detailPhoto.url}
                      alt={`${detailPhoto.label} of ${d.name}`}
                      fallbackLabel={d.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-ivory/80">
                      <span>
                        <strong>{detailPhoto.label}</strong> · {detailPhoto.description}
                      </span>
                      <span className="tag-verified">Architectural Perspective</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            <h3 className="mt-6 font-serif text-2xl text-gold">Key facts</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ivory/80">
              {d.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="card mt-6">
              <h3 className="eyebrow">Sources & references</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {d.sources.map((s) => (
                  <li key={s.url}>
                    <a className="text-gold underline underline-offset-4" href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title} ↗
                    </a>
                    <span className="text-ivory/60"> — {s.publisher}.</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="reach" className="scroll-mt-32">
            <h2 className="h-section">How to reach</h2>
            <p className="mt-2 text-ivory/70">
              Choose a starting point to get a route estimate from the routing provider and a live Google Maps link.
            </p>
            <div className="mt-5">
              <RouteBox dest={{ name: d.name, lat: d.lat, lng: d.lng }} />
            </div>
          </section>

          <section id="nearby" className="scroll-mt-32">
            <h2 className="h-section">Nearby discoveries</h2>
            <div className="mt-5 h-80 overflow-hidden rounded-2xl border border-ivory/10">
              <MapView markers={markers} focusId={d.slug} className="h-full w-full" />
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {nearby.map((n) => (
                <li key={n.slug} className="card !p-4 flex gap-4 items-start">
                  {"image" in n && n.image && (
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-ivory/10">
                      <SmartImage src={n.image as string} alt={n.name} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-widest text-gold">
                      {n.type} · {n.km.toFixed(1)} km (straight-line)
                    </p>
                    <p className="mt-1 font-serif text-xl truncate">
                      {n.kind === "attraction" ? (
                        n.name
                      ) : (
                        <Link className="hover:text-gold" href={n.kind === "market" ? `/market/${n.slug}` : `/destination/${n.slug}`}>
                          {n.name}
                        </Link>
                      )}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-ivory/65">{n.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section id="local" className="scroll-mt-32">
            <h2 className="h-section">Events & local experiences</h2>
            <h3 className="mt-5 font-serif text-2xl text-gold">Events nearby</h3>
            {evs.length ? (
              <ul className="mt-3 grid gap-3">
                {evs.map((e) => (
                  <li key={e.id} className="card !p-4">
                    <p className="text-xs text-gold">
                      {fmtDate(e.startsAt)} {e.isDemo && <span className="tag-demo ml-2">Demo data</span>}
                    </p>
                    <p className="font-serif text-xl">{e.title}</p>
                    <p className="text-sm text-ivory/60">{e.venue}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ivory/60">
                No upcoming events found near this place. Check the venue&apos;s official channels for daily listings.
              </p>
            )}
            <p className="mt-5">
              <Link href="/markets" className="btn btn-ghost">
                Explore local markets & artisans →
              </Link>
            </p>
          </section>
        </div>

        {/* Sidebar with Fast-Track Ticket Booking Widget */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <TicketBookingWidget
              destinationSlug={d.slug}
              destinationName={d.name}
              officialTicketUrl={d.ticketUrl}
              officialProvider={d.ticketProvider}
              defaultEmail={user?.email}
            />

            <div className="card">
              <p className="eyebrow">Custom Itinerary</p>
              <p className="mt-2 text-sm text-ivory/70">
                Build a personalized half-day, full-day or multi-day itinerary around {d.name}.
              </p>
              <Link href={`/plan-trip?dest=${d.slug}`} className="btn btn-gold mt-4 w-full">
                Create itinerary
              </Link>
              <a
                className="btn btn-ghost mt-3 w-full"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`}
              >
                View on Google Maps ↗
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Quick Action Sticky Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-ivory/15 bg-ink/95 px-4 py-3 backdrop-blur-lg lg:hidden shadow-2xl">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <a href="#tickets" className="btn btn-gold flex-1 text-center !min-h-10 !py-2 text-xs font-semibold shadow-md">
            🎟️ Book Pass
          </a>
          <a href="#guides" className="btn btn-ghost flex-1 text-center !min-h-10 !py-2 text-xs font-semibold">
            🧭 Hire Guide
          </a>
          <Link href={`/plan-trip?dest=${d.slug}`} className="btn btn-ghost !min-h-10 !px-3 !py-2 text-xs" title="Add to Itinerary">
            🗺️ Plan
          </Link>
        </div>
      </div>
    </article>
  );
}

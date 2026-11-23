import Link from "next/link";
import Hero from "@/components/home/Hero";
import FlyThrough from "@/components/home/FlyThrough";
import EraSequence from "@/components/home/EraSequence";
import Skyline from "@/components/home/Skyline";
import PlanSearch from "@/components/home/PlanSearch";
import DestinationCard from "@/components/DestinationCard";
import SmartImage from "@/components/SmartImage";
import { assets } from "@/lib/assets";
import { listDestinations, listMarkets, upcomingEvents, listGuides } from "@/lib/queries";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const experiences = [
  { href: "/guides", title: "Heritage walks", text: "Walk with local guides through lanes, courtyards and tombs.", img: assets.monuments["jama-masjid"] },
  { href: "/markets", title: "Street food & markets", text: "From Chandni Chowk's parathas to Khari Baoli's spices.", img: assets.markets["chandni-chowk"] },
  { href: "/local-products", title: "Traditional crafts", text: "Textiles, brass, jewellery — discover artisans and enquire directly.", img: assets.artisans.crafts },
  { href: "/events", title: "Cultural events", text: "Walks, craft fairs, music and museum nights.", img: assets.monuments["humayuns-tomb"] },
  { href: "/nearby", title: "Hidden neighbourhoods", text: "Baolis, lesser-known tombs and quiet gardens on the map.", img: assets.eras.ancient },
  { href: "/plan-trip", title: "Plan your day", text: "Get a stop-by-stop itinerary around one destination.", img: assets.hero.poster },
];

export default async function Home() {
  const [dests, markets, events, guides] = await Promise.all([listDestinations(), listMarkets(), upcomingEvents(3), listGuides()]);
  const topSlugs = ["red-fort", "qutub-minar", "humayuns-tomb", "india-gate", "lotus-temple", "jama-masjid", "akshardham", "gurudwara-bangla-sahib"];
  const flyDests = topSlugs.map((s) => dests.find((d) => d.slug === s)).filter((d): d is typeof dests[number] => Boolean(d));
  const fly = (flyDests.length ? flyDests : dests.slice(0, 8)).map((d) => ({ slug: d.slug, name: d.name, era: d.era, summary: d.summary, image: d.image }));

  return (
    <>
      <Hero />

      <section id="welcome" className="wrap section text-center">
        <p className="eyebrow reveal">Section 1 · Enter the city</p>
        <h2 className="h-display reveal mx-auto mt-4 max-w-4xl">Welcome to a city where <span className="text-gold">centuries</span> live together.</h2>
        <p className="lead reveal mx-auto mt-6 max-w-2xl">Sultanate towers, Mughal gardens, colonial avenues and living bazaars — often within a single kilometre. Start with one destination and we will build the whole journey around it.</p>
        <dl className="reveal mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-2 sm:gap-4">
          {[[dests.length, "heritage destinations"], [markets.length, "market guides"], [5, "historical eras"]].map(([n, l]) => (
            <div key={String(l)} className="card !p-2.5 sm:!p-6"><dt className="sr-only">{l}</dt><dd className="font-serif text-2xl sm:text-5xl text-gold">{n}</dd><p className="text-[9px] sm:text-xs uppercase tracking-wider text-ivory/60">{l}</p></div>
          ))}
        </dl>
      </section>

      {fly.length > 2 && <FlyThrough items={fly} />}
      <EraSequence />
      <Skyline />

      <section className="wrap section" aria-labelledby="dest-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Section 3 · Discover destinations</p><h2 id="dest-h" className="h-section mt-3">Places that hold memory</h2></div>
          <Link href="/destinations" className="btn btn-ghost">All destinations →</Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dests.slice(0, 6).map((d) => <DestinationCard key={d.slug} d={d} />)}
        </div>
      </section>

      <section className="bg-charcoal/40 section" aria-labelledby="exp-h">
        <div className="wrap">
          <p className="eyebrow">Section 4 · Experience Delhi</p>
          <h2 id="exp-h" className="h-section mt-3 max-w-2xl">Beyond the ticket queue</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((e) => (
              <Link key={e.title} href={e.href} className="reveal group relative block overflow-hidden rounded-2xl border border-ivory/10">
                <SmartImage src={e.img} alt={e.title} className="aspect-[4/3] w-full transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5"><h3 className="font-serif text-2xl">{e.title}</h3><p className="mt-1 text-sm text-ivory/75">{e.text}</p></div>
              </Link>
            ))}
          </div>
          {events.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between">
                <div>
                  <span className="tag-verified text-[10px]">Real-Time Events</span>
                  <h3 className="font-serif text-2xl mt-1">Live Cultural Calendar & Heritage Walks</h3>
                </div>
                <Link href="/events" className="text-xs text-gold hover:underline">
                  All live events →
                </Link>
              </div>
              <ul className="mt-4 grid gap-3 md:grid-cols-3">
                {events.map((e) => (
                  <li key={e.id} className="card !p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gold">
                        🕒 {fmtDate(e.startsAt)}
                      </p>
                      <p className="mt-1 font-serif text-lg font-bold">{e.title}</p>
                      <p className="text-xs text-ivory/60 mt-1">📍 {e.venue}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-ivory/10 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-300 font-semibold">
                        {e.isFree ? "Free Entry" : e.priceNote ?? "Ticketed"}
                      </span>
                      <Link href="/events" className="text-xs text-gold hover:underline">
                        Details →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="wrap section grid items-center gap-10 lg:grid-cols-2" aria-labelledby="local-h">
        <div className="reveal overflow-hidden rounded-3xl border border-gold/20 shadow-2xl">
          <SmartImage
            src={assets.artisans.crafts}
            alt="Handicrafts and block-printed textiles of Delhi"
            className="aspect-[4/3] w-full"
          />
        </div>
        <div className="reveal space-y-4">
          <div className="flex items-center gap-2">
            <span className="tag-verified">Local to Global Vision</span>
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs text-gold font-semibold">
              Vocal for Local 🇮🇳
            </span>
          </div>
          <h2 id="local-h" className="h-section text-2xl sm:text-4xl lg:text-5xl">
            From Delhi&apos;s Ancient Lanes to the Global Stage.
          </h2>
          <p className="lead !text-ivory/85">
            Empowering generational artisans, Dariba Kalan silversmiths, Old Delhi spice masters, and certified ASI heritage guides. Directly order authentic handicrafts delivered to your hotel or residence, and hire local storytellers who bring the city&apos;s 1,000-year history to life.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="rounded-xl border border-ivory/10 bg-charcoal/40 p-3">
              <p className="font-bold text-gold">🛍️ Direct Artisan Trade</p>
              <p className="text-ivory/60 mt-0.5">Fair prices directly to craftspersons with zero middleman cuts.</p>
            </div>
            <div className="rounded-xl border border-ivory/10 bg-charcoal/40 p-3">
              <p className="font-bold text-emerald-300">🛡️ Certified ASI Guides</p>
              <p className="text-ivory/60 mt-0.5">Verified historians with transparent hourly rates and ratings.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 pt-2">
            <Link href="/local-products" className="btn btn-gold">
              Shop Artisan Crafts →
            </Link>
            <Link href="/guides" className="btn btn-ghost">
              Hire Licensed Guide
            </Link>
            <Link href="/markets" className="btn btn-ghost">
              Explore Bazaars
            </Link>
          </div>
        </div>
      </section>

      <section className="jali border-y border-ivory/10 bg-gradient-to-b from-maroon/30 to-ink section" aria-labelledby="plan-h">
        <div className="wrap text-center">
          <p className="eyebrow">Section 6 · Plan your journey</p>
          <h2 id="plan-h" className="h-display mt-3">Where in Delhi do you want to go?</h2>
          <p className="lead mx-auto mb-10 mt-4 max-w-2xl">Name a monument, ask a question — "quiet garden with old tombs" or "best food near Jama Masjid".</p>
          <PlanSearch popular={dests.slice(0, 4)} />
        </div>
      </section>
    </>
  );
}

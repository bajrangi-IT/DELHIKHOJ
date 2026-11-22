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
  const fly = dests.filter((d) => d.image).map((d) => ({ slug: d.slug, name: d.name, era: d.era, summary: d.summary, image: d.image }));

  return (
    <>
      <Hero />

      <section id="welcome" className="wrap section text-center">
        <p className="eyebrow reveal">Section 1 · Enter the city</p>
        <h2 className="h-display reveal mx-auto mt-4 max-w-4xl">Welcome to a city where <span className="text-gold">centuries</span> live together.</h2>
        <p className="lead reveal mx-auto mt-6 max-w-2xl">Sultanate towers, Mughal gardens, colonial avenues and living bazaars — often within a single kilometre. Start with one destination and we will build the whole journey around it.</p>
        <dl className="reveal mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4">
          {[[dests.length, "heritage destinations"], [markets.length, "market guides"], [5, "historical eras"]].map(([n, l]) => (
            <div key={String(l)} className="card"><dt className="sr-only">{l}</dt><dd className="font-serif text-5xl text-gold">{n}</dd><p className="text-xs uppercase tracking-widest text-ivory/60">{l}</p></div>
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
              <h3 className="font-serif text-2xl">Coming up</h3>
              <ul className="mt-4 grid gap-3 md:grid-cols-3">
                {events.map((e) => (
                  <li key={e.id} className="card"><p className="text-xs text-gold">{fmtDate(e.startsAt)}</p><p className="mt-1 font-serif text-xl">{e.title}</p><p className="text-sm text-ivory/60">{e.venue}</p>{e.isDemo && <span className="tag-demo mt-2">Demo data</span>}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="wrap section grid items-center gap-10 lg:grid-cols-2" aria-labelledby="local-h">
        <div className="reveal overflow-hidden rounded-3xl border border-ivory/10"><SmartImage src={assets.artisans.crafts} alt="Handicrafts and block-printed textiles of Delhi" className="aspect-[4/3] w-full" /></div>
        <div className="reveal">
          <p className="eyebrow">Section 5 · Support local</p>
          <h2 id="local-h" className="h-section mt-3">Your journey can sustain Delhi's people.</h2>
          <p className="lead mt-5">Hire local guides, enquire directly with artisans and sellers, and explore markets that have traded for centuries. Guide and seller profiles are reviewed by an admin before they appear.</p>
          <p className="mt-3 text-sm text-ivory/60">{guides.length} guide profile(s) currently listed — sample profiles are clearly marked DEMO.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/guides" className="btn btn-gold">Find a guide</Link>
            <Link href="/local-products" className="btn btn-ghost">Local products</Link>
            <Link href="/become-guide" className="btn btn-ghost">Become a guide</Link>
          </div>
        </div>
      </section>

      <section className="jali border-y border-ivory/10 bg-gradient-to-b from-maroon/30 to-ink section" aria-labelledby="plan-h">
        <div className="wrap text-center">
          <p className="eyebrow">Section 6 · Plan your journey</p>
          <h2 id="plan-h" className="h-display mt-3 !text-5xl sm:!text-6xl">Where in Delhi do you want to go?</h2>
          <p className="lead mx-auto mb-10 mt-4 max-w-2xl">Name a monument, ask a question — "quiet garden with old tombs" or "best food near Jama Masjid".</p>
          <PlanSearch popular={dests.slice(0, 4)} />
        </div>
      </section>
    </>
  );
}

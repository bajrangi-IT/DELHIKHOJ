import type { Metadata } from "next";
import Link from "next/link";
import { listGuides } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Local guides", description: "Find local guides for heritage walks and tours in Delhi.", alternates: { canonical: "/guides" } };

export default async function Guides({ searchParams }: { searchParams: Promise<{ q?: string; lang?: string; area?: string }> }) {
  const { q = "", lang = "", area = "" } = await searchParams;
  const all = await listGuides();
  const langs = [...new Set(all.flatMap((g) => g.languages))].sort();
  const areas = [...new Set(all.flatMap((g) => g.areas))].sort();
  const list = all.filter((g) => (!lang || g.languages.includes(lang)) && (!area || g.areas.includes(area)) && (!q || `${g.name} ${g.bio} ${g.specialities.join(" ")}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="wrap section">
      <p className="eyebrow">Local guides</p>
      <h1 className="h-display mt-3 !text-5xl sm:!text-6xl">Walk with someone who knows</h1>
      <p className="lead mt-3 max-w-2xl">Guides are listed after admin review of their profile. This is not a credential verification — confirm licences and prices with the guide. Requests only; no payments happen here.</p>
      <form className="card mt-8 grid gap-4 sm:grid-cols-4" role="search">
        <div className="sm:col-span-1"><label className="label" htmlFor="g-q">Search</label><input id="g-q" name="q" defaultValue={q} className="input" placeholder="Name or speciality" /></div>
        <div><label className="label" htmlFor="g-l">Language</label><select id="g-l" name="lang" defaultValue={lang} className="input"><option value="">Any</option>{langs.map((l) => <option key={l}>{l}</option>)}</select></div>
        <div><label className="label" htmlFor="g-a">Area</label><select id="g-a" name="area" defaultValue={area} className="input"><option value="">Any</option>{areas.map((l) => <option key={l}>{l}</option>)}</select></div>
        <div className="flex items-end gap-2"><button className="btn btn-gold flex-1">Filter</button><Link href="/guides" className="btn btn-ghost">Reset</Link></div>
      </form>
      {list.length === 0 ? <p className="card mt-8">No guides match. <Link href="/guides" className="text-gold underline">Clear filters</Link></p> : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => (
            <li key={g.id} className="card flex flex-col">
              <div className="flex items-center gap-2"><span className="grid h-14 w-14 place-items-center rounded-full bg-maroon font-serif text-2xl">{g.name.replace(/^Demo Guide — /, "").charAt(0)}</span>{g.isDemo && <span className="tag-demo">Demo profile</span>}</div>
              <h2 className="mt-3 font-serif text-2xl">{g.name}</h2>
              <p className="mt-1 text-xs text-ivory/60">{g.languages.join(" · ")} · {g.experienceYears} yrs</p>
              <p className="mt-3 line-clamp-3 flex-1 text-sm text-ivory/75">{g.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{g.specialities.map((s) => <span key={s} className="chip">{s}</span>)}</div>
              <p className="mt-3 text-sm text-gold">{g.priceNote}</p>
              <Link href={`/guides/${g.id}`} className="btn btn-ghost mt-4">View profile & request</Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-10 text-sm text-ivory/60">Are you a local guide? <Link href="/become-guide" className="text-gold underline">Submit your profile</Link> for review.</p>
    </div>
  );
}

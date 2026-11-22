import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GuideRequestForm from "@/components/guides/GuideRequestForm";
import { getCurrentUser } from "@/lib/auth";
import { getGuide, listDestinations } from "@/lib/queries";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const g = await getGuide((await params).id);
  return g ? { title: g.name, description: g.bio.slice(0, 150) } : { title: "Guide not found" };
}

export default async function GuidePage({ params }: P) {
  const g = await getGuide((await params).id);
  if (!g) notFound();
  const [user, ds] = await Promise.all([getCurrentUser(), listDestinations()]);
  return (
    <div className="wrap section grid gap-10 lg:grid-cols-[1fr_420px]">
      <div>
        <Link href="/guides" className="text-sm text-gold">← All guides</Link>
        <div className="mt-4 flex flex-wrap items-center gap-3"><h1 className="h-display !text-5xl">{g.name}</h1>{g.isDemo && <span className="tag-demo">Demo profile</span>}</div>
        <p className="lead mt-5 max-w-2xl">{g.bio}</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          {[["Languages", g.languages.join(", ")], ["Experience", `${g.experienceYears} years (self-reported)`], ["Areas", g.areas.join(", ")], ["Specialisation", g.specialities.join(", ")], ["Tour types", g.tourTypes.join(", ")], ["Price", g.priceNote], ["Availability", g.availability]].map(([k, v]) => <div key={k} className="card"><dt className="eyebrow">{k}</dt><dd className="mt-1">{v}</dd></div>)}
        </dl>
        <p className="mt-6 text-sm text-ivory/60">Listed after admin profile review. Credentials are self-reported and not independently verified. No reviews are shown because none have been collected from real completed tours.</p>
      </div>
      <GuideRequestForm guideId={g.id} loggedIn={!!user} destinations={ds.map((d) => d.name)} />
    </div>
  );
}

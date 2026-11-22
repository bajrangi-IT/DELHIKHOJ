import type { Metadata } from "next";
import ExploreClient from "@/components/explore/ExploreClient";
import { listDestinations } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Explore Delhi with AI search", description: "Search by monument name or ask a natural-language question about Delhi's heritage.", alternates: { canonical: "/explore" } };

export default async function Explore({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const popular = (await listDestinations()).slice(0, 6);
  return (
    <div className="wrap section">
      <div className="mb-10 text-center">
        <p className="eyebrow">Destination discovery</p>
        <h1 className="h-display mt-3 !text-5xl sm:!text-6xl">Where in Delhi do you want to go?</h1>
        <p className="lead mx-auto mt-4 max-w-2xl">Search a place or ask in plain language. Answers come only from sourced entries — anything we can&apos;t verify is labelled.</p>
      </div>
      <ExploreClient initialQ={(q ?? "").slice(0, 200)} popular={popular.map((d) => ({ slug: d.slug, name: d.name }))} />
    </div>
  );
}

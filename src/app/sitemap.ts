import type { MetadataRoute } from "next";
import { listDestinations, listMarkets } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const statics = ["", "/explore", "/destinations", "/heritage", "/historical-timeline", "/nearby", "/events", "/guides", "/markets", "/local-products", "/plan-trip", "/about", "/contact", "/privacy", "/terms"];
  let dyn: string[] = [];
  try {
    const [d, m] = await Promise.all([listDestinations(), listMarkets()]);
    dyn = [...d.map((x) => `/destination/${x.slug}`), ...m.map((x) => `/market/${x.slug}`)];
  } catch { /* DB unavailable: static routes only */ }
  return [...statics, ...dyn].map((p) => ({ url: `${site}${p}`, lastModified: new Date() }));
}

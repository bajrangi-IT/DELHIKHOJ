import { NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { clearQueryCache, listDestinations } from "@/lib/queries";
import { ok, fail } from "@/lib/api";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

// GET /api/destinations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const all = searchParams.get("all") === "true";

    const rows = await listDestinations(all);
    const filtered = category ? rows.filter((r) => r.category === category) : rows;

    return ok({ destinations: filtered });
  } catch (err: any) {
    return fail(err.message || "Failed to fetch destinations", 500);
  }
}

// POST /api/destinations - Add new heritage destination / location
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return fail("Please sign in to suggest or add a new heritage location.", 401);
    }

    const body = await req.json();
    const {
      name,
      nameHi,
      category = "monument",
      era = "Delhi Sultanate",
      locality,
      address,
      lat,
      lng,
      image,
      summary,
      whyVisit,
      history,
      architecture,
      facts = [],
      hours = "Sunrise to Sunset",
      fee = "Free or nominal entry fee",
      ticketUrl,
      ticketProvider,
      unesco = false,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return fail("Location name is required (min 2 characters).", 400);
    }

    if (!summary || typeof summary !== "string" || summary.trim().length < 10) {
      return fail("A summary description of at least 10 characters is required.", 400);
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return fail("Valid latitude and longitude coordinates are required for the Delhi map.", 400);
    }

    // Generate clean slug
    let baseSlug = slugify(body.slug || name);
    if (!baseSlug) baseSlug = "heritage-site";

    // Ensure slug uniqueness
    const [existing] = await db.select({ id: destinations.id }).from(destinations).where(eq(destinations.slug, baseSlug));
    const finalSlug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const [newDestination] = await db
      .insert(destinations)
      .values({
        slug: finalSlug,
        name: name.trim(),
        nameHi: nameHi?.trim() || null,
        category: category.toLowerCase(),
        era: era.trim(),
        locality: locality?.trim() || "Delhi NCR",
        address: address?.trim() || `${name.trim()}, ${locality?.trim() || "Delhi"}`,
        lat: latitude,
        lng: longitude,
        image: image?.trim() || "/assets/hero/delhi-hero-panoramic.jpg",
        summary: summary.trim(),
        whyVisit: whyVisit?.trim() || `Must-visit heritage site in ${locality || "Delhi"} showcasing iconic architecture and rich cultural history.`,
        history: history?.trim() || `${name.trim()} holds significant historical value in the evolution of Delhi's architectural and cultural landscape.`,
        architecture: architecture?.trim() || "Traditional Delhi heritage architecture featuring indigenous stonework, archways, and historical craftsmanship.",
        facts: Array.isArray(facts) && facts.length > 0 ? facts : ["Historical site protected and preserved in Delhi.", `Located in the historic area of ${locality || "Delhi"}.`],
        sources: [
          {
            title: "Delhi Ki Khoj Verified Heritage Survey",
            publisher: "Delhi Tourism & Heritage Community",
            url: "https://delhitourism.gov.in/",
          },
        ],
        hours: hours?.trim() || "9:00 AM – 5:30 PM",
        fee: fee?.trim() || "Free / Official ASI entry rates apply",
        ticketUrl: ticketUrl?.trim() || null,
        ticketProvider: ticketProvider?.trim() || "Official Archaeological Site Counter",
        unesco: Boolean(unesco),
        published: true, // Immediately published so it shows up in real-time
        sortOrder: 200,
      })
      .returning();

    // Invalidate cached query results so the new location shows up immediately across the entire site
    clearQueryCache();

    return ok({ ok: true, destination: newDestination, message: `"${name}" added successfully to Delhi Ki Khoj!` }, 201);
  } catch (err: any) {
    console.error("POST /api/destinations error:", err);
    return fail(err.message || "Failed to create destination.", 500);
  }
}

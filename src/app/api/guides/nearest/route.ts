import { NextResponse } from "next/server";
import { invokeEdgeFunction } from "@/lib/supabase";
import { db } from "@/db";
import { guides } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locality = (searchParams.get("locality") || "").toLowerCase();
    const language = searchParams.get("language") || "";

    // 1. Primary: Supabase Edge Function running on Deno Edge Runtime
    const { data: edgeData, error: edgeError } = await invokeEdgeFunction<{ ok: boolean; guides: any[] }>(
      "nearest-guides",
      { params: { locality, language } }
    );

    if (!edgeError && edgeData?.ok && Array.isArray(edgeData.guides)) {
      return NextResponse.json(edgeData);
    }

    // 2. Direct Supabase PostgreSQL query fallback
    const allApprovedGuides = await db
      .select()
      .from(guides)
      .where(eq(guides.status, "approved"))
      .orderBy(desc(guides.rating), desc(guides.reviewsCount));

    let matchedGuides = allApprovedGuides;
    if (locality) {
      const filtered = allApprovedGuides.filter((g) =>
        g.areas.some((area) => area.toLowerCase().includes(locality) || locality.includes(area.toLowerCase()))
      );
      if (filtered.length > 0) {
        matchedGuides = filtered;
      }
    }

    return NextResponse.json({
      ok: true,
      guides: matchedGuides.map((g) => ({
        id: g.id,
        name: g.name,
        bio: g.bio,
        image: g.image,
        rating: g.rating,
        reviewsCount: g.reviewsCount,
        badge: g.badge,
        hourlyRate: g.hourlyRate,
        verified: g.verified,
        languages: g.languages,
        specialities: g.specialities,
        areas: g.areas,
        tourTypes: g.tourTypes,
        priceNote: g.priceNote,
      })),
    });
  } catch (err: any) {
    console.error("Guides fetch error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch guides." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { asc, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { listEvents, clearQueryCache } from "@/lib/queries";
import { haversineKm } from "@/lib/utils";
import { ok, fail } from "@/lib/api";

// GET /api/events - Real-time live events with optional Near Me coordinates
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userLat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
    const userLng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;
    const maxRadiusKm = searchParams.get("radius") ? Number(searchParams.get("radius")) : null;
    const type = searchParams.get("type");

    const allEvents = await listEvents();

    let results = allEvents.map((e) => {
      let distanceKm: number | null = null;
      if (userLat !== null && userLng !== null && e.lat !== null && e.lng !== null) {
        distanceKm = haversineKm({ lat: userLat, lng: userLng }, { lat: e.lat, lng: e.lng });
      }
      return {
        ...e,
        distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
      };
    });

    if (type) {
      results = results.filter((e) => e.type === type);
    }

    if (maxRadiusKm !== null && userLat !== null && userLng !== null) {
      results = results.filter((e) => e.distanceKm !== null && e.distanceKm <= maxRadiusKm);
    }

    // If user coordinates provided, sort by nearest first!
    if (userLat !== null && userLng !== null) {
      results.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return ok({ events: results, count: results.length });
  } catch (err: any) {
    console.error("GET /api/events error:", err);
    return fail(err.message || "Failed to fetch events.", 500);
  }
}

// POST /api/events - Submit a new heritage walk or live cultural event
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return fail("Please sign in to submit a heritage event or walk.", 401);
    }

    const body = await req.json();
    const {
      title,
      type = "heritage-walk",
      description,
      venue,
      locality,
      lat,
      lng,
      startsAt,
      endsAt,
      isFree = true,
      priceNote,
      familyFriendly = true,
      organiser,
      sourceUrl,
      bookingUrl,
      image,
    } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return fail("Event title is required (min 3 characters).", 400);
    }

    if (!venue || typeof venue !== "string") {
      return fail("Event venue / meeting point is required.", 400);
    }

    if (!startsAt) {
      return fail("Event start date & time is required.", 400);
    }

    const startDate = new Date(startsAt);
    if (isNaN(startDate.getTime())) {
      return fail("Invalid event start date.", 400);
    }

    const endDate = endsAt ? new Date(endsAt) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const latitude = lat ? Number(lat) : 28.6139; // default CP
    const longitude = lng ? Number(lng) : 77.2090;

    const [newEvent] = await db
      .insert(events)
      .values({
        title: title.trim(),
        type: type.trim(),
        description: description?.trim() || `Join this live heritage walk in ${locality || venue}.`,
        venue: venue.trim(),
        locality: locality?.trim() || "Delhi",
        lat: latitude,
        lng: longitude,
        startsAt: startDate,
        endsAt: endDate,
        isFree: Boolean(isFree),
        priceNote: priceNote?.trim() || (isFree ? "Free admission" : "Check official link for ticket rates"),
        familyFriendly: Boolean(familyFriendly),
        organiser: organiser?.trim() || user.fullName,
        sourceUrl: sourceUrl?.trim() || null,
        bookingUrl: bookingUrl?.trim() || null,
        image: image?.trim() || "/assets/events/heritage-walk.jpg",
        isDemo: false,
        published: true,
      })
      .returning();

    clearQueryCache();

    return ok({ ok: true, event: newEvent, message: "Event published live successfully!" }, 201);
  } catch (err: any) {
    console.error("POST /api/events error:", err);
    return fail(err.message || "Failed to create event.", 500);
  }
}

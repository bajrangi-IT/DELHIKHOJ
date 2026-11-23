import { NextRequest } from "next/server";
import { ok } from "@/lib/api";

/**
 * Delhi-focused Geocoding & Reverse Geocoding API
 * Supports:
 * - Search by query: /api/geocode?q=aerocity
 * - Reverse geocoding for live GPS: /api/geocode?lat=28.556&lng=77.100
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng") || url.searchParams.get("lon");

  // 1. Reverse Geocoding: Look up address from GPS coordinates
  if (lat && lng && !isNaN(+lat) && !isNaN(+lng)) {
    try {
      const revRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`,
        {
          headers: { "User-Agent": "TheDelhiKiKhoj/1.0 (delhi-heritage-tourism-app)" },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (revRes.ok) {
        const revData = await revRes.json();
        const addr = revData.address || {};
        const neighborhood =
          addr.neighbourhood ||
          addr.suburb ||
          addr.commercial ||
          addr.residential ||
          addr.road ||
          addr.city_district ||
          addr.city ||
          "Delhi";

        const formattedName = `${neighborhood}, Delhi`;
        return ok({
          location: {
            name: formattedName,
            displayName: revData.display_name?.split(",").slice(0, 3).join(",") || formattedName,
            lat: +lat,
            lng: +lng,
          },
        });
      }
    } catch {
      // Return coordinates with Delhi fallback
      return ok({
        location: {
          name: "Current Location (Delhi)",
          lat: +lat,
          lng: +lng,
        },
      });
    }
  }

  // 2. Query Search with Delhi Bounding Box
  if (!q || q.length < 2) {
    return ok({ results: [] });
  }

  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=6&viewbox=76.8,28.9,77.5,28.3&bounded=1&q=${encodeURIComponent(q)}`,
      {
        headers: { "User-Agent": "TheDelhiKiKhoj/1.0 (delhi-heritage-tourism-app)" },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!r.ok) throw new Error("Geocoder request failed");

    const j = (await r.json()) as { display_name: string; lat: string; lon: string; type?: string }[];
    const results = j.map((x) => ({
      name: x.display_name.split(",").slice(0, 3).join(","),
      lat: +x.lat,
      lng: +x.lon,
      category: x.type || "Location",
    }));

    return ok({ results });
  } catch {
    return ok({ results: [], fallback: true });
  }
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function directionsUrl(
  dest: { lat: number; lng: number },
  origin?: { lat: number; lng: number } | null,
  mode: "driving" | "walking" | "transit" | "bicycling" = "driving",
) {
  const p = new URLSearchParams({ api: "1", destination: `${dest.lat},${dest.lng}`, travelmode: mode });
  if (origin) p.set("origin", `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}

export function fmtDate(d: Date | string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(d).toLocaleString("en-IN", opts ?? { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
}

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** Presets so route planning works without any geocoding key. */
export const START_PRESETS = [
  { name: "New Delhi Railway Station", lat: 28.6428, lng: 77.2197 },
  { name: "Old Delhi Railway Station", lat: 28.6612, lng: 77.2276 },
  { name: "Indira Gandhi International Airport (T3)", lat: 28.5562, lng: 77.1 },
  { name: "Connaught Place", lat: 28.6315, lng: 77.2167 },
  { name: "Kashmere Gate ISBT", lat: 28.6677, lng: 77.2279 },
  { name: "Hazrat Nizamuddin Railway Station", lat: 28.5883, lng: 77.2543 },
  { name: "Saket", lat: 28.5245, lng: 77.2066 },
];

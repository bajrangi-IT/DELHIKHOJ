"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapMarker = { id: string; name: string; type: string; lat: number; lng: number; href?: string; desc?: string; directions?: string };

const COLORS: Record<string, string> = {
  monument: "#C69A50", memorial: "#C69A50", religious: "#C9A77B", museum: "#8fa8d8", garden: "#4fa385", market: "#d97a5b", restaurant: "#e0a24a",
  cafe: "#b48a6a", cultural: "#b277c9", hidden: "#7fd0c0", event: "#e0505a", destination: "#C69A50", user: "#ffffff",
};
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export default function LeafletMap({ markers, center = [28.6139, 77.209], zoom = 11, focusId, className = "" }: { markers: MapMarker[]; center?: [number, number]; zoom?: number; focusId?: string; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { scrollWheelZoom: false }).setView(center, zoom);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    map.current.on("focus", () => map.current?.scrollWheelZoom.enable());
    map.current.on("blur", () => map.current?.scrollWheelZoom.disable());
    return () => { map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const pts: L.LatLngExpression[] = [];
    markers.forEach((mk) => {
      const c = COLORS[mk.type] ?? "#C69A50";
      const icon = L.divIcon({ className: "", html: `<span style="display:block;width:${mk.id === focusId ? 22 : 16}px;height:${mk.id === focusId ? 22 : 16}px;border-radius:50%;background:${c};border:2px solid #11100E;box-shadow:0 0 0 2px ${c}66"></span>`, iconSize: [18, 18], iconAnchor: [9, 9] });
      const html = `<strong>${esc(mk.name)}</strong><br/><small>${esc(mk.type)}</small>${mk.desc ? `<p style="margin:6px 0 0;max-width:220px">${esc(mk.desc.slice(0, 120))}</p>` : ""}<p style="margin:8px 0 0">${mk.href ? `<a href="${mk.href}">Details</a> · ` : ""}<a target="_blank" rel="noopener noreferrer" href="${mk.directions ?? `https://www.google.com/maps/dir/?api=1&destination=${mk.lat},${mk.lng}`}">Directions ↗</a></p>`;
      const marker = L.marker([mk.lat, mk.lng], { icon, title: mk.name, alt: mk.name }).bindPopup(html).addTo(g);
      if (mk.id === focusId) marker.openPopup();
      pts.push([mk.lat, mk.lng]);
    });
    if (focusId) {
      const f = markers.find((x) => x.id === focusId);
      if (f) m.setView([f.lat, f.lng], Math.max(m.getZoom(), 14));
    } else if (pts.length > 1) m.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 15 });
    else if (pts.length === 1) m.setView(pts[0], 14);
  }, [markers, focusId]);

  return <div ref={el} className={className} role="application" aria-label="Interactive map of Delhi" />;
}

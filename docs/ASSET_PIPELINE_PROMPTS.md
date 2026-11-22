# THE DELHI KI KHOJ — Asset pipeline (Google Whisk → Google Flow → frames)

All files plug into `src/lib/assets.ts`. Replace a file at the same path (or edit the manifest) — no component changes needed.

## 1. Stills in Google Whisk
Style anchor (paste in every Whisk prompt): *"cinematic travel photography, photorealistic, warm sandstone and antique-gold palette (#C9A77B, #C69A50), deep heritage-black shadows (#11100E), soft atmospheric haze, 16:9, no text, no people close-up, no watermarks"*.

| File | Whisk prompt (subject) |
|---|---|
| `hero/delhi-hero-panoramic.webp` | Red Fort silhouette rising through morning mist at sunrise, birds in sky, dark foreground |
| `monuments/red-fort-hero.webp` | Red Fort Lahori Gate ramparts, golden hour |
| `monuments/qutub-minar-cinematic.webp` | Qutub Minar at dusk with Mehrauli ruins in foreground |
| `monuments/humayun-tomb-atmosphere.webp` | Humayun's Tomb, symmetrical charbagh garden, misty morning |
| `monuments/india-gate-dusk.webp` | India Gate at blue hour, long lit avenue |
| `monuments/jama-masjid-courtyard.webp` | Jama Masjid domes and minarets at sunset |
| `historical-eras/era-ancient-mehrauli.webp` | Iron Pillar of Delhi and early-medieval ruins at dawn |
| `historical-eras/era-modern-delhi.webp` | Modern Delhi at night, metro line, warm lights |
| `markets/chandni-chowk-market.webp` | Chandni Chowk lane, hanging wires, colourful shops, evening |
| `artisans/delhi-handicrafts.webp` | Block-printed textiles, brass, pottery, jewellery on a table |
| (add) `monuments/purana-qila.webp`, `lodhi-garden.webp`, `agrasen-ki-baoli.webp`, `safdarjung-tomb.webp`, `national-museum.webp` | one per destination, same style anchor |

Always keep an honest caption: images are **AI-generated illustrations**, not archival photographs.

## 2. Image → video in Google Flow
Use a Whisk still as the start frame. Keep every clip 6–8 s, 16:9, same colour grade.

- **Hero flythrough** (`videos/delhi-hero-flythrough.mp4`): "Slow cinematic push-in toward the fort through drifting morning mist, birds crossing the sky, subtle camera parallax, no cuts."
- **Era journey** (`videos/era-journey.mp4`): chain 5 clips with a match-dissolve — Mehrauli ruins → Qutub Minar → Red Fort → India Gate → modern Delhi. "Slow forward camera move, golden light shifting, mist, no text."
- **Per-monument ambience** (`videos/<slug>-atmosphere.mp4`): "Gentle drone orbit, soft light changes, leaves moving, 6 seconds."

## 3. Video → scroll frames (ffmpeg)
```bash
# 120 evenly spaced WebP frames, 1600px wide
mkdir -p public/assets/sequences/era-journey
ffmpeg -i era-journey.mp4 -vf "fps=15,scale=1600:-2" -c:v libwebp -quality 72 \
  public/assets/sequences/era-journey/frame-%04d.webp

# compress hero video (MP4 + WebM)
ffmpeg -i hero.mp4 -vf scale=1920:-2 -c:v libx264 -crf 26 -preset slow -an -movflags +faststart public/assets/videos/delhi-hero-flythrough.mp4
ffmpeg -i hero.mp4 -vf scale=1920:-2 -c:v libvpx-vp9 -crf 34 -b:v 0 -an public/assets/videos/delhi-hero-flythrough.webm
```
Then in `src/lib/assets.ts` set `sequences.eraJourney.count` to the number of frames (e.g. `120`) and `hero.video` to the MP4 path. The canvas renderer (`SequenceCanvas`) only loads frames near the scroll position.

---

# MASTER PROMPT (short form for Fable 5.2)

> Act as creative director + senior full-stack engineer. Build **THE DELHI KI KHOJ** — an immersive, scroll-driven 3D heritage-tourism platform for Delhi. Stack: Next.js App Router, TypeScript, Tailwind, PostgreSQL via Drizzle, React Three Fiber, GSAP ScrollTrigger, Lenis, Leaflet.
> Palette: #11100E, #C9A77B, #C69A50, #F3EBDD, #641F28, #242321. Serif headings + clean sans UI; Devanagari-safe fonts.
> Experience: misty-fort hero with particles/birds → 3D fly-through of monuments → canvas image-sequence "time travel" across five eras → destination gallery → experiences → support-local → AI search.
> Features (all real, nothing faked): email auth with sessions and roles (tourist/guide/seller/admin), onboarding, AI/RAG destination search with source attribution, destination pages (history with sources, visitor info flagged *unverified* unless verified, route estimates via OSRM + Google Maps links, nearby, events, guides), itinerary planner (edit, reorder, save, PDF export, share), interactive map with filters, events calendar with past-labelling, guide marketplace with request workflow and admin approval, seller/product enquiry marketplace, user dashboard, admin CRUD + audit log.
> Rules: never invent history, prices, hours, ticket links, reviews or sellers; label demo data; respect reduced-motion; mobile fallbacks for 3D; every button does something; every form validates; include TESTING.md.

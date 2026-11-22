# TESTING.md — THE DELHI KI KHOJ

## Stack note
Built on Next.js (App Router) + PostgreSQL via Drizzle (the provided runtime). Auth is custom and real (scrypt-hashed passwords, httpOnly server-side sessions) — **not Supabase**. Authorization is enforced in server code (layouts, route handlers); there are no Postgres RLS policies because the browser never talks to the DB directly.

## What works (verified flows)
- Sign up (validation, consent, language) → onboarding (interests) → dashboard; log in; log out.
- Forgot/reset password (see "demo behaviour" below).
- AI-style search (`/explore`): keyword + intent retrieval over sourced DB, suggestions, recent searches (localStorage), voice input where the browser supports it.
- Destination pages with sources, "Unverified" flags, route estimates (OSRM), Google Maps links, nearby map/list, events, guides.
- Map (`/nearby`): category filters, locality search, map/list toggle, "near me", directions links.
- Trip planner: generate (half/full/multi-day), edit minutes, reorder, remove, add stops, save/update (login required), print-to-PDF export, share/copy.
- Events: filters (date, type, location, free/paid, family), automatic **Past** labelling, past hidden by default.
- Guide marketplace: filters, profile, booking *request* → status in dashboard, guide accept/decline, tourist cancel. Admin approval required for new guides.
- Sellers/products: public listing, enquiries stored, seller dashboard (add/delete products once approved).
- Admin: overview stats, CRUD for destinations/events/attractions/markets, approve/reject guides & sellers, products moderation, user roles, contact/enquiry inbox, audit log.
- Protected routes: `(user)` pages redirect to `/login`; `/admin` redirects non-admins; admin API returns 401/403 server-side.
- Reduced motion: OS setting + "Motion" toggle disables Lenis, hero parallax/particles, 3D fly-through (falls back to carousel) and era sequence (falls back to static list).

## Demo accounts (seeded on first run — demo mode)
| Role | Email | Password |
|---|---|---|
| Traveller | demo@delhikikhoj.test | Demo@1234 |
| Admin | admin@delhikikhoj.test | Admin@1234 |
| Guide | guide@delhikikhoj.test | Guide@1234 |
| Seller | seller@delhikikhoj.test | Seller@1234 |

Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` to also seed a private admin, and delete the demo accounts before going public.

## Uses demonstration data
- 8 events (titles prefixed **[DEMO]**), 4 guide profiles, 3 sellers and 4 products — all flagged DEMO in the UI. No reviews or bookings are fabricated.
- Gazetteer: 30 destinations, 34 attractions, 12 markets with approximate OpenStreetMap-derived coordinates (labelled as approximate map pins on every destination page).
- Images are AI-generated illustrations (Google-Whisk-style stills); only 10 exist. Other destinations show the intentional fallback artwork.

## Needs external services / keys
- `LLM_API_KEY` (+ `LLM_BASE_URL`, `LLM_MODEL`): optional LLM rewrite of retrieved facts. Without it the assistant is deterministic.
- Routing: public OSRM demo server by default (`OSRM_BASE_URL`); geocoding via Nominatim. Both may be rate-limited/offline — UI falls back to Google Maps links and presets.
- Email: **no provider configured**; password-reset link is shown on screen (labelled demo mode). Wire SMTP/Resend in `/api/auth/forgot` for production.

## Not yet integrated / limitations
- Google sign-in, marker clustering (≈25 points, so unclustered), image upload to storage (images are referenced by path/URL), Supabase/RLS, payments, cart, live event feeds, reviews.
- Opening hours, fees and ticket links are intentionally **unverified**; ASI ticket link is the portal root and should be re-checked before launch (`last checked` is shown as "not verified").
- Coordinates are approximate site centres. Route times for public transport are not computed (no live schedule data).
- Hindi UI translation limited to destination names and language preference storage.
- Scroll frame sequence needs your extracted Flow frames (see `docs/ASSET_PIPELINE_PROMPTS.md`); until then the five era stills cross-fade on the canvas.
- Rate limiting is in-memory per instance.

## Manual test checklist
1. `/signup` → create user → lands on `/onboarding` → save → `/dashboard`.
2. Log out, visit `/dashboard` → redirected to `/login?next=…`; visit `/admin` as traveller → `/dashboard?denied=admin`.
3. `/explore` → "best food near Jama Masjid" → answer card with sources/suggestions.
4. `/destination/red-fort` → Save, route estimate, ticket link opens new tab.
5. `/plan-trip?dest=humayuns-tomb` → generate → reorder/remove/add → Save → `/my-trips` → Open & edit → Export PDF.
6. `/guides` → request as traveller → guide account accepts at `/guide-dashboard` → traveller sees "accepted" in `/my-bookings`.
7. `/become-seller` as new user → admin approves at `/admin/sellers` → seller adds product → appears at `/local-products` → enquiry stored.
8. Toggle **Motion: Off** → home page shows static fallbacks.

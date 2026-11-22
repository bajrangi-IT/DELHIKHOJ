# THE DELHI KI KHOJ (दिल्ली की खोज)

An immersive, scroll-driven 3D heritage-tourism and discovery platform for Delhi.

Discover Delhi. Experience its history. Support its people.

---

## ✨ Features

- **🏛️ 3D Heritage Experience**: Scroll-driven panoramic hero, 3D monument fly-through (React Three Fiber), and interactive historical era transitions (Ancient, Sultanate, Mughal, Colonial, and Modern).
- **🗺️ Interactive Map & Nearby**: Real-time Leaflet map with category filtering (Monuments, Religious, Museums, Gardens, Memorials, Hidden gems) and OSRM route calculations.
- **🧭 Curated Guides & Artisan Marketplace**: Verified local tour guides, direct artisan handicraft enquiries, and authentic street food & market directories.
- **📅 Trip Planner**: Generate customized half-day, full-day, and multi-day stop-by-stop itineraries with distance, duration, and PDF export.
- **🔒 Full-Featured Authentication**: Secure scrypt-hashed server-side sessions, onboarding preferences, personalized dashboard, saved places, and admin moderation dashboard.
- **⚡ Native Embedded Database**: Built with Drizzle ORM and embedded persistent PGlite (PostgreSQL WASM) — runs out of the box with zero external database configuration required.
- **🎨 Fluid Animations**: Smooth page transitions, micro-interactions, responsive tactile buttons, and Lenis smooth scrolling.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS
- **3D & Canvas**: Three.js, @react-three/fiber
- **Animations & Scrolling**: GSAP, ScrollTrigger, Lenis
- **Mapping**: Leaflet, OpenStreetMap
- **Database & ORM**: Drizzle ORM, @electric-sql/pglite (PostgreSQL WebAssembly)
- **Language**: TypeScript

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/bajrangi-IT/DELHIKHOJ.git
cd DELHIKHOJ
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy the `.env.example` file:
```bash
cp .env.example .env
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 👥 Demo Accounts

The database comes pre-seeded with sample demo accounts for testing:

| Role | Email | Password |
|---|---|---|
| **Traveller** | `demo@delhikikhoj.test` | `Demo@1234` |
| **Admin** | `admin@delhikikhoj.test` | `Admin@1234` |
| **Guide** | `guide@delhikikhoj.test` | `Guide@1234` |
| **Seller** | `seller@delhikikhoj.test` | `Seller@1234` |

---

## 📂 Project Structure

```
├── drizzle/              # Drizzle SQL migration files
├── public/assets/        # Curated high-resolution monument & heritage imagery
│   ├── hero/
│   ├── monuments/
│   ├── historical-eras/
│   ├── markets/
│   ├── artisans/
│   └── events/
├── src/
│   ├── app/              # Next.js App Router (pages & API routes)
│   ├── components/       # UI components, 3D scenes, maps, auth forms
│   ├── db/               # Database client and schema definition
│   └── lib/              # Heritage data, assets manifest, auth utilities
└── next.config.ts        # Next.js configuration
```

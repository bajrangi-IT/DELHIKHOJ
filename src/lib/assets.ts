/**
 * CENTRAL ASSET MANIFEST
 * Curated high-resolution heritage imagery for Delhi Ki Khoj.
 * Every destination, market, era, artisan craft, and event has a verified image.
 */
export const assets = {
  hero: {
    poster: "/assets/hero/delhi-hero-panoramic.jpg",
    video: null as string | null,
  },
  monuments: {
    "red-fort": "/assets/monuments/red-fort.jpg",
    "qutub-minar": "/assets/monuments/qutub-minar.jpg",
    "humayuns-tomb": "/assets/monuments/humayuns-tomb.jpg",
    "india-gate": "/assets/monuments/india-gate.jpg",
    "purana-qila": "/assets/monuments/purana-qila.jpg",
    "jama-masjid": "/assets/monuments/jama-masjid.jpg",
    "lodhi-garden": "/assets/monuments/lodhi-garden.jpg",
    "agrasen-ki-baoli": "/assets/monuments/agrasen-ki-baoli.jpg",
    "safdarjung-tomb": "/assets/monuments/safdarjung-tomb.jpg",
    "national-museum": "/assets/monuments/national-museum.jpg",
    "lotus-temple": "/assets/monuments/lotus-temple.jpg",
    "akshardham": "/assets/monuments/akshardham.jpg",
    "gurudwara-bangla-sahib": "/assets/monuments/gurudwara-bangla-sahib.jpg",
    "nizamuddin-dargah": "/assets/monuments/nizamuddin-dargah.jpg",
    "kalkaji-mandir": "/assets/monuments/kalkaji-mandir.jpg",
    "chhatarpur-temple": "/assets/monuments/chhatarpur-temple.jpg",
    "tughlaqabad-fort": "/assets/monuments/tughlaqabad-fort.jpg",
    "feroz-shah-kotla": "/assets/monuments/feroz-shah-kotla.jpg",
    "bara-gumbad": "/assets/monuments/bara-gumbad.jpg",
    "parliament-house": "/assets/monuments/parliament-house.jpg",
    "rashtrapati-bhavan": "/assets/monuments/rashtrapati-bhavan.jpg",
    "raj-ghat": "/assets/monuments/raj-ghat.jpg",
    "national-war-memorial": "/assets/monuments/national-war-memorial.jpg",
    "national-railway-museum": "/assets/monuments/national-railway-museum.jpg",
    "ngma": "/assets/monuments/ngma.jpg",
    "indira-gandhi-memorial": "/assets/monuments/indira-gandhi-memorial.jpg",
    "teen-murti-house": "/assets/monuments/teen-murti-house.jpg",
    "hauz-khas-village": "/assets/monuments/hauz-khas-village.jpg",
    "garden-of-five-senses": "/assets/monuments/garden-of-five-senses.jpg",
    "buddha-jayanti-park": "/assets/monuments/buddha-jayanti-park.jpg",
    "bharat-mandapam": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bharat_Mandapam_Pragati_Maidan.jpg/800px-Bharat_Mandapam_Pragati_Maidan.jpg",
    "yashobhoomi": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Yashobhoomi_Dwarka.jpg/800px-Yashobhoomi_Dwarka.jpg",
  } as Record<string, string>,
  eras: {
    ancient: "/assets/historical-eras/era-ancient-mehrauli.jpg",
    sultanate: "/assets/historical-eras/era-sultanate.jpg",
    mughal: "/assets/historical-eras/era-mughal.jpg",
    colonial: "/assets/historical-eras/era-colonial.jpg",
    modern: "/assets/historical-eras/era-modern-delhi.jpg",
  },
  markets: {
    "chandni-chowk": "/assets/markets/chandni-chowk.jpg",
    "khari-baoli": "/assets/markets/khari-baoli.jpg",
    "dilli-haat-ina": "/assets/markets/dilli-haat-ina.jpg",
    "dilli-haat-pitampura": "/assets/markets/dilli-haat-pitampura.jpg",
    "khan-market": "/assets/markets/khan-market.jpg",
    "janpath": "/assets/markets/janpath.jpg",
    "palika-bazaar": "/assets/markets/palika-bazaar.jpg",
    "sarojini-nagar": "/assets/markets/sarojini-nagar.jpg",
    "karol-bagh": "/assets/markets/karol-bagh.jpg",
    "lajpat-nagar": "/assets/markets/lajpat-nagar.jpg",
    "daryaganj-book-market": "/assets/markets/daryaganj-book-market.jpg",
    "majnu-ka-tilla-food": "/assets/markets/majnu-ka-tilla-food.jpg",
  } as Record<string, string>,
  artisans: {
    crafts: "/assets/artisans/delhi-handicrafts.jpg",
    textiles: "/assets/artisans/block-print-textiles.jpg",
    spices: "/assets/artisans/spices.jpg",
    jewellery: "/assets/artisans/silver-jewellery.jpg",
  },
  events: {
    "heritage-walk": "/assets/events/heritage-walk.jpg",
    "workshop": "/assets/events/mughal-gardens.jpg",
    "craft-fair": "/assets/events/craft-fair.jpg",
    "performance": "/assets/events/classical-music.jpg",
    "theatre": "/assets/events/theatre-night.jpg",
    "museum": "/assets/events/museum-night.jpg",
  } as Record<string, string>,
  sequences: {
    eraJourney: {
      pattern: "/assets/sequences/era-journey/frame-{n}.webp",
      count: 0,
      pad: 4,
    },
  },
};

export type MonumentViewAngle = {
  id: "facade" | "aerial" | "detail" | "sunset";
  label: string;
  url: string;
  description: string;
};

export const monumentViews: Record<string, MonumentViewAngle[]> = {
  "red-fort": [
    { id: "facade", label: "Lahori Gate Facade", url: "/assets/monuments/red-fort.jpg", description: "Grand red sandstone entrance and octagonal towers of Shahjahanabad" },
    { id: "aerial", label: "Aerial Fort Ramparts", url: "/assets/monuments/red-fort-hero.jpg", description: "Panoramic view of Mughal bastions and Chandni Chowk perimeter" },
    { id: "detail", label: "Diwan-i-Khas Inlay", url: "/assets/monuments/red-fort-detail.jpg", description: "Pietra dura marble craftsmanship and imperial Mughal arches" },
  ],
  "qutub-minar": [
    { id: "facade", label: "72.5m Soaring Minaret", url: "/assets/monuments/qutub-minar.jpg", description: "Five tapered storeys of red sandstone and marble fluting" },
    { id: "aerial", label: "Cinematic Angle", url: "/assets/monuments/qutub-minar-cinematic.jpg", description: "Dramatic view rising above the Mehrauli archaeological park" },
    { id: "detail", label: "Ancient Iron Pillar", url: "/assets/monuments/qutub-minar-iron-pillar.jpg", description: "4th-century Gupta metallurgy marvel and Qur'anic calligraphy carvings" },
  ],
  "humayuns-tomb": [
    { id: "facade", label: "Garden-Tomb Facade", url: "/assets/monuments/humayuns-tomb.jpg", description: "Symmetrical Persian-Mughal double dome set in a Charbagh" },
    { id: "sunset", label: "Sunset Illumination", url: "/assets/monuments/humayuns-tomb-sunset.jpg", description: "Golden hour light warming the red sandstone and white marble plinth" },
    { id: "aerial", label: "Gardens & Sunder Nursery", url: "/assets/monuments/humayun-tomb-atmosphere.jpg", description: "Tranquil water channels and surrounding Nizamuddin heritage landscape" },
  ],
  "india-gate": [
    { id: "facade", label: "Triumphal Memorial Arch", url: "/assets/monuments/india-gate.jpg", description: "42-metre sandstone arch designed by Edwin Lutyens" },
    { id: "sunset", label: "Dusk Illumination", url: "/assets/monuments/india-gate-dusk.jpg", description: "Floodlit Kartavya Path promenade and vibrant Delhi evening lights" },
    { id: "detail", label: "Amar Jawan Memorial", url: "/assets/monuments/india-gate-detail.jpg", description: "Sacred eternal flame and war memorial inscription details" },
  ],
  "lotus-temple": [
    { id: "facade", label: "Blooming Lotus Petals", url: "/assets/monuments/lotus-temple.jpg", description: "Pure white Grecian marble petals rising above turquoise reflection pools" },
    { id: "aerial", label: "Aerial Bird's Eye", url: "/assets/monuments/lotus-temple-aerial.jpg", description: "Nine-fold symmetry and geometry visible from above" },
    { id: "sunset", label: "Twilight Reflection", url: "/assets/monuments/lotus-temple-sunset.jpg", description: "Evening golden glow reflected across the tranquil gardens" },
  ],
  "jama-masjid": [
    { id: "facade", label: "Grand Mosque Facade", url: "/assets/monuments/jama-masjid.jpg", description: "Shah Jahan's monumental red sandstone mosque with marble striped domes" },
    { id: "aerial", label: "Expansive Courtyard", url: "/assets/monuments/jama-masjid-courtyard.jpg", description: "Historic courtyard capable of holding 25,000 worshippers" },
  ],
  "gurudwara-bangla-sahib": [
    { id: "facade", label: "Golden Domes & Sanctum", url: "/assets/monuments/gurudwara-bangla-sahib.jpg", description: "Gleaming white marble Gurudwara and golden central dome" },
    { id: "sunset", label: "Sacred Sarovar Pool", url: "/assets/monuments/gurudwara-bangla-sahib-sarovar.jpg", description: "Tranquil holy water reflection and evening devotional atmosphere" },
  ],
  "agrasen-ki-baoli": [
    { id: "facade", label: "Steep Stepwell Descent", url: "/assets/monuments/agrasen-ki-baoli.jpg", description: "108 steep stone steps descending into Delhi's 14th-century stepwell" },
    { id: "detail", label: "Arched Stone Niches", url: "/assets/monuments/agrasen-ki-baoli-steps.jpg", description: "Three levels of arched galleries carved from quartzite stone" },
  ],
};

export function getMonumentViews(slug: string): MonumentViewAngle[] {
  if (monumentViews[slug]) return monumentViews[slug];
  const baseImg = getMonumentImage(slug);
  return [
    { id: "facade", label: "Primary Heritage View", url: baseImg, description: "Authentic documented view of this Delhi monument" },
  ];
}

export function sequenceFrames(name: keyof typeof assets.sequences): string[] {
  const s = assets.sequences[name];
  if (!s.count) return [];
  return Array.from({ length: s.count }, (_, i) =>
    s.pattern.replace("{n}", String(i + 1).padStart(s.pad, "0")),
  );
}

export function getMonumentImage(slug: string): string {
  return assets.monuments[slug] ?? assets.monuments["red-fort"];
}

export function getMarketImage(slug: string): string {
  return assets.markets[slug] ?? assets.markets["chandni-chowk"];
}

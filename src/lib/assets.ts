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
    "red-fort": "/assets/monuments/red-fort-hero.jpg",
    "qutub-minar": "/assets/monuments/qutub-minar-cinematic.jpg",
    "humayuns-tomb": "/assets/monuments/humayun-tomb-atmosphere.jpg",
    "india-gate": "/assets/monuments/india-gate-dusk.jpg",
    "purana-qila": "/assets/monuments/purana-qila.jpg",
    "jama-masjid": "/assets/monuments/jama-masjid-courtyard.jpg",
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
  } as Record<string, string>,
  eras: {
    ancient: "/assets/historical-eras/era-ancient-mehrauli.jpg",
    sultanate: "/assets/historical-eras/era-sultanate.jpg",
    mughal: "/assets/historical-eras/era-mughal.jpg",
    colonial: "/assets/historical-eras/era-colonial.jpg",
    modern: "/assets/historical-eras/era-modern-delhi.jpg",
  },
  markets: {
    "chandni-chowk": "/assets/markets/chandni-chowk-market.jpg",
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

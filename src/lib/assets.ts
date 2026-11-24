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
  "akshardham": [
    { id: "facade", label: "Grand Mandir Sanctorum", url: "/assets/monuments/akshardham.jpg", description: "Colossal hand-carved pink sandstone and Carrara marble temple with 234 ornate pillars" },
    { id: "sunset", label: "Sahaj Anand Musical Water Show", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Akshardham_Temple%2C_Delhi.jpg/800px-Akshardham_Temple%2C_Delhi.jpg", description: "Evening water and light spectacle narrating Vedic wisdom using lasers and fire effects" },
    { id: "detail", label: "Gajendra Peeth Elephant Carvings", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Delhi_Akshardham.jpg/800px-Delhi_Akshardham.jpg", description: "148 life-sized elephant statues carved into the 1,070-foot temple base" },
  ],
  "purana-qila": [
    { id: "facade", label: "Bada Darwaza & Ramparts", url: "/assets/monuments/purana-qila.jpg", description: "Sher Shah Suri and Humayun's massive 16th-century fortress ramparts overlooking the ancient Yamuna bed" },
    { id: "detail", label: "Qila-i-Kuhna Mosque", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Purana_Qila_Mosque.jpg/800px-Purana_Qila_Mosque.jpg", description: "Exquisite horse-shoe arches and black-and-white marble inlay work" },
    { id: "aerial", label: "Sher Mandal Astronomical Tower", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Sher_Mandal_Purana_Qila.jpg/800px-Sher_Mandal_Purana_Qila.jpg", description: "Octagonal red sandstone library pavilion where Mughal Emperor Humayun studied astronomy" },
  ],
  "lodhi-garden": [
    { id: "facade", label: "Bara Gumbad Heritage Dome", url: "/assets/monuments/lodhi-garden.jpg", description: "15th-century full-dome gateway complex set amidst 90 acres of manicured botanical lawns" },
    { id: "sunset", label: "Sheesh Gumbad at Dusk", url: "/assets/monuments/bara-gumbad.jpg", description: "Glazed blue tile remnants on the tomb plinth catching the sunset glow" },
    { id: "detail", label: "Athpula Mughal Bridge", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Lodhi_Gardens_Delhi.jpg/800px-Lodhi_Gardens_Delhi.jpg", description: "Eight-piered stone arched bridge built during Emperor Akbar's reign" },
  ],
  "safdarjung-tomb": [
    { id: "facade", label: "Late Mughal Garden Tomb", url: "/assets/monuments/safdarjung-tomb.jpg", description: "Last monumental garden tomb of the Mughal era built in 1754 for Prime Minister Safdarjung" },
    { id: "aerial", label: "Charbagh Water Channels", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Safdarjung_Tomb_Delhi.jpg/800px-Safdarjung_Tomb_Delhi.jpg", description: "Elevated terrace surrounded by four-part symmetrical water pools and palm courts" },
  ],
  "bharat-mandapam": [
    { id: "facade", label: "Shankha Architectural Facade", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bharat_Mandapam_Pragati_Maidan.jpg/800px-Bharat_Mandapam_Pragati_Maidan.jpg", description: "Elliptical conch-shell design housing India's premier international convention centre at Pragati Maidan" },
    { id: "detail", label: "28-Foot Nataraja Bronze Statue", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Bharat_Mandapam_during_G20_Delhi.jpg/800px-Bharat_Mandapam_during_G20_Delhi.jpg", description: "World's tallest Ashtadhatu bronze statue cast by Swamimalai master artisans welcoming international delegates" },
    { id: "aerial", label: "G20 Plenary Amphitheatre & Lawns", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Pragati_Maidan_Complex.jpg/800px-Pragati_Maidan_Complex.jpg", description: "Sprawling 14 air-conditioned exhibition halls and outdoor cultural amphitheatre" },
  ],
  "yashobhoomi": [
    { id: "facade", label: "Main Concourse & Convention Arena", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Yashobhoomi_Dwarka.jpg/800px-Yashobhoomi_Dwarka.jpg", description: "Mega convention and exhibition facility spanning over 8.9 lakh square metres in Dwarka Sector 25" },
    { id: "aerial", label: "Grand 11,000-Seat Auditorium", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Yashobhoomi_auditorium.jpg/800px-Yashobhoomi_auditorium.jpg", description: "India's largest state-of-the-art auditorium equipped with world-class acoustic engineering" },
  ],
  "national-war-memorial": [
    { id: "facade", label: "Amar Chakra & Eternal Flame", url: "/assets/monuments/national-war-memorial.jpg", description: "15-metre central obelisk with eternal flame commemorating bravehearts since 1947" },
    { id: "detail", label: "Veerta & Tyag Chakra Concentric Walls", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/National_War_Memorial_New_Delhi.jpg/800px-National_War_Memorial_New_Delhi.jpg", description: "Granite brick walls inscribed in golden letters with names of fallen soldiers" },
  ],
  "national-museum": [
    { id: "facade", label: "Rotunda & Entrance Facade", url: "/assets/monuments/national-museum.jpg", description: "India's premier museum hosting over 200,000 artefacts spanning 5,000 years of civilization" },
    { id: "detail", label: "Harappan Bronze Dancing Girl", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/National_Museum_New_Delhi_artifacts.jpg/800px-National_Museum_New_Delhi_artifacts.jpg", description: "Indus Valley civilization masterpiece excavated from Mohenjo-daro" },
  ],
  "national-railway-museum": [
    { id: "facade", label: "Vintage Heritage Locomotives", url: "/assets/monuments/national-railway-museum.jpg", description: "11-acre open-air museum housing original 19th-century steam engines and royal coaches" },
    { id: "detail", label: "Fairy Queen (1855)", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/National_Rail_Museum_Delhi.jpg/800px-National_Rail_Museum_Delhi.jpg", description: "World's oldest operating steam locomotive certified by the Guinness Book of World Records" },
  ],
  "tughlaqabad-fort": [
    { id: "facade", label: "Massive Sultanate Bastions", url: "/assets/monuments/tughlaqabad-fort.jpg", description: "Cyclopean stone walls built by Ghiyas-ud-din Tughlaq in 1321 against Mongol invasions" },
    { id: "sunset", label: "Mausoleum Causeway at Sunset", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Tughlaqabad_Fort_Delhi.jpg/800px-Tughlaqabad_Fort_Delhi.jpg", description: "Sloping red sandstone and white marble tomb connected by an elevated causeway" },
  ],
  "hauz-khas-village": [
    { id: "facade", label: "14th-Century Lake Madrassa", url: "/assets/monuments/hauz-khas-village.jpg", description: "Firoz Shah Tughlaq's theological college and colonnades overlooking the royal lake" },
    { id: "sunset", label: "Deer Park & Sunset Pavilions", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Hauz_Khas_Complex.jpg/800px-Hauz_Khas_Complex.jpg", description: "Tranquil stone arches and green nature trails where historic Delhi meets bohemian cafes" },
  ],
  "chhatarpur-temple": [
    { id: "facade", label: "Marble Temple Sanctum", url: "/assets/monuments/chhatarpur-temple.jpg", description: "Sprawling 70-acre temple complex dedicated to Goddess Katyayani built in white marble" },
    { id: "detail", label: "Colossal Hanuman Statue", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Chhatarpur_Temple.jpg/800px-Chhatarpur_Temple.jpg", description: "Towering 101-foot terracotta-hued idol of Lord Hanuman standing at the south entrance" },
  ],
  "nizamuddin-dargah": [
    { id: "facade", label: "Holy Shrine Courtyard", url: "/assets/monuments/nizamuddin-dargah.jpg", description: "Sacred 14th-century Sufi sanctuary of Hazrat Nizamuddin Auliya and poet Amir Khusrau" },
    { id: "sunset", label: "Thursday Evening Qawwali Night", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nizamuddin_Dargah.jpg/800px-Nizamuddin_Dargah.jpg", description: "Lamps illuminated across the courtyard with traditional Qawwali singers performing" },
  ],
  "garden-of-five-senses": [
    { id: "facade", label: "Spiral Stone Walkways", url: "/assets/monuments/garden-of-five-senses.jpg", description: "20-acre leisure park designed to awaken sight, sound, touch, smell, and taste near Saidul Ajaib" },
    { id: "detail", label: "Solar Energy & Sculpture Court", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Garden_of_Five_Senses.jpg/800px-Garden_of_Five_Senses.jpg", description: "Traditional terracotta bell installations and contemporary stone sculptures" },
  ],
  "buddha-jayanti-park": [
    { id: "facade", label: "Gilded Buddha Statue", url: "/assets/monuments/buddha-jayanti-park.jpg", description: "Golden Buddha statue in dhyana mudra gifted by the people of Japan on the Delhi Ridge" },
    { id: "aerial", label: "Lush Forest Canopy Trails", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Buddha_Jayanti_Park_Delhi.jpg/800px-Buddha_Jayanti_Park_Delhi.jpg", description: "Peaceful wooded trails winding through native ridge trees and flowering bougainvillea" },
  ],
};

export function getMonumentViews(slug: string): MonumentViewAngle[] {
  if (monumentViews[slug] && monumentViews[slug].length > 0) return monumentViews[slug];
  const baseImg = getMonumentImage(slug);
  return [
    { id: "facade", label: "Grand Exterior View", url: baseImg, description: "Authentic documented view of this Delhi monument" },
    { id: "aerial", label: "Atmospheric Heritage Perspective", url: "/assets/hero/delhi-hero-panoramic.jpg", description: "Surrounding historic setting and architectural environment in Delhi" },
    { id: "detail", label: "Architectural Craft Detail", url: "/assets/eras/era-mughal.jpg", description: "Stone masonry and generational Indian craftsmanship detail" },
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

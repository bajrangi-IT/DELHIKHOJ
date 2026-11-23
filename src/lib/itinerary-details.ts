import { haversineKm } from "@/lib/utils";

export interface StartingLocation {
  name: string;
  category: "Airport" | "Railway Station" | "Hotel Hub" | "Central Delhi" | "South Delhi" | "NCR";
  lat: number;
  lng: number;
  description: string;
}

export const DELHI_STARTING_LOCATIONS: StartingLocation[] = [
  {
    name: "Indira Gandhi International Airport (T3)",
    category: "Airport",
    lat: 28.5562,
    lng: 77.1000,
    description: "International arrivals & departures terminal with Airport Express Metro.",
  },
  {
    name: "IGI Airport Terminal 1 (Domestic)",
    category: "Airport",
    lat: 28.5684,
    lng: 77.1121,
    description: "Domestic departures & Magenta Line Metro connectivity.",
  },
  {
    name: "New Delhi Railway Station (NDLS)",
    category: "Railway Station",
    lat: 28.6428,
    lng: 77.2197,
    description: "Primary rail gateway near Paharganj with Yellow Line Metro & Airport Line.",
  },
  {
    name: "Old Delhi Railway Station (DLI)",
    category: "Railway Station",
    lat: 28.6612,
    lng: 77.2276,
    description: "Historic junction next to Chandni Chowk and Red Fort.",
  },
  {
    name: "Hazrat Nizamuddin Railway Station",
    category: "Railway Station",
    lat: 28.5883,
    lng: 77.2543,
    description: "Gateway for Taj Express, Gatimaan & Southern trains, near Humayun's Tomb.",
  },
  {
    name: "Aerocity Hospitality District",
    category: "Hotel Hub",
    lat: 28.5492,
    lng: 77.1215,
    description: "Premier luxury airport hotel zone (JW Marriott, Pullman, Roseate, Ibis).",
  },
  {
    name: "Connaught Place (Inner / Outer Circle)",
    category: "Central Delhi",
    lat: 28.6315,
    lng: 77.2167,
    description: "Heart of Delhi with colonial colonnades, major hotels, and Rajiv Chowk Metro.",
  },
  {
    name: "Janpath & Imperial Hotel Area",
    category: "Central Delhi",
    lat: 28.6245,
    lng: 77.2185,
    description: "Central historic avenue near Cottage Industries, The Imperial & Janpath Market.",
  },
  {
    name: "Paharganj Hotel & Backpacker Zone",
    category: "Hotel Hub",
    lat: 28.6445,
    lng: 77.2135,
    description: "Budget traveler & boutique haven directly opposite NDLS station.",
  },
  {
    name: "Karol Bagh & Pusa Road",
    category: "Hotel Hub",
    lat: 28.6514,
    lng: 77.1907,
    description: "Bustling shopping hub with numerous 3-star & 4-star boutique hotels.",
  },
  {
    name: "Chanakyapuri Diplomatic Enclave",
    category: "Central Delhi",
    lat: 28.5983,
    lng: 77.1895,
    description: "Serene embassy avenue, Taj Palace, Leela Palace and Ashoka Hotel.",
  },
  {
    name: "Saket & Select Citywalk Area",
    category: "South Delhi",
    lat: 28.5245,
    lng: 77.2066,
    description: "Modern South Delhi hub close to Qutub Minar, Mehrauli and Garden of 5 Senses.",
  },
  {
    name: "Hauz Khas Village & Enclave",
    category: "South Delhi",
    lat: 28.5494,
    lng: 77.1932,
    description: "Medieval reservoir, chic boutiques, lakeside cafes, and heritage stays.",
  },
  {
    name: "Kashmere Gate ISBT",
    category: "Railway Station",
    lat: 28.6677,
    lng: 77.2279,
    description: "North Delhi inter-state bus terminal and major triple-line metro interchange.",
  },
  {
    name: "Cyber Hub / DLF Phase 2 (Gurugram)",
    category: "NCR",
    lat: 28.4952,
    lng: 77.0890,
    description: "Corporate hub connecting to Delhi via Yellow Line Rapid Metro.",
  },
  {
    name: "Noida Sector 18 (Atta Market Hub)",
    category: "NCR",
    lat: 28.5708,
    lng: 77.3260,
    description: "Commercial & hotel center connected by Blue Line Metro.",
  },
];

export interface HotelRecommendation {
  name: string;
  category: "Luxury Heritage" | "Boutique & Mid-Range" | "Budget & Hostel";
  area: string;
  pricePerNight: string;
  rating: number;
  highlight: string;
  amenities: string[];
  bookingTip: string;
}

export const DELHI_HOTELS: HotelRecommendation[] = [
  // Luxury Heritage
  {
    name: "The Imperial, Janpath",
    category: "Luxury Heritage",
    area: "Connaught Place / Janpath",
    pricePerNight: "₹16,500 – ₹24,000",
    rating: 4.8,
    highlight: "1931 Art Deco colonial palace with Museum art galleries, lush palms and fine dining.",
    amenities: ["Heritage Pool", "Ayurvedic Spa", "High Tea Atrium", "5 Fine Dining Venues"],
    bookingTip: "Ideal for walking to Janpath market and catching the Yellow/Violet Metro lines.",
  },
  {
    name: "Haveli Dharampura",
    category: "Luxury Heritage",
    area: "Old Delhi (Chandni Chowk)",
    pricePerNight: "₹11,000 – ₹16,000",
    rating: 4.7,
    highlight: "UNESCO-awarded 200-year-old Mughal haveli with rooftop sunset views of Jama Masjid.",
    amenities: ["Kathak Evenings", "Mughlai Dining", "Rooftop Kite Flying", "Heritage Courtyard"],
    bookingTip: "Walking distance to Red Fort and Jama Masjid; staff will meet you at metro with luggage cart.",
  },
  {
    name: "The Taj Mahal Hotel (Taj Mansingh)",
    category: "Luxury Heritage",
    area: "Lutyens' Delhi",
    pricePerNight: "₹18,000 – ₹28,000",
    rating: 4.9,
    highlight: "Iconic Delhi diplomatic address famed for Machan and panoramic views of India Gate.",
    amenities: ["Jiva Spa", "Outdoor Pool", "Machan 24h Cafe", "House of Ming"],
    bookingTip: "Just 5 minutes from India Gate, Khan Market, and National Gallery of Modern Art.",
  },
  {
    name: "Maidens Hotel",
    category: "Luxury Heritage",
    area: "Civil Lines (North Delhi)",
    pricePerNight: "₹8,500 – ₹13,000",
    rating: 4.6,
    highlight: "Colonial gem established in 1903 with eight acres of emerald gardens and peacocks.",
    amenities: ["Colonial Verandah", "Garden Pool", "Cavalry Bar", "Complimentary High Speed Wi-Fi"],
    bookingTip: "Quiet retreat close to Old Delhi, St. James Church, and Kashmere Gate.",
  },

  // Mid-Range & Boutique
  {
    name: "Bloomrooms @ Janpath",
    category: "Boutique & Mid-Range",
    area: "Connaught Place",
    pricePerNight: "₹4,200 – ₹5,800",
    rating: 4.5,
    highlight: "Bright signature yellow-and-white minimalist boutique hotel with pristine cloud beds.",
    amenities: ["Artisan Cafe", "High-speed Wi-Fi", "Rain Showers", "Free Airport Transfer Shuttle"],
    bookingTip: "Top value in Central Delhi; within 3 minutes walk of Janpath metro station.",
  },
  {
    name: "Ibis New Delhi Aerocity",
    category: "Boutique & Mid-Range",
    area: "Aerocity (Airport)",
    pricePerNight: "₹4,500 – ₹6,200",
    rating: 4.4,
    highlight: "Contemporary airport hotel with heated outdoor swimming pool and 24/7 dining.",
    amenities: ["Outdoor Pool", "Spice It Buffet", "Airport Express Link", "Fitness Centre"],
    bookingTip: "Superb for early departures or late arrivals with direct 15-min metro to Connaught Place.",
  },
  {
    name: "The Manor",
    category: "Boutique & Mid-Range",
    area: "Friends Colony (South Delhi)",
    pricePerNight: "₹5,500 – ₹7,800",
    rating: 4.6,
    highlight: "Quiet 14-room mid-century modernist boutique sanctuary surrounded by shaded trees.",
    amenities: ["Courtyard Cafe", "Spa Treatments", "Yoga Lawn", "Curated Art Collection"],
    bookingTip: "Convenient for South Delhi heritage tours around Humayun's Tomb and Lotus Temple.",
  },

  // Budget & Hostels
  {
    name: "Zostel Delhi",
    category: "Budget & Hostel",
    area: "Paharganj (Opposite NDLS)",
    pricePerNight: "₹850 (Dorm) – ₹2,400 (Private)",
    rating: 4.6,
    highlight: "Delhi's favorite backpacker community hub with lively rooftop cafe, game nights & walks.",
    amenities: ["Rooftop Cafe", "Lockers", "Common Room", "Daily Walking Tours"],
    bookingTip: "Directly opposite New Delhi Railway Station; meeting point for international solo travelers.",
  },
  {
    name: "goStops Delhi",
    category: "Budget & Hostel",
    area: "Delhi Gate (Near Daryaganj)",
    pricePerNight: "₹800 (Dorm) – ₹2,200 (Private)",
    rating: 4.5,
    highlight: "Vibrant social hostel right on the cusp of Old and New Delhi with Delhi Gate Metro.",
    amenities: ["Cinema Lounge", "Mini Library", "Luggage Storage", "Travel Desk"],
    bookingTip: "Step right out onto Delhi Gate metro and walk to Sunday Book Market in Daryaganj.",
  },
];

export interface FoodSpot {
  name: string;
  locality: string;
  signatureDish: string;
  avgCostForTwo: string;
  vibe: string;
  whyGo: string;
  timing: string;
}

export const DELHI_FOODS: FoodSpot[] = [
  {
    name: "Karim's (Est. 1913)",
    locality: "Gali Kababian, Jama Masjid (Old Delhi)",
    signatureDish: "Mutton Burra Kebab, Shahi Rogan Josh & Tandoori Roti",
    avgCostForTwo: "₹800 – ₹1,200",
    vibe: "Legendary Mughal culinary institution with bustling open tandoor ovens.",
    whyGo: "Founded by royal chefs of the last Mughal Emperor Bahadur Shah Zafar.",
    timing: "11:00 AM – 11:30 PM",
  },
  {
    name: "Paranthe Wali Gali",
    locality: "Chandni Chowk (Old Delhi)",
    signatureDish: "Khoya Parantha, Rabri Parantha & Mirch Parantha with Pumpkin Subzi",
    avgCostForTwo: "₹250 – ₹400",
    vibe: "Historic narrow culinary alley frying golden vegetarian paranthas since the 1870s.",
    whyGo: "Served with unlimited sweet imli (tamarind) chutney and aloo methi curry.",
    timing: "9:00 AM – 10:30 PM",
  },
  {
    name: "Saravana Bhavan",
    locality: "Janpath & Connaught Place",
    signatureDish: "Ghee Roast Masala Dosa, Mini Tiffin & South Indian Filter Kaapi",
    avgCostForTwo: "₹450 – ₹650",
    vibe: "Spotless, buzzing authentic South Indian diner with rapid brass cup service.",
    whyGo: "The most dependable and authentic vegetarian breakfast & lunch in Central Delhi.",
    timing: "8:00 AM – 11:00 PM",
  },
  {
    name: "Kake Da Hotel (Est. 1931)",
    locality: "Outer Circle, Connaught Place",
    signatureDish: "Dahi Meat, Kadhai Chicken & Butter Naan",
    avgCostForTwo: "₹550 – ₹800",
    vibe: "Post-partition Punjabi culinary temple simmering copper degchis on coal.",
    whyGo: "Rich, aromatic slow-cooked meat gravies loved by generations of Delhiites.",
    timing: "12:00 PM – 12:00 AM",
  },
  {
    name: "Wenger's Bakery & Deli (Est. 1926)",
    locality: "A-Block, Connaught Place",
    signatureDish: "Shammi Kebab Sandwich, Chicken Patties & Chocolate Hazelnut Waffles",
    avgCostForTwo: "₹350 – ₹500",
    vibe: "Delhi's very first Swiss confectionery with pristine vintage display counters.",
    whyGo: "Grab warm flaky savories and eat them on the breezy central colonnades of CP.",
    timing: "11:00 AM – 8:00 PM",
  },
  {
    name: "Gulati Restaurant",
    locality: "Pandara Road Market (Near India Gate)",
    signatureDish: "Murgh Makhani (Butter Chicken), Dal Panchmel & Kakori Kebabs",
    avgCostForTwo: "₹1,400 – ₹2,000",
    vibe: "Opulent North Indian dining famed as the undisputed capital of Delhi Butter Chicken.",
    whyGo: "Perfect dinner destination after an evening walk around India Gate and Kartavya Path.",
    timing: "12:00 PM – 12:00 AM",
  },
  {
    name: "Ghalib Kebab Corner",
    locality: "Nizamuddin Basti (Near Humayun's Tomb)",
    signatureDish: "Mutton Shami Kebabs, Buffalo Tikka & Sheermal",
    avgCostForTwo: "₹250 – ₹400",
    vibe: "Rustic sufi street food stall named after Mirza Ghalib serving juicy skewers.",
    whyGo: "Tender kebabs melt on the tongue; pair with hot mint chutney and onion rings.",
    timing: "12:00 PM – 11:00 PM",
  },
  {
    name: "Olive Bar & Kitchen",
    locality: "One Style Mile, Mehrauli",
    signatureDish: "Wood-fired Truffle Pizza, Mezze Platter & Tiramisu",
    avgCostForTwo: "₹3,200 – ₹4,500",
    vibe: "Stunning white-walled Mediterranean courtyard under a banyan tree with Qutub views.",
    whyGo: "Delhi's most romantic heritage dinner spot just 5 minutes from Qutub Minar.",
    timing: "12:30 PM – 11:30 PM",
  },
  {
    name: "Kuremal Mohan Lal Kulfi (Est. 1906)",
    locality: "Sitaram Bazar (Chawri Bazar)",
    signatureDish: "Whole Stuffed Aam (Mango) Kulfi & Pomegranate Kulfi",
    avgCostForTwo: "₹150 – ₹300",
    vibe: "Hundred-year-old ice master carving natural frozen fruits.",
    whyGo: "Whole real mangoes, oranges and apples hollowed out and filled with creamy rabri kulfi.",
    timing: "10:00 AM – 10:30 PM",
  },
];

export interface ItineraryTimingSlot {
  time: string;
  title: string;
  type: "transit" | "monument" | "meal" | "bazaar" | "sunset" | "wrap";
  durationMinutes: number;
  description: string;
  locationName: string;
}

export function generateComprehensiveTimeline(
  startName: string,
  destinationName: string,
  stops: { name: string; minutes: number; kind: string }[],
  transport: "transit" | "driving" | "walking" | "bicycling" = "transit"
): ItineraryTimingSlot[] {
  const slots: ItineraryTimingSlot[] = [];
  let currentHour = 9;
  let currentMinute = 0;

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMin} ${period}`;
  };

  const advance = (mins: number) => {
    const timeStr = formatTime(currentHour, currentMinute);
    currentMinute += mins;
    while (currentMinute >= 60) {
      currentMinute -= 60;
      currentHour += 1;
    }
    return timeStr;
  };

  // 1. Departure from Starting Point
  const t1 = advance(35);
  slots.push({
    time: t1,
    title: `Depart from ${startName}`,
    type: "transit",
    durationMinutes: 35,
    description: `Begin journey towards ${destinationName} via ${transport === "transit" ? "Delhi Metro network" : transport === "driving" ? "private cab / taxi" : "walking route"}.`,
    locationName: startName,
  });

  // 2. Main Destination
  const mainStop = stops[0];
  const mainDuration = mainStop?.minutes || 90;
  const t2 = advance(mainDuration);
  slots.push({
    time: t2,
    title: `Explore ${destinationName}`,
    type: "monument",
    durationMinutes: mainDuration,
    description: `Fast-track security entry, architectural tour of main monuments, photography points and museum galleries.`,
    locationName: destinationName,
  });

  // 3. Subsequent Stops or Lunch
  let lunchInserted = false;

  for (let i = 1; i < stops.length; i++) {
    const s = stops[i];

    // Insert lunch around 1:00 PM if not yet added
    if (!lunchInserted && currentHour >= 13) {
      lunchInserted = true;
      const tl = advance(60);
      slots.push({
        time: tl,
        title: "Traditional Delhi Lunch & Culinary Pause",
        type: "meal",
        durationMinutes: 60,
        description: `Savor authentic regional flavors at iconic eateries near the route (Paranthe Wali Gali, Karim's or Saravana Bhavan).`,
        locationName: "Curated Route Eatery",
      });
    }

    // Inter-stop transit
    const tt = advance(20);
    slots.push({
      time: tt,
      title: `Transit to ${s.name}`,
      type: "transit",
      durationMinutes: 20,
      description: `Short hop via e-rickshaw / metro to the next historical site.`,
      locationName: s.name,
    });

    // Stop exploration
    const ts = advance(s.minutes || 60);
    slots.push({
      time: ts,
      title: `Visit ${s.name}`,
      type: s.kind === "market" ? "bazaar" : "monument",
      durationMinutes: s.minutes || 60,
      description: `Explore pavilions, artisan workshops and local curiosities.`,
      locationName: s.name,
    });
  }

  // If lunch hasn't been inserted yet
  if (!lunchInserted) {
    const tl = advance(50);
    slots.push({
      time: tl,
      title: "Delhi Food Walk & Refuel",
      type: "meal",
      durationMinutes: 50,
      description: `Sample signature local snacks and refreshing beverages.`,
      locationName: "Local Eatery",
    });
  }

  // Evening Sunset & Wrap
  const tw = advance(35);
  slots.push({
    time: tw,
    title: "Sunset View & Journey Wrap-up",
    type: "sunset",
    durationMinutes: 35,
    description: `Golden hour photography, local bazaar souvenir shopping and leisurely return transit to ${startName}.`,
    locationName: "Sunset Promenade",
  });

  return slots;
}

export interface StartingLocation {
  name: string;
  category: "Airport" | "Railway Station" | "Hotel Hub" | "Central Delhi" | "South Delhi" | "North Delhi" | "NCR";
  lat: number;
  lng: number;
  description: string;
  aliases: string[];
}

export const DELHI_STARTING_LOCATIONS: StartingLocation[] = [
  // Airports
  {
    name: "Indira Gandhi International Airport (T3)",
    category: "Airport",
    lat: 28.5562,
    lng: 77.1000,
    description: "International arrivals & departures terminal with Airport Express Metro.",
    aliases: ["del", "igi", "t3", "airport", "international airport", "indira gandhi"],
  },
  {
    name: "IGI Airport Terminal 1 (Domestic)",
    category: "Airport",
    lat: 28.5684,
    lng: 77.1121,
    description: "Domestic low-cost flights (Indigo, SpiceJet) & Magenta Line Metro.",
    aliases: ["t1", "terminal 1", "domestic airport"],
  },
  {
    name: "IGI Airport Terminal 2",
    category: "Airport",
    lat: 28.5575,
    lng: 77.0988,
    description: "Adjacent to Terminal 3 for domestic operations.",
    aliases: ["t2", "terminal 2"],
  },

  // Railway & Transit Hubs
  {
    name: "New Delhi Railway Station (NDLS)",
    category: "Railway Station",
    lat: 28.6428,
    lng: 77.2197,
    description: "Primary rail gateway near Paharganj with Yellow Line Metro & Airport Line.",
    aliases: ["ndls", "new delhi station", "railway station", "paharganj station"],
  },
  {
    name: "Old Delhi Railway Station (DLI)",
    category: "Railway Station",
    lat: 28.6612,
    lng: 77.2276,
    description: "Historic junction next to Chandni Chowk and Red Fort.",
    aliases: ["dli", "old delhi station", "purani dilli station"],
  },
  {
    name: "Hazrat Nizamuddin Railway Station (NZM)",
    category: "Railway Station",
    lat: 28.5883,
    lng: 77.2543,
    description: "Gateway for Taj Express, Gatimaan & Southern trains, near Humayun's Tomb.",
    aliases: ["nzm", "nizamuddin station", "hazrat nizamuddin"],
  },
  {
    name: "Anand Vihar Railway Terminal & ISBT",
    category: "Railway Station",
    lat: 28.6469,
    lng: 77.3160,
    description: "East Delhi inter-state rail and bus terminal with Blue Line Metro.",
    aliases: ["anvt", "anand vihar", "isbt anand vihar"],
  },
  {
    name: "Kashmere Gate ISBT & Metro Hub",
    category: "Railway Station",
    lat: 28.6677,
    lng: 77.2279,
    description: "North Delhi inter-state bus terminal and major triple-line metro interchange.",
    aliases: ["isbt", "kashmere gate", "kashmiri gate"],
  },
  {
    name: "Sarai Kale Khan ISBT & Nizamuddin",
    category: "Railway Station",
    lat: 28.5912,
    lng: 77.2560,
    description: "Bus terminal connecting south and east corridors near Ring Road.",
    aliases: ["sarai kale khan", "kale khan"],
  },

  // Central Delhi & Hotel Clusters
  {
    name: "Connaught Place (CP / Rajiv Chowk)",
    category: "Central Delhi",
    lat: 28.6315,
    lng: 77.2167,
    description: "Colonial white colonnades, luxury dining, Central Park & Rajiv Chowk Metro.",
    aliases: ["cp", "connaught place", "rajiv chowk", "central delhi"],
  },
  {
    name: "Aerocity Hospitality District",
    category: "Hotel Hub",
    lat: 28.5492,
    lng: 77.1215,
    description: "Luxury airport hotel enclave (JW Marriott, Pullman, Roseate, Ibis, Andaz).",
    aliases: ["aerocity", "hotel hub", "pullman", "jw marriott", "andaz"],
  },
  {
    name: "Janpath & Windsor Place",
    category: "Central Delhi",
    lat: 28.6245,
    lng: 77.2185,
    description: "Central historic avenue near The Imperial, Le Meridien, Shangri-La & Cottage Emporium.",
    aliases: ["janpath", "the imperial", "le meridien", "shangrila"],
  },
  {
    name: "Paharganj Main Bazaar Hotel Zone",
    category: "Hotel Hub",
    lat: 28.6445,
    lng: 77.2135,
    description: "Vibrant traveler & backpacker haven directly opposite NDLS station.",
    aliases: ["paharganj", "main bazaar", "zostel"],
  },
  {
    name: "Karol Bagh (Ajmal Khan Road)",
    category: "Hotel Hub",
    lat: 28.6514,
    lng: 77.1907,
    description: "Bustling shopping hub with numerous 3-star & 4-star boutique hotels.",
    aliases: ["karol bagh", "ajmal khan", "pusa road"],
  },
  {
    name: "Chanakyapuri Diplomatic Enclave",
    category: "Central Delhi",
    lat: 28.5983,
    lng: 77.1895,
    description: "Serene embassy avenue, Taj Palace, Leela Palace and ITC Maurya.",
    aliases: ["chanakyapuri", "embassy", "leela palace", "itc maurya", "taj palace"],
  },
  {
    name: "Chandni Chowk & Haveli Dharampura",
    category: "Central Delhi",
    lat: 28.6506,
    lng: 77.2303,
    description: "Heritage Mughal walled city, Dariba Kalan jewelry, spice markets.",
    aliases: ["chandni chowk", "dharampura", "haveli", "old delhi"],
  },

  // South Delhi
  {
    name: "Saket & Select Citywalk Area",
    category: "South Delhi",
    lat: 28.5245,
    lng: 77.2066,
    description: "Modern South Delhi hub close to Qutub Minar, Mehrauli and Garden of 5 Senses.",
    aliases: ["saket", "select citywalk", "mehrauli road"],
  },
  {
    name: "Hauz Khas Village & Enclave (HKV)",
    category: "South Delhi",
    lat: 28.5494,
    lng: 77.1932,
    description: "Medieval reservoir, chic boutiques, lakeside cafes, and heritage stays.",
    aliases: ["hkv", "hauz khas", "hauz khas village"],
  },
  {
    name: "South Extension & Defence Colony",
    category: "South Delhi",
    lat: 28.5714,
    lng: 77.2215,
    description: "Prime lifestyle, boutique dining and shopping district near Ring Road.",
    aliases: ["south ex", "south extension", "defence colony", "def col"],
  },
  {
    name: "Greater Kailash (GK 1 & GK 2)",
    category: "South Delhi",
    lat: 28.5482,
    lng: 77.2426,
    description: "Celebrated M-Block & N-Block markets, cafes, and upscale stays.",
    aliases: ["gk", "gk1", "gk2", "greater kailash"],
  },
  {
    name: "Lajpat Nagar Central Market",
    category: "South Delhi",
    lat: 28.5700,
    lng: 77.2370,
    description: "Major textile bazaar, street food, and metro interchange.",
    aliases: ["lajpat nagar", "central market"],
  },
  {
    name: "Vasant Kunj Malls & Boutique Hotels",
    category: "South Delhi",
    lat: 28.5398,
    lng: 77.1555,
    description: "Upscale residential neighborhood with DLF Promenade and The Grand.",
    aliases: ["vasant kunj", "dlf promenade", "the grand"],
  },
  {
    name: "Lodhi Colony & Art District",
    category: "South Delhi",
    lat: 28.5833,
    lng: 77.2250,
    description: "India's first open-air public art district near India Habitat Centre.",
    aliases: ["lodhi", "lodhi colony", "lodhi art district"],
  },

  // North & West Delhi
  {
    name: "Civil Lines & Maidens Hotel",
    category: "North Delhi",
    lat: 28.6782,
    lng: 77.2235,
    description: "Leafy British-era residential retreat with colonial mansions.",
    aliases: ["civil lines", "maidens hotel", "north delhi"],
  },
  {
    name: "Majnu Ka Tilla (Tibetan Colony)",
    category: "North Delhi",
    lat: 28.7008,
    lng: 77.2268,
    description: "Little Tibet on the Yamuna banks with monasteries, cafes & laphing.",
    aliases: ["mkt", "majnu ka tilla", "tibetan colony"],
  },
  {
    name: "Dwarka Sector 21 (Metro Interchange)",
    category: "Hotel Hub",
    lat: 28.5522,
    lng: 77.0583,
    description: "Sub-city junction linking Blue Line and Airport Express line.",
    aliases: ["dwarka", "dwarka sec 21"],
  },
  {
    name: "Rohini Sector 10 (City Centre)",
    category: "North Delhi",
    lat: 28.7165,
    lng: 77.1147,
    description: "Red Line metro hub, malls, and Adventure Island.",
    aliases: ["rohini", "rohini sec 10"],
  },

  // NCR Suburbs
  {
    name: "Cyber Hub / DLF Phase 2 (Gurugram)",
    category: "NCR",
    lat: 28.4952,
    lng: 77.0890,
    description: "Corporate & dining promenade connected via Yellow Line Rapid Metro.",
    aliases: ["gurgaon", "gurugram", "cyber hub", "dlf cyber hub", "dlf phase 2"],
  },
  {
    name: "Noida Sector 18 (Atta Market & Mall of India)",
    category: "NCR",
    lat: 28.5708,
    lng: 77.3260,
    description: "Major entertainment, hotel, and shopping district on Blue Line.",
    aliases: ["noida", "noida sec 18", "atta market", "mall of india"],
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

/**
 * Generates an accurate, duration-sensitive schedule.
 * - half-day: ~4 hours (e.g. 09:00 AM to 01:00 PM)
 * - full-day: ~8 hours (e.g. 09:00 AM to 05:30 PM)
 * - multi-day: per-day schedule based on the selected day
 */
export function generateComprehensiveTimeline(
  startName: string,
  destinationName: string,
  stops: { name: string; minutes: number; kind: string }[],
  transport: "transit" | "driving" | "walking" | "bicycling" = "transit",
  duration: "half-day" | "full-day" | "multi-day" = "full-day",
  dayIndex: number = 0,
  totalDays: number = 1
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

  // Case 1: HALF-DAY ITINERARY (~4 Hours Total)
  if (duration === "half-day") {
    // 09:00 AM: Transit to Monument
    const tStart = advance(30);
    slots.push({
      time: tStart,
      title: `Depart from ${startName}`,
      type: "transit",
      durationMinutes: 30,
      description: `Fast transit towards ${destinationName} via ${transport === "transit" ? "Delhi Metro & e-rickshaw" : transport === "driving" ? "cab / taxi" : "walking route"}.`,
      locationName: startName,
    });

    // 09:30 AM: Primary Monument (105 mins)
    const tMain = advance(105);
    slots.push({
      time: tMain,
      title: `Explore ${destinationName}`,
      type: "monument",
      durationMinutes: 105,
      description: `Fast-track security entry, main pavilion exploration, architectural photography and museum visit.`,
      locationName: destinationName,
    });

    // 11:15 AM: Adjacent Stop or Scenic Viewpoint (45 mins)
    const secondaryStop = stops[1]?.name || "Adjacent Heritage Gardens";
    const tSecond = advance(45);
    slots.push({
      time: tSecond,
      title: `Visit ${secondaryStop}`,
      type: "monument",
      durationMinutes: 45,
      description: `Short walk to nearby historical arches, gardens, and scenic photo vantage points.`,
      locationName: secondaryStop,
    });

    // 12:00 PM: Traditional Delhi Snack & Tea Refuel (30 mins)
    const tSnack = advance(30);
    slots.push({
      time: tSnack,
      title: "Delhi Street Food & Chai Refreshment",
      type: "meal",
      durationMinutes: 30,
      description: `Savor authentic street snacks (samosas, kachori, or famous Delhi kulfi) and hot spiced chai.`,
      locationName: "Local Bazaar Corner",
    });

    // 12:30 PM: Return Transit (30 mins)
    const tReturn = advance(30);
    slots.push({
      time: tReturn,
      title: `Return to ${startName}`,
      type: "wrap",
      durationMinutes: 30,
      description: `Smooth return transit. Half-day itinerary concludes right around 1:00 PM in time for lunch!`,
      locationName: startName,
    });

    return slots;
  }

  // Case 2: FULL-DAY or MULTI-DAY ITINERARY (~8 Hours)
  const dayPrefix = totalDays > 1 ? `Day ${dayIndex + 1}: ` : "";

  // 1. Morning Departure
  const tStart = advance(35);
  slots.push({
    time: tStart,
    title: `${dayPrefix}Depart from ${startName}`,
    type: "transit",
    durationMinutes: 35,
    description: `Morning departure towards ${destinationName} via ${transport === "transit" ? "Delhi Metro network" : transport === "driving" ? "private cab" : "walking corridor"}.`,
    locationName: startName,
  });

  // 2. Primary Monument
  const mainStop = stops[0];
  const mainDuration = mainStop?.minutes || 90;
  const tMain = advance(mainDuration);
  slots.push({
    time: tMain,
    title: `Explore ${destinationName}`,
    type: "monument",
    durationMinutes: mainDuration,
    description: `Fast-track security entry, architectural tour of main monument, photography spots and museum pavilions.`,
    locationName: destinationName,
  });

  // 3. Middle Stops with Lunch
  let lunchInserted = false;
  for (let i = 1; i < stops.length; i++) {
    const s = stops[i];

    if (!lunchInserted && currentHour >= 13) {
      lunchInserted = true;
      const tl = advance(60);
      slots.push({
        time: tl,
        title: "Traditional Delhi Lunch & Culinary Pause",
        type: "meal",
        durationMinutes: 60,
        description: `Authentic regional dining at celebrated heritage eateries (Karim's, Paranthe Wali Gali, or Saravana Bhavan).`,
        locationName: "Curated Route Eatery",
      });
    }

    const tt = advance(20);
    slots.push({
      time: tt,
      title: `Transit to ${s.name}`,
      type: "transit",
      durationMinutes: 20,
      description: `Short connection to next historical stop.`,
      locationName: s.name,
    });

    const ts = advance(s.minutes || 60);
    slots.push({
      time: ts,
      title: `Visit ${s.name}`,
      type: s.kind === "market" ? "bazaar" : "monument",
      durationMinutes: s.minutes || 60,
      description: `Explore pavilions, artisan handicrafts and local curiosities.`,
      locationName: s.name,
    });
  }

  if (!lunchInserted) {
    const tl = advance(50);
    slots.push({
      time: tl,
      title: "Delhi Food Walk & Culinary Break",
      type: "meal",
      durationMinutes: 50,
      description: `Sample signature local snacks and refreshing beverages.`,
      locationName: "Local Eatery",
    });
  }

  // 4. Sunset View & Evening Wrap
  const tSunset = advance(45);
  slots.push({
    time: tSunset,
    title: "Sunset Promenade & Golden Hour Photography",
    type: "sunset",
    durationMinutes: 45,
    description: `Spectacular golden hour views of heritage stone monuments and bustling evening bazaar atmosphere.`,
    locationName: "Sunset Vantage Point",
  });

  // 5. Return Transit
  const tWrap = advance(35);
  slots.push({
    time: tWrap,
    title: `Return to ${startName}`,
    type: "wrap",
    durationMinutes: 35,
    description: `Leisurely journey back to your hotel or origin station. Evening free to relax!`,
    locationName: startName,
  });

  return slots;
}

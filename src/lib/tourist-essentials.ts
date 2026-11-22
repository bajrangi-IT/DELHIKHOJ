export interface MonumentEssentials {
  timings: string;
  bestTime: string;
  closedOn: string;
  fees: {
    indian: number;
    saarc: number;
    foreigner: number;
    childrenUnder15: string;
  };
  metroStation: string;
  metroGate: string;
  metroLine: string;
  dressCode: string;
  photography: string;
  cloakroom: string;
  safetyTips: string[];
}

export const MONUMENT_ESSENTIALS: Record<string, MonumentEssentials> = {
  "red-fort": {
    timings: "9:30 AM – 4:30 PM",
    bestTime: "Morning (9:30 AM) or late afternoon (3:30 PM)",
    closedOn: "Mondays",
    fees: { indian: 50, saarc: 50, foreigner: 550, childrenUnder15: "Free (ID required)" },
    metroStation: "Lal Qila Metro Station",
    metroGate: "Gate No. 4 (Violet Line) or Chandni Chowk (Yellow Line, Gate 1)",
    metroLine: "Violet Line & Yellow Line",
    dressCode: "Comfortable walking shoes recommended. Modest casual attire appropriate.",
    photography: "Mobile cameras free. Still camera ₹25. Commercial tripods & drones strictly prohibited.",
    cloakroom: "Available near Lahori Gate security checkpoint (electronic locker ₹10–₹20).",
    safetyTips: [
      "Only buy tickets online or at the official ASI ticket counters near Lahori Gate.",
      "Beware of unofficial touts claiming the main fort is closed or offering queue jumps.",
      "Keep your phone and wallet secure when crossing the Netaji Subhash Marg entrance road."
    ]
  },
  "qutub-minar": {
    timings: "7:00 AM – 9:00 PM (Illuminated at night)",
    bestTime: "Late afternoon (4:00 PM) to catch sunset and night illumination",
    closedOn: "Open all 7 days",
    fees: { indian: 50, saarc: 50, foreigner: 550, childrenUnder15: "Free" },
    metroStation: "Qutub Minar Metro Station",
    metroGate: "Gate No. 2 (Yellow Line) — 1.5 km (take ₹30 e-rickshaw)",
    metroLine: "Yellow Line",
    dressCode: "Comfortable footwear for exploring the sprawling stone pavilions.",
    photography: "Mobile and amateur photography allowed. Video cameras require token fee.",
    cloakroom: "Cloakroom available at the visitor entry gate.",
    safetyTips: [
      "Entry inside the minaret shaft is permanently closed for public safety.",
      "Do not touch or scratch ancient stone inscriptions on the Iron Pillar or Alai Darwaza.",
      "Fixed rate e-rickshaws available from Metro station to gate."
    ]
  },
  "humayuns-tomb": {
    timings: "6:00 AM – 6:00 PM (Sunrise to Sunset)",
    bestTime: "Early morning (7:00 AM) for tranquil gardens and soft photography light",
    closedOn: "Open all 7 days",
    fees: { indian: 50, saarc: 50, foreigner: 550, childrenUnder15: "Free" },
    metroStation: "JLN Stadium / Nizamuddin",
    metroGate: "Gate No. 2 (Violet Line) or Sarai Kale Khan - Nizamuddin (Pink Line)",
    metroLine: "Violet Line & Pink Line",
    dressCode: "Modest casual attire. Shaded pathways; sunhat recommended in summer.",
    photography: "DSLR cameras allowed (₹25 ticket). Tripods require written ASI permit.",
    cloakroom: "Visitor facility centre at entrance with luggage storage.",
    safetyTips: [
      "Combine your visit with the adjoining Sunder Nursery heritage park.",
      "Watch your step on steep historic stone stairs leading to the upper terrace.",
      "Official ASI guides with brass ID cards are available at the entrance gate."
    ]
  },
  "india-gate": {
    timings: "Open 24 hours (Kartavya Path promenade illuminated till 11:00 PM)",
    bestTime: "Sunset (5:30 PM – 9:00 PM) for vibrant Delhi evening atmosphere",
    closedOn: "Open all 7 days (Except security restrictions around Republic Day / Independence Day)",
    fees: { indian: 0, saarc: 0, foreigner: 0, childrenUnder15: "Free Entry (Public Memorial)" },
    metroStation: "Central Secretariat / Barakhamba",
    metroGate: "Gate No. 3 (Yellow/Violet Line) — connected via golf cart shuttle",
    metroLine: "Yellow Line & Violet Line",
    dressCode: "Casual attire. Open outdoor park grounds.",
    photography: "Unrestricted amateur photography allowed on lawns and promenade.",
    cloakroom: "No official cloakroom on public lawns; keep personal belongings with you.",
    safetyTips: [
      "Beware of persistent street vendors and instant photo printers claiming official badges.",
      "Use designated pedestrian underpasses to cross Kartavya Path safely.",
      "Visit the adjacent National War Memorial (entry free, open till 8:00 PM)."
    ]
  },
  "lotus-temple": {
    timings: "9:00 AM – 5:00 PM (Summer: till 6:00 PM)",
    bestTime: "Morning (9:30 AM) before peak queues form",
    closedOn: "Mondays",
    fees: { indian: 0, saarc: 0, foreigner: 0, childrenUnder15: "Free Entry for all" },
    metroStation: "Kalkaji Mandir",
    metroGate: "Gate No. 2 (Violet Line & Magenta Line interchange)",
    metroLine: "Violet Line & Magenta Line",
    dressCode: "Modest attire. Shoes must be deposited at free shoe room before inner sanctum.",
    photography: "Photography allowed in outer gardens only. Strictly prohibited inside the prayer hall.",
    cloakroom: "Free shoe deposit counter and bag check at main gate.",
    safetyTips: [
      "Complete silence must be maintained inside the central prayer hall.",
      "Weekend queues can be 30–45 minutes long; visit weekdays if possible.",
      "No food or loud music allowed inside the tranquil landscaped gardens."
    ]
  },
  "jama-masjid": {
    timings: "7:00 AM – 12:00 PM and 1:30 PM – 6:30 PM (Closed to visitors during prayer times)",
    bestTime: "Early morning (8:00 AM – 11:00 AM)",
    closedOn: "Open daily (Restricted entry during Friday congregational prayers 12:00–2:00 PM)",
    fees: { indian: 0, saarc: 0, foreigner: 0, childrenUnder15: "Free Entry (₹300 fee for camera/phone photography)" },
    metroStation: "Jama Masjid Metro Station",
    metroGate: "Gate No. 2 (Violet Line) — 200 metres from Gate 1 of Masjid",
    metroLine: "Violet Line",
    dressCode: "Strict modest dress: arms and legs covered. Head coverings mandatory (robes available at gate for rent).",
    photography: "₹300 ticket for mobile/camera photography at entry gate.",
    cloakroom: "Shoe racks available at gates (pay ₹10–₹20 volunteer tip).",
    safetyTips: [
      "Avoid unofficial agents offering robes or guide services at inflated rates.",
      "Climbing the southern minaret requires a separate ticket (₹100) and offers panoramic Old Delhi views.",
      "Combine with street food exploration at Matia Mahal / Karim's right opposite Gate 1."
    ]
  },
  "akshardham": {
    timings: "10:00 AM – 7:00 PM (Exhibitions & Musical Fountain in evening)",
    bestTime: "Afternoon (3:00 PM) to enjoy exhibitions and evening Sahaj Anand water show",
    closedOn: "Mondays",
    fees: { indian: 0, saarc: 0, foreigner: 0, childrenUnder15: "Mandir Entry Free (Exhibitions ₹250, Water Show ₹90)" },
    metroStation: "Akshardham Metro Station",
    metroGate: "Gate No. 1 (Blue Line) — 300 metres from entrance",
    metroLine: "Blue Line",
    dressCode: "Strict dress code: Shoulders, chest, navel, and knees must be covered. Sarong rental available.",
    photography: "Strictly NO mobile phones, cameras, smartwatches, or electronics allowed inside complex.",
    cloakroom: "Free electronic security cloakroom provided for phones, bags, and electronics.",
    safetyTips: [
      "Expect thorough multi-tier security screening; leave non-essential electronics at your hotel.",
      "Plan at least 3–4 hours to experience the cultural boat ride, IMAX theatre, and gardens.",
      "Musical fountain light & water show starts at 7:15 PM every evening."
    ]
  },
  "gurudwara-bangla-sahib": {
    timings: "Open 24 hours daily (Langar community kitchen served throughout the day)",
    bestTime: "Morning (7:00 AM) or Evening (6:30 PM) during devotional Gurbani kirtan",
    closedOn: "Open all 365 days",
    fees: { indian: 0, saarc: 0, foreigner: 0, childrenUnder15: "Free Entry (Langar meal free for all)" },
    metroStation: "Shivaji Stadium / Patel Chowk",
    metroGate: "Gate No. 1 (Airport Express Line) or Patel Chowk Gate 2 (Yellow Line)",
    metroLine: "Airport Express & Yellow Line",
    dressCode: "Head must be covered (free yellow/orange scarves provided at entry). Shoes & socks deposited at shoe room.",
    photography: "Photography permitted in outer courtyard; prohibited inside the sanctum.",
    cloakroom: "Free organized shoe storage and wash facility (Joda Ghar).",
    safetyTips: [
      "Wash your hands and feet in the holy water basin (Charan Ganga) before stepping inside.",
      "Everyone of all faiths is welcome to sit and share Langar (free community meal) in the hall.",
      "Sarovar pool perimeter is sacred; do not dip feet with shoes nearby."
    ]
  }
};

export function getEssentialsForDestination(slug: string, destinationName: string, locality?: string | null): MonumentEssentials {
  if (MONUMENT_ESSENTIALS[slug]) {
    return MONUMENT_ESSENTIALS[slug];
  }
  return {
    timings: "9:00 AM – 5:00 PM (General monument timings)",
    bestTime: "Morning (9:30 AM – 11:30 AM)",
    closedOn: "Open most days; check local festival schedules",
    fees: { indian: 50, saarc: 50, foreigner: 550, childrenUnder15: "Free under 15" },
    metroStation: locality ? `${locality} Metro Station` : "Delhi Metro nearest interchange",
    metroGate: "Gate No. 1 / 2",
    metroLine: "Delhi Metro Network",
    dressCode: "Respectful casual clothing covering shoulders and knees.",
    photography: "Mobile phones allowed. Commercial video equipment requires permission.",
    cloakroom: "Security screening at gate; cloakroom counters available at prominent gates.",
    safetyTips: [
      "Always verify entry fees at the official entrance counter.",
      "Keep digital passes ready on your mobile device for quick scanning.",
      "Stay hydrated and prefer drinking packaged or verified filtered water."
    ]
  };
}

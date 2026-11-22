export { destinationSeed, attractionSeed, marketSeed } from "@/lib/delhi-data";

const day = 86400000;
export function eventSeed(now = Date.now()) {
  const at = (d: number, h: number) => new Date(new Date(now + d * day).setHours(h, 0, 0, 0));
  return [
    { title: "[DEMO] Old Delhi Heritage Walk", type: "heritage-walk", image: "/assets/events/heritage-walk.jpg", description: "Sample listing: a guided morning walk through the lanes around Jama Masjid. Demonstration data — not a real scheduled event.", venue: "Jama Masjid, Old Delhi", locality: "Old Delhi", lat: 28.6507, lng: 77.2334, startsAt: at(5, 7), isFree: false, priceNote: "Demo — no real price", familyFriendly: true, organiser: null, sourceUrl: null, bookingUrl: null },
    { title: "[DEMO] Mughal Gardens Photography Morning", type: "workshop", image: "/assets/events/mughal-gardens.jpg", description: "Sample listing for a photography workshop at a garden tomb. Demonstration data only.", venue: "Humayun's Tomb area", locality: "Nizamuddin", lat: 28.5933, lng: 77.2507, startsAt: at(9, 8), isFree: false, priceNote: "Demo — no real price", familyFriendly: false, organiser: null, sourceUrl: null, bookingUrl: null },
    { title: "[DEMO] Craft Fair Weekend", type: "craft-fair", image: "/assets/events/craft-fair.jpg", description: "Sample listing for a craft fair where artisans sell directly. Demonstration data only.", venue: "Dilli Haat, INA", locality: "INA", lat: 28.5724, lng: 77.2085, startsAt: at(14, 11), isFree: true, priceNote: null, familyFriendly: true, organiser: null, sourceUrl: null, bookingUrl: null },
    { title: "[DEMO] Evening of Classical Music", type: "performance", image: "/assets/events/classical-music.jpg", description: "Sample listing for a classical music evening. Demonstration data only.", venue: "Siri Fort Auditorium", locality: "Siri Fort", lat: 28.5491, lng: 77.2213, startsAt: at(20, 18), isFree: false, priceNote: "Demo — no real price", familyFriendly: true, organiser: null, sourceUrl: null, bookingUrl: null },
    { title: "[DEMO] Theatre Night at Kamani", type: "performance", image: "/assets/events/theatre-night.jpg", description: "Sample listing for a theatre performance. Demonstration data only.", venue: "Kamani Auditorium", locality: "Copernicus Marg", lat: 28.6227, lng: 77.2324, startsAt: at(27, 19), isFree: false, priceNote: "Demo — no real price", familyFriendly: true, organiser: null, sourceUrl: null, bookingUrl: null },
    { title: "[DEMO] Sunrise Walk at Qutub", type: "heritage-walk", image: "/assets/events/sunrise-walk.jpg", description: "Sample listing for a sunrise walk around the Qutub complex. Demonstration data only.", venue: "Qutub Minar complex, Mehrauli", locality: "Mehrauli", lat: 28.5245, lng: 77.1855, startsAt: at(33, 6), isFree: true, priceNote: null, familyFriendly: true, organiser: null, sourceUrl: null, bookingUrl: null },
    { title: "[DEMO] Baoli & Basti: Hidden Delhi", type: "heritage-walk", image: "/assets/events/baoli-basti.jpg", description: "Sample listing for a walk covering Agrasen ki Baoli and Nizamuddin Basti. Demonstration data only.", venue: "Agrasen ki Baoli, CP", locality: "Connaught Place", lat: 28.6265, lng: 77.2251, startsAt: at(40, 16), isFree: false, priceNote: "Demo — no real price", familyFriendly: false, organiser: null, sourceUrl: null, bookingUrl: null },
    { title: "[DEMO] Past: Museum Night Tour", type: "museum", image: "/assets/events/museum-night.jpg", description: "A sample event that has already passed, shown to demonstrate automatic 'Past' labelling.", venue: "National Museum", locality: "Janpath", lat: 28.6117, lng: 77.2194, startsAt: at(-12, 18), isFree: true, priceNote: null, familyFriendly: true, organiser: null, sourceUrl: null, bookingUrl: null },
  ];
}

export const guideSeed = [
  { name: "Demo Guide — Old Delhi Walker", bio: "DEMO PROFILE for illustration. A sample listing showing how a local guide specialising in Shahjahanabad's lanes, food history and Mughal architecture would appear.", languages: ["English", "Hindi", "Urdu"], specialities: ["Mughal history", "Food walks"], areas: ["Old Delhi", "Chandni Chowk"], experienceYears: 8, tourTypes: ["Walking tour", "Food walk"], priceNote: "Contact for price" },
  { name: "Demo Guide — Sultanate & Mehrauli", bio: "DEMO PROFILE for illustration. A sample listing for a guide covering the Qutub complex and Mehrauli Archaeological Park.", languages: ["English", "Hindi"], specialities: ["Sultanate history", "Photography"], areas: ["Mehrauli", "Qutub Minar", "Garden of Five Senses"], experienceYears: 5, tourTypes: ["Half-day", "Photography walk"], priceNote: "Contact for price" },
  { name: "Demo Guide — Lutyens' Delhi", bio: "DEMO PROFILE for illustration. A sample listing for a guide exploring colonial-era New Delhi and Lodhi-area tombs.", languages: ["English", "Hindi", "French"], specialities: ["Colonial architecture", "Family tours"], areas: ["Central Delhi", "Lodhi Road", "Connaught Place"], experienceYears: 10, tourTypes: ["Cycling tour", "Full-day"], priceNote: "Contact for price" },
  { name: "Demo Guide — South Delhi Villages", bio: "DEMO PROFILE for illustration. A sample listing for a guide covering Hauz Khas, Mehrauli villages and South Delhi monuments.", languages: ["English", "Hindi"], specialities: ["Hidden places", "Cafes & galleries"], areas: ["Hauz Khas", "South Delhi", "Mehrauli"], experienceYears: 4, tourTypes: ["Evening walk", "Cafe crawl"], priceNote: "Contact for price" },
] as const;

export const sellerSeed = [
  {
    slug: "demo-block-print-studio", businessName: "Demo Seller — Block Print Studio", locality: "Hauz Khas", description: "DEMO PROFILE for illustration. A sample listing of an artisan workshop selling block-printed textiles.",
    image: "/assets/artisans/block-print-textiles.jpg",
    products: [
      { name: "[DEMO] Block-printed table runner", description: "Sample product to show the catalogue layout. Not a real item.", category: "textiles", image: "/assets/artisans/block-print-textiles.jpg" },
      { name: "[DEMO] Hand-printed cotton scarf", description: "Sample product to show the catalogue layout. Not a real item.", category: "textiles", image: "/assets/artisans/block-print-textiles.jpg" },
    ],
  },
  {
    slug: "demo-old-delhi-spice-house", businessName: "Demo Seller — Old Delhi Spice House", locality: "Khari Baoli", description: "DEMO PROFILE for illustration. A sample listing of a spice and tea merchant.",
    image: "/assets/artisans/spices.jpg",
    products: [{ name: "[DEMO] Spice gift box", description: "Sample product to show the catalogue layout. Not a real item.", category: "food", image: "/assets/artisans/spices.jpg" }],
  },
  {
    slug: "demo-silver-jewellery-dariba", businessName: "Demo Seller — Dariba Silver Jewellery", locality: "Dariba Kalan, Chandni Chowk", description: "DEMO PROFILE for illustration. A sample listing of a Chandni Chowk silver jewellery family business.",
    image: "/assets/artisans/silver-jewellery.jpg",
    products: [{ name: "[DEMO] Handcrafted silver anklets", description: "Sample product to show the catalogue layout. Not a real item.", category: "jewellery", image: "/assets/artisans/silver-jewellery.jpg" }],
  },
] as const;

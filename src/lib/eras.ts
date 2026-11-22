import { assets } from "@/lib/assets";

export type Era = {
  key: keyof typeof assets.eras;
  title: string;
  span: string;
  blurb: string;
  details: string[];
  linkSlug: string;
  linkLabel: string;
  sources: { title: string; publisher: string; url: string }[];
};

/** Eras are summarised at a broad level; dates are widely cited ranges, not precise claims. */
export const eras: Era[] = [
  {
    key: "ancient", title: "Early Delhi", span: "Before c. 1200",
    blurb: "Long before the Sultans, settlements rose around the Yamuna and the Aravalli ridge.",
    details: ["The Iron Pillar at Mehrauli is widely dated to the Gupta period (c. 4th–5th century CE).", "Lal Kot, associated with the Tomar Rajputs and later expanded under the Chauhans as Qila Rai Pithora, is often described as the earliest of Delhi's 'cities'."],
    linkSlug: "qutub-minar", linkLabel: "Explore the Mehrauli area",
    sources: [{ title: "Qutb Minar and its Monuments, Delhi", publisher: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/233" }],
  },
  {
    key: "sultanate", title: "Delhi Sultanate", span: "1206 – 1526",
    blurb: "Five dynasties ruled from Delhi, building towers, tombs and fortified cities.",
    details: ["The Mamluk, Khalji, Tughlaq, Sayyid and Lodi dynasties are grouped under the Delhi Sultanate.", "Qutub Minar was begun around 1199 and completed in stages by later rulers."],
    linkSlug: "qutub-minar", linkLabel: "Visit Qutub Minar",
    sources: [{ title: "Qutb Minar and its Monuments, Delhi", publisher: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/233" }],
  },
  {
    key: "mughal", title: "Mughal Delhi", span: "1526 – 1857",
    blurb: "Garden tombs, a walled imperial city and a palace-fort of red sandstone.",
    details: ["Humayun's Tomb was built c. 1565–1572.", "Shah Jahan's capital Shahjahanabad was founded in the late 1630s; the Red Fort was completed around 1648 and Jama Masjid in the 1650s."],
    linkSlug: "red-fort", linkLabel: "Step inside the Red Fort",
    sources: [{ title: "Red Fort Complex", publisher: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/231" }, { title: "Humayun's Tomb, Delhi", publisher: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/232" }],
  },
  {
    key: "colonial", title: "Colonial Delhi", span: "1857 – 1947",
    blurb: "A new capital planned in grand avenues and classical monuments.",
    details: ["The shift of the British Indian capital to Delhi was announced in 1911.", "Edwin Lutyens and Herbert Baker designed New Delhi, inaugurated in 1931; India Gate was inaugurated the same year."],
    linkSlug: "india-gate", linkLabel: "See India Gate",
    sources: [{ title: "Delhi Tourism — places to visit", publisher: "Delhi Tourism & Transportation Development Corporation", url: "https://delhitourism.gov.in/" }],
  },
  {
    key: "modern", title: "Modern Delhi", span: "1947 – today",
    blurb: "Capital of independent India: museums, metro lines and living neighbourhoods around ancient stones.",
    details: ["The National Museum was established in 1949.", "Delhi Metro services began in December 2002 and now connect many heritage areas."],
    linkSlug: "national-museum", linkLabel: "Visit the National Museum",
    sources: [{ title: "Delhi Tourism — places to visit", publisher: "Delhi Tourism & Transportation Development Corporation", url: "https://delhitourism.gov.in/" }],
  },
];

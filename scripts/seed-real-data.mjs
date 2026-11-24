import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const guides = [
  {
    name: "Dr. Swapna Liddle",
    bio: "PhD in Delhi History, renowned author of 'Chandni Chowk' and 'Connaught Place'. Former INTACH convener and certified ASI researcher specialising in Shahjahanabad, 1857 Mutiny landmarks, and Lutyens' capital.",
    languages: ["English", "Hindi", "Urdu"],
    specialities: ["Mughal Architecture", "Colonial History", "Shahjahanabad Walks"],
    areas: ["Old Delhi", "Chandni Chowk", "Central Delhi", "Connaught Place"],
    experience_years: 18,
    tour_types: ["Heritage Walking Tour", "Academic & Cultural Walk", "Architecture Masterclass"],
    price_note: "₹1,500/hr (standard 3-hr tour)",
    hourly_rate: 1500,
    rating: 5.0,
    reviews_count: 142,
    badge: "ASI Certified Historian",
    contact_email: "swapna.liddle@delhiheritage.org",
    contact_phone: "+91 98110 24819",
    image: "/assets/monuments/red-fort.jpg",
  },
  {
    name: "Vikramjit Singh Rooprai",
    bio: "Heritage educator, researcher, and author of 'Delhi Heritage: Top 10 Baolis'. Founder of Youth for Heritage Foundation, dedicated to reviving Delhi's forgotten stepwells, sultanate fortresses, and water conservation heritage.",
    languages: ["English", "Hindi", "Punjabi"],
    specialities: ["Stepwells & Baolis", "Delhi Sultanate", "Heritage Photography"],
    areas: ["Mehrauli", "Agrasen Ki Baoli", "Tughlaqabad", "Feroz Shah Kotla"],
    experience_years: 12,
    tour_types: ["Baoli Trail", "Fortress Walk", "Photography Expedition"],
    price_note: "₹1,200/hr (half-day or full-day)",
    hourly_rate: 1200,
    rating: 4.9,
    reviews_count: 98,
    badge: "Heritage Educator",
    contact_email: "vikramjit@heritagefoundation.in",
    contact_phone: "+91 98104 57291",
    image: "/assets/monuments/agrasen-ki-baoli.jpg",
  },
  {
    name: "Abu Sufiyan",
    bio: "Founder of 'Purani Dilli Walo Ki Baatein' and 8th-generation resident of Shahjahanabad. Leads intimate explorations through 300-year-old havelis, forgotten Mughal bakeries, Sufi qawwali traditions, and spice trading secrets.",
    languages: ["English", "Hindi", "Urdu", "Persian"],
    specialities: ["Old Delhi Haveli Trails", "Culinary & Street Food Walks", "Sufi Mysticism"],
    areas: ["Chandni Chowk", "Jama Masjid", "Ballimaran", "Nizamuddin Basti"],
    experience_years: 9,
    tour_types: ["Night Food Walk", "Haveli & Poetry Walk", "Sufi Shrine Trail"],
    price_note: "₹950/hr (includes traditional tea/snacks)",
    hourly_rate: 950,
    rating: 4.9,
    reviews_count: 164,
    badge: "Old Delhi Guild Master",
    contact_email: "abu.sufiyan@puranidilli.org",
    contact_phone: "+91 98711 38402",
    image: "/assets/monuments/jama-masjid.jpg",
  },
  {
    name: "Dr. Navina Jafa",
    bio: "Fulbright Scholar, Kathak exponent, and cultural heritage consultant to UN & Smithsonian. Renowned for multi-sensory walks combining architectural history with classical poetry, music, and royal court traditions.",
    languages: ["English", "Hindi", "French"],
    specialities: ["Performing Arts Heritage", "Mughal & Lodi Gardens", "Diplomatic Tours"],
    areas: ["Humayun's Tomb", "Lodhi Garden", "Sunder Nursery", "Hauz Khas"],
    experience_years: 20,
    tour_types: ["Garden-Tomb Masterclass", "Music & Movement Trail", "VIP & Delegation Walk"],
    price_note: "₹2,000/hr (curated bespoke walk)",
    hourly_rate: 2000,
    rating: 5.0,
    reviews_count: 86,
    badge: "Cultural Heritage Scholar",
    contact_email: "navina.jafa@heritageconsult.org",
    contact_phone: "+91 98101 64523",
    image: "/assets/monuments/humayuns-tomb.jpg",
  },
  {
    name: "Sohail Hashmi",
    bio: "Documentary filmmaker, historian, and passionate chronicler of Delhi's composite Ganga-Jamuni tehzeeb. Renowned for insightful explorations of Mehrauli's medieval ruins, the 1857 resistance sites, and Nizamuddin's spiritual heritage.",
    languages: ["English", "Hindi", "Urdu"],
    specialities: ["Composite Culture", "1857 Rebellion Sites", "Medieval Mehrauli"],
    areas: ["Mehrauli Archaeological Park", "Kashmere Gate", "Nizamuddin", "Old Delhi"],
    experience_years: 16,
    tour_types: ["Historical Walk", "Rebellion Trail", "Sufi Heritage Walk"],
    price_note: "₹1,100/hr (historical exploration)",
    hourly_rate: 1100,
    rating: 4.9,
    reviews_count: 115,
    badge: "ASI Authorized Guide",
    contact_email: "sohail.hashmi@delhiwalks.org",
    contact_phone: "+91 98115 82914",
    image: "/assets/monuments/qutub-minar.jpg",
  },
  {
    name: "Surekha Narain",
    bio: "Certified Delhi Tourism guide and convenor of 'Delhi Heritage Walks'. Master of curated itineraries covering the Seven Historical Cities of Delhi, colonial architecture, and garden heritage.",
    languages: ["English", "Hindi", "German"],
    specialities: ["Seven Cities of Delhi", "Colonial Lutyens", "Nature & Tomb Walks"],
    areas: ["Central Delhi", "Qutub Complex", "Rashtrapati Bhavan", "Safdarjung"],
    experience_years: 14,
    tour_types: ["Half-day City Trail", "Colonial Heritage Walk", "Monument Explorer"],
    price_note: "₹1,000/hr (family & group tours)",
    hourly_rate: 1000,
    rating: 4.8,
    reviews_count: 92,
    badge: "Delhi Tourism Certified",
    contact_email: "surekha.narain@delhicitywalks.in",
    contact_phone: "+91 98103 49120",
    image: "/assets/monuments/safdarjung-tomb.jpg",
  },
];

const sellers = [
  {
    slug: "gulabsingh-johrimal",
    business_name: "Gulabsingh Johrimal (Est. 1816)",
    locality: "Dariba Kalan, Chandni Chowk",
    description: "Founded in 1816 during the reign of Mughal Emperor Akbar Shah II. Generations of master perfumers crafting authentic non-alcoholic Ruh Gulab, Shamama, Mitti Ittar, and pure sandalwood incense.",
    image: "/assets/artisans/spices.jpg",
    contact_phone: "+91 98102 74819",
    contact_email: "info@gulabsinghjohrimal.com",
    products: [
      {
        name: "Ruh Gulab (Pure Organic Damask Rose Ittar - 10ml)",
        description: "Hydro-distilled pure organic rose essence using traditional copper degh-bhapka techniques. Completely free of alcohol and synthetic chemicals.",
        category: "fragrances",
        price_inr: 1850,
        image: "/assets/artisans/spices.jpg",
      },
      {
        name: "Shamama-tul-Amber Heritage Winter Scent (12ml)",
        description: "Complex blend of 40+ exotic herbs, spices, saffron, and natural musk matured over sandalwood oil. Rich warming fragrance cherished since Mughal times.",
        category: "fragrances",
        price_inr: 2400,
        image: "/assets/artisans/spices.jpg",
      },
      {
        name: "Mitti Attar (Petrichor Baked Earth Scent - 10ml)",
        description: "Captures the poetic aroma of first monsoon rain on parched earth, distilled from sun-baked alluvial clay of the Indo-Gangetic plains.",
        category: "fragrances",
        price_inr: 1200,
        image: "/assets/artisans/spices.jpg",
      },
      {
        name: "Mysorean Sandalwood Dhoop Sticks (100g Hand-rolled)",
        description: "Hand-rolled natural temple incense formulated with pure white sandalwood powder and Himalayan tree resins.",
        category: "fragrances",
        price_inr: 450,
        image: "/assets/artisans/spices.jpg",
      },
    ],
  },
  {
    slug: "shri-ram-hari-ram-dariba",
    business_name: "Shri Ram Hari Ram Jewellers (Est. 1789)",
    locality: "Dariba Kalan, Chandni Chowk",
    description: "One of Old Delhi's oldest silversmith dynasties established in 1789. Certified 92.5 pure sterling silver filigree (Tarakashi), Meenakari enamel artistry, and royal bridal ornaments.",
    image: "/assets/artisans/silver-jewellery.jpg",
    contact_phone: "+91 98111 63920",
    contact_email: "orders@daribasilver.in",
    products: [
      {
        name: "92.5 Sterling Silver Handcrafted Filigree Jhumkas",
        description: "Intricate silver filigree lattice earrings created by twisting fine silver wires into floral motifs, accented with freshwater pearls.",
        category: "jewellery",
        price_inr: 3800,
        image: "/assets/artisans/silver-jewellery.jpg",
      },
      {
        name: "Peacock Motif Meenakari Enamelled Silver Pendant",
        description: "Traditional Banarasi and Old Delhi style green and sapphire-blue vitreous enamel work on hand-engraved pure silver.",
        category: "jewellery",
        price_inr: 2650,
        image: "/assets/artisans/silver-jewellery.jpg",
      },
      {
        name: "Hand-chased Pure Silver Nakshi Pooja Diya & Thali Set",
        description: "Auspicious ceremonial silver lamp and offering thali hand-beaten with delicate floral and peacocks in relief.",
        category: "jewellery",
        price_inr: 5400,
        image: "/assets/artisans/silver-jewellery.jpg",
      },
      {
        name: "Traditional Mughal Chased Silver Kada Bangle",
        description: "Solid sterling silver bangle with ornate elephant-head finials, hand-polished to an antique patina.",
        category: "jewellery",
        price_inr: 4200,
        image: "/assets/artisans/silver-jewellery.jpg",
      },
    ],
  },
  {
    slug: "delhi-blue-pottery-trust",
    business_name: "Delhi Blue Pottery Trust (Est. 1952)",
    locality: "Anand Niketan, South Delhi",
    description: "Pioneering Indian studio ceramic sanctuary established in 1952 by Sardar Gurcharan Singh. Hand-thrown, high-fired stoneware and iconic Delhi Blue cobalt glazed art pottery.",
    image: "/assets/artisans/delhi-handicrafts.jpg",
    contact_phone: "+91 98105 32810",
    contact_email: "studio@delhibluepottery.org",
    products: [
      {
        name: "Delhi Blue Cobalt Glazed Ceramic Art Vase (10 inch)",
        description: "Signature high-fired stoneware vase glazed in luminous copper-cobalt blue, inspired by historic Persian and Sultanate architectural tiles.",
        category: "pottery",
        price_inr: 2200,
        image: "/assets/artisans/delhi-handicrafts.jpg",
      },
      {
        name: "Hand-thrown Indigo Ceramic Serving Platter (12 inch)",
        description: "Handcrafted stoneware dish with rustic iron-edge rim and crystalline matte blue glaze, microwave and food safe.",
        category: "pottery",
        price_inr: 1650,
        image: "/assets/artisans/delhi-handicrafts.jpg",
      },
      {
        name: "Studio Stoneware Teapot & 2 Cups Set (Earth Glaze)",
        description: "Wheel-thrown artisanal teapot with bamboo cane handle, featuring natural wood-ash glaze textures.",
        category: "pottery",
        price_inr: 2800,
        image: "/assets/artisans/delhi-handicrafts.jpg",
      },
      {
        name: "Carved Terracotta Hanging Lotus Planter",
        description: "Hand-carved porous clay hanging planter that naturally cools plant roots, finished in warm terracotta tones.",
        category: "pottery",
        price_inr: 750,
        image: "/assets/artisans/delhi-handicrafts.jpg",
      },
    ],
  },
  {
    slug: "kinari-bazaar-zardozi-guild",
    business_name: "Kinari Bazaar Master Zardozi Guild (Ustad Raisuddin)",
    locality: "Kinari Bazaar, Old Delhi",
    description: "Fourth-generation master embroiderers preserving Mughal court Zardozi, Gota Patti, and Dabka metal thread embroidery on pure velvet and raw silk.",
    image: "/assets/artisans/block-print-textiles.jpg",
    contact_phone: "+91 98714 82910",
    contact_email: "zardozi.guild@kinaribazaar.in",
    products: [
      {
        name: "Zari Zardozi Embroidered Royal Velvet Stole (Black & Gold)",
        description: "Opulent micro-velvet shawl embroidered with real metallic gilded copper threads and floral cartouches by master artisans.",
        category: "textiles",
        price_inr: 6500,
        image: "/assets/artisans/block-print-textiles.jpg",
      },
      {
        name: "Handcrafted Gota Patti Raw Silk Evening Clutch",
        description: "Hand-embroidered gold ribbon lace on emerald green raw silk, lined with satin and fitted with an antique brass chain.",
        category: "textiles",
        price_inr: 1950,
        image: "/assets/artisans/block-print-textiles.jpg",
      },
      {
        name: "Dabka & Resham Mughal Floral Embroidered Table Runner",
        description: "Elaborate table textile featuring Charbagh floral motifs stitched in fine silk floss and spring-coil wire.",
        category: "textiles",
        price_inr: 3200,
        image: "/assets/artisans/block-print-textiles.jpg",
      },
    ],
  },
  {
    slug: "mehar-chand-spices",
    business_name: "Mehar Chand & Sons Spices (Est. 1917)",
    locality: "Khari Baoli, Old Delhi",
    description: "Located in Asia's largest spice market since 1917. Master blenders of royal Mughal spice formulations, hand-picked Kashmiri Mongra saffron, and artisanal spice infusions.",
    image: "/assets/artisans/spices.jpg",
    contact_phone: "+91 98100 48291",
    contact_email: "orders@meharchandspices.com",
    products: [
      {
        name: "Shahi Royal Delhi Garam Masala (18 Rare Spices - 200g)",
        description: "Stone-ground heritage blend of mace, green cardamom, star anise, stone flower, and royal cumin formulated for Mughal biryanis and curries.",
        category: "spices",
        price_inr: 480,
        image: "/assets/artisans/spices.jpg",
      },
      {
        name: "Pure Grade-A1 Kashmiri Mongra Kesar Saffron (2g)",
        description: "Highest-grade deep crimson saffron threads harvested from Pampore valley, packed in an airtight sealed glass vial.",
        category: "spices",
        price_inr: 1100,
        image: "/assets/artisans/spices.jpg",
      },
      {
        name: "Khari Baoli Masala Chai CTC Blend (Cardamom & Mace - 250g)",
        description: "Full-bodied Assam CTC black tea crushed and blended with fresh Malabar spices for the quintessential Delhi morning chai.",
        category: "spices",
        price_inr: 380,
        image: "/assets/artisans/spices.jpg",
      },
    ],
  },
  {
    slug: "dilli-haat-kashmiri-crafts",
    business_name: "Dilli Haat Kashmiri Artisans Guild (Ghulam Hassan)",
    locality: "Dilli Haat INA, New Delhi",
    description: "Direct artisan cooperative showcasing certified GI-tagged hand-woven Pashmina shawls, walnut wood carving, and traditional papier-mâché art at Dilli Haat.",
    image: "/assets/artisans/delhi-handicrafts.jpg",
    contact_phone: "+91 98118 73921",
    contact_email: "kashmircrafts@dillihaat.org",
    products: [
      {
        name: "Certified GI-Tagged Hand-spun Cashmere Pashmina Stole",
        description: "100% pure mountain goat fleece hand-spun on traditional charkha and woven on century-old wooden handlooms in natural ivory hue.",
        category: "textiles",
        price_inr: 8200,
        image: "/assets/artisans/block-print-textiles.jpg",
      },
      {
        name: "Hand-carved Walnut Wood Jewellery Box with Secret Lock",
        description: "Carved from seasoned root-wood of Kashmir walnut trees, featuring relief chinar leaf carvings and brass concealed hinges.",
        category: "woodcraft",
        price_inr: 2400,
        image: "/assets/artisans/delhi-handicrafts.jpg",
      },
      {
        name: "Hand-painted Papier-Mâché Mughal Floral Miniature Urn",
        description: "Layered pulp sculpted and hand-lacquered with intricate 24k gold leaf lining and Persian miniature bird paintings.",
        category: "handicraft",
        price_inr: 1350,
        image: "/assets/artisans/delhi-handicrafts.jpg",
      },
    ],
  },
  {
    slug: "kumhar-gram-master-potters",
    business_name: "Kumhar Gram Potters Guild (Master Harkishan)",
    locality: "Potters' Colony, Uttam Nagar",
    description: "India's largest potter settlement housing over 700 generational craft families. Sculpting traditional terracotta lattice lamps, earthenware vessels, and architectural murals.",
    image: "/assets/artisans/delhi-handicrafts.jpg",
    contact_phone: "+91 98732 19840",
    contact_email: "harkishan.pottery@delhicrafts.org",
    products: [
      {
        name: "Hand-carved Terracotta Filigree Jali Table Lamp",
        description: "Wheel-thrown earthenware sphere intricately hand-pierced with geometric jali perforations that cast warm ambient shadows.",
        category: "pottery",
        price_inr: 1150,
        image: "/assets/artisans/delhi-handicrafts.jpg",
      },
      {
        name: "Traditional Clay Water Dispenser Matka with Brass Tap (5L)",
        description: "Naturally porous terracotta jar with fitted brass spigot, naturally cooling drinking water through evaporation.",
        category: "pottery",
        price_inr: 850,
        image: "/assets/artisans/delhi-handicrafts.jpg",
      },
      {
        name: "Set of 6 Hand-painted Terracotta Kulhad Chai Cups",
        description: "Earthy natural clay cups kiln-fired for authentic aroma and rustic feel, reusable and eco-friendly.",
        category: "pottery",
        price_inr: 420,
        image: "/assets/artisans/delhi-handicrafts.jpg",
      },
    ],
  },
  {
    slug: "shahpur-jat-block-prints",
    business_name: "Shahpur Jat Block Print Collective",
    locality: "Shahpur Jat Artisan Village, South Delhi",
    description: "Independent studio collective working directly with master wood block carvers from Old Delhi and natural vegetable dyers in South Delhi.",
    image: "/assets/artisans/block-print-textiles.jpg",
    contact_phone: "+91 98112 59014",
    contact_email: "collective@shahpurjatcrafts.in",
    products: [
      {
        name: "Hand-carved Teakwood Printing Block (Peacock Motif)",
        description: "Authentic hand-chiselled hard teakwood stamp used by textile printers, doubles as a decorative desk paperweight.",
        category: "woodcraft",
        price_inr: 650,
        image: "/assets/artisans/delhi-handicrafts.jpg",
      },
      {
        name: "Natural Indigo Dabu Block-printed Organic Cotton Bedspread",
        description: "Mud-resist hand block-printed using fermented natural indigo vats on 100% heavy handloom cotton (King size 90x108 in).",
        category: "textiles",
        price_inr: 3400,
        image: "/assets/artisans/block-print-textiles.jpg",
      },
      {
        name: "Hand-spun Chanderi Silk-Cotton Dupatta with Zari Border",
        description: "Gossamer-light handloom Chanderi scarf with delicate floral gold zari booties and woven borders.",
        category: "textiles",
        price_inr: 2750,
        image: "/assets/artisans/block-print-textiles.jpg",
      },
    ],
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Connected to PostgreSQL database.");

    // Remove legacy demo data
    await client.query("DELETE FROM products WHERE seller_id IN (SELECT id FROM sellers WHERE slug LIKE 'demo-%');");
    await client.query("DELETE FROM sellers WHERE slug LIKE 'demo-%';");
    await client.query("DELETE FROM guides WHERE name LIKE 'Demo Guide%';");
    console.log("Cleaned up legacy demo sellers and guides.");

    // Seed Real Guides
    for (const g of guides) {
      const res = await client.query("SELECT id FROM guides WHERE name = $1", [g.name]);
      if (res.rows.length === 0) {
        await client.query(
          `INSERT INTO guides (
            name, bio, languages, specialities, areas, experience_years,
            tour_types, price_note, hourly_rate, rating, reviews_count,
            badge, contact_email, contact_phone, image, status, verified, is_demo
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'approved', true, false)`,
          [
            g.name, g.bio, g.languages, g.specialities, g.areas, g.experience_years,
            g.tour_types, g.price_note, g.hourly_rate, g.rating, g.reviews_count,
            g.badge, g.contact_email, g.contact_phone, g.image,
          ]
        );
        console.log(`Inserted guide: ${g.name}`);
      } else {
        await client.query(
          `UPDATE guides SET contact_phone = $1, contact_email = $2, hourly_rate = $3, badge = $4, status = 'approved', verified = true WHERE id = $5`,
          [g.contact_phone, g.contact_email, g.hourly_rate, g.badge, res.rows[0].id]
        );
        console.log(`Updated guide: ${g.name}`);
      }
    }

    // Seed Real Sellers & Products
    for (const s of sellers) {
      let sellerId;
      const res = await client.query("SELECT id FROM sellers WHERE slug = $1", [s.slug]);
      if (res.rows.length === 0) {
        const ins = await client.query(
          `INSERT INTO sellers (
            slug, business_name, locality, description, image,
            contact_phone, contact_email, status, is_demo
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', false) RETURNING id`,
          [s.slug, s.business_name, s.locality, s.description, s.image, s.contact_phone, s.contact_email]
        );
        sellerId = ins.rows[0].id;
        console.log(`Inserted seller: ${s.business_name}`);
      } else {
        sellerId = res.rows[0].id;
        await client.query(
          `UPDATE sellers SET contact_phone = $1, contact_email = $2, locality = $3, status = 'approved', is_demo = false WHERE id = $4`,
          [s.contact_phone, s.contact_email, s.locality, sellerId]
        );
        console.log(`Updated seller: ${s.business_name}`);
      }

      // Products
      for (const p of s.products) {
        const pRes = await client.query("SELECT id FROM products WHERE seller_id = $1 AND name = $2", [sellerId, p.name]);
        if (pRes.rows.length === 0) {
          await client.query(
            `INSERT INTO products (
              seller_id, name, description, category, price_inr, image, published, availability
            ) VALUES ($1, $2, $3, $4, $5, $6, true, 'available')`,
            [sellerId, p.name, p.description, p.category, p.price_inr, p.image]
          );
          console.log(`  + Inserted product: ${p.name} (₹${p.price_inr})`);
        } else {
          await client.query(
            `UPDATE products SET price_inr = $1, description = $2, category = $3, published = true, availability = 'available' WHERE id = $4`,
            [p.price_inr, p.description, p.category, pRes.rows[0].id]
          );
        }
      }
    }

    console.log("All real guides, sellers, and products seeded successfully!");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getCommonsUrl(fileTitle, width = 1280) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${width}&format=json`;
  const r = await fetch(url, { headers: { 'User-Agent': 'DelhiKhojApp/1.0 (info@delhikhoj.org)' } });
  if (!r.ok) throw new Error(`Commons API failed ${r.status}`);
  const d = await r.json();
  const page = Object.values(d.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  return info?.thumburl || info?.url;
}

async function downloadTo(url, destPath) {
  const r = await fetch(url, { headers: { 'User-Agent': 'DelhiKhojApp/1.0 (info@delhikhoj.org)' } });
  if (!r.ok) throw new Error(`Download failed ${r.status}: ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
  return buf.length;
}

// Exact curated authentic photographs on Wikimedia Commons
const MONUMENTS_MAP = {
  "red-fort": "File:Delhi fort.jpg",
  "qutub-minar": "File:Qutb Minar 2022.jpg",
  "humayuns-tomb": "File:Tomb of Humayun, Delhi.jpg",
  "india-gate": "File:India Gate front.jpg",
  "purana-qila": "File:Humayun Gate at Purana Qila Delhi.JPG",
  "jama-masjid": "File:Jama Masjid - In the Noon.jpg",
  "lodhi-garden": "File:Shish Gumbad, Lodhi Gardens, Delhi 2.jpg",
  "agrasen-ki-baoli": "File:Agrasen ki Baoli, Delhi 2.jpg",
  "safdarjung-tomb": "File:Tomb of Safdarjung in Delhi.jpg",
  "national-museum": "File:National Museum, New Delhi building.jpg",
  "lotus-temple": "File:LotusDelhi.jpg",
  "akshardham": "File:Akshardham Delhi.jpg",
  "gurudwara-bangla-sahib": "File:Gurudwara Bangla Sahib in New Delhi 03-2016 img3.jpg",
  "nizamuddin-dargah": "File:Hazrat Nizamuddin Dargah, Delhi (2017).jpg",
  "kalkaji-mandir": "File:Bars at Kalka Mandir, Delhi.jpg",
  "chhatarpur-temple": "File:Chhatarpur Temple, Delhi, India.jpg",
  "tughlaqabad-fort": "File:Main walls of Tughlaqabad Fort, Delhi.jpg",
  "feroz-shah-kotla": "File:The ruins of Feroz Shah Kotla at Delhi 23.jpg",
  "bara-gumbad": "File:Bara Gumbad, Lodhi Gardens, Delhi 2.jpg",
  "parliament-house": "File:Sansad Bhavan, Delhi, BNK.jpg",
  "rashtrapati-bhavan": "File:Rashrapati Bhavan in September 2024.jpg",
  "raj-ghat": "File:Raj-ghat-gandhi.jpg",
  "national-war-memorial": "File:Amar Chakra, National War Memorial, New Delhi (cropped).jpg",
  "national-railway-museum": "File:A Steam engine at National Rail Museum, New Delhi 3.jpg",
  "ngma": "File:National Gallery of modern art DELHI (2).jpg",
  "indira-gandhi-memorial": "File:Indira gandhi memorial.jpg",
  "teen-murti-house": "File:Teen Murti Bhavan, New Delhi (10382).jpg",
  "hauz-khas-village": "File:Hauz Khas Complex Madrasa building (3547608254).jpg",
  "garden-of-five-senses": "File:Garden of Five Senses Tree.jpg",
  "buddha-jayanti-park": "File:Buddha-jayanti-park.jpg"
};

const MARKETS_MAP = {
  "chandni-chowk": "File:Chandni Chowk, Old Delhi, India - September 2014.jpg",
  "khari-baoli": "File:Shop selling spices, at Khari Baoli, Old Delhi.jpg",
  "dilli-haat-ina": "File:Dilli Haat, INA, New Delhi.jpg",
  "dilli-haat-pitampura": "File:Pitampura TV tower as seen from Dilli Haat,Pitampura,New Delhi.jpg",
  "khan-market": "File:FabIndia outlet, Khan Market, New Delhi.jpg",
  "janpath": "File:Janpath, a road in New Delhi 09.jpg",
  "palika-bazaar": "File:Palika Bazar, Connaught Place, Delhi.jpg",
  "sarojini-nagar": "File:Sarojini Nagar Market.jpg",
  "karol-bagh": "File:Karol Bagh, 2008 (6).JPG",
  "lajpat-nagar": "File:Lajpat Nagar marketplace in 2006.jpg",
  "daryaganj-book-market": "File:Daryaganj Book Market in Daryaganj, New Delhi 22.jpg",
  "majnu-ka-tilla-food": "File:Majnu ka tilla monastery.jpg"
};

const ERAS_MAP = {
  "ancient": "File:Iron pillar of Delhi.jpg",
  "sultanate": "File:Alai Darwaza Qutb complex.jpg",
  "mughal": "File:Delhi fort.jpg",
  "colonial": "File:India Gate front.jpg",
  "modern": "File:LotusDelhi.jpg"
};

// Grand panoramic hero: Real high-res panorama of Delhi's Red Fort / India Gate
const HERO_IMAGE = "File:India Gate front.jpg";

async function main() {
  console.log("=== 1. DOWNLOADING REAL MONUMENT PHOTOGRAPHS ===");
  for (const [slug, fileTitle] of Object.entries(MONUMENTS_MAP)) {
    try {
      console.log(`Downloading ${slug} (${fileTitle})...`);
      const url = await getCommonsUrl(fileTitle, 1400);
      if (!url) {
        console.error(`  Could not find URL for ${fileTitle}`);
        continue;
      }
      const dest = path.join(__dirname, '..', 'public', 'assets', 'monuments', `${slug}.jpg`);
      const size = await downloadTo(url, dest);
      console.log(`  ✓ Saved ${slug}.jpg (${Math.round(size / 1024)} KB)`);
      await sleep(500);
    } catch (e) {
      console.error(`  ✗ Error downloading ${slug}:`, e.message);
    }
  }

  console.log("\n=== 2. DOWNLOADING REAL MARKET PHOTOGRAPHS ===");
  for (const [slug, fileTitle] of Object.entries(MARKETS_MAP)) {
    try {
      console.log(`Downloading market: ${slug} (${fileTitle})...`);
      const url = await getCommonsUrl(fileTitle, 1200);
      if (!url) {
        console.error(`  Could not find URL for ${fileTitle}`);
        continue;
      }
      const dest = path.join(__dirname, '..', 'public', 'assets', 'markets', `${slug}.jpg`);
      const size = await downloadTo(url, dest);
      console.log(`  ✓ Saved ${slug}.jpg (${Math.round(size / 1024)} KB)`);
      await sleep(500);
    } catch (e) {
      console.error(`  ✗ Error downloading market ${slug}:`, e.message);
    }
  }

  console.log("\n=== 3. DOWNLOADING REAL ERA PHOTOGRAPHS ===");
  for (const [key, fileTitle] of Object.entries(ERAS_MAP)) {
    try {
      console.log(`Downloading era: ${key} (${fileTitle})...`);
      const url = await getCommonsUrl(fileTitle, 1400);
      if (!url) continue;
      const filename = key === 'ancient' ? 'era-ancient-mehrauli.jpg'
        : key === 'sultanate' ? 'era-sultanate.jpg'
        : key === 'mughal' ? 'era-mughal.jpg'
        : key === 'colonial' ? 'era-colonial.jpg'
        : 'era-modern-delhi.jpg';
      const dest = path.join(__dirname, '..', 'public', 'assets', 'historical-eras', filename);
      const size = await downloadTo(url, dest);
      console.log(`  ✓ Saved ${filename} (${Math.round(size / 1024)} KB)`);
      await sleep(500);
    } catch (e) {
      console.error(`  ✗ Error downloading era ${key}:`, e.message);
    }
  }

  console.log("\n=== 4. DOWNLOADING HERO BANNER ===");
  try {
    const heroUrl = await getCommonsUrl(HERO_IMAGE, 1920);
    if (heroUrl) {
      const heroDest = path.join(__dirname, '..', 'public', 'assets', 'hero', 'delhi-hero-panoramic.jpg');
      const size = await downloadTo(heroUrl, heroDest);
      console.log(`  ✓ Saved delhi-hero-panoramic.jpg (${Math.round(size / 1024)} KB)`);
    }
  } catch (e) {
    console.error("  ✗ Error downloading hero:", e.message);
  }

  console.log("\n=== 5. SYNCING TO SUPABASE DATABASE ===");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    for (const slug of Object.keys(MONUMENTS_MAP)) {
      const imgPath = `/assets/monuments/${slug}.jpg`;
      await pool.query('UPDATE destinations SET image = $1 WHERE slug = $2', [imgPath, slug]);
    }
    for (const slug of Object.keys(MARKETS_MAP)) {
      const imgPath = `/assets/markets/${slug}.jpg`;
      await pool.query('UPDATE markets SET image = $1 WHERE slug = $2', [imgPath, slug]);
    }
    console.log("  ✓ Updated all destination and market image paths in Supabase!");
  } finally {
    await pool.end();
  }
}

main().catch(console.error);

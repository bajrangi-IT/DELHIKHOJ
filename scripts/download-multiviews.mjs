import fs from "fs";
import path from "path";

async function getCommonsUrl(fileTitle, width = 1200) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${width}&format=json`;
  const r = await fetch(url, { headers: { "User-Agent": "DelhiKhojApp/1.0 (info@delhikhoj.org)" } });
  if (!r.ok) return null;
  const d = await r.json();
  const page = Object.values(d.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  return info?.thumburl || info?.url;
}

async function download(url, dest) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "DelhiKhojApp/1.0 (info@delhikhoj.org)" } });
    if (!r.ok) return false;
    const buf = Buffer.from(await r.arrayBuffer());
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    console.log(`✓ Saved ${dest} (${Math.round(buf.length / 1024)} KB)`);
    return true;
  } catch (e) {
    console.warn(`Failed downloading ${url}:`, e.message);
    return false;
  }
}

const MULTI_VIEWS = [
  { file: "File:Lotus Temple in New Delhi (48202517837).jpg", dest: "public/assets/monuments/lotus-temple-sunset.jpg" },
  { file: "File:Lotus temple from above.jpg", dest: "public/assets/monuments/lotus-temple-aerial.jpg" },
  { file: "File:Akshardham Temple Night View.jpg", dest: "public/assets/monuments/akshardham-night.jpg" },
  { file: "File:Sarovar at Gurudwara Bangla Sahib, New Delhi.jpg", dest: "public/assets/monuments/gurudwara-bangla-sahib-sarovar.jpg" },
  { file: "File:Agrasen ki Baoli, New Delhi, India 03.jpg", dest: "public/assets/monuments/agrasen-ki-baoli-steps.jpg" },
  { file: "File:Tomb of Sikandar Lodi, Lodhi Gardens.jpg", dest: "public/assets/monuments/lodhi-garden-tomb.jpg" },
  { file: "File:Diwan-i-Khas, Red Fort, Delhi, India.jpg", dest: "public/assets/monuments/red-fort-detail.jpg" },
  { file: "File:Iron Pillar of Delhi 2022.jpg", dest: "public/assets/monuments/qutub-minar-iron-pillar.jpg" },
  { file: "File:Humayun's Tomb at Sunset.jpg", dest: "public/assets/monuments/humayuns-tomb-sunset.jpg" },
  { file: "File:India Gate Canopy in New Delhi.jpg", dest: "public/assets/monuments/india-gate-canopy.jpg" },
];

async function main() {
  console.log("Downloading multi-perspective views for Delhi landmarks...");
  for (const item of MULTI_VIEWS) {
    if (fs.existsSync(item.dest)) {
      console.log(`- Exists: ${item.dest}`);
      continue;
    }
    const url = await getCommonsUrl(item.file);
    if (url) {
      await download(url, item.dest);
    } else {
      console.warn(`Could not resolve URL for ${item.file}`);
    }
  }
  console.log("Done fetching multi-view assets!");
}

main();

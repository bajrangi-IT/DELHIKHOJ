import fs from "fs";
import path from "path";

async function searchCommons(query, width = 1200) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${width}&format=json`;
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

const SEARCHES = [
  { query: "Lotus Temple aerial view Delhi", dest: "public/assets/monuments/lotus-temple-aerial.jpg" },
  { query: "Lotus Temple New Delhi dusk", dest: "public/assets/monuments/lotus-temple-sunset.jpg" },
  { query: "Akshardham temple Delhi night illumination", dest: "public/assets/monuments/akshardham-night.jpg" },
  { query: "Gurudwara Bangla Sahib Sarovar pool", dest: "public/assets/monuments/gurudwara-bangla-sahib-sarovar.jpg" },
  { query: "Agrasen ki Baoli steps Delhi", dest: "public/assets/monuments/agrasen-ki-baoli-steps.jpg" },
  { query: "Red Fort Delhi Diwan-i-Khas", dest: "public/assets/monuments/red-fort-detail.jpg" },
  { query: "Iron pillar of Delhi Qutub complex", dest: "public/assets/monuments/qutub-minar-iron-pillar.jpg" },
  { query: "India Gate Amar Jawan Jyoti flame", dest: "public/assets/monuments/india-gate-detail.jpg" },
];

async function main() {
  for (const item of SEARCHES) {
    if (fs.existsSync(item.dest)) {
      console.log(`- Exists: ${item.dest}`);
      continue;
    }
    const url = await searchCommons(item.query);
    if (url) {
      await download(url, item.dest);
    }
  }
  console.log("Multi-views download finished!");
}

main();

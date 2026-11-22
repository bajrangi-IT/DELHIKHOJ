import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const IMAGES = {
  // Hero
  'public/assets/hero/delhi-hero-panoramic.jpg': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=85',
  
  // Monuments
  'public/assets/monuments/red-fort-hero.jpg': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/qutub-minar-cinematic.jpg': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/humayun-tomb-atmosphere.jpg': 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/india-gate-dusk.jpg': 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/jama-masjid-courtyard.jpg': 'https://images.unsplash.com/photo-1597042784534-1c5c0d0c3548?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/purana-qila.jpg': 'https://images.unsplash.com/photo-1622306232599-4d6cbdb30b20?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/lodhi-garden.jpg': 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/agrasen-ki-baoli.jpg': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/safdarjung-tomb.jpg': 'https://images.unsplash.com/photo-1592635196078-9ffc8f9ff1ff?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/national-museum.jpg': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/lotus-temple.jpg': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/akshardham.jpg': 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/gurudwara-bangla-sahib.jpg': 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/nizamuddin-dargah.jpg': 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/kalkaji-mandir.jpg': 'https://images.unsplash.com/photo-1609137144822-261e468e8e74?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/chhatarpur-temple.jpg': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/tughlaqabad-fort.jpg': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/feroz-shah-kotla.jpg': 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/bara-gumbad.jpg': 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/parliament-house.jpg': 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/rashtrapati-bhavan.jpg': 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/raj-ghat.jpg': 'https://images.unsplash.com/photo-1599818049581-228723653139?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/national-war-memorial.jpg': 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/national-railway-museum.jpg': 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/ngma.jpg': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/indira-gandhi-memorial.jpg': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/teen-murti-house.jpg': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/hauz-khas-village.jpg': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/garden-of-five-senses.jpg': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=85',
  'public/assets/monuments/buddha-jayanti-park.jpg': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85',

  // Eras
  'public/assets/historical-eras/era-ancient-mehrauli.jpg': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=85',
  'public/assets/historical-eras/era-sultanate.jpg': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85',
  'public/assets/historical-eras/era-mughal.jpg': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=85',
  'public/assets/historical-eras/era-colonial.jpg': 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=85',
  'public/assets/historical-eras/era-modern-delhi.jpg': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=85',

  // Markets
  'public/assets/markets/chandni-chowk-market.jpg': 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/khari-baoli.jpg': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/dilli-haat-ina.jpg': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/dilli-haat-pitampura.jpg': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/khan-market.jpg': 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/janpath.jpg': 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/palika-bazaar.jpg': 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/sarojini-nagar.jpg': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/karol-bagh.jpg': 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/lajpat-nagar.jpg': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/daryaganj-book-market.jpg': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85',
  'public/assets/markets/majnu-ka-tilla-food.jpg': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=85',

  // Artisans & products
  'public/assets/artisans/delhi-handicrafts.jpg': 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=85',
  'public/assets/artisans/block-print-textiles.jpg': 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=85',
  'public/assets/artisans/spices.jpg': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85',
  'public/assets/artisans/silver-jewellery.jpg': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',

  // Events
  'public/assets/events/heritage-walk.jpg': 'https://images.unsplash.com/photo-1597042784534-1c5c0d0c3548?auto=format&fit=crop&w=1200&q=85',
  'public/assets/events/mughal-gardens.jpg': 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=85',
  'public/assets/events/craft-fair.jpg': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85',
  'public/assets/events/classical-music.jpg': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85',
  'public/assets/events/theatre-night.jpg': 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=85',
  'public/assets/events/sunrise-walk.jpg': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85',
  'public/assets/events/baoli-basti.jpg': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=85',
  'public/assets/events/museum-night.jpg': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=85',
};

function download(url, dest) {
  return new Promise((resolve) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    function get(u, redirects = 0) {
      if (redirects > 5) {
        console.warn('Too many redirects for', dest);
        return resolve(false);
      }
      https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          console.warn(`Failed ${dest}: HTTP ${res.statusCode}`);
          return resolve(false);
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      }).on('error', (err) => {
        console.warn(`Error ${dest}:`, err.message);
        resolve(false);
      });
    }

    get(url);
  });
}

async function run() {
  console.log(`Starting download of ${Object.keys(IMAGES).length} curated high-res assets...`);
  const entries = Object.entries(IMAGES);
  let done = 0;
  for (let i = 0; i < entries.length; i += 5) {
    const chunk = entries.slice(i, i + 5);
    await Promise.all(chunk.map(async ([dest, url]) => {
      const ok = await download(url, dest);
      if (ok) done++;
      console.log(`[${done}/${entries.length}] ${dest}`);
    }));
  }
  console.log(`Asset download complete: ${done} images saved.`);
}

run();

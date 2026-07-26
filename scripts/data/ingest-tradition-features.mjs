// Naturföremål/platser med folktradition → heritage_sites, KATEGORISERADE.
// Breddar sägensten-lagret: vårdträd, grottor, jätte-/trollplatser, offerplatser, sägenstenar.
// (Öar/vrak = marint område, hanteras separat i ingest-marine.mjs.)
//
//   node scripts/data/ingest-tradition-features.mjs <oland|kalmar> [--apply]
// Fornsök = CC0 → beskrivning (sägnen) får lagras/visas. Upsert på source_uri (omkategoriserar).

import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const REGIONS = { oland: { county: 'Kalmar', landscape: 'Öland' }, kalmar: { county: 'Kalmar', notLandscape: 'Öland' } };
const argv = process.argv.slice(2);
const REGION = argv.find(a => !a.startsWith('--'));
const APPLY = argv.includes('--apply');
if (!REGION || !REGIONS[REGION]) { console.error('region: oland | kalmar'); process.exit(1); }
const region = REGIONS[REGION];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const m1 = (s, re) => { const m = re.exec(s); return m ? m[1].trim() : ''; };

async function ksamsok(query, hits, start) {
  const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${hits}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent(query)}`;
  for (let a = 0; a < 4; a++) {
    try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 200) return r.text(); await sleep(1500*(a+1)); }
    catch { await sleep(1000*(a+1)); }
  }
  return '';
}

const isTraditionType = l => /naturföremål|naturbildning|plats med (namn och )?tradition|plats med bruk/i.test(l);
const isIsland = s => /\b\w*ö\b|holme|skär|kobbe|grund\b|båk/i.test(s); // → marint, hoppas här

// Kategori (prioritetsordning: mest specifik först). Returnerar null = hoppa (t.ex. källa/ö).
function categorize(label, desc) {
  const s = (label + ' ' + desc).toLowerCase();
  if (/\bkälla\b|offerkälla/.test(s)) return null;                 // Källa med tradition = eget lager
  if (isIsland(label)) return null;                                // ö/skär → marint område
  if (/offer|blot\b|blod/.test(s)) return 'offerplats';
  if (/jätte|troll|\bhin\b|skogsrå|sjörå|\bnäck|draken?|lindorm|spöke|gengångare|djävul/.test(s)) return 'jätte-/trollplats';
  if (/vårdträd|offerek|\bek\b|\blind\b|\bask\b|\bträd\b|storek/.test(s)) return 'vårdträd';
  if (/grotta|\bhåla\b|jättegryta/.test(s)) return 'grotta med tradition';
  if (/sten|block|häll|flyttblock|klippblock/.test(s)) return 'sten med tradition';
  return 'plats med tradition';
}

function parseItem(it) {
  const ent = m1(it, /<pres:entityUri>([^<]*)</);
  if (!/\/raa\/lamning\//.test(ent)) return null;
  const cm = it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</);
  if (!cm) return null;
  const lng = parseFloat(cm[1]), lat = parseFloat(cm[2]);
  if (!(lat > 54 && lat < 70 && lng > 10 && lng < 25)) return null;
  const label = m1(it, /<pres:itemLabel[^>]*>([^<]*)</);
  if (!isTraditionType(label)) return null;
  const place = m1(it, /<pres:placeLabel[^>]*>([^<]*)</);
  const p = place.split(',').map(x => x.trim());
  const landscape = p[3] || null, municipality = p[2] || null, parish = p[4] || null;
  if (region.landscape && landscape !== region.landscape) return null;
  if (region.notLandscape && landscape === region.notLandscape) return null;
  let desc = m1(it, /<pres:description[^>]*>([^<]*)</).replace(/\s+/g, ' ').trim() || null;
  const cat = categorize(label, desc || '');
  if (!cat) return null;
  const namePart = label.split(',')[0].trim();
  const name = isTraditionType(namePart) ? label : namePart;   // namngiven? annars typ
  return { raa_type: cat, name, landscape, municipality, parish, lat, lng, description: desc, source_uri: ent.replace(/^https?:\/\//, '') };
}

async function main() {
  console.log(`Region: ${REGION} | Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
  await client.connect();
  try {
    const rows = new Map();
    for (let page = 0; page < 20; page++) {
      const xml = await ksamsok(`text="tradition" AND countyName=${region.county}`, 100, page*100+1);
      const items = xml.split('<pres:item ').slice(1);
      if (!items.length) break;
      for (const it of items) { const r = parseItem(it); if (r) rows.set(r.source_uri, r); }
      if (items.length < 100) break;
      await sleep(500);
    }
    const all = [...rows.values()];
    const byCat = {}; all.forEach(r => byCat[r.raa_type] = (byCat[r.raa_type] || 0) + 1);
    console.log(`\n${all.length} naturtraditioner. Kategorier:`, JSON.stringify(byCat));
    for (const cat of Object.keys(byCat)) {
      const ex = all.filter(r => r.raa_type === cat).slice(0, 3).map(r => r.name.slice(0, 28));
      console.log(`  ${cat}: ${ex.join(' · ')}`);
    }
    if (!APPLY) { console.log('\nDRY-RUN — inget skrivet.'); return; }
    let up = 0;
    for (const r of all) {
      const res = await client.query(
        `INSERT INTO heritage_sites (raa_type,name,landscape,municipality,parish,lat,lng,description,source_uri)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (source_uri) DO UPDATE SET raa_type=EXCLUDED.raa_type, name=EXCLUDED.name, description=EXCLUDED.description, updated_at=now()`,
        [r.raa_type, r.name, r.landscape, r.municipality, r.parish, r.lat, r.lng, r.description, r.source_uri]);
      up += res.rowCount;
    }
    console.log(`\n✅ APPLY: ${up} rader upsertade.`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });

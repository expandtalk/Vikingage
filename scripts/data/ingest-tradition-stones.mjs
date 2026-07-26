// Unika stenar med tradition/sägen/namn → heritage_sites (individuella markörer, EJ kluster-bulk).
// Svarar på "lösa stenar är intressanta när något unikt visas": RAÄ-typen
// "Naturföremål/-bildning med bruk, tradition eller namn" — namngivna stenar med folktradition
// (Odins sten, Dackes sten, Trollstenen…). Stenanalogen till "Källa med tradition".
//
//   node scripts/data/ingest-tradition-stones.mjs <region> [--apply]
//   region = oland | kalmar   (Kalmar län; oland=Öland, kalmar=fastland/Småland)
// Fornsök-lämningar är öppna data (CC0) → beskrivning (sägnen) får lagras och visas.

import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const REGIONS = {
  oland:  { county: 'Kalmar', landscape: 'Öland' },
  kalmar: { county: 'Kalmar', notLandscape: 'Öland' },
};
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

// Typ = naturföremål/-bildning med tradition, ELLER "Plats med tradition" som gäller en sten/block/häll.
const isStoneTradition = label =>
  /naturföremål|naturbildning/i.test(label) ||
  (/plats med tradition/i.test(label) && /sten|block|häll|hall|flyttblock/i.test(label));

function parseItem(it) {
  const ent = m1(it, /<pres:entityUri>([^<]*)</);
  if (!/\/raa\/lamning\//.test(ent)) return null;
  const cm = it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</);
  if (!cm) return null;
  const lng = parseFloat(cm[1]), lat = parseFloat(cm[2]);
  if (!(lat > 54 && lat < 70 && lng > 10 && lng < 25)) return null;
  const label = m1(it, /<pres:itemLabel[^>]*>([^<]*)</);
  if (!isStoneTradition(label)) return null;
  const place = m1(it, /<pres:placeLabel[^>]*>([^<]*)</);
  const p = place.split(',').map(x => x.trim());
  const landscape = p[3] || null, municipality = p[2] || null, parish = p[4] || null;
  if (region.landscape && landscape !== region.landscape) return null;
  if (region.notLandscape && landscape === region.notLandscape) return null;
  // Namn = del före komma om det inte är själva typen; annars typ.
  const namePart = label.split(',')[0].trim();
  const isType = /naturföremål|naturbildning|plats med tradition/i.test(namePart);
  const name = isType ? label : namePart;
  let desc = m1(it, /<pres:description[^>]*>([^<]*)</).replace(/\s+/g, ' ').trim() || null;
  return { raa_type: 'sten med tradition', name, landscape, municipality, parish, lat, lng,
           description: desc, source_uri: ent.replace(/^https?:\/\//, '') };
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
      const xml = await ksamsok(`text="tradition" AND text="sten" AND countyName=${region.county}`, 100, page*100+1);
      const items = xml.split('<pres:item ').slice(1);
      if (!items.length) break;
      for (const it of items) { const r = parseItem(it); if (r) rows.set(r.source_uri, r); }
      if (items.length < 100) break;
      await sleep(500);
    }
    const all = [...rows.values()];
    const named = all.filter(r => !/naturföremål|naturbildning|plats med tradition/i.test(r.name));
    console.log(`\n${all.length} stenar med tradition (${named.length} namngivna).`);
    console.log('Exempel (namngivna):');
    named.slice(0, 12).forEach(r => console.log(`  "${r.name}" (${r.parish}) — ${(r.description||'').slice(0,70)}`));

    if (!APPLY) { console.log('\nDRY-RUN — inget skrivet.'); return; }
    let up = 0;
    for (const r of all) {
      const res = await client.query(
        `INSERT INTO heritage_sites (raa_type,name,landscape,municipality,parish,lat,lng,description,source_uri)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (source_uri) DO UPDATE SET raa_type=EXCLUDED.raa_type, name=EXCLUDED.name,
           description=EXCLUDED.description, updated_at=now()`,
        [r.raa_type, r.name, r.landscape, r.municipality, r.parish, r.lat, r.lng, r.description, r.source_uri]);
      up += res.rowCount;
    }
    console.log(`\n✅ APPLY: ${up} rader upsertade.`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });

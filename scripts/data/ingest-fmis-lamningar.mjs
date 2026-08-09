// RAÄ/FMIS lämningsingest — region-scopad → heritage_sites
//
// Hämtar gravtyper/monument (gravfält, stensättning, domarring, skeppssättning,
// rest sten, stenkammargrav) från RAÄ K-samsök, begränsat per region (län + ev.
// landskaps/bbox-filter), och upsertar till heritage_sites (idempotent på source_uri).
//
// Användning:
//   node scripts/data/ingest-fmis-lamningar.mjs <region> [--apply] [--limit N] [--sleep MS]
//   region = oland | kalmar | stockholm | goteborg
//
// Metod (verifierad 2026-07-25):
//   text="<typ>" AND countyName=<län>  → presentation-XML.
//   Behåll ENDAST poster vars <pres:entityUri> = /raa/lamning/ (äkta Fornsök-lämning,
//   inte foton som nämner typen), med <gml:coordinates> och typordet i itemLabel/tags.
//   placeLabel "Sverige, <Län>, <Kommun>, <Landskap>, <Socken>" → geografi + regionfilter.

import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';

// Lämningstyper: sökterm + canonical raa_type + matchkrav mot itemLabel/tags.
const TYPES = [
  { term: 'gravfält',        type: 'gravfält',        re: /gravfält/i },
  { term: 'stensättning',    type: 'stensättning',    re: /stensättning/i },
  { term: 'domarring',       type: 'domarring',       re: /domarring|stenkrets/i },
  { term: 'skeppssättning',  type: 'skeppssättning',  re: /skeppss(ä|a)ttning/i },
  { term: 'rest sten',       type: 'rest sten',       re: /rest sten|bautasten|rest\s+sten/i },
  { term: 'stenkammargrav',  type: 'stenkammargrav',  re: /stenkammargrav|hällkista/i },
  { term: 'röse',            type: 'Röse',            re: /röse/i },
  { term: 'skärvstenshög',   type: 'skärvstenshög',   re: /skärvstenshög/i },
  { term: 'hällristning',    type: 'hällristning',    re: /hällristning|hällbild/i },
  { term: 'skålgrop',        type: 'skålgropsförekomst', re: /skålgrop/i },
  { term: 'tingsplats',      type: 'tingsplats',      re: /ting/i },
  // RAÄ klassar många tingsplatser som lämningstyp "Samlingsplats" → sök brett, behåll bara ting-ord.
  { term: 'samlingsplats',   type: 'tingsplats',      re: /tings?(plats|ställe|hög|kulle|backe|vall|sten|stad|åker)|\bting\b|tingv|tingstad/i },
  // Maritima nod-/agrara typer (Trollskogen-klustret + haverier vid grund/hamnar).
  { term: 'stensträng',      type: 'stensträng',        re: /stensträng/i },
  { term: 'fossil åkermark', type: 'fossil åkermark',   re: /fossil\s*åker|åkermark/i },
  { term: 'fartygslämning',  type: 'fartygslämning',    re: /fartygs.?\s?l(ä|a)mning|båtlämning/i },
  { term: 'vrak',            type: 'vrak med tradition', re: /\bvrak\b/i },
  // Grottor/överhäng — arkeologiska (boplats-/brukningsgrottor, stenålder→nyare tid).
  // Skilt från 'grotta med tradition' (folkloregrottor). RAÄ-lämningstyp "Grotta/överhäng".
  { term: 'grotta',          type: 'Grotta/överhäng',   re: /grott|överhäng|h(å|a)la\b/i },
  { term: 'överhäng',        type: 'Grotta/överhäng',   re: /grott|överhäng/i },
  // Fornvägnät — hålvägar/färdvägar (punktkoord här; linjegeometrier = separat pass mot geometri-API).
  { term: 'färdväg',         type: 'färdväg',           re: /färdväg|hålväg/i },
];

// Regioner: län (countyName) + valfritt landskaps- eller bbox-filter (post-filter på placeLabel/koord).
const REGIONS = {
  oland:     { county: 'Kalmar',          landscape: 'Öland' },
  kalmar:    { county: 'Kalmar',          notLandscape: 'Öland' },       // Kalmar läns fastland (Småland)
  grankullaviken: { county: 'Kalmar',     bbox: [16.98, 57.33, 17.20, 57.41] }, // Ölands norra udde + Trollskogen (naturhamn)
  kalmarsund:     { county: 'Kalmar',     bbox: [16.20, 56.55, 16.55, 56.80] }, // Kalmar redd + Grimskär/Skansgrundet (sundet)
  stockholm: { county: 'Stockholm' },
  goteborg:  { county: '"Västra Götaland"', bbox: [11.5, 57.5, 12.4, 58.05] }, // Göteborgstrakten
  uppland:   { county: 'Uppsala',           bbox: [17.5, 59.5, 18.25, 59.95] }, // Långhundraleden/Broborg–Knivsta–Uppsala
  skane:        { county: 'Skåne' },
  ostergotland: { county: 'Östergötland' },
  blekinge:     { county: 'Blekinge' },
  halland:      { county: 'Halland' },
  sverige:      {},   // nationellt: ingen countyName-filtrering (för glesa typer som tingsplats)
};

const argv = process.argv.slice(2);
const REGION = argv.find(a => !a.startsWith('--'));
const APPLY = argv.includes('--apply');
const LIMIT = Number((argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || 0;
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) || 600;
const ONLY = (argv.find(a => a.startsWith('--only=')) || '').split('=')[1] || null;  // t.ex. --only=tingsplats
if (!REGION || !REGIONS[REGION]) {
  console.error('Ange region: oland | kalmar | stockholm | goteborg | uppland | skane | ostergotland | blekinge | halland | sverige'); process.exit(1);
}
const ACTIVE_TYPES = ONLY ? TYPES.filter(t => t.term === ONLY || t.type === ONLY) : TYPES;
const region = REGIONS[REGION];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function ksamsok(query, hits, start) {
  const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${hits}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent(query)}`;
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.status === 200) return r.text();
      await sleep(1500 * (a + 1));
    } catch { await sleep(1000 * (a + 1)); }
  }
  return '';
}

const m1 = (s, re) => { const m = re.exec(s); return m ? m[1].trim() : ''; };

// Parsa ett <pres:item> → lämningsrad, eller null om ej äkta lämning/koord/typ/region.
function parseItem(it, t) {
  const ent = m1(it, /<pres:entityUri>([^<]*)</);
  if (!/\/raa\/lamning\//.test(ent)) return null;                 // äkta Fornsök-lämning
  const cm = it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</);
  if (!cm) return null;
  const lng = parseFloat(cm[1]), lat = parseFloat(cm[2]);
  if (!(lat > 54 && lat < 70 && lng > 10 && lng < 25)) return null;

  const label = m1(it, /<pres:itemLabel[^>]*>([^<]*)</);
  const tags = [...it.matchAll(/<pres:tag[^>]*>([^<]*)</g)].map(x => x[1]).join(' ');
  if (!t.re.test(label + ' ' + tags)) return null;                // typordet måste finnas

  const place = m1(it, /<pres:placeLabel[^>]*>([^<]*)</);
  const p = place.split(',').map(x => x.trim());  // [Land, Län, Kommun, Landskap, Socken]
  const landscape = p[3] || null, municipality = p[2] || null, parish = p[4] || null;

  if (region.landscape && landscape !== region.landscape) return null;
  if (region.notLandscape && landscape === region.notLandscape) return null;
  if (region.bbox) { const [w, s, e, n] = region.bbox; if (!(lng >= w && lng <= e && lat >= s && lat <= n)) return null; }

  const source_uri = ent.replace(/^https?:\/\//, '');             // matcha befintligt lagringsformat
  return { raa_type: t.type, name: label, landscape, municipality, parish, lat, lng, source_uri };
}

async function fetchType(t) {
  const rows = new Map();  // source_uri → row (dedupe)
  const PER = 100, MAX = 25;
  for (let page = 0; page < MAX; page++) {
    const query = region.county ? `text="${t.term}" AND countyName=${region.county}` : `text="${t.term}"`;
    const xml = await ksamsok(query, PER, page * PER + 1);
    const items = xml.split('<pres:item ').slice(1);
    if (!items.length) break;
    for (const it of items) { const r = parseItem(it, t); if (r) rows.set(r.source_uri, r); }
    if (items.length < PER) break;
    await sleep(SLEEP);
  }
  return [...rows.values()];
}

async function main() {
  console.log(`Region: ${REGION} (län ${region.county}${region.landscape ? ', landskap ' + region.landscape : ''}${region.bbox ? ', bbox' : ''}). Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}.`);
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    const perType = {}; let all = [];
    for (const t of ACTIVE_TYPES) {
      let rows = await fetchType(t);
      if (LIMIT) rows = rows.slice(0, LIMIT);
      perType[t.type] = rows.length;
      all = all.concat(rows);
      console.log(`  ${t.type.padEnd(16)} ${rows.length} lämningar`);
    }
    console.log(`\nTotalt: ${all.length} lämningar (${REGION}).`);

    if (!APPLY) {
      console.log('\nDRY-RUN — inget skrivet. Exempel:');
      all.slice(0, 8).forEach(r => console.log(`  ${r.raa_type} | ${r.parish || ''} | ${r.lat.toFixed(4)},${r.lng.toFixed(4)} | ${r.name.slice(0, 40)}`));
      console.log('\nKör med --apply för att skriva.');
      return;
    }

    let inserted = 0;
    for (const r of all) {
      // geom är en GENERATED-kolumn (auto ur lat/lng) → inte med i INSERT.
      const res = await client.query(
        `INSERT INTO heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, source_uri)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (source_uri) DO NOTHING`,
        [r.raa_type, r.name, r.landscape, r.municipality, r.parish, r.lat, r.lng, r.source_uri]);
      inserted += res.rowCount;
    }
    console.log(`\n✅ APPLY klar: ${inserted} nya lämningar (idempotent, ${all.length - inserted} fanns redan).`);
    console.log('Per typ:', JSON.stringify(perType));
  } finally {
    await client.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });

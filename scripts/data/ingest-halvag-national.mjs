// Hålväg/färdväg-ingest (nationell) → heritage_sites. ADDITIV, DEDUPERAD, DRY-RUN default.
//
// Källa: RAÄ Fornsök via K-samsök (CC0). Fritext text="hålväg" fångar lämningar där
// hålväg står i itemLabel ELLER i beskrivningen. RAÄ har INGEN egen lämningstyp "Hålväg"
// på registernivå — hålväg är ett attribut/namn på lämningstyp *Färdväg*/*Färdvägssystem*.
// Därför: raa_type sätts källtroget efter RAÄ:s itemLabel/itemKeyword:
//   itemLabel innehåller "Hålväg"  → raa_type='hålväg'        (RAÄ namnger den så)
//   itemLabel = "Färdvägssystem"   → raa_type='färdvägssystem'
//   annars ("Färdväg")             → raa_type='färdväg'
//
// Proveniens: source_uri=entityUri, register_system='RAÄ Fornsök', register_id=idLabel (L-nr),
// description=RAÄ beskrivning (CC0, verbatim tillåtet). geom = representativ punkt (generated).
// Datering: TYP≠ÅLDER. RAÄ ger sällan tidsspann på färdväg → default nedan; C14/tidsangivelse
// bevaras i description (t.ex. L2019:1863 c14 240–390 e.Kr.). Förfinas av människa/verifierare.
//
// Kör:  node scripts/data/ingest-halvag-national.mjs            # DRY-RUN (fetch + dedupe-räkning)
//       node scripts/data/ingest-halvag-national.mjs --apply    # skriver additivt, ON CONFLICT DO NOTHING
//       node scripts/data/ingest-halvag-national.mjs --apply --only-labeled  # bara RAÄ-namngivna hålvägar

import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const DEFAULT_PERIOD = 'Före 1850 (fornlämning, KML); odaterad, sannolikt medeltida/äldre';
const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const ONLY_LABELED = argv.includes('--only-labeled'); // bara poster vars itemLabel nämner hålväg
const SLEEP = 600;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const m1 = (s, re) => { const m = re.exec(s); return m ? m[1].trim() : ''; };

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));

async function page(start) {
  const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=100&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent('text="hålväg"')}`;
  for (let a = 0; a < 4; a++) {
    try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 200) return r.text(); await sleep(1500 * (a + 1)); }
    catch { await sleep(1000 * (a + 1)); }
  }
  return '';
}

function classify(label) {
  if (/hålväg/i.test(label)) return 'hålväg';
  if (/färdvägssystem/i.test(label)) return 'färdvägssystem';
  return 'färdväg';
}

function parseItem(it) {
  const ent = m1(it, /<pres:entityUri>([^<]*)</);
  if (!/\/raa\/lamning\//.test(ent)) return null;                 // äkta Fornsök-lämning
  const label = m1(it, /<pres:itemLabel>([^<]*)</);
  if (!/färdväg|hålväg/i.test(label)) return null;                // en väglämning (ej stray gravfält som nämner hålväg)
  if (ONLY_LABELED && !/hålväg/i.test(label)) return null;
  const cm = it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</); // representativ punkt (georss:where)
  if (!cm) return null;
  const lng = parseFloat(cm[1]), lat = parseFloat(cm[2]);
  if (!(lat > 54 && lat < 70 && lng > 10 && lng < 25)) return null;
  const idLabel = m1(it, /<pres:idLabel>([^<]*)</) || null;       // L-nr
  const desc = m1(it, /<pres:description>([\s\S]*?)<\/pres:description>/).replace(/\s+/g, ' ').trim() || null;
  const place = m1(it, /<pres:placeLabel>([^<]*)</);
  const p = place.split(',').map(x => x.trim());                  // [Land, Landskap?, Kommun, Landskap, Socken]
  const municipality = p[2] || null, landscape = p[3] || null, parish = p[4] || null;
  const source_uri = ent.replace(/^https?:\/\//, '');
  return { raa_type: classify(label), name: label, landscape, municipality, parish, lat, lng,
           source_uri, register_id: idLabel, description: desc, period: DEFAULT_PERIOD };
}

async function main() {
  console.log(`Hålväg/färdväg nationell ingest. Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}${ONLY_LABELED ? ' (only-labeled)' : ''}.`);
  const rows = new Map();
  for (let pg0 = 0; pg0 < 120; pg0++) {
    const xml = await page(pg0 * 100 + 1);
    const items = xml.split('<pres:item ').slice(1);
    if (!items.length) break;
    for (const it of items) { const r = parseItem(it); if (r) rows.set(r.source_uri, r); }
    if (items.length < 100) break;
    await sleep(SLEEP);
  }
  const all = [...rows.values()];
  const byType = {}; all.forEach(r => byType[r.raa_type] = (byType[r.raa_type] || 0) + 1);
  console.log(`Distinkta väglämningar (hålväg-fritext): ${all.length}. Per raa_type: ${JSON.stringify(byType)}`);

  const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
  await client.connect();
  try {
    const uris = all.map(r => r.source_uri);
    const ex = await client.query(`select count(*) c from heritage_sites where source_uri = ANY($1::text[])`, [uris]);
    const already = Number(ex.rows[0].c);
    console.log(`Redan i heritage_sites (dedupe på source_uri): ${already}. Nya att skriva: ${all.length - already}.`);

    if (!APPLY) {
      console.log('\nDRY-RUN — inget skrivet. Exempel:');
      all.slice(0, 6).forEach(r => console.log(`  ${r.raa_type} | ${r.register_id} | ${r.parish || ''} ${r.landscape || ''} | ${r.lat.toFixed(4)},${r.lng.toFixed(4)} | ${r.name}`));
      console.log('\nKör med --apply för att skriva (kräver mänskligt beslut).');
      return;
    }
    let inserted = 0;
    for (const r of all) {
      const res = await client.query(
        `INSERT INTO heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, source_uri, register_system, register_id, description, period, existence)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'RAÄ Fornsök',$9,$10,$11,'extant')
         ON CONFLICT (source_uri) DO NOTHING`,
        [r.raa_type, r.name, r.landscape, r.municipality, r.parish, r.lat, r.lng, r.source_uri, r.register_id, r.description, r.period]);
      inserted += res.rowCount;
    }
    console.log(`\n✅ APPLY klar: ${inserted} nya, ${all.length - inserted} fanns redan (idempotent). Per typ: ${JSON.stringify(byType)}`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });

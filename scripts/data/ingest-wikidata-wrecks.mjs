// Wikidata → shipwrecks (svenska vrak med koordinat + förlisningsår)
//
// Hämtar vrak (P31/P279* shipwreck) med koordinat (P625) i Sveriges bbox ur Wikidata (CC0).
// Förlisningsår sätts ENDAST från en förlisnings-/sjunk-händelse (P793 + P585-kvalificerare vars
// händelse-etikett matchar sink/wreck/scuttle/lost) — annars null (aldrig gissat sjunkår).
// Idempotent på source_ref = 'wikidata:<QID>'. Koordinat ALLTID ur källan.
//
// Användning: node scripts/data/ingest-wikidata-wrecks.mjs [--apply]

import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se; runologi)';
const SPARQL = `SELECT DISTINCT ?item ?itemLabel ?lat ?lon (YEAR(?date) AS ?yr) WHERE {
  ?item wdt:P31/wdt:P279* wd:Q852190 .
  ?item p:P625 ?s . ?s psv:P625 ?v . ?v wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon .
  FILTER(?lat>55 && ?lat<69.5 && ?lon>10 && ?lon<24.5)
  OPTIONAL {
    ?item p:P793 ?evs . ?evs ps:P793 ?ev . ?evs pq:P585 ?date .
    ?ev rdfs:label ?el . FILTER(lang(?el)="en")
    FILTER(CONTAINS(LCASE(?el),"sink") || CONTAINS(LCASE(?el),"wreck") || CONTAINS(LCASE(?el),"scuttl") || CONTAINS(LCASE(?el),"lost"))
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
} LIMIT 500`;

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function wdqs() {
  const url = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(SPARQL) + '&format=json';
  for (let a = 0; a < 5; a++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } });
    if (r.status === 200) return r.json();
    if (r.status === 429 || r.status === 503) { await sleep(7000 * (a + 1)); continue; }
    throw new Error('WDQS ' + r.status);
  }
  throw new Error('WDQS rate limit');
}

async function main() {
  console.log(`Hämtar vrak ur Wikidata… (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
  const j = await wdqs();
  // Deduplicera per QID; behåll raden med år om någon finns.
  const byQid = new Map();
  for (const b of j.results.bindings) {
    const qid = b.item.value.split('/').pop();
    const yr = b.yr && /^\d+$/.test(b.yr.value) ? Number(b.yr.value) : null;
    const cur = byQid.get(qid);
    if (!cur) byQid.set(qid, { qid, name: b.itemLabel.value, lat: +b.lat.value, lon: +b.lon.value, yr });
    else if (yr && !cur.yr) cur.yr = yr;
  }
  const wrecks = [...byQid.values()];
  console.log(`Wikidata: ${wrecks.length} distinkta vrak, ${wrecks.filter(w => w.yr).length} med förlisningsår.`);

  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    if (!APPLY) {
      console.log('\nDRY-RUN — inget skrivet. Exempel:');
      wrecks.slice(0, 10).forEach(w => console.log(`  ${w.name} — ${w.yr ?? 'år okänt'} (${w.lat.toFixed(3)},${w.lon.toFixed(3)})`));
      console.log('\nKör med --apply för att skriva.');
      return;
    }
    let inserted = 0;
    for (const w of wrecks) {
      const ref = `wikidata:${w.qid}`;
      const res = await client.query(
        `INSERT INTO shipwrecks (name, sinking_year, geom, coord_source, coord_precision_m, source_ref, source_license, source_attribution, notes)
         SELECT $1,$2, ST_SetSRID(ST_MakePoint($3,$4),4326), 'Wikidata (P625)', 100, $5, 'CC0', 'Wikidata', 'Ingest Wikidata: koordinat P625, sjunkår ur förlisningshändelse där belagt'
         WHERE NOT EXISTS (SELECT 1 FROM shipwrecks WHERE source_ref = $5)`,
        [w.name, w.yr, w.lon, w.lat, ref]);
      inserted += res.rowCount;
    }
    console.log(`\n✅ APPLY klar: ${inserted} vrak insatta (idempotent på source_ref).`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });

// Ingest av svenska MEDELTIDSKYRKOR från Wikidata (CC0) -> public.ecclesiastical_sites.
//
// Wikidata har 1770 svenska kyrkor med koordinat (P625) + byggår (P571). Vi filtrerar
// medeltida (inception 800–1550) och gör TVÅ saker i PostGIS (avståndsbaserat, 300 m):
//   1. BERIKAR befintliga rader (207 RAÄ-sockenkyrkor + 18 Öland/Kalmar m.fl.) med built_from
//      där det saknas — matchar närmaste Wikidata-kyrka inom 300 m.
//   2. LÄGGER TILL saknade kyrkor (Gotland, resten av Öland, Uppland, Stockholm …) som inte
//      redan finns inom 300 m. Idempotent via den rumsliga NOT EXISTS-kontrollen (ingen
//      dubblett vid omkörning). Koordinater kommer ALLTID från Wikidata — inga gissade lägen.
//
// Kör: node scripts/data/ingest-medieval-churches.mjs   (kräver SUPABASE_DB_PASSWORD i .env)

import pg from 'pg';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const PW = env.SUPABASE_DB_PASSWORD;
if (!PW) { console.error('SUPABASE_DB_PASSWORD saknas'); process.exit(1); }

const SPARQL = `SELECT ?item ?itemLabel ?coord ?inc WHERE {
  ?item wdt:P31/wdt:P279* wd:Q16970 ; wdt:P17 wd:Q34 ; wdt:P625 ?coord ; wdt:P571 ?inc .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
}`;

async function fetchWikidata() {
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(SPARQL);
  const r = await fetch(url, { headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)' } });
  if (!r.ok) throw new Error('WDQS HTTP ' + r.status);
  const j = await r.json();
  const byQid = new Map();
  for (const b of j.results.bindings) {
    const qid = b.item.value.split('/').pop();
    const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(b.coord.value); // Point(lng lat)
    if (!m) continue;
    const lng = parseFloat(m[1]), lat = parseFloat(m[2]);
    const ym = /^(-?\d{1,4})-/.exec(b.inc.value);
    if (!ym) continue;
    const year = parseInt(ym[1], 10);
    const name = b.itemLabel?.value || qid;
    const prev = byQid.get(qid);
    // behåll TIDIGASTE byggår per kyrka (ursprunget, inte ombyggnad)
    if (!prev || year < prev.year) byQid.set(qid, { qid, name, lat, lng, year });
  }
  return [...byQid.values()].filter(c => c.year >= 800 && c.year <= 1550 && Number.isFinite(c.lat) && Number.isFinite(c.lng));
}

async function main() {
  const rows = await fetchWikidata();
  console.log(`Wikidata: ${rows.length} medeltidskyrkor (800–1550) med koordinat.`);

  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: PW, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TEMP TABLE _stg_wd(qid text, name text, lat double precision, lng double precision, year int, geom geometry(Point,4326)) ON COMMIT DROP`);
    // Ladda staging i batchar (utan geom), sätt geom i separat UPDATE (robust).
    const B = 500;
    for (let i = 0; i < rows.length; i += B) {
      const chunk = rows.slice(i, i + B);
      const vals = [], params = []; let p = 1;
      for (const c of chunk) {
        vals.push(`($${p++},$${p++},$${p++},$${p++},$${p++})`);
        params.push(c.qid, c.name, c.lat, c.lng, c.year);
      }
      await client.query(`INSERT INTO _stg_wd(qid,name,lat,lng,year) VALUES ${vals.join(',')}`, params);
    }
    await client.query(`UPDATE _stg_wd SET geom = ST_SetSRID(ST_MakePoint(lng,lat),4326)`);

    // 1. Berika befintliga (fyll built_from där NULL) från närmaste Wikidata-kyrka inom 300 m.
    const enrich = await client.query(`
      WITH nearest AS (
        SELECT DISTINCT ON (e.id) e.id AS eid, w.year
        FROM public.ecclesiastical_sites e
        JOIN _stg_wd w ON ST_DWithin(e.geom::geography, w.geom::geography, 300)
        WHERE e.built_from IS NULL AND e.geom IS NOT NULL
        ORDER BY e.id, ST_Distance(e.geom::geography, w.geom::geography)
      )
      UPDATE public.ecclesiastical_sites e SET built_from = n.year
      FROM nearest n WHERE e.id = n.eid`);

    // 2. Lägg till saknade (ingen befintlig inom 300 m). Idempotent.
    const ins = await client.query(`
      INSERT INTO public.ecclesiastical_sites
        (name, kind, lat, lng, built_from, dating_class, external_id, register_url, source, license, legacy_table)
      SELECT w.name, 'parish_church', w.lat, w.lng, w.year,
             (((w.year/100)+1)::text || ':e årh.'), w.qid,
             'https://www.wikidata.org/wiki/' || w.qid, 'Wikidata (CC0)', 'CC0', 'wikidata'
      FROM _stg_wd w
      WHERE NOT EXISTS (
        SELECT 1 FROM public.ecclesiastical_sites e
        WHERE e.geom IS NOT NULL AND ST_DWithin(e.geom::geography, w.geom::geography, 300)
      )
      RETURNING 1`);
    await client.query('COMMIT');

    console.log(`Berikade befintliga med byggår: ${enrich.rowCount}`);
    console.log(`Nya kyrkor tillagda: ${ins.rowCount}`);

    const sum = await client.query(`
      SELECT count(*) total,
             count(*) FILTER (WHERE built_from IS NOT NULL) med_byggar,
             count(*) FILTER (WHERE legacy_table='wikidata') fran_wikidata
      FROM public.ecclesiastical_sites WHERE kind IN ('parish_church','chapel','cathedral')`);
    console.table(sum.rows);
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; }
  finally { await client.end(); }
}
main().catch(e => { console.error('FEL:', e.message); process.exit(1); });

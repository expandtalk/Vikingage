// Ingest av SGU:s strandförskjutningsmodell (CC-BY) -> public.paleo_shorelines.
//
// Verifierade fakta (2026-07-21):
//  * OGC-API: https://api.sgu.se/oppnadata/strandforskjutningsmodell/ogc/features/v1/
//  * GeoJSON kan begäras i EPSG:4326 direkt (crs-param) -> ingen manuell reprojektion.
//  * Varje "kollektion" (bpXXXX-YYYY) = EN tidsskiva. bbox-mängden i Mälardalen för
//    bp1000-1900 har min=max year = 950 -> collection = år 950 e.Kr. (bp=1000).
//  * Modellen är ett RUTNÄT av små sea/lake-celler (~19,5k i studie-bbox), inte en
//    kustlinje-polygon -> vi löser upp (ST_UnaryUnion) + förenklar till en MultiPolygon.
//  * OBS: `offset`-param släpper `bbox` på servern -> använd stor `limit` i ett svep.
//
// Kör: node scripts/data/ingest-paleo-shorelines.mjs
// Kräver SUPABASE_DB_PASSWORD i .env. Idempotent (DELETE per år+modell före insert).
// Regionalt avgränsat (Mälardalen/Uppland) medvetet — utbyggbart via BBOX-env.

import pg from 'pg';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const PW = env.SUPABASE_DB_PASSWORD;
if (!PW) { console.error('SUPABASE_DB_PASSWORD saknas i .env'); process.exit(1); }

const BBOX = process.env.BBOX || '16.5,59.2,18.7,60.5';       // Mälardalen/Uppland (lng,lat,lng,lat)
const CRS = 'http://www.opengis.net/def/crs/EPSG/0/4326';
const SIMPLIFY_DEG = 0.0015;                                   // ~150 m, lättar webbrendering
// Empiriskt: kollektionen bp1000-1900 innehåller EN skiva per 100 år, year_ce 50..950.
// API:t hedrar varken `bp`-filter eller `sortby` -> hämta allt i bbox och gruppera på
// varje features egen `year` (= year_ce). Fler kollektioner (äldre/yngre) kan läggas till.
const COLLECTIONS = ['bp1000-1900'];
const LABELS = {                                               // trevliga etiketter; fallback nedan
  950: 'Vikingatid ~950 e.Kr.', 750: 'Vendeltid ~750 e.Kr.', 650: 'Vendeltid ~650 e.Kr.',
  550: 'Folkvandringstid ~550 e.Kr.', 450: 'Folkvandringstid ~450 e.Kr.',
  350: 'Romersk järnålder ~350 e.Kr.', 250: 'Romersk järnålder ~250 e.Kr.',
  150: 'Romersk järnålder ~150 e.Kr.', 50: 'Äldre järnålder ~50 e.Kr.',
};
const labelFor = (y) => LABELS[y] || `${y} e.Kr.`;

async function fetchCollection(collection) {
  const url = `https://api.sgu.se/oppnadata/strandforskjutningsmodell/ogc/features/v1/collections/${collection}/items`
    + `?f=json&limit=60000&bbox=${BBOX}&crs=${encodeURIComponent(CRS)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`SGU ${collection}: HTTP ${r.status}`);
  const d = await r.json();
  if ((d.links || []).some(l => l.rel === 'next'))
    throw new Error(`${collection}: fler sidor än limit (matched=${d.numberMatched}) — höj limit el. paginera via next-länk`);
  return d.features.map(f => ({ code: f.properties.code, year: f.properties.year, g: JSON.stringify(f.geometry) }));
}

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: PW, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TEMP TABLE _stg_cells(code int, year_ce int, period_label text, geom geometry(Geometry,4326)) ON COMMIT DROP');
    const allYears = new Set();
    for (const collection of COLLECTIONS) {
      const cells = await fetchCollection(collection);
      const byYear = {};
      for (const c of cells) { byYear[c.year] = (byYear[c.year] || 0) + 1; allYears.add(c.year); }
      console.log(`${collection}: ${cells.length} celler, år: ${Object.entries(byYear).map(([y, n]) => `${y}(${n})`).join(' ')}`);
      const B = 1000;
      for (let i = 0; i < cells.length; i += B) {
        const chunk = cells.slice(i, i + B);
        const vals = [], params = []; let p = 1;
        for (const c of chunk) {
          vals.push(`($${p++},$${p++},$${p++},ST_SetSRID(ST_GeomFromGeoJSON($${p++}),4326))`);
          params.push(c.code, c.year, labelFor(c.year), c.g);
        }
        await client.query(`INSERT INTO _stg_cells(code,year_ce,period_label,geom) VALUES ${vals.join(',')}`, params);
      }
    }
    const yrs = [...allYears];
    await client.query(`DELETE FROM paleo_shorelines WHERE model_version='sgu_strandforskjutning' AND year_ce = ANY($1)`, [yrs]);
    const ins = await client.query(
      `INSERT INTO paleo_shorelines(period_label,year_ce,rsl_bound,water_body_type,geom,model_version,source,license,attribution)
       SELECT max(period_label), year_ce, 'median',
              CASE WHEN code=1 THEN 'sea' ELSE 'lake' END,
              ST_Multi(ST_CollectionExtract(
                ST_MakeValid(ST_SimplifyPreserveTopology(
                  ST_UnaryUnion(ST_Collect(ST_MakeValid(geom))), $1)), 3)),
              'sgu_strandforskjutning','SGU','CC-BY-4.0','Sveriges geologiska undersökning (SGU)'
       FROM _stg_cells GROUP BY year_ce, (CASE WHEN code=1 THEN 'sea' ELSE 'lake' END)
       RETURNING id, year_ce, water_body_type, ST_NPoints(geom) AS npts,
                 round((ST_Area(geom::geography)/1e6)::numeric) AS km2`, [SIMPLIFY_DEG]);
    await client.query('COMMIT');
    console.log('Infogat:'); console.table(ins.rows);
    const ext = await client.query(`SELECT year_ce, water_body_type, ST_Extent(geom)::text AS bbox FROM paleo_shorelines WHERE model_version='sgu_strandforskjutning' GROUP BY year_ce, water_body_type`);
    console.log('Geografisk utbredning (kontroll att det ligger i Mälardalen):');
    console.table(ext.rows);
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; }
  finally { await client.end(); }
}
main().catch(e => { console.error('FEL:', e.message); process.exit(1); });

// Hämtar kyrkobilder från Wikidata (P18 -> Wikimedia Commons, licensierat) och matchar
// spatialt (300 m) mot ecclesiastical_sites -> image_url + image_attribution.
// Commons-bilder kräver attribution; vi lagrar filnamn + länk. Thumbnail via Special:FilePath?width=.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const PW = env.SUPABASE_DB_PASSWORD;
if (!PW) { console.error('SUPABASE_DB_PASSWORD saknas'); process.exit(1); }

const SPARQL = `SELECT ?item ?coord ?img WHERE {
  ?item wdt:P31/wdt:P279* wd:Q16970 ; wdt:P17 wd:Q34 ; wdt:P625 ?coord ; wdt:P18 ?img .
}`;

async function fetchImages() {
  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(SPARQL);
  const r = await fetch(url, { headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)' } });
  if (!r.ok) throw new Error('WDQS HTTP ' + r.status);
  const j = await r.json();
  const rows = [];
  for (const b of j.results.bindings) {
    const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(b.coord.value);
    if (!m) continue;
    const lng = parseFloat(m[1]), lat = parseFloat(m[2]);
    const file = decodeURIComponent(b.img.value.split('/').pop());  // Commons-filnamn
    if (!file) continue;
    rows.push({ lat, lng, file });
  }
  return rows;
}

async function main() {
  const rows = await fetchImages();
  console.log(`Wikidata: ${rows.length} kyrkor med bild (P18).`);
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: PW, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TEMP TABLE _stg_img(lat double precision, lng double precision, file text, geom geometry(Point,4326)) ON COMMIT DROP');
    const B = 500;
    for (let i = 0; i < rows.length; i += B) {
      const chunk = rows.slice(i, i + B);
      const vals = [], params = []; let p = 1;
      for (const c of chunk) { vals.push(`($${p++},$${p++},$${p++})`); params.push(c.lat, c.lng, c.file); }
      await client.query(`INSERT INTO _stg_img(lat,lng,file) VALUES ${vals.join(',')}`, params);
    }
    await client.query(`UPDATE _stg_img SET geom = ST_SetSRID(ST_MakePoint(lng,lat),4326)`);
    const res = await client.query(`
      WITH nearest AS (
        SELECT DISTINCT ON (e.id) e.id AS eid, s.file
        FROM public.ecclesiastical_sites e
        JOIN _stg_img s ON ST_DWithin(e.geom::geography, s.geom::geography, 300)
        WHERE e.image_url IS NULL AND e.geom IS NOT NULL
        ORDER BY e.id, ST_Distance(e.geom::geography, s.geom::geography)
      )
      UPDATE public.ecclesiastical_sites e
      SET image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' || replace(n.file,' ','_'),
          image_attribution = 'Wikimedia Commons: ' || n.file || ' (se filsida för licens/upphovsman)'
      FROM nearest n WHERE e.id = n.eid`);
    await client.query('COMMIT');
    console.log(`Kyrkor som fick bild: ${res.rowCount}`);
    const sum = await client.query(`SELECT count(*) FILTER (WHERE image_url IS NOT NULL) med_bild, count(*) tot FROM public.ecclesiastical_sites WHERE kind IN ('parish_church','chapel','cathedral')`);
    console.table(sum.rows);
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; }
  finally { await client.end(); }
}
main().catch(e => { console.error('FEL:', e.message); process.exit(1); });

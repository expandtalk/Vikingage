// Svamp Steg 1 — generera H3-hexgrid för en operativ region.
// Fyller svamp.hex9 (res-9, habitat-grid) + svamp.hex6 (res-6, väder-grid) med celler som
// täcker regionens polygon. Habitat-/väder-attribut fylls i senare steg (Lantmäteri-DEM/NMD,
// Open-Meteo). Idempotent (ON CONFLICT DO NOTHING). Centroid lagras i SRID 3006 (som schemat).
//
// Kör:  node scripts/data/svamp-hexgrid.mjs sthlm_100km
import pg from 'pg';
import * as h3 from 'h3-js';
import { readFileSync } from 'node:fs';

const REGION = process.argv[2] || 'sthlm_100km';
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 120000 });
await c.connect();

// 1) Hämta regionpolygonen som WGS84-GeoJSON.
const gjRow = (await c.query('select namn, ST_AsGeoJSON(ST_Transform(geom,4326)) g from svamp.region where id=$1', [REGION])).rows[0];
if (!gjRow) { console.error('Region saknas:', REGION); process.exit(1); }
const g = JSON.parse(gjRow.g);
const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates; // → array av polygoner (varje = [outer, ...hål])

// 2) Polyfill: samla res-9 och res-6-celler (Set → dedup över polygoner).
const set9 = new Set(), set6 = new Set();
for (const poly of polys) {
  const loops = poly.map((ring) => ring.map(([lng, lat]) => [lat, lng])); // GeoJSON lng,lat → h3 lat,lng
  for (const h of h3.polygonToCells(loops, 9)) set9.add(h);
  for (const h of h3.polygonToCells(loops, 6)) set6.add(h);
}
const cells9 = [...set9], cells6 = [...set6];
console.log(`${gjRow.namn} (${REGION}): res-9 ${cells9.length.toLocaleString()} celler, res-6 ${cells6.length.toLocaleString()} celler`);

// 3) VALIDERA h3_res() mot riktiga h3-js-strängar innan vi skriver 100k-tals rader (ej blind-bygga).
const sample9 = cells9[0], sample7 = h3.cellToParent(sample9, 7), sample6 = cells6[0];
const v = (await c.query('select svamp.h3_res($1) r9, svamp.h3_res($2) r7, svamp.h3_res($3) r6', [sample9, sample7, sample6])).rows[0];
if (v.r9 !== 9 || v.r7 !== 7 || v.r6 !== 6) {
  console.error(`AVBRYT: h3_res gav r9=${v.r9} r7=${v.r7} r6=${v.r6} (väntade 9/7/6) — h3-js-strängformatet matchar inte funktionen.`);
  process.exit(1);
}
console.log('h3_res-validering OK (9/7/6).');

// 4) hex6 (litet) — unnest-insert.
{
  const lat = cells6.map((h) => h3.cellToLatLng(h)[0]);
  const lon = cells6.map((h) => h3.cellToLatLng(h)[1]);
  await c.query(
    `insert into svamp.hex6 (h3, region_id, centroid, lat, lon)
     select u.h3, $4, ST_Transform(ST_SetSRID(ST_MakePoint(u.lon,u.lat),4326),3006), u.lat, u.lon
     from unnest($1::text[], $2::float8[], $3::float8[]) as u(h3,lat,lon)
     on conflict (h3) do nothing`,
    [cells6, lat, lon, REGION],
  );
  const n = (await c.query('select count(*)::int n from svamp.hex6 where region_id=$1', [REGION])).rows[0].n;
  console.log(`hex6 klar: ${n} rader för ${REGION}.`);
}

// 5) hex9 (stort) — batchat, unnest-insert (få parametrar oavsett batchstorlek).
const BATCH = 20000;
let done = 0;
for (let i = 0; i < cells9.length; i += BATCH) {
  const slice = cells9.slice(i, i + BATCH);
  const lng = slice.map((h) => h3.cellToLatLng(h)[1]);
  const lat = slice.map((h) => h3.cellToLatLng(h)[0]);
  const res7 = slice.map((h) => h3.cellToParent(h, 7));
  await c.query(
    `insert into svamp.hex9 (h3, region_id, centroid, h3_res7)
     select u.h3, $5, ST_Transform(ST_SetSRID(ST_MakePoint(u.lng,u.lat),4326),3006), u.res7
     from unnest($1::text[], $2::float8[], $3::float8[], $4::text[]) as u(h3,lng,lat,res7)
     on conflict (h3) do nothing`,
    [slice, lng, lat, res7, REGION],
  );
  done += slice.length;
  process.stdout.write(`\r  hex9: ${done.toLocaleString()} / ${cells9.length.toLocaleString()}`);
}
const n9 = (await c.query('select count(*)::int n from svamp.hex9 where region_id=$1', [REGION])).rows[0].n;
console.log(`\nhex9 klar: ${n9.toLocaleString()} rader för ${REGION}.`);

// 6) hex7 (res-7 VÄDER-grid) — res-7-föräldrarna av hex9-cellerna. vader_dag.h3 har FK mot hex7,
// och hex9.h3_res7 länkar habitat→väder. Måste finnas för väder-ingest + berakna_score-join.
{
  const cells7 = [...new Set(cells9.map((h) => h3.cellToParent(h, 7)))];
  const lat7 = cells7.map((h) => h3.cellToLatLng(h)[0]);
  const lon7 = cells7.map((h) => h3.cellToLatLng(h)[1]);
  await c.query(
    `insert into svamp.hex7 (h3, region_id, centroid, lat, lon)
     select u.h3, $4, ST_Transform(ST_SetSRID(ST_MakePoint(u.lon,u.lat),4326),3006), u.lat, u.lon
     from unnest($1::text[], $2::float8[], $3::float8[]) as u(h3,lat,lon)
     on conflict (h3) do nothing`,
    [cells7, lat7, lon7, REGION],
  );
  const n7 = (await c.query('select count(*)::int n from svamp.hex7 where region_id=$1', [REGION])).rows[0].n;
  console.log(`hex7 klar: ${n7.toLocaleString()} rader för ${REGION}.`);
}
await c.end();
console.log('KLART — Steg 1 (hexgrid) för', REGION);

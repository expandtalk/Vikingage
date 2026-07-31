// Skärp guld-fyndplatser: Plats (find_place) → place_names bynivå inom 15 km av sockencentroid.
// Verifierat via spatial närhet + namn; behåller sockencentroid om ingen bymatch. Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const isGeom=(await c.query(`SELECT udt_name FROM information_schema.columns WHERE table_name='solidi' AND column_name='coordinates'`)).rows[0].udt_name==='geometry';
const setExpr = isGeom ? `ST_SetSRID(ST_MakePoint(m.lng,m.lat),4326)` : `point(m.lng,m.lat)`;
const matchCTE=`
  WITH m AS (
    SELECT s.id, pn.lat, pn.lng,
      ST_Distance(ST_SetSRID(ST_MakePoint(pn.lng,pn.lat),4326)::geography, ST_SetSRID(s.coordinates::geometry,4326)::geography) d
    FROM solidi s
    JOIN LATERAL (
      SELECT p.lat, p.lng FROM place_names p
      WHERE lower(p.name)=lower(s.find_place) AND p.lat IS NOT NULL
        AND ST_DWithin(ST_SetSRID(ST_MakePoint(p.lng,p.lat),4326)::geography, ST_SetSRID(s.coordinates::geometry,4326)::geography, 15000)
      ORDER BY ST_SetSRID(ST_MakePoint(p.lng,p.lat),4326) <-> ST_SetSRID(s.coordinates::geometry,4326) LIMIT 1
    ) pn ON true
    WHERE s.source LIKE 'SHM%' AND s.find_place IS NOT NULL AND s.coordinates IS NOT NULL
  )`;
const dry=(await c.query(`${matchCTE} SELECT count(*) tot, count(*) FILTER (WHERE d>50) finer FROM m`)).rows[0];
console.log(`Plats-matchningar: ${dry.tot} | varav meningsfullt finare (>50 m från centroid): ${dry.finer}`);
if(APPLY){
  const u=await c.query(`${matchCTE}
    UPDATE solidi s SET coordinates=${setExpr}, source='SHM samlingar.shm.se (CC BY 4.0); plats-geokodad (place_names)'
    FROM m WHERE s.id=m.id AND m.d>50`);
  console.log('UPPDATERADE fyndplatser:', u.rowCount);
  await c.query(`NOTIFY pgrst, 'reload schema'`);
} else console.log('(dry-run)');
await c.end();

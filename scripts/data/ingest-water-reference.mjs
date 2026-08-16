// Lätt vattenreferens för #3 null-modell (modernt vatten, ej paleo). Natural Earth 10m (CC0):
// sjöar (polygoner) + kustlinje (linjer), klippt till nordisk bbox. Ny tabell water_reference.
import pg from 'pg';
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url),'utf8')
  .split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const BBOX=[5,55,26,70]; // lng0,lat0,lng1,lat1 (Norden)
const inBox=(g)=>{ // grov bbox-intersektion via feature-koordinater
  let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
  const walk=(a)=>{ if(typeof a[0]==='number'){mnx=Math.min(mnx,a[0]);mxx=Math.max(mxx,a[0]);mny=Math.min(mny,a[1]);mxy=Math.max(mxy,a[1]);} else a.forEach(walk); };
  walk(g.coordinates); return !(mxx<BBOX[0]||mnx>BBOX[2]||mxy<BBOX[1]||mny>BBOX[3]);
};
const RAW='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
async function fetchGeo(f){ const r=await fetch(RAW+f); if(!r.ok) throw new Error(f+' '+r.status); return r.json(); }
const client=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:300000});
await client.connect();
try{
  await client.query(`create table if not exists water_reference(id serial primary key, kind text, name text, geom geometry, source text default 'Natural Earth 10m (CC0)')`);
  await client.query(`truncate water_reference`);
  let n=0;
  for(const [file,kind] of [['ne_10m_lakes.geojson','lake'],['ne_10m_coastline.geojson','coast']]){
    const gj=await fetchGeo(file);
    for(const ft of gj.features){
      if(!ft.geometry||!inBox(ft.geometry)) continue;
      const nm=ft.properties?.name||ft.properties?.name_en||null;
      await client.query(`insert into water_reference(kind,name,geom) values($1,$2,ST_SetSRID(ST_GeomFromGeoJSON($3),4326))`,[kind,nm,JSON.stringify(ft.geometry)]);
      n++;
    }
    console.log(`${file}: laddat (löpande total ${n})`);
  }
  await client.query(`create index if not exists water_reference_gix on water_reference using gist(geom)`);
  const byKind=await client.query(`select kind,count(*) c from water_reference group by kind`);
  const malaren=await client.query(`select name from water_reference where kind='lake' and lower(coalesce(name,'')) ~ 'mälaren|malaren|vänern|vanern|vättern|hjälmaren' limit 10`);
  console.log('Per kind:',byKind.rows);
  console.log('Storsjöar hittade:',malaren.rows.map(r=>r.name));
} finally { await client.end(); }

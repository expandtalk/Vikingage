// Farled-/sjöfartsstråk-ingest från Havs- och vattenmyndighetens ÖPPNA WFS →  fairways.
// Layer: havsplaner-2022:bg-sjofartutanforhavsplan (MultiPolygon, SWEREF99TM/EPSG:3006).
// Moderna korridorer = handelsleds-baslinje (navigerbarheten är geografiskt stabil).
// Den detaljerade Sjöfartsverkets farledsregister (centrumlinjer+attribut) ligger bakom
// Geodatasamverkan (inlogg) → läggs till separat när Daniel hämtat den.
//
// Kör:  node scripts/data/ingest-fairways-hav.mjs <region> [--apply]
//   region = kalmarsund | oland   (SWEREF-bbox N,E-ordning)
import pg from 'pg'; import { readFileSync } from 'node:fs';
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const BASE='https://geodata.havochvatten.se/geoservices/wfs';
const LAYER='havsplaner-2022:bg-sjofartutanforhavsplan';
// SWEREF99TM-bbox [minN,minE,maxN,maxE]
const REGIONS={
  kalmarsund: [6220000,555000,6300000,600000],   // Kalmarsund + södra Öland
  oland:      [6220000,555000,6395000,620000],    // hela Öland-sundet
  oland_gotland: [6250000,600000,6420000,720000], // Kalmarsund/N.Öland → Gotland/Visby-överfarten
};
const argv=process.argv.slice(2);
const REGION=argv.find(a=>!a.startsWith('--'))||'kalmarsund';
const APPLY=argv.includes('--apply');
if(!REGIONS[REGION]){console.error('region: kalmarsund | oland');process.exit(1);}
const [minN,minE,maxN,maxE]=REGIONS[REGION];

const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});

const url=BASE+'?'+new URLSearchParams({service:'WFS',version:'2.0.0',request:'GetFeature',typeNames:LAYER,count:'2000',outputFormat:'application/json',srsName:'urn:ogc:def:crs:EPSG::3006',bbox:`${minN},${minE},${maxN},${maxE},urn:ogc:def:crs:EPSG::3006`});
const r=await fetch(url,{headers:{'User-Agent':UA}});
const geo=JSON.parse(await r.text());
console.log(`WFS ${REGION}: ${geo.features?.length||0} korridor-polygoner (${APPLY?'APPLY':'DRY-RUN'})`);
if(!geo.features?.length){process.exit(0);}

await c.connect();
let ins=0;
for(const f of geo.features){
  const oid=f.properties?.OBJECTID_1 ?? f.id ?? Math.random();
  const uri=`hav:${LAYER}#${oid}`;
  if(!APPLY){console.log(`  DRY ${uri} (${f.geometry?.type})`);continue;}
  const res=await c.query(
    `INSERT INTO fairways (name, fairway_kind, period, note, source, source_uri, geom)
     VALUES (NULL,'modern_shipping_corridor','nutida',
       'Modern sjöfartskorridor (handelsleds-baslinje). Navigerbarheten geografiskt stabil → palimpsest av äldre handelsled.',
       'Havs- och vattenmyndigheten, havsplaner-2022 (öppna data, WFS)', $1,
       ST_Multi(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON($2),3006),4326)))
     ON CONFLICT (source_uri) DO NOTHING`,
    [uri, JSON.stringify(f.geometry)]);
  if(res.rowCount>0) ins++;
}
if(APPLY){
  const tot=await c.query(`SELECT count(*) n, ST_Y(ST_Centroid(ST_Collect(geom))) lat, ST_X(ST_Centroid(ST_Collect(geom))) lng FROM fairways`);
  console.log(`insatta: ${ins} | fairways totalt: ${tot.rows[0].n} (centroid ${(+tot.rows[0].lat).toFixed(3)},${(+tot.rows[0].lng).toFixed(3)})`);
}
await c.end();

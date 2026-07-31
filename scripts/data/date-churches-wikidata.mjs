// Datera odaterade kyrkor via Wikidata P571 (byggår), koordinatmatchat (<150 m). Verifierat,
// ej gissat. Fyller bara built_from IS NULL. Kör: node scripts/data/date-churches-wikidata.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const sparql=`SELECT ?item (SAMPLE(?c) AS ?coord) (MIN(YEAR(?d)) AS ?year) WHERE {
  ?item wdt:P31/wdt:P279* wd:Q16970 . ?item wdt:P17 wd:Q34 . ?item wdt:P625 ?c . ?item wdt:P571 ?d .
} GROUP BY ?item LIMIT 12000`;
const url='https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(sparql);
const r=await fetch(url,{headers:{'User-Agent':UA,'Accept':'application/sparql-results+json'}});
if(r.status!==200){console.log('SPARQL HTTP',r.status);process.exit(1);}
const j=await r.json();
const wd=j.results.bindings.map(b=>{const m=b.coord.value.match(/Point\(([-\d.]+) ([-\d.]+)\)/);return{lat:+m[2],lng:+m[1],year:b.year?+b.year.value:null};}).filter(x=>x.year&&x.year>500&&x.year<2100);
console.log('svenska kyrkor med byggår ur Wikidata:', wd.length);
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
await c.query(`CREATE TEMP TABLE wd_churches(lat float, lng float, year int)`);
for(let i=0;i<wd.length;i+=500){const chunk=wd.slice(i,i+500);
  const vals=chunk.map((x,k)=>`($${k*3+1},$${k*3+2},$${k*3+3})`).join(',');
  await c.query(`INSERT INTO wd_churches VALUES ${vals}`, chunk.flatMap(x=>[x.lat,x.lng,x.year]));}
await c.query(`ALTER TABLE wd_churches ADD COLUMN geom geometry(Point,4326)`);
await c.query(`UPDATE wd_churches SET geom=ST_SetSRID(ST_MakePoint(lng,lat),4326)`);
await c.query(`CREATE INDEX ON wd_churches USING gist(geom)`);
// matcha: närmaste WD-kyrka inom 150 m
const match=`SELECT e.id, (SELECT w.year FROM wd_churches w
     WHERE ST_DWithin(w.geom, ST_SetSRID(ST_MakePoint(e.lng,e.lat),4326)::geography, 150)
     ORDER BY w.geom <-> ST_SetSRID(ST_MakePoint(e.lng,e.lat),4326) LIMIT 1) yr
   FROM ecclesiastical_sites e WHERE e.built_from IS NULL AND e.lat IS NOT NULL`;
const cand=(await c.query(match)).rows.filter(r=>r.yr);
console.log('matchade (odaterad ↔ WD inom 150 m):', cand.length);
const eras={medeltid:0, '1500-1799':0, '1800+':0};
for(const r of cand){ if(r.yr<1520)eras.medeltid++; else if(r.yr<1800)eras['1500-1799']++; else eras['1800+']++; }
console.log('epok-fördelning bland matchade:', JSON.stringify(eras));
if(APPLY){
  const u=await c.query(`UPDATE ecclesiastical_sites e SET built_from=sub.yr,
      dating_source='Wikidata P571 (koordinatmatchad <150 m)'
    FROM (${match}) sub WHERE e.id=sub.id AND sub.yr IS NOT NULL AND e.built_from IS NULL`);
  console.log('UPPDATERADE:', u.rowCount);
  await c.query(`NOTIFY pgrst, 'reload schema'`);
  const nm=await c.query(`SELECT count(*) n FROM nearby_features(59.329,18.069,3,300) WHERE feature_type='church'`);
  console.log('kyrkor i Near me @ Stockholm 3km nu:', nm.rows[0].n);
} else console.log('(dry-run — kör --apply)');
await c.end();

// Homonym-notabilitet: backfyller place_names.wikidata_sitelinks från Wikidata (antal språklänkar =
// notabilitets-proxy) så resolve_place tiebreakar rätt homonym (t.ex. Årsta → Stockholm, inte Närke).
// resolve_place ordnar redan 'order by prio, pop desc' där pop=coalesce(wikidata_sitelinks,0).
// Kör: node scripts/data/backfill-placename-sitelinks.mjs "Årsta" ["Sandviken" ...]
import fs from 'fs'; import pg from 'pg';
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const names=process.argv.slice(2); if(!names.length){console.error('ange ortnamn');process.exit(1);}
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();
for (const name of names) {
  const sparql=`SELECT ?item ?lat ?lon ?sl WHERE { ?item rdfs:label ${JSON.stringify(name)}@sv. ?item wikibase:sitelinks ?sl. ?item wdt:P17 wd:Q34. OPTIONAL { ?item p:P625/psv:P625 [ wikibase:geoLatitude ?lat; wikibase:geoLongitude ?lon ] } } ORDER BY DESC(?sl)`;
  let wd; try { wd=await (await fetch(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`,{headers:{'User-Agent':'VikingAgeResearch/1.0 (daniel.larsson@expandtalk.se)','Accept':'application/sparql-results+json'}})).json(); } catch(e){ console.log(name,'Wikidata-fel',e.message); continue; }
  const rows=(wd.results?.bindings||[]).filter(b=>b.lat&&b.lon).map(b=>({lat:+b.lat.value,lon:+b.lon.value,sl:+b.sl.value}));
  let upd=0;
  for (const r of rows) upd+=(await c.query(`update place_names set wikidata_sitelinks=$1 where lower(name)=lower($4)
    and ST_DWithin(ST_SetSRID(ST_MakePoint(lng,lat),4326)::geography, ST_SetSRID(ST_MakePoint($2,$3),4326)::geography, 3000)
    and (wikidata_sitelinks is null or wikidata_sitelinks < $1)`,[r.sl,r.lon,r.lat,name])).rowCount;
  console.log(`${name}: ${rows.length} Wikidata-noder → ${upd} place_names uppdaterade. Vinnare: ${JSON.stringify((await c.query(`select round(lat::numeric,3) lat, round(lng::numeric,3) lng from resolve_place($1)`,[name])).rows[0])}`);
  await new Promise(r=>setTimeout(r,300));
}
await c.end();

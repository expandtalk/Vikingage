// Seed execution_events ur Wikidata (CC0): avrättade med dödsplats i Sverige.
// Egen formulering i description; wikidata_qid dedupar. Kör: node ... [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const SPARQL=`SELECT ?p ?pLabel ?date ?placeLabel ?coord ?mLabel ?crimeLabel WHERE {
  ?p wdt:P1196 ?m . ?m wdt:P279* wd:Q8454 . ?p wdt:P20 ?place . ?place wdt:P17 wd:Q34 .
  OPTIONAL { ?p wdt:P570 ?date. } OPTIONAL { ?place wdt:P625 ?coord. } OPTIONAL { ?p wdt:P1399 ?crime. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". } } LIMIT 800`;
const r=await fetch('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(SPARQL),{headers:{'User-Agent':'VikingageBot/1.0 (daniel.larsson@expandtalk.se)'}});
const rows=(await r.json()).results.bindings;
// Metod-mappning (Wikidata dödssätt → svensk term)
const METHOD={'capital punishment':null,'dödsstraff':null,'decapitation':'halshuggning','beheading':'halshuggning','halshuggning':'halshuggning','hanging':'hängning','hängning':'hängning','breaking wheel':'rådbråkning (stegel och hjul)','death by burning':'bränning','burning':'bränning','firing squad':'arkebusering','shooting':'arkebusering'};
const byQid=new Map();
for(const x of rows){
  const qid=x.p.value.split('/').pop();
  if(!byQid.has(qid)){
    let lat=null,lng=null; const cm=(x.coord?.value||'').match(/Point\(([-\d.]+) ([-\d.]+)\)/); if(cm){lng=+cm[1];lat=+cm[2];}
    const d=(x.date?.value||'').slice(0,10);
    byQid.set(qid,{qid,name:x.pLabel?.value||null,place:x.placeLabel?.value||null,lat,lng,
      date:/^\d{4}-\d{2}-\d{2}$/.test(d)&&!d.endsWith('-01-01')?d:null, year:d?+d.slice(0,4):null,
      method:x.mLabel?METHOD[x.mLabel.value.toLowerCase()]:undefined, crimes:new Set()});
  }
  if(x.crimeLabel && !/^Q\d+$/.test(x.crimeLabel.value)) byQid.get(qid).crimes.add(x.crimeLabel.value);
}
const list=[...byQid.values()];
console.log(`Wikidata avrättade (unika): ${list.length}`);
list.slice(0,8).forEach(e=>console.log(` - ${e.name} | ${e.date||e.year||'?'} | ${e.place} | ${e.method||'metod ?'} | ${[...e.crimes].join(',')||'brott ?'}`));

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
try{
  await c.query('BEGIN'); let ins=0,skip=0;
  for(const e of list){
    const crime=[...e.crimes].join(', ')||null;
    const desc=`Avrättad${e.place?' i '+e.place:''}${e.date?' '+e.date:e.year?' '+e.year:''}${e.method?' ('+e.method+')':''}${crime?', dömd för '+crime.toLowerCase():''}. Uppgift ur Wikidata (CC0).`;
    const res=await c.query(
      `insert into execution_events (executed_person,crime,method,event_date,event_year,place_name,lat,lng,description,source_ref,source_url,source_rights,wikidata_qid)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Wikidata',$10,'CC0',$11)
       on conflict (wikidata_qid) do nothing`,
      [e.name,crime,e.method||null,e.date,e.year,e.place,e.lat,e.lng,desc,'https://www.wikidata.org/wiki/'+e.qid,e.qid]);
    res.rowCount?ins++:skip++;
  }
  console.log(`\nnya: ${ins}, fanns redan: ${skip}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }

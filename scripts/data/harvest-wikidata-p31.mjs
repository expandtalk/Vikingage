// Ortnamnssemantik steg 1: skörda P31 (instans-av) + sitelinks (salience) för place_names
// som har en Wikidata-crosswalk. Använder Wikidata-API:t (wbgetentities, 50 QID/anrop) —
// ANNAT endpoint än SPARQL-backfillen, så de krockar inte. Idempotent — kör om när backfillen
// lagt till fler QID. Kör: node scripts/data/harvest-wikidata-p31.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c = new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// Bygg id(place_names) → QID. Källor: external_ids-crosswalk + place_names.external_id (URI).
const rows=(await c.query(`
  select pn.id, coalesce(ei.identifier, regexp_replace(pn.external_id,'.*/(Q\\d+).*','\\1')) as qid
    from place_names pn
    left join external_ids ei on ei.entity_table='place_names' and ei.entity_id=pn.id::text and ei.scheme='wikidata'
   where ei.identifier is not null or pn.external_id ~ 'Q\\d+'
`)).rows.filter(r=>/^Q\d+$/.test(r.qid||''));
console.log(`${rows.length} place_names med Wikidata-QID.`);

// QID → place_ids (en QID kan i princip peka på flera rader)
const byQid=new Map();
for(const r of rows){ if(!byQid.has(r.qid)) byQid.set(r.qid,[]); byQid.get(r.qid).push(r.id); }
const qids=[...byQid.keys()];

async function wbget(batch){
  const url=`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${batch.join('|')}&props=claims|sitelinks&format=json&origin=*`;
  for(let a=0;a<4;a++){ try{ const r=await fetch(url,{headers:{'User-Agent':UA}}); if(r.status===200) return (await r.json()).entities||{}; await sleep(1200*(a+1)); }catch{ await sleep(1000*(a+1)); } }
  return {};
}

let done=0, updated=0; const tally={};
for(let i=0;i<qids.length;i+=50){
  const batch=qids.slice(i,i+50);
  const ents=await wbget(batch);
  for(const qid of batch){
    const e=ents[qid]; if(!e) continue;
    const p31=(e.claims?.P31||[]).map(s=>s.mainsnak?.datavalue?.value?.id).filter(Boolean);
    const sitelinks=e.sitelinks?Object.keys(e.sitelinks).length:0;
    for(const pid of byQid.get(qid)){
      done++;
      if(APPLY){
        const res=await c.query('update place_names set wikidata_p31=$1, wikidata_sitelinks=$2 where id=$3',
          [p31.join('|')||null, sitelinks, pid]);
        updated+=res.rowCount;
      }
    }
    for(const t of p31) tally[t]=(tally[t]||0)+1;
  }
  console.log(`  ${Math.min(i+50,qids.length)}/${qids.length} QID…`);
  await sleep(400);
}
// Vanligaste P31-typerna (för att se referent-fördelningen).
const top=Object.entries(tally).sort((a,b)=>b[1]-a[1]).slice(0,12);
console.log('\nVanligaste P31 (instans-av):'); for(const [q,n] of top) console.log(`  ${q}: ${n}`);
console.log(`\n${APPLY?'APPLIED':'DRY-RUN'}: ${done} rader behandlade, ${updated} uppdaterade.`);
await c.end();

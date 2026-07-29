// Avrättnings-/galgplatser i hela Sverige ur RAÄ Fornsök (CC0-lämningar med koord).
// Metod à la SCB (2021): multipla sökfält, gallra dubbletter. TEMPORAL NOT: platserna flyttade över
// tid och medeltida avrättningsplatser saknar ofta registrering (SCB) — period fångas där RAÄ har den,
// annars null + not. Dedup på entityUri + heritage_sites.source_uri. Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const TERMS=['avrättningsplats','galgplats','galgbacke','galge','stegling'];
const LABEL_RE=/avrätt|galg|stegl/i;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const dec=s=>(s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
async function ks(q,hits,start){
  const url=`https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${hits}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent(q)}`;
  for(let a=0;a<4;a++){ try{ const r=await fetch(url,{headers:{'User-Agent':UA}}); if(r.status===200) return await r.text(); await sleep(1200*(a+1)); }catch{ await sleep(1000*(a+1)); } }
  return '';
}
const found=new Map();
for(const t of TERMS){
  const first=await ks(`text="${t}"`,1,1); const total=+((first.match(/<totalHits>(\d+)/)||[])[1]||0);
  let start=1;
  while(start<=total){
    const xml=await ks(`text="${t}"`,500,start);
    const recs=xml.split('<pres:item ').slice(1).map(s=>'<pres:item '+s.split('</pres:item>')[0]);
    if(!recs.length) break;
    for(const r of recs){
      const uri=(r.match(/<pres:entityUri>([^<]+)/)||[])[1]; if(!uri||!/\/raa\/lamning\//.test(uri)) continue;
      const name=dec((r.match(/<pres:itemLabel>([^<]+)/)||[])[1]);
      const tags=(r.match(/<pres:tag>([^<]+)/g)||[]).join(' ');
      if(!LABEL_RE.test(name) && !LABEL_RE.test(tags)) continue;
      const cm=r.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</); if(!cm) continue;
      const lng=+cm[1], lat=+cm[2]; if(!(lat>54&&lat<70&&lng>10&&lng<25)) continue;
      const place=dec((r.match(/<pres:placeLabel>([^<]+)/)||[])[1]); // "Sverige, Län, Kommun, Landskap, Socken"
      const parts=place.split(',').map(s=>s.trim());
      const raa=/avrätt/i.test(name)?'Avrättningsplats':/stegl/i.test(name)?'Stegling':/galg/i.test(name)?'Galgplats/galgbacke':'Avrättningsplats';
      const short=uri.replace(/^https?:\/\//,'');
      if(!found.has(short)) found.set(short,{name:name||raa, raa, lat, lng, municipality:parts[2]||null, landscape:parts[3]||null, parish:parts[4]||null});
    }
    start+=500; await sleep(400);
  }
  console.log(`  ${t}: totalHits=${total}, ackumulerat unika=${found.size}`);
}
console.log(`\nUnika avrättnings-/galglämningar (hela Sverige): ${found.size}`);

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:300000});
await c.connect();
try{
  await c.query('BEGIN');
  let ins=0,dup=0;
  const NOTE=' Avrättnings-/galgplats ur RAÄ Fornsök (CC0). TEMPORAL: platsen kan ha flyttat över tid; medeltida avrättningsplatser saknar ofta registrering (jfr SCB 2021, galg- och avrättningsplatser). Datering ofta ospecificerad i RAÄ.';
  for(const [short,r] of found){
    const ex=await c.query(`select 1 from heritage_sites where source_uri=$1 or source_uri=$2 limit 1`,[short,'http://'+short]);
    if(ex.rowCount){ dup++; continue; }
    await c.query(`insert into heritage_sites (name,raa_type,lat,lng,source_uri,description,landscape,municipality,parish) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [r.name,r.raa,r.lat,r.lng,short,(r.name||'Avrättningsplats')+'.'+NOTE,r.landscape,r.municipality,r.parish]);
    ins++;
  }
  console.log(`nya: ${ins}, fanns redan: ${dup}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN (rollback). --apply för skarpt.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }

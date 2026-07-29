// Avrättade personer ur svenska Wikipedia-KATEGORIER → Wikidata-QID → strukturerade CC0-fakta.
// Kategorimedlemskap (häxeri/halshuggning/bränning/1700/1800-tal) = fakta som fyller brott/metod/epok
// där Wikidata saknar dem. Egen formulering. Dedup: wikidata_qid + namn+år. Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const jget=async u=>{ for(let a=0;a<4;a++){ try{ const r=await fetch(u,{headers:{'User-Agent':UA}}); if(r.ok) return await r.json(); }catch{} await sleep(1000*(a+1)); } return null; };

// kategori → {method?, crime?, century?}
const CATS=[
  ['Personer som blivit avrättade för häxeri i Sverige',        {crime:'trolldom (häxeri)'}],
  ['Personer som blivit avrättade genom halshuggning i Sverige',{method:'halshuggning'}],
  ['Personer som blivit avrättade genom bränning i Sverige',    {method:'bränning'}],
  ['Personer som blivit avrättade av Sverige under 1700-talet', {century:'1700-tal'}],
  ['Personer som blivit avrättade av Sverige under 1800-talet', {century:'1800-tal'}],
];
const byTitle=new Map(); // title → {methods:Set, crimes:Set, centuries:Set}
for(const [cat,tag] of CATS){
  let cmcontinue='';
  do{
    const u=`https://sv.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Kategori:'+cat)}&cmnamespace=0&cmlimit=500&format=json${cmcontinue?`&cmcontinue=${encodeURIComponent(cmcontinue)}`:''}`;
    const j=await jget(u); if(!j) break;
    for(const m of j.query.categorymembers){
      if(!byTitle.has(m.title)) byTitle.set(m.title,{methods:new Set(),crimes:new Set(),centuries:new Set()});
      const e=byTitle.get(m.title);
      if(tag.method) e.methods.add(tag.method);
      if(tag.crime) e.crimes.add(tag.crime);
      if(tag.century) e.centuries.add(tag.century);
    }
    cmcontinue=j.continue?.cmcontinue||''; await sleep(200);
  }while(cmcontinue);
}
const titles=[...byTitle.keys()];
console.log(`unika personer i kategorierna: ${titles.length}`);

// title → QID (batcha pageprops 50 åt gången)
const titleQid=new Map();
for(let i=0;i<titles.length;i+=50){
  const batch=titles.slice(i,i+50);
  const u=`https://sv.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&titles=${encodeURIComponent(batch.join('|'))}&format=json`;
  const j=await jget(u); if(!j) continue;
  for(const p of Object.values(j.query.pages)){ const qid=p.pageprops?.wikibase_item; if(qid) titleQid.set(p.title,qid); }
  await sleep(250);
}
console.log(`med Wikidata-QID: ${titleQid.size}`);
const qids=[...titleQid.values()];

// Wikidata: dödsdatum/plats/koord/metod/brott
const facts=new Map();
for(let i=0;i<qids.length;i+=180){
  const vals=qids.slice(i,i+180).map(q=>'wd:'+q).join(' ');
  const q=`SELECT ?p ?dod ?placeLabel ?coord ?mLabel ?crimeLabel WHERE {
    VALUES ?p { ${vals} }
    OPTIONAL { ?p wdt:P570 ?dod. } OPTIONAL { ?p wdt:P20 ?place. OPTIONAL { ?place wdt:P625 ?coord. } }
    OPTIONAL { ?p wdt:P1196 ?m. } OPTIONAL { ?p wdt:P1399 ?crime. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". } }`;
  const j=await jget('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(q)); if(!j) continue;
  for(const b of j.results.bindings){
    const qid=b.p.value.split('/').pop();
    if(!facts.has(qid)){
      let lat=null,lng=null; const cm=(b.coord?.value||'').match(/Point\(([-\d.]+) ([-\d.]+)\)/); if(cm){lng=+cm[1];lat=+cm[2];}
      const d=(b.dod?.value||'').slice(0,10);
      facts.set(qid,{place:b.placeLabel?.value||null,lat,lng,
        date:/^\d{4}-\d{2}-\d{2}$/.test(d)&&!d.endsWith('-01-01')?d:null, year:d?+d.slice(0,4):null,
        wdManner:b.mLabel&&!/^Q\d+$/.test(b.mLabel.value)?b.mLabel.value.toLowerCase():null, crimes:new Set()});
    }
    if(b.crimeLabel && !/^Q\d+$/.test(b.crimeLabel.value)) facts.get(qid).crimes.add(b.crimeLabel.value);
  }
  await sleep(300);
}
const MMAP={'decapitation':'halshuggning','beheading':'halshuggning','death by burning':'bränning','burning at the stake':'bränning','hanging':'hängning'};

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
try{
  await c.query('BEGIN'); let ins=0,skip=0,coords=0;
  for(const [title,qid] of titleQid){
    const cat=byTitle.get(title); const f=facts.get(qid)||{crimes:new Set()};
    const method = f.wdManner ? (MMAP[f.wdManner]||f.wdManner) : [...cat.methods][0] || null;
    const crime = f.crimes.size ? [...f.crimes].join(', ') : [...cat.crimes][0] || null;
    const period = f.year ? null : ([...cat.centuries][0] || null);
    // dedup
    const ex=await c.query(`select 1 from execution_events where wikidata_qid=$1 or (lower(executed_person)=lower($2) and coalesce(event_year,0)=coalesce($3,0)) limit 1`,[qid,title.replace(/\s*\(.*?\)\s*/g,'').trim(),f.year||null]);
    if(ex.rowCount){ skip++; continue; }
    const name=title.replace(/\s*\((?:död|d\.)[^)]*\)/i,'').trim();
    if(f.lat!=null) coords++;
    const desc=`${name} avrättades${f.place?' i '+f.place:''}${f.date?' '+f.date:f.year?' '+f.year:period?' ('+period+')':''}${method?' ('+method+')':''}${crime?', dömd för '+crime.toLowerCase():''}. Uppgift ur Wikidata (CC0); kategorisering via svenska Wikipedia.`;
    await c.query(`insert into execution_events (executed_person,crime,method,event_date,event_year,period,place_name,lat,lng,description,source_ref,source_url,source_rights,wikidata_qid)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Wikidata (CC0) + svenska Wikipedia-kategori',$11,'CC0',$12) on conflict (wikidata_qid) do nothing`,
      [name,crime,method,f.date||null,f.year||null,period,f.place||null,f.lat,f.lng,desc,'https://www.wikidata.org/wiki/'+qid,qid]);
    ins++;
  }
  console.log(`\nnya: ${ins} (varav ${coords} med koord), dubblett: ${skip}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }

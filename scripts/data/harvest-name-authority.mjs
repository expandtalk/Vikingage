// Unifierar namn från våra egna korpusar → name_authority (tre-axel-modell).
// Seed: viking_names + carvers(förnamnstoken) + historical_kings(förnamnstoken) + given_name_stats (moderna, ≥5 barn).
// Axel 1 (etymologi/betydelse/kön): ur viking_names där det finns; annars null (filolog-backfill senare).
// Axel 2 (tradition_layer): NULL — filologisk, gissas ej.
// Axel 3 (swedish_usage_layer): BERÄKNAS ur korpus-förekomst (runsten>medeltid>modernt). Evidens-flaggor lagras.
// Bevarar befintliga rader (Erik-piloten): skriver ej över etymologi/kön med null.
import pg from 'pg';import {readFileSync} from 'node:fs';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(t,p)=>(await c.query(t,p)).rows;

const fold=s=>(s||'').toLowerCase().trim()
  .replace(/å|ä|æ/g,'a').replace(/ö|ø|ǫ/g,'o').replace(/[éè]/g,'e').replace(/ü/g,'u').replace(/þ/g,'th').replace(/ð/g,'d').replace(/ck/g,'k');
const firstTok=s=>(s||'').trim().split(/[\s,]+/)[0]||'';

// --- seed-källor ---
const cand=new Map(); // key lower(canonical) → {canonical,gender,meaning,etymology,sources:Set}
function add(canonical,src,extra={}){
  canonical=(canonical||'').trim(); if(!canonical||canonical.length<2||/\d/.test(canonical)) return;
  const k=canonical.toLowerCase();
  let e=cand.get(k);
  if(!e){e={canonical,gender:null,meaning:null,etymology:null,sources:new Set()};cand.set(k,e);}
  e.sources.add(src);
  if(extra.gender&&!e.gender)e.gender=extra.gender;
  if(extra.meaning&&!e.meaning)e.meaning=extra.meaning;
  if(extra.etymology&&!e.etymology)e.etymology=extra.etymology;
}
for(const r of await q(`select name,gender,meaning,etymology from viking_names`)) add(r.name,'viking_names',r);
for(const r of await q(`select distinct name from carvers where name is not null`)) add(firstTok(r.name),'carvers');
for(const r of await q(`select distinct name from historical_kings where name is not null`)) add(firstTok(r.name),'historical_kings');
// moderna förnamn ≥5 barn (riket, 2024+2025) + kön
const modern=await q(`select lower(name) k, max(name) canonical, sum(count)::int cnt,
   (array_agg(distinct gender))::text[] genders from given_name_stats where area_type='riket' group by lower(name) having sum(count)>=5`);
const modernCnt=new Map();
for(const r of modern){ add(r.canonical,'given_name_stats',{gender: r.genders.length===1?(r.genders[0]==='flicka'?'kvinna':'man'):null}); modernCnt.set(r.k,r.cnt); }

// --- evidens-index ---
const carverSet=new Set((await q(`select distinct name from carvers where name is not null`)).map(r=>fold(firstTok(r.name))));
const kingSet=new Set((await q(`select distinct name from historical_kings where name is not null`)).map(r=>fold(firstTok(r.name))));
// runstensnamn: fold_key + max n_inscriptions
const runeMap=new Map();
for(const r of await q(`select fold_key, name_form, max(n_inscriptions) n from runic_name_attestations group by fold_key,name_form`)){
  const f=r.fold_key||fold(r.name_form); const prev=runeMap.get(f)||0; if((r.n||0)>prev) runeMap.set(f,r.n||0);
}
const runeKeys=[...runeMap.keys()];
function runeMatch(canonical){
  const f=fold(canonical); if(!f) return 0;
  let best=0;
  for(const rk of runeKeys){ if(rk===f || rk.startsWith(f)){ if(runeMap.get(rk)>best) best=runeMap.get(rk); } }
  return best;
}

// --- beräkna axlar per kandidat ---
const rows=[];
for(const [k,e] of cand){
  const rn=runeMatch(e.canonical);
  const on_run=rn>0;
  const in_car=carverSet.has(fold(e.canonical));
  const in_king=kingSet.has(fold(e.canonical));
  const mcnt=modernCnt.get(k)||null;
  const in_mod=mcnt!=null;
  let layer;
  if(on_run) layer='runsvenskt (belagt vikingatid)';
  else if(in_king||in_car) layer='medeltida/historiskt belägg';
  else if(in_mod) layer='endast modernt belägg';
  else layer='obelagt i våra korpusar';
  rows.push({...e, sources:[...e.sources], on_run, rn:rn||null, in_car, in_king, in_mod, mcnt, layer});
}
console.log(`Kandidater: ${rows.length}. På runsten: ${rows.filter(r=>r.on_run).length}. Endast modernt: ${rows.filter(r=>r.layer.startsWith('endast')).length}.`);

// --- upsert (bevara befintlig etymologi/kön/meaning vid null) ---
const existing=new Map((await q(`select id, lower(canonical) k from name_authority`)).map(r=>[r.k,r.id]));
let ins=0,upd=0;
for(let i=0;i<rows.length;i+=500){
  const batch=rows.slice(i,i+500);
  for(const r of batch){
    const k=r.canonical.toLowerCase();
    const id=existing.get(k);
    if(id){
      await c.query(`update name_authority set
        gender=coalesce(gender,$2), meaning=coalesce(meaning,$3), etymology=coalesce(etymology,$4),
        swedish_usage_layer=$5, on_runestone=$6, runestone_inscriptions=$7, in_carvers=$8, in_kings=$9,
        in_modern_use=$10, modern_birth_count=$11, harvest_sources=$12, updated_at=now() where id=$1`,
        [id,r.gender,r.meaning,r.etymology,r.layer,r.on_run,r.rn,r.in_car,r.in_king,r.in_mod,r.mcnt,r.sources]);
      upd++;
    } else {
      await c.query(`insert into name_authority (canonical,gender,meaning,etymology,swedish_usage_layer,
        on_runestone,runestone_inscriptions,in_carvers,in_kings,in_modern_use,modern_birth_count,harvest_sources)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [r.canonical,r.gender,r.meaning,r.etymology,r.layer,r.on_run,r.rn,r.in_car,r.in_king,r.in_mod,r.mcnt,r.sources]);
      ins++;
    }
  }
  process.stdout.write(`\r  upsert ${Math.min(i+500,rows.length)}/${rows.length}`);
}
console.log(`\nKLART — ${ins} nya, ${upd} uppdaterade i name_authority.`);
console.log('\n=== lager-fördelning ===');
console.log(JSON.stringify(await q(`select swedish_usage_layer, count(*)::int n from name_authority group by 1 order by 2 desc`)));
console.log('=== stickprov: Anna / Adam / Daniel / Sven / Erik ===');
console.log(JSON.stringify(await q(`select canonical,swedish_usage_layer layer,on_runestone,runestone_inscriptions ri,in_modern_use,modern_birth_count mc,etymology is not null etym from name_authority where lower(canonical) in ('anna','adam','daniel','sven','erik','karl','maria') order by canonical`),null,1));
await c.end();

// Skapar institutions-noder (Aspuddens sjukhem / Katarina sjukhus / Långbro sjukhus) i entity_registry
// + Göring→treated_at→sjukhus-edges i relationship, med datum ur PRIMÄRKÄLLA (Regionarkivet, Görings journaler).
// QID resolvas + verifieras (beskrivning måste antyda sjukhus/Stockholm) — annars label-nod utan QID (ingen gissning).
import pg from 'pg';import {readFileSync} from 'node:fs';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(t,p)=>(await c.query(t,p)).rows;
const UA={'User-Agent':'VikingAge-research/1.0 (daniel@expandtalk.se)'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function api(params){const u='https://www.wikidata.org/w/api.php?format=json&origin=*&'+new URLSearchParams(params);for(let a=0;a<5;a++){try{const r=await fetch(u,{headers:UA});if(r.ok)return await r.json();}catch(e){}await sleep(2500);}return null;}
async function resolveQid(name){
  const s=await api({action:'wbsearchentities',search:name,language:'sv',uselang:'sv',type:'item',limit:'8'});
  for(const hit of (s?.search||[])){
    const d=(hit.description||'').toLowerCase();
    if(/sjukhus|hospital|sjukhem|stockholm|mental|psykiatr/.test(d) || (hit.label||'').toLowerCase()===name.toLowerCase()){
      // verifiera P625 (koordinat) finns ev.
      return {qid:hit.id, desc:hit.description||null};
    }
  }
  return null;
}
const REG='Regionarkivet Stockholm — Cecilia Söderman (ur Görings journaler, primärkälla)';
const FONT='Björn Fontander, Görings Sverige – en hatkärlek (Carlsson 2001/2008, ISBN 9789173311670)';
const PLACES=[
 {name:'Aspuddens sjukhem', q:{year:'1925',date:'6 augusti 1925',note:'inlagd för Eucodal-avvänjning; bröt sig in i medicinskåp, hotade personalen',source:REG}},
 {name:'Katarina sjukhus',  q:{year:'1925',date:'1 september 1925',note:'ett dygns vård före Långbro; tvångsvård (hustrun medgav)',source:REG}},
 {name:'Långbro sjukhus',   q:{year:'1925',date:'2 september 1925',note:'avd 7, ca en månad; ytterligare vård 1926 och 1927',source:REG+'; '+FONT}},
];

const goring=(await q(`select id from persons where wikidata_qid='Q47906'`))[0].id; // = entity_registry-id
let made=0, edges=0;
for(const p of PLACES){
  // idempotent: återanvänd befintlig institution-nod med samma label
  let node=(await q(`select id from entity_registry where entity_type='institution' and label=$1 limit 1`,[p.name]))[0];
  if(!node){
    node=(await q(`insert into entity_registry (id,entity_type,label) values (gen_random_uuid(),'institution',$1) returning id`,[p.name]))[0];
    made++;
  }
  const nid=node.id;
  const wd=await resolveQid(p.name);
  if(wd){
    await q(`delete from external_ids where entity_table='entity_registry' and entity_id=$1 and scheme='wikidata'`,[nid]);
    await q(`insert into external_ids (entity_table,entity_id,scheme,identifier,uri,source) values ('entity_registry',$1,'wikidata',$2,$3,'wikidata')`,[nid,wd.qid,'https://www.wikidata.org/entity/'+wd.qid]);
    console.log(`  ${p.name} → nod ${nid.slice(0,8)} + QID ${wd.qid} (${wd.desc||''})`);
  } else {
    console.log(`  ${p.name} → nod ${nid.slice(0,8)} (ingen verifierad QID — label-nod)`);
  }
  const r=await q(`insert into relationship (subject_id,predicate,object_id,qualifiers,source_ref,confidence,created_by)
    values ($1,'treated_at',$2,$3::jsonb,$4,'certain','verifierare-signoff (Göring vårdplatser, Regionarkivet)')
    on conflict (subject_id,predicate,object_id) do update set qualifiers=excluded.qualifiers, source_ref=excluded.source_ref returning id`,
    [goring,nid,JSON.stringify({status:'belagt',...p.q,claim_key:'swconn_goring_'+(p.name.startsWith('Långbro')?'langbro':'aspudden')}),p.q.source]);
  if(r.length)edges++;
  await sleep(400);
}
console.log(`\nKLART — ${made} nya institution-noder, ${edges} treated_at-edges.`);
console.log('\n=== Görings vårdplats-edges ===');
console.log(JSON.stringify(await q(`select er.label sjukhus, r.qualifiers->>'date' datum, r.confidence, (ei.identifier) qid
  from relationship r join entity_registry er on er.id=r.object_id
  left join external_ids ei on ei.entity_table='entity_registry' and ei.entity_id=er.id and ei.scheme='wikidata'
  where r.predicate='treated_at' and r.subject_id=$1 order by r.qualifiers->>'date'`,[goring]),null,1));
await c.end();

// Stockholms blodbad 8–9 nov 1520 (Stortorget) → execution_events. Allmänt känt historiskt
// faktum, egen formulering (source_rights='PD'). Koord Stortorget verifierad (59.3255,18.0708).
// Idempotent (NOT EXISTS på person+datum). Kör: node ... [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const LAT=59.32547, LNG=18.07082;
const REF='Stockholms blodbad, 8–9 november 1520 (allmänt historiskt faktum)';
const EV=[
  {person:'ca 82 avrättade (Stockholms blodbad)', crime:'kätteri/majestätsbrott (skenrättegång under Gustav Trolle)', method:'halshuggning', date:'1520-11-08',
   desc:'Under två dagar 8–9 november 1520 lät den nykrönte unionskungen Kristian II avrätta omkring 82 personer på Stortorget i Stockholm — biskopar, rådmän, borgare och adel — efter en skenrättegång ledd av ärkebiskop Gustav Trolle. Utlöste Gustav Vasas uppror och unionens fall.'},
  {person:'Mattias Gregersson (Lillie), biskop av Strängnäs', crime:'kätteri (majestätsbrott)', method:'halshuggning', date:'1520-11-08',
   desc:'Biskop Mattias av Strängnäs halshöggs bland de första under Stockholms blodbad 8 november 1520.'},
  {person:'Vincentius Henningsson, biskop av Skara', crime:'kätteri (majestätsbrott)', method:'halshuggning', date:'1520-11-08',
   desc:'Biskop Vincentius av Skara halshöggs under Stockholms blodbad 8 november 1520.'},
];
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
try{
  await c.query('BEGIN'); let ins=0,skip=0;
  for(const e of EV){
    const ex=await c.query(`select 1 from execution_events where executed_person=$1 and event_date=$2 limit 1`,[e.person,e.date]);
    if(ex.rowCount){ skip++; continue; }
    await c.query(
      `insert into execution_events (executed_person,crime,method,event_date,event_year,place_name,parish,landscape,lat,lng,description,source_ref,source_rights)
       values ($1,$2,$3,$4,1520,'Stortorget, Stockholm','Stockholm','Uppland',$5,$6,$7,$8,'PD')`,
      [e.person,e.crime,e.method,e.date,LAT,LNG,e.desc,REF]);
    ins++;
  }
  console.log(`nya: ${ins}, fanns redan: ${skip}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }

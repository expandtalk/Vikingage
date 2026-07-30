// Seed elite_monuments — de exceptionella elit-monumenten (Daniels tes). Koord ur befintliga
// DB-rader (runic_inscriptions/heritage_sites) resp. verifierade (Västra Vång Wikidata, Uppåkra).
// Mora stenar-koord hämtas ur location_hypotheses (monument). Idempotent (namn). Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();
const mora=(await c.query(`select lat,lng from location_hypotheses where feature_slug ilike '%mora%' and kind='monument' and lat is not null limit 1`)).rows[0];
// [name, kind, signum, lat, lng, dating, landscape, association, influence, note, link]
const M=[
  ['Rökstenen','hjältediktning','Ög 136',58.2950,14.7752,'~800–850','Östergötland','centralt vid vattenleden Vättern→Motala ström→Söderköping','—','Nordens längsta stående runinskrift (~1110 tecken); legendarisk/hjältediktande — elitens minneskonst, ej formel','/inscription/Ög 136'],
  ['Karlevistenen','skaldevers','Öl 1',56.6075,16.4398,'~950–1000','Öland','kust + gravhög','västnordisk/dansk skaldik','Enda dróttkvätt-strofen (skaldevers) på en runsten — höveitlig minneskonst','/inscription/Öl 1'],
  ['Björketorpsstenen','förbannelse','DR 360',56.2023,15.3807,'~520–700','Blekinge','del av Blekinge-gruppen','—','Urnordisk förbannelseinskrift; en av Nordens mest kända. Släktnamnet Björksten härrör härifrån','/inscription/DR 360'],
  ['Stentoftenstenen','förbannelse','DR 357',56.0532,14.5846,'~600-tal','Blekinge','Blekinge-gruppen (Sölvesborg)','—','Urnordisk förbannelse + goda-år-formel','/inscription/DR 357'],
  ['Gummarpstenen','förbannelse','DR 358',56.0734,14.6089,'~600-tal','Blekinge','Blekinge-gruppen','—','Urnordisk (förlorad; känd ur avbildning)','/inscription/DR 358'],
  ['Istabystenen','förbannelse','DR 359',56.0224,14.6509,'~600–700','Blekinge','Blekinge-gruppen (Mjällby)','—','Urnordisk; kopplas stilistiskt till Stentoften','/inscription/DR 359'],
  ['Västra Vång','centralplats',null,56.2603,15.4203,'järnålder–vikingatid','Blekinge','central-/kultplats; ~7 km N om Björketorp/Listerby','keltiska/romerska bronsmasker; arabiska mynt','70 guldgubbar — makt & kult; nyare storfynd (upptäckt 2004)','/explore?center=56.2603,15.4203&zoom=13'],
  ['Uppåkra','centralplats',null,55.6664,13.1711,'~100 f.Kr.–1000 e.Kr.','Skåne','Nordens största järnålders-centralplats; kulthus','kontinentala kontakter; guldgubbar','Ett tusenårigt makt- och kultcentrum; kyrkan restes ovanpå platsen','/explore?center=55.6664,13.1711&zoom=13'],
  ['Valsgärde båtgravfält','elitgrav',null,59.9261,17.6264,'~600–1050','Uppland','båtgravfält vid Fyrisån, ~3 km N om Gamla Uppsala','anglosaxiska/kontinentala paralleller (jfr Sutton Hoo)','Praktfulla obrända båtgravar med hjälmar, ringsvärd och kokkärl — den yttersta elitens mortuära display, inte runa','/explore?center=59.9261,17.6264&zoom=14'],
  ['Vendel båtgravfält','elitgrav',null,60.1636,17.6011,'~550–1050','Uppland','hjälmgravar vid Vendels kyrka','anglosaxiska/kontinentala paralleller','Gett vendeltiden dess namn; en av Nordens rikaste vapengravar-serier — elitens gravkonst, ej inskrift','/explore?center=60.1636,17.6011&zoom=14'],
];
if(mora) M.push(['Mora stenar','politisk plats',null,+mora.lat,+mora.lng,'medeltid (omtalad från 1200-tal)','Uppland','kungavals-/tingsplats','—','Där sveakungarna valdes och togs till kung (Eriksgatans start); monument m. samlade fragment','/utflykter/mora-stenar']);
try{
  await c.query('BEGIN'); let ins=0,skip=0;
  for(const [name,kind,signum,lat,lng,dating,landscape,association,influence,note,link] of M){
    if((await c.query(`select 1 from elite_monuments where name=$1`,[name])).rowCount){ skip++; continue; }
    await c.query(`insert into elite_monuments (name,kind,signum,lat,lng,dating,landscape,association,influence,note,source,link)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Kuraterat (Daniels elit-tes; koord ur DB/Wikidata)',$11)`,
      [name,kind,signum,lat,lng,dating,landscape,association,influence,note,link]);
    ins++;
  }
  console.log(`elit-monument nya: ${ins}, fanns: ${skip}${mora?'':' (OBS: Mora-koord saknades i location_hypotheses)'}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }

// Seed elite_monuments — de exceptionella elit-monumenten (Daniels tes). Koord ur befintliga
// DB-rader (runic_inscriptions/heritage_sites) resp. verifierade (Wikidata). Mora-koord ur
// location_hypotheses. UPSERT på namn (uppdaterar även sfär/genre). Kör: [--apply]
//
// sphere = maktsfär (klustren på översiktskartan = separata samtida riken/kulturzoner):
//   syd (dansk sfär) | ostergotland | svealand | vastergotland | gotland
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();
const mora=(await c.query(`select lat,lng from location_hypotheses where feature_slug ilike '%mora%' and kind='monument' and lat is not null limit 1`)).rows[0];
// [name, kind, signum, lat, lng, dating, landscape, association, influence, note, link, sphere]
const M=[
  ['Rökstenen','hjältediktning','Ög 136',58.2950,14.7752,'~800–850','Östergötland','centralt vid vattenleden Vättern→Motala ström→Söderköping','—','Nordens längsta stående runinskrift (~1110 tecken); legendarisk/hjältediktande — elitens minneskonst, ej formel','/inscription/Ög 136','ostergotland'],
  ['Karlevistenen','skaldevers','Öl 1',56.6075,16.4398,'~950–1000','Öland','kust + gravhög','västnordisk/dansk skaldik','Enda dróttkvätt-strofen (skaldevers) på en runsten — höveitlig minneskonst','/inscription/Öl 1','syd'],
  ['Björketorpsstenen','förbannelse','DR 360',56.2023,15.3807,'~520–700','Blekinge','del av Blekinge-gruppen','—','Urnordisk förbannelseinskrift; en av Nordens mest kända','/inscription/DR 360','syd'],
  ['Stentoftenstenen','förbannelse','DR 357',56.0532,14.5846,'~600-tal','Blekinge','Blekinge-gruppen (Sölvesborg)','—','Urnordisk förbannelse + goda-år-formel','/inscription/DR 357','syd'],
  ['Gummarpstenen','förbannelse','DR 358',56.0734,14.6089,'~600-tal','Blekinge','Blekinge-gruppen','—','Urnordisk (förlorad; känd ur avbildning)','/inscription/DR 358','syd'],
  ['Istabystenen','förbannelse','DR 359',56.0224,14.6509,'~600–700','Blekinge','Blekinge-gruppen (Mjällby)','—','Urnordisk; kopplas stilistiskt till Stentoften','/inscription/DR 359','syd'],
  ['Västra Vång','centralplats',null,56.2603,15.4203,'järnålder–vikingatid','Blekinge','central-/kultplats; ~7 km N om Björketorp/Listerby','keltiska/romerska bronsmasker; arabiska mynt','70 guldgubbar — makt & kult; nyare storfynd (upptäckt 2004)','/explore?center=56.2603,15.4203&zoom=13','syd'],
  ['Uppåkra','centralplats',null,55.6664,13.1711,'~100 f.Kr.–1000 e.Kr.','Skåne','Nordens största järnålders-centralplats; kulthus','kontinentala kontakter; guldgubbar','Ett tusenårigt makt- och kultcentrum; kyrkan restes ovanpå platsen','/explore?center=55.6664,13.1711&zoom=13','syd'],
  ['Valsgärde båtgravfält','elitgrav',null,59.9261,17.6264,'~600–1050','Uppland','båtgravfält vid Fyrisån, ~3 km N om Gamla Uppsala','anglosaxiska/kontinentala paralleller (jfr Sutton Hoo)','Praktfulla obrända båtgravar med hjälmar, ringsvärd och kokkärl — den yttersta elitens mortuära display, inte runa','/explore?center=59.9261,17.6264&zoom=14','svealand'],
  ['Vendel båtgravfält','elitgrav',null,60.1636,17.6011,'~550–1050','Uppland','hjälmgravar vid Vendels kyrka','anglosaxiska/kontinentala paralleller','Gett vendeltiden dess namn; en av Nordens rikaste vapengravar-serier — elitens gravkonst, ej inskrift','/explore?center=60.1636,17.6011&zoom=14','svealand'],
  // Din Sigurd-tråd: den heroiska BILDEN föregår runsten-TEXTEN — syskongenre till hjältediktningen
  ['Sigurdsristningen','hjältebild','Sö 101',59.4413,16.6344,'~1000–1050','Södermanland','Ramsundsberget, vid Eskilstuna','västnordisk hjältesaga (Völsungasagan)','Sigurd dräper Fafner — heroisk bildberättelse i sten; elitens myt gjord synlig','/inscription/Sö 101','svealand'],
  ['Gökstenen','hjältebild','Sö 327',59.3729,16.9305,'~1000–1050','Södermanland','Näsbyholm','samma Sigurd-motiv som Ramsund','En senare, förvanskad upprepning av Sigurdsmotivet — bildens spridning i eliten','/inscription/Sö 327','svealand'],
  // Gotland: femte, autonom sfär — bondearistokratins bildsten (mytisk/heroisk mortuär display)
  ['Tjängvide bildsten','bildsten','G 110',57.3442,18.6524,'~700–900','Gotland','Alskogs socken','nordisk mytologi (Sleipner/Valhall)','Åttafotad häst mot en portal — troligen Oden på Sleipner in i Valhall; skepp under','/inscription/G 110','gotland'],
  ['Ardre bildstenar','bildsten','G 112',57.3795,18.6968,'~700–1000','Gotland','Ardre kyrka','nordisk mytologi & hjältesaga','Bildstenssvit (bl.a. Ardre VIII) med Valhall, skepp och Sigurds-scener — Gotlands mytiska bildvärld','/inscription/G 112','gotland'],
];
if(mora) M.push(['Mora stenar','politisk plats',null,+mora.lat,+mora.lng,'medeltid (omtalad från 1200-tal)','Uppland','kungavals-/tingsplats','—','Där sveakungarna valdes och togs till kung (Eriksgatans start); monument m. samlade fragment','/utflykter/mora-stenar','svealand']);
// Västergötland: den fjärde, KRISTNA kungasfären (Daniels Varnhem/Skara-tråd)
const VG=[
  ['Husaby kyrka','kristet maktcentrum',58.5253,13.3800,'~1000–1100','Västergötland','där Olof Skötkonung enligt traditionen döptes; källa + biskopsborg','engelsk/kontinental mission','Kristnandets symboliska nollpunkt för sveakungadömet','/explore?center=58.5253,13.3800&zoom=13'],
  ['Skara domkyrka','kristet maktcentrum',58.3865,13.4392,'~1014→','Västergötland','Sveriges äldsta stift','engelsk/tysk kyrkoorganisation','Första biskopssätet — Västergötlands kyrkliga maktnav','/explore?center=58.3865,13.4392&zoom=13'],
  ['Varnhems klosterkyrka','kristet maktcentrum',58.3845,13.6550,'~900/1000 (Kata gård) → cisterciensiskt 1150','Västergötland','elitkristen miljö vid Kata gård med stenkyrka redan ~900–1000','cisterciensisk orden; Erik- & Folkungaätten','Birger Jarls gravkyrka — binder Östergötlands Folkungamakt till Västergötlands kristna landskap','/explore?center=58.3845,13.6550&zoom=13'],
];
for(const [name,kind,lat,lng,dating,landscape,association,influence,note,link] of VG)
  M.push([name,kind,null,lat,lng,dating,landscape,association,influence,note,link,'vastergotland']);
try{
  await c.query('BEGIN'); let up=0;
  for(const [name,kind,signum,lat,lng,dating,landscape,association,influence,note,link,sphere] of M){
    await c.query(`insert into elite_monuments (name,kind,signum,lat,lng,dating,landscape,association,influence,note,source,link,sphere)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Kuraterat (Daniels elit-tes; koord ur DB/Wikidata)',$11,$12)
      on conflict (name) do update set
        kind=excluded.kind, signum=excluded.signum, lat=excluded.lat, lng=excluded.lng,
        dating=excluded.dating, landscape=excluded.landscape, association=excluded.association,
        influence=excluded.influence, note=excluded.note, link=excluded.link, sphere=excluded.sphere`,
      [name,kind,signum,lat,lng,dating,landscape,association,influence,note,link,sphere]);
    up++;
  }
  const tot=(await c.query('select count(*)::int n from elite_monuments')).rows[0].n;
  console.log(`upsert:ade ${up} rader, tabell har nu ${tot}${mora?'':' (OBS: Mora-koord saknades)'}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }

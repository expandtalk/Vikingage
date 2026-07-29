// Dokumenterade avrättningshändelser → execution_events.
//  A) BISOS-listan 1866–1910 (public domain officiell statistik; via Wikipedia "Dödsstraff i Sverige").
//  B) Skånes avrättningsplatser: atomära FAKTA (person/datum/brott/metod/socken) i egna ord,
//     ur Lager 2006 via LUP-uppsats (Lunds universitet). Fakta fria; prosan aldrig kopierad.
// Koordinat = socken-/stadscentroid ur place_names (UNGEFÄRLIG, flaggad). Dedup: surname+år.
// Kör: node scripts/data/seed-execution-events-documented.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));

// A) BISOS 1866–1910. [person, år, datum|null, brott, metod, plats-namn, geocode-ort, landskap]
const HALS='halshuggning';
const BISOS=[
  ['Petter Hedin',1866,null,'mord',HALS,'Kallbäcken',null,null],
  ['Karl Otto Andersson',1872,null,'dråp på fängelsepersonal (livstidsfånge)',HALS,'Landskrona','Landskrona','Skåne'],
  ['Gustav Adolf Eriksson Hjert',1876,'1876-05-18','tredje resan stöld, rån och mord',HALS,'Lidamon avrättningsplats, Malmköping','Malmköping','Södermanland'],
  ['Konrad Petterson Lundqvist Tector',1876,'1876-05-18','tredje resan stöld, rån och mord',HALS,'Stenkumla backe, Gotland','Stenkumla','Gotland'],
  ['Anders Larsson',1879,null,'mord',HALS,'Västerås länsfängelse','Västerås','Västmanland'],
  ['Johan Erik Österman',1882,null,'mord',HALS,'Långholmens fängelse, Stockholm','Stockholm','Uppland'],
  ['Carl August Andersson',1882,null,'mord',HALS,'Långholmens fängelse, Stockholm','Stockholm','Uppland'],
  ['Nils Peter Hagström',1887,null,'rånmord',HALS,'Kristianstads länsfängelse','Kristianstad','Skåne'],
  ['Per Johan Pettersson (Alftamördaren)',1893,null,'mord',HALS,'Gävle fängelse','Gävle','Gästrikland'],
  ['Theodor Sallrot',1900,null,'rånmord',HALS,'Karlskrona länsfängelse','Karlskrona','Blekinge'],
  ['Lars Nilsson',1900,null,'rånmord',HALS,'Malmö länsfängelse','Malmö','Skåne'],
];
const BISOS_REF='BISOS B Rättsväsendet 1871 (officiell statistik, public domain); förteckning via Wikipedia "Dödsstraff i Sverige"';

// B) Skåne (Lager 2006 via LUP). [person, år, datum|null, brott, metod|null, socken, raa_nr|null]
const BR='halshuggning, kroppen bränd', HANGB='hängning, kroppen bränd';
const SKANE=[
  ['Hanna Persdotter',1808,null,'mord (på sina tio barn)',null,'Brösarp','Brösarp 62:1'],
  ['Staffan Nilsson',1798,'1798-07-11','mord på hustru',null,'Förslöv',null],
  ['Troed Olsson',1831,null,'barnamord',null,'Förslöv',null],
  ['Sven Månsson Rörström',1834,'1834-07-09','mordbrand',HALS,'Hörby','Hörby 73:1'],
  ['Bolla Håkansdotter',1811,'1811-04-19','barnamord',BR,'Stora Herrestad','Stora Herrestad 27:1'],
  ['Carl Reslow',1831,'1831-09-22','mord',null,'Östra Tommarp','Östra Tommarp 63:1'],
  ['Nils Olsson',1753,'1753-12-07','tidelag (med ett sto)',BR,'Skårby','Skårby 21:1'],
  ['Jöns Andersson och Kerstin Nilsdotter',1792,'1792-08-22','mord (på Kerstins man)',null,'Mörarp',null],
  ['Hans Nilsson',1756,'1756-07-13','tidelag',HANGB,'Oxie','Oxie 8:1'],
  ['Siewert Bengtsson',1776,'1776-03-31','tidelag',BR,'Hammarlöv',null],
  ['Nils Olsson Wangberg',1775,'1775-07-13','tidelag',null,'Dalby','Dalby 5:1'],
  ['Elias Regner',1716,'1716-07-21','dråp',HALS,'Annelöv','Annelöv 4:2'],
  ['Hanna Svensdotter',1853,'1853-12-21','mord (på svärson)',HALS,'Annelöv','Annelöv 4:2'],
  ['Anders Eskilsson',1831,null,'mord och rån',HALS,'Klippan','Klippan 94:1'],
  ['Anna Jacobsdotter',1795,'1795-08-21','barnamord',null,'Fjälkinge','Fjälkinge 22:1'],
  ['Pernilla Månsdotter',1769,'1769-06-21','barnamord',HALS,'Osby','Osby 436:1'],
  ['Jonas Magnus Jonasson Borg',1866,'1866-05-25','rånmord',HALS,'Osby','Osby 436:1'],
  ['Bengta Nilsdotter',1713,'1713-05-20','barnamord',HALS,'Broby',null],
  ['Kierstena Nilsdotter',1765,'1765-03-20','barnamord',HALS,'Broby',null],
  ['Nilla Andersdotter',1837,'1837-02-08','mord',HALS,'Broby',null],
  ['Göran Johnsson',1854,'1854-01-17','rånmord',HALS,'Broby',null],
];
const SKANE_REF='Lager 2006, "Skånes avrättningsplatser" (fakta via LUP-uppsats, Lunds universitet; RAÄ/FMIS)';

const surname=n=>n.replace(/\(.*?\)/g,'').trim().split(/\s+og\s+|\s+och\s+|\s+/).filter(Boolean).pop();

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
async function centroid(name){
  if(!name) return null;
  const r=await c.query(`select ST_Y(ST_Centroid(geom)) lat, ST_X(ST_Centroid(geom)) lng from place_names where name=$1 and ST_Y(ST_Centroid(geom)) between 55 and 69 and ST_X(ST_Centroid(geom)) between 10 and 24 limit 1`,[name]);
  return r.rows[0] ? [r.rows[0].lng, r.rows[0].lat] : null;
}
async function exists(person,year){
  const r=await c.query(`select 1 from execution_events where event_year=$1 and lower(executed_person) like $2 limit 1`,[year,'%'+surname(person).toLowerCase()+'%']);
  return r.rowCount>0;
}
try{
  await c.query('BEGIN'); let ins=0,skip=0,nocoord=0;
  // A
  for(const [person,year,date,crime,method,place,geoTown,landscape] of BISOS){
    if(await exists(person,year)){ skip++; continue; }
    const co=await centroid(geoTown); if(!co&&geoTown) nocoord++;
    const desc=`${person} avrättades ${date||year} (${place}), dömd för ${crime}. ${year>=1877?'Icke-offentlig avrättning inom fängelse.':year===1876?'En av de två sista offentliga avrättningarna i Sverige (18 maj 1876).':''} Källa: BISOS (officiell statistik, public domain).${co?' Koordinat: ortscentroid (ungefärlig).':''}`.replace(/\s+/g,' ').trim();
    await c.query(`insert into execution_events (executed_person,crime,method,event_date,event_year,place_name,landscape,lat,lng,description,source_ref,source_rights)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'PD')`,
      [person,crime,method,date,year,place,landscape,co?co[1]:null,co?co[0]:null,desc,BISOS_REF]);
    ins++;
  }
  // B
  for(const [person,year,date,crime,method,socken,raa] of SKANE){
    if(await exists(person,year)){ skip++; continue; }
    const co=await centroid(socken); if(!co) nocoord++;
    const desc=`${person} avrättades ${date||year} i ${socken} socken (Skåne)${method?' — '+method:''}, dömd för ${crime}.${raa?' RAÄ-nr '+raa+'.':''} Fakta ur Lager 2006 via LUP-uppsats.${co?' Koordinat: sockencentroid (ungefärlig).':''}`;
    await c.query(`insert into execution_events (executed_person,crime,method,event_date,event_year,place_name,parish,landscape,lat,lng,description,source_ref,source_rights)
      values ($1,$2,$3,$4,$5,$6,$7,'Skåne',$8,$9,$10,$11,'facts_only')`,
      [person,crime,method,date,year,raa?`${socken} (${raa})`:socken,socken,co?co[1]:null,co?co[0]:null,desc,SKANE_REF]);
    ins++;
  }
  console.log(`nya: ${ins}, dubblett (hoppade): ${skip}, utan koord: ${nocoord}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }

import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(s,p)=>(await c.query(s,p)).rows;
const SRC='Hanna Åkerström, "Läsordningen på Stentoftenstenen", Futhark: International Journal of Runic Studies 14–15 (2023–2024, publ. 2025)';
const ins=async(sig, part, tr, norm, transl, note, conf)=>{
  const r=(await q(`select id from runic_inscriptions where signum=$1 limit 1`,[sig]));
  if(!r.length){ console.log(`${sig}: hittades ej`); return; }
  const id=r[0].id;
  if((await q(`select 1 from interpretation_claim where inscription_id=$1 and scholar_name='Hanna Åkerström' and part_key=$2`,[id,part])).length){ console.log(`${sig}: finns redan`); return; }
  await q(`insert into interpretation_claim (inscription_id,part_key,reading_translit,normalization,translation,scholar_name,year,source,status,confidence,note)
    values ($1,$2,$3,$4,$5,'Hanna Åkerström',2024,$6,'omstridd',$7,$8)`,[id,part,tr,norm,transl,SRC,conf,note]);
  console.log(`${sig}: claim tillagd (${part}).`);
};
await ins('DR 357','läsordning (rad 3-2-1)',
  'haþuwolafz gaf j / niu hangistumz / niu habrumz',
  'Haþuwulfz gaf jār, nīu hangistumz, nīu habrumz.',
  'Haþuwulfz (Hådulv) gav ett gott år — nio hingstar (och) nio bockar.',
  'Åkerström föreslår läsordningen 3-2-1-4-5-6 i st.f. den vedertagna 1-2-3-4-5-6. Argument: (1) visuell komposition — lässtart i mittraden (rad 3), längst av de tre vertikala raderna; rad 3–6 inleds av h-runa och resarens/centralpersonens namn Haþuwulfz hamnar i inskriftens mitt, intill det andra namnet Hariwulfz. (2) syntaktiskt — 3-2-1 ger normal SVO-ordföljd i st.f. den ovanliga OSVO som 1-2-3 kräver, vilket stämmer bättre med det urnordiska materialet (jfr Antonsen 1975, Braunmüller 1982/2002, Eythórsson 2001/2012) och undviker en nödlösning med ellips. KÄLLKRITIK: ett tolkningsförslag, ej konsensus; radordningstypen är den minst frekventa i det tidigvikingatida materialet, och de närmaste parallellerna (DR 209 Glavendrup, DR 230 Tryggevælde) är ett par århundraden yngre. Förbannelseformeln (rad 5–6) jämförs med DR 360 Björketorp.',
  0.55);
await ins('DR 359','läsordning (A2-A1-B)',
  'haþuwulafz haeruwulafiz / afatz hariwulafa / warait runaz þaiaz',
  'Haþuwulfz Heruwulfiz, aftr Hariwulfa, wrait rūnaz þaiaz.',
  'Haþuwulfz (Hådulv), Hjørulvs ättling, skrev dessa runor efter Hariwulfz (Hærulv).',
  'Läsordningen på Istaby (DR 359) är tvetydig. Åkerström finner, i linje med Salberger (1960), att den visuellt mest sannolika ordningen är A2-A1-B, vilket ger en SOVO-ordföljd — alltså INGEN säker parallell till den OSVO-ordföljd som antagits för Stentoftens första sats. (En alternativ ordning A2-B-A1 skulle ge SVO; föreslagen av Lindquist 1940.) En relativt säker SOVO-parallell finns däremot på Tunestenen (N KJ72). Detta stärker indirekt Stentoften-argumentet: OSVO saknar tydlig samtida parallell. KÄLLKRITIK: tolkningsförslag; radupplägget visuellt svårtolkat. Foton: Erik Moltke, Nationalmuseet (CC BY-SA).',
  0.5);
console.log('\nDR 357 claims:', (await q(`select count(*) n from interpretation_claim ic join runic_inscriptions ri on ri.id=ic.inscription_id where ri.signum in ('DR 357','DR 359') and ic.scholar_name='Hanna Åkerström'`))[0].n);
await c.end();

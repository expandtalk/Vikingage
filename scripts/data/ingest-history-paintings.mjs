// Historiemålningar (PD, 1800-tal) → public.history_paintings, knutna till kungar/händelser.
// KURERAD: metadata (personer/händelse/söktermer/varningstext) sätts här; scriptet hämtar bild-URL (P18)
// + licens från Commons imageinfo och skriver bara om licensen är fri (PD-Art). HOTLÄNK, aldrig rehost.
// Användning:  node scripts/data/ingest-history-paintings.mjs [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';
const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const APPLY = process.argv.includes('--apply');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8').split(/\r?\n/)
  .filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
async function getJSON(u){for(let a=0;a<4;a++){try{const r=await fetch(u,{headers:{'User-Agent':UA,Accept:'application/json'}});if(r.status===200)return r.json();if(r.status>=429){await sleep(1200*(a+1));continue;}return null;}catch{await sleep(700);}}return null;}
const stripHtml = s => (s||'').replace(/<[^>]*>/g,' ').replace(/&[a-z]+;/gi,' ').replace(/\s+/g,' ').trim();

const BASE = '1800-talets historiemåleri — konstnärlig tolkning, inte en historisk källa. Ofta romantiserad; dräkt, miljö och detaljer kan vara anakronistiska.';
const CED = 'Gustaf Cederström', HELL = 'Carl Gustaf Hellqvist';
const P = [
  { qid:'Q10543734', title:'Karl XII:s likfärd', artist:CED, death:1933, year:1884, event:'Karl XII:s likfärd 1718 (efter Fredriksten)', persons:['Karl XII'], match:['Karl XII','karolinska','stora nordiska kriget','Fredriksten','likfärd'], extra:' Karl XII har framställts som nationell hjältegestalt och motivet har använts i nationalistisk retorik — framställningen är idealiserande.' },
  { qid:'Q10665067', title:'Segern vid Narva', artist:CED, death:1933, year:1905, event:'Slaget vid Narva 1700', persons:['Karl XII'], match:['Karl XII','Narva','stora nordiska kriget','slaget vid Narva'], extra:'' },
  { qid:'Q71388876', title:'Karl XII och Ivan Mazepa efter förlusten vid Poltava', artist:CED, death:1933, year:1880, event:'Slaget vid Poltava 1709', persons:['Karl XII','Ivan Mazepa'], match:['Karl XII','Poltava','Mazepa','stora nordiska kriget'], extra:'' },
  { qid:'Q71542317', title:'Magnus Stenbock vid Helsingborg', artist:CED, death:1933, year:1923, event:'Slaget vid Helsingborg 1710', persons:['Magnus Stenbock'], match:['Magnus Stenbock','Helsingborg','stora nordiska kriget'], extra:'' },
  { qid:'Q18599926', title:'Ansgar förkunnar kristendomen', artist:CED, death:1933, year:1889, event:'Kristnandet av Norden (800-tal)', persons:['Ansgar'], match:['Ansgar','kristnande','mission','Birka'], extra:' Romantiserad missionsscen; Ansgars framträdande saknar samtida bildkälla.' },
  { qid:'Q10678269', title:'Sten Sture d.y:s död på Mälarens is', artist:HELL, death:1890, year:1880, event:'Sten Sture d.y. dödligt sårad 1520', persons:['Sten Sture den yngre'], match:['Sten Sture','Sten Sture den yngre','1520','Bogesund'], extra:'' },
  { qid:'Q3425758', title:'Valdemar Atterdag brandskattar Visby', artist:HELL, death:1890, year:1882, event:'Valdemar Atterdags brandskattning av Visby 1361', persons:['Valdemar Atterdag'], match:['Valdemar Atterdag','Visby','Gotland','1361','brandskattning'], extra:' Dramatiserad; brandskattningen 1361 är belagd men scenen (bl.a. den uppradade skatten) är en romantisk 1880-talstolkning.' },
  { qid:'Q5407257', title:'Gustaf II Adolfs lik inskeppas i Wolgasts hamn 1633', artist:HELL, death:1890, year:1885, event:'Efter slaget vid Lützen 1632', persons:['Gustav II Adolf'], match:['Gustav II Adolf','Gustaf II Adolf','Lützen','trettioåriga kriget','Wolgast'], extra:'' },
  { qid:'Q43248785', title:'Gustaf Vasa anklagar Peder Sunnanväder och Mäster Knut', artist:HELL, death:1890, year:1876, event:'Gustav Vasas uppgörelse med Peder Sunnanväder (1520-tal)', persons:['Gustav Vasa','Peder Sunnanväder'], match:['Gustav Vasa','Gustaf Vasa','Peder Sunnanväder'], extra:'' },
  { qid:'Q18573423', title:'Religionssamtal mellan Olaus Petri och Peder Galle', artist:HELL, death:1890, year:1883, event:'Reformationen i Sverige (1520-tal)', persons:['Olaus Petri','Peder Galle'], match:['Olaus Petri','reformationen','Peder Galle','Gustav Vasa'], extra:'' },
];

// Wikidata P18 → filnamn; Commons imageinfo → url + licens.
async function p18(qid){const d=await getJSON(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${qid}&props=claims`);return d?.entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value||null;}
async function info(file){const t='File:'+file;const u=`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=${encodeURIComponent('url|extmetadata')}&iiextmetadatafilter=${encodeURIComponent('LicenseShortName|LicenseUrl|Artist')}&titles=${encodeURIComponent(t)}`;const d=await getJSON(u);const pages=d?.query?.pages||{};const k=Object.keys(pages)[0];return pages[k]?.imageinfo?.[0]||null;}
function lic(ext){const url=ext?.LicenseUrl?.value||'';const blob=[(ext?.LicenseShortName?.value||''),url].join(' ').toLowerCase();if(/nc|nd|noncommercial|no-?deriv/.test(blob))return null;if(/public domain|publicdomain|(^|[^a-z])pd([^a-z]|$)|pd-art|cc0/.test(blob))return{code:'PD',url:url||'https://creativecommons.org/publicdomain/mark/1.0/'};if(/by-sa/.test(blob))return{code:'CC-BY-SA',url};if(/cc-?by|licenses\/by/.test(blob))return{code:'CC-BY',url};return null;}

async function main(){
  const rows=[];
  for(const p of P){
    const file=await p18(p.qid);
    if(!file){console.log(`  ${p.qid} ${p.title} — ingen P18-bild`);continue;}
    const ii=await info(file);
    if(!ii||!ii.url){console.log(`  ${p.qid} ${p.title} — ingen imageinfo`);continue;}
    const L=lic(ii.extmetadata||{});
    if(!L){console.log(`  ${p.qid} ${p.title} — EJ fri licens (${ii.extmetadata?.LicenseShortName?.value||'?'}) → hoppar`);continue;}
    rows.push({...p, image_url:String(ii.url).split('?')[0], descr_url:String(ii.descriptionurl||ii.url).split('?')[0],
      license_code:L.code, license_url:L.url, caveat:BASE+p.extra });
    console.log(`  [${L.code}] ${p.title} (${p.artist} ${p.year}) → ${p.event}`);
    await sleep(150);
  }
  console.log(`\n=== ${rows.length} målningar ===`);
  if(!APPLY){console.log('DRY-RUN — kör med --apply.');return;}
  const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
  await c.connect();
  let ins=0;
  try{for(const r of rows){const res=await c.query(
    `INSERT INTO public.history_paintings (wikidata_id,title,artist,artist_death_year,year,image_url,descr_url,license_code,license_url,depicts_persons,depicts_event,match_terms,caveat,source_institution)
     SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'Wikimedia Commons'
     WHERE NOT EXISTS (SELECT 1 FROM public.history_paintings WHERE image_url=$6)`,
    [r.qid,r.title,r.artist,r.death,r.year,r.image_url,r.descr_url,r.license_code,r.license_url,r.persons,r.event,r.match,r.caveat]);ins+=res.rowCount;}
  }finally{await c.end();}
  console.log(`✅ APPLY: ${ins} insatta.`);
}
main().catch(e=>{console.error(e);process.exit(1);});

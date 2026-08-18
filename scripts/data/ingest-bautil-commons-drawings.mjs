// Ingest av historiska runstensavbildningar ur Wikimedia Commons Category:Bautil (Göransson 1750,
// efter fältteckningar av Peringskiöld/Hadorph m.fl.). Verkliga PD/CC0-URL:er ur Commons-API:t
// (ingen gissning). Matchas mot runic_inscriptions på signum ur filnamnet ("Bautil N - <signum>").
// Dedup: hoppa om inskriften redan har en Bautil-avbildning. media_type='teckning' → surfar i
// bildarkivets facett "Historiska avbildningar". DRY som standard; --apply för att skriva.
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const UA={'User-Agent':'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)'};

// 1) hämta ALLA filer i Category:Bautil (paginerat)
let files=[], cont=undefined;
do {
  const u=new URL('https://commons.wikimedia.org/w/api.php');
  u.search=new URLSearchParams({action:'query',format:'json',generator:'categorymembers',gcmtitle:'Category:Bautil',gcmlimit:'500',gcmtype:'file',prop:'imageinfo',iiprop:'url|extmetadata',iiextmetadatafilter:'LicenseShortName|Artist',...(cont?{gcmcontinue:cont}:{})}).toString();
  const j=await (await fetch(u,{headers:UA})).json();
  for(const p of Object.values(j?.query?.pages||{})){const ii=p.imageinfo?.[0]; if(ii?.url) files.push({title:p.title, url:ii.url.split('?')[0], lic:ii.extmetadata?.LicenseShortName?.value||null});}
  cont=j?.continue?.gcmcontinue;
} while(cont);

// 2) parsa signum ur filnamn
const re=/-\s*((?:U|Sö|So|Sm|Ög|Og|Öl|Ol|Vg|Vs|Nä|Na|Gs|Hs|Hä|Ha|Jä|J|M|Br|Bo|Da|Dr|DR|G|N|Vr)\s?\d+[A-Za-z]?)/;
const parsed=files.map(f=>{const m=f.title.replace(/\.(png|jpg|jpeg|gif|tif|tiff)$/i,'').match(re); return {...f, signum: m? m[1].replace(/\s+/,' ').replace(/^So /,'Sö ').replace(/^Og /,'Ög ').replace(/^Ol /,'Öl ').trim(): null};}).filter(f=>f.signum && (/^(PD|Public|CC0|CC BY-SA)/i.test(f.lic||'')));
console.log(`Commons Category:Bautil: ${files.length} filer, ${parsed.length} med signum + PD/CC0-licens`);

// 3) matcha mot DB + dedup
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:120000});
await c.connect();
let matched=0, dup=0, nomatch=0, ins=0; const toInsert=[];
for(const f of parsed){
  const r=(await c.query(`select id, signum from runic_inscriptions where upper(replace(signum,' ',''))=upper(replace($1,' ','')) limit 1`,[f.signum])).rows[0];
  if(!r){nomatch++; continue;}
  matched++;
  const ex=(await c.query(`select 1 from inscription_media where inscription_id=$1 and (source_institution ilike '%Bautil%' or media_url=$2) limit 1`,[r.id, f.url])).rows[0];
  if(ex){dup++; continue;}
  const lic = /cc0/i.test(f.lic)?'CC0':'PD';
  toInsert.push({inscription_id:r.id, signum:r.signum, media_url:f.url, lic, title:f.title});
}
console.log(`Matchade inskrifter: ${matched} | redan Bautil-bild (dedup): ${dup} | ingen DB-match: ${nomatch} | NYA att lägga in: ${toInsert.length}`);
console.log('Exempel (max 12):'); toInsert.slice(0,12).forEach(t=>console.log(`  ${t.signum}  [${t.lic}]  ${t.title}`));
const noMatchSample=parsed.filter(f=>!parsed.find(x=>x===f)?false:false);

if(APPLY && toInsert.length){
  for(const t of toInsert){
    await c.query(`insert into inscription_media (inscription_id, media_url, media_type, description, motive, photographer, source_institution, license_code, copyright_info)
      values ($1,$2,'teckning',$3,$4,$5,$6,$7,$8)`,
      [t.inscription_id, t.media_url, `Historisk avbildning ur Bautil (1750). ${t.signum}.`, `Runsten ${t.signum} — historisk avbildning`, 'Bautil (Johan Göransson 1750), efter fältteckningar av Peringskiöld/Hadorph m.fl.', 'Wikimedia Commons (Bautil 1750)', t.lic, t.lic==='CC0'?'https://creativecommons.org/publicdomain/zero/1.0/':'https://creativecommons.org/publicdomain/mark/1.0/']);
    ins++;
  }
  console.log(`\nAPPLAT: ${ins} nya teckningar inlagda.`);
} else {
  console.log(`\nDRY RUN — kör med --apply för att skriva ${toInsert.length} rader.`);
}
await c.end();

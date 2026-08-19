// Hero-porträtt (person-domän): för personer med image_commons_file (Wikidata P18) hämtas Commons-
// licens via imageinfo-API:t (50 titlar/anrop). Sätter image_url (400px-thumb) + image_license + credit
// ENDAST för PD/CC/CC0 — skyddade porträtt lagras aldrig. Idempotent (kör igen efter ny ingest).
// Kör: node scripts/data/ingest-person-portraits.mjs
import fs from 'fs'; import pg from 'pg';
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const stripHtml=s=>String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
// PD/CC-accept: machine-koden License (pd/cc0/cc-by...) — nekar fair use/okänt/non-free.
const okLicense=code=>{const l=(code||'').toLowerCase();return l==='pd'||l==='cc0'||l.startsWith('cc-by')||l.startsWith('cc by')||l.includes('public domain');};

// Bara personer med filnamn men utan satt (godkänd) image_url.
const rows=(await c.query(`select id, image_commons_file from persons where image_commons_file is not null and image_url is null`)).rows;
console.log('porträtt att licenskolla:',rows.length);
let ok=0, skip=0;
for(let i=0;i<rows.length;i+=50){
  const batch=rows.slice(i,i+50);
  const titles=batch.map(r=>'File:'+r.image_commons_file).join('|');
  const url='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=400&titles='+encodeURIComponent(titles);
  let j;
  try{ const r=await fetch(url,{headers:{'User-Agent':'VikingAge-research/1.0 (daniel@expandtalk.se)'}}); if(r.status!==200){console.log('  HTTP',r.status,'– vänta');await sleep(5000);i-=50;continue;} j=await r.json(); }
  catch(e){ console.log('  fetch-fel, retry:',e.message); await sleep(5000); i-=50; continue; }
  const pages=j?.query?.pages||{};
  // mappa tillbaka via normaliserad titel → filnamn
  const byFile={};
  for(const p of Object.values(pages)){ const ii=p.imageinfo?.[0]; if(!ii)continue; const em=ii.extmetadata||{};
    const file=(p.title||'').replace(/^File:/,'');
    byFile[file]={thumb:ii.thumburl||ii.url, licenseCode:em.License?.value, licenseName:em.LicenseShortName?.value, artist:stripHtml(em.Artist?.value)};
  }
  for(const r of batch){
    const info=byFile[r.image_commons_file] || byFile[r.image_commons_file.replace(/ /g,'_')] || byFile[r.image_commons_file.replace(/_/g,' ')];
    if(info && okLicense(info.licenseCode)){
      await c.query(`update persons set image_url=$2, image_license=$3, image_credit=$4, updated_at=now() where id=$1`,
        [r.id, info.thumb, info.licenseName||info.licenseCode, info.artist||null]);
      ok++;
    } else skip++;
  }
  process.stdout.write(`\r  ${Math.min(i+50,rows.length)}/${rows.length} — ok ${ok}, skippade ${skip}`);
  await sleep(400);
}
console.log(`\nKlart: ${ok} PD/CC-porträtt satta, ${skip} skippade (skyddade/okänd licens).`);
await c.end();

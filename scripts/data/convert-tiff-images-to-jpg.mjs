import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(s,p)=>(await c.query(s,p)).rows;
// Wikimedia Commons TIFF → renderbar JPG-thumbnail (iiurlwidth). Icke-Commons flaggas.
async function commonsThumb(url, width=1280){
  if(!/upload\.wikimedia\.org/.test(url)) return null;
  const file=decodeURIComponent(url.split('/').pop());
  const api=`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent('File:'+file)}&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json&origin=*`;
  const j=await (await fetch(api,{headers:{'User-Agent':'vikingage.se (daniel.larsson@expandtalk.se)'}})).json();
  let t=Object.values(j.query?.pages||{})[0]?.imageinfo?.[0]?.thumburl;
  return t? t.split('?')[0] : null;
}
const jobs=[
  {t:'inscription_media', col:'media_url', thumbCol:'thumb_url'},
  {t:'ecclesiastical_sites', col:'image_url', thumbCol:null},
];
for(const j of jobs){
  const rows=(await q(`select id, "${j.col}" u from "${j.t}" where "${j.col}" ilike '%.tif' or "${j.col}" ilike '%.tiff'`));
  console.log(`\n${j.t}.${j.col}: ${rows.length} TIFF`);
  for(const r of rows){
    try{
      const full=await commonsThumb(r.u,1280);
      if(!full){ console.log(`  ⚠ icke-Commons (manuell): ${r.u.slice(0,70)}`); continue; }
      const thumb=await commonsThumb(r.u,400);
      if(j.thumbCol) await q(`update "${j.t}" set "${j.col}"=$1, "${j.thumbCol}"=$2 where id=$3`,[full, thumb||full, r.id]);
      else await q(`update "${j.t}" set "${j.col}"=$1 where id=$2`,[full, r.id]);
      console.log(`  ✅ ${full.split('/').pop().slice(0,50)}`);
      await new Promise(x=>setTimeout(x,1200));
    }catch(e){ console.log(`  ✖ ${e.message.slice(0,50)}`); }
  }
}
console.log('\nkvar .tif (media_url/image_url):',
  (await q(`select (select count(*) from inscription_media where media_url ilike '%.tif')+(select count(*) from ecclesiastical_sites where image_url ilike '%.tif') n`))[0].n);
await c.end();

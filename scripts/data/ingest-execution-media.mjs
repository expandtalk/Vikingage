// Bilder till avrättnings-domänen ur K-samsök. Rena begrepp (INTE "galge" = klädhängar-brus).
// Bara type=Photo med fri licens (cc0/pdmark/by/by-sa) + relevansfilter (begreppet i tag/label).
// Dedup source_uri. Kör: node scripts/data/ingest-execution-media.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const dec=s=>(s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
const TERMS=['avrättningsplats','avrättning','galgplats','galgbacke','bödel','stegling','halshuggning'];
const REL=/avrätt|galg|bödel|böl|stegl|halshugg|schavott|spöstraff|bila/i;   // relevans
// Uteslut motiv utanför Norden (Daniel 2026-07-30): behåll bara nordiska platser/motiv.
const FOREIGN=/belgien|breendonk|persien|persisk|iran|kazeroun|fransk|frankrike|tyskland|tysk uniform|kina|kinesisk|amerika|\bUSA\b|afrika|italien|spanien|ryssland|rysk|polen|england|engelsk|osmansk|turkiet|japan/i;
const PER_TERM=60;
// tillåtna licenser → kortform
function lic(url){ const u=(url||'').toLowerCase();
  if(u.includes('cc0')) return 'cc0';
  if(u.includes('pdmark')||u.includes('mark/1.0')||u.includes('publicdomain')) return 'pdmark';
  if(u.includes('by-sa')) return 'by-sa';
  if(u.includes('by-nc')||u.includes('by-nd')) return null;      // uteslut icke-kommersiell/no-deriv
  if(/#by\b|licenses\/by\//.test(u)) return 'by';
  return null;
}
async function ks(q,start){
  const url=`https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${PER_TERM}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent(q)}`;
  for(let a=0;a<4;a++){ try{ const r=await fetch(url,{headers:{'User-Agent':UA}}); if(r.status===200) return await r.text(); await sleep(1200*(a+1)); }catch{ await sleep(1000*(a+1)); } }
  return '';
}
const found=new Map();
for(const term of TERMS){
  const xml=await ks(`text="${term}" AND thumbnailExists=j`,1);
  const recs=xml.split('<pres:item ').slice(1).map(s=>s.split('</pres:item>')[0]);
  for(const r of recs){
    if(!/<pres:type>Photo</.test(r)) continue;                    // bara foton
    const uri=(r.match(/<pres:entityUri>([^<]+)/)||[])[1]; if(!uri) continue;
    const label=dec((r.match(/<pres:itemLabel>([^<]+)/)||[])[1]);
    const tags=(r.match(/<pres:tag>([^<]+)/g)||[]).join(' ');
    if(!REL.test(label+' '+tags)) continue;                       // relevansfilter
    if(FOREIGN.test(label+' '+tags)) continue;                     // uteslut icke-nordiska motiv
    const licUrl=(r.match(/<pres:mediaLicense>([^<]+)/)||[])[1]||(r.match(/<pres:mediaLicenseUrl>([^<]+)/)||[])[1];
    const L=lic(licUrl); if(!L) continue;                         // bara fria licenser
    const thumb=(r.match(/<pres:src type="thumbnail">([^<]+)/)||[])[1];
    const low=(r.match(/<pres:src type="lowres">([^<]+)/)||[])[1]||thumb;
    const high=(r.match(/<pres:src type="highres">([^<]+)/)||[])[1]||low;
    if(!thumb) continue;
    const org=dec((r.match(/<pres:organization>([^<]+)/)||[])[1]);
    const place=dec((r.match(/<pres:placeLabel>([^<]+)/)||[])[1]);
    const short=uri.replace(/^https?:\/\//,'');
    if(!found.has(short)) found.set(short,{title:label,term,thumb,low,high,L,licUrl,org,place});
  }
  console.log(`  ${term}: ${recs.length} poster → ackumulerat användbara ${found.size}`);
  await sleep(400);
}
console.log(`\nAnvändbara fria foton (unika): ${found.size}`);
const byLic={}; for(const m of found.values()) byLic[m.L]=(byLic[m.L]||0)+1;
console.log('per licens:', Object.entries(byLic).map(([k,v])=>`${k}=${v}`).join(' · '));

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
try{
  await c.query('BEGIN'); let ins=0;
  for(const [short,m] of found){
    const res=await c.query(`insert into execution_media (title,term,thumb_url,image_url,highres_url,license,license_url,attribution,place_label,source_uri)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict (source_uri) do nothing`,
      [m.title,m.term,m.thumb,m.low,m.high,m.L,m.licUrl,m.org,m.place||null,short]);
    ins+=res.rowCount;
  }
  console.log(`nya: ${ins}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }

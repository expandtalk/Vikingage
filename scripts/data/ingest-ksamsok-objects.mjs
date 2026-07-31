// K-samsök-hämtare för museiobjekt per landskap/museum → museum_objects. Attribuerar varje
// objekt till rätt museum via URI-provider-prefixet (shm=Historiska, ka=Kalmar läns museum,
// gm=Gotlands Museum …) med find-or-create. K-samsök bär EJ osteologisk determination (den
// finns bara i SHM:s SIS-export) — här får vi objekt + fyndplats + bild + taggar.
// Kör: node scripts/data/ingest-ksamsok-objects.mjs '<CQL-query>' [--apply] [--max=15]
//   ex: '...' = "serviceOrganization=SHM AND provinceName=Gotland AND itemType=Föremål"
import pg from 'pg'; import { readFileSync } from 'node:fs';
const argv=process.argv.slice(2);
const QUERY=argv.find(a=>!a.startsWith('--'));
const APPLY=argv.includes('--apply');
const MAXP=Number((argv.find(a=>a.startsWith('--max='))||'').split('=')[1])||15;
const LAND=(argv.find(a=>a.startsWith('--landscape='))||'').split('=')[1]||null;  // stämpla landskap (frågan är scopad)
if(!QUERY){ console.error('Ange CQL-query, t.ex. "serviceOrganization=SHM AND provinceName=Gotland AND itemType=Föremål"'); process.exit(1); }
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// Provider-prefix (URI) → museum-namn (för attribution + find-or-create).
const PREFIX_MUSEUM={ shm:'Historiska museet', ka:'Kalmar läns museum', gm:'Gotlands Museum',
  klm:'Kalmar läns museum', smtm:'Statens maritima och transporthistoriska museer', nomu:'Nordiska museet' };
const m1=(s,re)=>{const m=re.exec(s);return m?m[1].trim():'';};

async function ksam(start){ const url=`https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=100&startRecord=${start}&recordSchema=presentation&query=`+encodeURIComponent(QUERY);
  for(let a=0;a<4;a++){ try{ const r=await fetch(url,{headers:{'User-Agent':UA}}); if(r.status===200) return await r.text(); await sleep(1500*(a+1)); }catch{ await sleep(1200*(a+1)); } } return ''; }

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const musCache={};
async function museumFor(prefix){ if(musCache[prefix]!==undefined) return musCache[prefix];
  const name=PREFIX_MUSEUM[prefix]||prefix;
  let hit=(await c.query("SELECT id FROM museums WHERE name ILIKE '%'||$1||'%' OR $1 ILIKE '%'||name||'%' ORDER BY length(name) LIMIT 1",[name])).rows[0];
  if(!hit && APPLY) hit=(await c.query("INSERT INTO museums (name,museum_type,source,verified) VALUES ($1,'övrigt','K-samsök',false) RETURNING id",[name])).rows[0];
  return musCache[prefix]=hit?hit.id:null; }

function parseItem(it){
  const uri=m1(it,/<pres:entityUri>([^<]*)</); if(!uri) return null;
  const prefix=(uri.match(/kulturarvsdata\.se\/([a-z0-9_]+)\//)||[])[1]; if(!prefix) return null;
  const id=m1(it,/<pres:id>([^<]*)</)||uri.split('/').pop();
  const name=m1(it,/<pres:itemLabel[^>]*>([^<]*)</).replace(/,\s*$/,'')||m1(it,/<pres:type>([^<]*)</);
  const type=m1(it,/<pres:type>([^<]*)</);
  const place=m1(it,/<pres:placeLabel[^>]*>([^<]*)</);
  const p=place.split(',').map(x=>x.trim());  // Sverige, <län>, <region/kommun>, <landskap>, <socken>, <plats>
  const image=m1(it,/<pres:image[^>]*>([^<]*)</)||m1(it,/<pres:thumbnail[^>]*>([^<]*)</);
  const cm=it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</);
  const tags=[...it.matchAll(/<pres:tag[^>]*>([^<]*)</g)].map(x=>x[1]).slice(0,25);
  return { prefix, id, name, type, landskap:p[3]||null, socken:p[4]||null, plats:p[5]||null,
    lng:cm?parseFloat(cm[1]):null, lat:cm?parseFloat(cm[2]):null, image:image||null, uri, tags };
}

try {
  let seen=0, ins=0; const byMus={};
  for(let page=0; page<MAXP; page++){
    const xml=await ksam(page*100+1);
    const total=(xml.match(/<totalHits>(\d+)/)||[])[1];
    const items=xml.split('<pres:item ').slice(1);
    if(page===0) console.log(`totalHits=${total} (hämtar upp till ${MAXP*100})`);
    if(!items.length) break;
    for(const it of items){ const r=parseItem(it); if(!r) continue; seen++;
      const museum_id=await museumFor(r.prefix); byMus[PREFIX_MUSEUM[r.prefix]||r.prefix]=(byMus[PREFIX_MUSEUM[r.prefix]||r.prefix]||0)+1;
      if(APPLY && museum_id){
        const res=await c.query(
          `INSERT INTO museum_objects (museum_id,object_no,name,category,description,find_landscape,find_socken,find_place,lat,lng,image_url,source_url,source,attribution)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'K-samsök (SOCH)','CC BY · via K-samsök')
           ON CONFLICT (museum_id,object_no) DO NOTHING`,
          [museum_id, r.id, r.name||null, r.type||null, r.tags.length?r.tags.join(', '):null, r.landskap||LAND, r.socken, r.plats, r.lat, r.lng, r.image, r.uri]);
        ins+=res.rowCount;
      }
    }
    if(items.length<100) break;
    await sleep(700);
  }
  console.log('per museum:', byMus);
  console.log(APPLY?`\n✅ ${ins} objekt insatta (attribuerade via prefix).`:`\nDRY-RUN: ${seen} objekt setts. Kör --apply.`);
} finally { await c.end(); }

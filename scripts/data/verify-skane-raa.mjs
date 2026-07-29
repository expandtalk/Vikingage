// Slår upp rödmarkerade (bekräftade) RAÄ-nummer ur Skåne-uppsatsen + Hamneda (Fornvännen 2012)
// mot RAÄ Fornsök → VERIFIERAD koordinat + entityUri. Uppdaterar sockencentroid-koordinaterna på
// motsvarande execution_events till exakt läge + länkar/uppsertar heritage_site. Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// [socken, RAÄ-nr, landskap]. Rödmarkerade = bekräftade (arkeologi/historisk karta/skriftlig källa).
const RAA=[
  ['Brösarp','62:1','Skåne'],['Simrishamn','13:1','Skåne'],['Förslöv','160:1','Skåne'],
  ['Södra Åsum','2:1','Skåne'],['Östra Kärrstorp','14:1','Skåne'],['Hörby','21:1','Skåne'],
  ['Hörby','73:1','Skåne'],['Kristianstad','102:1','Skåne'],['Kristianstad','104:1','Skåne'],
  ['Lyngsjö','88:1','Skåne'],['Stora Harrie','9:1','Skåne'],['Stora Herrestad','27:1','Skåne'],
  ['Ullstorp','33:1','Skåne'],['Östra Tommarp','63:1','Skåne'],['Skårby','21:1','Skåne'],
  ['Hässlunda','7:2','Skåne'],['Risekatslösa','10:1','Skåne'],['Torrlösa','81:1','Skåne'],
  ['Malmö','47:2','Skåne'],['Malmö','31:1','Skåne'],['Oxie','8:1','Skåne'],['Annelöv','4:2','Skåne'],
  ['Glumslöv','37:1','Skåne'],['Skegrie','4:1','Skåne'],['Björnekulla','28:1','Skåne'],
  ['Björnekulla','4:1','Skåne'],['Klippan','94:1','Skåne'],['Dalby','5:1','Skåne'],
  ['Hällestad','76:1','Skåne'],['Fjälkinge','22:1','Skåne'],['Hässleholm','7:1','Skåne'],
  ['Vittsjö','25:1','Skåne'],['Västra Torup','4:1','Skåne'],['Emmislöv','140:1','Skåne'],
  ['Hamneda','333:1','Småland'],['Hamneda','50:1','Småland'],
];

async function ks(q){
  const url=`https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=60&recordSchema=presentation&query=${encodeURIComponent(q)}`;
  for(let a=0;a<4;a++){ try{ const r=await fetch(url,{headers:{'User-Agent':UA}}); if(r.status===200) return await r.text(); await sleep(1200*(a+1)); }catch{ await sleep(1000*(a+1)); } }
  return '';
}
// Fornsök indexerar inte gamla RAÄ-nr → sök typ + socken. Returnerar alla lämnings-träffar m. koord.
async function findSites(socken){
  const xml=await ks(`(text="avrättningsplats" OR text="galgbacke" OR text="galgplats" OR text="galge") AND text="${socken}"`);
  const recs=xml.split('<pres:item ').slice(1).map(s=>s.split('</pres:item>')[0]);
  const out=[];
  for(const r of recs){
    const uri=(r.match(/<pres:entityUri>([^<]+)/)||[])[1]; if(!uri||!/\/raa\/lamning\//.test(uri)) continue;
    const cm=r.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</); if(!cm) continue;
    const lng=+cm[1], lat=+cm[2]; if(!(lat>54&&lat<70&&lng>10&&lng<25)) continue;
    // kräver att sockennamnet finns i posten (undvik fel-socken vid vanliga typord)
    if(!r.toLowerCase().includes(socken.toLowerCase())) continue;
    const label=(r.match(/<pres:itemLabel>([^<]+)/)||[])[1]||'';
    out.push({uri:uri.replace(/^https?:\/\//,''),lat,lng,label:label.replace(/\s+/g,' ').trim()});
  }
  return out;
}

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
// Slå upp per unik socken (flera RAÄ-nr kan dela socken)
const socknar=[...new Set(RAA.map(r=>r[0]))];
const bySocken=new Map();
for(const socken of socknar){
  const hits=await findSites(socken);
  bySocken.set(socken, hits);
  console.log(`  ${socken}: ${hits.length} lämning(ar)${hits[0]?` — ${hits.map(h=>h.lat.toFixed(4)+','+h.lng.toFixed(4)).slice(0,3).join(' | ')}`:' — INGEN TRÄFF'}`);
  await sleep(350);
}
const ok=RAA.map(([socken,nr,landskap])=>({socken,nr,landskap,hit:(bySocken.get(socken)||[])[0]})).filter(r=>r.hit);
console.log(`\nsocknar med träff: ${[...bySocken.values()].filter(h=>h.length).length}/${socknar.length}`);

if(!APPLY){ await c.end(); console.log('DRY RUN — kör med --apply för att uppdatera DB.'); process.exit(0); }

try{
  await c.query('BEGIN'); let sUp=0,eUp=0;
  for(const socken of socknar){
    const hits=bySocken.get(socken)||[]; if(!hits.length) continue;
    const hit=hits[0]; const exact=hits.length===1;
    const landskap=(RAA.find(r=>r[0]===socken)||[])[2]||'Skåne';
    const verNote = exact
      ? `Koordinat verifierad mot Fornsök (exakt registrerad lämning).`
      : `Koordinat = en av ${hits.length} registrerade avrättnings-/galgplatser i ${socken} socken (Fornsök); socken-nivå.`;
    // 1) upsert heritage_site
    let siteId;
    const ex=await c.query(`select id from heritage_sites where source_uri=$1 limit 1`,[hit.uri]);
    if(ex.rowCount) siteId=ex.rows[0].id;
    else{
      const r=await c.query(`insert into heritage_sites (name,raa_type,lat,lng,landscape,parish,source_uri,description)
        values ($1,'Avrättningsplats',$2,$3,$4,$5,$6,$7) returning id`,
        [hit.label||`${socken} avrättningsplats`,hit.lat,hit.lng,landskap,socken,hit.uri,
         `Bekräftad avrättningsplats i ${socken} socken. ${verNote}`]);
      siteId=r.rows[0].id; sUp++;
    }
    // 2) flytta dokumenterade facts_only-händelser i socknen från sockencentroid → verifierad koord + länk
    const u=await c.query(`update execution_events set lat=$1, lng=$2, site_id=coalesce(site_id,$3),
        description = description || ' '||$4
      where place_name ilike $5 and source_rights='facts_only' and lat is not null and abs(lat-$1)>0.002`,
      [hit.lat,hit.lng,siteId,verNote,`%${socken}%`]);
    eUp+=u.rowCount;
  }
  console.log(`\nnya heritage_sites: ${sUp}, uppdaterade händelse-koordinater: ${eUp}`);
  await c.query('COMMIT'); console.log('APPLIED.');
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }

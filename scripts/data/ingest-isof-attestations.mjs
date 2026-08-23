// GENERELL: berika place_names med ÄLDSTA BELÄGG ur Isof PlaceNameService (CC BY) för valfria landskap.
// Slår upp province-id + härad dynamiskt, laddar Isof PER HÄRAD (runt 10k-djuppagineringsgränsen),
// räknar ut landskapets bbox ur posterna, väljer VÅRA place_names i bboxen utan belägg, matchar EXAKT
// namn (fold) + (geo <1,5 km ELLER samma socken). Beläggen ur arkivkorten (evidence_year_oldest=YYYYMMDD →
// ÷10000). Provenance i attestation_source. Tidigast-över-källor: earliest_attestation_year=LEAST(bef.,år).
// KÄLLKRITIK: kräver namn+geo/socken; ingen fuzzy-gissning. Robust: try/catch per rad.
//
// Användning:  node scripts/data/ingest-isof-attestations.mjs --provinces "Gotland,Uppland" [--apply] [--limit N] [--sleep MS]
import pg from 'pg';
import { readFileSync } from 'node:fs';
const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const API = 'https://placenameservice.isof.se/v1';
const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const PROVINCES = ((argv.find(a => a.startsWith('--provinces=')) || '').split('=')[1]
  || (argv.includes('--provinces') ? argv[argv.indexOf('--provinces') + 1] : '')).split(',').map(s => s.trim()).filter(Boolean);
const LIMIT = Number((argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || (argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : 2000);
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) || 110;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8').split(/\r?\n/)
  .filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
async function getJSON(u){for(let a=0;a<4;a++){try{const r=await fetch(u,{headers:{'User-Agent':UA,Accept:'application/json'}});if(r.status===200)return r.json();if(r.status>=429){await sleep(1500*(a+1));continue;}return null;}catch{await sleep(800);}}return null;}
const fold = s => (s||'').toLowerCase().normalize('NFC').replace(/\s+/g,' ').trim();
function haversine(a,b,c,d){const R=6371000,t=x=>x*Math.PI/180,dφ=t(c-a),dλ=t(d-b);const h=Math.sin(dφ/2)**2+Math.cos(t(a))*Math.cos(t(c))*Math.sin(dλ/2)**2;return 2*R*Math.asin(Math.sqrt(h));}

async function provinceId(name){
  const rows = await getJSON(`${API}/geo-reference/provinces`);
  const list = Array.isArray(rows)?rows:(rows?.provinces||rows?.data||[]);
  const hit = list.find(r => fold(r.name)===fold(name));
  return hit?.id ?? null;
}
async function provinceDistricts(pid){
  const rows = await getJSON(`${API}/geo-reference/districts`);
  const list = Array.isArray(rows)?rows:(rows?.districts||rows?.data||[]);
  return list.filter(r => r.province_id===pid).map(r => r.id);
}
async function loadIsof(pid, districts){
  const map = new Map(); let total=0, minLat=90,maxLat=-90,minLng=180,maxLng=-180;
  for(const distId of districts){
    let page=1;
    for(;;){
      const d = await getJSON(`${API}/place-names?province-id=${pid}&district-id=${distId}&page-size=1000&page-number=${page}`);
      const rows = d?.place_names || [];
      if(!rows.length) break;
      for(const r of rows){
        if(r.latitude==null||r.longitude==null) continue;
        const la=+r.latitude, ln=+r.longitude;
        minLat=Math.min(minLat,la);maxLat=Math.max(maxLat,la);minLng=Math.min(minLng,ln);maxLng=Math.max(maxLng,ln);
        const k=fold(r.place_name);
        if(!map.has(k)) map.set(k,[]);
        map.get(k).push({ id:r.id, parish:(r.parish_name||'').replace(/\s*sn$/,'').trim(), lat:la, lng:ln });
      }
      total+=rows.length;
      if(rows.length<1000 || page>15) break;
      page++; await sleep(70);
    }
    await sleep(70);
  }
  return { map, total, bbox:{minLat,maxLat,minLng,maxLng} };
}
async function oldestEvidence(placeNameId){
  const d = await getJSON(`${API}/place-name-basis?place-name-id=${placeNameId}&page-size=50`);
  const rows = d?.place_name_bases || d?.place_name_basis || (Array.isArray(d)?d:[]) || [];
  let best=null;
  for(const r of rows){
    let raw = r.evidence_year_oldest!=null ? parseInt(r.evidence_year_oldest,10) : null;
    if(raw==null||Number.isNaN(raw)||raw<=0) continue;
    const year = raw>=10000 ? Math.floor(raw/10000) : raw;
    if(year<500||year>2025) continue;
    if(!best||year<best.year) best={ year, form:(r.evidence_information||'').trim()||null, source:(r.source||'').trim()||null, basisId:r.id };
  }
  return best;
}
const clean = s => s==null?null:String(s).replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').replace(/\s+/g,' ').normalize('NFC').trim().slice(0,300);

async function main(){
  if(!PROVINCES.length){ console.log('Ange --provinces "Gotland,Uppland,…"'); return; }
  const client = new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:300000});
  await client.connect();
  let grand=0;
  try{
    for(const prov of PROVINCES){
      const pid = await provinceId(prov);
      if(!pid){ console.log(`\n[${prov}] okänt landskap i Isof — hoppar.`); continue; }
      const districts = await provinceDistricts(pid);
      const { map, total, bbox } = await loadIsof(pid, districts);
      if(!total){ console.log(`\n[${prov}] inga Isof-poster.`); continue; }
      const pad=0.02;
      const ours = (await client.query(
        `select id, name, socken, lat, lng from place_names
         where lat between $1 and $2 and lng between $3 and $4
           and earliest_attestation_year is null and name is not null`,
        [bbox.minLat-pad, bbox.maxLat+pad, bbox.minLng-pad, bbox.maxLng+pad])).rows;
      console.log(`\n[${prov}] pid=${pid}, ${districts.length} härad, ${total} Isof-poster (${map.size} namn), bbox → ${ours.length} av våra namn utan belägg. ${APPLY?'APPLY':'DRY'} (limit ${LIMIT}).`);

      let processed=0, matched=0, upd=0;
      for(const o of ours){
        if(processed>=LIMIT) break;
        const cands = map.get(fold(o.name));
        if(!cands) continue;
        const oSock=fold(o.socken);
        let best=null;
        for(const c of cands){ const dm=haversine(+o.lat,+o.lng,c.lat,c.lng); const ok=dm<=1500||(oSock&&oSock===fold(c.parish)); if(ok&&(!best||dm<best.dm)) best={...c,dm}; }
        if(!best) continue;
        processed++;
        const ev = await oldestEvidence(best.id); await sleep(SLEEP);
        if(!ev) continue;
        matched++;
        if(APPLY){
          try{
            const src = clean(`Isof Ortnamnsregistret (CC BY): ortnamn ${best.id}, kort ${ev.basisId}${ev.source?', '+ev.source:''}`);
            const res = await client.query(
              `update place_names set earliest_attestation_year=$1, attested_form=$2, attestation_source=$3, updated_at=now() where id=$4 and earliest_attestation_year is null`,
              [ev.year, clean(ev.form), src, o.id]);
            upd += res.rowCount;
          }catch(e){ /* dålig byte/rad → hoppa, avbryt ej körningen */ }
        }
      }
      console.log(`[${prov}] processade ${processed}, med belägg ${matched}, skrivna ${upd}.`);
      grand += upd;
    }
    console.log(`\n=== TOTALT skrivna: ${grand} ===`);
  } finally { await client.end(); }
}
main().catch(e=>{console.error(e);process.exit(1);});

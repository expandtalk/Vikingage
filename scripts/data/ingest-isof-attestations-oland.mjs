// PILOT: berika place_names (Öland) med ÄLDSTA BELÄGG ur Isof PlaceNameService (CC BY).
// Matchar VÅRA Öland-namn ↔ Isof på EXAKT namn (fold, å/ä/ö bevarat) + GEO-närhet (<1,5 km).
// KÄLLKRITIK: kräver både namn- OCH geo-match; ingen fuzzy-gissning; provenance skrivs.
// För matchen hämtas arkivkorten (place-name-basis) → äldsta evidence_year_oldest + belagd form + litteratur.
// Fyller: earliest_attestation_year, attested_form, attestation_source (Isof + kort-id), external_id='isof:ID'.
//
// Användning:  node scripts/data/ingest-isof-attestations-oland.mjs [--apply] [--limit N] [--sleep MS]
//   default = dry-run, --limit 400 (pilot). Höj --limit för fler.
import pg from 'pg';
import { readFileSync } from 'node:fs';
const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const API = 'https://placenameservice.isof.se/v1';
const OLAND_PROVINCE = 3;
const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const LIMIT = Number((argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || (argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : 400);
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) || 120;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8').split(/\r?\n/)
  .filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
async function getJSON(u){for(let a=0;a<4;a++){try{const r=await fetch(u,{headers:{'User-Agent':UA,Accept:'application/json'}});if(r.status===200)return r.json();if(r.status>=429){await sleep(1500*(a+1));continue;}return null;}catch{await sleep(800);}}return null;}
const fold = s => (s||'').toLowerCase().normalize('NFC').replace(/\s+/g,' ').trim();
function haversine(a,b,c,d){const R=6371000,t=x=>x*Math.PI/180,dφ=t(c-a),dλ=t(d-b);const h=Math.sin(dφ/2)**2+Math.cos(t(a))*Math.cos(t(c))*Math.sin(dλ/2)**2;return 2*R*Math.asin(Math.sqrt(h));}

// Ölands 6 härad — paginera PER härad för att komma runt Isof-listans 10 000-djuppagineringsgräns.
const OLAND_DISTRICTS = [154, 280, 333, 284, 139, 149];
async function loadIsofOland(){
  const map = new Map(); let total=0;
  for(const distId of OLAND_DISTRICTS){
    let page=1;
    for(;;){
      const d = await getJSON(`${API}/place-names?province-id=${OLAND_PROVINCE}&district-id=${distId}&page-size=1000&page-number=${page}`);
      const rows = d?.place_names || [];
      if(!rows.length) break;
      for(const r of rows){
        if(r.latitude==null||r.longitude==null) continue;
        const k = fold(r.place_name);
        if(!map.has(k)) map.set(k,[]);
        map.get(k).push({ id:r.id, parish:(r.parish_name||'').replace(/\s*sn$/,'').trim(), lat:+r.latitude, lng:+r.longitude, name:r.place_name });
      }
      total += rows.length;
      if(rows.length < 1000 || page>15) break;
      page++; await sleep(80);
    }
    await sleep(80);
  }
  return { map, total };
}
// Äldsta belägg för en Isof place-name-id ur arkivkorten.
async function oldestEvidence(placeNameId){
  const d = await getJSON(`${API}/place-name-basis?place-name-id=${placeNameId}&page-size=50`);
  const rows = d?.place_name_bases || d?.place_name_basis || (Array.isArray(d)?d:[]) || [];
  let best=null;
  for(const r of rows){
    let raw = r.evidence_year_oldest!=null ? parseInt(r.evidence_year_oldest,10) : null;
    if(raw==null || Number.isNaN(raw) || raw<=0) continue;
    // Isof kodar belägg-datum som YYYYMMDD (t.ex. 12830000 = år 1283). Extrahera året.
    const year = raw >= 10000 ? Math.floor(raw/10000) : raw;
    if(year < 500 || year > 2025) continue; // rimlighetsspärr
    if(!best || year < best.year) best = { year, form:(r.evidence_information||'').trim()||null, source:(r.source||'').trim()||null, basisId:r.id, pronounce:(r.pronounce||'').trim()||null };
  }
  return best;
}

async function main(){
  const client = new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:300000});
  await client.connect();
  try{
    const ours = (await client.query(
      `select id, name, socken, lat, lng from place_names
       where lat between 56.18 and 57.40 and lng between 16.36 and 17.13
         and earliest_attestation_year is null and name is not null
       order by name`)).rows;
    console.log(`Våra Öland-namn utan belägg: ${ours.length}. Hämtar Isof Öland…`);
    const { map, total } = await loadIsofOland();
    console.log(`Isof Öland: ${total} poster, ${map.size} unika namn. Läge: ${APPLY?'APPLY':'DRY-RUN'} (limit ${LIMIT}).`);

    const results=[]; let matched=0, noname=0, nogeo=0, noevidence=0, processed=0;
    for(const o of ours){
      if(processed>=LIMIT) break;
      const cands = map.get(fold(o.name));
      if(!cands){ noname++; continue; }
      // Match: exakt namn + (geo <1,5 km ELLER samma socken). Isof-koord är ofta sockencentroid
      // (geometry_source='Socken') → geo ensamt missar; socken-likhet räddar dem. Prefer geo-närmast.
      const oSock = fold(o.socken);
      let best=null;
      for(const c of cands){
        const dm=haversine(+o.lat,+o.lng,c.lat,c.lng);
        const ok = dm<=1500 || (oSock && oSock===fold(c.parish));
        if(ok && (!best||dm<best.dm)) best={...c,dm};
      }
      if(!best){ nogeo++; continue; }
      processed++;
      const ev = await oldestEvidence(best.id);
      await sleep(SLEEP);
      if(!ev){ noevidence++; continue; }
      matched++;
      results.push({ ...o, isofId:best.id, dm:Math.round(best.dm), ...ev });
    }

    console.log(`\n=== RAPPORT ===`);
    console.log(`Processade (namn+geo-match): ${processed}. Med belägg: ${matched}. Utan namnmatch: ${noname}, utan geo-match: ${nogeo}, matchade utan belägg: ${noevidence}.`);
    results.slice(0,15).forEach(r=>console.log(`  ${r.name.padEnd(22)} ${String(r.year).padStart(4)} "${r.form||''}"  (${r.dm}m, isof ${r.isofId})${r.source?'  ['+r.source.slice(0,30)+']':''}`));

    if(!APPLY){ console.log('\nDRY-RUN — inget skrivet. Kör med --apply.'); return; }
    let upd=0;
    for(const r of results){
      // Proveniens i attestation_source (Isof ortnamn-id + kort-id + ev. litteratur). external_id rörs EJ
      // (unik (source,external_id); flera av våra rader kan dela samma Isof-plats).
      const src = `Isof Ortnamnsregistret (CC BY): ortnamn ${r.isofId}, kort ${r.basisId}${r.source?', '+r.source:''}`.slice(0,300);
      const res = await client.query(
        `update place_names set earliest_attestation_year=$1, attested_form=$2, attestation_source=$3, updated_at=now()
         where id=$4 and earliest_attestation_year is null`,
        [r.year, r.form, src, r.id]);
      upd += res.rowCount;
    }
    console.log(`\n✅ APPLY: ${upd} ortnamn berikade med äldsta belägg (Isof, CC BY).`);
  } finally { await client.end(); }
}
main().catch(e=>{console.error(e);process.exit(1);});

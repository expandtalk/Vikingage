// Kent/ontologi: materialisera jordtransaktionernas EKONOMISKA GEOGRAFI. Extraherar sockennamn
// deterministiskt ur brev-summeringen (regex `X socken`/`X sn`), resolvar mot ONTOLOGINS parish-lager
// (entity_registry entity_type='parish') och promoterar BARA entydiga (exakt 1 parishnod) → kg_charter_edges
// edge_type='ror_plats', source_pass='regex'. Homonymer/oresolverbara hoppas (räknas, aldrig gissas).
// Uteslut förfalskningar. Idempotent (ON CONFLICT). Kör: node scripts/data/ingest-charter-property-parish.mjs
import fs from 'fs'; import pg from 'pg';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

// 1) parish-orakel: lower(label) -> [ids]
const parish = new Map();
for (const r of (await c.query(`select id, label from entity_registry where entity_type='parish' and label is not null`)).rows) {
  const k = r.label.toLowerCase(); (parish.get(k) || parish.set(k, []).get(k)).push(r.id);
}
console.log('parish-noder:', parish.size, 'distinkta labels');

// 2) jordtransaktionsbrev med summering, ej förfalskning
const rows = (await c.query(`
  select lr.sdhk_id, lr.summary
  from sdhk.charter_tags ct
  join sdhk.letters_raw lr on lr.sdhk_id = ct.sdhk_id
  where ct.facett='aktyp' and ct.varde='jordtransaktion' and lr.summary is not null
    and not exists (select 1 from sdhk.charter_tags f where f.sdhk_id=ct.sdhk_id and f.facett='akthet' and f.varde='forfalskning')`)).rows;
console.log('jordtransaktionsbrev med summering:', rows.length);

// 3) extrahera socken + resolva
const SOCKEN = /([A-Za-zÅÄÖåäöÉéÜüØøÆæ][A-Za-zÅÄÖåäöÉéÜüØøÆæ\-]{2,})\s+(?:socken|sn)\b/g;
const norm = (s) => s.replace(/s$/,''); // genitiv-strip som andraförsök
let cand=0, entydig=0, homonym=0, oresolv=0;
const edges = []; // {sdhk_id, entity_ref, span_start, span_end}
for (const r of rows) {
  const seen = new Set();
  let m;
  SOCKEN.lastIndex = 0;
  while ((m = SOCKEN.exec(r.summary)) !== null) {
    const raw = m[1]; cand++;
    const tries = [raw.toLowerCase(), norm(raw).toLowerCase()];
    let ids = null;
    for (const t of tries) { if (parish.has(t)) { ids = parish.get(t); break; } }
    if (!ids) { oresolv++; continue; }
    if (ids.length > 1) { homonym++; continue; }      // tvetydig → hoppa (v2: province-tiebreak)
    const key = r.sdhk_id + ':' + ids[0];
    if (seen.has(key)) continue; seen.add(key);
    entydig++;
    edges.push({ sdhk_id: r.sdhk_id, entity_ref: ids[0], span_start: m.index, span_end: m.index + m[0].length });
  }
}
console.log(`sockenkandidater ${cand} → entydiga ${entydig}, homonymer ${homonym} (hoppade), oresolverbara ${oresolv} (hoppade)`);

// 4) promotera entydiga → kg_charter_edges (batchat)
let ins=0;
for (let i=0;i<edges.length;i+=500) {
  const b = edges.slice(i,i+500);
  const vals=[], p=[];
  b.forEach((e,j)=>{ const o=j*4; p.push(`($${o+1},$${o+2},'ror_plats',0.9,'regex',$${o+3},$${o+4})`); vals.push(e.sdhk_id,e.entity_ref,e.span_start,e.span_end); });
  const res = await c.query(`insert into kg_charter_edges (sdhk_id,entity_ref,edge_type,confidence,source_pass,span_start,span_end)
    values ${p.join(',')} on conflict (sdhk_id,entity_ref,edge_type) do nothing`, vals);
  ins += res.rowCount;
}
console.log('kg_charter_edges: nya ror_plats-kanter:', ins, '| totalt nu:', (await c.query(`select count(*) n from kg_charter_edges where edge_type='ror_plats'`)).rows[0].n);
// stickprov
console.log('stickprov:', (await c.query(`select e.sdhk_id, er.label from kg_charter_edges e join entity_registry er on er.id=e.entity_ref where e.edge_type='ror_plats' order by e.sdhk_id limit 8`)).rows.map(r=>`${r.sdhk_id}→${r.label}`).join(', '));
await c.end();

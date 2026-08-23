// Skörda dödsplats (Wikidata P20) + gravplats (P119) + deras koordinater (P625) för persons som
// har wikidata_qid. CC0. Gissar ALDRIG: saknas platsen i Wikidata lämnas raden orörd (NULL).
// Kör EFTER migrationen 20260821110000_persons_death_burial_place.sql.
//   node scripts/data/harvest-person-death-burial.mjs
import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();
const q = async (t, p) => (await c.query(t, p)).rows;

const WDQS = 'https://query.wikidata.org/sparql';
const UA = 'VikingAge/1.0 (https://vikingage.se; research) person-death-burial-harvest';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Argument: en siffra = LIMIT (topp-N efter notabilitet/sitelinks); annars ett NAMN-filter (ilike).
//   node harvest-person-death-burial.mjs            → alla
//   node harvest-person-death-burial.mjs 3000       → topp 3000 mest notabla
//   node harvest-person-death-burial.mjs "birger jarl" → bara matchande namn
const arg = process.argv[2];
const isLimit = arg && /^\d+$/.test(arg);
const nameFilter = arg && !isLimit ? arg : null;
const rows = await q(
  `select id, wikidata_qid from persons
   where wikidata_qid is not null and death_place_qid is null and burial_place_qid is null
   ${nameFilter ? 'and name ilike $1' : ''}
   order by sitelinks desc nulls last
   ${isLimit ? `limit ${parseInt(arg, 10)}` : ''}`,
  nameFilter ? [`%${nameFilter}%`] : []);
console.log(`Persons att skörda: ${rows.length}${nameFilter ? ` (namn ~ "${nameFilter}")` : isLimit ? ` (topp ${arg})` : ''}`);

const byQid = new Map(rows.map((r) => [r.wikidata_qid, r.id]));
const qids = [...byQid.keys()];
const parsePoint = (wkt) => { const m = /Point\(([-\d.]+)\s+([-\d.]+)\)/.exec(wkt || ''); return m ? { lng: +m[1], lat: +m[2] } : null; };

let updated = 0;
for (let i = 0; i < qids.length; i += 100) {
  const batch = qids.slice(i, i + 100);
  const values = batch.map((x) => `wd:${x}`).join(' ');
  const sparql = `SELECT ?person ?death ?deathLabel ?deathCoord ?burial ?burialLabel ?burialCoord WHERE {
    VALUES ?person { ${values} }
    OPTIONAL { ?person wdt:P20 ?death. OPTIONAL { ?death wdt:P625 ?deathCoord. } }
    OPTIONAL { ?person wdt:P119 ?burial. OPTIONAL { ?burial wdt:P625 ?burialCoord. } }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
  }`;
  let json;
  try {
    const r = await fetch(`${WDQS}?format=json&query=${encodeURIComponent(sparql)}`, { headers: { 'User-Agent': UA, 'Accept': 'application/sparql-results+json' } });
    if (!r.ok) { console.error('WDQS', r.status, await r.text().catch(() => '')); await sleep(2000); continue; }
    json = await r.json();
  } catch (e) { console.error('WDQS fetch-fel', String(e)); await sleep(2000); continue; }

  // En person kan ge flera rader (flera platser) — ta första icke-tomma per fält.
  const acc = new Map();
  for (const b of json.results.bindings) {
    const qid = (b.person?.value || '').split('/').pop();
    const id = byQid.get(qid); if (!id) continue;
    const e = acc.get(id) || {};
    if (b.death && !e.death_qid) { e.death_qid = b.death.value.split('/').pop(); e.death_label = b.deathLabel?.value ?? null; const pt = parsePoint(b.deathCoord?.value); if (pt) { e.death_lat = pt.lat; e.death_lng = pt.lng; } }
    if (b.burial && !e.burial_qid) { e.burial_qid = b.burial.value.split('/').pop(); e.burial_label = b.burialLabel?.value ?? null; const pt = parsePoint(b.burialCoord?.value); if (pt) { e.burial_lat = pt.lat; e.burial_lng = pt.lng; } }
    acc.set(id, e);
  }
  for (const [id, e] of acc) {
    if (!e.death_qid && !e.burial_qid) continue;
    await c.query(
      `update persons set
        death_place_qid=coalesce($2,death_place_qid), death_place_label=coalesce($3,death_place_label),
        death_place_lat=coalesce($4,death_place_lat), death_place_lng=coalesce($5,death_place_lng),
        burial_place_qid=coalesce($6,burial_place_qid), burial_place_label=coalesce($7,burial_place_label),
        burial_place_lat=coalesce($8,burial_place_lat), burial_place_lng=coalesce($9,burial_place_lng)
       where id=$1`,
      [id, e.death_qid ?? null, e.death_label ?? null, e.death_lat ?? null, e.death_lng ?? null,
        e.burial_qid ?? null, e.burial_label ?? null, e.burial_lat ?? null, e.burial_lng ?? null]);
    updated++;
  }
  console.log(`  ${Math.min(i + 100, qids.length)}/${qids.length} — uppdaterade hittills: ${updated}`);
  await sleep(1200); // snäll mot WDQS
}
// TODO efter skörd: härled *_admin via ST_Contains mot admin_boundaries (som birthplace_admin), och
// utöka PersonLocateAnswer.tsx så death/burial ritar kartan precis som birth (villkoret hasBirthCoord).
console.log(`Klart. Uppdaterade ${updated} personer.`);
await c.end();

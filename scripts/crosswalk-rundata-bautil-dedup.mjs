// Bygger (gammalt-alias -> modernt signum)-par ur rundata, för att deduplicera
// gamla katalogreferenser (Bautil "B", Liljegren "L", "BN" m.fl.) mot moderna
// landskapssignum. Emitterar dry-run-count + DELETE (tar bort gamla dubbletten
// ENDAST om det moderna signumet finns som egen rad). Kör i editorn / via MCP.
// Kör: node scripts/crosswalk-rundata-bautil-dedup.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const MODERN = new Set(['U','Sö','Ög','Sm','Öl','G','Vg','Bo','Ha','Nä','Vs','Vr','Gs','Hs','M','Ång','J','Hä','D','Nb','Vb','Lp','Sk','Bl','DR','N','IS','GR']);
const lines = readFileSync('rundata.sql', 'utf8').split('\n');
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;
const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
let cur = null;
const sigText = new Map(), inscToSig = new Map();
for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i); if (m) { cur = m[1]; continue; }
  const line = raw.trim(); if (!line.startsWith('(')) continue;
  if (cur === 'signa') { const c = line.match(reSigna); if (c) sigText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim()); }
  else if (cur === 'signum_inscription') { const c = line.match(reSigIn); if (c) { const [, , sid, iid, canon] = c; if (!inscToSig.has(iid)) inscToSig.set(iid, []); inscToSig.get(iid).push({ sid, canon: +canon }); } }
}
const prefixOf = (s) => s.split(' ')[0];
const pairs = new Map(); // oldAlias -> modern canonical
for (const [, sigs] of inscToSig) {
  const resolved = sigs.map((s) => ({ text: sigText.get(s.sid), canon: s.canon })).filter((s) => s.text);
  if (resolved.length < 2) continue;
  const modern = resolved.filter((s) => MODERN.has(prefixOf(s.text))).sort((a, b) => b.canon - a.canon)[0];
  if (!modern) continue;
  for (const s of resolved) {
    if (s.text === modern.text) continue;
    if (MODERN.has(prefixOf(s.text))) continue; // behåll moderna alias, dedupa bara gamla kataloger
    if (!pairs.has(s.text)) pairs.set(s.text, modern.text);
  }
}
// Filtrera paren till gamla signum som FAKTISKT finns som rad i DB (annars är
// merge/delete no-ops som bara sväller filen). Hämtas via Supabase REST (publik läsning).
const norm0 = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const SUPABASE_URL = 'https://mnuifmcjspeaauzehasj.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udWlmbWNqc3BlYWF1emVoYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzQ1MzQsImV4cCI6MjA2MzYxMDUzNH0.ZkAhIwMPRe4lgAH8MxUCNjM39Vh4hyk9IVdmX0jC-z8';
const existing = new Set();
for (let offset = 0; ; offset += 1000) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/runic_inscriptions?select=signum`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, Range: `${offset}-${offset + 999}`, 'Range-Unit': 'items' },
  });
  const chunk = await res.json();
  if (!Array.isArray(chunk) || chunk.length === 0) break;
  for (const r of chunk) if (r.signum) existing.add(norm0(r.signum));
  if (chunk.length < 1000) break;
}
console.log(`DB-signum hämtade: ${existing.size}`);
for (const oldSig of [...pairs.keys()]) if (!existing.has(norm0(oldSig))) pairs.delete(oldSig);

const rows = [...pairs.entries()];
const esc = (s) => `'${s.replace(/'/g, "''")}'`;
const values = rows.map(([o, m]) => `(${esc(o)},${esc(m)})`).join(',\n');

// Aggregera alla gamla alias per modernt signum (för att bevara sökbarhet).
const modernToOlds = new Map();
for (const [oldSig, modernSig] of pairs) {
  if (!modernToOlds.has(modernSig)) modernToOlds.set(modernSig, new Set());
  modernToOlds.get(modernSig).add(oldSig);
}
const arrLit = (set) => `array[${[...set].map(esc).join(',')}]::text[]`;
const mergeValues = [...modernToOlds.entries()].map(([m, olds]) => `(${esc(m)},${arrLit(olds)})`).join(',\n');

const norm = (col) => `lower(regexp_replace(${col},'\\s+',' ','g'))`;
const dryRun = `-- DRY-RUN: hur många gamla dubbletter (gammalt alias som egen rad + modern finns)?
select count(*) as removable_duplicates
from public.runic_inscriptions r
join (values\n${values}\n) as p(old_sig, modern_sig) on ${norm('r.signum')} = ${norm('p.old_sig')}
where exists (select 1 from public.runic_inscriptions m where ${norm('m.signum')} = ${norm('p.modern_sig')});`;

const del = `-- DEDUP: slår ihop gamla katalogsignum (Bautil/Bergen/L/BN…) med moderna stenar.
-- Temptabell => paren inline EN gång. STEG 1 bevarar gamla namn som sökbara alias
-- (search_inscriptions_flexible söker i alternative_signum → "B 1054" hittar Öl 37).
-- STEG 2 flyttar koord om moderna saknar. STEG 3 raderar tom gammal dubblett där modern finns.
-- Idempotent. Destruktivt (radering) — kör medvetet.
begin;
create temp table _dedup(old_sig text, modern_sig text) on commit drop;
insert into _dedup(old_sig, modern_sig) values
${values};

-- 1. Bevara gamla namn som sökbara alias på moderna raden.
update public.runic_inscriptions m
set alternative_signum = (
  select array(
    select distinct x
    from unnest(coalesce(m.alternative_signum, '{}'::text[]) || g.olds) x
    where x is not null and x <> m.signum
  )
)
from (select modern_sig, array_agg(distinct old_sig) as olds from _dedup group by modern_sig) g
where ${norm('m.signum')} = ${norm('g.modern_sig')};

-- 2. Flytta koordinat till moderna raden om den saknar.
update public.runic_inscriptions m
set coordinates = r.coordinates, coord_source = coalesce(m.coord_source,'bautil_transfer')
from _dedup p join public.runic_inscriptions r on ${norm('r.signum')} = ${norm('p.old_sig')}
where ${norm('m.signum')} = ${norm('p.modern_sig')} and m.coordinates is null and r.coordinates is not null;

-- 3. Radera gamla tomma dubbletter där moderna signumet finns (namnet bevarat i steg 1).
delete from public.runic_inscriptions r
using _dedup p
where ${norm('r.signum')} = ${norm('p.old_sig')}
  and exists (select 1 from public.runic_inscriptions m where ${norm('m.signum')} = ${norm('p.modern_sig')});
commit;`;

writeFileSync('scripts/data/rundata-bautil-dedup-dryrun.sql', dryRun + '\n');
writeFileSync('scripts/data/rundata-bautil-dedup.sql', del + '\n');
console.log(`old->modern-par: ${rows.length} | moderna med alias: ${modernToOlds.size}`);
console.log('Sample:', rows.slice(0, 6).map(([o, m]) => `${o}=>${m}`));
console.log('Wrote dryrun + dedup SQL (bevarar gamla namn som sökbara alias)');

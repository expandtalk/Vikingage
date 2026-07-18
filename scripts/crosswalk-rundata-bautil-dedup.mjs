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
const rows = [...pairs.entries()];
const esc = (s) => `'${s.replace(/'/g, "''")}'`;
const values = rows.map(([o, m]) => `(${esc(o)},${esc(m)})`).join(',\n');

const norm = (col) => `lower(regexp_replace(${col},'\\s+',' ','g'))`;
const dryRun = `-- DRY-RUN: hur många gamla dubbletter (gammalt alias som egen rad + modern finns)?
select count(*) as removable_duplicates
from public.runic_inscriptions r
join (values\n${values}\n) as p(old_sig, modern_sig) on ${norm('r.signum')} = ${norm('p.old_sig')}
where exists (select 1 from public.runic_inscriptions m where ${norm('m.signum')} = ${norm('p.modern_sig')});`;

const del = `-- DELETE: ta bort gamla katalogdubbletter där moderna signumet finns.
-- Flyttar först ev. unik koordinat till moderna raden om den saknar koordinat.
begin;
update public.runic_inscriptions m
set coordinates = r.coordinates, coord_source = coalesce(m.coord_source,'bautil_transfer')
from public.runic_inscriptions r
join (values\n${values}\n) as p(old_sig, modern_sig) on ${norm('r.signum')} = ${norm('p.old_sig')}
where ${norm('m.signum')} = ${norm('p.modern_sig')} and m.coordinates is null and r.coordinates is not null;

delete from public.runic_inscriptions r
using (values\n${values}\n) as p(old_sig, modern_sig)
where ${norm('r.signum')} = ${norm('p.old_sig')}
  and exists (select 1 from public.runic_inscriptions m where ${norm('m.signum')} = ${norm('p.modern_sig')});
commit;`;

writeFileSync('scripts/data/rundata-bautil-dedup-dryrun.sql', dryRun + '\n');
writeFileSync('scripts/data/rundata-bautil-dedup.sql', del + '\n');
console.log(`old->modern-par: ${rows.length}`);
console.log('Sample:', rows.slice(0, 6).map(([o, m]) => `${o}=>${m}`));
console.log('Wrote dryrun + dedup SQL');

// Steg 1 (Daniel): korsdata för runstenar IN, ur den egna rundata-dumpen (Rundatas korstypologi).
// Join: crosses(objectid) → cross_crossform → crossforms(aspect,form). objectid → inscription → signum.
// Sätter runic_inscriptions.has_cross + cross_count + cross_forms (Gräslund aspect+form).
// Kör: node scripts/data/ingest-runestone-crosses.mjs [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const lines = readFileSync('rundata.sql', 'utf8').split('\n');
const hexOf = (f) => { const m = f.match(/X'([0-9A-Fa-f]+)'/); return m ? m[1].toUpperCase() : null; };

// signum-kedjan (som crosswalk-parsern)
const objToInsc = new Map(), inscToSig = new Map(), signumText = new Map();
// kors
const crossToObj = new Map();     // crossid -> objectid
const objCrossCount = new Map();  // objectid -> antal kors
const ccfToForm = new Map();      // crossid -> [crossformid]
const formText = new Map();       // crossformid -> "A1"
const reInsc = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',/;
const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;
const reCross = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',(\d+)\)/;                 // crossid, objectid, cross
const reForm = /^\(X'([0-9A-F]+)','([^'])',(\d+)\)/;                        // crossformid, aspect, form
const reCcf = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;   // ccfid, crossid, crossformid, cert

let cur = null;
for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;
  if (cur === 'inscriptions') { const c = line.match(reInsc); if (c) objToInsc.set(c[2], c[1]); }
  else if (cur === 'signum_inscription') { const c = line.match(reSigIn); if (c) { if (!inscToSig.has(c[3])) inscToSig.set(c[3], []); inscToSig.get(c[3]).push({ signumid: c[2], canonical: +c[4] }); } }
  else if (cur === 'signa') { const c = line.match(reSigna); if (c) signumText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim()); }
  else if (cur === 'crosses') { const c = line.match(reCross); if (c) { crossToObj.set(c[1], c[2]); objCrossCount.set(c[2], (objCrossCount.get(c[2]) || 0) + 1); } }
  else if (cur === 'crossforms') { const c = line.match(reForm); if (c) formText.set(c[1], `${c[2]}${c[3]}`); }
  else if (cur === 'cross_crossform') { const c = line.match(reCcf); if (c) { if (!ccfToForm.has(c[2])) ccfToForm.set(c[2], []); ccfToForm.get(c[2]).push(c[3]); } }
}

// primär signum per inscription (canonical=1 vinner)
function primarySignum(inscid) {
  const sigs = inscToSig.get(inscid); if (!sigs) return null;
  const res = sigs.map((s) => ({ ...s, text: signumText.get(s.signumid) })).filter((s) => s.text);
  if (!res.length) return null;
  res.sort((a, b) => (b.canonical - a.canonical));
  return res[0].text;
}

// objectid -> {count, forms[]}
const bySignum = new Map();
for (const [objid, count] of objCrossCount) {
  const inscid = objToInsc.get(objid); if (!inscid) continue;
  const sig = primarySignum(inscid); if (!sig) continue;
  // samla korsformer för detta objekts kors
  const forms = new Set();
  for (const [crossid, oid] of crossToObj) {
    if (oid !== objid) continue;
    for (const fid of (ccfToForm.get(crossid) || [])) { const t = formText.get(fid); if (t) forms.add(t); }
  }
  bySignum.set(sig, { count, forms: [...forms].sort() });
}
console.log(`Dump: ${objCrossCount.size} objekt med kors → ${bySignum.size} med signum.`);
const sample = [...bySignum.entries()].slice(0, 6).map(([s, v]) => `${s}(${v.count}k ${v.forms.join('/')})`);
console.log('Ex:', sample.join(', '));

if (!APPLY) { console.log('\n(dry-run — kör med --apply för att skriva)'); process.exit(0); }

const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`alter table public.runic_inscriptions
  add column if not exists has_cross boolean not null default false,
  add column if not exists cross_count int,
  add column if not exists cross_forms text,
  add column if not exists cross_source text`);
let updated = 0, nomatch = 0;
for (const [sig, v] of bySignum) {
  const r = await c.query(`update runic_inscriptions set has_cross=true, cross_count=$1, cross_forms=$2, cross_source='Rundata (Samnordisk runtextdatabas) via rundata.sql' where signum=$3`,
    [v.count, v.forms.join(', ') || null, sig]);
  if (r.rowCount) updated += r.rowCount; else nomatch++;
}
console.log(`\nUppdaterade ${updated} inskrifter med has_cross; ${nomatch} signum saknade match i DB.`);
console.log('Totalt med kors i DB nu:', (await c.query(`select count(*) n from runic_inscriptions where has_cross`)).rows[0].n);
console.log('Per landskap (topp):', (await c.query(`select left(signum,3) prefix, count(*) n from runic_inscriptions where has_cross group by 1 order by 2 desc limit 8`)).rows.map((r) => `${r.prefix.trim()}:${r.n}`).join(' '));
await c.end();

// Lyft numerisk datering (terminus post/ante quem) ur rundata-dumpen → runic_inscriptions.
// termini(objectid, TPQ, TAQ). objectid → inscription → signum. Ger skarp datering i st f grov sekel-text.
// Kör: node scripts/data/ingest-runestone-termini.mjs [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const lines = readFileSync('rundata.sql', 'utf8').split('\n');

const objToInsc = new Map(), inscToSig = new Map(), signumText = new Map();
const tpqTaq = new Map(); // objectid -> {tpq, taq}
const reInsc = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',/;
const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;
const reTerm = /^\(X'([0-9A-F]+)',(NULL|-?\d+),(NULL|-?\d+)\)/;
const numOrNull = (s) => (s === 'NULL' ? null : +s);

let cur = null;
for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;
  if (cur === 'inscriptions') { const c = line.match(reInsc); if (c) objToInsc.set(c[2], c[1]); }
  else if (cur === 'signum_inscription') { const c = line.match(reSigIn); if (c) { if (!inscToSig.has(c[3])) inscToSig.set(c[3], []); inscToSig.get(c[3]).push({ signumid: c[2], canonical: +c[4] }); } }
  else if (cur === 'signa') { const c = line.match(reSigna); if (c) signumText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim()); }
  else if (cur === 'termini') { const c = line.match(reTerm); if (c) tpqTaq.set(c[1], { tpq: numOrNull(c[2]), taq: numOrNull(c[3]) }); }
}
function primarySignum(inscid) {
  const sigs = inscToSig.get(inscid); if (!sigs) return null;
  const res = sigs.map((s) => ({ ...s, text: signumText.get(s.signumid) })).filter((s) => s.text);
  if (!res.length) return null;
  res.sort((a, b) => (b.canonical - a.canonical));
  return res[0].text;
}
const bySignum = new Map();
for (const [objid, tt] of tpqTaq) {
  if (tt.tpq == null && tt.taq == null) continue;
  const inscid = objToInsc.get(objid); if (!inscid) continue;
  const sig = primarySignum(inscid); if (!sig) continue;
  bySignum.set(sig, tt);
}
console.log(`Dump: ${tpqTaq.size} objekt m. termini → ${bySignum.size} med signum + värde.`);
console.log('Ex:', [...bySignum.entries()].slice(0, 6).map(([s, v]) => `${s}(${v.tpq ?? '?'}–${v.taq ?? '?'})`).join(', '));
if (!APPLY) { console.log('\n(dry-run — --apply för att skriva)'); process.exit(0); }

const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`alter table public.runic_inscriptions
  add column if not exists dating_tpq int, add column if not exists dating_taq int,
  add column if not exists dating_source_numeric text`);
let updated = 0, nomatch = 0;
for (const [sig, tt] of bySignum) {
  const r = await c.query(`update runic_inscriptions set dating_tpq=$1, dating_taq=$2, dating_source_numeric='Rundata termini (Samnordisk runtextdatabas) via rundata.sql' where signum=$3`, [tt.tpq, tt.taq, sig]);
  if (r.rowCount) updated += r.rowCount; else nomatch++;
}
console.log(`\nUppdaterade ${updated}; ${nomatch} signum utan DB-match.`);
console.log('Med numerisk datering nu:', (await c.query(`select count(*) n from runic_inscriptions where dating_tpq is not null or dating_taq is not null`)).rows[0].n);
console.log('Spann-fördelning (TPQ-sekel):', (await c.query(`select (dating_tpq/100)*100 sekel, count(*) n from runic_inscriptions where dating_tpq is not null group by 1 order by 1`)).rows.map((r) => `${r.sekel}:${r.n}`).join(' '));
await c.end();

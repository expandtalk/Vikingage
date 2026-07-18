// Full översättnings-import: ALLA versioner (P/Q/R…, sv+en) ur rundata.sql in i
// appens satellittabell `translations` — så detaljmodalen visar hela mångfalden
// (jfr docs/ontology.md §1b). Till skillnad från translation-crosswalken (som bara
// tog primär 'P' till skalärkolumnerna) bevaras här varje version.
//
// NYCKLING: modalen (useInscriptionExtendedData) matchar translations.inscriptionid
// (bytea) mot runic_inscriptions.id (uuid → \x+hex). Vi kan inte nyckla på rundatas
// binära inscriptionid (importen var partiell). Lösning: emittera VALUES (signum,
// version, text, språk) och låt SQL slå upp id via JOIN på signum + decode(uuid→bytea).
//
// Kör: node scripts/crosswalk-rundata-translations-full.mjs
// Sedan: kör scripts/data/rundata-translations-full.sql i SQL-editorn (idempotent).
import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync('rundata.sql', 'utf8').split('\n');

function splitTuple(body) {
  const f = []; let cur = ''; let inStr = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      if (ch === '\\') { cur += ch + (body[i + 1] ?? ''); i++; continue; }
      if (ch === "'") { inStr = false; cur += ch; continue; }
      cur += ch;
    } else {
      if (ch === "'") { inStr = true; cur += ch; continue; }
      if (ch === ',') { f.push(cur); cur = ''; continue; }
      cur += ch;
    }
  }
  f.push(cur); return f;
}
function unquote(field) {
  const s = field.trim();
  if (s === 'NULL') return null;
  if (!s.startsWith("'")) return s;
  return s.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"')
    .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\\\/g, '\\');
}
const hexOf = (f) => { const m = f.match(/X'([0-9A-Fa-f]+)'/); return m ? m[1].toUpperCase() : null; };

let cur = null;
const inscToSignumIds = new Map();
const signumText = new Map();
const rowsByInsc = new Map(); // inscriptionid -> [{mark, text, lang}]
const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;

for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;
  if (cur === 'signum_inscription') {
    const c = line.match(reSigIn);
    if (c) { if (!inscToSignumIds.has(c[3])) inscToSignumIds.set(c[3], []); inscToSignumIds.get(c[3]).push({ id: c[2], canon: +c[4] }); }
  } else if (cur === 'signa') {
    const c = line.match(reSigna);
    if (c) signumText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim());
  } else if (cur === 'translations') {
    // Strippa trailing ")", ")," ELLER ");" (sista tupeln i en INSERT-batch slutar med ");").
    const f = splitTuple(line.replace(/\)\s*[,;]?\s*$/, '').replace(/^\(/, ''));
    if (f.length < 6) continue;
    const inscriptionid = hexOf(f[1]);
    const mark = unquote(f[2]);
    const text = unquote(f[3]);
    const lang = (unquote(f[5]) || '').toLowerCase();
    if (!inscriptionid || !text) continue;
    // Bara språk som finns i languages.language_code (FK) — sv-se / en-gb.
    if (lang !== 'sv-se' && lang !== 'en-gb') continue;
    if (!rowsByInsc.has(inscriptionid)) rowsByInsc.set(inscriptionid, []);
    rowsByInsc.get(inscriptionid).push({ mark: mark || 'P', text, lang });
  }
}

function signumFor(inscriptionid) {
  const sigs = inscToSignumIds.get(inscriptionid);
  if (!sigs) return null;
  for (const s of [...sigs].sort((a, b) => b.canon - a.canon)) { const t = signumText.get(s.id); if (t) return t; }
  return null;
}

// signum -> alla översättningsrader
const out = [];
for (const [inscriptionid, rows] of rowsByInsc) {
  const sig = signumFor(inscriptionid);
  if (!sig) continue;
  for (const r of rows) out.push({ sig, mark: r.mark, text: r.text, lang: r.lang });
}

const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;
const values = out.map(r => `(${esc(r.sig)},${esc(r.mark)},${esc(r.text)},${esc(r.lang)})`).join(',\n');

const sql = `-- Full översättnings-import (alla versioner sv+en) ur rundata.sql → translations.
-- ${out.length} rader. Nycklas på runic_inscriptions.id via JOIN på signum (så modalen
-- hittar dem). Idempotent: rensar först kanonisk-nycklade rader, återinsätter sedan.
-- Kör i SQL-editorn.

begin;

-- Rensa tidigare kanonisk-nycklade översättningar (säkert att köra om).
delete from public.translations t
using public.runic_inscriptions ri
where t.inscriptionid = decode(replace(ri.id::text, '-', ''), 'hex');

insert into public.translations (translationid, inscriptionid, translation, text, teitext, language)
select decode(replace(gen_random_uuid()::text, '-', ''), 'hex'),
       decode(replace(ri.id::text, '-', ''), 'hex'),
       cw.mark, cw.txt, null, cw.lang
from (values
${values}
) as cw(signum, mark, txt, lang)
join public.runic_inscriptions ri
  on lower(regexp_replace(ri.signum, '\\s+', ' ', 'g')) = lower(regexp_replace(cw.signum::text, '\\s+', ' ', 'g'));

commit;

-- Efterkontroll: select count(*), count(distinct inscriptionid) from translations;
`;

writeFileSync('scripts/data/rundata-translations-full.sql', sql);
const sv = out.filter(r => r.lang.startsWith('sv')).length;
const en = out.filter(r => r.lang.startsWith('en')).length;
console.log(`översättningsrader (alla versioner): ${out.length} (sv ${sv}, en ${en})`);
console.log(`distinkta signum: ${new Set(out.map(r => r.sig)).size}`);
console.log('Wrote scripts/data/rundata-translations-full.sql');

// Bygger signum -> {sv, en} översättning ur rundata.sql (Evighetsrunor) via
//   translations.inscriptionid -> signum_inscription(inscriptionid->signumid)
//   -> signa(signumid -> signum-text), matchat mot runic_inscriptions.signum.
// Fyller runic_inscriptions.translation_sv/translation_en DÄR de saknas (rör inte
// befintliga 249). Emitterar scripts/data/rundata-translations-crosswalk.sql.
// Kör: node scripts/crosswalk-rundata-translations.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync('rundata.sql', 'utf8').split('\n'); // utf8mb4 -> läs som UTF-8

// --- Robust parser för en MySQL VALUES-tupel: splittra på toppnivå-komman,
//     respektera '..'-strängar med \-escape. X'HEX' funkar (X + citerad sträng). ---
function splitTuple(body) {
  const fields = [];
  let cur = '';
  let inStr = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      if (ch === '\\') { cur += ch + (body[i + 1] ?? ''); i++; continue; }
      if (ch === "'") { inStr = false; cur += ch; continue; }
      cur += ch;
    } else {
      if (ch === "'") { inStr = true; cur += ch; continue; }
      if (ch === ',') { fields.push(cur); cur = ''; continue; }
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

// Avkoda ett MySQL-strängfält ('..' med \-escape) till råtext.
function unquote(field) {
  const f = field.trim();
  if (f === 'NULL') return null;
  if (!f.startsWith("'")) return f; // X'..' eller enum utan yttre '
  const inner = f.slice(1, -1);
  return inner
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\\\/g, '\\');
}
const hexOf = (field) => { const m = field.match(/X'([0-9A-Fa-f]+)'/); return m ? m[1].toUpperCase() : null; };

let cur = null;
const inscToSignumIds = new Map(); // inscriptionid -> [{signumid, canonical}]
const signumText = new Map();      // signumid -> "signum1 signum2"
const trans = new Map();           // inscriptionid -> {sv?, en?} (föredrar translation='P')
const transRank = new Map();       // inscriptionid+lang -> bästa rank hittills (P bäst)

const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;

for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;

  if (cur === 'signum_inscription') {
    const c = line.match(reSigIn);
    if (c) {
      const [, , signumid, inscriptionid, canonical] = c;
      if (!inscToSignumIds.has(inscriptionid)) inscToSignumIds.set(inscriptionid, []);
      inscToSignumIds.get(inscriptionid).push({ signumid, canonical: +canonical });
    }
  } else if (cur === 'signa') {
    const c = line.match(reSigna);
    if (c) signumText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim());
  } else if (cur === 'translations') {
    // tupel: (translationid, inscriptionid, translation, text, teitext, language)
    let body = line.replace(/\),?\s*$/, '').replace(/^\(/, '');
    const f = splitTuple(body);
    if (f.length < 6) continue;
    const inscriptionid = hexOf(f[1]);
    const readingMark = unquote(f[2]); // P,Q,R...
    const text = unquote(f[3]);
    const lang = (unquote(f[5]) || '').toLowerCase();
    if (!inscriptionid || !text) continue;
    const langKey = lang.startsWith('sv') ? 'sv' : lang.startsWith('en') ? 'en' : null;
    if (!langKey) continue;
    // Rank: 'P' (primär läsning) bäst, annars alfabetiskt tidigast.
    const rank = readingMark === 'P' ? 0 : (readingMark ? readingMark.charCodeAt(0) : 99);
    const rk = `${inscriptionid}|${langKey}`;
    if (transRank.has(rk) && transRank.get(rk) <= rank) continue;
    transRank.set(rk, rank);
    if (!trans.has(inscriptionid)) trans.set(inscriptionid, {});
    trans.get(inscriptionid)[langKey] = text;
  }
}

// inscriptionid -> signum-text (föredra canonical)
function signumFor(inscriptionid) {
  const sigs = inscToSignumIds.get(inscriptionid);
  if (!sigs) return null;
  const sorted = [...sigs].sort((a, b) => b.canonical - a.canonical);
  for (const s of sorted) { const t = signumText.get(s.signumid); if (t) return t; }
  return null;
}

// signum -> {sv, en} (en post per signum; om flera inskrifter delar signum, sista vinner)
const sigTrans = new Map();
for (const [inscriptionid, t] of trans) {
  const sig = signumFor(inscriptionid);
  if (!sig) continue;
  const prev = sigTrans.get(sig) || {};
  sigTrans.set(sig, { sv: t.sv ?? prev.sv, en: t.en ?? prev.en });
}

const rows = [...sigTrans.entries()].filter(([, v]) => v.sv || v.en);
const esc = (s) => (s == null ? 'NULL' : `'${s.replace(/'/g, "''")}'`);
const values = rows.map(([sig, v]) => `(${esc(sig)},${esc(v.sv ?? null)},${esc(v.en ?? null)})`).join(',\n');

const out = `-- Översättnings-crosswalk ur rundata.sql (Evighetsrunor). Auto-genererat.
-- ${rows.length} signum-par. Fyller runic_inscriptions.translation_sv/translation_en
-- DÄR de saknas (rör inte befintliga icke-tomma). Matchar på normaliserat signum.
-- Ren data-UPDATE (ingen DDL) — kör i SQL-editorn, ingen migration repair behövs.
update public.runic_inscriptions ri
set translation_sv = coalesce(nullif(ri.translation_sv,''), cw.sv),
    translation_en = coalesce(nullif(ri.translation_en,''), cw.en)
from (values
${values}
) as cw(signum, sv, en)
where lower(regexp_replace(ri.signum,'\\s+',' ','g')) = lower(regexp_replace(cw.signum::text,'\\s+',' ','g'))
  and ((ri.translation_sv is null or ri.translation_sv = '') and cw.sv is not null
    or (ri.translation_en is null or ri.translation_en = '') and cw.en is not null);
`;

writeFileSync('scripts/data/rundata-translations-crosswalk.sql', out);
const svCount = rows.filter(([, v]) => v.sv).length;
const enCount = rows.filter(([, v]) => v.en).length;
console.log(`signum_inscription groups: ${inscToSignumIds.size}  signa: ${signumText.size}`);
console.log(`inscriptions med översättning: ${trans.size}`);
console.log(`DISTINCT signum->översättning: ${rows.length}  (sv: ${svCount}, en: ${enCount})`);
console.log('Sample:', rows.slice(0, 4).map(([s, v]) => `${s}: sv=${v.sv?.slice(0, 30)} | en=${v.en?.slice(0, 30)}`));
console.log('Wrote scripts/data/rundata-translations-crosswalk.sql');

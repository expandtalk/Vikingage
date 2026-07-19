// Bygger signum -> normalisering ur rundata.sql (interpretations-tabellen).
// interpretations.text = normaliserad fornnordisk form (t.ex. "Þorgerðr lét reisa
// stein…") — mappar till runic_inscriptions.normalization (visas i InscriptionDetail).
// Via interpretations.inscriptionid -> signum_inscription -> signa -> signum.
// Fyller normalization DÄR den saknas (primär tolkning 'P'). Ingen ny tabell behövs.
// Emitterar scripts/data/rundata-interpretations-crosswalk.sql. Ren data-UPDATE.
// Kör: node scripts/crosswalk-rundata-interpretations.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync('rundata.sql', 'utf8').split('\n');

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
function unquote(field) {
  const f = field.trim();
  if (f === 'NULL') return null;
  if (!f.startsWith("'")) return f;
  return f.slice(1, -1)
    .replace(/\\'/g, "'").replace(/\\"/g, '"')
    .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\\\/g, '\\');
}
const hexOf = (field) => { const m = field.match(/X'([0-9A-Fa-f]+)'/); return m ? m[1].toUpperCase() : null; };

let cur = null;
const inscToSignumIds = new Map();
const signumText = new Map();
const interp = new Map();      // inscriptionid -> text (föredra 'P')
const interpRank = new Map();

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
  } else if (cur === 'interpretations') {
    // (interpretationid, inscriptionid, interpretation, text, teitext, language)
    const body = line.replace(/\),?\s*$/, '').replace(/^\(/, '');
    const f = splitTuple(body);
    if (f.length < 4) continue;
    const inscriptionid = hexOf(f[1]);
    const mark = unquote(f[2]);
    const text = unquote(f[3]);
    if (!inscriptionid || !text) continue;
    const rank = mark === 'P' ? 0 : (mark ? mark.charCodeAt(0) : 99);
    if (interpRank.has(inscriptionid) && interpRank.get(inscriptionid) <= rank) continue;
    interpRank.set(inscriptionid, rank);
    interp.set(inscriptionid, text);
  }
}

function signumFor(inscriptionid) {
  const sigs = inscToSignumIds.get(inscriptionid);
  if (!sigs) return null;
  for (const s of [...sigs].sort((a, b) => b.canonical - a.canonical)) {
    const t = signumText.get(s.signumid); if (t) return t;
  }
  return null;
}

const sigInterp = new Map();
for (const [inscriptionid, text] of interp) {
  const sig = signumFor(inscriptionid);
  if (sig && !sigInterp.has(sig)) sigInterp.set(sig, text);
}

const rows = [...sigInterp.entries()];
const esc = (s) => `'${s.replace(/'/g, "''")}'`;
const values = rows.map(([sig, t]) => `(${esc(sig)},${esc(t)})`).join(',\n');

const out = `-- Interpretation-/normaliserings-crosswalk ur rundata.sql (interpretations-tabellen).
-- ${rows.length} signum-par. Fyller runic_inscriptions.normalization DÄR den saknas
-- (primär tolkning 'P', fornnordisk normalform). Matchar på normaliserat signum.
-- Ren data-UPDATE — kör i editorn. Syns i InscriptionDetail (normalisering).
update public.runic_inscriptions ri
set normalization = cw.norm
from (values
${values}
) as cw(signum, norm)
where lower(regexp_replace(ri.signum,'\\s+',' ','g')) = lower(regexp_replace(cw.signum::text,'\\s+',' ','g'))
  and (ri.normalization is null or ri.normalization = '');
`;

writeFileSync('scripts/data/rundata-interpretations-crosswalk.sql', out);
console.log(`interpretations (inskrifter): ${interp.size}  DISTINCT signum->normalization: ${rows.length}`);
console.log('Sample:', rows.slice(0, 4).map(([s, t]) => `${s}: ${t.slice(0, 45)}`));
console.log('Wrote scripts/data/rundata-interpretations-crosswalk.sql');

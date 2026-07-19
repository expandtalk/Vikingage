// Bygger signum -> transliteration ur rundata.sql (readings-tabellen) via
//   readings.inscriptionid -> signum_inscription -> signa -> signum.
// Fyller runic_inscriptions.transliteration DÄR den saknas (primär läsning 'P').
// Emitterar scripts/data/rundata-readings-crosswalk.sql. Ren data-UPDATE.
// Kör: node scripts/crosswalk-rundata-readings.mjs
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
const reading = new Map();      // inscriptionid -> text (föredra 'P')
const readingRank = new Map();  // inscriptionid -> bästa rank

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
  } else if (cur === 'readings') {
    // (readingid, inscriptionid, reading, text, teitext)
    const body = line.replace(/\),?\s*$/, '').replace(/^\(/, '');
    const f = splitTuple(body);
    if (f.length < 4) continue;
    const inscriptionid = hexOf(f[1]);
    const mark = unquote(f[2]);
    const text = unquote(f[3]);
    if (!inscriptionid || !text) continue;
    const rank = mark === 'P' ? 0 : (mark ? mark.charCodeAt(0) : 99);
    if (readingRank.has(inscriptionid) && readingRank.get(inscriptionid) <= rank) continue;
    readingRank.set(inscriptionid, rank);
    reading.set(inscriptionid, text);
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

const sigReading = new Map();
for (const [inscriptionid, text] of reading) {
  const sig = signumFor(inscriptionid);
  if (sig && !sigReading.has(sig)) sigReading.set(sig, text);
}

const rows = [...sigReading.entries()];
const esc = (s) => `'${s.replace(/'/g, "''")}'`;
const values = rows.map(([sig, t]) => `(${esc(sig)},${esc(t)})`).join(',\n');

const out = `-- Reading-/transliteration-crosswalk ur rundata.sql (readings-tabellen).
-- ${rows.length} signum-par. Fyller runic_inscriptions.transliteration DÄR den saknas
-- (primär läsning 'P'). Matchar på normaliserat signum. Ren data-UPDATE — kör i editorn.
update public.runic_inscriptions ri
set transliteration = cw.translit
from (values
${values}
) as cw(signum, translit)
where lower(regexp_replace(ri.signum,'\\s+',' ','g')) = lower(regexp_replace(cw.signum::text,'\\s+',' ','g'))
  and (ri.transliteration is null or ri.transliteration = '');
`;

writeFileSync('scripts/data/rundata-readings-crosswalk.sql', out);
console.log(`readings (inskrifter): ${reading.size}  DISTINCT signum->translit: ${rows.length}`);
console.log('Sample:', rows.slice(0, 5).map(([s, t]) => `${s}: ${t.slice(0, 40)}`));
console.log('Wrote scripts/data/rundata-readings-crosswalk.sql');

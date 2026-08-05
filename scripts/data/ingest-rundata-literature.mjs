#!/usr/bin/env node
// Ingest av litteraturreferenser ur Rundata-dumpen (rundata.sql) → runic_inscriptions.bibliography.
//
// Join-väg (bara populerade bastabeller; objects_signa* är tomma views i dumpen):
//   signa (signumid → signum1/signum2)
//     → signum_inscription (signumid → inscriptionid)
//       → inscriptions (inscriptionid → objectid, 1:1)
//         → object_source (objectid → sourceid, M:N)
//           → sources (sourceid → title/author/year/abbreviation)
//
// bibliography är JSONB (lagrar en JSON-sträng) → sätts via to_jsonb('...'::text).
// Skriver INTE över befintlig bibliografi (guard i WHERE).
//
// Användning:
//   node scripts/data/ingest-rundata-literature.mjs M        # bara signum1='M' (Medelpad)
//   node scripts/data/ingest-rundata-literature.mjs ALL      # hela korpusen
// Output: scripts/data/rundata-literature-<prefix>.sql (+ statistik på stderr)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DUMP = path.join(__dirname, '..', '..', 'rundata.sql');
const arg = (process.argv[2] || 'M').trim();
const MODE = (process.argv[3] || 'biblio').trim(); // 'biblio' | 'objsource' | 'transl'
const TAG = { objsource: 'objectsource', transl: 'translation' }[MODE] || 'literature';
const OUT = path.join(__dirname, `rundata-${TAG}-${arg === 'ALL' ? 'all' : arg}.sql`);

const sql = fs.readFileSync(DUMP, 'utf8');

// ---- Generisk tokenizer för mysqldump-VALUES ----
// Returnerar array av rader (varje rad = array av fält; sträng | null | {hex}).
function extractRows(table) {
  const rows = [];
  const marker = 'INSERT INTO `' + table + '`';
  let idx = 0;
  while ((idx = sql.indexOf(marker, idx)) !== -1) {
    let i = sql.indexOf('VALUES', idx);
    if (i === -1) break;
    i += 'VALUES'.length;
    // parsa tuple-lista tills statement-avslutande ';'
    while (i < sql.length) {
      // hoppa whitespace och kommatecken mellan tuples
      while (i < sql.length && /[\s,]/.test(sql[i])) i++;
      if (sql[i] === ';') { i++; break; }
      if (sql[i] !== '(') { i++; continue; }
      // parsa en tuple
      i++; // efter '('
      const fields = [];
      while (i < sql.length) {
        while (i < sql.length && /\s/.test(sql[i])) i++;
        const c = sql[i];
        if (c === ')') { i++; break; }
        if (c === "'") {
          // strängliteral med backslash-escapes
          let s = ''; i++;
          while (i < sql.length) {
            const ch = sql[i];
            if (ch === '\\') {
              const n = sql[i + 1];
              const map = { n: '\n', r: '\r', t: '\t', '0': '', Z: '', '\\': '\\', "'": "'", '"': '"' };
              s += (n in map) ? map[n] : n;
              i += 2; continue;
            }
            if (ch === "'") {
              if (sql[i + 1] === "'") { s += "'"; i += 2; continue; } // '' escaping
              i++; break;
            }
            s += ch; i++;
          }
          fields.push(s);
        } else if ((c === 'X' || c === 'x') && sql[i + 1] === "'") {
          let h = ''; i += 2;
          while (i < sql.length && sql[i] !== "'") { h += sql[i]; i++; }
          i++; // efter avslutande '
          fields.push({ hex: h.toUpperCase() });
        } else {
          // NULL eller tal/token
          let t = '';
          while (i < sql.length && !/[,)]/.test(sql[i])) { t += sql[i]; i++; }
          t = t.trim();
          fields.push(t.toUpperCase() === 'NULL' ? null : t);
        }
        // hoppa till ',' eller ')'
        while (i < sql.length && /\s/.test(sql[i])) i++;
        if (sql[i] === ',') { i++; continue; }
        if (sql[i] === ')') { i++; break; }
      }
      rows.push(fields);
    }
    idx = i;
  }
  return rows;
}

const hx = (v) => (v && typeof v === 'object' && v.hex) ? v.hex : v;

console.error('Parsar tabeller ur dumpen…');
// sources: (sourceid, title, author, year, abbreviation)
const sources = new Map();
for (const r of extractRows('sources')) {
  sources.set(hx(r[0]), { title: r[1], author: r[2], year: r[3], abbr: r[4] });
}
// object_source: (objectid, sourceid)
const objSources = new Map(); // objectid -> Set(sourceid)
for (const r of extractRows('object_source')) {
  const o = hx(r[0]), s = hx(r[1]);
  if (!objSources.has(o)) objSources.set(o, new Set());
  objSources.get(o).add(s);
}
// inscriptions: (inscriptionid, objectid, ...)
const inscToObj = new Map();
for (const r of extractRows('inscriptions')) inscToObj.set(hx(r[0]), hx(r[1]));
// signum_inscription: (signuminscriptionid, signumid, inscriptionid, canonical)
const signumidToInsc = new Map(); // signumid -> Set(inscriptionid)
for (const r of extractRows('signum_inscription')) {
  const sid = hx(r[1]), iid = hx(r[2]);
  if (!signumidToInsc.has(sid)) signumidToInsc.set(sid, new Set());
  signumidToInsc.get(sid).add(iid);
}
// signa: (signumid, signum1, signum2)
const signa = extractRows('signa').map((r) => ({ signumid: hx(r[0]), s1: r[1], s2: r[2] }));
// translations: (translationid, inscriptionid, translation-variant, text, teitext, language)
// Behåll svenska (sv-se). `text` = ren text (teitext = TEI-markup, ignoreras). Prioritera variant 'P'.
const translSv = new Map(); // inscriptionid -> {text, variant}
if (MODE === 'transl') {
  for (const r of extractRows('translations')) {
    if (r[5] !== 'sv-se' || !r[3]) continue;
    const iid = hx(r[1]), variant = r[2], text = r[3];
    const cur = translSv.get(iid);
    if (!cur || (variant === 'P' && cur.variant !== 'P')) translSv.set(iid, { text, variant });
  }
}

console.error(`  sources=${sources.size} object_source=${objSources.size} inscriptions=${inscToObj.size} signum_inscription=${signumidToInsc.size} signa=${signa.length}`);

// ---- Bygg citat per signum ----
function citation(src) {
  const title = (src.title || '').trim();
  const author = (src.author || '').trim();
  const year = (src.year || '').trim();
  let base = author ? (title ? `${author}, ${title}` : author) : title;
  if (!base) base = (src.abbr || '').trim();       // sista utväg: rå siglum
  if (year && !base.includes(year)) base += ` (${year})`;
  return base.replace(/\s+/g, ' ').trim();
}
const yearNum = (s) => { const m = /(\d{4})/.exec(s.year || s.abbr || ''); return m ? +m[1] : 9999; };

const sqlEsc = (s) => s.replace(/'/g, "''");
let updates = [], pairs = [], nSign = 0, nWith = 0;

for (const sg of signa) {
  if (arg !== 'ALL' && sg.s1 !== arg) continue;
  const signum = `${sg.s1} ${sg.s2}`;
  nSign++;
  const iids = signumidToInsc.get(sg.signumid);
  if (!iids) continue;
  const srcIds = new Set();
  for (const iid of iids) {
    const obj = inscToObj.get(iid);
    if (!obj) continue;
    const ss = objSources.get(obj);
    if (ss) for (const s of ss) srcIds.add(s);
  }
  if (MODE !== 'transl' && !srcIds.size) continue;
  nWith++;

  if (MODE === 'transl') {
    // Svensk översättning för denna signums inskrift(er). Prioritera variant 'P'.
    let best = null;
    for (const iid of iids) {
      const t = translSv.get(iid);
      if (t && (!best || (t.variant === 'P' && best.variant !== 'P'))) best = t;
    }
    if (!best) continue;
    updates.push(
      `UPDATE runic_inscriptions SET translation_sv = '${sqlEsc(best.text)}'\n` +
      `WHERE signum = '${sqlEsc(signum)}' AND (translation_sv IS NULL OR translation_sv = '');`
    );
  } else if (MODE === 'objsource') {
    // Samla (signum, sourceHex)-par → ETT set-baserat INSERT nedan.
    for (const hex of srcIds) pairs.push([signum, hex.toLowerCase()]);
  } else {
    const refs = [...srcIds].map((id) => sources.get(id)).filter(Boolean)
      .sort((a, b) => yearNum(a) - yearNum(b) || citation(a).localeCompare(citation(b), 'sv'));
    const seen = new Set();
    const list = refs.map(citation).filter((c) => c && !seen.has(c) && seen.add(c));
    if (!list.length) continue;
    const biblio = list.join('; ');
    updates.push(
      `UPDATE runic_inscriptions SET bibliography = to_jsonb('${sqlEsc(biblio)}'::text)\n` +
      `WHERE signum = '${sqlEsc(signum)}' AND (bibliography IS NULL OR bibliography::text IN ('null','""','[]','{}'));`
    );
  }
}

if (MODE === 'objsource' && pairs.length) {
  // ETT set-baserat INSERT: object_source.objectid = runic_inscriptions.id (FK fk_object).
  const values = pairs.map(([sig, h]) => `('${sqlEsc(sig)}','${h}')`).join(',\n ');
  updates = [
    `INSERT INTO object_source (objectid, sourceid)\n` +
    `SELECT ri.id, decode(v.h,'hex') FROM (VALUES\n ${values}\n) AS v(signum,h)\n` +
    `JOIN runic_inscriptions ri ON ri.signum = v.signum\n` +
    `WHERE EXISTS (SELECT 1 FROM sources s WHERE s.sourceid = decode(v.h,'hex'))\n` +
    `  AND NOT EXISTS (SELECT 1 FROM object_source o WHERE o.objectid = ri.id AND o.sourceid = decode(v.h,'hex'));`
  ];
}

const what = MODE === 'objsource' ? `${pairs.length} inskrift↔källa-par (object_source)` : 'litteraturreferenser → bibliography';
const header = `-- Rundata ${what}\n` +
  `-- Genererad ur rundata.sql (${arg === 'ALL' ? 'hela korpusen' : "signum1='" + arg + "'"}).\n` +
  `-- ${nWith} av ${nSign} signum fick referenser.\n\n`;
fs.writeFileSync(OUT, header + updates.join('\n') + '\n');
console.error(`Klart: ${nWith}/${nSign} signum med referenser → ${path.relative(process.cwd(), OUT)}`);

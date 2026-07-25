// Audit + fix av korrupta transliteration-kolumner i runic_inscriptions.
//
// Bakgrund: en delmängd inskrifter har fått en NORMALISERAD parafras (versala namn,
// moderna ordformer) i transliteration-slotten i st.f. den runologiska läsningen
// (upptäckt på Rökstenen Ög 136). Sanningskälla = rundata.sql (readings-tabellen,
// primärläsning 'P') — samma källa som DB:n importerades ur.
//
// Metod: bygg signum -> dumpläsning, jämför mot DB:s transliteration med trigram-
// likhet. Låg likhet mot den auktoritativa läsningen = korrupt/fel. Rapport default;
// --apply skriver dumpläsningen till de flaggade raderna.
//
// Kör:  node scripts/data/fix-corrupt-transliterations.mjs [--apply] [--threshold 0.45]

import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const THRESH = Number((process.argv.find(a => a.startsWith('--threshold=')) || '').split('=')[1]) ||
               (process.argv.includes('--threshold') ? Number(process.argv[process.argv.indexOf('--threshold') + 1]) : 0.45);

// ---------- 1) parsa rundata.sql -> signum -> primärläsning (från crosswalk-readings) ----------
const lines = readFileSync('rundata.sql', 'utf8').split('\n');
function splitTuple(body) {
  const f = []; let cur = '', inStr = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inStr) { if (ch === '\\') { cur += ch + (body[i + 1] ?? ''); i++; continue; } if (ch === "'") { inStr = false; cur += ch; continue; } cur += ch; }
    else { if (ch === "'") { inStr = true; cur += ch; continue; } if (ch === ',') { f.push(cur); cur = ''; continue; } cur += ch; }
  }
  f.push(cur); return f;
}
const unquote = (field) => {
  const f = field.trim();
  if (f === 'NULL') return null;
  if (!f.startsWith("'")) return f;
  return f.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\\\/g, '\\');
};
const hexOf = (field) => { const m = field.match(/X'([0-9A-Fa-f]+)'/); return m ? m[1].toUpperCase() : null; };
const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;

let cur = null;
const inscToSignumIds = new Map(), signumText = new Map(), reading = new Map(), readingRank = new Map();
for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;
  if (cur === 'signum_inscription') {
    const c = line.match(reSigIn);
    if (c) { const [, , signumid, inscriptionid, canonical] = c; if (!inscToSignumIds.has(inscriptionid)) inscToSignumIds.set(inscriptionid, []); inscToSignumIds.get(inscriptionid).push({ signumid, canonical: +canonical }); }
  } else if (cur === 'signa') {
    const c = line.match(reSigna);
    if (c) signumText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim());
  } else if (cur === 'readings') {
    const body = line.replace(/\),?\s*$/, '').replace(/^\(/, '');
    const f = splitTuple(body);
    if (f.length < 4) continue;
    const inscriptionid = hexOf(f[1]); const mark = unquote(f[2]); const text = unquote(f[3]);
    if (!inscriptionid || !text) continue;
    const rank = mark === 'P' ? 0 : (mark ? mark.charCodeAt(0) : 99);
    if (readingRank.has(inscriptionid) && readingRank.get(inscriptionid) <= rank) continue;
    readingRank.set(inscriptionid, rank); reading.set(inscriptionid, text);
  }
}
function signumFor(inscriptionid) {
  const sigs = inscToSignumIds.get(inscriptionid); if (!sigs) return null;
  for (const s of [...sigs].sort((a, b) => b.canonical - a.canonical)) { const t = signumText.get(s.signumid); if (t) return t; }
  return null;
}
const normSig = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
// Räkna hur många DISTINKTA inskrifter varje signum mappar till → använd bara ENTYDIGA
// (annars matchas t.ex. gotländska G-signum mot fel läsning = falska larm).
const sigToInsc = new Map();
for (const inscriptionid of reading.keys()) { const sig = signumFor(inscriptionid); if (!sig) continue; const k = normSig(sig); if (!sigToInsc.has(k)) sigToInsc.set(k, new Set()); sigToInsc.get(k).add(inscriptionid); }
const sigReading = new Map();
for (const [inscriptionid, text] of reading) { const sig = signumFor(inscriptionid); if (!sig) continue; const k = normSig(sig); if (sigToInsc.get(k).size === 1) sigReading.set(k, text); }
console.log(`Dump: ${sigReading.size} ENTYDIGA signum -> primärläsning (av ${sigToInsc.size} totalt).`);

// ORDINITIAL versal + gemener (t.ex. "Rök", "Ulvkettil", "Kurmr") = normaliserad parafras/
// översättning i translit-slotten. Skiljer från legitim ʀ-notation MITT i ord (kaiRilf,
// aftiR) som annars ger falska larm. Legitimt för dalrunor/medeltid → därför krävs OCKSÅ
// att dumpens läsning saknar signaturen (nedan).
const hasCapWord = (s) => /(^|[\s:·×+*¶.])[A-ZÅÄÖ][a-zåäö][a-zåäö]/.test(s || '');

// ---------- 2) likhet ----------
const clean = (s) => (s || '').toLowerCase().replace(/[^0-9a-zåäöæøðþʀąõ]/g, '');
function tris(s) { const g = new Set(); for (let i = 0; i < s.length - 2; i++) g.add(s.slice(i, i + 3)); return g; }
function sim(a, b) { a = clean(a); b = clean(b); if (a.length < 3 || b.length < 3) return a === b ? 1 : 0; const A = tris(a), B = tris(b); let inter = 0; for (const x of A) if (B.has(x)) inter++; return inter / (A.size + B.size - inter); }

// ---------- 3) DB ----------
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
await client.connect();
try {
  const { rows } = await client.query(`SELECT id, signum, rundata_signum, primary_signum, alternative_signum, transliteration, normalization FROM runic_inscriptions WHERE transliteration IS NOT NULL AND transliteration <> ''`);
  const flagged = [];
  let matched = 0;
  for (const r of rows) {
    const cands = [r.primary_signum, r.rundata_signum, r.signum, ...(r.alternative_signum || [])].filter(Boolean).map(normSig);
    let dump = null;
    for (const cvar of cands) { if (sigReading.has(cvar)) { dump = sigReading.get(cvar); break; } }
    if (!dump) continue;
    matched++;
    const sTr = sim(r.transliteration, dump);         // DB-translit vs auktoritativ läsning
    if (sTr >= THRESH) continue;                        // matchar bra -> OK
    // Parafras-signatur: DB har versalt ord MEN dumpläsningen är gemen (versaler ej legitima här).
    if (!(hasCapWord(r.transliteration) && !hasCapWord(dump))) continue;
    const sNorm = r.normalization ? sim(r.transliteration, r.normalization) : 0; // liknar den normaliseringen?
    flagged.push({ id: r.id, sig: r.primary_signum || r.rundata_signum || r.signum, sTr, sNorm, cur: r.transliteration, dump });
  }
  flagged.sort((a, b) => a.sTr - b.sTr);
  console.log(`Matchade DB↔dump: ${matched}.  FLAGGADE (likhet < ${THRESH}): ${flagged.length}\n`);
  for (const f of flagged.slice(0, 40)) {
    console.log(`${(f.sig || '?').padEnd(11)} sim(dump)=${f.sTr.toFixed(2)} sim(norm)=${f.sNorm.toFixed(2)}`);
    console.log(`   NU:   ${f.cur.replace(/\s+/g, ' ').slice(0, 80)}`);
    console.log(`   DUMP: ${f.dump.replace(/\s+/g, ' ').slice(0, 80)}`);
  }
  if (flagged.length > 40) console.log(`… + ${flagged.length - 40} till.`);

  if (!APPLY) { console.log('\nDRY-RUN — inget skrivet. Kör med --apply för att ersätta translit med dumpläsningen.'); }
  else {
    let n = 0;
    for (const f of flagged) { const res = await client.query(`UPDATE runic_inscriptions SET transliteration = $1, updated_at = now() WHERE id = $2`, [f.dump, f.id]); n += res.rowCount; }
    console.log(`\n✅ APPLY: ${n} transliteration-kolumner korrigerade från rundata-dumpen.`);
  }
} finally { await client.end(); }

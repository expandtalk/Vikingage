// Bygger signum -> {socken, härad} ur rundata.sql via kedjan
//   signum <- signa <- signum_inscription <- inscriptions -> objects.placeid
//   -> place_parish(current=1).parishid -> parishes(parish, hundredid) -> hundreds(hundred)
// Emitterar supabase/migrations/20260718130000_parish_harad_crosswalk.sql (ALTER + UPDATE).
// Kör: node scripts/crosswalk-rundata-parish.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const lines = readFileSync('rundata.sql', 'utf8').split('\n'); // utf8mb4-dump → läs som UTF-8 (åäö i socken-/häradsnamn + signum)

let cur = null;
const objPlace = new Map();        // objectid -> placeid
const objToInsc = new Map();       // objectid -> inscriptionid
const inscToSignumIds = new Map(); // inscriptionid -> [signumid]
const signumText = new Map();      // signumid -> "signum1 signum2"
const placeParish = new Map();     // placeid -> {parishid, current}
const parishInfo = new Map();      // parishid -> {socken, hundredid}
const hundredName = new Map();     // hundredid -> hundred

const reTwoHex   = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)'/;                         // objects(objectid,placeid) / inscriptions(inscriptionid,objectid)
const reSigIn    = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/; // signuminscriptionid, signumid, inscriptionid, canonical
const reSigna    = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;
const rePlacePar = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/; // placeparishid, placeid, parishid, current
const reParish   = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',(?:NULL|'(?:[^'\\]|\\.)*'),'((?:[^'\\]|\\.)*)'\)/; // parishid, hundredid, municipalityid, toraid, parish
const reHundred  = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)','((?:[^'\\]|\\.)*)'\)/; // hundredid, provinceid, divisionid, hundred

const cleanName = (s) => s.replace(/\s+(sogn|socken|sn|församling|par\.?|parish)\.?$/i, '').trim();

for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;
  let c;
  if (cur === 'objects' && (c = line.match(reTwoHex))) objPlace.set(c[1], c[2]);
  else if (cur === 'inscriptions' && (c = line.match(reTwoHex))) objToInsc.set(c[2], c[1]); // objectid->inscriptionid
  else if (cur === 'signum_inscription' && (c = line.match(reSigIn))) {
    if (!inscToSignumIds.has(c[3])) inscToSignumIds.set(c[3], []);
    inscToSignumIds.get(c[3]).push(c[2]);
  } else if (cur === 'signa' && (c = line.match(reSigna))) {
    signumText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim());
  } else if (cur === 'place_parish' && (c = line.match(rePlacePar))) {
    const prev = placeParish.get(c[2]);
    if (!prev || (c[4] === '1' && prev.current !== 1)) placeParish.set(c[2], { parishid: c[3], current: +c[4] });
  } else if (cur === 'parishes' && (c = line.match(reParish))) {
    parishInfo.set(c[1], { socken: cleanName(c[4]), hundredid: c[2] });
  } else if (cur === 'hundreds' && (c = line.match(reHundred))) {
    hundredName.set(c[1], cleanName(c[4]));
  }
}

// signum -> {socken, harad}
const sigParish = new Map();
for (const [objectid, placeid] of objPlace) {
  const pp = placeParish.get(placeid); if (!pp) continue;
  const pi = parishInfo.get(pp.parishid); if (!pi) continue;
  const socken = pi.socken;
  const harad = hundredName.get(pi.hundredid) || null;
  const inscid = objToInsc.get(objectid); if (!inscid) continue;
  const sigs = inscToSignumIds.get(inscid); if (!sigs) continue;
  for (const sid of sigs) { const t = signumText.get(sid); if (t) sigParish.set(t, { socken, harad }); }
}

const rows = [...sigParish.entries()];
// Dollar-citering ($$...$$) — Supabase-editorn av-dubblar '' till ' vid inklistring.
const dq = (s) => (s == null || s === '' ? 'NULL' : (String(s).includes('$$') ? `$q$${s}$q$` : `$$${s}$$`));
const values = rows.map(([sig, v]) => `(${dq(sig)},${dq(v.socken)},${dq(v.harad)})`).join(',\n');

const out = `-- Socken/härad-crosswalk ur rundata.sql (Evighetsrunor). Auto-genererat.
-- ${rows.length} signum-par. Lägger runic_inscriptions.socken + .harad (auktoritativt
-- ur RAÄ-datan via object->place->place_parish->parish->hundred). Enabler för
-- "sök socken/härad -> visa fynd". Kör i SQL-editorn, sedan migration repair 20260718130000.
alter table public.runic_inscriptions
  add column if not exists socken text,
  add column if not exists harad text;

update public.runic_inscriptions ri
set socken = cw.socken, harad = cw.harad
from (values
${values}
) as cw(signum, socken, harad)
where lower(regexp_replace(ri.signum,'\\s+',' ','g')) = lower(regexp_replace(cw.signum::text,'\\s+',' ','g'));
`;

writeFileSync('supabase/migrations/20260718130000_parish_harad_crosswalk.sql', out);
console.log(`objects: ${objPlace.size}  place_parish: ${placeParish.size}  parishes: ${parishInfo.size}  hundreds: ${hundredName.size}`);
console.log(`DISTINCT signum->socken/härad: ${rows.length}`);
console.log('Sample:', rows.slice(0, 6).map(([s, v]) => `${s} -> ${v.socken}/${v.harad}`));
console.log('Wrote supabase/migrations/20260718130000_parish_harad_crosswalk.sql');

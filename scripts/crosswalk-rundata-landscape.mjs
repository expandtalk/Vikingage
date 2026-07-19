// Bygger signum -> landskap ur rundata.sql via kedjan
//   signum <- signa <- signum_inscription <- inscriptions -> objects.placeid
//   -> place_parish(current=1).parishid -> parishes(hundredid)
//   -> hundreds(provinceid) -> provinces(province = landskap).
// Rättar runic_inscriptions.landscape + .province (opålitliga för Bautil-stenar,
// t.ex. B 100 = U 285 i Uppland stod felaktigt "Småland/Kalmar län"). rundata är
// auktoritativ. Emitterar scripts/data/rundata-landscape-crosswalk.sql (data-UPDATE).
// Kör: node scripts/crosswalk-rundata-landscape.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const lines = readFileSync('rundata.sql', 'utf8').split('\n');

let cur = null;
const objPlace = new Map();        // objectid -> placeid
const objToInsc = new Map();       // objectid -> inscriptionid
const inscToSignumIds = new Map(); // inscriptionid -> [signumid]
const signumText = new Map();      // signumid -> "signum1 signum2"
const placeParish = new Map();     // placeid -> {parishid, current}
const parishHundred = new Map();   // parishid -> hundredid
const hundredProvince = new Map(); // hundredid -> provinceid
const provinceName = new Map();    // provinceid -> landskap

const reTwoHex   = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)'/;
const reSigIn    = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
const reSigna    = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;
const rePlacePar = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/; // placeparishid, placeid, parishid, current
const reParish   = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',/;                          // parishid, hundredid, ...
const reHundred  = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',/;                          // hundredid, provinceid, ...
const reProvince = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)','((?:[^'\\]|\\.)*)'\)/;     // provinceid, countryid, province

for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;
  let c;
  if (cur === 'objects' && (c = line.match(reTwoHex))) objPlace.set(c[1], c[2]);
  else if (cur === 'inscriptions' && (c = line.match(reTwoHex))) objToInsc.set(c[2], c[1]);
  else if (cur === 'signum_inscription' && (c = line.match(reSigIn))) {
    if (!inscToSignumIds.has(c[3])) inscToSignumIds.set(c[3], []);
    inscToSignumIds.get(c[3]).push(c[2]);
  } else if (cur === 'signa' && (c = line.match(reSigna))) {
    signumText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim());
  } else if (cur === 'place_parish' && (c = line.match(rePlacePar))) {
    const prev = placeParish.get(c[2]);
    if (!prev || (c[4] === '1' && prev.current !== 1)) placeParish.set(c[2], { parishid: c[3], current: +c[4] });
  } else if (cur === 'parishes' && (c = line.match(reParish))) {
    parishHundred.set(c[1], c[2]);
  } else if (cur === 'hundreds' && (c = line.match(reHundred))) {
    hundredProvince.set(c[1], c[2]);
  } else if (cur === 'provinces' && (c = line.match(reProvince))) {
    provinceName.set(c[1], c[3]);
  }
}

// signum -> landskap
const sigLandscape = new Map();
for (const [objectid, placeid] of objPlace) {
  const pp = placeParish.get(placeid); if (!pp) continue;
  const hundredid = parishHundred.get(pp.parishid); if (!hundredid) continue;
  const provinceid = hundredProvince.get(hundredid); if (!provinceid) continue;
  const landskap = provinceName.get(provinceid); if (!landskap) continue;
  const inscid = objToInsc.get(objectid); if (!inscid) continue;
  const sigs = inscToSignumIds.get(inscid); if (!sigs) continue;
  for (const sid of sigs) { const t = signumText.get(sid); if (t) sigLandscape.set(t, landskap); }
}

// Bara riktiga svenska landskap — rundata sätter province = landkod ("GB-SCT")
// eller "Okänd" för icke-SE/DK, som inte ska hamna i landscape-kolumnen.
const SWEDISH_LANDSKAP = new Set([
  'Uppland', 'Södermanland', 'Östergötland', 'Västergötland', 'Småland', 'Öland',
  'Gotland', 'Bohuslän', 'Dalsland', 'Värmland', 'Närke', 'Västmanland', 'Dalarna',
  'Gästrikland', 'Hälsingland', 'Härjedalen', 'Jämtland', 'Medelpad', 'Ångermanland',
  'Västerbotten', 'Norrbotten', 'Lappland', 'Skåne', 'Halland', 'Blekinge',
]);
const rows = [...sigLandscape.entries()].filter(([, ls]) => SWEDISH_LANDSKAP.has(ls));
const esc = (s) => `'${s.replace(/'/g, "''")}'`;
const values = rows.map(([sig, ls]) => `(${esc(sig)},${esc(ls)})`).join(',\n');

const out = `-- Landskaps-crosswalk ur rundata.sql (auktoritativt: härad->provins->landskap).
-- ${rows.length} signum-par. Rättar runic_inscriptions.landscape + .province till
-- korrekt landskap (Bautil-stenar hade fel, t.ex. B 100 = U 285 stod "Småland").
-- Sätter BÅDA kolumnerna till landskapet (province höll ibland län, vilket var fel).
-- Ren data-UPDATE — kör i editorn.
update public.runic_inscriptions ri
set landscape = cw.landskap,
    province = cw.landskap
from (values
${values}
) as cw(signum, landskap)
where lower(regexp_replace(ri.signum,'\\s+',' ','g')) = lower(regexp_replace(cw.signum::text,'\\s+',' ','g'))
  and (ri.landscape is distinct from cw.landskap or ri.province is distinct from cw.landskap);
`;

writeFileSync('scripts/data/rundata-landscape-crosswalk.sql', out);
console.log(`objects: ${objPlace.size}  parishes: ${parishHundred.size}  hundreds: ${hundredProvince.size}  provinces: ${provinceName.size}`);
console.log(`DISTINCT signum->landskap: ${rows.length}`);
console.log('Sample:', rows.slice(0, 8).map(([s, l]) => `${s} -> ${l}`));
console.log('Wrote scripts/data/rundata-landscape-crosswalk.sql');

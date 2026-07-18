// Bygger signum -> (lat,lng) ur rundata.sql (Evighetsrunor) via kedjan
//   coordinates.objectid -> inscriptions(objectid=inscriptionid) ->
//   signum_inscription(inscriptionid->signumid) -> signa(signumid->signum1/2)
// Emitterar scripts/data/rundata-coordinate-crosswalk.sql (temp-tabell + UPDATE).
// Kör: node scripts/crosswalk-rundata-coordinates.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const sql = readFileSync('rundata.sql', 'latin1'); // dumpen är utf8mb4 men latin1-läsning bevarar bytes; vi rör bara ASCII-signum/hex/tal
const lines = sql.split('\n');

let cur = null;
const objCoord = new Map();      // objectid(hex) -> {lat,lng,current}
const objToInsc = new Map();     // objectid -> inscriptionid
const inscToSignumIds = new Map(); // inscriptionid -> [{signumid,canonical}]
const signumText = new Map();    // signumid -> "signum1 signum2"

const reCoord = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',([01]),(-?[\d.]+),(-?[\d.]+)\)/;
const reInsc  = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',/;
const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;

for (let raw of lines) {
  const line = raw.trim();
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  if (!line.startsWith('(')) continue;
  if (cur === 'coordinates') {
    const c = line.match(reCoord);
    if (c) {
      const [, , objectid, current, lat, lng] = c;
      const prev = objCoord.get(objectid);
      // föredra current=1
      if (!prev || (current === '1' && prev.current !== 1)) {
        objCoord.set(objectid, { lat: +lat, lng: +lng, current: +current });
      }
    }
  } else if (cur === 'inscriptions') {
    const c = line.match(reInsc);
    if (c) objToInsc.set(c[2], c[1]); // objectid -> inscriptionid
  } else if (cur === 'signum_inscription') {
    const c = line.match(reSigIn);
    if (c) {
      const [, , signumid, inscriptionid, canonical] = c;
      if (!inscToSignumIds.has(inscriptionid)) inscToSignumIds.set(inscriptionid, []);
      inscToSignumIds.get(inscriptionid).push({ signumid, canonical: +canonical });
    }
  } else if (cur === 'signa') {
    const c = line.match(reSigna);
    if (c) {
      const [, signumid, s1, s2] = c;
      signumText.set(signumid, `${s1} ${s2}`.replace(/\s+/g, ' ').trim());
    }
  }
}

// Bygg signum -> coord. Föredra canonical signum; mappa även alias (så alla former matchar).
const signumCoord = new Map();
let coordObjResolved = 0;
for (const [objectid, coord] of objCoord) {
  const inscid = objToInsc.get(objectid);
  if (!inscid) continue;
  const sigs = inscToSignumIds.get(inscid);
  if (!sigs) continue;
  coordObjResolved++;
  for (const { signumid } of sigs) {
    const txt = signumText.get(signumid);
    if (txt) signumCoord.set(txt, coord); // en coord per signum
  }
}

const rows = [...signumCoord.entries()];
const esc = (s) => s.replace(/'/g, "''");
const values = rows.map(([sig, c]) => `('${esc(sig)}',${c.lat},${c.lng})`).join(',\n');

// ETT enda UPDATE-statement med inline VALUES (ingen temp-tabell — Supabase-
// editorn kör satser så att en on-commit-drop-temptabell försvinner mellan dem).
const out = `-- Koordinat-crosswalk ur rundata.sql (Evighetsrunor). Auto-genererat.
-- ${rows.length} signum->koordinat-par. Fyller runic_inscriptions.coordinates där den
-- saknas ELLER har låg/okänd konfidens (RAÄ-koordinater är auktoritativa); rör inte
-- 'high'-konfidens (user/manual exakta). Matchar på normaliserat signum.
-- Ett enda statement — kör i SQL-editorn.
update public.runic_inscriptions ri
set coordinates = point(cw.lng::float8, cw.lat::float8),
    coord_source = 'rundata_evighetsrunor',
    coord_confidence = 'high'
from (values
${values}
) as cw(signum, lat, lng)
where lower(regexp_replace(ri.signum,'\\s+',' ','g')) = lower(regexp_replace(cw.signum::text,'\\s+',' ','g'))
  and (ri.coordinates is null or ri.coord_confidence in ('low','unknown'));
`;

writeFileSync('scripts/data/rundata-coordinate-crosswalk.sql', out);
console.log(`coordinates(obj): ${objCoord.size}  resolved to inscription: ${coordObjResolved}`);
console.log(`inscriptions: ${objToInsc.size}  signum_inscription groups: ${inscToSignumIds.size}  signa: ${signumText.size}`);
console.log(`DISTINCT signum->coord pairs: ${rows.length}`);
console.log(`Sample:`, rows.slice(0, 6).map(([s, c]) => `${s}=${c.lat},${c.lng}`));
console.log(`Wrote scripts/data/rundata-coordinate-crosswalk.sql`);

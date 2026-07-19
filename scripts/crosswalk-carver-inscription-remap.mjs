// Fixar de trasiga carver_inscription-länkarna. inscriptionid = rundata inscriptionid,
// men runic_inscriptions.id = objectid. Remappar via rundatas inscriptions(inscriptionid
// -> objectid) så att carver_inscription.inscriptionid blir = runic_inscriptions.id.
// exists-guard: bara där objectid faktiskt är en importerad inskrift. Idempotent
// (rader som redan pekar rätt matchar inte om-mappningen). Kör: node scripts/crosswalk-carver-inscription-remap.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync('rundata.sql', 'utf8').split('\n');
const reTwoHex = /^\(X'([0-9A-Fa-f]+)',X'([0-9A-Fa-f]+)'/; // inscriptions: (inscriptionid, objectid)
let cur = null;
const pairs = []; // [inscriptionid_hex, objectid_hex] (lowercase)
for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  if (cur !== 'inscriptions') continue;
  const line = raw.trim();
  if (!line.startsWith('(')) continue;
  const c = line.match(reTwoHex);
  if (c) pairs.push([c[1].toLowerCase(), c[2].toLowerCase()]);
}

const values = pairs.map(([i, o]) => `('${i}','${o}')`).join(',\n');
const sql = `-- Remappar carver_inscription.inscriptionid (rundata inscriptionid) -> objectid
-- (= runic_inscriptions.id). ${pairs.length} inscriptionid->objectid-par. Fixar de trasiga
-- ristar-sten-länkarna så get_carver_inscriptions upplöser dem. Idempotent. Kör i editorn.
update public.carver_inscription ci
set inscriptionid = decode(m.objid,'hex')
from (values
${values}
) as m(inscid, objid)
where ci.inscriptionid = decode(m.inscid,'hex')
  and exists (select 1 from public.runic_inscriptions r where replace(r.id::text,'-','') = m.objid)
  and not exists (
    select 1 from public.carver_inscription x
    where x.carverid = ci.carverid and x.inscriptionid = decode(m.objid,'hex')
  );
`;

writeFileSync('scripts/data/carver-inscription-remap.sql', sql);
console.log(`inscriptions-par: ${pairs.length}`);
console.log('Wrote scripts/data/carver-inscription-remap.sql');

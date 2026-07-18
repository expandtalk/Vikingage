// Bygger RÄTT reference_uri för appens hook (useInscriptionExtendedData), som
// antar reference_uri.reference_id = sourceid. Rundatas riktiga kedja är dock
//   inscriptions(inscriptionid,objectid) <- references(referenceid,inscriptionid)
//   <- reference_uri(referenceid,uriid) -> uris
// dvs URI:er är inskrifts-nivå (länkar till Runor/RAÄ), inte käll-nivå. Vi kopplar
// därför varje inskrifts URI:er till dess object_source-källor (sourceid), så att
// befintlig UI (källor med länkar) tänds utan frontend-ändring.
// Emitterar scripts/data/rundata-reference-uri-fixed.sql (ersätter tidigare rader).
// Kör: node scripts/crosswalk-rundata-inscription-uris.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync('rundata.sql', 'utf8').split('\n');
const reTwoHex   = /^\(X'([0-9A-Fa-f]+)',X'([0-9A-Fa-f]+)'/;                 // (a,b)
const reRefRow   = /^\(X'([0-9A-Fa-f]+)',X'([0-9A-Fa-f]+)',/;                // references: referenceid, inscriptionid, text...

let cur = null;
const inscToObj  = new Map();          // inscriptionid -> objectid
const objSources = new Map();          // objectid -> Set(sourceid)
const refToInsc  = new Map();          // referenceid -> inscriptionid
const refToUris  = new Map();          // referenceid -> Set(uriid)

for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;
  let c;
  if (cur === 'inscriptions' && (c = line.match(reTwoHex))) {
    inscToObj.set(c[1].toLowerCase(), c[2].toLowerCase());               // (inscriptionid, objectid)
  } else if (cur === 'object_source' && (c = line.match(reTwoHex))) {
    const o = c[1].toLowerCase(), s = c[2].toLowerCase();
    if (!objSources.has(o)) objSources.set(o, new Set());
    objSources.get(o).add(s);
  } else if (cur === 'references' && (c = line.match(reRefRow))) {
    refToInsc.set(c[1].toLowerCase(), c[2].toLowerCase());               // (referenceid, inscriptionid)
  } else if (cur === 'reference_uri' && (c = line.match(reTwoHex))) {
    const r = c[1].toLowerCase(), u = c[2].toLowerCase();
    if (!refToUris.has(r)) refToUris.set(r, new Set());
    refToUris.get(r).add(u);
  }
}

// Bygg distinkta (sourceid, uriid)-par
const pairs = new Set();
for (const [refid, uris] of refToUris) {
  const inscid = refToInsc.get(refid); if (!inscid) continue;
  const objid = inscToObj.get(inscid); if (!objid) continue;
  const sources = objSources.get(objid); if (!sources) continue;
  for (const sid of sources) for (const uid of uris) pairs.add(`${sid}|${uid}`);
}

const rows = [...pairs].map(p => p.split('|'));
const values = rows.map(([s, u]) => `('${s}','${u}')`).join(',\n');

const sql = `-- Rätt reference_uri för appens hook: reference_id = sourceid (bytea), uri_id (bytea).
-- Härlett via inscriptions(objectid) <- references(inscriptionid) <- reference_uri -> uris,
-- korsat med object_source. ${rows.length} distinkta (sourceid,uriid)-par. Ersätter tidigare rader.
-- Idempotent nog: tömmer först reference_uri (endast rundata-härledd data). Kör i editorn.
delete from public.reference_uri;
insert into public.reference_uri (reference_id, uri_id)
select decode(v.sid,'hex'), decode(v.uid,'hex')
from (values
${values}
) as v(sid, uid)
where exists (select 1 from public.sources s where s.sourceid = decode(v.sid,'hex'))
  and exists (select 1 from public.uris u where u.uriid = decode(v.uid,'hex'));
`;

writeFileSync('scripts/data/rundata-reference-uri-fixed.sql', sql);
console.log(`inscriptions:${inscToObj.size} object_source-obj:${objSources.size} references:${refToInsc.size} ref_uri-refs:${refToUris.size}`);
console.log(`distinkta (sourceid,uriid)-par: ${rows.length}`);
console.log('Wrote scripts/data/rundata-reference-uri-fixed.sql');

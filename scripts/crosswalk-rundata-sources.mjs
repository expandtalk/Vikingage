// Importerar object_source + reference_uri ur rundata.sql så käll-/URI-kedjan
// tänds i InscriptionDetail (useInscriptionExtendedData: object_source.objectid =
// inscription.id -> sources -> reference_uri.reference_id=sourceid -> uris).
// Endast binära id:n => hex via decode(...,'hex') + uuid-cast. Inga apostrofer
// (editor- och MCP-säkert). Emitterar scripts/data/rundata-object-source.sql
// och rundata-reference-uri.sql. Idempotent (WHERE NOT EXISTS).
// Kör: node scripts/crosswalk-rundata-sources.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync('rundata.sql', 'utf8').split('\n');
const reTwoHex = /^\(X'([0-9A-Fa-f]+)',X'([0-9A-Fa-f]+)'\)/;
let cur = null;
const objSrc = [];   // [objhex, srchex]
const refUri = [];   // [refhex, urihex]
for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;
  const c = line.match(reTwoHex);
  if (!c) continue;
  if (cur === 'object_source') objSrc.push([c[1].toLowerCase(), c[2].toLowerCase()]);
  else if (cur === 'reference_uri') refUri.push([c[1].toLowerCase(), c[2].toLowerCase()]);
}

const toUuid = (h) => h.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

// object_source: objectid uuid, sourceid bytea
const osValues = objSrc.map(([o, s]) => `('${toUuid(o)}','${s}')`).join(',\n');
const osSql = `-- object_source ur rundata.sql (${objSrc.length} rader). objectid=uuid (= runic_inscriptions.id
-- för nyimporterade), sourceid=bytea. Tänder käll-kopplingen. Idempotent. Kör i editorn eller MCP.
insert into public.object_source (objectid, sourceid)
select v.oid::uuid, decode(v.sid,'hex')
from (values
${osValues}
) as v(oid, sid)
where exists (select 1 from public.runic_inscriptions ri where ri.id = v.oid::uuid)          -- FK fk_object (-> runic_inscriptions)
  and exists (select 1 from public.sources s where s.sourceid = decode(v.sid,'hex'))          -- FK fk_source (-> sources)
  and not exists (select 1 from public.object_source os where os.objectid = v.oid::uuid and os.sourceid = decode(v.sid,'hex'));
`;

// reference_uri: reference_id bytea (= sourceid), uri_id bytea
const ruValues = refUri.map(([r, u]) => `('${r}','${u}')`).join(',\n');
const ruSql = `-- reference_uri ur rundata.sql (${refUri.length} rader). reference_id=sourceid (bytea),
-- uri_id (bytea). Kopplar källor -> URI:er. Idempotent. Kör i editorn eller MCP.
insert into public.reference_uri (reference_id, uri_id)
select decode(v.rid,'hex'), decode(v.uid,'hex')
from (values
${ruValues}
) as v(rid, uid)
where not exists (select 1 from public.reference_uri ru where ru.reference_id = decode(v.rid,'hex') and ru.uri_id = decode(v.uid,'hex'));
`;

writeFileSync('scripts/data/rundata-object-source.sql', osSql);
writeFileSync('scripts/data/rundata-reference-uri.sql', ruSql);
console.log(`object_source: ${objSrc.length} rader  reference_uri: ${refUri.length} rader`);
console.log('Wrote rundata-object-source.sql + rundata-reference-uri.sql');

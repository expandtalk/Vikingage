// Lyft ristare + RAÄ/FMIS-nummer + bildlänkar ur rundata-dumpen → runic_inscriptions.
// carvers/carver_inscription (attribution), object_her_SE→her_SE (raänr,fmisid), imagelinks.
// Kör: node scripts/data/ingest-runestone-metadata.mjs [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const lines = readFileSync('rundata.sql', 'utf8').split('\n');

const objToInsc = new Map(), inscToSig = new Map(), signumText = new Map();
const carverName = new Map();                 // carverid -> namn
const ciByInsc = new Map();                   // inscriptionid -> [{carverid, attribution, certainty}]
const objToHer = new Map();                   // objectid -> [her_SEid]
const herData = new Map();                    // her_SEid -> {raa, fmis}
const imgByObj = new Map();                   // objectid -> [url]

const reInsc = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',/;
const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;
const reCarv = /^\(X'([0-9A-F]+)',(NULL|'(?:[^'\\]|\\.)*')\)/;
const reCI   = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)','([^']*)',([01])/;
const reOHS  = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)'\)/;
const reHS   = /^\(X'([0-9A-F]+)',X'[0-9A-F]+','((?:[^'\\]|\\.)*)',(NULL|\d+)/;
const reImg  = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)','((?:[^'\\]|\\.)*)'/;
const unq = (s) => (s === 'NULL' || s == null ? null : s.replace(/^'|'$/g, '').replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
const ATTR_RANK = { signed: 3, 'signed on pair stone': 2, attributed: 1, similar: 0 };

let cur = null;
for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim(); if (!line.startsWith('(')) continue;
  if (cur === 'inscriptions') { const c = line.match(reInsc); if (c) objToInsc.set(c[2], c[1]); }
  else if (cur === 'signum_inscription') { const c = line.match(reSigIn); if (c) { if (!inscToSig.has(c[3])) inscToSig.set(c[3], []); inscToSig.get(c[3]).push({ signumid: c[2], canonical: +c[4] }); } }
  else if (cur === 'signa') { const c = line.match(reSigna); if (c) signumText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim()); }
  else if (cur === 'carvers') { const c = line.match(reCarv); if (c) { const n = unq(c[2]); if (n && !/^Samma som/i.test(n)) carverName.set(c[1], n); } }
  else if (cur === 'carver_inscription') { const c = line.match(reCI); if (c) { if (!ciByInsc.has(c[3])) ciByInsc.set(c[3], []); ciByInsc.get(c[3]).push({ carverid: c[2], attribution: c[4], certainty: +c[5] }); } }
  else if (cur === 'object_her_SE') { const c = line.match(reOHS); if (c) { if (!objToHer.has(c[1])) objToHer.set(c[1], []); objToHer.get(c[1]).push(c[2]); } }
  else if (cur === 'her_SE') { const c = line.match(reHS); if (c) herData.set(c[1], { raa: unq(c[2]), fmis: c[3] === 'NULL' ? null : +c[3] }); }
  else if (cur === 'imagelinks') { const c = line.match(reImg); if (c) { if (!imgByObj.has(c[2])) imgByObj.set(c[2], []); imgByObj.get(c[2]).push(unq(c[3])); } }
}
function primarySignum(inscid) {
  const sigs = inscToSig.get(inscid); if (!sigs) return null;
  const res = sigs.map((s) => ({ ...s, text: signumText.get(s.signumid) })).filter((s) => s.text);
  if (!res.length) return null; res.sort((a, b) => b.canonical - a.canonical); return res[0].text;
}
// bygg per signum
const bySig = new Map();
const ensure = (sig) => { if (!bySig.has(sig)) bySig.set(sig, {}); return bySig.get(sig); };
for (const [inscid, cis] of ciByInsc) {
  const sig = primarySignum(inscid); if (!sig) continue;
  const named = cis.map((x) => ({ ...x, name: carverName.get(x.carverid) })).filter((x) => x.name);
  if (!named.length) continue;
  named.sort((a, b) => (ATTR_RANK[b.attribution] ?? 0) - (ATTR_RANK[a.attribution] ?? 0) || b.certainty - a.certainty);
  const rec = ensure(sig); rec.carver = named[0].name; rec.attribution = named[0].attribution;
}
for (const [objid, herids] of objToHer) {
  const inscid = objToInsc.get(objid); if (!inscid) continue; const sig = primarySignum(inscid); if (!sig) continue;
  const h = herids.map((id) => herData.get(id)).filter(Boolean); const raa = h.find((x) => x.raa)?.raa; const fmis = h.find((x) => x.fmis)?.fmis;
  const rec = ensure(sig); if (raa) rec.raa = raa; if (fmis) rec.fmis = fmis;
}
for (const [objid, urls] of imgByObj) {
  const inscid = objToInsc.get(objid); if (!inscid) continue; const sig = primarySignum(inscid); if (!sig) continue;
  ensure(sig).img = urls[0];
}
const cCarv = [...bySig.values()].filter((v) => v.carver).length, cRaa = [...bySig.values()].filter((v) => v.raa).length, cImg = [...bySig.values()].filter((v) => v.img).length;
console.log(`Signum m. data: ${bySig.size} | ristare ${cCarv} | RAÄ ${cRaa} | bild ${cImg}`);
console.log('Ex ristare:', [...bySig.entries()].filter(([, v]) => v.carver).slice(0, 6).map(([s, v]) => `${s}=${v.carver}(${v.attribution})`).join(', '));
if (!APPLY) { console.log('\n(dry-run)'); process.exit(0); }

const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`alter table public.runic_inscriptions
  add column if not exists carver text, add column if not exists carver_attribution text,
  add column if not exists raa_number text, add column if not exists fmis_id bigint,
  add column if not exists rundata_image_url text`);
let n = 0;
for (const [sig, v] of bySig) {
  const r = await c.query(`update runic_inscriptions set carver=coalesce($1,carver), carver_attribution=coalesce($2,carver_attribution), raa_number=coalesce($3,raa_number), fmis_id=coalesce($4,fmis_id), rundata_image_url=coalesce($5,rundata_image_url) where signum=$6`,
    [v.carver ?? null, v.attribution ?? null, v.raa ?? null, v.fmis ?? null, v.img ?? null, sig]);
  if (r.rowCount) n++;
}
console.log(`\nUppdaterade ${n} inskrifter.`);
console.log('I DB nu → ristare:', (await c.query(`select count(*) n from runic_inscriptions where carver is not null`)).rows[0].n,
  '| RAÄ:', (await c.query(`select count(*) n from runic_inscriptions where raa_number is not null`)).rows[0].n,
  '| bild:', (await c.query(`select count(*) n from runic_inscriptions where rundata_image_url is not null`)).rows[0].n);
console.log('Topp-ristare:', (await c.query(`select carver,count(*) n from runic_inscriptions where carver is not null group by 1 order by 2 desc limit 8`)).rows.map((r) => `${r.carver}(${r.n})`).join(' '));
await c.end();

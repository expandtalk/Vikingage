// STEG 3: importerar SAKNADE inskrifter ur rundata.sql som nya runic_inscriptions-rader.
// id = rundatas objectid (som UUID) => spegeltabellerna (imagelinks/dating/translations)
// auto-matchar de nya raderna via useInscriptionExtendedData. Dedup på signum (WHERE NOT
// EXISTS) + ON CONFLICT(id). Fyller coords/translit/normalisering/översättning/datering/
// noter/objekttyp/material/landskap direkt. Endast prefix i TARGET (pilot: Sm/Sö/Öl/G).
// Emitterar scripts/data/rundata-import-inscriptions.sql. Kör i editorn.
// Kör: node scripts/crosswalk-rundata-import-inscriptions.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

// Pilotlandskapen är redan importerade — hoppa dem (WHERE NOT EXISTS skulle ändå dedupa).
const DONE = new Set(['Sm', 'Sö', 'Öl', 'G']);
const SV_LANDSCAPE = {
  U: 'Uppland', 'Sö': 'Södermanland', 'Ög': 'Östergötland', Sm: 'Småland', 'Öl': 'Öland',
  G: 'Gotland', Vg: 'Västergötland', Bo: 'Bohuslän', Ha: 'Halland', 'Nä': 'Närke',
  Vs: 'Västmanland', Vr: 'Värmland', Gs: 'Gästrikland', Hs: 'Hälsingland', M: 'Medelpad',
  'Ång': 'Ångermanland', J: 'Jämtland', 'Hä': 'Härjedalen', D: 'Dalarna', Nb: 'Norrbotten',
  Vb: 'Västerbotten', Lp: 'Lappland', Sk: 'Skåne', Bl: 'Blekinge',
};
const FOREIGN = { DR: 'Denmark', N: 'Norway', IS: 'Iceland', GR: 'Greenland' };

const lines = readFileSync('rundata.sql', 'utf8').split('\n');

function splitTuple(body) {
  const fields = []; let cur = ''; let inStr = false;
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
  fields.push(cur); return fields;
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
const bestRank = (mark) => (mark === 'P' ? 0 : (mark ? mark.charCodeAt(0) : 99));

let cur = null;
const objToInsc = new Map();          // objectid -> inscriptionid
const inscToSignumIds = new Map();    // inscriptionid -> [{signumid, canonical}]
const signumText = new Map();         // signumid -> "s1 s2"
const objCoord = new Map();           // objectid -> {lat,lng,current}
const objMeta = new Map();            // objectid -> {artefact, material}
const readingByInsc = new Map(); const readingRank = new Map();
const interpByInsc = new Map(); const interpRank = new Map();
const transByInsc = new Map(); const transRank = new Map();  // inscid -> {sv,en}
const datingByObj = new Map();        // objectid -> [{text,lang}]
const notesByObj = new Map();         // objectid -> [{text,lang}]

const reCoord = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',([01]),(-?[\d.]+),(-?[\d.]+)\)/;
const reInsc  = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',/;
const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;

for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;

  if (cur === 'coordinates') {
    const c = line.match(reCoord);
    if (c) {
      const [, , objectid, current, lat, lng] = c;
      const prev = objCoord.get(objectid);
      if (!prev || (current === '1' && prev.current !== 1)) objCoord.set(objectid, { lat: +lat, lng: +lng, current: +current });
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
    if (c) signumText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim());
  } else if (cur === 'objects') {
    // (objectid, placeid, artefact, material, extant, originallocation)
    const f = splitTuple(line.replace(/\),?\s*$/, '').replace(/^\(/, ''));
    const objid = hexOf(f[0]);
    if (objid) objMeta.set(objid, { artefact: unquote(f[2]), material: unquote(f[3]) });
  } else if (cur === 'readings') {
    const f = splitTuple(line.replace(/\),?\s*$/, '').replace(/^\(/, ''));
    const inscid = hexOf(f[1]); const text = unquote(f[3]); const rank = bestRank(unquote(f[2]));
    if (inscid && text && !(readingRank.has(inscid) && readingRank.get(inscid) <= rank)) { readingRank.set(inscid, rank); readingByInsc.set(inscid, text); }
  } else if (cur === 'interpretations') {
    const f = splitTuple(line.replace(/\),?\s*$/, '').replace(/^\(/, ''));
    const inscid = hexOf(f[1]); const text = unquote(f[3]); const rank = bestRank(unquote(f[2]));
    if (inscid && text && !(interpRank.has(inscid) && interpRank.get(inscid) <= rank)) { interpRank.set(inscid, rank); interpByInsc.set(inscid, text); }
  } else if (cur === 'translations') {
    const f = splitTuple(line.replace(/\),?\s*$/, '').replace(/^\(/, ''));
    if (f.length < 6) continue;
    const inscid = hexOf(f[1]); const text = unquote(f[3]); const lang = (unquote(f[5]) || '').toLowerCase(); const rank = bestRank(unquote(f[2]));
    const key = lang.startsWith('sv') ? 'sv' : lang.startsWith('en') ? 'en' : null;
    if (!inscid || !text || !key) continue;
    const rk = `${inscid}|${key}`;
    if (transRank.has(rk) && transRank.get(rk) <= rank) continue;
    transRank.set(rk, rank);
    if (!transByInsc.has(inscid)) transByInsc.set(inscid, {});
    transByInsc.get(inscid)[key] = text;
  } else if (cur === 'dating') {
    const f = splitTuple(line.replace(/\),?\s*$/, '').replace(/^\(/, ''));
    const objid = hexOf(f[1]); const text = unquote(f[2]); const lang = unquote(f[3]) || 'sv-se';
    if (objid && text) { if (!datingByObj.has(objid)) datingByObj.set(objid, []); datingByObj.get(objid).push({ text, lang }); }
  } else if (cur === 'notes') {
    const f = splitTuple(line.replace(/\),?\s*$/, '').replace(/^\(/, ''));
    const objid = hexOf(f[1]); const text = unquote(f[2]); const lang = unquote(f[3]) || 'sv-se';
    if (objid && text) { if (!notesByObj.has(objid)) notesByObj.set(objid, []); notesByObj.get(objid).push({ text, lang }); }
  }
}

// Primär signum + alias per inscriptionid (canonical=1 vinner).
function signumsFor(inscid) {
  const sigs = inscToSignumIds.get(inscid);
  if (!sigs) return null;
  const resolved = sigs.map((s) => ({ ...s, text: signumText.get(s.signumid) })).filter((s) => s.text);
  if (!resolved.length) return null;
  const sorted = [...resolved].sort((a, b) => b.canonical - a.canonical);
  return { primary: sorted[0].text, aliases: sorted.slice(1).map((s) => s.text) };
}
const prefixOf = (sig) => sig.split(' ')[0];
const pickText = (arr) => {
  const sv = arr.filter((x) => (x.lang || '').toLowerCase().startsWith('sv'));
  return (sv.length ? sv : arr).map((x) => x.text.trim()).filter(Boolean).join('\n\n');
};
const toUuid = (hex) => hex.toLowerCase().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
// Platta inbäddade radbrytningar till mellanslag — annars bryter SQL-editorns
// inklistring på fältvärden som spänner över flera rader (t.ex. fleradiga noter).
const esc = (s) => (s == null || s === '' ? 'NULL' : `'${String(s).replace(/\r?\n+/g, ' ').replace(/\s+$/,'').replace(/'/g, "''")}'`);
const num = (n) => (n == null ? 'NULL' : n);

// Bygg rader för objekt vars primära signum matchar TARGET-prefix.
const seenSig = new Set();
const rows = [];
const perPrefix = {};
for (const [objid, inscid] of objToInsc) {
  const s = signumsFor(inscid);
  if (!s) continue;
  const pref = prefixOf(s.primary);
  if (DONE.has(pref)) continue; // pilotlandskapen redan importerade
  const sigKey = s.primary.toLowerCase().replace(/\s+/g, ' ');
  if (seenSig.has(sigKey)) continue;
  seenSig.add(sigKey);

  const coord = objCoord.get(objid);
  const meta = objMeta.get(objid) || {};
  const trans = transByInsc.get(inscid) || {};
  const row = {
    id: toUuid(objid),
    signum: s.primary,
    alt: s.aliases.length ? s.aliases.join('|') : null,
    lat: coord ? coord.lat : null,
    lng: coord ? coord.lng : null,
    translit: readingByInsc.get(inscid) || null,
    norm: interpByInsc.get(inscid) || null,
    tsv: trans.sv || null,
    ten: trans.en || null,
    dating: datingByObj.has(objid) ? pickText(datingByObj.get(objid)) : null,
    notes: notesByObj.has(objid) ? pickText(notesByObj.get(objid)) : null,
    otype: meta.artefact || null,
    material: meta.material || null,
    landscape: SV_LANDSCAPE[pref] || null,
    country: FOREIGN[pref] || 'Sweden',
  };
  rows.push(row);
  perPrefix[pref] = (perPrefix[pref] || 0) + 1;
}

const rowToValue = (r) =>
  `(${esc(r.id)},${esc(r.signum)},${esc(r.alt)},${num(r.lat)},${num(r.lng)},${esc(r.translit)},${esc(r.norm)},` +
  `${esc(r.tsv)},${esc(r.ten)},${esc(r.dating)},${esc(r.notes)},${esc(r.otype)},${esc(r.material)},${esc(r.landscape)},${esc(r.country)})`;

const buildSQL = (subset, label) => `-- STEG 3: import av saknade inskrifter ur rundata.sql (${label}).
-- ${subset.length} kandidatrader. id = rundatas objectid (UUID) => spegeltabeller matchar.
-- Dedup: WHERE NOT EXISTS på signum + ON CONFLICT(id). Ren data, idempotent. Kör i editorn.
insert into public.runic_inscriptions
  (id, signum, alternative_signum, coordinates, coord_source, coord_confidence,
   transliteration, normalization, translation_sv, translation_en, dating_text,
   scholarly_notes, object_type, material, landscape, country, data_source)
select
  v.id::uuid, v.signum,
  case when v.alt is not null then string_to_array(v.alt,'|') else null::text[] end,
  case when v.lat is not null then point(v.lng::float8, v.lat::float8) else null::point end,
  case when v.lat is not null then 'rundata_evighetsrunor' else null end,
  case when v.lat is not null then 'high' else null end,
  v.translit, v.norm, v.tsv, v.ten, v.dating, v.notes, v.otype, v.material, v.landscape,
  coalesce(v.country,'Sweden'), 'rundata_evighetsrunor'
from (values
${subset.map(rowToValue).join(',\n')}
) as v(id, signum, alt, lat, lng, translit, norm, tsv, ten, dating, notes, otype, material, landscape, country)
where not exists (
  select 1 from public.runic_inscriptions ri
  where lower(regexp_replace(ri.signum,'\\s+',' ','g')) = lower(regexp_replace(v.signum,'\\s+',' ','g'))
)
on conflict (id) do nothing;
`;

// Kombinerad fil (allt) + en fil PER LANDSKAP (för editorn, om den kombinerade är för stor).
writeFileSync('scripts/data/rundata-import-inscriptions.sql', buildSQL(rows, 'alla landskap'));
mkdirSync('scripts/data/import-batches', { recursive: true });
const byPrefix = new Map();
for (const r of rows) {
  const p = r.signum.split(' ')[0];
  if (!byPrefix.has(p)) byPrefix.set(p, []);
  byPrefix.get(p).push(r);
}
for (const [p, subset] of byPrefix) {
  const safe = p.replace(/[^A-Za-zÅÄÖåäö0-9]/g, '_');
  writeFileSync(`scripts/data/import-batches/import-${safe}.sql`, buildSQL(subset, `landskap ${p}, ${subset.length} rader`));
}
console.log('Batch-filer per prefix:', [...byPrefix.entries()].map(([p, s]) => `${p}:${s.length}`).join(', '));
console.log(`Kandidater (unika signum, exkl. redan importerade ${[...DONE].join('/')}):`, rows.length, perPrefix);
console.log(`Med koordinat: ${rows.filter((r) => r.lat != null).length} | translit: ${rows.filter((r) => r.translit).length} | översättning: ${rows.filter((r) => r.tsv || r.ten).length} | noter: ${rows.filter((r) => r.notes).length}`);
console.log('Wrote scripts/data/rundata-import-inscriptions.sql');

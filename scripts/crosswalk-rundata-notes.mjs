// Bygger signum -> {scholarly_notes, dating_text, imagelinks[]} ur rundata.sql.
// Kedjan: notes/dating/imagelinks.objectid -> inscriptions.objectid -> inscriptionid
//         -> signum_inscription -> signa -> signum.
// Fyller runic_inscriptions.scholarly_notes + dating_text DÄR de saknas, och
// lägger in arkivbilder i inscription_media (idempotent).
// Emitterar scripts/data/rundata-notes-crosswalk.sql (ren data, ingen migration).
// Kör: node scripts/crosswalk-rundata-notes.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync('rundata.sql', 'utf8').split('\n');

function splitTuple(body) {
  const fields = [];
  let cur = '';
  let inStr = false;
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
  fields.push(cur);
  return fields;
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

let cur = null;
const inscToSignumIds = new Map();   // inscriptionid -> [{signumid, canonical}]
const signumText = new Map();        // signumid -> signum
const objToInsc = new Map();         // objectid -> inscriptionid
const notesByObj = new Map();        // objectid -> [{text, lang}]
const datingByObj = new Map();       // objectid -> [{text, lang}]
const imagesByObj = new Map();       // objectid -> [url]

const reSigIn = /^\(X'([0-9A-F]+)',X'([0-9A-F]+)',X'([0-9A-F]+)',([01])\)/;
const reSigna = /^\(X'([0-9A-F]+)','((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\)/;

for (const raw of lines) {
  const m = raw.match(/INSERT INTO `([a-z_]+)`/i);
  if (m) { cur = m[1]; continue; }
  const line = raw.trim();
  if (!line.startsWith('(')) continue;

  if (cur === 'signum_inscription') {
    const c = line.match(reSigIn);
    if (c) {
      const [, , signumid, inscriptionid, canonical] = c;
      if (!inscToSignumIds.has(inscriptionid)) inscToSignumIds.set(inscriptionid, []);
      inscToSignumIds.get(inscriptionid).push({ signumid, canonical: +canonical });
    }
  } else if (cur === 'signa') {
    const c = line.match(reSigna);
    if (c) signumText.set(c[1], `${c[2]} ${c[3]}`.replace(/\s+/g, ' ').trim());
  } else if (cur === 'inscriptions') {
    // (inscriptionid, objectid, periodid, periodcertainty, ornamental)
    const f = splitTuple(line.replace(/\),?\s*$/, '').replace(/^\(/, ''));
    const inscid = hexOf(f[0]); const objid = hexOf(f[1]);
    if (inscid && objid && !objToInsc.has(objid)) objToInsc.set(objid, inscid);
  } else if (cur === 'notes') {
    // (noteid, objectid, notes, lang)
    const f = splitTuple(line.replace(/\),?\s*$/, '').replace(/^\(/, ''));
    const objid = hexOf(f[1]); const text = unquote(f[2]); const lang = unquote(f[3]) || 'sv-se';
    if (objid && text) { if (!notesByObj.has(objid)) notesByObj.set(objid, []); notesByObj.get(objid).push({ text, lang }); }
  } else if (cur === 'dating') {
    // (datingid, objectid, dating, lang)
    const f = splitTuple(line.replace(/\),?\s*$/, '').replace(/^\(/, ''));
    const objid = hexOf(f[1]); const text = unquote(f[2]); const lang = unquote(f[3]) || 'sv-se';
    if (objid && text) { if (!datingByObj.has(objid)) datingByObj.set(objid, []); datingByObj.get(objid).push({ text, lang }); }
  } else if (cur === 'imagelinks') {
    // (imagelinkid, objectid, imagelink)
    const f = splitTuple(line.replace(/\),?\s*$/, '').replace(/^\(/, ''));
    const objid = hexOf(f[1]); const url = unquote(f[2]);
    if (objid && url) { if (!imagesByObj.has(objid)) imagesByObj.set(objid, []); imagesByObj.get(objid).push(url); }
  }
}

function signumForInsc(inscriptionid) {
  const sigs = inscToSignumIds.get(inscriptionid);
  if (!sigs) return null;
  for (const s of [...sigs].sort((a, b) => b.canonical - a.canonical)) {
    const t = signumText.get(s.signumid); if (t) return t;
  }
  return null;
}
const signumForObj = (objid) => {
  const inscid = objToInsc.get(objid);
  return inscid ? signumForInsc(inscid) : null;
};

// Prefer svenska (sv-se) annars första; slå ihop flera noter med tom rad.
const pickText = (arr) => {
  const sv = arr.filter((x) => (x.lang || '').toLowerCase().startsWith('sv'));
  const chosen = sv.length ? sv : arr;
  return chosen.map((x) => x.text.trim()).filter(Boolean).join('\n\n');
};

const sigNotes = new Map();
for (const [objid, arr] of notesByObj) { const s = signumForObj(objid); if (s && !sigNotes.has(s)) sigNotes.set(s, pickText(arr)); }
const sigDating = new Map();
for (const [objid, arr] of datingByObj) { const s = signumForObj(objid); if (s && !sigDating.has(s)) sigDating.set(s, pickText(arr)); }
const sigImages = new Map();
for (const [objid, arr] of imagesByObj) {
  const s = signumForObj(objid); if (!s) continue;
  if (!sigImages.has(s)) sigImages.set(s, new Set());
  arr.forEach((u) => sigImages.get(s).add(u));
}

const esc = (s) => `'${s.replace(/'/g, "''")}'`;
const notesValues = [...sigNotes.entries()].map(([s, t]) => `(${esc(s)},${esc(t)})`).join(',\n');
const datingValues = [...sigDating.entries()].map(([s, t]) => `(${esc(s)},${esc(t)})`).join(',\n');
const imageValues = [];
for (const [s, urls] of sigImages) for (const u of urls) imageValues.push(`(${esc(s)},${esc(u)})`);

const out = `-- Notes/dating/imagelinks-crosswalk ur rundata.sql (keyed på objectid -> signum).
-- scholarly_notes: ${sigNotes.size} signum | dating_text: ${sigDating.size} signum | bilder: ${imageValues.length} (${sigImages.size} signum).
-- Ren data. Fyller DÄR fält saknas; bilder idempotent i inscription_media. Kör i editorn.
begin;

update public.runic_inscriptions ri
set scholarly_notes = cw.notes
from (values
${notesValues}
) as cw(signum, notes)
where lower(regexp_replace(ri.signum,'\\s+',' ','g')) = lower(regexp_replace(cw.signum::text,'\\s+',' ','g'))
  and (ri.scholarly_notes is null or ri.scholarly_notes = '');

update public.runic_inscriptions ri
set dating_text = cw.dating
from (values
${datingValues}
) as cw(signum, dating)
where lower(regexp_replace(ri.signum,'\\s+',' ','g')) = lower(regexp_replace(cw.signum::text,'\\s+',' ','g'))
  and (ri.dating_text is null or ri.dating_text = '');

insert into public.inscription_media (inscription_id, media_url, media_type, source_institution)
select ri.id, cw.url, 'image', 'kulturarvsdata.se (RAÄ/SHM)'
from (values
${imageValues.join(',\n')}
) as cw(signum, url)
join public.runic_inscriptions ri
  on lower(regexp_replace(ri.signum,'\\s+',' ','g')) = lower(regexp_replace(cw.signum::text,'\\s+',' ','g'))
where not exists (
  select 1 from public.inscription_media m where m.inscription_id = ri.id and m.media_url = cw.url
);

commit;
`;

writeFileSync('scripts/data/rundata-notes-crosswalk.sql', out);
console.log(`objToInsc: ${objToInsc.size} | notes obj: ${notesByObj.size} -> signum ${sigNotes.size}`);
console.log(`dating obj: ${datingByObj.size} -> signum ${sigDating.size} | images obj: ${imagesByObj.size} -> rows ${imageValues.length}`);
console.log('Wrote scripts/data/rundata-notes-crosswalk.sql');

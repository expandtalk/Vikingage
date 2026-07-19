// Genererar 02-import.sql (regenter + relationer) ur de två CSV:erna.
// Körs: node scripts/gen-royal-chronicles-import.mjs
// Idempotent SQL (WHERE NOT EXISTS) — säkert att köra om. Kör EFTER 01-corrections.sql.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'data', 'royal-chronicles');

// --- minimal CSV-parser (dubbelciterade fält, komma-separerat) ---
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      if (field !== '' || row.length) { row.push(field); rows.push(row); row = []; field = ''; }
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  return rows.map(r => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const qOrNull = (s) => (s === '' || s == null ? 'NULL' : q(s));
const intOrNull = (s) => (s === '' || s == null ? 'NULL' : String(parseInt(s, 10)));
const boolOf = (s) => (String(s).toLowerCase() === 'true' ? 'true' : 'false');

const STATUS = { Historical: 'historical', 'Semi-legendary': 'semi_legendary', Legendary: 'legendary' };
const REGION = { Anglosaxare: 'England' }; // övriga behålls (Sweden/Denmark/Norway/Kievrus/Västerleden)
const FEMALE_ROLES = new Set(['Queen', 'Furstinna']);
const FEMALE_NAMES = new Set(['Kristina Nilsdotter Gyllenstierna']);

// ---- regenter ----
const regents = parseCSV(readFileSync(join(dir, 'regents_missing.csv'), 'utf8'));
let sql = `-- Royal Chronicles — steg g: importera regenter + relationer (GENERERAD, redigera ej för hand)
-- Kör EFTER 01-corrections.sql. Idempotent. Generator: scripts/gen-royal-chronicles-import.mjs
begin;

-- ${regents.length} regenter\n`;

for (const r of regents) {
  const status = STATUS[r.classification] ?? 'disputed';
  const region = REGION[r.region] ?? r.region;
  const gender = FEMALE_ROLES.has(r.role) || FEMALE_NAMES.has(r.name) ? 'female' : 'male';
  const att = r.external_attestation
    ? `ARRAY[${r.external_attestation.split(';').map(s => q(s.trim())).filter(Boolean).join(',')}]::text[]`
    : `'{}'::text[]`;
  const dyn = r.dynasty
    ? `(select id from public.royal_dynasties where name=${q(r.dynasty)} limit 1)`
    : 'NULL';
  sql += `insert into public.historical_kings
  (name, reign_start, reign_end, dynasty_id, status, region, role, de_facto_ruler, external_attestation, runestone_mentions, archaeological_evidence, gender, sources)
select ${q(r.name)}, ${intOrNull(r.reign_start)}, ${intOrNull(r.reign_end)}, ${dyn}, '${status}'::king_status, ${q(region)}, ${qOrNull(r.role)}, ${boolOf(r.de_facto_ruler)}, ${att}, ${boolOf(r.runestone)}, ${boolOf(r.archaeology)}, '${gender}', ${qOrNull(r.sources)}
where not exists (select 1 from public.historical_kings k where lower(k.name)=lower(${q(r.name)}));\n`;
}

// ---- relationer ----
const rels = parseCSV(readFileSync(join(dir, 'relations_edges.csv'), 'utf8'));
sql += `\n-- ${rels.length} relationer\n`;
for (const e of rels) {
  sql += `insert into public.royal_relations (person_a, person_b, relation_type, period, comment, source)
select ${q(e.person_a)}, ${q(e.person_b)}, ${q(e.relation_type)}, ${qOrNull(e.period)}, ${qOrNull(e.comment)}, ${qOrNull(e.source)}
where not exists (select 1 from public.royal_relations x where x.person_a=${q(e.person_a)} and x.person_b=${q(e.person_b)} and x.relation_type=${q(e.relation_type)});\n`;
}

// ---- koppla relationer till kungar (namn -> id) där möjligt ----
sql += `\n-- Koppla relationer till historical_kings via namn (best-effort)
update public.royal_relations r set king_a_id=k.id from public.historical_kings k
  where r.king_a_id is null and lower(k.name)=lower(r.person_a);
update public.royal_relations r set king_b_id=k.id from public.historical_kings k
  where r.king_b_id is null and lower(k.name)=lower(r.person_b);

-- Integritetscheck (ska ge 0 rader): legendariska med extern attestering
-- select name from public.historical_kings where status='legendary' and array_length(external_attestation,1) > 0;

commit;
`;

writeFileSync(join(dir, '02-import.sql'), sql, 'utf8');
console.log(`Wrote 02-import.sql: ${regents.length} regents, ${rels.length} relations`);

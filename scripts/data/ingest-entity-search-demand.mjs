// Ingest av Ahrefs organic-keyword-export → entity_search_demand.
// INTERN prioriteringssignal (sökvolym republiceras ej). Kopplar keyword→entitet där möjligt.
//   Arg: sökväg till CSV. Dataset-etikett härleds ur filnamnet (eller andra argumentet).
import pg from 'pg';
import { readFileSync } from 'node:fs';

const CSV = process.argv[2] || 'C:/Users/Lenovo/Downloads/historiska-personer.nu-organic-keywords-sub_2026-08-20_17-21-36.csv';
const DATASET = process.argv[3] || 'historiska-personer.nu 2026-08-20';

const env = Object.fromEntries(
  readFileSync('./.env', 'utf8').split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const client = new pg.Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
  user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
});

// --- RFC4180 CSV-parser ---
function parseCSV(text) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // BOM
  const rows = []; let field = '', row = [], inQ = false, i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQ = true; i++; continue; }
    if (ch === ',') { row.push(field); field = ''; i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += ch; i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const T = v => (v === 'true');
const numOr = v => { const s = String(v ?? '').trim().replace(/\s/g, ''); return s && /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null; };
const intOr = v => { const n = numOr(v); return n == null ? null : Math.round(n); };
const kindMap = k => { const s = (k || '').toLowerCase(); return s.includes('person') ? 'person' : (s.includes('location') || s.includes('place')) ? 'plats' : s ? 'övrig' : null; };

function parseEntities(cell) {
  if (!cell) return { label: null, kind: null };
  const first = cell.split(/,\s*(?=[^,()]*\()/)[0].trim(); // första entiteten
  const m = first.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (m) return { label: m[1].trim(), kind: kindMap(m[2]) };
  return { label: first || null, kind: null };
}
function primaryIntent(r, idx) {
  if (T(r[idx.trans])) return 'transactional';
  if (T(r[idx.comm])) return 'commercial';
  if (T(r[idx.nav])) return 'navigational';
  if (T(r[idx.info])) return 'informational';
  return null;
}

const rows = parseCSV(readFileSync(CSV, 'utf8'));
const header = rows[0];
const H = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
const idx = {
  kw: H['Keyword'], country: H['Country'], lang: H['Language'], ent: H['Entities'],
  branded: H['Branded'], nav: H['Navigational'], info: H['Informational'], comm: H['Commercial'], trans: H['Transactional'],
  serp: H['SERP features'], vol: H['Volume'], kd: H['KD'], cpc: H['CPC'],
  curUrl: H['Current URL'], prevUrl: H['Previous URL'], curDate: H['Current date'], prevDate: H['Previous date'],
};

const parsed = [];
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (!row || !row[idx.kw]) continue;
  const { label, kind } = parseEntities(row[idx.ent]);
  const dateRaw = (row[idx.curDate] || row[idx.prevDate] || '').slice(0, 10);
  parsed.push({
    keyword: row[idx.kw].trim(),
    entity_label: label, entity_kind: kind,
    country: (row[idx.country] || '').trim() || null,
    language: (row[idx.lang] || '').trim() || null,
    volume: intOr(row[idx.vol]),
    intent: primaryIntent(row, idx),
    branded: T(row[idx.branded]),
    serp_features: (row[idx.serp] || '').split(',').map(s => s.trim()).filter(Boolean),
    kd: numOr(row[idx.kd]), cpc: numOr(row[idx.cpc]),
    competitor_url: (row[idx.curUrl] || row[idx.prevUrl] || '').trim() || null,
    captured_date: /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : null,
    source: 'ahrefs', dataset: DATASET,
  });
}

// dedupe på unik-nyckeln (lower(keyword),country,dataset) — behåll högst volym
{
  const best = new Map();
  for (const p of parsed) {
    const k = `${p.keyword.toLowerCase()}·${p.country || ''}·${p.dataset || ''}`;
    const prev = best.get(k);
    if (!prev || (p.volume || 0) > (prev.volume || 0)) best.set(k, p);
  }
  parsed.length = 0; for (const v of best.values()) parsed.push(v);
}

console.log(`Parsat ${parsed.length} keyword-rader ur ${CSV.split(/[\\/]/).pop()}.`);

await client.connect();

// --- entitetsmatchning mot vår KG ---
const norm = s => (s || '').toLowerCase().trim();
const kings = new Map(); // namn → id (vår domän prioriteras)
for (const row of (await client.query('select id, name from historical_kings')).rows) {
  kings.set(norm(row.name), row.id);
  // name_variations kan finnas
}
const persons = new Map();
for (const row of (await client.query('select id, name from persons')).rows) {
  if (!persons.has(norm(row.name))) persons.set(norm(row.name), row.id);
}
console.log(`Laddade ${kings.size} kungar + ${persons.size} personer för matchning.`);

let matched = 0;
for (const p of parsed) {
  if (p.entity_kind && p.entity_kind !== 'person') continue;
  for (const cand of [p.entity_label, p.keyword]) {
    const key = norm(cand);
    if (!key) continue;
    if (kings.has(key)) { p.resolved_entity_type = 'historical_king'; p.resolved_entity_id = kings.get(key); matched++; break; }
    if (persons.has(key)) { p.resolved_entity_type = 'person'; p.resolved_entity_id = persons.get(key); matched++; break; }
  }
}
console.log(`Matchade ${matched} keyword-rader till en KG-entitet.`);

async function chunkInsert(rowsArr, chunk) {
  const cols = ['keyword', 'entity_label', 'entity_kind', 'resolved_entity_type', 'resolved_entity_id', 'country', 'language',
    'volume', 'intent', 'branded', 'serp_features', 'kd', 'cpc', 'competitor_url', 'source', 'dataset', 'captured_date'];
  let done = 0;
  for (let i = 0; i < rowsArr.length; i += chunk) {
    const slice = rowsArr.slice(i, i + chunk);
    const params = []; const tuples = [];
    slice.forEach((row, ri) => {
      const base = ri * cols.length;
      tuples.push('(' + cols.map((_, ci) => `$${base + ci + 1}`).join(',') + ')');
      for (const c of cols) params.push(row[c] ?? null);
    });
    await client.query(`INSERT INTO entity_search_demand (${cols.join(',')}) VALUES ${tuples.join(',')}`, params);
    done += slice.length;
  }
  return done;
}

try {
  await client.query('BEGIN');
  await client.query('DELETE FROM entity_search_demand WHERE dataset = $1', [DATASET]);
  const n = await chunkInsert(parsed, 1000);
  await client.query('COMMIT');
  console.log(`KLART — infogade ${n} rader (dataset "${DATASET}").`);
} catch (e) {
  await client.query('ROLLBACK');
  console.error('FEL (rollback):', e.message);
  process.exitCode = 1;
}
await client.end();

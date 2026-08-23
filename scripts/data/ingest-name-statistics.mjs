// Ingest av Skatteverkets namnstatistik (FAKTA/myndighetsdata) → given_name_stats + surname_stats.
// Full reload (idempotent). Källor:
//   Downloads/Namn på nyfödda 2025.xlsx  (Flickor, Pojkar, Topp 50 per kommun, Topp 50 per län)
//   Downloads/Namn på nyfödda 2024.xlsx  (en flik, Flickor + Pojkar sida vid sida)
//   scratchpad/efternamn_2026.txt        (Fria_efternamn-fil: "Namn<space>antal")
import pg from 'pg';
import xlsx from 'xlsx';
import { readFileSync } from 'node:fs';

const SCRATCH = 'C:/Users/Lenovo/AppData/Local/Temp/claude/C--Users-Lenovo-projects-vikingage/8cda15a4-a47e-42db-a83f-719aefd5f172/scratchpad';
const F2025 = 'C:/Users/Lenovo/Downloads/Namn på nyfödda 2025.xlsx';
const F2024 = 'C:/Users/Lenovo/Downloads/Namn på nyfödda 2024.xlsx';
const SURNAMES = `${SCRATCH}/efternamn_2026.txt`;
const SOURCE_DATE = '2026-01-16'; // Skatteverkets uttagsdatum (angivet i 2024-filen + 2025-arbetsbokens sökväg)

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

const norm = s => (typeof s === 'string' ? s.trim() : s);
const gmap = g => { const v = String(g || '').toLowerCase(); return v.startsWith('flick') ? 'flicka' : v.startsWith('pojk') ? 'pojke' : null; };
const numOr = (v) => (typeof v === 'number' ? v : (v != null && /^\d+$/.test(String(v).trim()) ? parseInt(v, 10) : null));

// ---- samla given_name_stats-rader ----
const given = []; // {name, gender, birth_year, rank, count, area_type, area_name}
function pushGiven(rank, name, count, year, gender, area_type, area_name) {
  name = norm(name); const g = gmap(gender); const c = numOr(count); const y = numOr(year);
  if (!name || typeof name !== 'string' || !g || c == null || y == null) return;
  given.push({ name, gender: g, birth_year: y, rank: numOr(rank), count: c, area_type, area_name: area_name ? norm(area_name) : null });
}

// 2025-filen — 4 flikar
{
  const wb = xlsx.readFile(F2025);
  const sheet = (n) => xlsx.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: null });
  for (const [sn, at, areaCol] of [['Flickor', 'riket', null], ['Pojkar', 'riket', null], ['Topp 50 per kommun', 'kommun', 5], ['Topp 50 per län', 'län', 5]]) {
    const rows = sheet(sn);
    for (let i = 2; i < rows.length; i++) { // hoppa titel(0)+rubrik(1)
      const r = rows[i]; if (!r) continue;
      pushGiven(r[0], r[1], r[2], r[3], r[4], at, areaCol != null ? r[areaCol] : null);
    }
  }
}
// 2024-filen — en flik, Flickor A–E (0–4), Pojkar G–K (6–10)
{
  const wb = xlsx.readFile(F2024);
  const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null });
  for (let i = 3; i < rows.length; i++) { // titel(0)+källa(1)+rubrik(2)
    const r = rows[i]; if (!r) continue;
    pushGiven(r[0], r[1], r[2], r[3], r[4], 'riket', null);       // Flickor
    pushGiven(r[6], r[7], r[8], r[9], r[10], 'riket', null);      // Pojkar
  }
}

// ---- samla surname_stats-rader ----
const surnames = [];
{
  const lines = readFileSync(SURNAMES, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let rank = 0;
  for (const line of lines) {
    const m = line.match(/^(.+?)\s+(\d+)$/);
    if (!m) continue;
    rank++;
    surnames.push({ name: m[1].trim(), bearer_count: parseInt(m[2], 10), rank, reference_year: 2026, is_free_to_adopt: true });
  }
}

// Dedup: Skatteverket räknar per unik STAVNING, så enstaka VERSAL-varianter ("HUGO", 1 bärare) krockar
// case-insensitivt med den korrekt skrivna raden ("Hugo", 566). Behåll raden med högst antal
// (= Skatteverkets officiella siffra), fäll versalbruset. Summerar EJ (skulle förvanska officiell siffra).
{
  const keyOf = g => `${g.name.toLowerCase()}·${g.gender}·${g.birth_year}·${g.area_type}·${g.area_name || ''}`;
  const best = new Map();
  const dropped = [];
  for (const g of given) {
    const k = keyOf(g);
    const prev = best.get(k);
    if (!prev) { best.set(k, g); continue; }
    const loser = g.count > prev.count ? prev : g;
    const winner = g.count > prev.count ? g : prev;
    best.set(k, winner);
    dropped.push(loser);
  }
  if (dropped.length) {
    console.log(`Dedup: fällde ${dropped.length} stavningsvarianter (behåller högst antal):`);
    for (const d of dropped) console.log(`  – "${d.name}" (${d.gender}, ${d.birth_year}, antal ${d.count})`);
  }
  given.length = 0;
  for (const v of best.values()) given.push(v);
}

console.log(`Parsat: ${given.length} given_name_stats-rader, ${surnames.length} surname_stats-rader.`);
// snabb sanity per kön/år/area
const byKey = {};
for (const g of given) { const k = `${g.birth_year}·${g.gender}·${g.area_type}`; byKey[k] = (byKey[k] || 0) + 1; }
console.log('Fördelning (år·kön·area → antal):', JSON.stringify(byKey, null, 1));

await client.connect();
async function chunkInsert(table, cols, rows, chunkRows) {
  let done = 0;
  for (let i = 0; i < rows.length; i += chunkRows) {
    const slice = rows.slice(i, i + chunkRows);
    const params = [];
    const tuples = slice.map((row, ri) => {
      const base = ri * cols.length;
      return '(' + cols.map((_, ci) => `$${base + ci + 1}`).join(',') + ')';
    });
    for (const row of slice) for (const c of cols) params.push(row[c]);
    await client.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES ${tuples.join(',')}`, params);
    done += slice.length;
  }
  return done;
}

try {
  await client.query('BEGIN');
  await client.query('DELETE FROM given_name_stats');
  await client.query('DELETE FROM surname_stats');
  const g = given.map(x => ({ ...x, source: 'Skatteverket', source_date: SOURCE_DATE }));
  const nG = await chunkInsert('given_name_stats',
    ['name', 'gender', 'birth_year', 'rank', 'count', 'area_type', 'area_name', 'source', 'source_date'], g, 2000);
  const s = surnames.map(x => ({ ...x, source: 'Skatteverket' }));
  const nS = await chunkInsert('surname_stats',
    ['name', 'bearer_count', 'rank', 'reference_year', 'is_free_to_adopt', 'source'], s, 2000);
  await client.query('COMMIT');
  console.log(`KLART — infogade ${nG} given_name_stats + ${nS} surname_stats.`);
} catch (e) {
  await client.query('ROLLBACK');
  console.error('FEL (rollback):', e.message);
  process.exitCode = 1;
}
await client.end();

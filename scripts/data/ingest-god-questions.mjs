// Gods-FAQ: Ahrefs-relaterade sökord → god_common_questions ("Vanliga frågor om [gud]").
// Filtrerar på Category = Folklore/Belief (utesluter homonymer: Ty=leksak, Ull=textil,
// Balder=fastighetsbolag, Tor=browser osv), mappar sökord → gud, tar topp N per gud på volym.
// Källa: Ahrefs (sökvolym). Ingen gissning — bara det datan säger.
//
// Användning: node scripts/data/ingest-god-questions.mjs [--apply]

import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const DL = 'C:/Users/Lenovo/Downloads';
const TOP_PER_GOD = 18;

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

// Mappning sökord → gudsnamn (word-boundary). Ordning = prioritet.
const GODMAP = [
  [/\bod(en|ens|in|ins)\b/i, 'Oden'],
  [/\b(tors?|thor)\b/i, 'Tor'],
  [/\bbalders?\b/i, 'Balder'],
  [/\bfrejs?\b/i, 'Frej'],
  [/\bfriggs?\b/i, 'Frigg'],
  [/\biduns?\b/i, 'Idun'],
  [/\bulls?\b/i, 'Ull'],
  [/\b(tyr|tyrs)\b/i, 'Ty'],
];
const BARE = new Set(['oden','odens','odin','tor','tors','thor','balder','balders','frej','frejs','frigg','friggs','idun','iduns','ull','ulls','ty','tyr']);

// CSV-fältdelare som respekterar "…"-citat (trend-kolumnerna har komman inuti citat).
function splitCsv(line) {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (c === ',' && !q) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur); return out;
}

function collect() {
  const files = readdirSync(DL).filter(f => /^google_se_.*\.csv$/i.test(f));
  const rows = new Map(); // god|keyword → {god, keyword, volume}
  for (const f of files) {
    const text = readFileSync(`${DL}/${f}`, 'utf8');
    const lines = text.split(/\r?\n/);
    const header = splitCsv(lines[0]);
    const kwCol = header.findIndex(h => /^keyword$/i.test(h.trim()));
    const volCol = header.findIndex(h => /^volume$/i.test(h.trim()));
    const catCol = header.findIndex(h => /^category$/i.test(h.trim()));
    if (kwCol < 0 || volCol < 0 || catCol < 0) continue;
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const c = splitCsv(lines[i]);
      if (c.length <= catCol) continue;
      const cat = (c[catCol] || '').trim();
      if (!/folklore|belief/i.test(cat)) continue;                 // on-topic bara
      const kw = (c[kwCol] || '').trim();
      if (!kw || BARE.has(kw.toLowerCase())) continue;             // hoppa bara gudsnamnet
      const vol = parseInt((c[volCol] || '').replace(/\D/g, ''), 10) || 0;
      const hit = GODMAP.find(([re]) => re.test(kw));
      if (!hit) continue;
      const god = hit[1];
      const key = `${god}|${kw.toLowerCase()}`;
      const prev = rows.get(key);
      if (!prev || vol > prev.volume) rows.set(key, { god, keyword: kw, volume: vol });
    }
  }
  // Topp N per gud på volym
  const byGod = {};
  for (const r of rows.values()) (byGod[r.god] ??= []).push(r);
  const out = [];
  for (const [god, arr] of Object.entries(byGod)) {
    arr.sort((a, b) => b.volume - a.volume);
    out.push(...arr.slice(0, TOP_PER_GOD));
  }
  return out;
}

async function main() {
  const rows = collect();
  const perGod = {};
  rows.forEach(r => perGod[r.god] = (perGod[r.god] || 0) + 1);
  console.log('Frågor per gud:', JSON.stringify(perGod));
  rows.slice(0, 20).forEach(r => console.log(`  ${r.god.padEnd(7)} ${String(r.volume).padStart(6)}  ${r.keyword}`));
  if (!APPLY) { console.log(`\nTotalt ${rows.length}. DRY-RUN — kör med --apply.`); return; }

  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 120000,
  });
  await client.connect();
  try {
    const { rows: gods } = await client.query('select id, name from gods');
    const idOf = Object.fromEntries(gods.map(g => [g.name.toLowerCase(), g.id]));
    let n = 0;
    for (const r of rows) {
      const gid = idOf[r.god.toLowerCase()];
      if (!gid) continue;
      const res = await client.query(
        `insert into god_common_questions (god_id, question, volume, source)
         values ($1,$2,$3,'Ahrefs')
         on conflict (god_id, question) do update set volume=excluded.volume`,
        [gid, r.keyword, r.volume]);
      n += res.rowCount;
    }
    console.log(`\n✅ ${n} frågor skrivna till god_common_questions.`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });

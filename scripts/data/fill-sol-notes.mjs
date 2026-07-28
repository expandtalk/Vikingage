// Fyll ortnamn_element_hits.sol_note ur Svenskt ortnamnslexikon (SOL 2003) lokalt.
// De flesta små namn finns EJ i SOL (den täcker större namn/socknar) → sol_note lämnas null.
// Kör: node scripts/data/fill-sol-notes.mjs  (kräver sol8.txt-sökväg nedan)
import pg from 'pg';
import { readFileSync } from 'node:fs';
const SOL = 'C:/Users/Lenovo/AppData/Local/Temp/claude/C--Users-Lenovo-projects-vikingage/501a9387-7df0-4bc5-8ba8-0d90eef0f218/scratchpad/sol8.txt';
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const txt = readFileSync(SOL, 'utf8');
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();
const region = process.argv[2] || 'Ångermanland';
const names = (await c.query(`select distinct place_name from ortnamn_element_hits where region=$1`, [region])).rows.map((r) => r.place_name);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let found = 0;
for (const nm of names) {
  const cand = [nm];
  const base = nm.replace(/(sn|by|torp|näs|vik|å|bodarna|gård|arna|en|et|sta)$/i, '');
  if (base.length >= 4 && base !== nm) cand.push(base);
  let snip = null;
  for (const t of cand) {
    const m = txt.match(new RegExp('(?:^|\\n)' + esc(t) + '\\b[^.]{0,200}\\.'));
    if (m) { snip = m[0].replace(/\s+/g, ' ').trim().slice(0, 240); break; }
  }
  if (snip) { await c.query(`update ortnamn_element_hits set sol_note=$1 where region=$2 and place_name=$3`, [snip, region, nm]); found++; }
}
console.log(`SOL-uppslag hittade för ${found}/${names.length} namn i ${region}.`);
const ex = (await c.query(`select place_name, left(sol_note,90) s from ortnamn_element_hits where region=$1 and sol_note is not null limit 10`, [region])).rows;
ex.forEach((r) => console.log(`  ${r.place_name}: ${r.s}`));
await c.end();

// Härled ristarnas verksamhetsperiod (period_active_start/end) ur deras stenars numeriska
// datering (runic_inscriptions.dating_tpq/taq). Kringgår den trasiga carver_inscription↔
// runic_inscriptions bytea-bryggan via runic_inscriptions.carver (namn, satt av metadata-ingesten).
// Matchar carvers.name = runic_inscriptions.carver (exakt). Idempotent (coalesce).
// Kör: node scripts/data/derive-carver-periods.mjs
import pg from 'pg';
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();
const per = (await c.query(`select carver, count(*) stenar, min(dating_tpq) tpq, max(dating_taq) taq
  from runic_inscriptions where carver is not null and (dating_tpq is not null or dating_taq is not null)
  group by carver`)).rows;
let n = 0;
for (const p of per) {
  const r = await c.query(`update carvers set period_active_start=coalesce(period_active_start,$1),
    period_active_end=coalesce(period_active_end,$2),
    source_ref=coalesce(source_ref,'period härledd ur stenarnas termini (Rundata)')
    where name=$3`, [p.tpq, p.taq, p.carver]);
  n += r.rowCount;
}
console.log(`Period satt på ${n} ristare (av ${per.length} m. daterade stenar). Totalt m. period:`,
  (await c.query(`select count(period_active_start) n from carvers`)).rows[0].n, '/ 341');
await c.end();

// Datadriven, FAKTISK ristarbeskrivning (ej påhittad prosa) ur Rundata: antal stenar,
// signerat/tillskrivet, top-landskap, verksamhetsperiod (termini), kors/kristna markörer.
// Fyller endast carvers.description där den saknas — rör ej befintliga (Källström-)texter.
// Utförlig biografi kräver Källström 2007 (separat, källförd). Idempotent.
// Kör: node scripts/data/derive-carver-descriptions.mjs
import pg from 'pg';
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();
const stats = (await c.query(`select carver,
   count(*) stenar,
   count(*) filter(where carver_attribution='signed') signed,
   count(*) filter(where carver_attribution in ('attributed','similar')) attrib,
   mode() within group (order by landscape) top_land,
   min(dating_tpq) tpq, max(dating_taq) taq,
   count(*) filter(where has_cross) kors,
   count(*) filter(where christian_invocation is not null) krist
 from runic_inscriptions where carver is not null group by carver`)).rows;
let n = 0;
for (const s of stats) {
  const per = (s.tpq && s.taq) ? `, verksam ca ${s.tpq}–${s.taq} (ur stenarnas datering)` : '';
  const attr = s.signed > 0 ? `${s.signed} signerade och ${s.attrib} tillskrivna` : `${s.attrib} tillskrivna`;
  const land = s.top_land ? ` främst i ${s.top_land}` : '';
  const kr = (s.kors > 0 || s.krist > 0) ? ` ${s.kors} av stenarna bär kors${s.krist > 0 ? `, ${s.krist} har kristna åkallanden (Kristr/Maria/Mikael el. själabön)` : ''}.` : '';
  const desc = `${s.carver} — ${s.stenar} runinskrifter (${attr})${land}${per}.${kr} Datadriven sammanfattning ur Rundata; utförlig biografi kräver Källström 2007.`;
  const r = await c.query(`update carvers set description=$1, source_ref=coalesce(source_ref,'datadriven ur Rundata') where name=$2 and (description is null or length(description)=0)`, [desc, s.carver]);
  n += r.rowCount;
}
console.log(`Datadrivna beskrivningar: ${n} ristare. Totalt m. text:`, (await c.query(`select count(*) n from carvers where description is not null and length(description)>0`)).rows[0].n, '/ 341');
await c.end();

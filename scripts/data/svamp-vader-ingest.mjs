// Svamp Steg 3 (LEAN) — Open-Meteo väder-ingest → svamp.vader_dag, sedan uppdatera_tillstand per dag.
// EFFEKTIVITET (Daniel): (1) hämtar BARA de 2 markvariabler modellen faktiskt använder
// (marktemp_7cm←soil_temperature_6cm, markfukt_28cm←soil_moisture_9_to_27cm) → halva request-vikten;
// (2) 21-dygnsfönster (berakna_score läser markfukt_21d_medel för långsamma arter + API-uppvärmning);
// (3) robust backoff + felspårning så inga batchar faller tyst (buggen som gav 3000/8171 celler).
// Dagligt: kör med PAST_DAYS=1 (inkrementellt) via edge-fn + pg_cron; beskär vader_dag > 21 dygn.
//   node scripts/data/svamp-vader-ingest.mjs sthlm_100km [past_days]
import pg from 'pg';
import { readFileSync } from 'node:fs';

const REGION = process.argv[2] || 'sthlm_100km';
const PAST_DAYS = Number(process.argv[3] || 21);
const BATCH = 60;               // celler/anrop — mindre → lägre vikt/anrop, färre 429
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 120000 });
await c.connect();

const cells = (await c.query('select h3, lat::float8 lat, lon::float8 lon from svamp.hex7 where region_id=$1 order by h3', [REGION])).rows;
console.log(`${REGION}: ${cells.length} hex7-celler → Open-Meteo (${PAST_DAYS}d, 2 markvariabler).`);
if (!cells.length) { console.error('Inga hex7-celler — kör svamp-hexgrid.mjs först.'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const meanBy = (times, vals) => { const acc = {}; for (let i = 0; i < times.length; i++) { const d = times[i].slice(0, 10); const v = vals?.[i]; if (v == null) continue; (acc[d] ??= []).push(v); } const out = {}; for (const d in acc) out[d] = acc[d].reduce((a, b) => a + b, 0) / acc[d].length; return out; };
const today = new Date().toISOString().slice(0, 10);

const fetchBatch = async (batch) => {
  const lat = batch.map((x) => x.lat.toFixed(4)).join(',');
  const lon = batch.map((x) => x.lon.toFixed(4)).join(',');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=Europe%2FStockholm&past_days=${PAST_DAYS}&forecast_days=1`
    + '&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration'
    + '&hourly=soil_temperature_6cm,soil_moisture_9_to_27cm';
  for (let attempt = 0; attempt < 7; attempt++) {
    let res;
    try { res = await fetch(url); } catch { await sleep(2000 * (attempt + 1)); continue; }
    if (res.status === 429 || res.status >= 500) { await sleep(3000 * (attempt + 1)); continue; } // backoff
    const js = await res.json();
    const locs = Array.isArray(js) ? js : [js];
    if (locs.length !== batch.length) return null; // misalignment → hoppa (retas i slutet)
    return locs;
  }
  return null; // gav upp
};

const insertRows = async (batch, locs) => {
  const R = { h3: [], datum: [], ned: [], mt7: [], mf28: [], tmin: [], tmax: [], et0: [], prog: [] };
  const dates = new Set();
  for (let b = 0; b < batch.length; b++) {
    const loc = locs[b]; if (!loc?.daily) continue;
    const d = loc.daily, h = loc.hourly || {};
    const st6 = meanBy(h.time || [], h.soil_temperature_6cm), sm927 = meanBy(h.time || [], h.soil_moisture_9_to_27cm);
    for (let k = 0; k < d.time.length; k++) {
      const dt = d.time[k];
      R.h3.push(batch[b].h3); R.datum.push(dt);
      R.ned.push(d.precipitation_sum?.[k] ?? null);
      R.mt7.push(st6[dt] ?? null); R.mf28.push(sm927[dt] ?? null);
      R.tmin.push(d.temperature_2m_min?.[k] ?? null); R.tmax.push(d.temperature_2m_max?.[k] ?? null);
      R.et0.push(d.et0_fao_evapotranspiration?.[k] ?? null);
      R.prog.push(dt > today); dates.add(dt);
    }
  }
  if (R.h3.length) {
    await c.query(
      `insert into svamp.vader_dag (h3,datum,nederbord_mm,marktemp_7cm,markfukt_28cm,lufttemp_min,lufttemp_max,et0_mm,prognos,kalla)
       select u.h3,u.datum,u.ned,u.mt7,u.mf28,u.tmin,u.tmax,u.et0,u.prog,'open-meteo'
       from unnest($1::text[],$2::date[],$3::numeric[],$4::numeric[],$5::numeric[],$6::numeric[],$7::numeric[],$8::numeric[],$9::boolean[])
            as u(h3,datum,ned,mt7,mf28,tmin,tmax,et0,prog)
       on conflict (h3,datum,prognos) do nothing`,
      [R.h3, R.datum, R.ned, R.mt7, R.mf28, R.tmin, R.tmax, R.et0, R.prog]);
  }
  return { rows: R.h3.length, dates };
};

let totalRows = 0; const allDates = new Set(); const failed = [];
for (let i = 0; i < cells.length; i += BATCH) {
  const batch = cells.slice(i, i + BATCH);
  const locs = await fetchBatch(batch);
  if (!locs) { failed.push(batch); }
  else { const r = await insertRows(batch, locs); totalRows += r.rows; r.dates.forEach((d) => allDates.add(d)); }
  process.stdout.write(`\r  ingest: ${Math.min(i + BATCH, cells.length)}/${cells.length} celler, ${totalRows.toLocaleString()} rader, ${failed.length} batch-fail`);
  await sleep(500);
}
// Andra chansen för fallerade batchar (rate-limit lugnat) — långsammare.
if (failed.length) {
  console.log(`\n  retry: ${failed.length} fallerade batchar…`);
  for (const batch of failed.splice(0)) { await sleep(2000); const locs = await fetchBatch(batch); if (locs) { const r = await insertRows(batch, locs); totalRows += r.rows; r.dates.forEach((d) => allDates.add(d)); } else failed.push(batch); }
}
const distinctCells = (await c.query('select count(distinct v.h3)::int n from svamp.vader_dag v join svamp.hex7 h on h.h3=v.h3 where h.region_id=$1', [REGION])).rows[0].n;
console.log(`\nvader_dag: ${totalRows.toLocaleString()} rader, ${distinctCells}/${cells.length} celler täckta${failed.length ? `, ${failed.length} batchar KVAR ofullständiga` : ' (komplett ✓)'}.`);

const dates = [...allDates].filter((d) => d <= today).sort();
console.log(`Kör uppdatera_tillstand för ${dates.length} dygn (äldst→nyast)…`);
let last = 0;
for (const d of dates) { const r = await c.query('select svamp.uppdatera_tillstand($1) n', [d]); last = r.rows[0].n; }
const ns = (await c.query('select count(*)::int n from svamp.vader_tillstand v join svamp.hex7 h on h.h3=v.h3 where h.region_id=$1', [REGION])).rows[0].n;
console.log(`vader_tillstand: ${ns}/${cells.length} celler (sista dygnet uppdaterade ${last}).`);
await c.end();
console.log('KLART — Steg 3 LEAN för', REGION);

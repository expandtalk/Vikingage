/**
 * ingest-elevation.mjs — höjd över havet (m) per runsten ur EU-DEM 25 m.
 *
 * Fyller public.runestone_soil.elevation_m via opentopodata (dataset eudem25m, täcker hela
 * Europa inkl. norra Sverige > 60°N där SRTM saknas). Används för att testa jord × landhöjning:
 * lera = finsediment avsatt under HK och höjt ur havet → låg höjd; morän/berg = över HK → hög höjd.
 *
 * Källa: EU-DEM v1.1 (Copernicus, EEA) via opentopodata.org. Fri, 1 req/s, 100 lokaler/req.
 * Ingen höjd gissas — null (hav/no-data) lagras som null.
 *
 *   node scripts/data/ingest-elevation.mjs
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const UA = 'vikingage-ingest/1.0 (research platform; https://www.vikingage.se)';
const API = 'https://api.opentopodata.org/v1/eudem25m';
const BATCH = 100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadEnv() {
  try {
    const raw = readFileSync(new URL('../../.env', import.meta.url), 'utf8');
    return Object.fromEntries(raw.split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
  } catch { return {}; }
}
const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // hämta alla punkter (även redan höjdsatta → idempotent omkörning ok)
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase.from('runestone_soil').select('signum,lat,lng').range(from, from + 999);
    if (!data || !data.length) break;
    rows.push(...data.filter((r) => r.lat != null && r.lng != null));
    if (data.length < 1000) break;
  }
  console.log(`Punkter att höjdsätta: ${rows.length}`);

  let done = 0, hit = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const locs = chunk.map((r) => `${r.lat},${r.lng}`).join('|');
    let results = [];
    for (let t = 0; t < 3; t++) {
      try {
        const r = await fetch(`${API}?locations=${locs}`, { headers: { 'User-Agent': UA } });
        if (r.status === 429) { await sleep(2000); continue; }
        const j = await r.json();
        if (j.status === 'OK') { results = j.results || []; break; }
        await sleep(1500);
      } catch { await sleep(1200); }
    }
    // skriv tillbaka per rad (update, ej upsert → rör inte övriga kolumner)
    await Promise.all(chunk.map((r, k) => {
      const e = results[k]?.elevation;
      if (e != null) hit++;
      return supabase.from('runestone_soil').update({ elevation_m: e ?? null }).eq('signum', r.signum);
    }));
    done += chunk.length;
    if (done % 300 === 0 || done >= rows.length) console.log(`  ${done}/${rows.length} (höjd hittad: ${hit})`);
    await sleep(1100); // respektera 1 req/s
  }
  console.log(`KLART. ${done} punkter, ${hit} med höjd.`);
}
main().catch((e) => { console.error(e); process.exit(1); });

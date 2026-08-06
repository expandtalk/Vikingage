// SMHI vindklimatologi → wind_climatology (vindros för Kalmarsund).
// Hämtar SMHI metobs parameter 3 (vindriktning) för närmaste Kalmarsund-station,
// binnar i 8 sektorer (N/NO/O/SO/S/SV/V/NV) och räknar frekvens %. Deterministiskt —
// ingen gissad riktning. Källa SMHI (CC BY 4.0).
//
// Användning: node scripts/data/ingest-smhi-wind.mjs [--apply]

import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const CENTER = { lat: 56.70, lng: 16.50 };           // Kalmarsund
const NAME_RE = /ölan|kalmar/i;
const BASE = 'https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/3';
const SECTORS = ['N', 'NO', 'O', 'SO', 'S', 'SV', 'V', 'NV'];  // 0,45,…,315

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const dist = (a, b) => Math.hypot(a.lat - b.lat, a.lng - b.lng);
const sectorOf = (deg) => { const d = ((deg % 360) + 360) % 360; return Math.round(d / 45) % 8; };

async function pickStation() {
  const r = await fetch(`${BASE}.json`, { headers: { 'User-Agent': 'VikingageBot/1.0 (vikingage.se)' } });
  const j = await r.json();
  const cand = (j.station || [])
    .filter(s => NAME_RE.test(s.name) && s.latitude && s.longitude)
    .map(s => ({ key: String(s.key), name: s.name, lat: s.latitude, lng: s.longitude, d: dist({ lat: s.latitude, lng: s.longitude }, CENTER) }))
    .sort((a, b) => a.d - b.d);
  return cand;
}

async function fetchCsv(key) {
  for (const period of ['corrected-archive', 'latest-months']) {
    const url = `${BASE}/station/${key}/period/${period}/data.csv`;
    const r = await fetch(url, { headers: { 'User-Agent': 'VikingageBot/1.0 (vikingage.se)' } });
    if (r.status === 200) { const t = await r.text(); if (t.includes('Vindriktning')) return { period, text: t }; }
  }
  return null;
}

function computeRose(csv) {
  const lines = csv.split(/\r?\n/);
  // Hitta data-headern (raden med "Datum" + "Vindriktning"); dataraderna följer.
  let hi = lines.findIndex(l => /(^|;)Datum;/.test(l) && /Vindriktning/.test(l));
  if (hi < 0) hi = lines.findIndex(l => /Vindriktning/.test(l) && /Datum/.test(l));
  if (hi < 0) return null;
  const header = lines[hi].split(';');
  const dirCol = header.findIndex(h => /Vindriktning/i.test(h));
  const dateCol = header.findIndex(h => /Datum/i.test(h));
  const counts = new Array(8).fill(0);
  let n = 0, dmin = null, dmax = null;
  for (let i = hi + 1; i < lines.length; i++) {
    const c = lines[i].split(';');
    if (c.length <= dirCol) continue;
    const deg = parseFloat(c[dirCol]);
    if (!isFinite(deg)) continue;
    counts[sectorOf(deg)]++; n++;
    const d = c[dateCol];
    if (d && /^\d{4}-\d{2}-\d{2}/.test(d)) { const dd = d.slice(0, 10); if (!dmin || dd < dmin) dmin = dd; if (!dmax || dd > dmax) dmax = dd; }
  }
  if (!n) return null;
  return { counts, n, dmin, dmax, pct: counts.map(c => +(100 * c / n).toFixed(1)) };
}

async function main() {
  const cand = await pickStation();
  if (!cand.length) { console.error('Ingen station matchade.'); process.exit(1); }
  let chosen = null, rose = null;
  for (const s of cand.slice(0, 6)) {
    const csv = await fetchCsv(s.key);
    if (!csv) { console.log(`  ${s.name} (${s.key}): ingen vinddata`); continue; }
    const r = computeRose(csv.text);
    if (r && r.n > 500) { chosen = { ...s, period: csv.period }; rose = r; break; }
    console.log(`  ${s.name} (${s.key}): ${r ? r.n : 0} obs — för tunt`);
  }
  if (!chosen) { console.error('Ingen station med tillräcklig vinddata.'); process.exit(1); }

  console.log(`\nVald station: ${chosen.name} (${chosen.key}), ${chosen.d.toFixed(2)}° från Kalmarsund. Period ${chosen.period}.`);
  console.log(`Obs: ${rose.n}, ${rose.dmin} → ${rose.dmax}`);
  SECTORS.forEach((s, i) => console.log(`  ${s.padEnd(2)} ${String(rose.pct[i]).padStart(5)} %`));

  if (!APPLY) { console.log('\nDRY-RUN — kör med --apply för att skriva.'); return; }

  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 120000,
  });
  await client.connect();
  try {
    for (let i = 0; i < 8; i++) {
      await client.query(
        `INSERT INTO wind_climatology (location, station, station_id, lat, lng, sector, sector_deg, frequency_pct, n_obs, period_from, period_to, source, source_license)
         VALUES ('Kalmarsund',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'SMHI','CC BY 4.0')
         ON CONFLICT (location, sector) DO UPDATE SET
           station=excluded.station, station_id=excluded.station_id, lat=excluded.lat, lng=excluded.lng,
           sector_deg=excluded.sector_deg, frequency_pct=excluded.frequency_pct, n_obs=excluded.n_obs,
           period_from=excluded.period_from, period_to=excluded.period_to`,
        [chosen.name, chosen.key, chosen.lat, chosen.lng, SECTORS[i], i * 45, rose.pct[i], rose.counts[i], rose.dmin, rose.dmax]);
    }
    console.log('\n✅ Skrivet till wind_climatology.');
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });

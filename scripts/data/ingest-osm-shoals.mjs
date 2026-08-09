// Grund/skär/sjömärken i Kalmarsund ur OSM/OpenSeaMap (ODbL) → crossing_points.
// Sjöfartsverkets djupdata är sekretessbelagd; OSM-sjömärken (natural=shoal/reef, seamark rock/
// obstruction, namngivna "grund") är öppna. Dubbelroll i modellen: grund/shoal = grunt (landningsbart +
// varning), rock/obstruction = hinder. Idempotent på source_ref=osm:<type><id>. Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const UA = { 'User-Agent': 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se; runologi)' };
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sleep = ms => new Promise(r => setTimeout(r, ms));

const Q = '[out:json][timeout:60];(node["seamark:type"~"rock|shoal|obstruction"](56.5,16.2,56.85,16.55);node["natural"~"shoal|reef"](56.5,16.2,56.85,16.55);way["natural"~"shoal|reef"](56.5,16.2,56.85,16.55);nwr["name"~"grund",i](56.5,16.2,56.85,16.55););out center 300;';

async function overpass() {
  const body = new URLSearchParams({ data: Q }).toString();
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body, headers: UA });
      if (r.status === 200) return r.json();
      await sleep(8000 * (a + 1));
    } catch { await sleep(6000 * (a + 1)); }
  }
  throw new Error('Overpass gav upp');
}

function classify(t) {
  const st = t['seamark:type'] || ''; const nat = t.natural || ''; const name = t.name || '';
  if (st === 'wreck') return null;                                   // vrak hanteras i shipwrecks
  if (nat === 'shoal' || nat === 'reef' || st === 'shoal') return 'shoal';
  if (/grund/i.test(name)) return 'grund';
  if (st === 'obstruction') return 'obstruction';
  if (st === 'rock' || nat === 'rock') return 'rock';
  return null;
}
const KLASS_NAMN = { shoal: 'Grund (grund vatten)', grund: 'Grund', rock: 'Rev/klippa', obstruction: 'Undervattenshinder' };

async function main() {
  console.log(`Hämtar OSM-grund (Kalmarsund)… (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
  const gj = await overpass();
  const seen = new Set(); const rows = [];
  for (const e of (gj.elements || [])) {
    const t = e.tags || {}; const kind = classify(t); if (!kind) continue;
    const lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon; if (lat == null || lng == null) continue;
    const ref = `osm:${e.type}${e.id}`; if (seen.has(ref)) continue; seen.add(ref);
    rows.push({ name: t.name || t['seamark:name'] || KLASS_NAMN[kind], kind, lat, lng, ref });
  }
  const byKind = rows.reduce((a, r) => (a[r.kind] = (a[r.kind] || 0) + 1, a), {});
  console.log(`Kandidater: ${rows.length} · ${JSON.stringify(byKind)}`);
  console.log('Namngivna ex:', rows.filter(r => r.name && !/^Grund|^Rev|^Under/.test(r.name)).slice(0, 12).map(r => r.name).join(', '));

  if (!APPLY) { console.log('\nDRY-RUN — inget skrivet. --apply för att skriva.'); return; }
  const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 120000 });
  await c.connect();
  try {
    let ins = 0;
    for (const r of rows) {
      const res = await c.query(
        `insert into crossing_points (name, kind, lat, lng, source, source_ref, notes)
         select $1,$2,$3,$4,'OpenStreetMap/OpenSeaMap (ODbL)',$5,'Grund/sjömärke ur OSM-sjökortslager'
         where not exists (select 1 from crossing_points where source_ref=$5)`,
        [r.name, r.kind, r.lat, r.lng, r.ref]);
      ins += res.rowCount;
    }
    console.log(`\n✅ APPLY klar: ${ins} grund/sjömärken insatta (idempotent).`);
  } finally { await c.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });

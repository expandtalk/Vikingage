// Nationell vrak-ingest ur RAÄ Fornsök (K-samsök CC0) → shipwrecks.
// Samma beprövade mönster som ingest-execution-sites.mjs: fri-text ger foto-brus, men vi behåller
// BARA poster vars entityUri innehåller /raa/lamning/ (verkliga lämningsplatser) + koordinat ur
// <gml:coordinates>. Läggs i shipwrecks (marine-vyn läser det lagret). Datering är gles i RAÄ → null
// där den saknas (aldrig gissad). Dedup: source_ref (raa:<uri>) + proximitet 50 m mot befintliga vrak.
// Kör: node scripts/data/ingest-ksamsok-wrecks.mjs [--apply]   (dry-run default = BEGIN/ROLLBACK)
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const TERMS = ['fartygslämning'];
const LABEL_RE = /fartyg|vrak|båtläm/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const dec = s => (s || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
async function ks(q, hits, start) {
  const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${hits}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent(q)}`;
  for (let a = 0; a < 4; a++) { try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 200) return await r.text(); await sleep(1200 * (a + 1)); } catch { await sleep(1000 * (a + 1)); } }
  return '';
}
const found = new Map();
for (const t of TERMS) {
  const first = await ks(`text="${t}"`, 1, 1); const total = +((first.match(/<totalHits>(\d+)/) || [])[1] || 0);
  let start = 1;
  while (start <= total) {
    const xml = await ks(`text="${t}"`, 500, start);
    const recs = xml.split('<pres:item ').slice(1).map(s => '<pres:item ' + s.split('</pres:item>')[0]);
    if (!recs.length) break;
    for (const r of recs) {
      const uri = (r.match(/<pres:entityUri>([^<]+)/) || [])[1]; if (!uri || !/\/raa\/lamning\//.test(uri)) continue;
      const name = dec((r.match(/<pres:itemLabel>([^<]+)/) || [])[1]);
      const tags = (r.match(/<pres:tag>([^<]+)/g) || []).join(' ');
      if (!LABEL_RE.test(name) && !LABEL_RE.test(tags)) continue;
      const cm = r.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</); if (!cm) continue;
      const lng = +cm[1], lat = +cm[2]; if (!(lat > 54 && lat < 70 && lng > 10 && lng < 25)) continue;
      const place = dec((r.match(/<pres:placeLabel>([^<]+)/) || [])[1]);
      const parts = place.split(',').map(s => s.trim());
      const tm = r.match(/<pres:fromTime>([^<]+)/); const yr = tm ? parseInt(tm[1], 10) : null;
      const short = uri.replace(/^https?:\/\//, '');
      if (!found.has(short)) found.set(short, { name: name || 'Fartygslämning', lat, lng, municipality: parts[2] || null, landscape: parts[3] || null, parish: parts[4] || null, yr: Number.isFinite(yr) ? yr : null });
    }
    start += 500; await sleep(400);
  }
  console.log(`  ${t}: totalHits=${total}, ackumulerat unika lämningar=${found.size}`);
}
console.log(`\nUnika RAÄ-fartygslämningar med koordinat: ${found.size}`);

const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
await c.connect();
try {
  await c.query('BEGIN');
  let ins = 0, dupRef = 0, dupProx = 0;
  for (const [short, r] of found) {
    const ref = 'raa:' + short;
    const ex = await c.query(`select 1 from shipwrecks where source_ref=$1 limit 1`, [ref]);
    if (ex.rowCount) { dupRef++; continue; }
    const near = await c.query(`select 1 from shipwrecks where geom is not null and ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, 50) limit 1`, [r.lng, r.lat]);
    if (near.rowCount) { dupProx++; continue; }
    await c.query(
      `insert into shipwrecks (name, vessel_type, geom, sinking_year, parish, municipality, landscape, coord_source, coord_precision_m, source_ref, source_license, source_attribution, notes)
       values ($1,'okänt', ST_SetSRID(ST_MakePoint($2,$3),4326), $4, $5,$6,$7, 'RAÄ Fornsök (K-samsök)', 50, $8, 'CC0', 'Riksantikvarieämbetet (Fornsök)',
               'Fartygslämning ur RAÄ Fornsök (CC0). Datering ofta ospecificerad i RAÄ → sinking_year null där den saknas.')`,
      [r.name, r.lng, r.lat, r.yr, r.parish, r.municipality, r.landscape, ref]);
    ins++;
  }
  console.log(`nya: ${ins}, dubblett source_ref: ${dupRef}, dubblett <50m: ${dupProx}`);
  if (APPLY) { await c.query('COMMIT'); console.log('✅ APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY-RUN (rollback). --apply för skarpt.'); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED:', e.message); process.exitCode = 1; }
finally { await c.end(); }

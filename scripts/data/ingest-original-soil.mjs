/**
 * ingest-original-soil.mjs — jord + höjd vid runstenarnas URSPRUNGLIGA läge.
 *
 * Många runstenar är flyttade (till kyrkor, gårdar, museer) → nuvarande koordinat mäter fel
 * jord. Den här hämtar SGU-jordart + EU-DEM-höjd vid role='original'-koordinaten ur
 * inscription_locations (första placering), så jord/landhöjnings-tesen kan prövas på RÄTT punkt.
 *
 * Källor: SGU jordarter 25–100k (GeoServer WMS GetFeatureInfo); EU-DEM 25m (opentopodata).
 * Ingen koordinat/jord gissas. Lagrar även moved_km (avstånd original→current) och certainty.
 *
 *   node scripts/data/ingest-original-soil.mjs
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const SGU_OWS = 'https://maps3.sgu.se/geoserver/jord/ows';
const SGU_LAYER = 'SE.GOV.SGU.JORD.GRUNDLAGER.25K';
const DEM = 'https://api.opentopodata.org/v1/eudem25m';
const UA = 'vikingage-ingest/1.0 (https://www.vikingage.se)';
const CONCURRENCY = 5, EPS = 0.0015;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadEnv() {
  try {
    const raw = readFileSync(new URL('../../.env', import.meta.url), 'utf8');
    return Object.fromEntries(raw.split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
  } catch { return {}; }
}
const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function fertility(j) {
  const s = (j || '').toLowerCase();
  if (!s) return 'ingen_täckning';
  if (s.includes('fyllning')) return 'urban_fyllning';
  if (s.includes('vatten')) return 'vatten';
  if (s.includes('berg') || s.includes('tunt jordtäcke') || s.includes('klapper') || s.includes('block')) return 'mager';
  if (s.includes('torv') || s.includes('mosse') || s.includes('kärr') || s.includes('myr')) return 'våtmark';
  if (s.includes('morän')) return 'moderat';
  if (s.includes('lera') || s.includes('gyttja') || s.includes('svämsediment') || s.includes('silt')) return 'bördig';
  if (s.includes('finsand')) return 'moderat';
  if (s.includes('sand') || s.includes('grus') || s.includes('isälv') || s.includes('sten') || s.includes('svall')) return 'mager';
  return 'okänd';
}
async function soilAt(lat, lng) {
  const bbox = `${lng - EPS},${lat - EPS},${lng + EPS},${lat + EPS}`;
  const u = `${SGU_OWS}?service=WMS&version=1.1.1&request=GetFeatureInfo&srs=EPSG:4326&bbox=${bbox}&width=51&height=51&x=25&y=25&layers=${SGU_LAYER}&query_layers=${SGU_LAYER}&info_format=application/json&feature_count=1`;
  for (let t = 0; t < 2; t++) {
    try { const r = await fetch(u, { headers: { 'User-Agent': UA } }); if (!r.ok) { await sleep(800); continue; }
      const j = await r.json(); return (j.features || [])[0]?.properties?.Jordart ?? null;
    } catch { await sleep(600); }
  }
  return null;
}
const km = (a, b, c, d) => 111.0 * Math.sqrt((a - c) ** 2 + ((b - d) * Math.cos(a * Math.PI / 180)) ** 2);

async function main() {
  // original + current per signum
  const { data: orig } = await supabase.from('inscription_locations')
    .select('signum,lat,lng,certainty').eq('role', 'original').not('lat', 'is', null);
  const { data: curr } = await supabase.from('inscription_locations')
    .select('signum,lat,lng').eq('role', 'current').not('lat', 'is', null);
  const cur = new Map((curr || []).map((r) => [r.signum, r]));
  const work = (orig || []).filter((r) => r.signum);
  console.log(`Ursprungslägen att hämta: ${work.length}`);

  // 1) höjd i batch (100/req, 1 req/s)
  const elev = new Map();
  for (let i = 0; i < work.length; i += 100) {
    const chunk = work.slice(i, i + 100);
    const locs = chunk.map((r) => `${r.lat},${r.lng}`).join('|');
    try { const r = await fetch(`${DEM}?locations=${locs}`, { headers: { 'User-Agent': UA } });
      const j = await r.json(); (j.results || []).forEach((x, k) => elev.set(chunk[k].signum, x.elevation));
    } catch {}
    await sleep(1100);
  }
  console.log(`Höjd hämtad för ${elev.size}`);

  // 2) SGU-jord med concurrency + skriv
  let i = 0, ok = 0, cover = 0; const buf = [];
  async function worker() {
    while (i < work.length) {
      const w = work[i++];
      const jordart = await soilAt(w.lat, w.lng);
      if (jordart) cover++;
      const c = cur.get(w.signum);
      buf.push({ signum: w.signum, lat: w.lat, lng: w.lng, jordart, fertility: fertility(jordart),
        elevation_m: elev.get(w.signum) ?? null,
        moved_km: c ? Math.round(km(w.lat, w.lng, c.lat, c.lng) * 100) / 100 : null, certainty: w.certainty });
      ok++;
      if (buf.length >= 150) await supabase.from('runestone_soil_original').upsert(buf.splice(0), { onConflict: 'signum' });
      if (ok % 100 === 0) console.log(`  ${ok}/${work.length} (jord-täckning ${cover})`);
      await sleep(60);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (buf.length) await supabase.from('runestone_soil_original').upsert(buf, { onConflict: 'signum' });
  console.log(`KLART. ${ok} original-lägen, SGU-täckning ${cover}.`);
}
main().catch((e) => { console.error(e); process.exit(1); });

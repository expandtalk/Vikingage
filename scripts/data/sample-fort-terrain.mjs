/**
 * sample-fort-terrain.mjs — läge (höjd/prominens) + jordmån per fornborg.
 *
 * Fyller swedish_hillforts.{elevation_m, rel_height_m, on_height, soil_jordart, soil_fertility}
 * så borgarna kan sorteras på "byggd på höjd" och "fattig/rik jordmån" (Daniels idé:
 * Broborg på höjd/granit vs Ölands slättborgar; Gråborg ev. mager jord).
 *
 * Höjd: opentopodata EU-DEM 25 m (Copernicus/EEA, fri, 1 req/s, 100 lokaler/req).
 *   prominens = fortets höjd minus lägsta av 4 grannar (~450 m N/S/Ö/V). on_height = prominens >= 12 m.
 * Jordmån: SGU jordarter 1:25–100k (WMS GetFeatureInfo, CC-BY), härledd bördighetsbucket (transparent regel).
 * Ingen gissning — null där täckning saknas.
 *
 *   node scripts/data/sample-fort-terrain.mjs
 * Idempotent: uppdaterar per id; kör om utan dubbletter.
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const UA = 'vikingage-ingest/1.0 (research platform; https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const DEM = 'https://api.opentopodata.org/v1/eudem25m';
const SGU_OWS = 'https://maps3.sgu.se/geoserver/jord/ows';
const SGU_LAYER = 'SE.GOV.SGU.JORD.GRUNDLAGER.25K';
const EPS = 0.0015;           // SGU centerpixel-bbox
const DLAT = 0.004, DLNG = 0.008; // grannar ~450 m vid 59°N
const ON_HEIGHT_M = 12;       // prominens-tröskel
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

// Scandinavia-säker (lat > lng): störst=lat, minst=lng.
function parsePoint(pt) {
  const m = /\(?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)?/.exec(String(pt ?? ''));
  if (!m) return null;
  const a = parseFloat(m[1]), b = parseFloat(m[2]);
  if (!isFinite(a) || !isFinite(b)) return null;
  return { lat: Math.max(a, b), lng: Math.min(a, b) };
}

function fertility(jordart) {
  const s = (jordart || '').toLowerCase();
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

async function sguAt(lat, lng) {
  const bbox = `${lng - EPS},${lat - EPS},${lng + EPS},${lat + EPS}`;
  const url = `${SGU_OWS}?service=WMS&version=1.1.1&request=GetFeatureInfo&srs=EPSG:4326`
    + `&bbox=${bbox}&width=51&height=51&x=25&y=25&layers=${SGU_LAYER}&query_layers=${SGU_LAYER}`
    + `&info_format=application/json&feature_count=1`;
  for (let t = 0; t < 2; t++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
      if (r.status === 429 || r.status >= 500) { await sleep(1500); continue; }
      if (!r.ok) return null;
      const j = await r.json();
      return (j.features || [])[0]?.properties?.Jordart ?? null;
    } catch { await sleep(600); }
  }
  return null;
}

async function demBatch(locs) {
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch(`${DEM}?locations=${locs.map((l) => `${l.lat},${l.lng}`).join('|')}`, { headers: { 'User-Agent': UA } });
      if (r.status === 429) { await sleep(2000); continue; }
      const j = await r.json();
      if (j.status === 'OK') return (j.results || []).map((x) => x?.elevation ?? null);
      await sleep(1500);
    } catch { await sleep(1200); }
  }
  return locs.map(() => null);
}

async function main() {
  const forts = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase.from('swedish_hillforts').select('id,coordinates').range(from, from + 999);
    if (!data || !data.length) break;
    for (const r of data) { const p = parsePoint(r.coordinates); if (p) forts.push({ id: r.id, ...p }); }
    if (data.length < 1000) break;
  }
  console.log(`Fornborgar att sampla: ${forts.length}`);

  // Fas 1 — höjd + prominens (fort + 4 grannar), 20 forts/batch = 100 lokaler.
  const elevById = new Map();
  for (let i = 0; i < forts.length; i += 20) {
    const chunk = forts.slice(i, i + 20);
    const locs = [];
    for (const f of chunk) {
      locs.push({ lat: f.lat, lng: f.lng });
      locs.push({ lat: f.lat + DLAT, lng: f.lng }, { lat: f.lat - DLAT, lng: f.lng },
        { lat: f.lat, lng: f.lng + DLNG }, { lat: f.lat, lng: f.lng - DLNG });
    }
    const el = await demBatch(locs);
    chunk.forEach((f, k) => {
      const base = k * 5;
      const self = el[base];
      const nb = [el[base + 1], el[base + 2], el[base + 3], el[base + 4]].filter((x) => x != null);
      const rel = (self != null && nb.length) ? self - Math.min(...nb) : null;
      elevById.set(f.id, { elevation_m: self, rel_height_m: rel, on_height: rel != null ? rel >= ON_HEIGHT_M : null });
    });
    if ((i / 20) % 5 === 0) console.log(`  höjd ${Math.min(i + 20, forts.length)}/${forts.length}`);
    await sleep(1100);
  }

  // Fas 2 — SGU jordart (concurrency 5) + skriv tillbaka allt.
  let i = 0, done = 0, soilCover = 0;
  async function worker() {
    while (i < forts.length) {
      const f = forts[i++];
      const jordart = await sguAt(f.lat, f.lng);
      if (jordart) soilCover++;
      const e = elevById.get(f.id) || {};
      await supabase.from('swedish_hillforts').update({
        elevation_m: e.elevation_m ?? null,
        rel_height_m: e.rel_height_m ?? null,
        on_height: e.on_height ?? null,
        soil_jordart: jordart,
        soil_fertility: fertility(jordart),
        terrain_sampled_at: new Date().toISOString(),
      }).eq('id', f.id);
      done++;
      if (done % 100 === 0) console.log(`  jordart+skriv ${done}/${forts.length} (SGU-täckning ${soilCover})`);
      await sleep(60);
    }
  }
  await Promise.all(Array.from({ length: 5 }, worker));
  console.log(`KLART. ${done} borgar. SGU-täckning ${soilCover}/${done}.`);
}
main().catch((e) => { console.error(e); process.exit(1); });

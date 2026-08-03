/**
 * ingest-sgu-soil.mjs — jordart (bördig/mager) per runsten ur SGU:s öppna data.
 *
 * Frågar SGU OGC API Features (jordarter 1:25k–100k, collection `ytlager`) för varje
 * runstens WGS84-koordinat och lagrar SGU:s RÅklass (jy1_tx) + en HÄRLEDD bördighets-
 * bucket i public.runestone_soil. Ingen jord gissas — allt kommer ur SGU-polygonen som
 * täcker punkten. Bördighets-bucketen är en transparent, dokumenterad regel över råklassen
 * (råklassen sparas så vem som helst kan omklassificera).
 *
 * Källa: Sveriges geologiska undersökning (SGU), Jordarter 1:25 000–1:100 000, CC-BY.
 * Attribuering krävs vid visning.
 *
 * Kohorter: 'title' = stenar i runic_title_occurrences; 'baseline' = slumpurval av övriga
 * georefererade inskrifter (för jämförelse titel vs generellt).
 *
 * Idempotent/resumbar: hoppar över signum som redan finns i runestone_soil.
 *   node scripts/data/ingest-sgu-soil.mjs [baselineN=1000]
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// SGU jordarter 25–100k (GeoServer WMS GetFeatureInfo) — täcker hela karterade södra
// Sverige i rätt upplösning (den nya vektor-OGC-API:n täcker ännu bara Blekinge; 1:1M är
// för grov). Attribut: properties.Jordart (svensk råklass).
const SGU_OWS = 'https://maps3.sgu.se/geoserver/jord/ows';
const SGU_LAYER = 'SE.GOV.SGU.JORD.GRUNDLAGER.25K';
const UA = 'vikingage-ingest/1.0 (research platform; https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const CONCURRENCY = 5;
const EPS = 0.0015; // ~110–150 m bbox; centerpixel = punkten
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadEnv() {
  try {
    const raw = readFileSync(new URL('../../.env', import.meta.url), 'utf8');
    return Object.fromEntries(raw.split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
  } catch { return {}; }
}
const env = loadEnv();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
);

// Härled bördighet ur SGU:s råklass (Jordart). Ordning betyder något: morän FÖRE lera så
// "Moränlera/lerig morän" hamnar i moderat (inte bördig). Fyllning/vatten = ej naturlig jord.
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

// WMS 1.1.1 GetFeatureInfo mot GeoServer; EPSG:4326 = lon,lat-ordning; centerpixel = punkten.
async function sguAt(lat, lng, tries = 2) {
  const bbox = `${lng - EPS},${lat - EPS},${lng + EPS},${lat + EPS}`;
  const url = `${SGU_OWS}?service=WMS&version=1.1.1&request=GetFeatureInfo&srs=EPSG:4326`
    + `&bbox=${bbox}&width=51&height=51&x=25&y=25`
    + `&layers=${SGU_LAYER}&query_layers=${SGU_LAYER}&info_format=application/json&feature_count=1`;
  for (let t = 0; t < tries; t++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
      if (r.status === 429 || r.status >= 500) { await sleep(1500); continue; }
      if (!r.ok) return { jordart: null, code: null, kartering: null };
      const j = await r.json();
      const p = (j.features || [])[0]?.properties || null;
      if (!p) return { jordart: null, code: null, kartering: null };
      return { jordart: p.Jordart ?? null, code: p.symbol ?? null, kartering: p.Kartering ?? null };
    } catch { await sleep(600); }
  }
  return { jordart: null, code: null, kartering: null };
}

// Scandinavia-säker: lat > lng här, så störst=lat minst=lng.
const latOf = (a, b) => Math.max(a, b);
const lngOf = (a, b) => Math.min(a, b);
function parsePoint(pt) {
  const m = /\(?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)?/.exec(String(pt ?? ''));
  if (!m) return null;
  const a = parseFloat(m[1]), b = parseFloat(m[2]);
  if (!isFinite(a) || !isFinite(b)) return null;
  return { lat: latOf(a, b), lng: lngOf(a, b) };
}

async function main() {
  const baselineN = parseInt(process.argv[2] || '1000', 10);

  // redan hämtade (resumbarhet)
  const done = new Set();
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase.from('runestone_soil').select('signum').range(from, from + 999);
    if (!data || !data.length) break;
    data.forEach((r) => done.add(r.signum));
    if (data.length < 1000) break;
  }

  // titel-stenar
  const titleSet = new Map();
  {
    const { data } = await supabase.from('runic_title_occurrences')
      .select('signum,lat,lng').not('lat', 'is', null);
    (data || []).forEach((r) => { if (r.signum && !titleSet.has(r.signum)) titleSet.set(r.signum, { lat: r.lat, lng: r.lng }); });
  }

  // baseline-urval ur alla georefererade inskrifter
  const all = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase.from('runic_inscriptions')
      .select('signum,coordinates').not('coordinates', 'is', null).range(from, from + 999);
    if (!data || !data.length) break;
    data.forEach((r) => { const p = parsePoint(r.coordinates); if (p && r.signum) all.push({ signum: r.signum, ...p }); });
    if (data.length < 1000) break;
  }
  // Fisher–Yates → slumpa, plocka baselineN som inte är titel-stenar
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  const baseline = new Map();
  for (const r of all) { if (baseline.size >= baselineN) break; if (!titleSet.has(r.signum)) baseline.set(r.signum, { lat: r.lat, lng: r.lng }); }

  // arbetslista
  const work = [];
  for (const [signum, p] of titleSet) if (!done.has(signum)) work.push({ signum, ...p, cohort: 'title' });
  for (const [signum, p] of baseline) if (!done.has(signum)) work.push({ signum, ...p, cohort: 'baseline' });

  console.log(`Titel-stenar: ${titleSet.size}, baseline-urval: ${baseline.size}, redan klara: ${done.size}, att hämta: ${work.length}`);

  let i = 0, ok = 0, cover = 0;
  const buffer = [];
  async function worker() {
    while (i < work.length) {
      const idx = i++; const w = work[idx];
      const res = await sguAt(w.lat, w.lng);
      const fert = fertility(res.jordart);
      if (res.jordart) cover++;
      buffer.push({ signum: w.signum, lat: w.lat, lng: w.lng, jordart: res.jordart, jordart_code: res.code,
        fertility: fert, sgu_kartering: res.kartering, cohort: w.cohort });
      ok++;
      if (buffer.length >= 200) { const chunk = buffer.splice(0, buffer.length); await supabase.from('runestone_soil').upsert(chunk, { onConflict: 'signum' }); }
      if (ok % 100 === 0) console.log(`  ${ok}/${work.length} (täckning ${cover})`);
      await sleep(60);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (buffer.length) await supabase.from('runestone_soil').upsert(buffer, { onConflict: 'signum' });
  console.log(`KLART. Hämtade ${ok}, SGU-täckning ${cover}/${ok}.`);
}
main().catch((e) => { console.error(e); process.exit(1); });

/**
 * test-esker-null.mjs — null-modell för väg-/ås-tesen.
 *
 * Väg-tesen: runstenar restes vid vägarna, som ofta gick på rullstensåsar (torra, framkomliga)
 * genom det blöta lerlandskapet. Test: sitter stenen oftare på åsmaterial (Isälvssediment) än
 * en SLUMPPUNKT 2–4 km bort i samma trakt? Om ja — stenen på åsen, leran (rikedomen) runtom.
 *
 * För varje originalplacerad sten (runestone_soil_original) genereras EN slumppunkt (slumpad
 * bäring, avstånd 2–4 km) vars SGU-jordart hämtas → runestone_esker_null. Jämförs sen i SQL.
 * Källa: SGU jordarter 25–100k (GeoServer). Endast runstenar (800–1100), ej fornborgar.
 *
 *   node scripts/data/test-esker-null.mjs
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const SGU_OWS = 'https://maps3.sgu.se/geoserver/jord/ows';
const SGU_LAYER = 'SE.GOV.SGU.JORD.GRUNDLAGER.25K';
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

async function main() {
  const { data } = await supabase.from('runestone_soil_original')
    .select('signum,lat,lng').not('lat', 'is', null);
  const work = data || [];
  console.log(`Slumppunkter (2–4 km) för ${work.length} stenar`);

  // jitter: slumpad bäring, avstånd 2000–4000 m. Math.random ok (fristående script).
  const jittered = work.map((r) => {
    const bearing = Math.random() * 2 * Math.PI;
    const dist = 2000 + Math.random() * 2000;
    const dlat = (dist * Math.cos(bearing)) / 111000;
    const dlng = (dist * Math.sin(bearing)) / (111000 * Math.cos(r.lat * Math.PI / 180));
    return { signum: r.signum, lat: r.lat + dlat, lng: r.lng + dlng };
  });

  let i = 0, ok = 0, cover = 0; const buf = [];
  async function worker() {
    while (i < jittered.length) {
      const w = jittered[i++];
      const jordart = await soilAt(w.lat, w.lng);
      if (jordart) cover++;
      buf.push({ signum: w.signum, lat: w.lat, lng: w.lng, jordart });
      ok++;
      if (buf.length >= 150) await supabase.from('runestone_esker_null').upsert(buf.splice(0), { onConflict: 'signum' });
      if (ok % 150 === 0) console.log(`  ${ok}/${jittered.length} (täckning ${cover})`);
      await sleep(60);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (buf.length) await supabase.from('runestone_esker_null').upsert(buf, { onConflict: 'signum' });
  console.log(`KLART. ${ok} slumppunkter, täckning ${cover}.`);
}
main().catch((e) => { console.error(e); process.exit(1); });

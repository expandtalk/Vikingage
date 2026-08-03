/**
 * run-wikidata-hospitals.mjs — Wikidata-reconciliad ingest av HISTORISKA hospital/
 * helgeandshus i Sverige → christian_sites (site_type='hospital').
 *
 * Klass: wd:Q180370 = "hospital" i historisk mening (allmoseinrättning/helgeandshus),
 * SKILT från wd:Q16917 "sjukhus" (167 moderna lasarett i SE = brus). Verifierat mot
 * kända medeltida hus (Helgeand Visby Q10519523 = P31 Q180370; Skänninge hospital).
 * Filter <1700 håller ute barnhem/fattighus/lasarett från 1700–1800-tal.
 *
 * Egen SPARQL+upsert (christian_sites har point-kolumn, inte lat/lng → passar ej den
 * generiska runIngest-wrappern). ENDAST FAKTA: namn, P625-koordinat (aldrig ur minnet),
 * inceptionsår, kommun, QID. Idempotent (upsert på wikidata_qid). Kör:
 *   node scripts/data/run-wikidata-hospitals.mjs
 */
import { pathToFileURL } from 'node:url';
import { getSupabaseClient, qidFromUri } from './ingest-wikidata-features.mjs';

const UA = 'vikingage-ingest/1.0 (research platform; https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const SPARQL = 'https://query.wikidata.org/sparql';
const QUERY = `
  SELECT ?item ?itemLabel ?lat ?lng ?adminLabel ?inception WHERE {
    ?item wdt:P31 wd:Q180370 .
    ?item wdt:P17 wd:Q34 .
    ?item p:P625/psv:P625 ?c . ?c wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
    OPTIONAL { ?item wdt:P571 ?inception }
    OPTIONAL { ?item wdt:P131 ?admin }
    FILTER(!BOUND(?inception) || YEAR(?inception) < 1700)
    SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
  }`;

const incYear = (v) => { const m = /^(-?\d{1,4})/.exec(v || ''); return m ? parseInt(m[1], 10) : null; };
// period NOT NULL + check-constraint (early_christian|medieval|late_medieval|post_medieval).
// Frågan är redan begränsad till wd:Q180370 (HISTORISKT hospital) + <1700, så instanser
// utan inceptionsår är medeltida institutioner (helgeandshus) — 'medieval' är den ärliga
// grova hinken; känt inceptionsår 1520–1699 → 'post_medieval'.
const periodFromInception = (v) => {
  const y = incYear(v);
  if (y == null || y < 1520) return 'medieval';
  return 'post_medieval';
};

async function main() {
  console.log('=== Wikidata (Q180370, historiskt hospital) → christian_sites ===');
  const url = `${SPARQL}?query=${encodeURIComponent(QUERY)}&format=json`;
  const res = await fetch(url, { headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA } });
  if (!res.ok) { console.error('SPARQL HTTP', res.status, (await res.text()).slice(0, 300)); process.exit(1); }
  const bindings = (await res.json())?.results?.bindings ?? [];
  console.log(`Hämtade ${bindings.length} rader.`);

  const byQid = new Map();
  for (const b of bindings) {
    const lat = parseFloat(b.lat?.value), lng = parseFloat(b.lng?.value);
    const qid = qidFromUri(b.item?.value);
    const name = b.itemLabel?.value?.trim();
    if (!qid || !name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    byQid.set(qid, {
      wikidata_qid: qid,
      name,
      coordinates: `(${lng},${lat})`, // point (lng,lat) som övriga christian_sites
      site_type: 'hospital',
      period: periodFromInception(b.inception?.value),
      founded_year: incYear(b.inception?.value),
      region: b.adminLabel?.value || null,
    });
  }
  const rows = [...byQid.values()];
  console.log(`Unika rader m. koord: ${rows.length}`);
  for (const r of rows) console.log(`  ${r.wikidata_qid}  ${r.name} — ${r.period}${r.founded_year ? ` (${r.founded_year})` : ''} — ${r.region || ''}`);
  if (!rows.length) return;

  const supabase = getSupabaseClient();
  const { error, count } = await supabase.from('christian_sites')
    .upsert(rows, { onConflict: 'wikidata_qid', count: 'exact' });
  if (error) { console.error('UPSERT-FEL:', error.message); process.exit(1); }
  console.log(`\nUpsertade ${count ?? rows.length} rader i christian_sites (site_type=hospital).`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

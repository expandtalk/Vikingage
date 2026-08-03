/**
 * run-hospitals-curated.mjs — kuraterad ingest av MEDELTIDA helgeandshus / S:t Jörgens-
 * hospital (spetälskehus) / hospitalskyrkor → christian_sites (site_type='hospital').
 *
 * Varför kuraterad och inte ren automatik: Wikidatas fritextträff på "hospital/helgeand/
 * jörgen" innehåller mycket brus (Helgeandsgatan-hus, Hospitalsträdgården 1–10, Jörgen
 * Kocks hus, palats) och sentida byggnader (1725/1767/1893/1968). Listan nedan är HANDVALD
 * till institutioner vars TYP är medeltida (helgeandshus, S:t Jörgens spetälskehus,
 * hospitalskyrka) — dokumenterad allmän fakta, ingen gissning. KOORDINATEN hämtas live ur
 * Wikidata P625 (aldrig ur minnet); står byggnaden yngre än institutionen noteras det.
 * Idempotent (upsert på wikidata_qid). Kör: node scripts/data/run-hospitals-curated.mjs
 */
import { pathToFileURL } from 'node:url';
import { getSupabaseClient } from './ingest-wikidata-features.mjs';

const UA = 'vikingage-ingest/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';

// Handvald: QID → metadata. period ur institutionstyp (medeltida); founded_year bara där
// belagt. note = kort proveniens/varning. Koordinat hämtas separat ur P625.
const CURATED = {
  Q10710241: { name: 'Uppsala helgeandshus', period: 'medieval', founded_year: null,
    note: 'Medeltida helgeandshus i Uppsala. Koordinat Wikidata P625.' },
  Q120638066: { name: 'S:t Jörgens hospitalskyrka, Lund', period: 'medieval', founded_year: 1100,
    note: 'Medeltida spetälskehus (S:t Jörgen), Lund. Kyrka belagd fr.o.m. 1100-tal (Wikidata P571). Koordinat P625.' },
  Q29473588: { name: 'S:t Jörgens hospital, Kristianstad', period: 'medieval', founded_year: null,
    note: 'S:t Jörgens spetälskehus (medeltida institution, Vä-/Åhustrakten → Kristianstad). Koordinat P625.' },
  Q10659403: { name: 'S:t Jörgens kapell, Varberg', period: 'medieval', founded_year: null,
    note: 'Medeltida spetälskehus-kapell (S:t Jörgen), Varberg/Getakärr. Koordinat P625.' },
  Q10526507: { name: 'Hospitalshuset, Jönköping', period: 'medieval', founded_year: null,
    note: 'Jönköpings medeltida hospital. Nuvarande byggnad kan vara yngre; koordinat P625.' },
  Q29473303: { name: 'Helgeandshuset, Kristianstad', period: 'medieval', founded_year: null,
    note: 'Helgeandshus-institution (medeltida typ; Kristianstad efterföljare). Koordinat P625.' },
  Q126921828: { name: 'Uppsala hospitalskyrka', period: 'medieval', founded_year: null,
    note: 'Uppsala hospital (medeltida institution). Nuvarande byggnad kan vara yngre; koordinat P625.' },
};

async function fetchCoords(qids) {
  const q = `SELECT ?item ?lat ?lng ?adminLabel WHERE {
    VALUES ?item { ${qids.map((x) => 'wd:' + x).join(' ')} }
    ?item p:P625/psv:P625 ?c . ?c wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
    OPTIONAL { ?item wdt:P131 ?admin }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
  }`;
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(q)}&format=json`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(url, { headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA } });
    if (r.ok) return (await r.json())?.results?.bindings ?? [];
    console.warn(`  WDQS HTTP ${r.status} — retry ${attempt + 1}/4 om 6s...`);
    await new Promise((s) => setTimeout(s, 6000));
  }
  throw new Error('WDQS gav upp efter 4 försök.');
}

async function main() {
  const qids = Object.keys(CURATED);
  console.log(`Hämtar P625 för ${qids.length} kuraterade helgeandshus/hospital...`);
  const bindings = await fetchCoords(qids);
  const coord = new Map();
  for (const b of bindings) {
    const qid = b.item.value.split('/').pop();
    coord.set(qid, { lat: parseFloat(b.lat.value), lng: parseFloat(b.lng.value), admin: b.adminLabel?.value || null });
  }
  const rows = [];
  for (const [qid, meta] of Object.entries(CURATED)) {
    const c = coord.get(qid);
    if (!c || !Number.isFinite(c.lat) || !Number.isFinite(c.lng)) { console.warn(`  SAKNAR koord för ${qid} (${meta.name}) — hoppar (ingen gissning).`); continue; }
    rows.push({
      wikidata_qid: qid, name: meta.name, coordinates: `(${c.lng},${c.lat})`,
      site_type: 'hospital', period: meta.period, founded_year: meta.founded_year,
      region: c.admin, historical_notes: meta.note,
    });
    console.log(`  ${qid}  ${meta.name} — (${c.lat.toFixed(5)},${c.lng.toFixed(5)}) ${c.admin || ''}`);
  }
  if (!rows.length) { console.log('Inget att skriva.'); return; }
  const supabase = getSupabaseClient();
  const { error, count } = await supabase.from('christian_sites').upsert(rows, { onConflict: 'wikidata_qid', count: 'exact' });
  if (error) { console.error('UPSERT-FEL:', error.message); process.exit(1); }
  console.log(`\nUpsertade ${count ?? rows.length} rader i christian_sites (site_type=hospital).`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

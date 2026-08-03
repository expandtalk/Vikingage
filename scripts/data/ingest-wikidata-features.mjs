/**
 * ingest-wikidata-features.mjs — återanvändbar Wikidata SPARQL → Supabase-ingest.
 *
 * Hämtar geografiska objekt från Wikidata (verifierade P625-koordinater, CC0-data)
 * och upsertar dem i valfri måltabell (onConflict: 'wikidata_qid'). Ingen koordinat
 * uppfinns — allt kommer direkt ur Wikidatas P625-nod. Endast FAKTA lagras
 * (namn, koord, adminomr, QID) — ingen brödtext/beskrivning.
 *
 * Detta är ett BIBLIOTEK (exporterar `runIngest`), inte en körbar fil i sig — se
 * `run-wikidata-bays.mjs` / `run-wikidata-beaches.mjs` (eller motsvarande CLI-anrop)
 * för konkreta körningar mot bays/experiences.
 *
 * Konventioner (matchar övriga scripts/data/*.mjs):
 *   - Läser .env manuellt (samma parser som ingest-tradition-stones.mjs m.fl.)
 *   - Supabase-klient: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (skrivroll, server-side)
 *   - Idempotent: upsert på wikidata_qid, säker att köra om
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const UA = 'vikingage-ingest/1.0 (research platform; https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadEnv() {
  try {
    const raw = readFileSync(new URL('../../.env', import.meta.url), 'utf8');
    return Object.fromEntries(
      raw.split(/\r?\n/)
        .filter((l) => l && !l.startsWith('#') && l.includes('='))
        .map((l) => {
          const i = l.indexOf('=');
          return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
        })
    );
  } catch {
    return {};
  }
}

export function getSupabaseClient() {
  const env = loadEnv();
  const url = process.env.SUPABASE_URL || env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Saknar VITE_SUPABASE_URL och/eller SUPABASE_SERVICE_ROLE_KEY (.env eller miljö).');
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/** Extraherar QID ur en Wikidata-entitets-URI, t.ex. http://www.wikidata.org/entity/Q12345 -> Q12345 */
export function qidFromUri(uri) {
  const m = /\/(Q\d+)$/.exec(uri || '');
  return m ? m[1] : null;
}

/**
 * Kör en SPARQL-query mot Wikidata Query Service. Retry:ar en gång vid timeout/429.
 * Returnerar arrayen av "bindings" (results.bindings) från sparql-results+json.
 */
async function runSparql(query) {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;
  const attempt = async () => {
    const res = await fetch(url, {
      headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA },
    });
    if (res.status === 429 || res.status === 504 || res.status === 503) {
      const err = new Error(`Wikidata SPARQL HTTP ${res.status}`);
      err.retryable = true;
      throw err;
    }
    if (!res.ok) {
      throw new Error(`Wikidata SPARQL HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    const json = await res.json();
    return json?.results?.bindings ?? [];
  };
  try {
    return await attempt();
  } catch (e) {
    if (!e.retryable) throw e;
    console.warn(`  SPARQL ${e.message} — väntar 5s och försöker en gång till...`);
    await sleep(5000);
    return await attempt(); // om detta kastar igen får anroparen felet
  }
}

/**
 * Kör en fullständig ingest: SPARQL → mappning → upsert.
 *
 * @param {object} opts
 * @param {string} opts.query           SPARQL-query (måste binda ?item ?lat ?lng, ev. ?itemLabel/?adminLabel).
 * @param {string} opts.table           Måltabell (t.ex. 'bays', 'experiences').
 * @param {(binding: Record<string, {value:string}>) => (object|null)} opts.mapRow
 *        Mappningsfunktion: SPARQL-binding -> rad att upserta, eller null för att hoppa över
 *        (t.ex. saknad koordinat). Ska INTE sätta wikidata_qid manuellt om binding har ?item —
 *        det görs av wrappern, men mapRow kan override:a genom att sätta wikidata_qid själv.
 * @param {string} [opts.itemVar='item']  Variabelnamn i SPARQL för entitets-URI:n (för QID-extraktion).
 * @param {number} [opts.batchSize=200]   Antal rader per upsert-anrop.
 * @returns {Promise<{fetched:number, upserted:number, skippedNoCoord:number, errors:number}>}
 */
export async function runIngest({ query, table, mapRow, itemVar = 'item', batchSize = 200 }) {
  if (!query || !table || typeof mapRow !== 'function') {
    throw new Error('runIngest kräver { query, table, mapRow }.');
  }
  console.log(`\n=== Wikidata → ${table} ===`);
  console.log('Frågar Wikidata SPARQL-endpoint...');

  let bindings;
  try {
    bindings = await runSparql(query);
  } catch (e) {
    console.error(`FEL: SPARQL-frågan misslyckades: ${e.message}`);
    return { fetched: 0, upserted: 0, skippedNoCoord: 0, errors: 1, failed: true };
  }
  console.log(`Hämtade ${bindings.length} rader från Wikidata.`);

  const rows = [];
  let skippedNoCoord = 0;
  for (const b of bindings) {
    const latRaw = b.lat?.value;
    const lngRaw = b.lng?.value;
    if (latRaw == null || lngRaw == null) { skippedNoCoord++; continue; }
    const lat = parseFloat(latRaw);
    const lng = parseFloat(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { skippedNoCoord++; continue; }

    const itemUri = b[itemVar]?.value ?? '';
    const qid = qidFromUri(itemUri);
    if (!qid) { skippedNoCoord++; continue; } // ingen QID = inget att upserta/konfliktera på

    const mapped = mapRow(b, { qid, itemUri, lat, lng });
    if (!mapped) { skippedNoCoord++; continue; }
    if (mapped.lat == null || mapped.lng == null) { skippedNoCoord++; continue; }

    rows.push({ wikidata_qid: qid, ...mapped });
  }

  // Deduplicera på wikidata_qid (Wikidata kan returnera flera admin-rader per item pga OPTIONAL-join).
  const byQid = new Map();
  for (const r of rows) byQid.set(r.wikidata_qid, r);
  const uniqueRows = [...byQid.values()];

  console.log(`Mappade ${uniqueRows.length} unika rader med koordinat (${skippedNoCoord} hoppade över: saknad koord/QID).`);

  if (!uniqueRows.length) {
    return { fetched: bindings.length, upserted: 0, skippedNoCoord, errors: 0 };
  }

  const supabase = getSupabaseClient();
  let upserted = 0;
  let errors = 0;
  for (let i = 0; i < uniqueRows.length; i += batchSize) {
    const batch = uniqueRows.slice(i, i + batchSize);
    const { error, count } = await supabase
      .from(table)
      .upsert(batch, { onConflict: 'wikidata_qid', count: 'exact' });
    if (error) {
      console.error(`  FEL vid upsert (batch ${i}-${i + batch.length}): ${error.message}`);
      errors++;
      continue;
    }
    upserted += count ?? batch.length;
    console.log(`  upsertade batch ${i}-${i + batch.length} (${batch.length} rader)`);
  }

  console.log(`Klart: ${upserted} rader upsertade i ${table}, ${skippedNoCoord} hoppade (ingen koord/QID), ${errors} batch-fel.`);
  return { fetched: bindings.length, upserted, skippedNoCoord, errors };
}

// ---------------------------------------------------------------------------
// CLI-läge: körs skriptet direkt (node scripts/data/ingest-wikidata-features.mjs)
// exekveras de två konfigurerade ingesterna: svenska vikar → bays, och svenska
// badplatser → experiences. Andra ingester kan importera `runIngest` ovan och
// definiera egna { query, table, mapRow }-konfigurationer.
// ---------------------------------------------------------------------------

const commonMap = (b, { itemUri, lat, lng }) => ({
  name: b.itemLabel?.value || null,
  lat,
  lng,
  municipality: b.adminLabel?.value || null,
  coord_precision: 'verifierad',
  coord_source: 'wikidata:P625',
  source: 'Wikidata',
  source_uri: itemUri,
});

// (A) Svenska vikar (Q39594 = bay/vik) → bays
// OBS/KORRIGERING: uppdragets ursprungliga query angav wd:Q34038, men det QID:et är
// Wikidatas "waterfall" (vattenfall) — verifierat mot Special:EntityData/Q34038.json
// (labels.en = "waterfall", desc = "place where water flows over a steep or vertical
// drop"). Rätt QID för "bay" (vik) är Q39594 (verifierat likadant: labels.en="bay",
// labels.sv="vik"). Korrigerat här för att undvika att lagra vattenfall i bays-tabellen.
const BAYS_CONFIG = {
  table: 'bays',
  query: `
    SELECT ?item ?itemLabel ?lat ?lng ?adminLabel WHERE {
      ?item wdt:P31/wdt:P279* wd:Q39594 .
      ?item wdt:P17 wd:Q34 .
      ?item p:P625/psv:P625 ?coordNode .
      ?coordNode wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
      OPTIONAL { ?item wdt:P131 ?admin . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
    }`,
  mapRow: (b, ctx) => ({
    ...commonMap(b, ctx),
    water_body: null, // okänt/ospecificerat i denna query — ingen gissning
  }),
};

// (B) Svenska badplatser/stränder (Q40080 = beach) → experiences
const BEACHES_CONFIG = {
  table: 'experiences',
  query: `
    SELECT ?item ?itemLabel ?lat ?lng ?adminLabel WHERE {
      ?item wdt:P31/wdt:P279* wd:Q40080 .
      ?item wdt:P17 wd:Q34 .
      ?item p:P625/psv:P625 ?coordNode .
      ?coordNode wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
      OPTIONAL { ?item wdt:P131 ?admin . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
    }`,
  mapRow: (b, ctx) => ({
    ...commonMap(b, ctx),
    category: 'badplats',
    subtype: 'strand',
    season_from_month: 5,
    season_to_month: 9,
    persona_tags: ['badgast'],
  }),
};

async function main() {
  const results = {};
  results.bays = await runIngest(BAYS_CONFIG);
  results.experiences = await runIngest(BEACHES_CONFIG);
  console.log('\n=== Sammanfattning ===');
  for (const [table, r] of Object.entries(results)) {
    console.log(`${table}: fetched=${r.fetched} upserted=${r.upserted} skippedNoCoord=${r.skippedNoCoord} errors=${r.errors}${r.failed ? ' FAILED' : ''}`);
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

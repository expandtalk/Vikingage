/**
 * Importskript för ortnamnslagret (GIS-pilot).
 * Design: docs/superpowers/specs/2026-07-17-ortnamn-gis-pilot-design.md
 *
 * Läser Lantmäteriets ortnamnsdata (GeoJSON), matchar varje namn mot element-katalogen,
 * kastar det som inte matchar, och upsertar träffarna till Supabase-tabellen place_names.
 *
 * KÖR:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx tsx scripts/import-place-names.ts <sökväg-till-ortnamn.geojson>
 *
 * TVÅ SAKER MÅSTE BEKRÄFTAS MOT DEN RIKTIGA FILEN (se ANTAGANDEN nedan):
 *   1. Fältnamnen i properties (name/objekttyp) — Lantmäteriets schema.
 *   2. Koordinatsystemet. Lantmäteriet levererar ofta SWEREF99 TM (EPSG:3006), medan
 *      kartan använder WGS84 (lat/lng). Då krävs omprojicering — se reprojectIfNeeded().
 *
 * Skriptet SEEDAR inga handplockade exempel. Det importerar alla namn som matchar
 * reglerna i hela filen — ingen geografisk eller antalsmässig trunkering (rapport §5.1).
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import {
  matchElements,
  categoryForKeys,
  PLACE_NAME_ELEMENTS,
} from '../src/utils/placeNameElements';

// ---- ANTAGANDEN (bekräfta mot den riktiga filen) ----
const FIELD = {
  // Lantmäteriets namnattribut. Vanliga kandidater: 'namn', 'ortnamn', 'text'.
  name: 'namn',
  // Objekttyp/kategori.
  featureType: 'objekttyp',
  // Stabilt externt id om det finns; annars faller vi tillbaka på namn+koordinat.
  externalId: 'id',
};
// Sätt true om filen är SWEREF99 TM (EPSG:3006) och måste omprojiceras till WGS84.
const INPUT_IS_SWEREF99_TM = false;
const SOURCE = 'lantmateriet_ortnamn';
const SOURCE_LICENSE = 'CC BY 4.0';
// -----------------------------------------------------

interface GeoJSONFeature {
  type: 'Feature';
  geometry: { type: string; coordinates: [number, number] };
  properties: Record<string, unknown>;
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const inputPath = process.argv[2];

if (!url || !serviceKey) {
  console.error('Saknar SUPABASE_URL och/eller SUPABASE_SERVICE_ROLE_KEY i miljön.');
  process.exit(1);
}
if (!inputPath) {
  console.error('Ange sökväg till GeoJSON-fil: npx tsx scripts/import-place-names.ts <fil>');
  process.exit(1);
}

/**
 * Omprojicera vid behov. För SWEREF99 TM krävs proj4 (lägg till som devDependency och
 * implementera här). Kastar tills det är gjort, så vi aldrig importerar fel koordinater.
 */
function reprojectIfNeeded(x: number, y: number): { lng: number; lat: number } {
  if (!INPUT_IS_SWEREF99_TM) {
    // Antas redan vara WGS84: GeoJSON-ordning är [lng, lat].
    return { lng: x, lat: y };
  }
  throw new Error(
    'INPUT_IS_SWEREF99_TM=true men omprojicering är inte implementerad. ' +
      'Lägg till proj4 och konvertera EPSG:3006 → EPSG:4326 här innan import.'
  );
}

function main() {
  const raw = readFileSync(inputPath, 'utf-8');
  const geo = JSON.parse(raw) as { features?: GeoJSONFeature[] };
  const features = geo.features ?? [];

  const perElement: Record<string, number> = Object.fromEntries(
    PLACE_NAME_ELEMENTS.map((e) => [e.key, 0])
  );
  let scanned = 0;
  let skippedNoName = 0;
  let skippedNoMatch = 0;

  const rows = features.flatMap((f) => {
    scanned++;
    const name = (f.properties?.[FIELD.name] as string | undefined)?.trim();
    if (!name) {
      skippedNoName++;
      return [];
    }
    const elementKeys = matchElements(name);
    if (elementKeys.length === 0) {
      skippedNoMatch++;
      return [];
    }
    elementKeys.forEach((k) => (perElement[k] += 1));

    const coords = f.geometry?.coordinates;
    if (!coords || coords.length < 2) return [];
    const { lng, lat } = reprojectIfNeeded(coords[0], coords[1]);

    const external =
      (f.properties?.[FIELD.externalId] as string | undefined) ?? `${name}@${lat.toFixed(5)},${lng.toFixed(5)}`;

    return [
      {
        name,
        lat,
        lng,
        element_keys: elementKeys,
        element_category: categoryForKeys(elementKeys),
        feature_type: (f.properties?.[FIELD.featureType] as string | undefined) ?? null,
        source: SOURCE,
        source_license: SOURCE_LICENSE,
        external_id: external,
        imported_at: new Date().toISOString(),
      },
    ];
  });

  // DENOMINATOR (rapport §5.1/§5.3) — urvalet är transparent.
  console.log('--- Import-rapport ---');
  console.log(`Genomsökta namn:        ${scanned}`);
  console.log(`Utan namn (kastade):    ${skippedNoName}`);
  console.log(`Utan element (kastade): ${skippedNoMatch}`);
  console.log(`Träffar (importeras):   ${rows.length}`);
  console.log('Per element:');
  Object.entries(perElement).forEach(([k, n]) => console.log(`  ${k.padEnd(8)} ${n}`));
  console.log('----------------------');

  if (rows.length === 0) {
    console.log('Inga träffar — inget att importera.');
    return;
  }

  const supabase = createClient(url!, serviceKey!, { auth: { persistSession: false } });

  // Upsert i batchar på (source, external_id) — idempotent.
  const BATCH = 500;
  (async () => {
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const { error } = await supabase
        .from('place_names')
        .upsert(batch, { onConflict: 'source,external_id' });
      if (error) {
        console.error(`Fel vid upsert av batch ${i}-${i + batch.length}:`, error.message);
        process.exit(1);
      }
      console.log(`Upsertade ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
    }
    console.log('Klart.');
  })();
}

main();

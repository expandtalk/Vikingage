#!/usr/bin/env node
// Ingest av Lantmäteriets Markhöjdmodell (1 m DTM, bar jord) för ett AVGRÄNSAT område (AOI).
//
// VARFÖR AOI och inte hela Sverige: 1 m-DTM för hela landet = ~tiotusentals tiles/terabyte. Vi hämtar
// bara de tiles som skär ett område (Öland/Kalmarsund/egen bbox) via STAC POST /search.
//
// ANVÄNDNING:
//   node scripts/data/ingest-hojd.mjs --region=oland --dry            # bara rapport (funkar NU, kräver ej dl1)
//   node scripts/data/ingest-hojd.mjs --bbox=16.3,56.6,16.6,56.8 --dry
//   node scripts/data/ingest-hojd.mjs --region=oland --out=../hojd-oland   # skarp nedladdning (kräver dl1-behörighet)
//
// FLAGGOR:
//   --region=<oland|kalmarsund|kalmar>   fördefinierat AOI-fönster (approx sökruta, EJ påstådd platskoordinat)
//   --bbox=minLon,minLat,maxLon,maxLat   eget AOI i WGS84
//   --out=<dir>                          målkatalog för tiles (default ./hojd-staging, LÄGG UTANFÖR git)
//   --max=<N>                            kapa antal tiles (säkerhet mot oavsiktligt stor hämtning)
//   --dry                                lista tiles + total MB, ladda INTE ner (403-oberoende)
//
// KÄLLA: © Lantmäteriet, "Användningsvillkor för värdefulla datamängder" (attribution krävs, EJ CC0).
// Härledning (hillshade/kontur/paleo-strandlinje/PostGIS-raster) sker i separata steg EFTER hämtning.

import fs from 'node:fs';
import path from 'node:path';
import {
  loadEnv, authHeader, REPO_ROOT, NotAuthorizedError,
  mhmCollectionsForBbox, searchTiles, downloadAsset,
} from './lib/lm-hojd.mjs';

// Approximativa AOI-fönster (sökrutor för att välja tiles — INTE påstådda platskoordinater).
const REGIONS = {
  oland:      [16.35, 56.15, 17.15, 57.40],
  kalmarsund: [16.00, 56.00, 17.20, 57.40],
  kalmar:     [16.20, 56.55, 16.55, 56.75],
};

function parseArgs(argv) {
  const a = {};
  for (const s of argv.slice(2)) {
    const m = s.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) a[m[1]] = m[2] ?? true;
  }
  return a;
}

function resolveBbox(a) {
  if (a.bbox) {
    const b = String(a.bbox).split(',').map(Number);
    if (b.length !== 4 || b.some(Number.isNaN)) throw new Error('Ogiltig --bbox (vänta minLon,minLat,maxLon,maxLat)');
    return b;
  }
  if (a.region) {
    const b = REGIONS[String(a.region).toLowerCase()];
    if (!b) throw new Error(`Okänd --region "${a.region}". Välj: ${Object.keys(REGIONS).join(', ')} eller ange --bbox.`);
    return b;
  }
  throw new Error('Ange --region=<namn> eller --bbox=minLon,minLat,maxLon,maxLat.');
}

const fmtMB = (bytes) => (bytes / 1e6).toFixed(1);

async function main() {
  const a = parseArgs(process.argv);
  const bbox = resolveBbox(a);
  const dry = !!a.dry;
  const outDir = path.resolve(a.out ? String(a.out) : path.join(REPO_ROOT, 'hojd-staging'));
  const maxTiles = a.max ? Number(a.max) : Infinity;

  const env = loadEnv();
  const auth = authHeader(env);

  console.log(`AOI (WGS84): ${bbox.join(', ')}`);
  const collections = await mhmCollectionsForBbox(bbox, auth);
  if (!collections.length) { console.log('Inga mhm-collections skär detta AOI.'); return; }
  console.log(`Berörda 1 m-DTM-collections (${collections.length}): ${collections.join(', ')}`);

  let tiles = await searchTiles({ bbox, collections, auth });
  // Dedup på tile-id (samma tile kan i teorin ligga i överlappande blockkanter).
  const seen = new Set();
  tiles = tiles.filter((t) => (seen.has(t.id) ? false : seen.add(t.id)));

  const totalBytes = tiles.reduce((s, t) => s + (t.size || 0), 0);
  const dates = tiles.map((t) => t.datetime).filter(Boolean).sort();
  console.log(`\nTiles som skär AOI: ${tiles.length}  (~${fmtMB(totalBytes)} MB)`);
  if (dates.length) console.log(`Källdatum (datetime): ${dates[0]?.slice(0,10)} … ${dates[dates.length-1]?.slice(0,10)}`);
  console.log(`Upplösning: ${tiles[0]?.res ?? '?'} m,  EPSG: ${tiles[0]?.epsg ?? '?'}  (SWEREF99 TM + RH2000)`);

  const capped = Number.isFinite(maxTiles) ? tiles.slice(0, maxTiles) : tiles;
  if (capped.length < tiles.length) console.log(`(--max=${maxTiles}: hämtar ${capped.length} av ${tiles.length})`);

  // Manifest skrivs ALLTID (även torrläge) så upptäckten är sparad + proveniens/attribution finns.
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = {
    source: '© Lantmäteriet, Markhöjdmodell (1 m DTM, markhöjd/bar jord). Villkor: värdefulla datamängder (attribution, ej CC0).',
    product: 'Markhöjdmodell Nedladdning', api: 'https://api.lantmateriet.se/stac-hojd/v1',
    aoi_wgs84: bbox, collections, tile_count: tiles.length, total_bytes: totalBytes,
    crs: 'EPSG:5845 (SWEREF99 TM + RH2000)', resolution_m: tiles[0]?.res ?? null,
    generated_at: new Date().toISOString(),
    tiles: tiles.map((t) => ({ id: t.id, collection: t.collection, bbox: t.bbox, datetime: t.datetime, size: t.size, file: `${t.id}.tif`, href: t.href, ursprung: t.ursprungHref })),
  };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nManifest: ${path.join(outDir, 'manifest.json')}`);

  if (dry) {
    console.log('\n[torrläge] Ingen nedladdning. Kör utan --dry när dl1-behörigheten är aktiv.');
    console.log('Nästa steg efter hämtning (separata verktyg): gdalbuildvrt → gdaldem hillshade (trädlös terräng)');
    console.log('  och gdal_contour / PostGIS-raster för höjd-uppslag & paleo-strandlinjer (landhöjning).');
    return;
  }

  console.log(`\nLaddar ner ${capped.length} tiles → ${outDir}`);
  let got = 0, skipped = 0;
  try {
    for (const t of capped) {
      const dst = path.join(outDir, `${t.id}.tif`);
      if (fs.existsSync(dst) && (!t.size || fs.statSync(dst).size === t.size)) { skipped++; continue; }
      const buf = await downloadAsset(t.href, auth);
      fs.writeFileSync(dst, buf);
      if (t.ursprungHref) {
        try { fs.writeFileSync(path.join(outDir, `${t.id}_ursprung.json`), await downloadAsset(t.ursprungHref, auth)); } catch { /* proveniens valfri */ }
      }
      got++;
      if (got % 25 === 0) console.log(`  … ${got}/${capped.length}`);
    }
  } catch (e) {
    if (e instanceof NotAuthorizedError) {
      console.error(`\n⛔ dl1-nedladdning HTTP ${e.status}: nedladdningsbehörigheten på kontot är inte aktiv än.`);
      console.error('   STAC-API:t svarar (upptäckt/manifest klart) men dl1.lantmateriet.se nekar filhämtning.');
      console.error('   Kör om detta script när behörigheten aktiverats (geodatasupport@lm.se).');
      process.exit(2);
    }
    throw e;
  }
  console.log(`\nKlart: ${got} hämtade, ${skipped} redan fanns. © Lantmäteriet.`);
  console.log('Bygg mosaik:  gdalbuildvrt hojd.vrt *.tif   |   Trädlös terräng:  gdaldem hillshade hojd.vrt hillshade.tif');
}

main().catch((e) => { console.error('\nFEL:', e.message); process.exit(1); });

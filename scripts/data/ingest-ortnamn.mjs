#!/usr/bin/env node
// Ingest av Lantmäteriets ortnamn → public.place_names (gazetteer-/positionslager).
//
// KÄLLA: NEDLADDNING-produkten "Ortnamn" via STAC-vektor (collection ortnamn). ZIP med EN GeoPackage
// (ortnamn_se.zip) i EPSG:3006, hela Sverige. © Lantmäteriet, "Användningsvillkor för värdefulla
// datamängder" (attribution — OBS: EJ CC0/CC BY 4.0; migrationens default 'CC BY 4.0' är fel för denna
// produkt, sätts korrekt här).
//
// DETTA ÄR POSITIONSLAGRET (namn + koordinat + LM:s objekttyp), INTE det etymologiska lagret.
// Äldsta belägg / namnled-taggning fylls i separat fas (Isof Ortnamnsregistret / element-katalogen).
// element_keys/element_category lämnas därför tomma här med flit.
//
// Scope är ett MEDVETET beslut (hela Sverige = mycket stort) — kräver explicit flagga:
//   node scripts/data/ingest-ortnamn.mjs --limit 50      # testkörning, inspektera kolumnnamn först
//   node scripts/data/ingest-ortnamn.mjs --bbox 17.6,59.1,18.3,59.5   # avgränsa (WGS84 minLng,minLat,maxLng,maxLat)
//   node scripts/data/ingest-ortnamn.mjs --all           # hela Sverige (bekräfta att du vill det)

import pg from 'pg';
import {
  loadEnv, authHeader, databaseUrl, stacZipHref, downloadZip, openGpkgFromZip,
  featureTables, geomMeta, tableColumns, extractWKB, pick, NotAuthorizedError,
} from './lib/lm-gpkg.mjs';

const COLLECTION = 'ortnamn';
const SOURCE = 'lantmateriet_ortnamn';
const LICENSE = 'Värdefulla datamängder (© Lantmäteriet)';
const NAME_KEYS = ['namn', 'ortnamn', 'name', 'text', 'skrivning'];
const TYPE_KEYS = ['namntyp', 'namnobjekttyp', 'objekttyp', 'detaljtyp', 'typ', 'kategori', 'feature_type'];
const SPRAK_KEYS = ['sprak', 'språk', 'spraktyp', 'language', 'lang'];
// Ortnamn-GPKG saknar stabil GUID (till skillnad från admin-produktens objektidentitet). Om en sådan
// finns används den; annars byggs en DETERMINISTISK naturlig nyckel av exakt position + typ + löpnummer
// (stabil över veckoversioner, till skillnad från fid som kan omnumreras).
const EXT_KEYS  = ['objektidentitet', 'objektid', 'ortid', 'uuid', 'gid'];
const COORD_KEYS = { e: ['ekoordinat', 'e', 'x'], n: ['nkoordinat', 'n', 'y'], lop: ['lopnummer', 'lopnr'] };

function buildExtId(row) {
  const guid = pick(row, EXT_KEYS);
  if (guid) return guid;
  const e = pick(row, COORD_KEYS.e), n = pick(row, COORD_KEYS.n);
  const typ = pick(row, TYPE_KEYS), lop = pick(row, COORD_KEYS.lop);
  if (e && n) return `xy:${e}_${n}:${typ ?? ''}:${lop ?? ''}`;
  return null; // ingen stabil nyckel härledbar → felas i pre-flight
}
const BATCH = 1000;

function parseArgs(argv) {
  const a = { mode: null, limit: null, bbox: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--all') a.mode = 'all';
    else if (argv[i] === '--limit') { a.mode = 'limit'; a.limit = parseInt(argv[++i], 10); }
    else if (argv[i] === '--bbox') { a.mode = a.mode || 'bbox'; a.bbox = argv[++i].split(',').map(Number); }
    // --type BEBTX,BEBTÄTTX,KYRKATX,... = filtrera på LM:s namntyp-koder (undvik mikrotoponym-flöde:
    // hoppa TERRTX/VATT*/TRAKTTX). Endast rader vars typ finns i setet ingestas.
    else if (argv[i] === '--type') { a.types = new Set(argv[++i].split(',').map((s) => s.trim()).filter(Boolean)); }
    // --sprak samiska,finska = ta med rader vars språk matchar (case-insensitivt substräng), OAVSETT typ.
    // Kombineras med --type som OR: en rad ingestas om typen matchar ELLER språket matchar. Löser att
    // samiska namn mest är sjöar/fjäll (terräng/vatten-typer vi annars hoppar).
    else if (argv[i] === '--sprak') { a.spraks = argv[++i].split(',').map((s) => s.trim().toLowerCase()).filter(Boolean); }
  }
  return a;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.mode) {
    console.error('Ange scope (medvetet beslut — hela Sverige är stort):');
    console.error('  --limit N   testkörning (inspektera kolumnnamn först)');
    console.error('  --bbox minLng,minLat,maxLng,maxLat   avgränsa geografiskt (WGS84)');
    console.error('  --all       hela Sverige');
    process.exit(1);
  }
  if (args.bbox && args.bbox.length !== 4) throw new Error('--bbox kräver 4 tal: minLng,minLat,maxLng,maxLat');

  const env = loadEnv();
  const auth = authHeader(env);
  const { href } = await stacZipHref(COLLECTION, auth);
  const zipBuf = await downloadZip(href, auth);
  const { gp, rowsOf } = await openGpkgFromZip(zipBuf);

  const tables = featureTables(rowsOf);
  if (!tables.length) throw new Error('Inga feature-tabeller i GPKG');
  const table = tables[0]; // ortnamn_se: en feature-tabell
  const { geomCol, srsId } = geomMeta(rowsOf, table);
  const cols = tableColumns(rowsOf, table);
  console.log(`Tabell: ${table}  (geom=${geomCol}, srs=${srsId})`);
  console.log(`Kolumner: ${cols.join(', ')}`);

  // Verifiera att vi hittar namn + stabil id-kolumn (dedup bygger på source+external_id).
  const sampleRow = rowsOf(`SELECT * FROM "${table}" LIMIT 1`)[0] || {};
  console.log(`Exempelrad: name=${pick(sampleRow, NAME_KEYS)}, type=${pick(sampleRow, TYPE_KEYS)}, sprak=${pick(sampleRow, SPRAK_KEYS)}, ext=${buildExtId(sampleRow)}`);
  // Logga distinkta språkvärden (för korrekt --sprak-filter) — hitta den faktiska sprak-kolumnen ur cols.
  const sprakCol = SPRAK_KEYS.find((k) => cols.includes(k));
  if (sprakCol) {
    try {
      const langs = rowsOf(`SELECT DISTINCT "${sprakCol}" AS v FROM "${table}"`).map((r) => r.v);
      console.log(`Distinkta ${sprakCol}-värden: ${JSON.stringify(langs).slice(0, 500)}`);
    } catch { /* noop */ }
  } else console.log(`(ingen sprak-kolumn hittad bland ${SPRAK_KEYS.join('/')})`);
  if (!geomCol) throw new Error(`Ingen geometrikolumn i ${table}`);
  if (!pick(sampleRow, NAME_KEYS)) throw new Error(`Hittar ingen namn-kolumn — justera NAME_KEYS mot: ${cols.join(', ')}`);
  if (!buildExtId(sampleRow)) throw new Error(`Kan ej härleda stabil id (GUID el. position) — kontrollera kolumner: ${cols.join(', ')}`);

  const db = new pg.Client({ connectionString: databaseUrl(env) });
  await db.connect();

  // Batchad array-insert: PostGIS gör CRS-transform + ev. bbox-filter; ST_Centroid tål punkt/multipunkt.
  const bboxClause = args.bbox
    ? `WHERE ST_Contains(ST_MakeEnvelope($7,$8,$9,$10,4326), p.g)` : ``;
  const sql =
    `INSERT INTO public.place_names (name, lat, lng, feature_type, language, external_id, source, source_license)
     SELECT u.name, ST_Y(p.g), ST_X(p.g), u.ft, u.lang, u.ext, '${SOURCE}', '${LICENSE}'
     FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[]) AS u(name, wkbhex, ft, lang, ext)
     CROSS JOIN LATERAL (SELECT ST_Centroid(ST_Transform(ST_GeomFromWKB(decode(u.wkbhex,'hex'), $6), 4326)) g) p
     ${bboxClause}
     ON CONFLICT (source, external_id)
     DO UPDATE SET name=EXCLUDED.name, lat=EXCLUDED.lat, lng=EXCLUDED.lng,
                   feature_type=EXCLUDED.feature_type, language=EXCLUDED.language, updated_at=now()`;

  let seen = 0, inserted = 0;
  let bName = [], bWkb = [], bFt = [], bLang = [], bExt = [];
  const flush = async () => {
    if (!bName.length) return;
    const params = [bName, bWkb, bFt, bLang, bExt, srsId];
    if (args.bbox) params.push(args.bbox[0], args.bbox[1], args.bbox[2], args.bbox[3]);
    const res = await db.query(sql, params);
    inserted += res.rowCount || 0;
    bName = []; bWkb = []; bFt = []; bLang = []; bExt = [];
  };

  try {
    const st = gp.prepare(`SELECT * FROM "${table}"`);
    while (st.step()) {
      if (args.mode === 'limit' && seen >= args.limit) break;
      const row = st.getAsObject();
      const geom = row[geomCol];
      if (!geom) continue;
      const ftVal = pick(row, TYPE_KEYS);
      const langVal = pick(row, SPRAK_KEYS);
      // Kombinerat filter: om --type OCH/ELLER --sprak angetts → ta med raden om typen ELLER språket
      // matchar. Utan filter → ta med allt. (Så samiska sjöar/fjäll kommer med trots exkluderad typ.)
      if (args.types || args.spraks) {
        const typeOk = args.types ? args.types.has(ftVal) : false;
        const langLc = (langVal ?? '').toLowerCase();
        const sprakOk = args.spraks ? args.spraks.some((s) => langLc.includes(s)) : false;
        if (!typeOk && !sprakOk) continue;
      }
      bName.push(pick(row, NAME_KEYS));
      bWkb.push(extractWKB(geom).toString('hex'));
      bFt.push(ftVal);
      bLang.push(langVal);
      bExt.push(buildExtId(row));
      seen++;
      if (bName.length >= BATCH) { await flush(); if (seen % 20000 === 0) console.log(`  … ${seen} lästa, ${inserted} i bbox/insatta`); }
    }
    st.free();
    await flush();
    console.log(`\nKlart: ${seen} ortnamn lästa, ${inserted} upsertade i place_names`);
    console.log(`Källa: ${SOURCE} · Licens: ${LICENSE}`);
    if (args.bbox) console.log(`(bbox-filtrerat: ${args.bbox.join(', ')})`);
  } finally {
    await db.end();
    gp.close();
  }
}

main().catch((e) => {
  if (e instanceof NotAuthorizedError) {
    console.error(`\n⛔ ${e.message}. Geotorget-beställningen är inte godkänd/aktiverad än.`);
    console.error(`   När den är det flippar nedladdningen till 200 — kör om scriptet då.`);
    process.exit(2);
  }
  console.error('\nFEL:', e.message); process.exit(1);
});

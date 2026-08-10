// Ingest av SGU:s strandförskjutningsmodell — DJUPTIDSSKIVOR (Littorina/Ancylus/Yoldia)
// -> public.paleo_shorelines. Fas 1a (svenska kuster), beslutad av Daniel 2026-08-11.
// Se: .superpowers/proposals/2026-08-10-paleo-djuptid-datakallor.md (research-spike)
//     .superpowers/sdd/2026-08-11-paleo-tidsresa-ostersjon/task-2-brief.md
//
// LICENS — VERIFIERAD 2026-08-11, KONFLIKT MELLAN TVÅ SGU-KÄLLOR (löst konservativt):
//  * SGU:s OGC-API `/collections`-dokument deklarerar en `rel:"license"`-länk till
//    CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/deed.sv).
//  * SGU:s formella "Produktbeskrivning öppna data" för just denna produkt
//    (strandforskjutningsmodell-oppnadata-beskrivning.pdf, Fastställd 2022-06-14, v1.0,
//    sid 2) anger uttryckligen: "Licens: Creative Commons Erkännande 4.0" med länk till
//    CC-BY 4.0 legalcode.
//  Detta är en genuin motsägelse mellan två SGU-publicerade källor. Den formellt
//  fastställda produktbeskrivningen (daterad, versionerad, produkt-specifik) väger
//  tyngre än en generisk API-metadatalänk (som ofta är ett oanpassat ramverks-default
//  i OGC-API-mjukvara). Enligt CLAUDE.md "ingen gissning": vi VÅGAR INTE anta den
//  lösare CC0-licensen på svag grund → behåller CC-BY-4.0 (attribuerar SGU), precis
//  som den befintliga pipelinen redan gör. Ändra INTE utan starkare belägg.
//
// KOD=5 (INLANDSIS) — EXKLUDERAS MEDVETET:
//  paleo_shorelines.water_body_type har CHECK-constraint (sea|lake) — inget 'ice'.
//  SGU:s kod 5 = inlandsis (glaciärtäckt), inte vatten. Att lägga in dessa celler som
//  'lake' skulle vara en direkt sakfelaktig framställning (is ≠ sjö). De exkluderas
//  därför helt ur denna ingest (se console-logg för antal exkluderade celler per
//  körning). Empiriskt (Mälardalen-bbox, 2026-08-11): bp11000-11900 (Yoldia-perioden)
//  hade 53/73 celler kod=5 — merparten av bboxen var fortfarande istäckt vid den tiden.
//  Det innebär att Yoldia-skivorna i denna region blir GLESA (bara hav/issjö-celler
//  utanför isen) — det är korrekt, inte ett fel: större delen av ytan SAKNAR data av
//  skälet att den var is, inte hav/sjö.
//
// ANCYLUS/YOLDIA — MODELLUTDATA, INTE VERIFIERAD INSJÖ-HYDROLOGI:
//  Ancylussjön var en tröskeldämd sötvattensjö över samtida havsnivå; Yoldiahavet en
//  kort marin/brackisk fas. En ren isostasi+eustasi-strandförskjutningsmodell fångar
//  inte nödvändigtvis dessa utlopps-tröskel-/isdämningseffekter korrekt (se spike,
//  sektion 2). Dessa skivors period_label FLAGGAR därför explicit "insjö-hydrologi ej
//  modellerad" — geometrin är SGU:s modellutdata (code sea/lake), inte en källkritiskt
//  verifierad paleobassäng-yta.
//
// Littorinahavet (marint, väl SGU-modellerat) etiketteras normalt.
//
// Kör: node scripts/data/ingest-paleo-deeptime.mjs
// Kräver SUPABASE_DB_PASSWORD i .env. Idempotent + additivt: DELETE är scopead till
// EXAKT de year_ce-värden och den bbox denna körning berör (samma mönster som
// ingest-paleo-shorelines.mjs) — rör ALDRIG 50–950 e.Kr.-skivorna eller copernicus_dem.
// BBOX default = samma Mälardalen/Uppland-region som befintlig pipeline (kontinuerlig
// tidsserie för samma plats). Utbyggbart via BBOX-env för andra svenska kustregioner.

import pg from 'pg';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const PW = env.SUPABASE_DB_PASSWORD;
if (!PW) { console.error('SUPABASE_DB_PASSWORD saknas i .env'); process.exit(1); }

// FIX (Öland-bbox, task-4-verifiering 2026-08-11): ursprunglig default ärvde
// Mälardalen-bboxen från ingest-paleo-shorelines.mjs, som INTE täcker Öland/Kalmarsund.
// Verifierat mot SGU (probe 2026-08-11): alla tre collections HAR djuptidsdata för exakt
// Öland-bboxen (16.3,56.1,17.2,57.5) — samtliga år, inga inlandsis-celler (kod 5) där.
// Vidgad default täcker nu BÅDE Mälardalen och Öland/Kalmarsund/sydöstra Sverige i en
// och samma additiva körning (unionsmängd, ingen data tappas).
const BBOX = process.env.BBOX || '15.5,55.5,19.7,61.4';       // Mälardalen–Öland/Kalmarsund (lng,lat,lng,lat)
const CRS = 'http://www.opengis.net/def/crs/EPSG/0/4326';
const SIMPLIFY_DEG = 0.0015;                                   // ~150 m, samma som befintlig pipeline
const LICENSE = 'CC-BY-4.0';                                    // se licens-kommentar ovan — INTE CC0
const MODEL_VERSION = 'sgu_strandforskjutning';                 // samma modell som 50–950 e.Kr.-skivorna

// Djuptidsstadier som når SGU:s täckning (Baltiska issjön är utanför räckvidd, ej hit).
const STAGES = {
  'bp8000-8900':   { name: 'Littorinahavet', note: null },
  'bp10000-10900': { name: 'Ancylussjön',    note: 'insjö-hydrologi ej modellerad' },
  'bp11000-11900': { name: 'Yoldiahavet',    note: 'insjö-hydrologi ej modellerad' },
};
const COLLECTIONS = Object.keys(STAGES);

function labelFor(year, stage) {
  const base = `${stage.name} ~${Math.abs(year)} f.Kr.`;
  return stage.note
    ? `${base} (SGU strandförskjutningsmodell — ${stage.note})`
    : `${base} (SGU strandförskjutningsmodell)`;
}
function attributionFor(stage) {
  return stage.note
    ? `Sveriges geologiska undersökning (SGU) — strandförskjutningsmodell; ${stage.note}; inlandsis-täckta celler (kod 5) exkluderade`
    : 'Sveriges geologiska undersökning (SGU)';
}

async function fetchCollection(collection) {
  const url = `https://api.sgu.se/oppnadata/strandforskjutningsmodell/ogc/features/v1/collections/${collection}/items`
    + `?f=json&limit=60000&bbox=${BBOX}&crs=${encodeURIComponent(CRS)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`SGU ${collection}: HTTP ${r.status}`);
  const d = await r.json();
  if ((d.links || []).some(l => l.rel === 'next'))
    throw new Error(`${collection}: fler sidor än limit (matched=${d.numberMatched}) — höj limit el. paginera via next-länk`);
  const stage = STAGES[collection];
  let excludedIce = 0;
  const cells = [];
  for (const f of d.features) {
    const code = f.properties.code;
    if (code === 5) { excludedIce++; continue; } // inlandsis — se kommentar i filhuvudet
    cells.push({
      code, year: f.properties.year, g: JSON.stringify(f.geometry),
      period_label: labelFor(f.properties.year, stage),
      attribution: attributionFor(stage),
    });
  }
  return { cells, excludedIce };
}

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: PW, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 600000, // 10 min — vidgad bbox ⇒ 30–40x fler celler per union
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TEMP TABLE _stg_cells(code int, year_ce int, period_label text, attribution text, geom geometry(Geometry,4326)) ON COMMIT DROP');
    const allYears = new Set();
    for (const collection of COLLECTIONS) {
      const { cells, excludedIce } = await fetchCollection(collection);
      const byYear = {};
      for (const c of cells) { byYear[c.year] = (byYear[c.year] || 0) + 1; allYears.add(c.year); }
      console.log(`${collection} (${STAGES[collection].name}): ${cells.length} celler (exkl. ${excludedIce} inlandsis-celler kod=5), år: `
        + Object.entries(byYear).map(([y, n]) => `${y}(${n})`).join(' '));
      const B = 1000;
      for (let i = 0; i < cells.length; i += B) {
        const chunk = cells.slice(i, i + B);
        const vals = [], params = []; let p = 1;
        for (const c of chunk) {
          vals.push(`($${p++},$${p++},$${p++},$${p++},ST_SetSRID(ST_GeomFromGeoJSON($${p++}),4326))`);
          params.push(c.code, c.year, c.period_label, c.attribution, c.g);
        }
        await client.query(`INSERT INTO _stg_cells(code,year_ce,period_label,attribution,geom) VALUES ${vals.join(',')}`, params);
      }
    }
    if (allYears.size === 0) { console.log('Inga celler hämtade — avbryter utan ändringar.'); await client.query('ROLLBACK'); return; }
    const yrs = [...allYears];
    // Säkerhetsspärr: denna pipeline hanterar bara djuptid (year_ce < 0). Om något år
    // råkar vara >= 0 (skulle aldrig hända för dessa collections) — stoppa hellre än
    // att riskera att röra 50–950 e.Kr.-skivorna.
    if (yrs.some(y => y >= 0)) throw new Error(`Oväntat year_ce >= 0 bland hämtade celler: ${yrs.filter(y => y >= 0)} — avbryter (skydd mot att röra befintliga skivor).`);
    // BBOX-SCOPAD + YEAR-SCOPAD DELETE (samma additiva mönster som ingest-paleo-shorelines.mjs):
    // rör bara rader vars year_ce är bland de NYA (negativa) åren OCH vars geom skär denna bbox.
    // VARNING (lärdom 2026-08-11, Öland-bbox-fixen): kör ALDRIG två körningar av detta skript
    // mot samma year_ce-intervall SAMTIDIGT med olika BBOX. Om körning B:s INSERT committar
    // efter att körning A:s DELETE redan kört (men innan A:s INSERT), ser B:s DELETE inga rader
    // att ersätta -> två separata rader per (year_ce, water_body_type) i stället för en union.
    // Detta hände en gång (bred SE-Sverige-körning + en snävare Öland-körning i olika
    // agent-turer) och krävde en manuell efterstädning (radera den mindre av två rader per
    // grupp, rankat på ST_Area). Kör sekventiellt, eller kör bara EN bbox-bredd i taget.
    const [bx1, by1, bx2, by2] = BBOX.split(',').map(Number);
    const del = await client.query(
      `DELETE FROM paleo_shorelines WHERE model_version=$6 AND year_ce = ANY($1)
         AND ST_Intersects(geom, ST_MakeEnvelope($2,$3,$4,$5,4326))`,
      [yrs, bx1, by1, bx2, by2, MODEL_VERSION]);
    console.log(`Raderade ${del.rowCount} ev. tidigare rader för samma (year_ce, bbox) — idempotent omkörning.`);
    const ins = await client.query(
      `INSERT INTO paleo_shorelines(period_label,year_ce,rsl_bound,water_body_type,geom,model_version,source,license,attribution)
       SELECT max(period_label), year_ce, 'median',
              CASE WHEN code=1 THEN 'sea' ELSE 'lake' END,
              ST_Multi(ST_CollectionExtract(
                ST_MakeValid(ST_SimplifyPreserveTopology(
                  ST_UnaryUnion(ST_Collect(ST_MakeValid(geom))), $1)), 3)),
              $2,'SGU',$3,max(attribution)
       FROM _stg_cells GROUP BY year_ce, (CASE WHEN code=1 THEN 'sea' ELSE 'lake' END)
       RETURNING id, year_ce, water_body_type, ST_NPoints(geom) AS npts,
                 round((ST_Area(geom::geography)/1e6)::numeric) AS km2`, [SIMPLIFY_DEG, MODEL_VERSION, LICENSE]);
    await client.query('COMMIT');
    console.log('Infogat:'); console.table(ins.rows);
    const ext = await client.query(
      `SELECT year_ce, water_body_type, ST_Extent(geom)::text AS bbox FROM paleo_shorelines
       WHERE model_version=$1 AND year_ce = ANY($2) GROUP BY year_ce, water_body_type ORDER BY year_ce`,
      [MODEL_VERSION, yrs]);
    console.log('Geografisk utbredning (kontroll att det ligger i Mälardalen-bboxen):');
    console.table(ext.rows);
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; }
  finally { await client.end(); }
}
main().catch(e => { console.error('FEL:', e.message); process.exit(1); });

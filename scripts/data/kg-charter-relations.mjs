// Task 2 (medeltidsbrev KG, Fas A): extraherar brev→brev-kedjor (vidimation/stadfästelse/
// transsumption/referens) ur sdhk.letters_raw.summary (regest) och fyller
// public.kg_charter_relations. Regelbaserat, HÖG PRECISION > recall — se
// .superpowers/sdd/2026-08-11-medeltidsbrev-kg-soksektion/task-2-report.md för mätningen som
// motiverar de tre resolveringsvägarna nedan.
//
// Endast SÄKRA identifieringar av målbrevet skapar en relation:
//   A) explicit "SDHK nr N" / "SDHK N" i regesten -> confidence 0.90 (måltexten NÄMNER id:t)
//   B) explicit "DS N" / "DS nr N" i regesten, unikt matchat mot en annan rads print_ref
//      (byggt ur HELA korpusen) -> confidence 0.90
//   C) inget SDHK/DS-nr, men ett datum "D/M ÅÅÅÅ" (eller ÅÅÅÅ-MM-DD/8-siffrigt) inom ~60 tecken
//      efter ordet "brev", som matchar EXAKT en annan rads date_raw (prefix) -> confidence 0.70
// Är matchningen inte unik (0 eller >1 kandidater) -> SKIPPAS (ingen gissad länk).
//
// relation_type väljs av det NÄRMASTE föregående verbet i regesten (samma regest kan nämna
// flera mål med olika verb i olika satser):
//   vidimer(ar/at) -> 'vidimerar' | transsum(erar/erat) -> 'transsumerar'
//   stadfäst(er/es)/förnyar(/förnyat) -> 'stadfaster' | annars (bekräftar m.fl.) -> 'refererar'
//
// Additivt: INSERT ... ON CONFLICT DO NOTHING i kg_charter_relations (PK from_sdhk,to_sdhk,
// relation_type). Rör aldrig sdhk.letters_raw eller andra tabeller. REFRESH av
// kg_charter_authority sker separat efter körning (se rapporten).
//
// Kör: node scripts/data/kg-charter-relations.mjs [--apply]
//   utan --apply: dry-run, skriver bara sammanfattning (antal per väg/typ) utan att skriva DB.
//   --apply: skriver till kg_charter_relations.

import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');

const env = Object.fromEntries(
  readFileSync('./.env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const client = new pg.Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.mnuifmcjspeaauzehasj',
  password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

// Regester som signalerar en brev->brev-referens (bred bas — den slutgiltiga precisionen
// kommer helt från resolveringsvägarna A/B/C ovan, inte från denna filtrering).
const SIGNAL_RE = /vidimerar|vidimerat|vidimering|transsumerar|transsumerat|stadfäster|stadfästes|stadfäst|förnyar|förnyat|bekräftar|bekräftat/i;

// Väg A: "SDHK nr 123" eller "SDHK 123" (bindestreck/mellanslag tillåtna).
const SDHK_NR_RE = /SDHK[\s-]*(?:nr\.?)?\s*(\d+)/gi;
// Väg B: "DS nr 123" eller "DS 123" (ej "SD 123" — annan katalog, se skript-kommentar i rapporten).
const DS_NR_RE = /(?<![A-Za-zÅÄÖåäö])DS\s*(?:nr\.?)?\s*(\d+)/gi;
// Väg B-index: samma mönster i print_ref, kräver ordgräns även EFTER siffran (annars matchar
// "DS 178" på "DS 1787"). Byggs en gång ur hela korpusens print_ref.
const DS_PRINTREF_RE = /(?:^|[^A-Za-zÅÄÖåäö])DS\s*(\d+)(?:[^0-9]|$)/gi;
// Väg C: datum "D/M ÅÅÅÅ" inom ~60 tecken EFTER ordet "brev".
const DATE_NEAR_BREV_RE = /brev[^.]{0,60}?(\d{1,2})\/(\d{1,2})\s*(\d{4})/gi;

const VERB_RE = /vidimer\w*|transsum\w*|stadfäst\w*|förnyar\w*|förnyat|bekräft\w*/gi;

function classifyVerb(text) {
  const t = text.toLowerCase();
  if (t.includes('vidimer')) return 'vidimerar';
  if (t.includes('transsum')) return 'transsumerar';
  if (t.includes('stadfäst') || t.includes('förnya')) return 'stadfaster';
  return 'refererar'; // bekräftar m.fl. — brevet enligt spec "otherwise"
}

// Hittar relation_type genom senaste verbet FÖRE matchpositionen — men bara inom SAMMA MENING
// (bakåt till senaste '.') och/eller inom ~200 tecken. Långa regester (t.ex. brev med narrativ
// klagoskrift) kan innehålla ett verb-stam LÅNGT tidigare i en helt annan sats och en incidental
// "(se SDHK nr X–SDHK nr Y)"-hänvisning senare — utan detta spärr felklassificerades sådana
// "se även"-citat som en styrd stadfästelse-relation (falsk positiv upptäckt i spot-check,
// se rapporten). Hittas inget verb nära nog -> returnera null, ANROPAREN SKA DÅ SKIPPA relationen
// (ingen gissad koppling mellan en obesläktad bisats och ett långt bort citerat SDHK-nummer).
// Väg B-korsvalidering: en regest som citerar "DS N" gör det nästan alltid tillsammans med ett
// datum i samma parentes, t.ex. "...(1417 4/9, DS 2407)" eller "...1346 22/7 (DS 4090)". Om det
// datumet INTE stämmer med målradens egna date_raw är DS-numret sannolikt en felskrivning/
// katalogförväxling (t.ex. "DS" vs "SD" — DS (Diplomatarium Suecanum) täcker bara t.o.m. ~1355,
// så en DS-referens på ett 1400-talsdatum är per definition befängd) snarare än en äkta
// katalogkollision — hittades via manuell spot-check (SDHK 24550 "DS 2407" 1417 4/9 löste
// felaktigt till SDHK 3217, vars EGNA DS 2407 är daterat 1323 5/20). Kräver att minst ETT av de
// två datumordningarna (ÅÅÅÅ D/M resp. D/M ÅÅÅÅ) som kan finnas i närheten matchar targetDate8
// (YYYYMMDD) — annars SKIPPAS relationen. Hittas inget datum alls nära -> ingen motsägelse, tillåt.
function nearbyDateAgrees(summary, matchIndex, targetDate8) {
  const window = summary.slice(Math.max(0, matchIndex - 60), matchIndex + 10);
  const candidates = [];
  {
    const re = /(\d{4})\s+(\d{1,2})\/(\d{1,2})/g;
    let m;
    while ((m = re.exec(window))) candidates.push(`${m[1]}${m[3].padStart(2, '0')}${m[2].padStart(2, '0')}`);
  }
  {
    const re = /(\d{1,2})\/(\d{1,2})\s*(\d{4})/g;
    let m;
    while ((m = re.exec(window))) candidates.push(`${m[3]}${m[2].padStart(2, '0')}${m[1].padStart(2, '0')}`);
  }
  if (candidates.length === 0) return true; // inget datum nära -> ingen motsägelse att pröva mot
  return candidates.includes(targetDate8);
}

function relationTypeAt(summary, matchIndex) {
  const sentenceStart = summary.lastIndexOf('.', matchIndex - 1) + 1;
  const windowStart = Math.max(sentenceStart, matchIndex - 200);
  const before = summary.slice(windowStart, matchIndex);
  let last = null;
  let m;
  const re = new RegExp(VERB_RE);
  while ((m = re.exec(before))) last = m[0];
  if (last) return classifyVerb(last);
  const afterWindow = summary.slice(matchIndex, matchIndex + 120);
  const m2 = afterWindow.match(VERB_RE);
  if (m2) return classifyVerb(m2[0]);
  return null; // inget styrande verb nära matchen -> skippa (se anropsställen)
}

async function main() {
  await client.connect();
  console.log(APPLY ? '--apply: skriver till kg_charter_relations' : 'dry-run (ingen DB-skrivning; kör med --apply för att spara)');

  // 1. Ladda HELA korpusen en gång — behövs för existens-check + DS-index + datum-index.
  const { rows: all } = await client.query(
    `select sdhk_id, date_raw, print_ref, summary from sdhk.letters_raw`
  );
  console.log(`Laddade ${all.length} brev från sdhk.letters_raw.`);

  const idSet = new Set(all.map((r) => r.sdhk_id));
  const dateBySdhk = new Map(
    all.map((r) => [r.sdhk_id, r.date_raw ? (r.date_raw.match(/^(\d{8})/) || [])[1] || null : null])
  );

  // DS-index: ds_num -> Set<sdhk_id> ur ALLA print_ref (målbrevets EGEN katalogreferens).
  const dsIndex = new Map();
  for (const r of all) {
    if (!r.print_ref) continue;
    const re = new RegExp(DS_PRINTREF_RE);
    let m;
    while ((m = re.exec(r.print_ref))) {
      const n = Number(m[1]);
      if (!dsIndex.has(n)) dsIndex.set(n, new Set());
      dsIndex.get(n).add(r.sdhk_id);
    }
  }

  // Datum-index: YYYYMMDD (första 8 siffrorna av date_raw) -> Set<sdhk_id>.
  const dateIndex = new Map();
  for (const r of all) {
    if (!r.date_raw) continue;
    const m = r.date_raw.match(/^(\d{8})/);
    if (!m) continue;
    const key = m[1];
    if (key === '00000000') continue; // odaterat — ingen signal
    if (!dateIndex.has(key)) dateIndex.set(key, new Set());
    dateIndex.get(key).add(r.sdhk_id);
  }

  const relations = new Map(); // key `${from}|${to}|${type}` -> {from_sdhk,to_sdhk,relation_type,confidence,path}
  const stats = { a_sdhk: 0, b_ds: 0, c_date: 0, skipped_ambiguous_ds: 0, skipped_ambiguous_date: 0, skipped_self: 0, skipped_missing: 0, skipped_no_verb: 0, skipped_ds_date_mismatch: 0 };

  function addRelation(from, to, type, confidence, path) {
    if (type === null) { stats.skipped_no_verb++; return; }
    if (to === from) { stats.skipped_self++; return; }
    if (!idSet.has(to)) { stats.skipped_missing++; return; }
    const key = `${from}|${to}|${type}`;
    const existing = relations.get(key);
    if (!existing || confidence > existing.confidence) {
      relations.set(key, { from_sdhk: from, to_sdhk: to, relation_type: type, confidence, path });
    }
    stats[path]++;
  }

  let candidateCount = 0;
  for (const r of all) {
    if (!r.summary || !SIGNAL_RE.test(r.summary)) continue;
    candidateCount++;
    const summary = r.summary;
    const from = r.sdhk_id;

    // Väg A: alla "SDHK nr N" / "SDHK N" i regesten.
    const sdhkMatches = [];
    {
      const re = new RegExp(SDHK_NR_RE);
      let m;
      while ((m = re.exec(summary))) sdhkMatches.push({ index: m.index, num: Number(m[1]) });
    }
    for (const { index, num } of sdhkMatches) {
      const type = relationTypeAt(summary, index);
      addRelation(from, num, type, 0.9, 'a_sdhk');
    }

    // Väg B: "DS N" / "DS nr N" som INTE redan täcks av en SDHK-nr-referens i närheten
    // (undvik dubbelarbete för de vanliga "(DS nr X/SDHK nr Y)"-parhusen — Y är redan säkrare).
    {
      const re = new RegExp(DS_NR_RE);
      let m;
      while ((m = re.exec(summary))) {
        const index = m.index;
        const nearSdhk = sdhkMatches.some((s) => Math.abs(s.index - index) < 40);
        if (nearSdhk) continue;
        const dsNum = Number(m[1]);
        const targets = dsIndex.get(dsNum);
        if (!targets || targets.size !== 1) { stats.skipped_ambiguous_ds++; continue; }
        const [target] = targets;
        const targetDate8 = dateBySdhk.get(target);
        if (targetDate8 && !nearbyDateAgrees(summary, index, targetDate8)) {
          stats.skipped_ds_date_mismatch++;
          continue;
        }
        const type = relationTypeAt(summary, index);
        addRelation(from, target, type, 0.9, 'b_ds');
      }
    }

    // Väg C: bara om INGEN SDHK- eller DS-referens finns alls i regesten (annars hade
    // vägarna A/B redan täckt den säkra identifieringen).
    if (sdhkMatches.length === 0 && !new RegExp(DS_NR_RE).test(summary)) {
      const re = new RegExp(DATE_NEAR_BREV_RE);
      let m;
      while ((m = re.exec(summary))) {
        const index = m.index;
        const [, d, mo, y] = m;
        const key = `${y}${mo.padStart(2, '0')}${d.padStart(2, '0')}`;
        const targets = dateIndex.get(key);
        const filtered = targets ? new Set([...targets].filter((id) => id !== from)) : null;
        if (!filtered || filtered.size !== 1) { stats.skipped_ambiguous_date++; continue; }
        const [target] = filtered;
        const type = relationTypeAt(summary, index);
        addRelation(from, target, type, 0.7, 'c_date');
      }
    }
    // reset lastIndex safety (test() above advances global regex state)
    SIGNAL_RE.lastIndex = 0;
    DS_NR_RE.lastIndex = 0;
  }

  const rels = [...relations.values()];
  console.log(`\nKandidat-regester (signalord): ${candidateCount}`);
  console.log(`Unika relationer att infoga: ${rels.length}`);
  console.log('Per väg (dubbletter redan dedupade på from|to|type, count nedan är RAW-träffar per väg innan dedup):');
  console.log(stats);
  const byType = {};
  for (const r of rels) byType[r.relation_type] = (byType[r.relation_type] || 0) + 1;
  console.log('Unika relationer per relation_type:', byType);

  if (!APPLY) {
    console.log('\nDry-run klar. Kör med --apply för att skriva till kg_charter_relations.');
    await client.end();
    return;
  }

  let inserted = 0;
  await client.query('begin');
  try {
    for (const r of rels) {
      const res = await client.query(
        `insert into public.kg_charter_relations (from_sdhk, to_sdhk, relation_type, confidence)
         values ($1,$2,$3,$4)
         on conflict (from_sdhk, to_sdhk, relation_type) do nothing`,
        [r.from_sdhk, r.to_sdhk, r.relation_type, r.confidence]
      );
      inserted += res.rowCount;
    }
    await client.query('commit');
  } catch (e) {
    await client.query('rollback');
    throw e;
  }
  console.log(`\nInfogade ${inserted} nya rader (av ${rels.length} kandidater; resten fanns redan p.g.a. ON CONFLICT DO NOTHING).`);

  await client.query('refresh materialized view public.kg_charter_authority');
  console.log('kg_charter_authority uppdaterad.');

  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  try { await client.end(); } catch {}
  process.exit(1);
});

#!/usr/bin/env node
// Bygger namn-crosswalk för danska (+ hist. danska: Skåne/Halland/Blekinge/Slesvig) inskrifter.
//
// BAKGRUND: 707 rader i runic_inscriptions har ett modernt Danske Runeindskrifter-signum
// (t.ex. "Sj 35", "DK Fyn26") i kolumnen alternative_signum, MEN saknar `name`. Rundata-dumpen
// bär inget populärnamn. Genstande-listan på runer.ku.dk (namn ↔ kort signum) är enda namnkällan.
//
// IN:  scripts/data/danske-genstande-raw.txt  — rå inklistring från runer.ku.dk, i ordningen
//        Namn\nSignum\nNamn\nSignum\n...  (klistra in exakt som listan visas).
// UT:  scripts/data/danske-genstande-names-crosswalk.sql  — idempotent UPDATE via temp-tabell,
//        matchar på normaliserat signum mot valfritt element i alternative_signum.
//        Skriver ALDRIG över befintligt namn (WHERE name IS NULL). Rapporterar omatchade i slutet.
//
// Kör:  node scripts/data/build-danske-genstande-crosswalk.mjs
// Applicera sen crosswalken i editorn/psql (solo-på-main; se minne psql-prod-migration-reference).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IN  = path.join(__dirname, 'danske-genstande-raw.txt');
const OUT = path.join(__dirname, 'danske-genstande-names-crosswalk.sql');

if (!fs.existsSync(IN)) {
  console.error(`Saknar ${IN}\nKlistra in hela genstande-listan (A–Å) i den filen först.`);
  process.exit(1);
}

// Regionprefix i Danske Runeindskrifter. SkL=Lund, SlB=Slesvig by, Sl=Slesvig, Bh=Bornholm.
// Ordning: längre prefix först så "SkL"/"SlB" testas före "Sk"/"Sl".
const REGIONS = ['SkL', 'SlB', 'NJy', 'MJy', 'SJy', 'Syd', 'Hal', 'Sk', 'Sl', 'Bh', 'Bl', 'Sj', 'Fyn', 'Uk'];
const REGION_ALT = REGIONS.join('|');
// En signum-token i början av en rad, ev. med "DK ", ev. "IK", nummer, bokstav, ",n", och "†".
const SIGNUM_RE = new RegExp(
  `^((?:DK\\s*)?(?:${REGION_ALT})\\s*(?:IK\\s*)?\\d+[A-Za-z]?(?:,\\d+)?†?)(?:\\s+(.*))?$`, 'i'
);

const raw = fs.readFileSync(IN, 'utf8');
const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

const pairs = [];        // {signum, name}
const skipped = [];      // {reason, text}
const anomalies = [];    // {reason, text}
let pendingName = null;

function stripDagger(s) { return s.replace(/†/g, '').trim(); }

for (const line of lines) {
  // Mynt utan fyndplats: signum "ZZZ" (namn "Runemønt, DR Mønt N"). Hoppa – inget unikt signum.
  if (line === 'ZZZ') { skipped.push({ reason: 'mynt (ZZZ, ingen fyndplats)', text: pendingName }); pendingName = null; continue; }
  // Utgången post.
  if (/^UDG[ÅA]ET$/i.test(line)) { pendingName = 'UDGÅET'; continue; }

  const m = line.match(SIGNUM_RE);
  if (m) {
    const sig = m[1].replace(/†/g, '').replace(/\s+/g, ' ').trim();
    const rest = (m[2] || '').trim(); // ev. hopklistrat nästa namn
    if (pendingName && pendingName !== 'UDGÅET') {
      pairs.push({ signum: sig, name: stripDagger(pendingName), lost: /†/.test(pendingName) });
    } else if (pendingName === 'UDGÅET') {
      skipped.push({ reason: 'UDGÅET', text: sig });
    } else {
      anomalies.push({ reason: 'signum utan föregående namn', text: line });
    }
    pendingName = rest || null; // hopklistrat namn blir nästa pending
    continue;
  }

  // Ingen signum-rad → det är ett namn.
  if (pendingName && pendingName !== 'UDGÅET') {
    anomalies.push({ reason: 'namn utan signum (fick nytt namn)', text: pendingName });
  }
  pendingName = line;
}
if (pendingName && pendingName !== 'UDGÅET') anomalies.push({ reason: 'namn utan signum (sist i fil)', text: pendingName });

// Normalisera signum för matchning: ta bort "DK", mellanslag; gemener. "Fyn 3"=="DK Fyn3".
const norm = s => s.toLowerCase().replace(/dk/g, '').replace(/\s+/g, '');

// Deduplicera på normaliserat signum (behåll första; flagga krockar med olika namn).
const bySig = new Map();
for (const p of pairs) {
  const k = norm(p.signum);
  if (bySig.has(k)) {
    if (bySig.get(k).name !== p.name) anomalies.push({ reason: `signum-krock ${p.signum}`, text: `${bySig.get(k).name} vs ${p.name}` });
    continue;
  }
  bySig.set(k, p);
}

const esc = s => s.replace(/'/g, "''");
const valuesRows = [...bySig.values()].map(p => `('${esc(norm(p.signum))}','${esc(p.signum)}','${esc(p.name)}')`);

const sqlOut = `-- Namn-crosswalk för danska/hist.danska inskrifter. Genererad ur danske-genstande-raw.txt.
-- ${bySig.size} unika signum→namn-par. Idempotent; skriver ALDRIG över befintligt namn.
-- Matchning: normaliserat par-signum == normaliserat element i alternative_signum (utan "DK"/mellanslag).
begin;

create temp table _gen(nsig text primary key, signum text, name text) on commit drop;
insert into _gen(nsig, signum, name) values
${valuesRows.join(',\n')};

-- Expandera alternative_signum till normaliserade nycklar per rad.
create temp table _rowsig on commit drop as
select ri.id,
       lower(regexp_replace(regexp_replace(a, 'DK', '', 'gi'), '\\s+', '', 'g')) as nsig
from public.runic_inscriptions ri, unnest(ri.alternative_signum) a;

-- Uppdatera namn där det saknas och signum matchar entydigt.
with match as (
  select rs.id, min(g.name) as name, count(distinct g.name) as n
  from _rowsig rs join _gen g using (nsig)
  group by rs.id
)
update public.runic_inscriptions ri
set name = m.name, updated_at = now()
from match m
where ri.id = m.id and ri.name is null and m.n = 1;

-- RAPPORT 1: par som inte matchade någon rad (signum finns ej i alternative_signum).
select 'omatchad_par' as typ, g.signum, g.name
from _gen g
where not exists (select 1 from _rowsig rs where rs.nsig = g.nsig)
order by g.signum;

-- RAPPORT 2: hur många rader fick namn / hur många danska rader saknar fortfarande namn.
select 'kvar_utan_namn' as typ, count(*) as n
from public.runic_inscriptions
where country = 'Denmark' and name is null;

commit;
`;

fs.writeFileSync(OUT, sqlOut, 'utf8');

// ---- Statistik till stderr ----
const log = (...a) => console.error(...a);
log(`Rader inlästa:        ${lines.length}`);
log(`Signum→namn-par:      ${pairs.length}  (unika: ${bySig.size})`);
log(`Förlorade (†):        ${pairs.filter(p => p.lost).length}`);
log(`Hoppade (mynt/utgått):${skipped.length}`);
log(`Anomalier:            ${anomalies.length}`);
if (anomalies.length) { log('\n-- ANOMALIER (kontrollera manuellt) --'); anomalies.slice(0, 40).forEach(a => log(`  [${a.reason}] ${a.text}`)); }
log(`\nSkrev ${OUT}`);

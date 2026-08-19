// SKALNING: svenska professorer i arkeologi → research_scholars.
// Hämtar LIVE från Wikidata SPARQL (raw JSON, ingen språkmodell över datat → ingen hallucination).
// INGEN GISSNING: bara Wikidata-verifierade fält används; okända fält lämnas null.
//
// Urvalskriterier (precist, för att undvika falska positiva):
//   P27  = wd:Q34        (svensk medborgare)
//   P106 = wd:Q3621491   (yrke: arkeolog — EXAKT, ej subklasser: subklass-vidgning drog in
//                         paleobotaniker/paleontologer/genetiker som INTE är arkeologiprofessorer)
//   OCH professor-signal: P39 = professor/subklass  ELLER  P106 = professor/subklass  (wd:Q121594)
//
// Fältmappning per träff:
//   name          = "Efternamn, Förnamn" (härlett ur sv-label; sista ordet = efternamn)
//   affiliation   = P108 arbetsgivares label (sv, annars en); null om saknas
//   role_title    = 'Professor i arkeologi'   (fast; urvalet ÄR professorer i arkeologi)
//   active_period = "YYYY–YYYY" (död) / "f. YYYY" (bara födelse) / null
//   life_status   = 'avliden' om P570 finns, annars null
//   external_ref  = 'wikidata:Qxxxx'   (idempotensnyckel)
//   source        = 'Wikidata (Qxxxx)'
// Inga verk ingestas (Wikidata saknar pålitliga bibliografier).
import pg from 'pg';
import fs from 'fs';

const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));

const QUERY = `SELECT DISTINCT ?item ?itemLabel ?birth ?death
 (GROUP_CONCAT(DISTINCT ?empL; separator=" | ") AS ?employers) WHERE {
  ?item wdt:P27 wd:Q34 .
  ?item wdt:P106 wd:Q3621491 .
  { ?item wdt:P39 ?pos . ?pos wdt:P279* wd:Q121594 . }
  UNION
  { ?item wdt:P106 ?occ . ?occ wdt:P279* wd:Q121594 . }
  OPTIONAL { ?item wdt:P569 ?birth. }
  OPTIONAL { ?item wdt:P570 ?death. }
  OPTIONAL { ?item wdt:P108 ?emp. ?emp rdfs:label ?empL . FILTER(LANG(?empL) IN ("sv","en")) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
} GROUP BY ?item ?itemLabel ?birth ?death ORDER BY ?itemLabel`;

const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(QUERY);
const res = await fetch(url, { headers: { 'User-Agent': 'VikingAge-research-ingest/1.0 (daniel.larsson@expandtalk.se)', 'Accept': 'application/sparql-results+json' } });
if (!res.ok) { console.error('Wikidata SPARQL HTTP', res.status); process.exit(1); }
const rows = (await res.json()).results.bindings;
console.log('Hämtade', rows.length, 'forskare från Wikidata.\n');

function toSurnameFirst(label) {
  const parts = (label||'').trim().split(/\s+/);
  if (parts.length < 2) return label; // osäker uppdelning → hela namnet som det är
  const sur = parts[parts.length-1];
  const given = parts.slice(0, -1).join(' ');
  return `${sur}, ${given}`;
}

const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

let inserted = 0, skipped = 0;
for (const r of rows) {
  const q = r.item.value.split('/').pop();
  const ext = 'wikidata:' + q;
  const label = r.itemLabel?.value || q;
  const name = toSurnameFirst(label);
  const birth = r.birth?.value ? r.birth.value.slice(0,4) : null;
  const death = r.death?.value ? r.death.value.slice(0,4) : null;
  const aff = r.employers?.value ? r.employers.value.split(' | ')[0] : null; // första arbetsgivar-label, annars null
  const period = death ? `${birth||'?'}–${death}` : (birth ? `f. ${birth}` : null);
  const life = death ? 'avliden' : null;

  const exist = await c.query(`select id from research_scholars where external_ref=$1 limit 1`, [ext]);
  if (exist.rows.length) { console.log('  (finns, hoppar)', name, '·', ext); skipped++; continue; }

  await c.query(
    `insert into research_scholars (name, affiliation, role_title, active_period, life_status, external_ref, source)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [name, aff, 'Professor i arkeologi', period, life, ext, `Wikidata (${q})`]);
  console.log('  + LA IN', name, '·', ext, '· aff:', aff||'(null)', '· period:', period||'(null)', '· status:', life||'(null)');
  inserted++;
}

console.log(`\n=== klart === nya: ${inserted} · fanns redan: ${skipped} · totalt hämtade: ${rows.length}`);
await c.end();

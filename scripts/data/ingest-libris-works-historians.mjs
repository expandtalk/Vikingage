// Skörda VERK ur Libris (KB) xsearch-API för de nyligen tillagda historiker-,
// kyrkohistoriker- och ekonomihistoriker-professorerna (research_scholars.role_title ILIKE '%historia%')
// och länka verken till entiteter i kunskapsgrafen (source_entity_links → entity_registry).
//
// Fortsättning på ingest-libris-works-birka-runsten.mjs (skörd) och extend-source-entity-links.mjs
// (auto-länkning) samt link-landscape-adjectives.mjs (adjektivstammar → landskap).
//
// INGEN GISSNING: titel/år/ISBN parsas ur Libris RÅ JSON i denna kod — ingen språkmodell hittar på
// årtal eller ISBN. Länkning sker BARA vid strikt ordgräns-match mot entity_registry.label; precision
// FÖRE täckning (hellre färre säkra länkar än brus i grafen).
//
// DEL A: skörda verk för research_scholars med role_title ILIKE '%historia%' som SAKNAR verk i `sources`
//        (Libris xsearch forf:"Efternamn Förnamn"). Ingen surname-only-fallback. Upp till 40 verk.
// DEL B: auto-länka de NYA sources (utan source_entity_links-rad) → entity_registry med stränga regler
//        (entity_type-vitlista, längd≥5, ordgräns, max 3/verk, blocklista utgivningsorter + vid geo)
//        PLUS landskaps-adjektivstammar (gotländsk→Gotland …) mot BEFINTLIGA landskapsnoder.
//        Befintliga länkar rörs INTE; UNIQUE(source_id,object_id) gör allt idempotent.
//        Rör ENDAST public.sources + public.source_entity_links (skapar inga entity_registry-noder).
//
// Kör: node scripts/data/ingest-libris-works-historians.mjs
import pg from 'pg';
import fs from 'fs';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
  user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();

const MAX_PER_SCHOLAR = 40;
const UA = { 'User-Agent': 'VikingAge-Research/1.0 (kulturarvsplattform; kontakt via vikingage.se)' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- rena parsers (ingen LLM) ----------
const asStr = (v) => {
  if (v == null) return '';
  return (Array.isArray(v) ? v.filter(Boolean).join('; ') : String(v)).trim();
};
const parseYear = (date) => {
  const s = asStr(date);
  if (!s) return null;
  const m = s.match(/\b(1[0-9]{3}|20[0-9]{2})\b/); // första trovärdiga årtalet
  return m ? parseInt(m[1], 10) : null;
};
const firstIsbn = (isbn) => {
  if (!isbn) return null;
  const v = Array.isArray(isbn) ? isbn[0] : isbn;
  const s = String(v).trim();
  return s.length ? s : null;
};

// research_scholars.name → Libris forf:-fråga "Efternamn Förnamn" (namnen lagras "Efternamn, Förnamn").
const PARTICLES = new Set(['von', 'af', 'van', 'de', 'der', 'den', 'di', 'du', 'los', 'la', 'le']);
const librisQuery = (name) => {
  let n = name.replace(/\(red\.\)/gi, '').replace(/\s+/g, ' ').trim();
  if (n.includes(',')) {
    const [sur, giv] = n.split(',');
    return `${sur.trim()} ${giv.trim()}`.replace(/\s+/g, ' ').trim();
  }
  const parts = n.split(' ');
  let si = parts.findIndex(p => PARTICLES.has(p.toLowerCase()));
  if (si === -1) si = parts.length - 1;
  const surname = parts.slice(si).join(' ');
  const given = parts.slice(0, si).join(' ');
  return `${surname} ${given}`.trim();
};

// Libris xsearch med User-Agent + backoff på 429. INGEN surname-only-fallback (precision > täckning).
const fetchLibris = async (q) => {
  const url = `http://libris.kb.se/xsearch?query=${encodeURIComponent(`forf:(${q})`)}&format=json&n=200`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(url, { headers: UA });
    if (r.status === 429) { const wait = 5000 * (attempt + 1); console.log(`  429 — väntar ${wait}ms`); await sleep(wait); continue; }
    if (!r.ok) throw new Error(`Libris HTTP ${r.status} för ${q}`);
    const j = JSON.parse(await r.text()); // parsa RÅ JSON i kod
    return j?.xsearch?.list ?? [];
  }
  throw new Error(`Libris 429 gav upp för ${q}`);
};

// ============================================================
// DEL A — skörda verk för historiker/kyrkohist./ekon.hist. UTAN verk
// ============================================================
console.log('=== DEL A: skörda verk för *historia*-professorer utan verk ===');
const without = (await c.query(`select rs.id, rs.name from research_scholars rs
  where rs.role_title ilike '%historia%'
    and not exists (select 1 from sources s where s.scholar_id = rs.id)
  order by rs.name`)).rows;
console.log(`Forskare (role_title ILIKE '%historia%') utan verk: ${without.length}`);

const newSourceIds = []; // sourceid (Buffer) för de verk vi lägger till → DEL B behandlar bara dessa
let scholarsWithNew = 0, totalNewWorks = 0;
for (const scholar of without) {
  const q = librisQuery(scholar.name);
  let list;
  try { list = await fetchLibris(q); }
  catch (e) { console.log(`  ! ${scholar.name} (forf:${q}) — ${e.message}`); await sleep(3000); continue; }

  const seen = new Set();
  let inserted = 0, used = 0;
  for (const rec of list) {
    if (used >= MAX_PER_SCHOLAR) break;
    const title = asStr(rec.title);
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue; // dedup inom forskarens träffar
    seen.add(key);
    used++;

    const year = parseYear(rec.date);
    const isbn = firstIsbn(rec.isbn);

    const exists = await c.query('select 1 from sources where title=$1 and scholar_id=$2 limit 1', [title, scholar.id]);
    if (exists.rows.length) continue;

    // sourceid = decode(md5(title||author),'hex') — deterministiskt (bytea, ingen default)
    const ins = await c.query(
      `insert into sources (title, author, publication_year, isbn, source_type, scholar_id, sourceid)
       values ($1,$2,$3,$4,'book',$5, decode(md5($6),'hex'))
       on conflict (sourceid) do nothing
       returning sourceid`,
      [title, scholar.name, year, isbn, scholar.id, title + scholar.name]
    );
    if (ins.rows.length) { newSourceIds.push(ins.rows[0].sourceid); inserted++; }
  }
  if (inserted > 0) { scholarsWithNew++; totalNewWorks += inserted; }
  console.log(`  ${scholar.name}  (forf:${q})  Libris:${list.length}  +${inserted} nya`);
  await sleep(3000); // paus ~3s mellan anrop
}
console.log(`\nDEL A klar: ${scholarsWithNew} forskare fick verk, ${totalNewWorks} nya verk totalt.`);

// ============================================================
// DEL B — auto-länka de NYA sources → entity_registry (precist)
// ============================================================
console.log('\n=== DEL B: auto-länka nya sources → entity_registry ===');

// Vitlista per uppgift (INTE parish/hundred/place/source/theme … — de ger brus).
// Landskap hanteras separat (namn + adjektivstam) längre ned.
const ALLOWED_NON_LS = ['city', 'town', 'god', 'king', 'dynasty', 'fortress', 'hillfort', 'estate'];

// Blocklista: utgivningsorter + vid geo + appellativ/personnamn som råkar vara labels.
const BLOCK = new Set([
  // utgivningsorter
  'stockholm', 'uppsala', 'upsala', 'lund', 'göteborg', 'göteborgs', 'malmö', 'london', 'oslo',
  'kristiania', 'bergen', 'köpenhamn', 'københavn', 'berlin', 'leipzig', 'paris', 'helsingfors',
  'helsinki', 'åbo', 'turku', 'wiesbaden', 'tübingen', 'münster', 'hamburg', 'frankfurt',
  'cambridge', 'oxford', 'york', 'boston', 'chicago', 'princeton', 'leiden', 'reykjavík', 'reykjavik',
  // vid geografi (länder/regioner för breda att vara "studies X")
  'sverige', 'sveriges', 'norge', 'danmark', 'finland', 'island', 'norden', 'europa', 'skandinavien',
  'england', 'tyskland', 'frankrike', 'italien', 'ryssland', 'estland', 'baltikum',
  // appellativ / vanliga ord / personnamn som är svaga signaler
  'skade', 'nanna', 'vidar', 'brage', 'köping', 'kloster', 'klosters', 'källa', 'husby', 'huseby',
  'åland', 'agnes', 'filippa', 'märta', 'trolle', 'oldenburg', 'middle',
  // regent-labels som också är mycket vanliga personförnamn → för mycket brus i titlar
  // (jfr agnes/filippa/märta ovan): "Margareta's dagboek", "Niels Börgerson" ≠ regenten
  'margareta', 'niels',
]);

const matchTermOf = (label) => label.split(' (')[0].trim();

// ---- kandidater ur entity_registry (icke-landskap) ----
const rawLabels = (await c.query(
  `select id, entity_type, label from entity_registry where entity_type = any($1) and char_length(label) >= 5`,
  [ALLOWED_NON_LS]
)).rows;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termMap = new Map();
for (const row of rawLabels) {
  const term = matchTermOf(row.label);
  if (term.length < 5) continue;
  const low = term.toLowerCase();
  if (BLOCK.has(low)) continue;
  if (termMap.has(low)) { termMap.get(low).count++; continue; } // tvetydig term → markera
  termMap.set(low, { id: row.id, type: row.entity_type, label: row.label, term, count: 1 });
}
const candidates = [...termMap.values()].filter(x => x.count === 1);
for (const cand of candidates) {
  // full ordgräns (båda sidor) — precision
  cand.re = new RegExp(`(?<![\\p{L}\\p{N}])${esc(cand.term.toLowerCase())}(?![\\p{L}\\p{N}])`, 'u');
}
console.log(`Kandidat-termer (icke-landskap) efter dedup+blocklista+längd: ${candidates.length} (av ${rawLabels.length} labels)`);

// ---- landskapskandidater: namn + adjektivstam mot BEFINTLIGA landskapsnoder ----
const LS = {
  'Gotland': ['gotland', 'gotländ', 'gutnisk', 'gutarnas'],
  'Öland': ['öland', 'öländ'],
  'Uppland': ['uppland', 'uppländ'],
  'Södermanland': ['södermanland', 'sörmländ', 'södermanländ'],
  'Östergötland': ['östergötland', 'östgöt', 'östergötländ'],
  'Västergötland': ['västergötland', 'västgöt', 'västergötländ'],
  'Skåne': ['skåne', 'skånsk'],
  'Småland': ['småland', 'småländ'],
  'Bohuslän': ['bohuslän', 'bohusländ'],
  'Halland': ['halland', 'halländ'],
  'Blekinge': ['blekinge', 'blekingsk'],
  'Närke': ['närke', 'närkes'],
  'Värmland': ['värmland', 'värmländ'],
  'Västmanland': ['västmanland', 'västmanländ'],
  'Dalarna': ['dalarna', 'dalarnas'],
  'Hälsingland': ['hälsingland', 'hälsing'],
  'Gästrikland': ['gästrikland', 'gästrik'],
  'Medelpad': ['medelpad'],
  'Ångermanland': ['ångermanland', 'ångermanländ'],
  'Jämtland': ['jämtland', 'jämtländ'],
  'Härjedalen': ['härjedalen'],
  'Dalsland': ['dalsland'],
};
let lsCount = 0;
for (const [label, stems] of Object.entries(LS)) {
  const row = (await c.query(
    `select id from entity_registry where lower(label)=lower($1) and entity_type='landscape' limit 1`, [label]
  )).rows[0];
  if (!row) continue; // rör inte entity_registry — hoppa saknade noder
  // ledande ordgräns endast (adjektivstammar är prefix: gotländ → gotländsk/gotländska)
  const alt = stems.map(s => esc(s.toLowerCase())).join('|');
  candidates.push({
    id: row.id, type: 'landscape', label,
    re: new RegExp(`(?<![\\p{L}\\p{N}])(?:${alt})`, 'u'),
  });
  lsCount++;
}
console.log(`Landskapskandidater (befintliga noder): ${lsCount}`);

// ---- hämta de NYA sources (som saknar länk) — behandla BARA dessa ----
let unlinked;
if (newSourceIds.length) {
  unlinked = (await c.query(
    `select sourceid, title from sources
     where sourceid = any($1::bytea[]) and title is not null
       and sourceid not in (select source_id from source_entity_links)`,
    [newSourceIds]
  )).rows;
} else {
  unlinked = [];
}
console.log(`Nya sources utan länk att pröva: ${unlinked.length}`);

const pairsSrc = [], pairsObj = [];
const byType = {};
const sampleLinks = [];
let worksLinked = 0;

for (const src of unlinked) {
  const title = src.title.toLowerCase();
  const hits = [];
  for (const cand of candidates) {
    const m = cand.re.exec(title);
    if (m) hits.push({ cand, start: m.index, end: m.index + m[0].length });
  }
  if (!hits.length) continue;
  hits.sort((a, b) => (b.end - b.start) - (a.end - a.start)); // längsta/mest distinkta först
  const accepted = [];
  for (const h of hits) {
    if (accepted.length >= 3) break; // max 3/verk
    if (accepted.some(a => h.start < a.end && a.start < h.end)) continue; // hoppa överlapp
    if (accepted.some(a => a.cand.id === h.cand.id)) continue; // ingen dubbel-länk samma entitet
    accepted.push(h);
  }
  if (accepted.length) worksLinked++;
  for (const a of accepted) {
    pairsSrc.push(src.sourceid);
    pairsObj.push(a.cand.id);
    byType[a.cand.type] = (byType[a.cand.type] || 0) + 1;
    if (sampleLinks.length < 40) sampleLinks.push({ title: src.title, term: a.cand.label, type: a.cand.type });
  }
}
console.log(`Verk som fick minst en länk: ${worksLinked}; nya länk-par: ${pairsSrc.length}`);

// infoga i chunkar (idempotent via UNIQUE(source_id,object_id))
let insertedLinks = 0;
const CHUNK = 500;
for (let i = 0; i < pairsSrc.length; i += CHUNK) {
  const s = pairsSrc.slice(i, i + CHUNK);
  const o = pairsObj.slice(i, i + CHUNK);
  const p = new Array(s.length).fill('studies');
  const r = await c.query(
    `insert into source_entity_links (source_id, object_id, predicate)
     select * from unnest($1::bytea[], $2::uuid[], $3::text[])
     on conflict (source_id, object_id) do nothing`,
    [s, o, p]
  );
  insertedLinks += r.rowCount;
}
console.log(`Faktiskt infogade nya länkar: ${insertedLinks}`);

console.log('\nFördelning nya länkar per entity_type:');
for (const [t, n] of Object.entries(byType).sort((a, b) => b[1] - a[1])) console.log(`  ${t}: ${n}`);

console.log('\n=== VERIFIERINGSSTICKPROV (12 länkar: verk → entitet) ===');
for (const s of sampleLinks.slice(0, 12)) {
  console.log(`  "${s.title}"  →  ${s.term} [${s.type}]`);
}

const totLinks = (await c.query('select count(*) n from source_entity_links')).rows[0].n;
const totSources = (await c.query('select count(*) n from sources')).rows[0].n;
console.log(`\nTotalt i source_entity_links: ${totLinks} | sources: ${totSources}`);

await c.end();

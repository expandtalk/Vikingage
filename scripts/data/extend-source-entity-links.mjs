// Utökar forskarverk→entitet-kopplingen (KG) i två steg. Fortsättning på
// ingest-libris-works-birka-runsten.mjs (skörd) och build-source-entity-links.mjs (länklager).
//
// INGEN GISSNING: titel/år/ISBN parsas ur Libris RÅ JSON i denna kod — ingen språkmodell hittar på
// årtal eller ISBN. Länkning sker BARA vid strikt ordgräns-match mot entity_registry.label; precision
// före täckning (hellre färre säkra länkar än brus i grafen).
//
// DEL A: skörda verk för research_scholars som saknar rader i `sources` (Libris xsearch forf:).
// DEL B: auto-länka sources UTAN länk → entity_registry med stränga regler (se nedan).
//        Befintliga Birka/runsten-länkar (source_entity_links) rörs INTE — endast sources utan länk
//        behandlas, och UNIQUE(source_id,object_id) gör allt idempotent.
//
// Kör: node scripts/data/extend-source-entity-links.mjs
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
  const m = s.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  return m ? parseInt(m[1], 10) : null;
};
const firstIsbn = (isbn) => {
  if (!isbn) return null;
  const v = Array.isArray(isbn) ? isbn[0] : isbn;
  const s = String(v).trim();
  return s.length ? s : null;
};

// research_scholars.name → Libris forf:-fråga "Efternamn Förnamn".
// Institutioner (museum/universitet/läns/institut …) frågas som-de-är.
const PARTICLES = new Set(['von', 'af', 'van', 'de', 'der', 'den', 'di', 'du']);
const librisQuery = (name) => {
  let n = name.replace(/\(red\.\)/gi, '').replace(/\s+/g, ' ').trim();
  if (/museum|universitet|läns|institut|högskola|arkiv|förening|sällskap/i.test(n)) return n; // korporativ
  if (n.includes(',')) {
    const [sur, giv] = n.split(',');
    return `${sur.trim()} ${giv.trim()}`.replace(/\s+/g, ' ').trim();
  }
  const parts = n.split(' ');
  let si = parts.findIndex(p => PARTICLES.has(p.toLowerCase()));
  if (si === -1) si = parts.length - 1; // sista token = efternamn
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
    const j = JSON.parse(await r.text());
    return j?.xsearch?.list ?? [];
  }
  throw new Error(`Libris 429 gav upp för ${q}`);
};

// ============================================================
// DEL A — skörda verk för forskare som saknar verk
// ============================================================
console.log('=== DEL A: skörda verk för forskare utan verk ===');
const without = (await c.query(`select rs.id, rs.name from research_scholars rs
  where not exists (select 1 from sources s where s.scholar_id = rs.id)
  order by rs.name`)).rows;
console.log(`Forskare utan verk: ${without.length}`);

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
    if (seen.has(key)) continue;
    seen.add(key);
    used++;

    const year = parseYear(rec.date);
    const isbn = firstIsbn(rec.isbn);

    const exists = await c.query('select 1 from sources where title=$1 and scholar_id=$2 limit 1', [title, scholar.id]);
    if (exists.rows.length) continue;

    await c.query(
      `insert into sources (title, author, publication_year, isbn, source_type, scholar_id, sourceid)
       values ($1,$2,$3,$4,'book',$5, decode(md5($6),'hex'))
       on conflict (sourceid) do nothing`,
      [title, scholar.name, year, isbn, scholar.id, title + scholar.name]
    );
    inserted++;
  }
  if (inserted > 0) { scholarsWithNew++; totalNewWorks += inserted; }
  console.log(`  ${scholar.name}  (forf:${q})  Libris:${list.length}  +${inserted} nya`);
  await sleep(3000); // paus mellan anrop
}
console.log(`\nDEL A klar: ${scholarsWithNew} forskare fick verk, ${totalNewWorks} nya verk totalt.`);

// ============================================================
// DEL B — auto-länka sources UTAN länk → entity_registry (precist)
// ============================================================
console.log('\n=== DEL B: auto-länka sources utan länk → entity_registry ===');

// Tillåtna entitetstyper (INTE source/theme/artefact/inscription — de ger brus).
const ALLOWED = ['city', 'town', 'landscape', 'parish', 'hundred', 'place', 'god', 'king', 'dynasty', 'hillfort', 'fortress', 'estate'];

// Blocklista: appellativ / vanliga ord / vanliga personförnamn som råkar vara labels.
// (Dedup nedan tar redan bort Husby m.fl. som förekommer på flera entiteter — detta är extra vakt.)
const BLOCK = new Set([
  'skade',   // 'skade' = skada (da/no) — inte guden i titlar
  'nanna', 'vidar', 'brage', // gudanamn som också är vanliga personnamn
  'bergen',  // 'bergen' = bergen (bestämd plural) lika ofta som staden
  'köping',  // appellativ (marknadsplats) / vanligt i sammansättningar
  'åland',   // regionen, inte socknen
  'agnes', 'filippa', 'märta', // vanliga personnamn (drottning-labels men oftast forskarnamn i titlar)
  'trolle',  // släkt/namn, svagt signalvärde ensamt (Trolle-Ljungby = ort)
  'oldenburg', // dynasti-label men matchar orten Starigard/Oldenburg
  'husby', 'huseby', 'husby by', // appellativ husby (även dubblett-entiteter)
  'angus', 'arran', 'argyll', // skotska, låg relevans i svensk korpus
  'middle',  // eng. 'härad' Middle — träffar "Middle Earth/Ages"
  'paris',   // träffar seriedelar/festskrifter, sällan ämne i korpusen
  'kloster', 'klosters', // appellativ (Vreta klosters kyrka), ej socknen Klosters
  'källa',   // 'källa' = spring/source (mycket vanligt ord) — offrar socknen Källa
  'danmark', 'sverige', 'norge', // landet, inte t.ex. Danmarks socken
]);

// Matchterm = label före ev. parentetisk disambiguering ("Kalmar (slott)" → "Kalmar").
const matchTermOf = (label) => label.split(' (')[0].trim();

// Ladda kandidater; dedup på matchterm (>1 entitet = tvetydigt → hoppa helt).
const rawLabels = (await c.query(
  `select id, entity_type, label from entity_registry where entity_type = any($1) and char_length(label) >= 5`,
  [ALLOWED]
)).rows;

const termMap = new Map(); // term(lower) -> {id, type, label, term, count}
for (const row of rawLabels) {
  const term = matchTermOf(row.label);
  if (term.length < 5) continue;
  const low = term.toLowerCase();
  if (BLOCK.has(low)) continue;
  if (termMap.has(low)) { termMap.get(low).count++; continue; } // markera tvetydig
  termMap.set(low, { id: row.id, type: row.entity_type, label: row.label, term, count: 1 });
}
// släng tvetydiga (samma term → flera entiteter)
const candidates = [...termMap.values()].filter(x => x.count === 1);
console.log(`Kandidat-termer efter dedup+blocklista+längd: ${candidates.length} (av ${rawLabels.length} råa labels)`);

// Förkompilera regex: Unicode-ordgräns (respekterar å/ä/ö via \p{L}).
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const cand of candidates) {
  cand.re = new RegExp(`(?<![\\p{L}\\p{N}])${esc(cand.term.toLowerCase())}(?![\\p{L}\\p{N}])`, 'u');
}

// Hämta sources UTAN länk (rör inte befintliga länkar).
const unlinked = (await c.query(
  `select sourceid, title from sources
   where title is not null
     and sourceid not in (select source_id from source_entity_links)`
)).rows;
console.log(`Sources utan länk att pröva: ${unlinked.length}`);

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
  // längsta/mest distinkta först; hoppa överlappande span (undvik substräng-dubbletter)
  hits.sort((a, b) => (b.end - b.start) - (a.end - a.start));
  const accepted = [];
  for (const h of hits) {
    if (accepted.length >= 3) break;
    if (accepted.some(a => h.start < a.end && a.start < h.end)) continue; // överlapp
    accepted.push(h);
  }
  if (accepted.length) worksLinked++;
  for (const a of accepted) {
    pairsSrc.push(src.sourceid); // Buffer (bytea)
    pairsObj.push(a.cand.id);
    byType[a.cand.type] = (byType[a.cand.type] || 0) + 1;
    if (sampleLinks.length < 40) sampleLinks.push({ title: src.title, term: a.cand.label, type: a.cand.type });
  }
}
console.log(`Verk som fick minst en länk: ${worksLinked}; nya länk-par: ${pairsSrc.length}`);

// Infoga i chunkar (idempotent via UNIQUE).
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

// Fördelning per entity_type (endast de nya länkarna).
console.log('\nFördelning nya länkar per entity_type:');
for (const [t, n] of Object.entries(byType).sort((a, b) => b[1] - a[1])) console.log(`  ${t}: ${n}`);

// Verifieringsstickprov (15 länkar: verk-titel → entitet-label).
console.log('\n=== VERIFIERINGSSTICKPROV (15 länkar) ===');
for (const s of sampleLinks.slice(0, 15)) {
  console.log(`  "${s.title}"  →  ${s.term} [${s.type}]`);
}

// Totaler.
const totLinks = (await c.query('select count(*) n from source_entity_links')).rows[0].n;
const totSources = (await c.query('select count(*) n from sources')).rows[0].n;
console.log(`\nTotalt i source_entity_links: ${totLinks} | sources: ${totSources}`);

// Slutverifiering: works-grenen för Gotland + Öland.
for (const t of ['Gotland', 'Öland']) {
  const r = await c.query(
    `select jsonb_array_length((entity_answer_context($1))->'works') n,
            ((entity_answer_context($1))->'works'->0->>'title') ex`, [t]);
  console.log(`entity_answer_context('${t}').works = ${r.rows[0].n} | ex: ${r.rows[0].ex}`);
}

await c.end();

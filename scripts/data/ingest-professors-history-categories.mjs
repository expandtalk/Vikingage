// KATEGORI-INGEST: tre Wikipedia-kategorier av svenska historieprofessorer → research_scholars.
// Kategorimedlemskapet ÄR kureringen (mänskligt kurerat på Wikipedia).
//
// INGEN GISSNING: all liv-/affiliation-data hämtas LIVE och parsas som RÅ JSON i koden — ingen
// språkmodell tolkar Q-id, datum (P569/P570) eller arbetsgivare (P108). Okända fält = null.
//
// Kategorier (namnrymd 0; underkategorier hoppas) + role_title:
//   1. "Svenska professorer i historia"            → 'Professor i historia'
//   2. "Svenska professorer i kyrkohistoria"        → 'Professor i kyrkohistoria'
//   3. "Svenska professorer i ekonomisk historia"   → 'Professor i ekonomisk historia'
//
// Pipeline per person:
//   1. Kategorimedlemmar via sv.wikipedia API (bara namnrymd 0 = artiklar).
//   2. Wikidata-Q-id via sv.wikipedia pageprops.wikibase_item.
//   3. Wikidata EntityData: P569 (födelse), P570 (död), P108 (arbetsgivare → label).
//   4. Idempotent insert i research_scholars på external_ref.
//
// Dedup: en person kan finnas i flera kategorier (kyrkohistoriker även i historia).
//   Första kategorin (ordningen ovan) vinner — role_title/source sätts därefter. Idempotens
//   mot befintliga rader sker på external_ref. INGA verk ingestas.
//
// Fältmappning:
//   name          = "Efternamn, Förnamn" (sista ordet i titeln = efternamn; osäkert → hela namnet)
//   affiliation   = P108 arbetsgivar-label (sv, annars en); null om saknas
//   role_title    = enligt kategori (se ovan)
//   active_period = "YYYY–YYYY" (död) / "f. YYYY" (bara födelse) / null
//   life_status   = 'avliden' om P570 finns, annars null
//   external_ref  = 'wikidata:Qxxxx' (idempotensnyckel); saknas Q-id → 'wikipedia:<titel>'
//   source        = 'Wikipedia-kategori: <kategori> (Wikidata-verifierad)'
import pg from 'pg';
import fs from 'fs';

const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const UA = 'VikingAge-research-ingest/1.0 (daniel.larsson@expandtalk.se)';

const CATEGORIES = [
  { cat: 'Svenska professorer i historia',          role: 'Professor i historia' },
  { cat: 'Svenska professorer i kyrkohistoria',     role: 'Professor i kyrkohistoria' },
  { cat: 'Svenska professorer i ekonomisk historia', role: 'Professor i ekonomisk historia' },
];

async function getJSON(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --- 1. Kategorimedlemmar (namnrymd 0), pagineras via cmcontinue ------------------
async function fetchCategoryMembers(cat) {
  const members = [];
  let cont = null;
  do {
    let url = 'https://sv.wikipedia.org/w/api.php?action=query&list=categorymembers'
      + '&cmtitle=' + encodeURIComponent('Kategori:' + cat)
      + '&cmnamespace=0&cmlimit=500&format=json';
    if (cont) url += '&cmcontinue=' + encodeURIComponent(cont);
    const j = await getJSON(url);
    for (const m of (j.query?.categorymembers || [])) members.push(m.title);
    cont = j.continue?.cmcontinue || null;
  } while (cont);
  return members;
}

// --- 2. Wikidata-Q-id via pageprops (batch 50 titlar) ---------------------------
async function fetchQids(titles) {
  const map = {}; // titel -> Q-id | null
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const url = 'https://sv.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item'
      + '&titles=' + encodeURIComponent(batch.join('|')) + '&format=json&redirects=1';
    const j = await getJSON(url);
    const norm = {};
    for (const n of (j.query?.normalized || [])) norm[n.to] = n.from;
    for (const rd of (j.query?.redirects || [])) norm[rd.to] = norm[rd.to] || rd.from;
    for (const p of Object.values(j.query?.pages || {})) {
      const q = p.pageprops?.wikibase_item || null;
      let key = p.title;
      while (norm[key] && batch.indexOf(key) === -1) key = norm[key];
      map[key] = q;
    }
    for (const t of batch) if (!(t in map)) map[t] = null;
    await sleep(150);
  }
  return map;
}

// --- 3. Wikidata EntityData: P569/P570/P108 -------------------------------------
function yearFromTime(claims, pid) {
  const arr = claims?.[pid];
  if (!Array.isArray(arr)) return null;
  for (const st of arr) {
    if (st.rank === 'deprecated') continue;
    const t = st.mainsnak?.datavalue?.value?.time; // ex "+1869-00-00T00:00:00Z"
    if (t) {
      const m = /^[+-](\d{4})/.exec(t);
      if (m) return m[1];
    }
  }
  return null;
}
function employerQids(claims) {
  const arr = claims?.P108;
  const out = [];
  if (Array.isArray(arr)) {
    for (const st of arr) {
      if (st.rank === 'deprecated') continue;
      const id = st.mainsnak?.datavalue?.value?.id;
      if (id) out.push(id);
    }
  }
  return out;
}

async function fetchEntity(q) {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${q}.json`;
  const j = await getJSON(url);
  return j.entities?.[q] || null;
}

// hämta labels (sv först, annars en) för en uppsättning Q-id, batchat
async function fetchLabels(qids) {
  const labels = {};
  const uniq = [...new Set(qids)];
  for (let i = 0; i < uniq.length; i += 50) {
    const batch = uniq.slice(i, i + 50);
    const url = 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + batch.join('|')
      + '&props=labels&languages=sv|en&format=json';
    const j = await getJSON(url);
    for (const [q, e] of Object.entries(j.entities || {})) {
      labels[q] = e.labels?.sv?.value || e.labels?.en?.value || null;
    }
    await sleep(150);
  }
  return labels;
}

function toSurnameFirst(title) {
  const base = title.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const parts = base.split(/\s+/);
  if (parts.length < 2) return base;
  const sur = parts[parts.length - 1];
  const given = parts.slice(0, -1).join(' ');
  return `${sur}, ${given}`;
}

// --------------------------------------------------------------------------------
// Bygg en dedupad person-lista: ordningen bland CATEGORIES bestämmer vem som vinner
// (första kategorin där personen förekommer sätter role_title + source).
const perCategoryCounts = [];
const persons = new Map(); // dedup-nyckel (Q-id om finns, annars 'wikipedia:'+titel) -> {title, cat, role}
const qidByTitle = {};

for (const { cat, role } of CATEGORIES) {
  const titles = await fetchCategoryMembers(cat);
  perCategoryCounts.push({ cat, count: titles.length });
  console.log(`Kategori "${cat}": ${titles.length} medlemmar (namnrymd 0)`);

  const qids = await fetchQids(titles);
  Object.assign(qidByTitle, qids);

  for (const t of titles) {
    const q = qids[t];
    const key = q ? ('wikidata:' + q) : ('wikipedia:' + t);
    if (!persons.has(key)) persons.set(key, { title: t, cat, role, qid: q });
  }
}

console.log('\nUnika personer efter dedup över kategorier:', persons.size);

// Hämta entiteter för alla med Q-id
const entities = {};
const allEmployerQids = [];
let noQid = 0;
for (const [, p] of persons) {
  if (!p.qid) { noQid++; continue; }
  if (entities[p.qid]) continue;
  try {
    const e = await fetchEntity(p.qid);
    entities[p.qid] = e;
    if (e?.claims) allEmployerQids.push(...employerQids(e.claims));
  } catch (err) {
    console.warn('  ! kunde ej hämta entitet', p.qid, 'för', p.title, '-', err.message);
  }
  await sleep(120);
}
const employerLabels = await fetchLabels(allEmployerQids);

// --- 4. Ingest ------------------------------------------------------------------
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

let inserted = 0, skipped = 0, noDate = 0;
const examples = [];
for (const [key, p] of persons) {
  const name = toSurnameFirst(p.title);
  const ext = key; // 'wikidata:Q...' eller 'wikipedia:<titel>'
  let birth = null, death = null, aff = null;

  if (p.qid) {
    const e = entities[p.qid];
    birth = yearFromTime(e?.claims, 'P569');
    death = yearFromTime(e?.claims, 'P570');
    for (const eq of employerQids(e?.claims || {})) { if (employerLabels[eq]) { aff = employerLabels[eq]; break; } }
  }
  const period = death ? `${birth || '?'}–${death}` : (birth ? `f. ${birth}` : null);
  const life = death ? 'avliden' : null;
  if (!birth && !death) noDate++;
  const source = `Wikipedia-kategori: ${p.cat} (Wikidata-verifierad)`;

  const exist = await c.query(`select id from research_scholars where external_ref=$1 limit 1`, [ext]);
  if (exist.rows.length) { skipped++; continue; }

  await c.query(
    `insert into research_scholars (name, affiliation, role_title, active_period, life_status, external_ref, source)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [name, aff, p.role, period, life, ext, source]);
  inserted++;
  if (examples.length < 6) examples.push(`${name} · ${ext} · aff:${aff||'(null)'} · ${p.cat}`);
}

console.log('\n=== KLART ===');
for (const pc of perCategoryCounts) console.log(`Medlemmar "${pc.cat}":`, pc.count);
console.log('Unika personer (dedupade):', persons.size);
console.log('Nya insatta:', inserted);
console.log('Fanns redan (idempotens):', skipped);
console.log('Saknade Wikidata-Q-id:', noQid);
console.log('Saknade liv-datum (varken födelse/död):', noDate);
console.log('\nExempel (upp till 6):');
for (const ex of examples) console.log('  +', ex);
await c.end();

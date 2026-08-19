// KATEGORI-INGEST: HELA Wikipedia-kategorin "Svenska professorer i arkeologi" → research_scholars.
// Kategorimedlemskapet ÄR kureringen (mänskligt kurerat på Wikipedia = professor i arkeologi).
//
// INGEN GISSNING: all data hämtas LIVE och parsas som RÅ JSON i koden — ingen språkmodell tolkar
// Q-id, datum eller affiliation (hallucinationsrisk). Okända fält = null.
//
// Pipeline per person:
//   1. Kategorimedlemmar via sv.wikipedia API (bara namnrymd 0 = artiklar; underkategorier hoppas).
//   2. Wikidata-Q-id via sv.wikipedia pageprops.wikibase_item.
//   3. Wikidata EntityData: P569 (födelse), P570 (död), P108 (arbetsgivare → label via wbgetentities).
//   4. Idempotent insert i research_scholars på external_ref.
//
// Fältmappning:
//   name          = "Efternamn, Förnamn" (sista ordet i titeln = efternamn; osäkert → hela namnet)
//   affiliation   = P108 arbetsgivar-label (sv, annars en); null om saknas
//   role_title    = 'Professor i arkeologi' (fast; kategorin ÄR professorer i arkeologi)
//   active_period = "YYYY–YYYY" (död) / "f. YYYY" (bara födelse) / null
//   life_status   = 'avliden' om P570 finns, annars null
//   external_ref  = 'wikidata:Qxxxx'  (idempotensnyckel); saknas Q-id → 'wikipedia:<titel>'
//   source        = 'Wikipedia-kategori: Svenska professorer i arkeologi (Wikidata-verifierad liv/affiliation)'
// INGA verk ingestas.
import pg from 'pg';
import fs from 'fs';

const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const UA = 'VikingAge-research-ingest/1.0 (daniel.larsson@expandtalk.se)';
const SOURCE = 'Wikipedia-kategori: Svenska professorer i arkeologi (Wikidata-verifierad liv/affiliation)';
const ROLE = 'Professor i arkeologi';

async function getJSON(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --- 1. Kategorimedlemmar (namnrymd 0), pagineras via cmcontinue ------------------
async function fetchCategoryMembers() {
  const members = [];
  let cont = null;
  do {
    let url = 'https://sv.wikipedia.org/w/api.php?action=query&list=categorymembers'
      + '&cmtitle=' + encodeURIComponent('Kategori:Svenska professorer i arkeologi')
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
    // hantera normalisering/redirects: mappa tillbaka till efterfrågad titel
    const norm = {};
    for (const n of (j.query?.normalized || [])) norm[n.to] = n.from;
    for (const rd of (j.query?.redirects || [])) norm[rd.to] = norm[rd.to] || rd.from;
    for (const p of Object.values(j.query?.pages || {})) {
      const q = p.pageprops?.wikibase_item || null;
      let key = p.title;
      // gå bakåt genom redirect/normalize-kedjan till original-titeln om möjligt
      while (norm[key] && batch.indexOf(key) === -1) key = norm[key];
      map[key] = q;
    }
    // säkerställ att varje batch-titel har en post (även om null)
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
  // ta bort ev. förtydligande parentes, t.ex. "Anna Andersson (arkeolog)"
  const base = title.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const parts = base.split(/\s+/);
  if (parts.length < 2) return base; // osäker uppdelning → hela namnet
  const sur = parts[parts.length - 1];
  const given = parts.slice(0, -1).join(' ');
  return `${sur}, ${given}`;
}

// --------------------------------------------------------------------------------
const titles = await fetchCategoryMembers();
console.log('Kategorimedlemmar (namnrymd 0) hämtade:', titles.length);

const qidByTitle = await fetchQids(titles);

// hämta entiteter för alla med Q-id
const entities = {}; // Q -> entity
const allEmployerQids = [];
let noQid = 0;
for (const t of titles) {
  const q = qidByTitle[t];
  if (!q) { noQid++; continue; }
  try {
    const e = await fetchEntity(q);
    entities[q] = e;
    if (e?.claims) allEmployerQids.push(...employerQids(e.claims));
  } catch (err) {
    console.warn('  ! kunde ej hämta entitet', q, 'för', t, '-', err.message);
  }
  await sleep(120);
}
const employerLabels = await fetchLabels(allEmployerQids);

// --- 4. Ingest ------------------------------------------------------------------
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

let inserted = 0, skipped = 0, noDate = 0;
const examples = [];
for (const t of titles) {
  const q = qidByTitle[t];
  const name = toSurnameFirst(t);
  let ext, birth = null, death = null, aff = null;

  if (q) {
    ext = 'wikidata:' + q;
    const e = entities[q];
    birth = yearFromTime(e?.claims, 'P569');
    death = yearFromTime(e?.claims, 'P570');
    const empQs = employerQids(e?.claims || {});
    for (const eq of empQs) { if (employerLabels[eq]) { aff = employerLabels[eq]; break; } }
  } else {
    ext = 'wikipedia:' + t;
  }
  const period = death ? `${birth || '?'}–${death}` : (birth ? `f. ${birth}` : null);
  const life = death ? 'avliden' : null;
  if (!birth && !death) noDate++;

  const exist = await c.query(`select id from research_scholars where external_ref=$1 limit 1`, [ext]);
  if (exist.rows.length) { skipped++; continue; }

  await c.query(
    `insert into research_scholars (name, affiliation, role_title, active_period, life_status, external_ref, source)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [name, aff, ROLE, period, life, ext, SOURCE]);
  inserted++;
  if (examples.length < 6) examples.push(`${name} · ${ext} · aff:${aff||'(null)'} · period:${period||'(null)'} · status:${life||'(null)'}`);
}

console.log('\n=== KLART ===');
console.log('Kategorimedlemmar:', titles.length);
console.log('Nya insatta:', inserted);
console.log('Fanns redan (idempotens):', skipped);
console.log('Saknade Wikidata-Q-id:', noQid);
console.log('Saknade liv-datum (varken födelse/död):', noDate);
console.log('\nExempel (upp till 6):');
for (const ex of examples) console.log('  +', ex);
await c.end();

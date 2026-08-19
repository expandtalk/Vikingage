// PILOT: skörda VERK ur Libris (KB) xsearch-API för Birka-/runstensknutna arkeologiprofessorer
// och lägg i public.sources (kopplade till forskaren via scholar_id).
//
// INGEN GISSNING: endast verk som Libris FAKTISKT returnerar. Titel/år/ISBN/url parsas ur RÅ JSON
// i denna kod — ingen språkmodell hittar på ISBN eller årtal. År = första 4-siffriga talet i `date`.
// source_type härleds ur Libris `type`-fält (article/book/map/serial), inte gissat.
//
// Kör: node scripts/data/ingest-libris-works-birka-runsten.mjs
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

// Pilotgrupp: kanoniska research_scholars-rader (id pinnat för att undvika dubblett-tvetydighet).
// Libris-frågenamn = "Efternamn Förnamn" (forf:). Selinge (Klas-Göran) saknas i research_scholars.
const pilot = [
  { id: '21d244ef-6af8-43b9-b208-6b0d157d71e1', q: 'Arbman Holger' },      // Birka-utgrävaren
  { id: '9d949d43-c5f5-417a-b9b6-5792382705a1', q: 'Ambrosiani Björn' },    // Birkaprojektet
  { id: '863cd336-4d08-4389-abc9-b8e0e3ceb544', q: 'Arwidsson Greta' },     // Valsgärde/Birka
  { id: 'b14131d6-6b43-4d24-9e61-d4d8e08c0745', q: 'Gräslund Anne-Sofie' }, // runstenar/kristnande
  { id: '432f76fe-18ec-4dc4-b810-9e6149c7d9c9', q: 'Gräslund Bo' },         // runolog/arkeolog
  { id: '38388e6e-45ac-4821-9d98-a72237ff8eac', q: 'Nerman Birger' },       // Gotland/runstenar
  { id: '905dc9e9-a614-4a4d-beb7-138f164788b8', q: 'Lindqvist Sune' },      // Gotlands bildstenar
  { id: '8f30ec15-5e87-4302-8588-94fa1d717a3a', q: 'Jansson Sven B. F.' },  // "Run-Janne", riksantikvarie
  { id: 'e8b313e9-acb9-4661-aad7-5176c94e69a5', q: 'Wessén Elias' },        // runolog (SRI)
  { id: 'a163a051-bfcd-406a-b6b7-80c77bfec786', q: 'von Friesen Otto' },    // runolog
  { id: '8e685b47-a2ea-450e-8451-7c2ef77f312a', q: 'Stenberger Mårten' },   // Öland/Eketorp/Vallhagar
  { id: '1f4fa681-3bef-406d-b1e0-0a5a6870268a', q: 'Holmqvist Wilhelm' },   // Helgö
];

// ---- rena parsers (ingen LLM) ----
// Libris kan returnera fält som sträng ELLER array (t.ex. flera förlag) → normalisera till sträng.
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
const mapType = (t) => {
  const s = String(t || '').toLowerCase();
  if (s.includes('article')) return 'article';
  if (s.includes('map') || s.includes('karta')) return 'map';
  if (s.includes('serial') || s.includes('journal')) return 'serial';
  return 'book';
};

const fetchLibris = async (q) => {
  const url = `http://libris.kb.se/xsearch?query=${encodeURIComponent(`forf:(${q})`)}&format=json&n=200`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Libris HTTP ${r.status} för ${q}`);
  const j = JSON.parse(await r.text()); // parsa RÅ JSON i kod
  let list = j?.xsearch?.list ?? [];
  if (list.length === 0) {
    // fallback: bara efternamnet
    const surname = q.split(' ')[0];
    const url2 = `http://libris.kb.se/xsearch?query=${encodeURIComponent(`forf:(${surname})`)}&format=json&n=200`;
    const r2 = await fetch(url2);
    if (r2.ok) list = (JSON.parse(await r2.text())?.xsearch?.list) ?? [];
  }
  return list;
};

const summary = [];

for (const p of pilot) {
  const rs = await c.query('select id, name from research_scholars where id=$1', [p.id]);
  if (rs.rows.length === 0) { console.log(`SAKNAS i research_scholars: ${p.q} (${p.id})`); continue; }
  const scholar = rs.rows[0];

  const list = await fetchLibris(p.q);
  console.log(`\n=== ${scholar.name} — Libris gav ${list.length} poster ===`);

  const seen = new Set();
  let inserted = 0, skipped = 0, used = 0;
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
    const url = asStr(rec.identifier) || null;
    const publisher = asStr(rec.publisher) || null;
    const stype = mapType(rec.type);

    const exists = await c.query('select 1 from sources where title=$1 and scholar_id=$2 limit 1', [title, scholar.id]);
    if (exists.rows.length) { skipped++; continue; }

    // sourceid = decode(md5(title||author),'hex') — deterministiskt (bytea, ingen default)
    await c.query(
      `insert into sources (title, author, publication_year, publisher, isbn, url, source_type, scholar_id, sourceid)
       values ($1,$2,$3,$4,$5,$6,$7,$8, decode(md5($9),'hex'))`,
      [title, scholar.name, year, publisher, isbn, url, stype, scholar.id, title + scholar.name]
    );
    inserted++;
  }
  console.log(`  + ${inserted} nya · ${skipped} dubblett/hoppade · ${used} unika behandlade`);
  summary.push({ name: scholar.name, libris: list.length, inserted, skipped });
}

// --- Informativt: hur ser entitetskopplingen ut? (surfacing av verk per entitet) ---
console.log('\n=== länknings-diagnostik ===');
const birkaPage = await c.query(`select id, slug, title_sv from content_pages where slug ilike 'birka' or title_sv ilike 'birka' limit 3`);
console.log('content_pages birka:', birkaPage.rows.length ? JSON.stringify(birkaPage.rows) : 'INGEN');
const hasSrcEntityLink = await c.query(`select 1 from information_schema.tables where table_schema='public' and table_name in ('source_entity_links') limit 1`);
console.log('source_entity_links-tabell finns:', hasSrcEntityLink.rows.length > 0);

console.log('\n=== SLUTsummering (verk i sources per pilotforskare) ===');
for (const p of pilot) {
  const r = await c.query('select rs.name, count(s.*) n from research_scholars rs left join sources s on s.scholar_id=rs.id where rs.id=$1 group by rs.name', [p.id]);
  if (r.rows.length) console.log(`  ${r.rows[0].name}: ${r.rows[0].n} verk totalt i sources`);
}

await c.end();

#!/usr/bin/env node
// Harvesta Fornvännen-artiklar ur Riksantikvarieämbetets DiVA (OAI-PMH) → historical_sources.
// Fornvännen är fackgranskad (peer-reviewed) och öppet tillgänglig (openAccess) via RAÄ/DiVA +
// kulturarvsdata.se. VI LAGRAR: bibliografisk METADATA + FAKTA per artikel (titel, författare, år,
// sidor, ämnen, URN, PDF-länk, attribution). VI LAGRAR INTE verbatim fulltext (rights=copyrighted;
// openAccess = fri läsning, ej CC-återbruk). Per-artikel kategorisering ur dc:subject.
//
// Kör:  node scripts/data/harvest-fornvannen.mjs --dry            # rapport, ingen insert
//       node scripts/data/harvest-fornvannen.mjs                  # skarp ingest (idempotent, dedup på source_key=URN)
//       node scripts/data/harvest-fornvannen.mjs --max-pages 3    # kapa (test)
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const OAI = 'https://raa.diva-portal.org/dice/oai';
const FORNVANNEN_ISSN = '0015-7813';
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const MAX_PAGES = (() => { const i = args.indexOf('--max-pages'); return i > -1 ? Number(args[i + 1]) : Infinity; })();

const dec = (s) => (s ?? '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&amp;/g, '&').trim();
const all = (re, s) => { const out = []; let m; while ((m = re.exec(s))) out.push(dec(m[1])); return out; };
const one = (re, s) => { const m = re.exec(s); return m ? dec(m[1]) : null; };

// Härled plattforms-domän ur ämnesord + titel (första träff i prioritetsordning).
const CAT_RULES = [
  ['runologi',            /runst|runa|runi|runic|runinskrift|futhark|rune\b/i],
  ['numismatik',          /mynt|numismat|brakteat|denar|skattfynd|hoard|coin/i],
  ['ortnamn',             /ortnamn|place-?name|toponym|namnskick/i],
  ['marinarkeologi',      /skeppsvr|vrak\b|marinark|båtgrav|\bskepp|hamn|farled|shipwreck/i],
  ['gravar_osteologi',    /osteolog|kremer|skelett|\bben\b|gravfält|\bgrav\b|burial|cremation/i],
  ['kyrka_konst',         /kyrk|kloster|kalkmål|ikonograf|altar|dopfunt|medeltidskonst|church/i],
  ['fornborg_befästning', /fornborg|\bborg\b|befäst|vallanläggning|hillfort/i],
  ['stenålder',           /stenålder|mesolit|neolit|megalit|stone age/i],
  ['bronsålder',          /bronsålder|hällrist|bronze age|rock art|rock-carving/i],
  ['järnålder_vikingatid',/järnålder|vikingat|vendel|folkvandring|migration period|iron age|viking/i],
  ['medeltid',            /medeltid|medieval|senmedeltid/i],
];
const deriveCategory = (subjects, title) => {
  const hay = [...subjects, title].join(' ').toLowerCase();
  for (const [cat, re] of CAT_RULES) if (re.test(hay)) return cat;
  return 'arkeologi'; // National Subject Category = Historia och arkeologi
};

async function fetchPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'vikingage-harvest/1.0 (research; contact daniel.larsson@expandtalk.se)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} för ${url}`);
  return res.text();
}

function parseRecords(xml) {
  const recs = [];
  const re = /<record>([\s\S]*?)<\/record>/g;
  let m;
  while ((m = re.exec(xml))) {
    const r = m[1];
    if (/<header[^>]*status="deleted"/.test(r)) continue;
    const relations = all(/<dc:relation>([\s\S]*?)<\/dc:relation>/g, r);
    const fv = relations.find((x) => x.includes(FORNVANNEN_ISSN));
    if (!fv) continue; // bara Fornvännen (ej RiViH/nyhetsbrev)
    const idents = all(/<dc:identifier>([\s\S]*?)<\/dc:identifier>/g, r);
    const urn = (idents.find((x) => /urn:nbn:se:raa:diva-\d+/.test(x)) || '').match(/urn:nbn:se:raa:diva-\d+/)?.[0] || null;
    const title = one(/<dc:title>([\s\S]*?)<\/dc:title>/, r);
    if (!title || !urn) continue;
    const creators = all(/<dc:creator>([\s\S]*?)<\/dc:creator>/g, r);
    const subjects = all(/<dc:subject[^>]*>([\s\S]*?)<\/dc:subject>/g, r)
      .filter((s) => s && !/^info:eu-repo/.test(s));
    const dateRaw = one(/<dc:date>([\s\S]*?)<\/dc:date>/, r);
    const yearFromRel = fv.match(/\b(1[6-9]\d\d|20\d\d)\b/)?.[1];
    const year = Number((dateRaw && dateRaw.match(/\d{4}/)?.[0]) || yearFromRel || 0) || null;
    const startPage = fv.match(/s\.\s*(\d+)/)?.[1] || null;
    // Verifierat 200: kulturarvsdata /html/<år>_<startsida> = Fornvännen-artikelsidan (faksimil/PDF).
    // (/pdf/ gav 400 — fel gissning.) Saknas startsida → officiell URN-resolve (DiVA-posten m. fulltext-PDF).
    const pdf = year && startPage
      ? `https://kulturarvsdata.se/raa/fornvannen/html/${year}_${startPage}`
      : `https://urn.kb.se/resolve?urn=${urn}`;
    recs.push({
      urn, title, author: creators.join('; ') || '[Ej angiven]', year, subjects,
      pages: fv.match(/s\.\s*[\d–-]+/)?.[0] || null, relation: fv,
      category: deriveCategory(subjects, title), url: pdf,
    });
  }
  return recs;
}

function dbPassword() {
  const env = fs.readFileSync(path.resolve('.env'), 'utf8');
  return env.split('\n').find((l) => l.startsWith('SUPABASE_DB_PASSWORD=')).split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}

async function main() {
  console.log(`Harvest Fornvännen ur DiVA (${OAI})${DRY ? ' [DRY]' : ''}`);
  let url = `${OAI}?verb=ListRecords&metadataPrefix=oai_dc`;
  const records = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const xml = await fetchPage(url);
    const recs = parseRecords(xml);
    records.push(...recs);
    const token = one(/<resumptionToken[^>]*>([\s\S]*?)<\/resumptionToken>/, xml);
    process.stdout.write(`\r sida ${page}: +${recs.length} Fornvännen (totalt ${records.length})   `);
    if (!token) break;
    url = `${OAI}?verb=ListRecords&resumptionToken=${encodeURIComponent(token)}`;
  }
  console.log(`\nFornvännen-artiklar hittade: ${records.length}`);
  const byCat = records.reduce((a, r) => ((a[r.category] = (a[r.category] || 0) + 1), a), {});
  console.log('Per kategori:', JSON.stringify(byCat, null, 0));
  const years = records.map((r) => r.year).filter(Boolean).sort((a, b) => a - b);
  console.log(`Årsintervall: ${years[0]} … ${years[years.length - 1]}`);

  if (DRY) { console.log('\n[DRY] Inga rader skrivna. Exempel:', JSON.stringify(records.slice(0, 2), null, 2)); return; }

  const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: dbPassword(), database: 'postgres' });
  await client.connect();
  let ins = 0, skip = 0;
  try {
    for (const r of records) {
      const srcKey = `diva:${r.urn}`;
      const res = await client.query(
        `insert into historical_sources
           (title, title_en, author, written_year, language, work_type, collection, catalog_role,
            kind, rights, reliability, peer_reviewed, url, repository, repository_ref, source_key,
            subjects, category, description, retrieved_at)
         select $1,$1,$2,$3,'sv','article','Fornvännen','scholarship','publication','copyrighted','secondary',true,
                $4,'DiVA (Riksantikvarieämbetet)',$5,$6,$7,$8,$9, now()
         where not exists (select 1 from historical_sources where source_key = $6)`,
        [r.title, r.author, r.year, r.url, r.urn, srcKey, r.subjects, r.category,
         `Fornvännen ${r.pages || ''} (${r.relation}). Öppet tillgänglig via RAÄ/DiVA (openAccess); fackgranskad. Metadata + fakta fritt; verbatim text upphovsrättsskyddad. Ämnen: ${r.subjects.join(', ') || '—'}.`.trim()],
      );
      if (res.rowCount) ins++; else skip++;
    }
    console.log(`\nKLART: ${ins} nya, ${skip} fanns redan (dedup source_key). © Fornvännen/RAÄ, openAccess.`);
  } finally { await client.end(); }
}
main().catch((e) => { console.error('\nFEL:', e.message); process.exit(1); });

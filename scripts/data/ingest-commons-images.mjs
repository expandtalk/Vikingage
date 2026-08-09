// Wikimedia Commons bild-ingest → inscription_media, för runstenar som SAKNAR bild.
// Spec: fyller de stenar RAÄ/K-samsök inte täcker (norska N-, danska DR-, Gotland G-, Öland Öl- m.fl.).
//
// VETENSKAPLIG KORREKTHET — ingen felkoppling, ingen gissning:
//  - Signum→bild sker EXAKT via Wikidata P1261 ("Scandinavian Runic-text Database ID" = Rundata-signum).
//    Aldrig fritextsök (som kan matcha fel sten). Matchar bara vår signum == P1261 exakt.
//  - Bara fria licenser (PD / CC0 / CC-BY / CC-BY-SA) ur Commons imageinfo/extmetadata. NC/ND avvisas.
//    Hittas ingen fri licens → bilden hoppas (skrivs ALDRIG).
//  - copyright_info = licens-URL från Commons; DB-triggern härleder license_code. Attribuering (Artist)
//    + Commons-filsidan sparas som proveniens. source_institution='Wikimedia Commons'.
//  - Idempotent (WHERE NOT EXISTS på media_url).
//
// Användning:
//   node scripts/data/ingest-commons-images.mjs [PREFIX] [--apply] [--deep] [--limit N] [--sleep MS]
//   PREFIX  filtrera våra stenar på signum-prefix (t.ex. N, DR, G, Öl). Utelämna = alla saknade.
//   --deep  hämta ÄVEN alla filer i stenens Commons-kategori (P373) → flera vinklar (t.ex. Rök).
//   default = dry-run + bara P18 (en kurerad huvudbild per sten).
import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const SRC = 'Wikimedia Commons';
const argv = process.argv.slice(2);
// Värdet efter space-form-flaggor (--limit N, --sleep MS) får INTE tolkas som positionellt PREFIX.
const consumed = new Set();
['--limit', '--sleep'].forEach(f => { const i = argv.indexOf(f); if (i >= 0) consumed.add(i + 1); });
const PREFIX = argv.find((a, i) => !a.startsWith('--') && !consumed.has(i));
const APPLY = argv.includes('--apply');
// --signums="Ög 136,DR 209,…": rikta EXAKT mot namngivna stenar (oavsett befintliga bilder) → deep.
const SIGNUMS = ((argv.find(a => a.startsWith('--signums=')) || '').split('=')[1] || '')
  .split(',').map(s => s.trim()).filter(Boolean);
const DEEP = argv.includes('--deep') || SIGNUMS.length > 0;
const LIMIT = Number((argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) ||
              (argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : 0);
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) ||
              (argv.includes('--sleep') ? Number(argv[argv.indexOf('--sleep') + 1]) : 150);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function getJSON(url, accept = 'application/json') {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': accept } });
      if (r.status === 200) return r.json();
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (attempt + 1)); continue; }
      return null;
    } catch { await sleep(1000 * (attempt + 1)); }
  }
  return null;
}

const stripHtml = s => (s || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();

// Klassificera Commons-licens ur extmetadata. Returnerar {keep, raw} — raw = licens-URL/kortnamn
// som DB-triggern normaliserar. NC/ND (icke-kommersiell / inga bearbetningar) avvisas.
function classifyLicense(ext) {
  const url = ext?.LicenseUrl?.value || '';
  const blob = [(ext?.License?.value || ''), (ext?.LicenseShortName?.value || ''), url].join(' ').toLowerCase();
  if (/nc|nd|noncommercial|no-?deriv|noncommercial|by-nc|by-nd/.test(blob)) return { keep: false };
  if (/cc0|publicdomain\/zero/.test(blob)) return { keep: true, raw: url || 'CC0' };
  if (/public domain|publicdomain\/mark|(^|[^a-z])pd([^a-z]|$)/.test(blob)) return { keep: true, raw: url || 'Public domain' };
  if (/by-sa|by\s*sa/.test(blob)) return { keep: true, raw: url || 'CC BY-SA' };
  if (/cc-?by|licenses\/by/.test(blob)) return { keep: true, raw: url || 'CC BY' };
  return { keep: false };
}

// Alla runstenar på Wikidata som har BÅDE P1261 (signum) OCH P18 (bild). En fråga, exakt karta.
async function loadWikidataMap() {
  const q = `SELECT ?sig ?image ?cat WHERE {
    ?item wdt:P1261 ?sig. ?item wdt:P18 ?image. OPTIONAL { ?item wdt:P373 ?cat. }
  }`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`;
  const d = await getJSON(url, 'application/sparql-results+json');
  const map = new Map();
  for (const b of d?.results?.bindings || []) {
    const sig = b.sig.value;
    if (!map.has(sig)) map.set(sig, { image: b.image?.value || null, cat: b.cat?.value || null });
  }
  return map;
}

const fileTitleFromUrl = u => 'File:' + decodeURIComponent(String(u).split('/').pop());

async function categoryFiles(cat) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + cat)}&cmtype=file&cmlimit=100&format=json`;
  const d = await getJSON(url);
  return (d?.query?.categorymembers || []).map(m => m.title);
}

// imageinfo för upp till 50 filtitlar: url, mime, licens/attribuering/datum/beskrivning.
async function imageInfo(titles) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo`
    + `&iiprop=${encodeURIComponent('url|mime|extmetadata')}`
    + `&iiextmetadatafilter=${encodeURIComponent('License|LicenseShortName|LicenseUrl|Artist|DateTimeOriginal|ImageDescription')}`
    + `&titles=${encodeURIComponent(titles.join('|'))}`;
  const d = await getJSON(url);
  const out = {};
  const pages = d?.query?.pages || {};
  for (const k of Object.keys(pages)) {
    const p = pages[k];
    const ii = p.imageinfo?.[0];
    if (ii) out[p.title] = ii;
  }
  return out;
}

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    // Stenval: antingen exakt namngivna (--signums, oavsett befintlig bild) eller alla UTAN bild.
    let stones;
    if (SIGNUMS.length) {
      stones = (await client.query(
        `SELECT r.id, coalesce(r.rundata_signum, r.signum) AS sig FROM runic_inscriptions r
          WHERE coalesce(r.rundata_signum, r.signum) = ANY($1) ORDER BY sig`, [SIGNUMS])).rows;
      console.log(`Namngivna stenar (--signums): ${stones.length} av ${SIGNUMS.length} hittade i DB. Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'} +DEEP.`);
    } else {
      const params = [];
      let where = `NOT EXISTS (SELECT 1 FROM inscription_media m WHERE m.inscription_id=r.id AND m.media_url IS NOT NULL)`;
      if (PREFIX) { params.push(`${PREFIX} %`); where += ` AND coalesce(r.rundata_signum, r.signum) LIKE $1`; }
      stones = (await client.query(
        `SELECT r.id, coalesce(r.rundata_signum, r.signum) AS sig FROM runic_inscriptions r WHERE ${where} ORDER BY sig`, params)).rows;
      if (LIMIT) stones = stones.slice(0, LIMIT);
      console.log(`Saknar bild${PREFIX ? ` (prefix ${PREFIX})` : ''}: ${stones.length} stenar. Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}${DEEP ? ' +DEEP' : ''}.`);
    }

    console.log('Hämtar Wikidata signum→bild-karta (P1261 + P18)…');
    const wd = await loadWikidataMap();
    console.log(`  ${wd.size} runstenar med bild på Wikidata.`);

    const matched = stones.filter(s => wd.has(s.sig));
    console.log(`  Matchar våra saknade: ${matched.length} stenar.`);

    const rows = [];
    const buckets = { kept: 0, rejected: 0, nolicense: 0 };
    let done = 0;
    for (const s of matched) {
      const info = wd.get(s.sig);
      const titles = [fileTitleFromUrl(info.image)];
      if (DEEP && info.cat) {
        const cf = await categoryFiles(info.cat);
        for (const t of cf) if (!titles.includes(t)) titles.push(t);
      }
      // imageinfo i batchar om 50
      const meta = {};
      for (let i = 0; i < titles.length; i += 50) Object.assign(meta, await imageInfo(titles.slice(i, i + 50)));
      for (const t of titles) {
        const ii = meta[t];
        if (!ii || !ii.url) continue;
        if (!/^image\//.test(ii.mime || '')) continue;
        const lic = classifyLicense(ii.extmetadata || {});
        if (!lic.keep) { buckets.rejected++; continue; }
        const ext = ii.extmetadata || {};
        const artist = stripHtml(ext.Artist?.value);
        const yr = (String(ext.DateTimeOriginal?.value || '').match(/\b(1[5-9]\d\d|20\d\d)\b/) || [])[1];
        const cleanUrl = String(ii.url).split('?')[0];              // strippa utm/query — kanonisk fil-URL
        const cleanDescUrl = String(ii.descriptionurl || ii.url).split('?')[0];
        const desc = [stripHtml(ext.ImageDescription?.value) || t.replace(/^File:/, ''),
                      `(${s.sig})`, `[Wikimedia Commons]`, `(Källa: ${cleanDescUrl})`]
                      .filter(Boolean).join(' ').replace(/\s+/g, ' ').slice(0, 600);
        rows.push({
          inscription_id: s.id, media_url: cleanUrl, media_type: 'image', description: desc,
          photographer: artist || null, photo_date: yr ? `${yr}-01-01` : null,
          copyright_info: lic.raw, sig: s.sig,
        });
        buckets.kept++;
      }
      if (++done % 25 === 0) console.log(`  …${done}/${matched.length} stenar, ${rows.length} bilder`);
      await sleep(SLEEP);
    }

    console.log('\n=== RAPPORT ===');
    console.log(`Kandidatbilder: behållna ${buckets.kept}, avvisade licens ${buckets.rejected}.`);
    const stonesHit = new Set(rows.map(r => r.inscription_id));
    console.log(`Nya bilder: ${rows.length} på ${stonesHit.size} stenar.`);

    if (!APPLY) {
      console.log('\nDRY-RUN — inget skrivet. Exempel (upp till 12):');
      rows.slice(0, 12).forEach(r => console.log(`  ${r.sig.padEnd(14)} ${r.copyright_info.padEnd(48)} ${r.media_url}`));
      console.log('\nKör med --apply för att skriva.');
      return;
    }

    let inserted = 0;
    for (const r of rows) {
      const res = await client.query(
        `INSERT INTO inscription_media (inscription_id, media_url, media_type, description, photographer, photo_date, copyright_info, source_institution)
         SELECT $1,$2,$3,$4,$5,$6::date,$7,$8 WHERE NOT EXISTS (SELECT 1 FROM inscription_media WHERE media_url=$2)`,
        [r.inscription_id, r.media_url, r.media_type, r.description, r.photographer, r.photo_date, r.copyright_info, SRC]);
      inserted += res.rowCount;
    }
    console.log(`\n✅ APPLY klar: ${inserted} bilder insatta (license_code satt av trigger, idempotent).`);
  } finally {
    await client.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });

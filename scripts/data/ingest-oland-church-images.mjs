// Ölandskyrkornas bilder → public.landmark_images (HOTLÄNK, aldrig rehost). Löser att sök på en
// öländsk socken (Resmo) visade Kalmar-bilder (landmarks_for_place 25 km-radie, Resmo saknade egen).
//
// KÄLLKRITIK / INGEN GISSNING:
//  - Kyrkolistan hämtas AUKTORITATIVT ur Wikidata (P31/P279* kyrkobyggnad) med verifierad P625-koordinat
//    och P373 Commons-kategori. Inga påhittade kategorinamn.
//  - Öland-filter geometriskt (lng>16.38 && !(lat>56.9 && lng<16.7)) → utesluter Kalmar stad + fastlandets
//    Kalmarkust (Mönsterås/Oskarshamn/Ålem/Döderhult …) som bbox annars fångar.
//  - Bara fria licenser (PD/CC0/CC-BY/CC-BY-SA); NC/ND/okänt avvisas. "Gärna så tidigt som möjligt"
//    (Daniel) → sortera PD/CC0 först, sedan DateTimeOriginal STIGANDE (äldsta bilden överst).
//  - place_context = socken/ortnamnet (strippat "kyrka/kapell") så landmarks_for_place pc-matchar en
//    sockensökning (t.ex. "Resmo") och rankar kyrkan FÖRE Kalmar (proximity).
//
// Användning:  node scripts/data/ingest-oland-church-images.mjs [--apply] [--per N] [--sleep MS]
//   default = dry-run. --per default 5.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const SRC = 'Wikimedia Commons';
const WDQS = 'https://query.wikidata.org/sparql';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const PER = Number((argv.find(a => a.startsWith('--per=')) || '').split('=')[1]) ||
            (argv.includes('--per') ? Number(argv[argv.indexOf('--per') + 1]) : 5);
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) || 150;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function getJSON(url, accept = 'application/json') {
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: accept } });
      if (r.status === 200) return accept.includes('json') ? r.json() : r.text();
      if (r.status === 429 || r.status >= 500) { await sleep(1400 * (a + 1)); continue; }
      return null;
    } catch { await sleep(900 * (a + 1)); }
  }
  return null;
}
const stripHtml = s => (s || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();

// Commons-licens → {code, url, rank} eller null (avvisa). rank: PD/CC0=0, CC-BY=1, CC-BY-SA=2.
function normLicense(ext) {
  const url = ext?.LicenseUrl?.value || '';
  const blob = [(ext?.LicenseShortName?.value || ''), url].join(' ').toLowerCase();
  if (/nc|nd|noncommercial|no-?deriv|by-nc|by-nd/.test(blob)) return null;
  if (/cc0|publicdomain\/zero/.test(blob)) return { code: 'CC0', url: url || 'https://creativecommons.org/publicdomain/zero/1.0/', rank: 0 };
  if (/public domain|publicdomain\/mark|(^|[^a-z])pd([^a-z]|$)/.test(blob)) return { code: 'PD', url: url || 'https://creativecommons.org/publicdomain/mark/1.0/', rank: 0 };
  if (/by-sa|by\s*sa/.test(blob)) return { code: 'CC-BY-SA', url: url || 'https://creativecommons.org/licenses/by-sa/4.0/', rank: 2 };
  if (/cc-?by|licenses\/by/.test(blob)) return { code: 'CC-BY', url: url || 'https://creativecommons.org/licenses/by/4.0/', rank: 1 };
  return null;
}
// Årtal ur DateTimeOriginal (Commons) → number|null (för "äldsta först").
function yearOf(ext) {
  const s = stripHtml(ext?.DateTimeOriginal?.value || '');
  const m = s.match(/(1[6-9]\d\d|20[0-2]\d)/);
  return m ? Number(m[1]) : null;
}

async function olandChurches() {
  // WDQS geo-index (box) hämtar geo-taggade objekt i Öland-bboxen FÖRST (snabbt) → filtrera till
  // kyrkobyggnader med Commons-kategori. Global P279*-path utan geo-gate 504:ar (för dyr). JSON = entydigt.
  const q = `SELECT ?item ?itemLabel ?commons ?lat ?lng WHERE {
    SERVICE wikibase:box {
      ?item wdt:P625 ?coord .
      bd:serviceParam wikibase:cornerWest "Point(16.36 56.18)"^^geo:wktLiteral .
      bd:serviceParam wikibase:cornerEast "Point(17.13 57.40)"^^geo:wktLiteral .
    }
    ?item wdt:P31/wdt:P279* wd:Q16970 .
    ?item wdt:P373 ?commons .
    BIND(geof:latitude(?coord) AS ?lat) BIND(geof:longitude(?coord) AS ?lng)
    SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
  }`;
  const d = await getJSON(`${WDQS}?query=${encodeURIComponent(q)}&format=json`, 'application/sparql-results+json');
  const bindings = d?.results?.bindings || [];
  const seen = new Set();
  const out = [];
  for (const b of bindings) {
    const item = b.item?.value; if (!item || seen.has(item)) continue;
    const label = (b.itemLabel?.value || '').trim();
    const commons = (b.commons?.value || '').trim();
    const lat = Number(b.lat?.value), lng = Number(b.lng?.value);
    if (!commons || Number.isNaN(lat) || Number.isNaN(lng)) continue;
    // Öland-filter: bort med Kalmar stad (lng<16.38) + fastlandskusten (lat>56.9 && lng<16.7).
    if (!(lng > 16.38) || (lat > 56.9 && lng < 16.7)) continue;
    seen.add(item);
    // place_context = socken/ort (strippa kyrka/kapell). ", <ort>"-suffix → orten (Sankt Olofs kapell, Böda).
    let pc = label.replace(/,\s*Öland$/i, '').trim();
    const comma = pc.match(/,\s*(.+)$/);
    if (comma) pc = comma[1].trim();
    else pc = pc.replace(/\s+(gamla|nya)\s+kyrka.*$/i, '')
               .replace(/\s+(ödekyrka|stadskyrka|kyrkan|kyrka|kapell|kloster).*$/i, '').trim();
    out.push({ label, commons, lat, lng, place_context: pc, key: 'oland-' + commons.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
  }
  return out;
}

async function categoryFiles(cat) {
  const url = `${COMMONS}?action=query&format=json&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + cat)}&cmtype=file&cmlimit=200`;
  const d = await getJSON(url);
  // Endast jpg/png — .tif/.tiff renderas INTE i frontendens <img> (jfr get_inscription_page-fixen).
  return (d?.query?.categorymembers || []).map(m => m.title).filter(t => /\.(jpe?g|png)$/i.test(t));
}
async function imageInfo(titles) {
  const url = `${COMMONS}?action=query&format=json&prop=imageinfo`
    + `&iiprop=${encodeURIComponent('url|mime|extmetadata')}`
    + `&iiextmetadatafilter=${encodeURIComponent('LicenseShortName|LicenseUrl|Artist|ImageDescription|DateTimeOriginal')}`
    + `&titles=${encodeURIComponent(titles.join('|'))}`;
  const d = await getJSON(url);
  const out = {};
  const pages = d?.query?.pages || {};
  for (const k of Object.keys(pages)) { const ii = pages[k].imageinfo?.[0]; if (ii) out[pages[k].title] = ii; }
  return out;
}

async function main() {
  const churches = await olandChurches();
  console.log(`Wikidata → ${churches.length} Ölandskyrkor med Commons-kategori (efter Öland-filter).`);
  if (!churches.length) { console.log('Inget att göra.'); return; }

  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    const all = [];
    for (const ch of churches) {
      const titles = await categoryFiles(ch.commons);
      const meta = {};
      for (let i = 0; i < titles.length; i += 50) Object.assign(meta, await imageInfo(titles.slice(i, i + 50)));
      const cands = [];
      for (const t of titles) {
        const ii = meta[t];
        if (!ii || !ii.url || !/^image\//.test(ii.mime || '')) continue;
        const ext = ii.extmetadata || {};
        const lic = normLicense(ext);
        if (!lic) continue;
        cands.push({
          landmark_key: ch.key, landmark_name: ch.label, category: 'church',
          place_context: ch.place_context, wikidata_id: null, commons_category: ch.commons,
          lat: ch.lat, lng: ch.lng,
          image_url: String(ii.url).split('?')[0],
          descr_url: String(ii.descriptionurl || ii.url).split('?')[0],
          title: t.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
          caption: stripHtml(ext.ImageDescription?.value) || null,
          photographer: stripHtml(ext.Artist?.value) || null,
          license_code: lic.code, license_url: lic.url, _rank: lic.rank, _year: yearOf(ext) ?? 9999,
        });
      }
      // "Gärna så tidigt som möjligt": PD/CC0 först, sedan äldsta årtal, sedan url (stabilt).
      cands.sort((a, b) => a._rank - b._rank || a._year - b._year || a.image_url.localeCompare(b.image_url));
      const pick = cands.slice(0, PER);
      console.log(`\n${ch.label}  [context=${ch.place_context}]  ${titles.length} filer → ${cands.length} fria → tar ${pick.length}`);
      pick.forEach(p => console.log(`   [${p.license_code}${p._year < 9999 ? ' ' + p._year : ''}] ${p.image_url}`));
      all.push(...pick);
      await sleep(SLEEP);
    }

    console.log(`\n=== TOTALT: ${all.length} kyrkobilder över ${churches.length} kyrkor ===`);
    if (!APPLY) { console.log('DRY-RUN — inget skrivet. Kör med --apply.'); return; }

    let ins = 0;
    for (const r of all) {
      const res = await client.query(
        `INSERT INTO public.landmark_images
           (landmark_key, landmark_name, category, place_context, wikidata_id, commons_category,
            lat, lng, image_url, descr_url, title, caption, photographer, license_code, license_url, source_institution)
         SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
         WHERE NOT EXISTS (SELECT 1 FROM public.landmark_images WHERE image_url = $9)`,
        [r.landmark_key, r.landmark_name, r.category, r.place_context, r.wikidata_id, r.commons_category,
         r.lat, r.lng, r.image_url, r.descr_url, r.title, r.caption, r.photographer, r.license_code, r.license_url, SRC]);
      ins += res.rowCount;
    }
    console.log(`✅ APPLY klar: ${ins} bilder insatta (idempotent på image_url).`);
  } finally {
    await client.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });

// Landmärkes-bild-ingest → public.landmark_images (HOTLÄNK, aldrig rehost). Wikimedia Commons,
// ankrat på verifierad Commons-kategori per landmärke (ingen fritextgissning). Endast fria licenser
// (PD/CC0/CC-BY/CC-BY-SA); NC/ND/FAL/okänt avvisas. Cap N bilder per landmärke (bäst PD→CC0→BY→BY-SA).
//
// Pilot-config = de tre Kalmar-landmärkena, med Commons-kategori + Wikidata-Q + P625-koordinat
// (verifierade via _tmp_landmark_discover / _tmp_commons_cat). Stadsmuren saknar Wikidata → lat/lng null.
//
// Användning:  node scripts/data/ingest-landmark-images.mjs [--apply] [--per N] [--sleep MS]
//   default = dry-run (skriver inget). --per default 8.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const SRC = 'Wikimedia Commons';
const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const PER = Number((argv.find(a => a.startsWith('--per=')) || '').split('=')[1]) ||
            (argv.includes('--per') ? Number(argv[argv.indexOf('--per') + 1]) : 8);
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) || 150;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

// VERIFIERADE ankare (se discovery). place_context = ytningsnyckel i entity_answer_context.
const LANDMARKS = [
  // Kalmar stad
  { key: 'kalmar-slott',    name: 'Kalmar slott',    category: 'castle',    commons_category: 'Kalmar slott',                 wikidata_id: 'Q648226',  lat: 56.65806, lng: 16.35528, place_context: 'Kalmar' },
  { key: 'kalmar-domkyrka', name: 'Kalmar domkyrka', category: 'cathedral', commons_category: 'Kalmar domkyrka',              wikidata_id: 'Q1236665', lat: 56.66444, lng: 16.36528, place_context: 'Kalmar' },
  { key: 'kalmar-stadsmur', name: 'Kalmar medeltida stadsmur', category: 'city_wall', commons_category: 'Medeltida stadsmuren, Kalmar', wikidata_id: null, lat: null, lng: null, place_context: 'Kalmar' },
  // Öland (Kalmar län) — slott + fornborgar. place_context='Öland' → ytar för Öland-sök; egna namn via närhet.
  { key: 'borgholms-slott', name: 'Borgholms slott',  category: 'castle',    commons_category: 'Borgholms slott',              wikidata_id: 'Q1589230', lat: 56.8706, lng: 16.6433, place_context: 'Öland' },
  { key: 'ismantorps-borg', name: 'Ismantorps fornborg', category: 'ring_fort', commons_category: 'Ismantorps fornborg',      wikidata_id: 'Q358092',  lat: 56.7454, lng: 16.6427, place_context: 'Öland' },
  { key: 'eketorps-borg',   name: 'Eketorps fornborg', category: 'ring_fort', commons_category: 'Eketorps fornborg',          wikidata_id: 'Q1011625', lat: 56.2956, lng: 16.4861, place_context: 'Öland' },
  { key: 'sandby-borg',     name: 'Sandby borg',     category: 'ring_fort', commons_category: 'Sandby borg',                  wikidata_id: 'Q10661138', lat: 56.5525, lng: 16.6393, place_context: 'Öland' },
];

async function getJSON(url) {
  for (let a = 0; a < 4; a++) {
    try { const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
      if (r.status === 200) return r.json();
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
  return null; // FAL, okänt, allt annat → avvisa (konservativt)
}

async function categoryFiles(cat) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + cat)}&cmtype=file&cmlimit=200`;
  const d = await getJSON(url);
  return (d?.query?.categorymembers || []).map(m => m.title).filter(t => /\.(jpe?g|png|tiff?)$/i.test(t));
}
async function imageInfo(titles) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo`
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
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    const all = [];
    for (const lm of LANDMARKS) {
      const titles = await categoryFiles(lm.commons_category);
      const meta = {};
      for (let i = 0; i < titles.length; i += 50) Object.assign(meta, await imageInfo(titles.slice(i, i + 50)));
      const cands = [];
      for (const t of titles) {
        const ii = meta[t];
        if (!ii || !ii.url || !/^image\//.test(ii.mime || '')) continue;
        const ext = ii.extmetadata || {};
        const lic = normLicense(ext);
        if (!lic) continue;
        const cleanUrl = String(ii.url).split('?')[0];
        const descUrl = String(ii.descriptionurl || ii.url).split('?')[0];
        cands.push({
          landmark_key: lm.key, landmark_name: lm.name, category: lm.category,
          place_context: lm.place_context, wikidata_id: lm.wikidata_id,
          commons_category: lm.commons_category, lat: lm.lat, lng: lm.lng,
          image_url: cleanUrl, descr_url: descUrl,
          title: t.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
          caption: stripHtml(ext.ImageDescription?.value) || null,
          photographer: stripHtml(ext.Artist?.value) || null,
          license_code: lic.code, license_url: lic.url, _rank: lic.rank,
        });
      }
      // Bäst licens först (PD/CC0→BY→BY-SA), cap PER.
      cands.sort((a, b) => a._rank - b._rank);
      const pick = cands.slice(0, PER);
      console.log(`\n${lm.name} [${lm.commons_category}]: ${titles.length} filer → ${cands.length} fria → tar ${pick.length}`);
      pick.forEach(p => console.log(`   [${p.license_code}] ${p.image_url}`));
      all.push(...pick);
      await sleep(SLEEP);
    }

    console.log(`\n=== TOTALT: ${all.length} landmärkesbilder ===`);
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

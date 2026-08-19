// Tre kända gudaframställningar (SHM, Statens historiska museum) → public.historical_depictions,
// samt Eddan (två verk) → public.historical_sources. KÄLLKRITIK:
//  - FAKTA beskrivs i egna ord (ingen klistrad prosa).
//  - Bild HOTLÄNKAS från Wikimedia Commons, rehostas ALDRIG, och lagras bara om licensen är fri
//    (PD/CC0/CC BY/CC BY-SA). Licensen verifieras i skriptet vid körning via Commons imageinfo;
//    är den inte fri hoppas bilden över (och posten faller bort, ty image_url är NOT NULL).
//  - Vilken gud figuren föreställer är en TOLKNING enligt källorna (omstridd) — märks i note, ej fakta.
//  - Koordinater: fyndplatskoordinater är inte verifierade ur källa → lat/lng = NULL (aldrig gissade).
//
// OBS om SHM-UUID: de tre objekt-UUID:n som ursprungligen angavs (56f6af2b…, 81c0926d…, 7e4a9896…)
// resolvade INTE på samlingar.shm.se (404 för både /object/ och /media/). source_url sätts därför till
// de VERIFIERADE objektsidorna (HTTP 200) som hittats via SHM:s samlingssök / kulturarvsdata-persistent-URI.
//
// subject_type: enum tillåter church|cult_site|mound|king|monument|manuscript|other — 'object' finns EJ,
// så 'other' används (gudaframställningar som lösföremål/gravfynd).
// Kör:  node scripts/data/ingest-god-depictions-shm.mjs [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const UA = { 'User-Agent': 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)' };
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/)
  .filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));

const commonsPage = (title) => 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(title.replace(/ /g, '_'));

// Hämtar url + thumb + licens deterministiskt för en känd (verifierad) Commons-fil.
async function commonsInfo(fileTitle) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  u.search = new URLSearchParams({
    action: 'query', format: 'json', titles: 'File:' + fileTitle,
    prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '900',
    iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist'
  }).toString();
  const j = await (await fetch(u, { headers: UA })).json();
  const p = Object.values(j?.query?.pages || {})[0];
  const ii = p?.imageinfo?.[0];
  if (!ii?.url) return null;
  return {
    url: ii.url.split('?')[0],
    thumb: (ii.thumburl || '').split('?')[0] || null,
    licShort: ii.extmetadata?.LicenseShortName?.value || '',
    licUrl: ii.extmetadata?.LicenseUrl?.value || '',
    artist: (ii.extmetadata?.Artist?.value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
  };
}
// Fri licens? → normaliserad kod eller null (icke-fri/NC/ND blockeras).
function freeLicense(licShort, licUrl) {
  const blob = `${licShort} ${licUrl}`.toLowerCase();
  if (/nc|nd|noncommercial|no-?deriv/.test(blob)) return null;
  if (/public domain|publicdomain|pd-art|cc0|(^|[^a-z])pd([^a-z]|$)/.test(blob)) return licShort || 'PD';
  if (/cc[ -]?by[ -]?sa|by-sa/.test(blob)) return licShort || 'CC BY-SA';
  if (/cc[ -]?by|licenses\/by/.test(blob)) return licShort || 'CC BY';
  return null;
}

// De tre objekten. commonsFile = verifierad fil (identitet bekräftad via Commons-beskrivning + SHM-inv.nr).
// note = källkritisk faktatext i egna ord, med TOLKNINGEN tydligt märkt som osäker.
const OBJECTS = [
  {
    title: 'Askahänget — silverhänge tolkat som Freja (Aska, Östergötland)',
    place_name: 'Aska, Hagebyhöga socken', province: 'Östergötland',
    work_ref: 'SHM inv. 16429', year: 'vikingatid (900–1000-tal)',
    commonsFile: 'Pendant (6880384805).jpg',
    source_url: 'https://samlingar.shm.se/object/7C44B389-9DB8-4133-9AD5-886F22062FA5',
    note: 'Rundformat silverhänge från vikingatiden format som en kvinnogestalt delvis innesluten av en '
      + 'ring. Kvinnan framställs havande, stående med särade ben och händerna knäppta under buken, med '
      + 'halsklädnad och pärlrader över bröstet. Gravfynd från Aska, Hagebyhöga socken, Östergötland '
      + '(SHM inv. 16429). TOLKNING (osäker): hänget tolkas ofta som gudinnan Freja, som enligt de '
      + 'fornnordiska källorna åkallades vid havandeskap och födsel — men identifieringen är en tolkning, '
      + 'inte fastställd. Bild: foto Statens historiska museum via Wikimedia Commons — hotlänkad, ej rehostad.',
  },
  {
    title: 'Oden från Lindby — bronsstatyett, tolkning omstridd (Lindby, Skåne)',
    place_name: 'Lindby, Svenstorp socken', province: 'Skåne',
    work_ref: 'SHM inv. 13701', year: 'vikingatid',
    commonsFile: 'Figurine (6880525893).jpg',
    source_url: 'https://samlingar.shm.se/object/79B27EF4-8E13-47F9-A6BD-F85BC6BB743C',
    note: 'Bronsstatyett av en mansfigur med toppig huvudbonad; ena ögat framstår som mindre/avvikande. '
      + 'Lösfynd från Lindby, Svenstorp socken, Skåne (SHM inv. 13701). TOLKNING (omstridd): brukar kallas '
      + '"Oden från Lindby" och tolkas som guden Oden med hänvisning till det avvikande ögat (Oden offrade '
      + 'ett öga för visdom). Tolkningen är dock omdiskuterad — det "saknade" ögat kan vara en oavsiktlig '
      + 'gjutskada snarare än avsiktlig ikonografi. Identifieringen är alltså en hypotes, inte fastställd. '
      + 'Bild: foto Statens historiska museum via Wikimedia Commons — hotlänkad, ej rehostad.',
  },
  {
    title: 'Frej-statyetten från Rällinge — tolkas som Frej (Rällinge, Södermanland)',
    place_name: 'Rällinge, Lunda socken', province: 'Södermanland',
    work_ref: 'SHM inv. 14232', year: 'vikingatid (ca 800–1100)',
    commonsFile: 'Frejstatyett från Rällinge SHM 14232-1.jpg',
    source_url: 'https://samlingar.shm.se/object/907CB8FF-621C-47B3-9F20-9A3AF1AE72C6',
    note: 'Liten statyett i kopparlegering av en sittande naken mansgestalt med rest fallos; figuren '
      + 'griper i sitt spetsiga pipskägg och bär en toppig mössa. Funnen 1904 vid Rällinge gård, Lunda '
      + 'socken, Södermanland (SHM inv. 14232). TOLKNING (osäker): tolkas vanligen som vanaguden Frej, en '
      + 'fruktbarhetsgud, med jämförelse till Adam av Bremens beskrivning (ca 1070) av en falliskt '
      + 'framställd gudastod ("Fricco") i templet i (Gamla) Uppsala. Kopplingen till Frej och till '
      + 'Uppsalatemplet vilar på ikonografisk analogi och är en tolkning, inte ett fastställt faktum. '
      + 'Bild: foto Gabriel Hildebrand / Statens historiska museum via Wikimedia Commons — hotlänkad, ej rehostad.',
  },
];

// Eddan — två grundverk (medeltida grundtext = PD). Fakta i egna ord; ingen klistrad prosa.
const EDDA = [
  {
    title: 'Snorres Edda (Prosaiska Eddan)',
    title_en: 'The Prose Edda (Snorri Sturluson)',
    author: 'Snorri Sturluson',
    written_year: 1220,
    covers_start: 1220, covers_end: 1241,
    work_type: 'handbok i skaldekonst och nordisk mytologi (prosa)',
    reliability: 'secondary',
    language: 'Fornvästnordiska (fornisländska)',
    manuscript: 'Codex Upsaliensis (DG 11, Uppsala universitetsbibliotek); Codex Regius (GKS 2367 4to); '
      + 'Codex Wormianus (AM 242 fol.); Codex Trajectinus',
    description: 'Isländsk handbok i skaldekonst med en systematiserad framställning av den fornnordiska '
      + 'mytologin (Gylfaginning, Skáldskaparmál), sammanställd av Snorri Sturluson omkring 1220. KÄLLKRITIK: '
      + 'nedtecknad ca 200 år efter kristnandet av en kristen författare i lärt syfte; myterna är där '
      + 'ordnade och tolkade av Snorri och återger inte okritiskt förkristen tro. Central men indirekt källa '
      + 'till gudavärlden. Grundtexten är public domain (medeltida).',
  },
  {
    title: 'Poetiska Eddan (Codex Regius)',
    title_en: 'The Poetic Edda (Codex Regius)',
    author: 'Anonym (anonyma eddadikter)',
    written_year: 1270,
    covers_start: 1200, covers_end: 1300,
    work_type: 'diktsamling (eddadikter), handskrift',
    reliability: 'primary',
    language: 'Fornvästnordiska (fornisländska)',
    manuscript: 'Codex Regius (GKS 2365 4to), nedtecknad ca 1270; nu Stofnun Árna Magnússonar, Reykjavík',
    description: 'Samling anonyma fornnordiska gudadikter och hjältedikter (bl.a. Völuspá, Hávamál, '
      + 'Grímnismál, Vafþrúðnismál) bevarad i handskriften Codex Regius (GKS 2365 4to), nedtecknad omkring '
      + '1270. KÄLLKRITIK: dikterna bygger på äldre muntlig tradition men deras ålder och tillkomst är '
      + 'omstridda; endast handskriften kan dateras säkert. Den viktigaste primära diktkällan till '
      + 'förkristen nordisk myt och hjältesaga. Grundtexten är public domain (medeltida).',
  },
];

async function main() {
  // 1) verifiera Commons-bild + licens för varje objekt (deterministiskt vid körning)
  const rows = [];
  for (const o of OBJECTS) {
    const ii = await commonsInfo(o.commonsFile);
    if (!ii) { console.log(`  ${o.title} — ingen imageinfo (${o.commonsFile}) → HOPPAS ÖVER (image_url NOT NULL)`); continue; }
    const lic = freeLicense(ii.licShort, ii.licUrl);
    if (!lic) { console.log(`  ${o.title} — EJ verifierat fri licens (${ii.licShort}) → HOPPAS ÖVER`); continue; }
    rows.push({ ...o, image_url: ii.url, thumb_url: ii.thumb, license_code: lic, descr_url: commonsPage(o.commonsFile) });
    console.log(`  [${lic}] ${o.title}\n      bild: ${ii.url}\n      SHM: ${o.source_url}`);
  }
  console.log(`\n=== ${rows.length}/3 objekt med verifierad fri bild ===`);
  console.log(`=== ${EDDA.length} Edda-källor att säkerställa i historical_sources ===`);
  if (!APPLY) { console.log('\nDRY-RUN — kör med --apply för att skriva.'); return; }

  const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 120000 });
  await c.connect();
  let depIns = 0, srcIns = 0;
  try {
    await c.query('BEGIN');
    // 2) historical_depictions (idempotent på source_url ELLER title)
    for (const r of rows) {
      const res = await c.query(
        `insert into public.historical_depictions
           (subject_type,title,place_name,province,image_url,thumb_url,work_ref,year,license_code,source_institution,source_url,note,lat,lng)
         select 'other',$1,$2,$3,$4,$5,$6,$7,$8,'Statens historiska museum (SHM)',$9,$10,null,null
         where not exists (
           select 1 from public.historical_depictions where source_url=$9 or title=$1 or image_url=$4)`,
        [r.title, r.place_name, r.province, r.image_url, r.thumb_url, r.work_ref, r.year, r.license_code, r.source_url, r.note]);
      depIns += res.rowCount;
      console.log(`  depiction ${res.rowCount ? 'INSERT' : 'fanns'}: ${r.title}`);
    }
    // 3) historical_sources — Eddan (idempotent på title)
    for (const e of EDDA) {
      const exists = (await c.query(`select 1 from historical_sources where title=$1 limit 1`, [e.title])).rows[0];
      if (exists) { console.log(`  källa fanns: ${e.title}`); continue; }
      await c.query(
        `insert into historical_sources
           (title,title_en,author,written_year,covers_period_start,covers_period_end,work_type,kind,rights,reliability,language,manuscript,peer_reviewed,description)
         values ($1,$2,$3,$4,$5,$6,$7,'publication','public_domain',$8,$9,$10,false,$11)`,
        [e.title, e.title_en, e.author, e.written_year, e.covers_start, e.covers_end, e.work_type, e.reliability, e.language, e.manuscript, e.description]);
      srcIns++;
      console.log(`  källa INSERT: ${e.title}`);
    }
    await c.query('COMMIT');
    console.log(`\n✅ APPLY (committed): ${depIns} avbildningar, ${srcIns} Edda-källor insatta.`);
  } catch (e) {
    await c.query('ROLLBACK');
    console.error('FAILED (rolled back):', e.message);
    process.exitCode = 1;
  } finally { await c.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });

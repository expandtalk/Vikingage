// Backfill av LICENS på inscription_media-rader där license_code='unknown'.
// Hämtar den FAKTISKA licensen från källan (RAÄ K-samsök / SHM) — aldrig gissning.
//
// VETENSKAPLIG KORREKTHET:
//  - Endast MEDIA-licensen (pres:mediaLicenseUrl / mediaLicenseUrl) används — det är bildens licens.
//    itemLicense (metadatans licens, ofta CC0) IGNORERAS medvetet — annars felmärks bilder.
//  - Hittas ingen media-licens i källan → raden lämnas 'unknown' (skrivs INTE).
//  - Skriver copyright_info = käll-URL; DB-triggern härleder license_code deterministiskt.
//  - Egna foton (/excursion-photos/…) har ingen extern källa → hoppas över (måste sättas manuellt).
//
// Användning: node scripts/data/backfill-image-licenses.mjs [--apply] [--limit N] [--sleep MS]
import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const LIMIT = Number((argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) ||
              (argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : 0);
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) ||
              (argv.includes('--sleep') ? Number(argv[argv.indexOf('--sleep') + 1]) : 200);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const RAA_UUID = /pub\.raa\.se\/dokumentation\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
const SHM_MEDIA = /kulturarvsdata\.se\/shm\/media\/[^/]+/i;

// Plocka ENDAST media-licensen (element-text ELLER rdf:resource), aldrig itemLicense.
function extractMediaLicense(xml) {
  // <...mediaLicenseUrl>URL</...>
  let m = /mediaLicenseUrl[^>]*>\s*([^<\s][^<]*?)\s*<\/[^>]*mediaLicenseUrl>/i.exec(xml);
  if (m && /^https?:\/\//i.test(m[1])) return m[1].trim();
  // <...mediaLicenseUrl rdf:resource="URL"/>
  m = /mediaLicenseUrl[^>]*rdf:resource="([^"]+)"/i.exec(xml);
  if (m) return m[1].trim();
  return null;
}

async function fetchSource(mediaUrl) {
  let url = null, accept = 'application/xml';
  const raa = RAA_UUID.exec(mediaUrl);
  if (raa) { url = `https://kulturarvsdata.se/raa/dokumentation/xml/${raa[1]}`; }
  else if (SHM_MEDIA.test(mediaUrl)) { url = mediaUrl.replace(/^http:/, 'https:'); accept = 'application/rdf+xml'; }
  else return { skip: true };

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': accept } });
      if (r.status === 200) return { license: extractMediaLicense(await r.text()) };
      if (r.status === 404) return { license: null };
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (attempt + 1)); continue; }
      return { license: null };
    } catch { await sleep(1000 * (attempt + 1)); }
  }
  return { license: null };
}

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    let rows = (await client.query(
      `SELECT id, media_url FROM inscription_media WHERE license_code='unknown' ORDER BY id`)).rows;
    if (LIMIT) rows = rows.slice(0, LIMIT);
    console.log(`Okända rader: ${rows.length}${LIMIT ? ` (begränsat ${LIMIT})` : ''}. Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}.`);

    let resolved = 0, skipped = 0, notFound = 0, updated = 0, done = 0;
    const hist = {};
    for (const row of rows) {
      const res = await fetchSource(row.media_url);
      if (res.skip) { skipped++; done++; continue; }
      if (!res.license) { notFound++; done++; await sleep(SLEEP); continue; }
      resolved++;
      hist[res.license] = (hist[res.license] || 0) + 1;
      if (APPLY) {
        // Triggern sätter license_code ur copyright_info. Rör bara rader som fortfarande är unknown.
        const up = await client.query(
          `UPDATE inscription_media SET copyright_info=$2 WHERE id=$1 AND license_code='unknown'`,
          [row.id, res.license]);
        updated += up.rowCount;
      }
      if (++done % 25 === 0) console.log(`  …${done}/${rows.length} — löst:${resolved} ej funna:${notFound} egna/hoppade:${skipped}`);
      await sleep(SLEEP);
    }

    console.log('\n=== RAPPORT ===');
    console.log(`Bearbetade: ${done}. Licens hittad: ${resolved}, ej i källa: ${notFound}, egna/ej hämtbara: ${skipped}.`);
    console.log('Lösta licens-URL:er:', JSON.stringify(hist, null, 0));
    if (APPLY) console.log(`✅ APPLY klar: ${updated} rader fick licens (license_code satt av trigger).`);
    else console.log('\nDRY-RUN — inget skrivet. Kör med --apply.');
  } finally {
    await client.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });

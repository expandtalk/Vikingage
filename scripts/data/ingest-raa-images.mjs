// RAÄ bildcorpus-ingest — K-samsök → inscription_media
// Spec: docs/superpowers/specs/2026-07-25-raa-bildcorpus-ingest-design.md
//
// Licens-filtrerad ingest av PD/CC0/CC-BY-runstensbilder från K-samsök (RAÄ), kopplat
// till runinskriftens signum. Bara det vi bevisligen får använda (se raa/licenseFilter.mjs).
//
// Användning:
//   node scripts/data/ingest-raa-images.mjs <PREFIX> [--apply] [--limit N] [--sleep MS]
//   PREFIX = signum-landskap, t.ex. U, Ög, Vg, G, Sm  (default: dry-run, skriver inget)
//   --apply     skriv till prod (idempotent, WHERE NOT EXISTS på media_url)
//   --limit N   bearbeta bara N stenar (för test)
//   --sleep MS  paus mellan API-anrop (default 250)
//
// Metod (verifierad 2026-07-25 mot API:t):
//   1. Läs alla runinskrifter med signum-prefix ur DB.
//   2. Per sten: query K-samsök `text="<kompakt signum>" AND thumbnailExists=j`.
//   3. Behåll dokumentation-poster vars itemLabel börjar med exakt kompakt-signum.
//   4. Parsa ksam:presentation (XML): typ, fotograf, datum, bild-URL, PER-BILD-licens.
//   5. Licensfiltrera (raa/licenseFilter.mjs) — default restriktivt, BY-SA/NC/ND/okänt hoppas.
//   6. Upserta till inscription_media, idempotent.

import pg from 'pg';
import { readFileSync } from 'node:fs';
import { classifyLicense } from './raa/licenseFilter.mjs';

const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const SRC = 'Riksantikvarieämbetet (K-samsök)';

// ---- args ----
const argv = process.argv.slice(2);
const PREFIX = argv.find(a => !a.startsWith('--'));
const APPLY = argv.includes('--apply');
const LIMIT = Number((argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) ||
              (argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : 0);
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) ||
              (argv.includes('--sleep') ? Number(argv[argv.indexOf('--sleep') + 1]) : 250);
if (!PREFIX) { console.error('Ange signum-prefix, t.ex.: node scripts/data/ingest-raa-images.mjs U --apply'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

// ---- K-samsök ----
async function ksamsok(cql, hits = 50) {
  const url = `https://kulturarvsdata.se/ksamsok/api?method=search&version=1.1&hitsPerPage=${hits}&query=${encodeURIComponent(cql)}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
      if (r.status === 200) return r.json();
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (attempt + 1)); continue; }
      return null;
    } catch { await sleep(1000 * (attempt + 1)); }
  }
  return null;
}

const rx = (s, re) => { const m = re.exec(s); return m ? m[1].trim() : null; };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const compact = sig => sig.replace(/\s+/g, '');
const labelMatches = (label, comp) => new RegExp('^' + esc(comp) + '(\\D|$)', 'i').test((label || '').trim());

function mediaTypeOf(presType) {
  const t = (presType || '').toLowerCase();
  if (t.includes('foto')) return 'photo';
  if (t.includes('teckning')) return 'teckning';
  if (t.includes('etsning')) return 'etsning';
  return 'image';
}

// Parsa ett ksam:presentation-XML-block → { type, photographer, date, description, place, images[] }
function parsePresentation(xml) {
  const type = rx(xml, /<pres:type>([^<]*)<\/pres:type>/);
  const itemLabel = rx(xml, /<pres:itemLabel>([^<]*)<\/pres:itemLabel>/);
  let desc = rx(xml, /<pres:description>([\s\S]*?)<\/pres:description>/) || '';
  desc = desc.replace(/\s+/g, ' ').replace(/Fotosyfte:\s*$/, '').trim();
  const place = rx(xml, /<pres:placeLabel>([^<]*)<\/pres:placeLabel>/);
  const timeLabel = rx(xml, /<pres:timeLabel>([^<]*)<\/pres:timeLabel>/);
  const contextName = rx(xml, /<pres:nameLabel>([^<]*)<\/pres:nameLabel>/);
  const year = timeLabel && /(\d{4})-\d{2}-\d{2}/.exec(timeLabel);
  const date = year ? `${year[1]}-01-01` : null;

  const images = [];
  const imgRe = /<pres:image>([\s\S]*?)<\/pres:image>/g;
  let m;
  while ((m = imgRe.exec(xml))) {
    const block = m[1];
    const highres = rx(block, /<pres:src type="highres">([^<]*)<\/pres:src>/) ||
                    rx(block, /<pres:src[^>]*>([^<]*)<\/pres:src>/);
    const byline = rx(block, /<pres:byline>([^<]*)<\/pres:byline>/);
    const licUrl = rx(block, /<pres:mediaLicenseUrl>([^<]*)<\/pres:mediaLicenseUrl>/);
    if (highres) images.push({ url: highres, byline, licUrl });
  }
  return { type, itemLabel, desc, place, date, photographer: contextName, images };
}

async function fetchRowsForStone(insc) {
  const comp = compact(insc.sig);
  const j = await ksamsok(`text="${comp}" AND thumbnailExists=j`, 60);
  const records = j?.result?.records || [];
  const rows = [];
  for (const r of records) {
    const graph = r.record?.['@graph'] || [];
    const top = graph.find(n => String(n['@id']).includes('/raa/dokumentation/'));
    if (!top) continue;
    const label = top['ksam:itemLabel']?.['@value'] || '';
    if (!labelMatches(label, comp)) continue;              // exakt signum-match, aldrig gissning
    const uuid = String(top['@id']).split('/').pop();
    const recordLicUrl = top['ksam:itemLicenseUrl']?.['@id'] || null;
    const presNode = graph.find(n => n['ksam:presentation']?.['@value']);
    const pres = presNode ? parsePresentation(presNode['ksam:presentation']['@value']) : { images: [] };

    const imgs = pres.images.length ? pres.images
      : [{ url: `https://pub.raa.se/dokumentation/${uuid}/visning/1`, byline: null, licUrl: recordLicUrl }];

    for (const img of imgs) {
      const lic = classifyLicense(img.licUrl || recordLicUrl);
      if (!lic.keep) { rows.push({ __skip: true, bucket: lic.bucket, sig: insc.sig }); continue; }
      const place = pres.place ? pres.place.split(';').filter(s => /Socken|Landskap/.test(s)).map(s => s.trim()).join(', ') : '';
      const description = [
        `${label}.`,
        pres.desc || '',
        place ? `(${place})` : '',
        `[${pres.type || 'Bild'}]`,
        `(Källa: http://kulturarvsdata.se/raa/dokumentation/${uuid})`,
      ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      rows.push({
        inscription_id: insc.id,
        media_url: img.url,
        media_type: mediaTypeOf(pres.type),
        description,
        photographer: img.byline || pres.photographer || null,
        photo_date: pres.date,
        copyright_info: lic.raw,
        bucket: lic.bucket,
        sig: insc.sig,
      });
    }
  }
  return rows;
}

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    const insRes = await client.query(
      `SELECT id, coalesce(rundata_signum, signum) AS sig
         FROM runic_inscriptions
        WHERE coalesce(rundata_signum, signum) LIKE $1
        ORDER BY sig`, [`${PREFIX} %`]);
    let inscriptions = insRes.rows;
    if (LIMIT) inscriptions = inscriptions.slice(0, LIMIT);
    console.log(`${PREFIX}: ${inscriptions.length} inskrifter i DB${LIMIT ? ` (begränsat till ${LIMIT})` : ''}. Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}.`);

    const ids = inscriptions.map(i => i.id);
    const existing = new Set();
    if (ids.length) {
      const ex = await client.query(`SELECT media_url FROM inscription_media WHERE inscription_id = ANY($1)`, [ids]);
      ex.rows.forEach(r => existing.add(r.media_url));
    }

    const kept = [];
    const seen = new Set();
    const buckets = {}; const byType = {}; const stonesWithNew = new Set();
    let done = 0;
    for (const insc of inscriptions) {
      const rows = await fetchRowsForStone(insc);
      for (const row of rows) {
        buckets[row.bucket] = (buckets[row.bucket] || 0) + 1;
        if (row.__skip) continue;
        if (existing.has(row.media_url) || seen.has(row.media_url)) continue;
        seen.add(row.media_url);
        kept.push(row);
        byType[row.media_type] = (byType[row.media_type] || 0) + 1;
        stonesWithNew.add(row.inscription_id);
      }
      if (++done % 50 === 0) console.log(`  …${done}/${inscriptions.length} stenar, ${kept.length} nya bilder hittills`);
      await sleep(SLEEP);
    }

    console.log('\n=== RAPPORT ===');
    console.log('Licens-buckets (alla träffade bilder):', JSON.stringify(buckets));
    console.log('Nya bilder per typ:', JSON.stringify(byType));
    console.log(`Nya bilder: ${kept.length}, på ${stonesWithNew.size} stenar (av ${inscriptions.length}).`);

    if (!APPLY) {
      console.log('\nDRY-RUN — inget skrivet. Exempel (upp till 8):');
      kept.slice(0, 8).forEach(r => console.log(`  ${r.sig} [${r.media_type}] ${r.photographer || '—'} | ${r.media_url}`));
      console.log('\nKör med --apply för att skriva.');
      return;
    }

    let inserted = 0;
    for (const r of kept) {
      const res = await client.query(
        `INSERT INTO inscription_media (inscription_id, media_url, media_type, description, photographer, photo_date, copyright_info, source_institution)
         SELECT $1,$2,$3,$4,$5,$6::date,$7,$8
         WHERE NOT EXISTS (SELECT 1 FROM inscription_media WHERE media_url=$2)`,
        [r.inscription_id, r.media_url, r.media_type, r.description, r.photographer, r.photo_date, r.copyright_info, SRC]);
      inserted += res.rowCount;
    }
    console.log(`\n✅ APPLY klar: ${inserted} rader insatta (idempotent).`);
  } finally {
    await client.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });

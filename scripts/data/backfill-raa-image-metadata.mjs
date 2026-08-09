// Backfill av motive + keywords på BEFINTLIGA RAÄ-bilder i inscription_media.
// Lever 2 för bildsöket: ingest-raa-images.mjs skriver dessa fält framåt, men de ~2471 redan
// insatta raderna saknar dem. Här hämtas presentation-XML per dokumentation-UUID och UPDATE:ar
// motive (pres:motive) + keywords (pres:tag[]). Idempotent: rör bara rader där motive IS NULL.
//
// Användning:
//   node scripts/data/backfill-raa-image-metadata.mjs [--apply] [--limit N] [--sleep MS]
//   default = dry-run (skriver inget). --apply skriver till prod.
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

const rx = (s, re) => { const m = re.exec(s); return m ? m[1].trim() : null; };
const UUID_RE = /dokumentation\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

async function fetchPresentation(uuid) {
  const url = `https://kulturarvsdata.se/raa/dokumentation/xml/${uuid}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.status === 200) return r.text();
      if (r.status === 404) return null;
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (attempt + 1)); continue; }
      return null;
    } catch { await sleep(1000 * (attempt + 1)); }
  }
  return null;
}

function parseFields(xml) {
  const motive = rx(xml, /<pres:motive>([^<]*)<\/pres:motive>/);
  const tags = [];
  const tagRe = /<pres:tag>([^<]*)<\/pres:tag>/g;
  let tm;
  while ((tm = tagRe.exec(xml))) { const t = tm[1].trim(); if (t) tags.push(t); }
  return { motive: motive || null, keywords: tags.length ? tags : null };
}

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    const res = await client.query(
      `SELECT id, media_url FROM inscription_media
        WHERE media_url ~ 'pub\\.raa\\.se/dokumentation/[0-9a-f-]{36}' AND motive IS NULL
        ORDER BY id`);
    let rows = res.rows;
    if (LIMIT) rows = rows.slice(0, LIMIT);
    console.log(`Backfill-kandidater: ${rows.length}${LIMIT ? ` (begränsat till ${LIMIT})` : ''}. Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}.`);

    let withMotive = 0, withKeywords = 0, notFound = 0, updated = 0, done = 0;
    const motiveHist = {};
    for (const row of rows) {
      const uuid = (UUID_RE.exec(row.media_url) || [])[1];
      if (!uuid) { done++; continue; }
      const xml = await fetchPresentation(uuid);
      if (!xml) { notFound++; done++; await sleep(SLEEP); continue; }
      const { motive, keywords } = parseFields(xml);
      if (motive) { withMotive++; motiveHist[motive] = (motiveHist[motive] || 0) + 1; }
      if (keywords) withKeywords++;
      if (APPLY && (motive || keywords)) {
        const up = await client.query(
          `UPDATE inscription_media SET motive = COALESCE($2, motive), keywords = COALESCE($3, keywords)
            WHERE id = $1 AND motive IS NULL`,
          [row.id, motive, keywords]);
        updated += up.rowCount;
      }
      if (++done % 100 === 0) console.log(`  …${done}/${rows.length} — motive:${withMotive} keywords:${withKeywords} saknas:${notFound}`);
      await sleep(SLEEP);
    }

    console.log('\n=== RAPPORT ===');
    console.log(`Bearbetade: ${done}. Med motive: ${withMotive}, med keywords: ${withKeywords}, ej funna: ${notFound}.`);
    console.log('Motiv (topp 15):', JSON.stringify(
      Object.entries(motiveHist).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `${k}:${v}`)));
    if (APPLY) console.log(`✅ APPLY klar: ${updated} rader uppdaterade.`);
    else console.log('\nDRY-RUN — inget skrivet. Kör med --apply för att skriva.');
  } finally {
    await client.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });

// Backfill thumb_url för Wikimedia-bilder ur Commons-API:t (iiurlwidth=480). Lagrar den VERKLIGA
// thumb-URL:en (ej hand-byggd) i inscription_media.thumb_url och historical_depictions.thumb_url.
// Om bilden är mindre än 480px returnerar API:t originalet (unscaled) → vi lämnar thumb_url = NULL
// (ingen vinst). Batch 50 titlar/anrop. DRY som standard; --apply skriver.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const WIDTH = 480;
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const UA = { 'User-Agent': 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)' };

const fileTitle = (url) => { try { return 'File:' + decodeURIComponent(new URL(url).pathname.split('/').pop()); } catch { return null; } };
const norm = (t) => t.replace(/^File:/, '').replace(/_/g, ' ');

async function apiThumbs(titles) {
  const out = new Map(); // normaliserad titel → thumburl (endast /thumb/, dvs verkligt skalad)
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const u = new URL('https://commons.wikimedia.org/w/api.php');
    u.search = new URLSearchParams({ action: 'query', format: 'json', prop: 'imageinfo', iiprop: 'url', iiurlwidth: String(WIDTH), titles: batch.join('|') }).toString();
    const j = await (await fetch(u, { headers: UA })).json();
    const pages = j?.query?.pages || {};
    const normMap = j?.query?.normalized ? Object.fromEntries(j.query.normalized.map(n => [n.to, n.from])) : {};
    for (const p of Object.values(pages)) {
      const ii = p.imageinfo?.[0];
      if (!ii?.thumburl) continue;
      const tb = ii.thumburl.split('?')[0];
      if (!/\/thumb\//.test(tb)) continue; // unscaled (liten bild) → hoppa
      const canonical = normMap[p.title] || p.title;
      out.set(norm(canonical), tb);
    }
  }
  return out;
}

const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 120000 });
await c.connect();
if (APPLY) await c.query(readFileSync('./supabase/migrations/20260818210000_media_thumb_url.sql', 'utf8'));

for (const [table, urlCol] of [['inscription_media', 'media_url'], ['historical_depictions', 'image_url']]) {
  const rows = (await c.query(`select id, ${urlCol} as url from public.${table} where ${urlCol} ilike '%upload.wikimedia.org%' and thumb_url is null`)).rows;
  const titleByRow = rows.map(r => ({ id: r.id, url: r.url, title: fileTitle(r.url) })).filter(r => r.title);
  const uniqTitles = [...new Set(titleByRow.map(r => r.title))];
  console.log(`\n${table}: ${rows.length} Wikimedia-rader utan thumb, ${uniqTitles.length} unika filer`);
  const map = await apiThumbs(uniqTitles);
  console.log(`  API gav skalad thumb för ${map.size} filer (övriga för små → NULL)`);
  let upd = 0;
  for (const r of titleByRow) {
    const tb = map.get(norm(r.title));
    if (!tb) continue;
    if (APPLY) await c.query(`update public.${table} set thumb_url=$1 where id=$2`, [tb, r.id]);
    upd++;
  }
  console.log(`  ${APPLY ? 'UPPDATERADE' : 'skulle uppdatera'} ${upd} rader med thumb_url`);
  if (rows.length) console.log('  ex:', [...map.entries()].slice(0, 2).map(([k, v]) => `${k} → ${v.slice(50, 90)}`).join(' | '));
}
if (!APPLY) console.log('\nDRY — kör med --apply.');
await c.end();

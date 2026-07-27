// Fix: 71 inscription_media-rader har media_url = abstrakt kulturarvsdata-URI
// (http://kulturarvsdata.se/raa/kmb/<id>) i stället för bildfil → <img> renderar HTML, inte JPEG.
// Resolvar varje KMB-id via redirect till dokumentation-uuid och sätter media_url till den riktiga
// bilden: https://pub.raa.se/dokumentation/<uuid>/visning/1 (samma form som de 1611 korrekta raderna).
//
// Kör:  node scripts/data/fix-inscription-media-kmb-urls.mjs [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const UA = 'Mozilla/5.0 VikingageBot (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();

const rows = (await c.query(
  `select id, media_url from inscription_media where media_url like '%kulturarvsdata.se/raa/kmb/%'`
)).rows;
console.log(`${rows.length} rader med abstrakt KMB-URI att resolva.\n`);

let ok = 0, fail = 0;
for (const r of rows) {
  try {
    const resp = await fetch(r.media_url.replace(/^http:/, 'http:'), { headers: { 'User-Agent': UA }, redirect: 'follow' });
    // final URL: https://kulturarvsdata.se/raa/dokumentation/<uuid>
    const uuid = (resp.url.match(/dokumentation\/([0-9a-f-]{36})/) || [])[1]
      || ((await resp.text()).match(/pub\.raa\.se\/dokumentation\/([0-9a-f-]{36})\/visning\/\d+/) || [])[1];
    if (!uuid) { console.log(`  ✗ ${r.media_url} → ingen uuid`); fail++; continue; }
    const newUrl = `https://pub.raa.se/dokumentation/${uuid}/visning/1`;
    console.log(`  ${r.media_url.split('/').pop()} → ${newUrl}`);
    if (APPLY) await c.query(`update inscription_media set media_url=$1 where id=$2`, [newUrl, r.id]);
    ok++;
  } catch (e) { console.log(`  ✗ ${r.media_url} ERR ${e.message}`); fail++; }
  await sleep(250);
}
console.log(`\n${APPLY ? 'UPPDATERADE' : 'DRY-RUN'}: ${ok} resolvade, ${fail} misslyckade.`);
if (!APPLY) console.log('Kör med --apply för att skriva.');
await c.end();

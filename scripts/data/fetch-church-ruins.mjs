// Hämtar KYRKO-/KLOSTERRUINER + ödekyrkor från RAÄ K-samsök (CC0) -> heritage_sites.
// Samma verifieringsregel som övriga heritage-lager: bara /raa/lamning/ med gml:coordinates
// direkt ur RAÄ (LNG,LAT). Inga gissade lägen. Insert via pg (dedup på source_uri).
import pg from 'pg';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const PW = env.SUPABASE_DB_PASSWORD;
if (!PW) { console.error('SUPABASE_DB_PASSWORD saknas'); process.exit(1); }
const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';

const TYPES = [
  { term: 'kyrkoruin', label: 'kyrkoruin', re: /kyrkoruin|ödekyrk|kyrka.{0,20}ruin/i },
  { term: 'ödekyrka', label: 'kyrkoruin', re: /ödekyrk|kyrkoruin/i },
  { term: 'klosterruin', label: 'klosterruin', re: /kloster/i },
];
const MAX_PAGES = 30, PER = 100;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchType(t, seen) {
  const rows = [];
  for (let start = 1; start <= MAX_PAGES * PER; start += PER) {
    const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${PER}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent('text=' + t.term)}`;
    const xml = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
    const items = xml.split('<pres:item ').slice(1);
    if (items.length === 0) break;
    for (const it of items) {
      const label = (it.match(/<pres:itemLabel[^>]*>([^<]*)</) || [])[1] || '';
      const place = (it.match(/<pres:placeLabel[^>]*>([^<]*)</) || [])[1] || '';
      const uri = (it.match(/kulturarvsdata\.se\/[a-z]+\/[a-z]+\/[a-z0-9-]{8,}/) || [])[0] || '';
      const cm = it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</);
      if (!cm) continue;
      const lng = parseFloat(cm[1]), lat = parseFloat(cm[2]);
      if (!/\/raa\/lamning\//.test(uri)) continue;
      if (!t.re.test(it)) continue;
      if (!(lat > 54 && lat < 70 && lng > 10 && lng < 25)) continue;
      if (seen.has(uri)) continue; seen.add(uri);
      const p = place.split(',').map(x => x.trim());
      rows.push({ raa_type: t.label, name: label.trim() || t.label, landscape: p[3] || null, municipality: p[2] || null, parish: p[4] || null, lat, lng, source_uri: uri });
    }
    await sleep(700);
  }
  return rows;
}

async function main() {
  const seen = new Set();
  let all = [];
  for (const t of TYPES) {
    const rows = await fetchType(t, seen);
    console.log(`${t.term.padEnd(12)} → ${rows.length} verifierade lämningar`);
    all = all.concat(rows);
  }
  console.log(`Totalt unika: ${all.length}`);

  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: PW, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    let ins = 0;
    for (const r of all) {
      const res = await client.query(
        `INSERT INTO public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, source_uri)
         SELECT $1,$2,$3,$4,$5,$6,$7,$8
         WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.source_uri = $8)`,
        [r.raa_type, r.name, r.landscape, r.municipality, r.parish, r.lat, r.lng, r.source_uri]);
      ins += res.rowCount;
    }
    console.log(`Infogade i heritage_sites: ${ins}`);
    const sum = await client.query(`SELECT raa_type, count(*) FROM public.heritage_sites WHERE raa_type IN ('kyrkoruin','klosterruin') GROUP BY raa_type`);
    console.table(sum.rows);
  } finally { await client.end(); }
}
main().catch(e => { console.error('FEL:', e.message); process.exit(1); });

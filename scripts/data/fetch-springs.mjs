// Hämtar RAÄ-lämningar av typ "Källa med tradition" (K-samsök/Fornsök, CC0) och skriver
// till heritage_sites (raa_type 'Källa med tradition'). Samma verifieringsregel som
// vårdkasarna: bara /raa/lamning/ med gml:coordinates (WGS84 lng,lat) direkt ur RAÄ.
import https from 'https';
import fs from 'fs';
import pg from 'pg';

const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n')
  .map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && l.includes('='))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; }));
const PW = env.SUPABASE_DB_PASSWORD;
if (!PW) { console.error('Saknar SUPABASE_DB_PASSWORD'); process.exit(1); }

const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const get = (url) => new Promise((res, rej) => {
  https.get(url, { headers: { 'User-Agent': UA } }, (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(d)); }).on('error', rej);
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PER = 500;
const rows = [], seen = new Set();
for (let start = 1; start <= 2100; start += PER) {
  const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${PER}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent('itemName="Källa med tradition"')}`;
  const xml = await get(url);
  const items = xml.split('<pres:item ').slice(1);
  if (!items.length) break;
  for (const it of items) {
    if (!/\/raa\/lamning\//.test(it)) continue;
    const label = (it.match(/<pres:itemLabel[^>]*>([^<]*)</) || [])[1] || 'Källa med tradition';
    const place = (it.match(/<pres:placeLabel[^>]*>([^<]*)</) || [])[1] || '';
    const uri = (it.match(/kulturarvsdata\.se\/raa\/lamning\/[a-z0-9-]{8,}/) || [])[0] || '';
    const cm = it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</);
    if (!cm || !uri) continue;
    const lng = parseFloat(cm[1]), lat = parseFloat(cm[2]);
    if (!(lat > 54 && lat < 70 && lng > 10 && lng < 25)) continue;
    if (seen.has(uri)) continue; seen.add(uri);
    const p = place.split(',').map((x) => x.trim());
    rows.push({ name: label.trim(), landscape: p[3] || null, municipality: p[2] || null, parish: p[4] || null, lat, lng, uri: 'https://' + uri });
  }
  await sleep(600);
}
console.log(`Hämtade ${rows.length} källor med koordinat ur Fornsök.`);

const client = new pg.Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj',
  password: PW, database: 'postgres', ssl: { rejectUnauthorized: false },
});
await client.connect();
let inserted = 0;
for (const r of rows) {
  const res = await client.query(
    `insert into public.heritage_sites (raa_type,name,landscape,municipality,parish,lat,lng,period,description,source_uri)
     select 'Källa med tradition',$1,$2,$3,$4,$5,$6,null,'Källa med tradition (RAÄ Fornsök, CC0).',$7
     where not exists (select 1 from public.heritage_sites h where h.source_uri=$7)`,
    [r.name, r.landscape, r.municipality, r.parish, r.lat, r.lng, r.uri]);
  inserted += res.rowCount;
}
console.log(`Infogade ${inserted} nya källor i heritage_sites.`);
await client.end();

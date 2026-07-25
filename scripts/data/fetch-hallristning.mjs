// Hämtar CC0-hällristningar (RAÄ K-samsök) med verifierad WGS84-koordinat och
// upsertar via import-heritage. Samma metod/verifiering som fetch-heritage.mjs
// (bara /raa/lamning/-poster, typordet måste finnas i posten, Sverige-bbox).
import https from 'https';
const ANON = process.argv[2];
const FN = 'https://mnuifmcjspeaauzehasj.supabase.co/functions/v1/import-heritage';
const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';

const get = (url) => new Promise((res, rej) => {
  https.get(url, { headers: { 'User-Agent': UA } }, (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(d)); }).on('error', rej);
});
const post = (rows) => new Promise((res, rej) => {
  const body = JSON.stringify({ rows });
  const req = https.request(FN, { method: 'POST', headers: {
    'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
    apikey: ANON, Authorization: `Bearer ${ANON}`,
  } }, (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(d)); });
  req.on('error', rej); req.write(body); req.end();
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TYPES = [
  { term: 'hällristning', label: 'hällristning', re: /hällristning/i },
];
const MAX_PAGES = 45, PER = 100;

const fetchType = async (t) => {
  const rows = [], seen = new Set();
  let capped = false;
  for (let start = 1; start <= MAX_PAGES * PER; start += PER) {
    const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${PER}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent('text=' + t.term)}`;
    const xml = await get(url);
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
      const key = lat.toFixed(4) + ',' + lng.toFixed(4);
      if (seen.has(key)) continue; seen.add(key);
      const p = place.split(',').map((x) => x.trim());
      rows.push({ raa_type: t.label, name: label.trim(), landscape: p[3] || null, municipality: p[2] || null, parish: p[4] || null, lat, lng, source_uri: uri });
    }
    if (start + PER > MAX_PAGES * PER && items.length === PER) capped = true;
    await sleep(700);
  }
  return { rows, capped };
};

let grand = 0;
for (const t of TYPES) {
  const { rows, capped } = await fetchType(t);
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const res = await post(rows.slice(i, i + 500));
    try { inserted += JSON.parse(res).inserted || 0; } catch { console.log('POST-svar:', res.slice(0, 200)); }
    await sleep(300);
  }
  grand += rows.length;
  console.log(`${t.label.padEnd(16)} hämtade ${String(rows.length).padStart(4)} verifierade, upsert ${inserted}${capped ? '  ⚠ CAPPAD vid ' + MAX_PAGES * PER : ''}`);
}
console.log('TOTALT hämtade:', grand);

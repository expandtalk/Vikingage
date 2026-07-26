// Hämtar svenska kyrkobyggnader från Wikidata (CC0) med koordinat, byggår och
// administrativ hemvist. POSTar batchar till import-heritage som raa_type='kyrka'.
// Byggår lagras i period → medeltida sockenkyrkor går att urskilja.
import https from 'https';
const ANON = process.argv[2];
const FN = 'https://mnuifmcjspeaauzehasj.supabase.co/functions/v1/import-heritage';
const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';

const sparql = (q) => new Promise((res, rej) => {
  https.get(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`,
    { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } },
    (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(d.slice(0, 300)); } }); }).on('error', rej);
});
const post = (rows) => new Promise((res, rej) => {
  const body = JSON.stringify({ rows });
  const req = https.request(FN, { method: 'POST', headers: {
    'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body),
    apikey: ANON, Authorization: `Bearer ${ANON}`,
  } }, (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(d)); });
  req.on('error', rej); req.write(body); req.end();
});

const q = `SELECT ?c ?cLabel ?coord (SAMPLE(?inc) AS ?incd) (SAMPLE(?admLabel) AS ?adm) WHERE {
  ?c wdt:P31/wdt:P279* wd:Q16970 . ?c wdt:P17 wd:Q34 . ?c wdt:P625 ?coord .
  OPTIONAL { ?c wdt:P571 ?inc . }
  OPTIONAL { ?c wdt:P131 ?a . ?a rdfs:label ?admLabel . FILTER(LANG(?admLabel)='sv') }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
} GROUP BY ?c ?cLabel ?coord`;

// Byggår separat (SAMPLE i huvudqueryn tappade dem) → uri->år-karta
const qy = `SELECT ?c (MIN(YEAR(?inc)) AS ?y) WHERE {
  ?c wdt:P31/wdt:P279* wd:Q16970 . ?c wdt:P17 wd:Q34 . ?c wdt:P625 ?coord . ?c wdt:P571 ?inc .
} GROUP BY ?c`;
const yr = await sparql(qy);
const yearMap = new Map();
for (const b of yr.results.bindings) {
  if (b.y?.value) { const y = parseInt(b.y.value, 10); if (y >= 400 && y <= 2025) yearMap.set(b.c.value, y); }
}
console.log('byggår hämtade:', yearMap.size);

const r = await sparql(q);
const seen = new Set();
const rows = [];
for (const b of r.results.bindings) {
  const uri = b.c.value;
  if (seen.has(uri)) continue; seen.add(uri);
  const m = String(b.coord.value).match(/Point\(([-\d.]+) ([-\d.]+)\)/);
  if (!m) continue;
  const lng = parseFloat(m[1]), lat = parseFloat(m[2]);
  let name = b.cLabel?.value || 'Kyrka';
  if (/^Q\d+$/.test(name)) continue; // saknar riktig etikett
  const year = yearMap.get(uri) || null;
  rows.push({ raa_type: 'kyrka', name, lat, lng, municipality: b.adm?.value || null, period: year ? String(year) : null, source_uri: uri });
}
console.log('kyrkor med koord+etikett:', rows.length);

let inserted = 0;
for (let i = 0; i < rows.length; i += 500) {
  const res = await post(rows.slice(i, i + 500));
  try { inserted += JSON.parse(res).inserted || 0; } catch { console.log('POST-svar:', res.slice(0, 150)); }
  await new Promise((r) => setTimeout(r, 300));
}
console.log('upsert klart, inserted:', inserted);

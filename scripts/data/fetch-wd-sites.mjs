// Generisk Wikidata-hämtare (CC0) för en klass → heritage_sites via import-heritage.
// Anrop: node fetch-wd-sites.mjs <ANON_KEY> <QID> <raa_type>
// Ex: node fetch-wd-sites.mjs KEY Q44613 kloster   (kloster/abbotsdömen)
//     node fetch-wd-sites.mjs KEY Q108325 kapell    (kapell)
import https from 'https';
const ANON = process.argv[2], QID = process.argv[3], RAA = process.argv[4];
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

// byggår per objekt
const qy = `SELECT ?c (MIN(YEAR(?inc)) AS ?y) WHERE {
  ?c wdt:P31/wdt:P279* wd:${QID} . ?c wdt:P17 wd:Q34 . ?c wdt:P625 ?p . ?c wdt:P571 ?inc .
} GROUP BY ?c`;
const yearMap = new Map();
try { const yr = await sparql(qy); for (const b of yr.results.bindings) { if (b.y?.value) { const y = parseInt(b.y.value, 10); if (y >= 400 && y <= 2025) yearMap.set(b.c.value, y); } } } catch (e) { console.log('år-query hoppad:', String(e).slice(0, 80)); }

const q = `SELECT ?c ?cLabel ?coord (SAMPLE(?admLabel) AS ?adm) WHERE {
  ?c wdt:P31/wdt:P279* wd:${QID} . ?c wdt:P17 wd:Q34 . ?c wdt:P625 ?coord .
  OPTIONAL { ?c wdt:P131 ?a . ?a rdfs:label ?admLabel . FILTER(LANG(?admLabel)='sv') }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
} GROUP BY ?c ?cLabel ?coord`;
const r = await sparql(q);
const seen = new Set(), rows = [];
for (const b of r.results.bindings) {
  const uri = b.c.value; if (seen.has(uri)) continue; seen.add(uri);
  const m = String(b.coord.value).match(/Point\(([-\d.]+) ([-\d.]+)\)/); if (!m) continue;
  const name = b.cLabel?.value || RAA; if (/^Q\d+$/.test(name)) continue;
  const y = yearMap.get(uri) || null;
  rows.push({ raa_type: RAA, name, lat: parseFloat(m[2]), lng: parseFloat(m[1]), municipality: b.adm?.value || null, period: y ? String(y) : null, source_uri: uri });
}
console.log(`${RAA}: ${rows.length} med koord+etikett (${yearMap.size} med byggår)`);
let up = 0;
for (let i = 0; i < rows.length; i += 500) { const res = await post(rows.slice(i, i + 500)); try { up += JSON.parse(res).upserted || 0; } catch { console.log('POST:', res.slice(0, 150)); } await new Promise((r) => setTimeout(r, 300)); }
console.log('upsert klart:', up);

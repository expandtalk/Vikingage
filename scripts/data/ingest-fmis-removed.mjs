// FMIS-ingest av BORTTAGNA gravtyper + FORNLÄMNINGSLIKNANDE lämningar → heritage_sites.
// Komplement till ingest-fmis-lamningar.mjs (som bara drog bekräftade). Röjda åkergravfält
// (1800-talsskiften) hamnar i FMIS som "borttagen" — de fångas här. "Övrig kulturhistorisk
// lämning" (25k+) och "utan antikvarisk bedömning" hoppas MEDVETET (för breda att bulk-ingesta).
//
// Kör: node scripts/data/ingest-fmis-removed.mjs <region> [--apply] [--sleep=MS]
//   region = oland | kalmar | stockholm | goteborg
import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
// Gravrelaterade typord — borttagna behålls bara om labeln är gravtyp (Daniels åkergravfälts-fråga).
const GRAVE_RE = /gravfält|stensättning|\brös(e|en)\b|\bgrav\b|gravhög|\bhög\b|domarring|skeppss(ä|a)ttning|treudd|stenkist|flatmarksgrav|bautasten|rest sten|kummel|stensträng/i;

const TERMS = [
  { term: 'borttagen',           existence: 'destroyed',  requireGrave: true  },
  { term: 'fornlämningsliknande', existence: 'unassessed', requireGrave: false },
];
const REGIONS = {
  oland:     { county: 'Kalmar',          landscape: 'Öland' },
  kalmar:    { county: 'Kalmar',          notLandscape: 'Öland' },
  stockholm: { county: 'Stockholm' },
  goteborg:  { county: '"Västra Götaland"', bbox: [11.5, 57.5, 12.4, 58.05] },
};

const argv = process.argv.slice(2);
const REGION = argv.find(a => !a.startsWith('--'));
const APPLY = argv.includes('--apply');
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) || 600;
if (!REGION || !REGIONS[REGION]) { console.error('region: oland|kalmar|stockholm|goteborg'); process.exit(1); }
const region = REGIONS[REGION];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));

async function ksamsok(query, hits, start) {
  const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${hits}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent(query)}`;
  for (let a = 0; a < 4; a++) { try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 200) return r.text(); await sleep(1500 * (a + 1)); } catch { await sleep(1000 * (a + 1)); } }
  return '';
}
const m1 = (s, re) => { const m = re.exec(s); return m ? m[1].trim() : ''; };

function parseItem(it, t) {
  const ent = m1(it, /<pres:entityUri>([^<]*)</);
  if (!/\/raa\/lamning\//.test(ent)) return null;
  const cm = it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</);
  if (!cm) return null;
  const lng = parseFloat(cm[1]), lat = parseFloat(cm[2]);
  if (!(lat > 54 && lat < 70 && lng > 10 && lng < 25)) return null;
  const label = m1(it, /<pres:itemLabel[^>]*>([^<]*)</);
  if (t.requireGrave && !GRAVE_RE.test(label)) return null;
  const place = m1(it, /<pres:placeLabel[^>]*>([^<]*)</);
  const p = place.split(',').map(x => x.trim());  // [Land, Län, Kommun, Landskap, Socken]
  const landscape = p[3] || null, municipality = p[2] || null, parish = p[4] || null;
  if (region.landscape && landscape !== region.landscape) return null;
  if (region.notLandscape && landscape === region.notLandscape) return null;
  if (region.bbox) { const [w, s, e, n] = region.bbox; if (!(lng >= w && lng <= e && lat >= s && lat <= n)) return null; }
  return { raa_type: label || 'lämning', name: label, landscape, municipality, parish, lat, lng,
           existence: t.existence, source_uri: ent.replace(/^https?:\/\//, '') };
}

async function fetchTerm(t) {
  const rows = new Map(); const PER = 100, MAX = 30;
  for (let page = 0; page < MAX; page++) {
    const xml = await ksamsok(`text="${t.term}" AND countyName=${region.county}`, PER, page * PER + 1);
    const items = xml.split('<pres:item ').slice(1);
    if (!items.length) break;
    for (const it of items) { const r = parseItem(it, t); if (r) rows.set(r.source_uri, r); }
    if (items.length < PER) break;
    await sleep(SLEEP);
  }
  return [...rows.values()];
}

const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
await client.connect();
console.log(`Region ${REGION}. Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}.`);
let all = [];
for (const t of TERMS) { const rows = await fetchTerm(t); console.log(`  "${t.term}" (${t.existence}${t.requireGrave ? ', bara gravtyp' : ''}): ${rows.length}`); all = all.concat(rows); }
// dedup source_uri
const uniq = [...new Map(all.map(r => [r.source_uri, r])).values()];
console.log(`Totalt unika: ${uniq.length}`);
console.log('Exempel:'); uniq.slice(0, 10).forEach(r => console.log(`  ${r.existence} | ${r.raa_type} | ${r.parish} | ${r.lat.toFixed(4)},${r.lng.toFixed(4)}`));

if (APPLY && uniq.length) {
  let ins = 0;
  for (const r of uniq) {
    const res = await client.query(
      `insert into heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, existence, source_uri)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (source_uri) do nothing`,
      [r.raa_type, r.name, r.landscape, r.municipality, r.parish, r.lat, r.lng, r.existence, r.source_uri]);
    ins += res.rowCount;
  }
  console.log(`APPLIED: ${ins} nya (idempotent, ${uniq.length - ins} fanns redan).`);
} else if (!APPLY) console.log('DRY-RUN — kör med --apply.');
await client.end();

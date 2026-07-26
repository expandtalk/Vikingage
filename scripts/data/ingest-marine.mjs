// Marinarkeologi → heritage_sites: vrak/fartygslämningar, de med tradition/namn urskilda.
// RAÄ-lämningstyp "Fartygs-/båtlämning". Kalmar län (vraken ligger i sundet, ej landskaps-delat).
//   node scripts/data/ingest-marine.mjs [--apply] [--county=Kalmar]
// Fornsök=CC0. Upsert på source_uri. raa_type: 'vrak med tradition' (namngivet/sägen) el. 'fartygslämning'.

import pg from 'pg';
import { readFileSync } from 'node:fs';
const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const COUNTY = (argv.find(a => a.startsWith('--county=')) || '--county=Kalmar').split('=')[1];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')]; }));
const m1 = (s, re) => { const m = re.exec(s); return m ? m[1].trim() : ''; };

async function ksamsok(q, hits, start) {
  const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${hits}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent(q)}`;
  for (let a = 0; a < 4; a++) { try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 200) return r.text(); await sleep(1500*(a+1)); } catch { await sleep(1000*(a+1)); } }
  return '';
}

// namngivet vrak (ej generisk typ) ELLER sägen/tradition i beskrivningen → "med tradition"
const GENERIC = /^(fartygs-?\/?(och )?båtlämning|vrak|fyndplats|lägenhetsbebyggelse)$/i;
function classify(name, desc) {
  const named = name && !GENERIC.test(name.trim());
  const trad = /tradition|sägen|sagan|enligt uppgift|folkminne|känd som|kallas/i.test(name + ' ' + desc);
  return (named || trad) ? 'vrak med tradition' : 'fartygslämning';
}

function parseItem(it) {
  const ent = m1(it, /<pres:entityUri>([^<]*)</);
  if (!/\/raa\/lamning\//.test(ent)) return null;
  const cm = it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</);
  if (!cm) return null;
  const lng = parseFloat(cm[1]), lat = parseFloat(cm[2]);
  if (!(lat > 54 && lat < 70 && lng > 10 && lng < 25)) return null;
  const label = m1(it, /<pres:itemLabel[^>]*>([^<]*)</);
  if (!/fartyg|båtlämning|\bvrak\b/i.test(label)) return null;
  const place = m1(it, /<pres:placeLabel[^>]*>([^<]*)</).split(',').map(x => x.trim());
  const desc = m1(it, /<pres:description[^>]*>([^<]*)</).replace(/\s+/g, ' ').trim() || null;
  const namePart = label.split(',')[0].trim();
  return { raa_type: classify(namePart, desc || ''), name: namePart, landscape: place[3]||null,
           municipality: place[2]||null, parish: place[4]||null, lat, lng, description: desc,
           source_uri: ent.replace(/^https?:\/\//, '') };
}

async function main() {
  console.log(`Marinarkeologi län=${COUNTY} | Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
  await client.connect();
  try {
    const rows = new Map();
    for (const term of ['fartygslämning', 'vrak']) {
      for (let page = 0; page < 15; page++) {
        const xml = await ksamsok(`text="${term}" AND countyName=${COUNTY}`, 100, page*100+1);
        const items = xml.split('<pres:item ').slice(1);
        if (!items.length) break;
        for (const it of items) { const r = parseItem(it); if (r) rows.set(r.source_uri, r); }
        if (items.length < 100) break;
        await sleep(400);
      }
    }
    const all = [...rows.values()];
    const trad = all.filter(r => r.raa_type === 'vrak med tradition');
    console.log(`\n${all.length} vrak/fartygslämningar (${trad.length} med tradition/namn).`);
    trad.slice(0, 10).forEach(r => console.log(`  ⚓ ${r.name} (${r.parish||r.municipality}) — ${(r.description||'').slice(0,60)}`));
    if (!APPLY) { console.log('\nDRY-RUN — inget skrivet.'); return; }
    let up = 0;
    for (const r of all) {
      const res = await client.query(
        `INSERT INTO heritage_sites (raa_type,name,landscape,municipality,parish,lat,lng,description,source_uri)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (source_uri) DO UPDATE SET raa_type=EXCLUDED.raa_type, name=EXCLUDED.name, description=EXCLUDED.description, updated_at=now()`,
        [r.raa_type, r.name, r.landscape, r.municipality, r.parish, r.lat, r.lng, r.description, r.source_uri]);
      up += res.rowCount;
    }
    console.log(`\n✅ APPLY: ${up} rader upsertade.`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });

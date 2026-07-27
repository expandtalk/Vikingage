// Kalmar stadsmur — RAÄ/K-samsök-ingest (steg 1). Hämtar "Stadsvall/stadsmur"-lämningar i Kalmar
// från K-samsök (kmr_lamningar, CC0), filtrerar till gamla stan, och skriver dem till fort_element
// som evidence_class='bevarat_ovan_mark' (verkliga, dokumenterade/synliga murrester med koordinat).
// Ingen fabricerad lägesosäkerhet: presentation-API:t ger dataQuality (raw), meter-Lägesosäkerheten
// finns bara i geopackage → sparas som not, pos_uncertainty_m lämnas null.
//
// Kör:  node scripts/data/ingest-kalmar-wall-raa.mjs [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const APPLY = process.argv.includes('--apply');
const SITE = 'Kalmar gamla stad';
// Gamla Kalmar (vid slottet) — filtrera bort ev. strö-träffar utanför staden.
const BBOX = { minLat: 56.653, maxLat: 56.666, minLng: 16.343, maxLng: 16.366 };

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function ksamsok(query, hits = 50) {
  const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${hits}&recordSchema=presentation&query=${encodeURIComponent(query)}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('K-samsök ' + r.status);
  return await r.text();
}
const dec = s => (s || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

const xml = await ksamsok('text="stadsvall/stadsmur" AND countyName=Kalmar', 60);
const recs = xml.split('<pres:item ').slice(1).map(s => '<pres:item ' + s.split('</pres:item>')[0]);
const found = [];
for (const r of recs) {
  const uri = (r.match(/<pres:entityUri>([^<]+)/) || [])[1];
  if (!uri || !/\/raa\/lamning\//.test(uri)) continue;
  const coordRaw = (r.match(/<gml:coordinates[^>]*>([^<]+)/) || [])[1];
  if (!coordRaw) continue;
  const [lng, lat] = coordRaw.split(',').map(Number);
  if (!(lat >= BBOX.minLat && lat <= BBOX.maxLat && lng >= BBOX.minLng && lng <= BBOX.maxLng)) continue;
  found.push({
    uri,
    idLabel: dec((r.match(/<pres:idLabel>([^<]+)/) || [])[1]) || '(utan id)',
    label: dec((r.match(/<pres:itemLabel>([^<]+)/) || [])[1]),
    desc: dec((r.match(/<pres:description>([^<]*)/) || [])[1]),
    quality: (r.match(/DataQuality#(\w+)/) || [])[1] || 'okänd',
    lat, lng,
  });
}

console.log(`\n${found.length} stadsmur-lämningar i gamla Kalmar (K-samsök, CC0):\n`);
found.forEach((f, i) => console.log(`[${i}] ${f.idLabel} — ${f.lat.toFixed(5)},${f.lng.toFixed(5)} (kvalitet: ${f.quality})\n    ${f.desc.slice(0, 170)}\n`));

if (!APPLY) { console.log('DRY-RUN. Kör med --apply för att skriva till fort_element.'); process.exit(0); }
if (!found.length) { console.log('Inget att skriva.'); process.exit(0); }

const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();
try {
  await c.query('begin');
  // RAÄ-källa (en gång).
  const src = await c.query(
    `insert into fort_source (citation, archive, url, year)
     select $1,$2,$3,null
     where not exists (select 1 from fort_source where citation = $1)
     returning id`,
    ['RAÄ Fornsök/K-samsök — Stadsvall/stadsmur, kmr_lamningar (CC0). Lägesosäkerhet i meter finns i RAÄ:s geopackage, ej i presentation-API:t.',
     'Riksantikvarieämbetet', 'https://app.raa.se/open/fornsok/']
  );
  const srcId = src.rows[0]?.id
    ?? (await c.query(`select id from fort_source where citation like 'RAÄ Fornsök%' limit 1`)).rows[0].id;

  let ins = 0;
  for (const f of found) {
    const name = `${f.idLabel} — bevarad stadsmursrest`;
    const ex = await c.query(`select id from fort_element where site=$1 and name=$2`, [SITE, name]);
    let eid;
    if (ex.rows.length) { eid = ex.rows[0].id; }
    else {
      const r = await c.query(
        `insert into fort_element
           (site, element_type, name, start_earliest, start_latest, end_earliest, end_latest,
            evidence, evidence_class, pos_accuracy_m, pos_uncertainty_m, geom, published)
         values ($1,'kurtin',$2,1300,1300,1690,1690,'dokumenterad','bevarat_ovan_mark',
            null, null, ST_Transform(ST_SetSRID(ST_MakePoint($3,$4),4326),3006), true)
         returning id`,
        [SITE, name, f.lng, f.lat]
      );
      eid = r.rows[0].id; ins++;
    }
    // Källkoppling (idempotent) med RAÄ-beskrivning + URI som not.
    await c.query(
      `insert into fort_element_source (element_id, source_id, note)
       select $1,$2,$3 where not exists
         (select 1 from fort_element_source where element_id=$1 and source_id=$2)`,
      [eid, srcId, `${f.idLabel} (${f.uri}); dataQuality=${f.quality}. ${f.desc.slice(0, 240)}`]
    );
  }
  await c.query('commit');
  console.log(`\n✅ Skrev ${ins} nya murrest-segment till fort_element (bevarat_ovan_mark) + RAÄ-källa.`);
} catch (e) { await c.query('rollback'); console.error('ROLLBACK:', e.message); }
await c.end();

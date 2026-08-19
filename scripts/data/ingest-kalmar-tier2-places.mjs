// P1 nivå-2-ingest (Kalmar): kulturmiljöer/hydronymer som passar plattformen MED verifierad källa.
// Krusenstiernska gården (Wikidata Q10549592) + Hagbyån (Q5638574). Koordinater = Wikidata P625
// (aldrig ur minnet). Projicerar EN rad i taget via rebuild_search_document('place_name', id)
// (p_id-scoped → ingen signal-wipe). Idempotent på external_id.
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

// Är geom en genererad kolumn? (i så fall sätter vi den inte explicit)
const g = await c.query(`select is_generated from information_schema.columns where table_schema='public' and table_name='place_names' and column_name='geom'`);
const geomGenerated = (g.rows[0]?.is_generated ?? 'NEVER') !== 'NEVER';
console.log('geom generated:', geomGenerated);

const places = [
  {
    name: 'Krusenstiernska gården', feature_type: 'kulturmiljö',
    province: 'Småland', socken: 'Kalmar', harad: 'Norra Möre härad',
    lat: 56.66027778, lng: 16.34833333,
    external_id: 'wikidata:Q10549592', wikidata_p31: 'Q33506;Q1497375',
    attribution: 'Wikidata (Q10549592) — kulturhistoriskt museum, 1800-talsträdgård, klonarkiv',
  },
  {
    name: 'Hagbyån', feature_type: 'vattendrag',
    province: 'Småland', socken: 'Hagby', harad: 'Södra Möre härad',
    lat: 56.52972222, lng: 16.19111111,
    external_id: 'wikidata:Q5638574', wikidata_p31: 'Q3529419',
    attribution: 'Wikidata (Q5638574) — vattendrag (hydronym), Södra Möre; P625 = representativ punkt',
  },
];

for (const p of places) {
  const existing = await c.query(`select id from place_names where external_id = $1 limit 1`, [p.external_id]);
  let id;
  if (existing.rows.length) {
    id = existing.rows[0].id;
    await c.query(
      `update place_names set name=$2, feature_type=$3, province=$4, socken=$5, harad=$6, lat=$7, lng=$8,
         source='wikidata', source_license='CC0', wikidata_p31=$9, attribution=$10, is_primary_referent=true,
         normed_name=lower($2), language='sv'
         ${geomGenerated ? '' : ', geom=ST_SetSRID(ST_MakePoint($8,$7),4326)'}
       where id=$1`,
      [id, p.name, p.feature_type, p.province, p.socken, p.harad, p.lat, p.lng, p.wikidata_p31, p.attribution]);
    console.log('updated', p.name, id);
  } else {
    const cols = ['name','feature_type','province','socken','harad','lat','lng','source','source_license','external_id','wikidata_p31','attribution','is_primary_referent','normed_name','language'];
    const vals = [p.name,p.feature_type,p.province,p.socken,p.harad,p.lat,p.lng,'wikidata','CC0',p.external_id,p.wikidata_p31,p.attribution,true,p.name.toLowerCase(),'sv'];
    if (!geomGenerated) { cols.push('geom'); }
    const ph = vals.map((_,i)=>`$${i+1}`);
    const geomExpr = geomGenerated ? '' : `, ST_SetSRID(ST_MakePoint($7,$6),4326)`;
    const r = await c.query(
      `insert into place_names (${cols.join(',')}) values (${ph.join(',')}${geomExpr}) returning id`, vals);
    id = r.rows[0].id;
    console.log('inserted', p.name, id);
  }
  // Riktad projektion (p_id-scoped → ingen wipe av andra rader)
  await c.query(`select rebuild_search_document('place_name', $1)`, [id]);
  console.log('  projected to search_document');
}

// Verifiera sökbarhet
for (const p of places) {
  const r = await c.query(`select entity_type, label, sublabel from search_document where entity_type='place_name' and label=$1 limit 2`, [p.name]);
  console.log('search_document:', p.name, '→', r.rows.length ? JSON.stringify(r.rows[0]) : 'MISSING');
}
await c.end();

// IIIF på källsidan (/texter → SourceDetail): historical_sources får iiif_manifest/viewer/attribution
// så primärkällor kan visas LIVE ur bibliotekens IIIF-tjänster (BAV/Gallica/e-codices/KB) med rätt
// attribution — spegling sker aldrig. Pilot: Reg. lat. 124 (De laudibus, verifierat manifest).
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();
await c.query(`alter table historical_sources add column if not exists iiif_manifest text`);
await c.query(`alter table historical_sources add column if not exists iiif_viewer_url text`);
await c.query(`alter table historical_sources add column if not exists iiif_attribution text`);
console.log('kolumner klara');
// Pilot: De laudibus / Reg. lat. 124 (verifierat manifest). Finns källan? annars skapa.
const ex = await c.query(`select id from historical_sources where title ilike '%de laudibus%' or manuscript ilike '%Reg. lat. 124%' limit 1`);
let id;
if (ex.rows.length) { id = ex.rows[0].id; console.log('källa finns', id); }
else {
  const r = await c.query(`insert into historical_sources (title, author, written_year, language, kind, rights, repository, manuscript, description)
    values ('Hrabanus Maurus, De laudibus sanctae crucis','Hrabanus Maurus',825,'la','publication','public_domain',
      'Biblioteca Apostolica Vaticana','Reg. lat. 124',
      'Karolingisk hyllningsdikt till korset (carmina figurata). Reg. lat. 124: äldsta helvittnet, Fulda ~825; kom via drottning Kristinas samling till Vatikanbiblioteket 1690.') returning id`);
  id = r.rows[0].id; console.log('skapade källa', id);
}
await c.query(`update historical_sources set iiif_manifest=$2, iiif_viewer_url=$3, iiif_attribution=$4 where id=$1`,
  [id, 'https://digi.vatlib.it/iiif/MSS_Reg.lat.124/manifest.json','https://digi.vatlib.it/view/MSS_Reg.lat.124','© Biblioteca Apostolica Vaticana']);
const v = await c.query(`select title, iiif_manifest, iiif_attribution from historical_sources where id=$1`, [id]);
console.log('verifierat:', JSON.stringify(v.rows[0]));
await c.end();

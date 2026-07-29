// Item 2: förkristna bildobjekt som egna heritage_sites, med VERIFIERADE socken-ankare (ur befintliga
// kyrkrader) — inga fabricerade koord. Pekar om Oden/korp-attesteringarna external → heritage_site.
// Koordinat-caveat i source_uri (socken-nivå, ej exakt fyndplats). Kör: node scripts/data/seed-oden-heritage-sites.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:120000});
await c.connect();
const one = async (sql,p) => (await c.query(sql,p)).rows[0];

// Verifierade socken-ankare (ur heritage_sites-kyrkrader; Torslunda/Ardre/Lärbro bekräftade).
const SITES = [
  { key:'torslunda', name:'Torslundaplåtarna (Björnhovda, Torslunda sn, Öland)', raa_type:'Hjälmmatris (bronsmatris)',
    lat:56.63328, lng:16.51525,
    source_uri:'Hagberg 1976; SHM (funna 1870). Koordinat = Torslunda sockenkyrka (SOCKEN-nivå; fyndplats Björnhovda ~1–2 km, ej exakt).' },
  { key:'storahammars', name:'Stora Hammars I (bildsten, Lärbro sn, Gotland)', raa_type:'Bildsten',
    lat:57.78717, lng:18.79378,
    source_uri:'Lindqvist 1941–42; Hellers 2012. Koordinat = Lärbro sockenkyrka (SOCKEN-nivå). OBS: ej Stora Hammar i Skåne.' },
  { key:'ardre', name:'Ardre VIII (bildsten, Ardre sn, Gotland)', raa_type:'Bildsten',
    lat:57.3795, lng:18.69689,
    source_uri:'Lindqvist 1941–42; Oehrl 2019. Koordinat = Ardre sockenkyrka (SOCKEN-nivå). Tjängvide I (Alskog sn) behandlas i samma Sleipner-not; eget koordinatankare saknas ännu.' },
];

// Attestering-ompekning: target_ref-prefix → site-key
const REPOINT = [
  { refLike:'Torslundaplåtarna%', key:'torslunda' },
  { refLike:'Stora Hammars I%',   key:'storahammars' },
  { refLike:'Ardre VIII%',        key:'ardre' },
];

try {
  await c.query('BEGIN');
  const ids = {};
  for (const s of SITES) {
    const ex = await one(`select id from heritage_sites where name=$1`, [s.name]);
    ids[s.key] = ex ? ex.id : (await one(
      `insert into heritage_sites (name, raa_type, lat, lng, source_uri) values ($1,$2,$3,$4,$5) returning id`,
      [s.name, s.raa_type, s.lat, s.lng, s.source_uri])).id;
  }
  let repointed = 0;
  for (const r of REPOINT) {
    const res = await c.query(
      `update heraldic_attestations set target='heritage_site', target_id=$1
       where target='external' and target_ref like $2`, [ids[r.key], r.refLike]);
    repointed += res.rowCount;
  }
  console.log(`sites: ${Object.keys(ids).length}, attesteringar ompekade external→heritage_site: ${repointed}`);
  if (APPLY) { await c.query('COMMIT'); console.log('SEEDED (committed).'); }
  else { await c.query('ROLLBACK'); console.log('DRY RUN (rolled back). Kör med --apply.'); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode=1; }
finally { await c.end(); }

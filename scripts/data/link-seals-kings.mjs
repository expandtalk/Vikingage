// Koppla kungliga sigill (coins.category='seal') till historical_kings så de kan renderas på
// kunga-/ättsidor (king → dynasty via historical_kings.dynasty_id). Lägger även till Karl
// Sverkerssons sigill (Sveriges äldsta bevarade sigill, ca 1164–67). Idempotent.
// Kör: node scripts/data/link-seals-kings.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const one = async (sql,p) => (await c.query(sql,p)).rows[0];
const kingId = async n => (await one(`select id from historical_kings where name ilike $1 limit 1`,[n]))?.id;

try {
  await c.query('BEGIN');
  // 1. Länka befintliga kungliga sigill (hoppar stads-sigill: Kalmar/Stockholm = ingen kung)
  const links = [
    ['Magnus Ladulås sigill', 'Magnus Ladulås'],
    ['Magnus Erikssons sigill', 'Magnus Eriksson'],
    ['Albrekt av Mecklenburgs sigill', 'Albrekt av Mecklenburg'],
    ['Karl Knutsson Bondes sigill', 'Karl Knutsson%'],
  ];
  let linked = 0;
  for (const [coinName, kingName] of links) {
    const kid = await kingId(kingName);
    if (!kid) { console.log(`  kung saknas: ${kingName}`); continue; }
    const r = await c.query(`update coins set issuer_king_id=$1 where name=$2 and issuer_king_id is null`, [kid, coinName]);
    linked += r.rowCount;
  }

  // 2. Karl Sverkerssons sigill — lägg till om det saknas (Sveriges äldsta bevarade sigill)
  const ksv = await kingId('Karl Sverkersson');
  let added = 0;
  if (ksv) {
    const exists = await one(`select id from coins where name=$1`, ['Karl Sverkerssons sigill']);
    if (!exists) {
      await c.query(
        `insert into coins (name, name_en, category, issuer, issuer_king_id, metal, period_start, period_end, description, sources)
         values ($1,$2,'seal',$3,$4,null,1164,1167,$5,$6)`,
        ['Karl Sverkerssons sigill', 'Seal of Karl Sverkersson', 'Karl Sverkersson', ksv,
         'Sveriges äldsta bevarade sigill (kungligt), Sverkerska ätten, ca 1164–1167. Sigillbild ej fastställd här — verifiera mot Riksarkivets sigillsamlingar innan ev. vapenattestering.',
         'Riksarkivet, sigillsamlingarna (Karl Sverkerssons sigill, ca 1164–1167)']);
      added = 1;
    }
  }

  if (APPLY) { await c.query('COMMIT'); console.log(`DONE (committed): ${linked} sigill kungakopplade, ${added} nytt sigill (Karl Sverkersson).`); }
  else { await c.query('ROLLBACK'); console.log(`DRY RUN (rolled back): ${linked} sigill skulle kungakopplas, ${added} nytt sigill.`); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode = 1; }
finally { await c.end(); }

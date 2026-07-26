// Applicera en migrations-/SQL-fil mot prod via pooler (INTE `supabase db push`, som
// skapar drift). Kör: node scripts/data/apply-sql.mjs supabase/migrations/<fil>.sql
// Läser SUPABASE_DB_PASSWORD ur ./.env. Kör hela filen i en transaktion.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const sqlPath = process.argv[2];
if (!sqlPath) { console.error('Usage: node scripts/data/apply-sql.mjs <path-to.sql>'); process.exit(1); }
const sql = readFileSync(sqlPath, 'utf8');

const env = Object.fromEntries(
  readFileSync('./.env', 'utf8').split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const client = new pg.Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
  user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
});

await client.connect();
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log(`APPLIED: ${sqlPath}`);
} catch (e) {
  await client.query('ROLLBACK');
  console.error('FAILED (rolled back):', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}

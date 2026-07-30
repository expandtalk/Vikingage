// Applicerar en .sql-fil mot prod-DB via pooler (samma mönster som övriga script).
// Kör: node scripts/data/apply-sql-file.mjs --file supabase/migrations/XXXX.sql
// Kräver SUPABASE_DB_PASSWORD i .env.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => {
  if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1]]); return a;
}, []));
if (!args.file) { console.error('--file krävs'); process.exit(1); }

const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
if (!env.SUPABASE_DB_PASSWORD) { console.error('SUPABASE_DB_PASSWORD saknas i .env'); process.exit(1); }

const sql = readFileSync(args.file, 'utf8');
const client = new pg.Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
  user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
  ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
});
await client.connect();
try {
  await client.query(sql);
  console.log(`Applicerat: ${args.file}`);
} catch (e) { console.error('FEL:', e.message); process.exit(1); }
finally { await client.end(); }

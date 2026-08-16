// Berikar den kurerade Gettlinge gravfält-posten (heritage_sites).
// Belagt via Wikidata Q1551283 (CC0) + Wikipedia/Mörbylånga (som citerar Forslund 2001,
// Nilsson 2005, RAÄ Södra Möckleby 10:1). Modernt Fornsök-L-nr FLAGGAT som overifierat.
// Egen prosa (ej verbatim). Kör: node scripts/data/enrich-gettlinge.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const ID='deae7694-42f0-4a49-8d56-bd820badec79';
const desc = [
'Ett av Ölands största gravfält — sträcker sig nära två kilometer längs öns västra väg mellan Gårdstorp, Gettlinge och Klinta i Södra Möckleby socken.',
'Ursprungligen omkring 250 gravar, varav drygt 200 återstår; flera förstördes genom stenbrott och skattgrävning.',
'De flesta är stensättningar från yngre bronsålder och järnålder; gravfältet brukades i cirka 2000 år, från omkring 1000 f.Kr. till 1050 e.Kr.',
'Norra delen är mest varierad, med resta kalkstenshällar och en cirka 30 meter lång skeppssättning av 23 granitblock med ett tjugotal skålgropar (bronsåldersmotiv som visar att stenar återanvänts).',
'Vid en undersökning omkring 1900 grävdes 15 mansgravar; den bäst bevarade (cirka 100 e.Kr.) innehöll den döde med hund, två spjut, en sköld och sporrar.',
'Platsen dokumenterades av Johannes Haquini Rhezelius (Monumenta runica, 1634), undersöktes av Carl von Linné 1741 och skildrades av Abraham Ahlqvist 1825.',
'Källor: Wikidata Q1551283 (CC0); Wikipedia/Mörbylånga kommun (efter Forslund 2001, Nilsson 2005, RAÄ). RAÄ äldre fornlämningsnr Södra Möckleby 10:1; modernt Fornsök-L-nr ej verifierat.'
].join(' ');
try {
  await c.query('BEGIN');
  const before = (await c.query(`select raa_type,parish,landscape,register_system,register_id from heritage_sites where id=$1`,[ID])).rows[0];
  console.log('FÖRE:', JSON.stringify(before));
  const r = await c.query(
    `update heritage_sites set
       raa_type='gravfält',
       parish='Södra Möckleby',
       landscape='Öland',
       register_system='RAÄ (äldre fornlämningsnr)',
       register_id='Södra Möckleby 10:1',
       description=$2,
       updated_at=now()
     where id=$1 returning raa_type,parish,landscape,register_system,register_id`,
    [ID, desc]);
  console.log('EFTER:', JSON.stringify(r.rows[0]));
  console.log('DESCRIPTION:', desc);
  if (APPLY) { await c.query('COMMIT'); console.log('\n== APPLIED (committed). =='); }
  else { await c.query('ROLLBACK'); console.log('\n== DRY RUN (rollback). Kör med --apply. =='); }
} catch(e){ await c.query('ROLLBACK'); console.error('FAILED (rollback):', e.message); process.exitCode=1; }
finally { await c.end(); }

// Backfill heritage_sites.existence från RAÄ Fornsöks "Antikvarisk bedömning" (K-samsök).
// FMIS-ingesten satte aldrig existence -> ~62k rader står 'unassessed'. Det här fyller dem
// från källan (kulturarvsdata.se), matchat på lämnings-UUID (i source_uri) ELLER lämnings-
// nummer (register_id = idLabel).
//
// HEDERLIGHET: konservativ mappning. BARA de entydiga bedömningarna sätts; allt tvetydigt
// lämnas 'unassessed' (redovisas öppet i UI). Rör aldrig rader som redan är extant/destroyed.
//   Fornlämning -> extant     (lagskyddad, fysiskt närvarande lämning)
//   Borttagen   -> destroyed
//   Möjlig fornlämning / Övrig kulturhistorisk lämning / Uppgift om / Ingen bedömning -> lämnas
//
// Enumererar per LÄN (serviceName=kmr_lamningar AND countyName=X, ~41k för Kalmar) i sidor,
// läser den riktiga bedömningen per post (rdf-schemat), och UPPDATERAR befintliga rader.
//
// Kör per län:  node scripts/data/backfill-fmis-existence.mjs --county=Kalmar [--apply] [--sleep=MS] [--pages=N]
//   --county   län exakt som i K-samsök (Kalmar, Stockholm, "Västra Götaland", Blekinge ...)
//   --apply    skriv (utan flaggan = DRY-RUN, läser & räknar men skriver inget)
//   --pages=N  stanna efter N sidor (för snabbtest)
import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const argv = process.argv.slice(2);
const COUNTY = (argv.find(a => a.startsWith('--county=')) || '').split('=').slice(1).join('=');
const APPLY = argv.includes('--apply');
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) || 700;
const MAXPAGES = Number((argv.find(a => a.startsWith('--pages=')) || '').split('=')[1]) || Infinity;
if (!COUNTY) { console.error('Ange --county=Kalmar (eller Stockholm, "Västra Götaland", Blekinge ...)'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));

// bedömning -> existence (bara entydiga)
const MAP = { 'Fornlämning': 'extant', 'Borttagen': 'destroyed' };
const countyQ = COUNTY.includes(' ') ? `"${COUNTY}"` : COUNTY;

async function ksamsok(start, hits) {
  const query = `serviceName=kmr_lamningar AND countyName=${countyQ}`;
  const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${hits}&startRecord=${start}&recordSchema=rdf&query=${encodeURIComponent(query)}`;
  for (let a = 0; a < 4; a++) {
    try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 200) return r.text(); await sleep(1500 * (a + 1)); }
    catch { await sleep(1000 * (a + 1)); }
  }
  return '';
}

const m1 = (s, re) => { const m = re.exec(s); return m ? m[1].trim() : ''; };
const BEDOM_RE = /Antikvarisk bedömning<\/ksam:type>\s*<ksam:spec[^>]*>([^<]*)<\/ksam:spec>/;

function parseEntity(block) {
  const uuid = m1(block, /rdf:about="http:\/\/kulturarvsdata\.se\/raa\/lamning\/([0-9a-fA-F-]+)"/);
  if (!uuid) return null;
  const idLabel = m1(block, /<pres:idLabel>([^<]*)<\/pres:idLabel>/);
  const existence = MAP[m1(block, BEDOM_RE)];
  if (!existence) return null;               // lämna tvetydiga orörda
  return { uuid, idLabel, existence };
}

const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
await client.connect();

const PER = 100;
const total = Number(m1(await ksamsok(1, 1), /<totalHits>(\d+)</)) || 0;
console.log(`Län ${COUNTY}: ${total} lämningar i K-samsök. Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'} (PER=${PER}, sleep=${SLEEP}ms).`);

let scanned = 0, mapped = 0, updated = 0, page = 0;
const tally = {};
for (let start = 1; start <= total && page < MAXPAGES; start += PER, page++) {
  const xml = await ksamsok(start, PER);
  const blocks = xml.split('<ksam:Entity ').slice(1);
  if (!blocks.length) break;
  for (const b of blocks) {
    scanned++;
    const r = parseEntity(b);
    if (!r) continue;
    mapped++; tally[r.existence] = (tally[r.existence] || 0) + 1;
    if (APPLY) {
      const res = await client.query(
        `update heritage_sites set existence = $1, updated_at = now()
           where existence = 'unassessed'
             and ( source_uri ilike '%' || $2 || '%'
                   or ($3 <> '' and register_id = $3) )`,
        [r.existence, r.uuid, r.idLabel]);
      updated += res.rowCount;
    }
  }
  process.stdout.write(`\r  skannat ${scanned}/${total} · mappade ${mapped} · uppdaterade ${updated}   `);
  await sleep(SLEEP);
}
console.log(`\nKlart. Entydiga bedömningar i urvalet: ${JSON.stringify(tally)}. Rader uppdaterade: ${updated}.`);
if (!APPLY) console.log('DRY-RUN — inget skrevs. Verifiera siffrorna, kör sedan med --apply.');
await client.end();

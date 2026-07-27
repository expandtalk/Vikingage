// Ingest av gotländska medeltidstexter → historical_sources + source_texts (renderas på
// /sources/:id, strof/stycke för stycke). PD (medeltida, Wikisource/Schlyter-edition).
// Gutasagan: forngutniska original, 6 kap. (+ svensk övers. för kap 1-2 ur historia-gotlandia).
// Gutalagen: forngutniska, TOC + kropp → chunkad på kapitelrubriker ("Af X").
// Kör:  node scripts/data/ingest-gotland-texts.mjs            (DRY-RUN, skriver inget)
//       node scripts/data/ingest-gotland-texts.mjs --apply    (skriver till prod)
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const DOCS = 'docs/gotland';

// ---------- Parsning ----------
const saga = readFileSync(`${DOCS}/gutasagan.txt`, 'utf8');
// Kap-split: "1 Kap." … "6 Kap." Footnotes (efter kap 6) kapas: de börjar efter en rad som
// är ren apparat (" Denna berättelse saknas…" eller numrerad). Vi kapar sista kap vid första
// blocket av korta apparat-rader (rad som börjar med mellanslag+versal och är kort, eller "A.").
const sagaChapters = saga.split(/\n(?=\d+\s+Kap\.)/).map(s => s.trim()).filter(Boolean)
  .filter(s => /^\d+\s+Kap\./.test(s))
  .map(s => {
    // ta bort själva rubrikraden ("N Kap.") och trimma
    const body = s.replace(/^\d+\s+Kap\.\s*/, '').trim();
    // kapa ev. trailande footnote-apparat i sista kapitlet (rader efter dubbel blankrad
    // som ser ut som apparat: korta, börjar med " " + versal, "A.", "Schlyt", "För ", "Pro ")
    const cut = body.split(/\n\s*\n\s*\n/)[0]; // apparaten är avskild med ≥2 blankrader
    return cut.trim();
  });

const historia = readFileSync(`${DOCS}/historia-gotlandia.txt`, 'utf8');
// Svensk översättning kap 1-2: de långa svenska styckena (innehåller "och"/"att", svenska tecken,
// inga [ N ]-sidmarkörer i klump). Vi plockar de två längsta svensk-lика styckena.
const svParas = historia.split(/\n\s*\n/).map(p => p.replace(/\[\s*\d+\s*\]/g,'').replace(/\s+/g,' ').trim())
  .filter(p => p.length > 400 && /\b(och|att|som|de|var)\b/.test(p) && !/þ| þ|æ/.test(p.slice(0,200)))
  .filter(p => !/^Fotnoter/.test(p) && !/\b(narrationes|rubricas|Rec\. man|adposuit|marg\.)\b/.test(p))
  .slice(0, 2); // endast kap 1-2 har svensk översättning i historia-gotlandia

const lag = readFileSync(`${DOCS}/gutalagen.txt`, 'utf8');
// Hoppa TOC: kroppen börjar vid ANDRA förekomsten av "Hier byrias" (första är i innehållet).
const lagLines = lag.split(/\r?\n/);
let bodyStart = 0, seenHier = 0;
for (let i = 0; i < lagLines.length; i++) {
  if (/hier byrias/i.test(lagLines[i])) { seenHier++; if (seenHier >= 2) { bodyStart = i; break; } }
}
const lagBody = bodyStart ? lagLines.slice(bodyStart).join('\n') : lag;
// Kroppens kapitelrubriker ligger inte radisolerade → chunka på stycken (dubbel radbrytning).
// Slå ihop mycket korta fragment med föregående stycke så vi inte får en-ords-strofer.
const rawParas = lagBody.split(/\n\s*\n/).map(s => s.replace(/\s+\n/g,'\n').trim()).filter(s => s.length > 0);
const lagChunks = [];
for (const p of rawParas) {
  if (p.length < 60 && lagChunks.length) lagChunks[lagChunks.length - 1] += '\n' + p;
  else lagChunks.push(p);
}

// ---------- Dry-run-rapport ----------
const preview = (arr, label) => {
  console.log(`\n== ${label}: ${arr.length} chunks ==`);
  arr.forEach((c, i) => console.log(`  [${i+1}] ${c.replace(/\s+/g,' ').slice(0, 90)}…`));
};
preview(sagaChapters, 'GUTASAGAN (kap)');
console.log(`\n== SVENSK ÖVERS. (historia-gotlandia): ${svParas.length} stycken ==`);
svParas.forEach((p,i)=>console.log(`  [${i+1}] ${p.slice(0,90)}…`));
preview(lagChunks, 'GUTALAGEN (kapitel)');

if (!APPLY) { console.log('\n(DRY-RUN — inget skrivet. Kör med --apply för att skriva till prod.)'); process.exit(0); }

// ---------- Skrivning ----------
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/)
  .filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const client = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await client.connect();

const upsertSource = async (title, title_en, work_type, desc, descEn) => {
  const found = await client.query(`select id from historical_sources where title=$1 limit 1`, [title]);
  if (found.rows[0]) return found.rows[0].id;
  const r = await client.query(
    `insert into historical_sources (title, title_en, author, written_year, covers_period_start, covers_period_end,
       reliability, language, kind, description, work_type, collection)
     values ($1,$2,$3,$4,$5,$6,$7,$8,'publication',$9,$10,$11) returning id`,
    [title, title_en, 'Anonym (medeltida gutnisk)', 1220, 900, 1350, 'primary',
     'Forngutniska (fornnordiska)', desc, descEn, 'Sveriges Gamla Lagar / Wikisource (public domain)']);
  return r.rows[0].id;
};

const clean = (s) => s ? s.replace(/\[\s*\d+\s*\]/g, '').replace(/[ \t]{2,}/g, ' ').replace(/ +\n/g, '\n').trim() : s;
const insertText = async (sourceId, stanza, norse, sv) => {
  await client.query(
    `insert into source_texts (source_id, stanza_no, original_norse, translation_sv)
     select $1,$2,$3,$4 where not exists (select 1 from source_texts where source_id=$1 and stanza_no=$2)`,
    [sourceId, stanza, clean(norse), clean(sv)]);
};

try {
  await client.query('BEGIN');
  const sagaId = await upsertSource('Gutasagan', 'Guta Saga', 'saga',
    'Forngutnisk berättelse (1200-tal) om Gotlands upptäckt, utvandring och kristnande. Bevarad i handskriften till Gutalagen.',
    'Old Gutnish narrative (13th c.) on the discovery, emigration and Christianisation of Gotland, preserved with the Guta Law.');
  for (let i=0;i<sagaChapters.length;i++) await insertText(sagaId, i+1, sagaChapters[i], svParas[i] ?? null);

  const lagId = await upsertSource('Gutalagen', 'Guta Law', 'lag',
    'Gotlands medeltida landskapslag på forngutniska (nedtecknad ca 1220), en av de äldsta bevarade nordiska lagarna.',
    "Gotland's medieval provincial law in Old Gutnish (written down c. 1220), one of the oldest surviving Nordic laws.");
  for (let i=0;i<lagChunks.length;i++) await insertText(lagId, i+1, lagChunks[i], null);

  await client.query('COMMIT');
  console.log(`APPLIED: Gutasagan (${sagaChapters.length} kap, ${svParas.length} sv-övers) + Gutalagen (${lagChunks.length} avsnitt)`);
} catch (e) { await client.query('ROLLBACK'); console.error('FAILED (rollback):', e.message); process.exitCode=1; }
finally { await client.end(); }

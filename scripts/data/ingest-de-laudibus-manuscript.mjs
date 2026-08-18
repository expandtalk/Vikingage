// Ingest av Hrabanus Maurus, De laudibus sanctae crucis (814) — carmina figurata-blad + ett bevarat
// exemplar (Bern, Burgerbibliothek Cod. 9), PD via Wikimedia Commons (deterministiskt via API,
// verkliga URL:er). subject_type='manuscript' i historical_depictions → bildarkivsfacett "Manuskript".
// Proveniens berikad med Birka-kopplingen (Trotzig, Fornvännen 120, 2025: Kristusbilden förebild för
// Birkakrucifixet). Verket registreras även i historical_sources (/texter). Drottning Kristinas
// exemplar (BAV Reg. lat. 124) länkas ut, rehostas ej. DRY som standard; --apply skriver.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const UA = { 'User-Agent': 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)' };
const commonsPage = (title) => 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(title.replace(/ /g, '_'));

async function search(q) {
  const out = [];
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  u.search = new URLSearchParams({ action: 'query', format: 'json', generator: 'search', gsrsearch: q, gsrnamespace: '6', gsrlimit: '100', prop: 'imageinfo', iiprop: 'url|extmetadata', iiextmetadatafilter: 'LicenseShortName' }).toString();
  const j = await (await fetch(u, { headers: UA })).json();
  for (const p of Object.values(j?.query?.pages || {})) {
    const ii = p.imageinfo?.[0];
    if (ii?.url) out.push({ title: p.title.replace(/^File:/, ''), url: ii.url.split('?')[0], lic: ii.extmetadata?.LicenseShortName?.value || null });
  }
  return out;
}

const NOTE = 'De laudibus sanctae crucis (Till det heliga korsets ära), Hrabanus (Raban) Maurus, 814 — '
  + 'karolingisk hyllningsskrift till kejsar Ludvig den fromme, med carmina figurata: huvudtexten döljs '
  + 'i ett virrvarr av bokstäver som även täcker illustrationerna (bl.a. en Kristusbild utan synligt kors '
  + 'och en bild av kejsaren). Fick stor spridning via avskrifter; flera exemplar bevarade — drottning '
  + 'Kristinas i Vatikanbiblioteket (BAV, Reg. lat. 124), ett i Bern, Burgerbibliothek Cod. 9. Enligt '
  + 'Gustaf Trotzig (Fornvännen 120, 2025) var Kristusbilden förebild för Birkakrucifixet (grav 660) och '
  + 'flera kors-/sköldhängen i Birka. Bild: public domain (Wikimedia Commons); verket PD (Hrabanus d. 856).';

// 1) hämta blad
const plates = (await search('intitle:"De laudibus sanctae crucis"'));
const bern = (await search('intitle:"Cod. 9" Hrabanus Laudibus')).filter(f => /f\.?\s*\d+[rv]/i.test(f.title) || /Kristusbild|Christ/i.test(f.title));
const seen = new Set();
const files = [...plates, ...bern].filter(f => {
  if (seen.has(f.url)) return false; seen.add(f.url);
  if (/Dialogus/i.test(f.title)) return false; // annat verk (1100-tal), ej Hrabanus carmina figurata
  return /^(Public domain|PD|CC0|CC BY)/i.test(f.lic || '');
});
console.log(`Commons: ${plates.length} "De laudibus"-blad + ${bern.length} Bern Cod.9 = ${files.length} fria unika`);
files.slice(0, 25).forEach(f => console.log(`  [${f.lic}] ${f.title}`));

const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 120000 });
await c.connect();

let ins = 0;
if (APPLY) {
  for (const f of files) {
    const lic = /cc0/i.test(f.lic) ? 'CC0' : /cc by/i.test(f.lic) ? 'CC-BY' : 'PD';
    const r = await c.query(`insert into public.historical_depictions
      (subject_type,title,place_name,image_url,artist,work_ref,year,license_code,source_institution,source_url,note)
      values ('manuscript',$1,null,$2,'Hrabanus Maurus','De laudibus sanctae crucis (814)','814',$3,'Wikimedia Commons',$4,$5)
      on conflict (image_url) do nothing`,
      [f.title.replace(/\.(png|jpg|jpeg|gif|tif|tiff)$/i, ''), f.url, lic, commonsPage(f.title), NOTE]);
    ins += r.rowCount;
  }
  // 2) registrera verket som källa på /texter (historical_sources) om ej redan
  const exists = (await c.query(`select 1 from historical_sources where title='De laudibus sanctae crucis' and written_year=814 limit 1`)).rows[0];
  if (!exists) {
    await c.query(`insert into historical_sources
      (title,title_en,author,written_year,covers_period_start,covers_period_end,work_type,kind,rights,reliability,language,peer_reviewed,repository,url,description)
      values ($1,$2,$3,814,800,900,'manuscript','publication','public_domain','primary','la',false,$4,$5,$6)`,
      ['De laudibus sanctae crucis', 'In Praise of the Holy Cross', 'Hrabanus Maurus (Rabanus Maurus / Raban Maur)',
       'Biblioteca Apostolica Vaticana (Reg. lat. 124, drottning Kristinas exemplar); Bern, Burgerbibliothek Cod. 9',
       'https://digi.vatlib.it/view/MSS_Reg.lat.124', NOTE]);
    console.log('historical_sources: De laudibus registrerad på /texter');
  } else console.log('historical_sources: De laudibus fanns redan');
}
console.log(`\n=== ${APPLY ? 'APPLAT' : 'DRY'} ===  manuscript-bilder ${APPLY ? 'inlagda' : 'att lägga'}: ${APPLY ? ins : files.length}`);
if (!APPLY) console.log('Kör med --apply.');
await c.end();

// Hero (a) — BREDDA historiemålningarna automatiskt ur Wikidata: målningar av kända svenska
// historiemålare vars upphovsman dog för >70 år sedan (→ PD, PD-Art även för fotot av 2D-verket).
// match_terms byggs ur vad målningen AVBILDAR (P180) så fler kungar/händelser får en hero-bild.
// Hotlänk till Commons (Special:FilePath), aldrig rehost. Källkritik-caveat följer med.
// Kör: node scripts/data/ingest-history-paintings-wikidata.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const UA='VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const APPLY=process.argv.includes('--apply');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const env=Object.fromEntries(readFileSync(new URL('../../.env',import.meta.url),'utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const wd=async q=>{for(let a=0;a<5;a++){const r=await fetch('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(q),{headers:{'User-Agent':UA,Accept:'application/sparql-results+json'}});if(r.status===200)return (await r.json()).results.bindings;console.log('  WDQS',r.status,'retry');await sleep(7000);}throw new Error('WDQS gav upp');};
const BASE='1800-talets historiemåleri — konstnärlig tolkning, inte en historisk källa. Ofta romantiserad; dräkt, miljö och detaljer kan vara anakronistiska.';

// Kända svenska historiemålare (PD). Resolvas till QID via svenskt namn + yrke målare.
const PAINTERS=['Gustaf Cederström','Carl Gustaf Hellqvist','Georg von Rosen','Nils Forsberg','August Malmström','Mårten Eskil Winge','Johan Fredrik Höckert','Johan Gustaf Sandberg','Carl Wahlbom','Gustaf Olof Cederström','Nils Jakob Blommér','Julius Kronberg'];

const painterVals=PAINTERS.map(n=>`"${n}"@sv`).join(' ');
const painters=await wd(`SELECT DISTINCT ?p WHERE { VALUES ?n { ${painterVals} } ?p rdfs:label ?n; wdt:P106 wd:Q1028181. }`);
const pids=painters.map(b=>'wd:'+b.p.value.split('/').pop());
console.log('målare resolvade:',pids.length);

// Målningar av dessa, upphovsman död ≤1955 (PD), med bild + minst ett avbildat motiv.
const q=`SELECT ?w ?wLabel ?creatorLabel ?death ?inception ?img (GROUP_CONCAT(DISTINCT ?dep;separator=" | ") AS ?deps) WHERE {
 VALUES ?creator { ${pids.join(' ')} }
 ?w wdt:P31 wd:Q3305213; wdt:P170 ?creator; wdt:P18 ?img.
 ?creator wdt:P570 ?dth. BIND(YEAR(?dth) AS ?death) FILTER(?death <= 1955)
 ?w rdfs:label ?wLabel FILTER(lang(?wLabel)="sv").
 ?creator rdfs:label ?creatorLabel FILTER(lang(?creatorLabel)="sv").
 OPTIONAL{?w wdt:P571 ?inc. BIND(YEAR(?inc) AS ?inception)}
 OPTIONAL{?w wdt:P180 ?d. ?d rdfs:label ?dep FILTER(lang(?dep)="sv")}
} GROUP BY ?w ?wLabel ?creatorLabel ?death ?inception ?img ORDER BY ?creatorLabel LIMIT 500`;
const rows=await wd(q);
console.log('målningar (PD, m. bild):',rows.length);

const recs=rows.map(r=>{const g=k=>r[k]?.value??null;const file=decodeURIComponent((g('img').split('/').pop()||''));const deps=(g('deps')||'').split(' | ').filter(Boolean);
 return{qid:g('w').split('/').pop(),title:g('wLabel'),artist:g('creatorLabel'),death:+g('death')||null,year:+g('inception')||null,
   image_url:'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(file)+'?width=1200',
   descr_url:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(file),
   match:[g('wLabel'),...deps].filter(Boolean), persons:deps};
}).filter(r=>r.match.length>1); // kräver minst ett avbildat motiv utöver titeln

console.log(`\n=== ${recs.length} målningar att lägga till (dedup på image_url) ===`);
recs.slice(0,12).forEach(r=>console.log(`  ${r.title} — ${r.artist} (${r.year||'?'}) → ${r.persons.slice(0,3).join(', ')}`));
if(!APPLY){console.log('\nDRY-RUN — kör med --apply.');process.exit(0);}
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();let ins=0;
for(const r of recs){const res=await c.query(
 `INSERT INTO public.history_paintings (wikidata_id,title,artist,artist_death_year,year,image_url,descr_url,license_code,license_url,depicts_persons,depicts_event,match_terms,caveat,source_institution)
  SELECT $1,$2,$3,$4,$5,$6,$7,'PD','https://creativecommons.org/publicdomain/mark/1.0/',$8,NULL,$9,$10,'Wikimedia Commons'
  WHERE NOT EXISTS (SELECT 1 FROM public.history_paintings WHERE wikidata_id=$1 OR image_url=$6)`,
 [r.qid,r.title,r.artist,r.death,r.year,r.image_url,r.descr_url,r.persons,r.match,BASE]);ins+=res.rowCount;}
await c.end();
console.log(`✅ APPLY: ${ins} nya målningar.`);

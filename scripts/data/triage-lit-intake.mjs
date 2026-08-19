// Triage av lit_intake (regelbaserat, ingen LLM): relevans = nordisk geografi + periodrelevans +
// disciplin-signal + bevakad tidskrift; klassar disciplin (kopplar mot agentflottan) och sätter status.
// Nordisk anknytning KRÄVS för 'relevant' (annars 'peripheral' — t.ex. "Mesolithic Malta"). Idempotent.
// Kör: node scripts/data/triage-lit-intake.mjs
import fs from 'fs'; import pg from 'pg';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const c = new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
await c.query(`alter table lit_intake add column if not exists discipline text`);
const journals = new Set((await c.query(`select lower(name) n from lit_journals`)).rows.map(r=>r.n));
const GEO=['scandinav','sweden','swedish','norway','norwegian','denmark','danish','finland','baltic','öland','oland','gotland','uppland','birka','viking','norse','nordic','fennoscand','sápmi','sami'];
const PERIOD=['viking','medieval','middle ages','iron age','bronze age','mesolithic','neolithic','stone age','roman period','roman iron','migration period','vendel','merovingian'];
const DISC={
 arkeogenetiker:['ancient dna','adna','palaeogenom','paleogenom','genome','haplogroup','kinship','admixture','population genomic','archaeogenetic'],
 arkeometri:['isotope','strontium','radiocarbon','provenance','collagen','proteomic','biomolecular','δ13c','δ15n'],
 'ekonomisk-historiker':['coin','hoard','solidus','bracteate','numismatic',' mint','denar','silver hoard'],
 runolog:['rune','runic','runestone','runinskrift','futhark'],
 osteolog:['skeleton','osteolog','dental','cremation','perimortem',' mni ','palaeopatholog'],
 marinarkeolog:['shipwreck','maritime','harbour','harbor','seafaring','boat grave','ship burial'],
 historiker:['charter','chronicle','manuscript','diplomat','medieval document'],
 arkeolog:['settlement','excavation','burial','grave','hillfort','artefact','pottery','archaeolog'],
};
const rows=(await c.query(`select id,title,abstract,concepts,journal,matched_query from lit_intake`)).rows;
const cnt=(t,arr)=>arr.reduce((n,k)=>n+(t.includes(k)?1:0),0);
let rel=0, per=0; const byDisc={};
for (const r of rows) {
  const t=`${r.title||''} ${r.abstract||''} ${(r.concepts||[]).join(' ')} ${r.journal||''}`.toLowerCase();
  const geo=cnt(t,GEO), period=cnt(t,PERIOD);
  let disc=null, best=0;
  for (const [d,ks] of Object.entries(DISC)) { const s=cnt(t,ks); if (s>best){best=s;disc=d;} }
  const jb = r.journal && journals.has(r.journal.toLowerCase()) ? 40 : 0;
  const score = Math.min(geo,3)*10 + Math.min(period,3)*6 + Math.min(best,3)*5 + jb;
  const status = (geo>=1 || jb>0) && (period>=1 || best>0) ? 'relevant' : (geo>=1?'peripheral':'off_topic');
  await c.query(`update lit_intake set relevance=$1, discipline=$2, status=$3 where id=$4`,[score, disc, status, r.id]);
  if (status==='relevant'){rel++; byDisc[disc||'?']=(byDisc[disc||'?']||0)+1;} else if(status==='peripheral') per++;
}
console.log(`triage klar: ${rel} relevanta, ${per} perifera, ${rows.length-rel-per} off-topic (av ${rows.length}).`);
console.log('relevanta per disciplin:', Object.entries(byDisc).sort((a,b)=>b[1]-a[1]).map(([d,n])=>`${d} ${n}`).join(' · '));
console.log('\nTopp 8 relevanta:');
console.log((await c.query(`select round(relevance) r, discipline, journal, left(title,60) t, publication_date from lit_intake where status='relevant' order by relevance desc, publication_date desc limit 8`)).rows.map(x=>`  [${x.r} ${x.discipline||'—'}] ${x.t} — ${x.journal||'?'} (${x.publication_date})`).join('\n'));
await c.end();

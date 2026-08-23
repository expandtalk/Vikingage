// Data-städ + berikning av name_authority (axel 3 korrekt + tidslinje över korpusar).
// 1) fixa fold-PREFIX-bugg → exakt fold-match för on_runestone
// 2) städa parsnings-skräp (tokeniseringsfel ur carvers)
// 3) rätta Estrid meaning
// 4) SDHK-tidslinje: ordgräns+versal, engångsscan av 44k regester (medeltid 1100–1550)
// 5) persons.birth_year: tidigaste notabla bärare (fyller 1530–1900 glest)
// 6) räkna om swedish_usage_layer + first_attestation_year/source ur alla korpusar
import pg from 'pg';import {readFileSync} from 'node:fs';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:300000});
await c.connect();const q=async(t,p)=>(await c.query(t,p)).rows;
const fold=s=>(s||'').toLowerCase().trim().replace(/å|ä|æ/g,'a').replace(/ö|ø|ǫ/g,'o').replace(/[éè]/g,'e').replace(/ü/g,'u').replace(/þ/g,'th').replace(/ð/g,'d');
const firstTok=s=>(s||'').trim().split(/[\s,]+/)[0]||'';

// 2/3) städa skräp + Estrid FÖRST
const JUNK=['imitation','tidigare','troligen','antagligen','eventuellt','förmodligen','samma',"'samma",'tillsammans','okänd','anonym','kung','magister','nase','ovan','visar','ers','samt','osäker'];
const del=await q(`delete from name_authority where lower(canonical)=any($1) or canonical like '-%' or canonical like '''%' or length(canonical)<2 returning canonical`,[JUNK]);
console.log(`Städat ${del.length} skräp-poster:`, del.slice(0,20).map(r=>r.canonical).join(', '));
await q(`update name_authority set meaning='gudaskön' where lower(canonical)='estrid'`);

// ladda namn-set
const names=await q(`select id, canonical from name_authority`);
const byLower=new Map(); for(const r of names) byLower.set(r.canonical.toLowerCase(), r);
console.log(`Namn i name_authority: ${names.length}`);

// 1) exakt fold-match on_runestone
const rune=new Map(); // exakt fold_key → max n
for(const r of await q(`select fold_key, max(n_inscriptions) n from runic_name_attestations group by fold_key`)){
  rune.set(r.fold_key, r.n||0);
}
// även exakt name_form-lemma (t.ex. "Karl")
const runeForms=new Set((await q(`select distinct lower(name_form) nf from runic_name_attestations`)).map(r=>r.nf));

// 4) SDHK engångsscan (medeltid), ordgräns via tokenisering, endast VERSALstartade tokens
const sdhkFirst=new Map(), sdhkCount=new Map();
const charters=await q(`select lr.sdhk_id, cy.nominal_year y, lr.summary s
   from sdhk.letters_raw lr join sdhk.charter_year cy on cy.sdhk_id=lr.sdhk_id
   where cy.nominal_year between 1100 and 1550 and lr.summary is not null`);
console.log(`SDHK-brev (medeltid m. regest): ${charters.length}`);
for(const ch of charters){
  const seen=new Set();
  for(const tok of ch.s.split(/[^A-Za-zÅÄÖåäöüéèøæ]+/)){
    if(!tok || !/^[A-ZÅÄÖ]/.test(tok)) continue;      // endast versal-start (namn), ej gemena vardagsord
    const k=tok.toLowerCase();
    if(byLower.has(k) && !seen.has(k)){
      seen.add(k);
      sdhkCount.set(k,(sdhkCount.get(k)||0)+1);
      const f=sdhkFirst.get(k); if(f==null||ch.y<f) sdhkFirst.set(k,ch.y);
    }
  }
}

// 5) persons.birth_year — tidigaste bärare (förnamnstoken)
const personsFirst=new Map();
for(const r of await q(`select name, birth_year from persons where birth_year is not null`)){
  const k=firstTok(r.name).toLowerCase();
  if(byLower.has(k)){ const f=personsFirst.get(k); if(f==null||r.birth_year<f) personsFirst.set(k,r.birth_year); }
}

// 6) räkna om + bulk-update
let onRun=0, med=0, aldre=0, mod=0, obel=0;
let done=0;
for(const r of names){
  const k=r.canonical.toLowerCase(); const f=fold(r.canonical);
  const rn = rune.has(f)?rune.get(f) : (runeForms.has(k)?1:null);
  const on_run = rn!=null;
  const sf=sdhkFirst.get(k)||null, sc=sdhkCount.get(k)||null;
  const pf=personsFirst.get(k)||null;
  const inMod=(await Promise.resolve(true)); // modern_birth_count redan i tabellen; läses ej om här
  let layer, faYear=null, faSrc=null;
  if(on_run){ layer='runsvenskt (belagt vikingatid)'; faSrc='runsten'; onRun++; }
  else if(sf){ layer='medeltida (SDHK-belägg)'; faYear=sf; faSrc='SDHK'; med++; }
  else if(pf!=null && pf<1900){ layer='äldre belägg (personregister)'; faYear=pf; faSrc='persons'; aldre++; }
  else { layer=null; } // sätts nedan mot modern_birth_count
  await q(`update name_authority set
     on_runestone=$2, runestone_inscriptions=$3, sdhk_first_year=$4, sdhk_charter_count=$5, persons_first_year=$6,
     swedish_usage_layer = case
        when $7::text is not null then $7::text
        when modern_birth_count is not null then 'endast modernt belägg'
        else 'obelagt i våra korpusar' end,
     first_attestation_year=$8, first_attestation_source=$9, updated_at=now()
   where id=$1`,[r.id, on_run, rn, sf, sc, pf, layer, faYear, faSrc]);
  if(layer===null){ /* modern eller obelagt räknas via query nedan */ }
  done++; if(done%500===0) process.stdout.write(`\r  update ${done}/${names.length}`);
}
console.log(`\nKLART. Lagerfördelning:`);
console.log(JSON.stringify(await q(`select swedish_usage_layer, count(*)::int n from name_authority group by 1 order by 2 desc`)));
console.log('\n=== stickprov (bugg-kandidater + kärnnamn) ===');
console.log(JSON.stringify(await q(`select canonical,swedish_usage_layer layer,on_runestone onrun,sdhk_first_year sdhk,persons_first_year pf,first_attestation_year fa,first_attestation_source src from name_authority where lower(canonical) in ('daniel','anna','erik','sven','björn','karl','alma','thor','max','david','adam','gustav') order by canonical`),null,1));
await c.end();

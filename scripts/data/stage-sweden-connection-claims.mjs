// Stagear Sverige-kopplings-claims (ur historiker-dossiéerna) i place_claim — FÖRSLAG, ej kanon.
// subjekt = känd person (entity_id), value_text = objektets QID (strukturerad pekare för senare
// befordran till relationship-edge efter verifierare). Status/konfidens/källa per dossié.
// Idempotent: rensar claim_key like 'swconn_%' och skriver om. Befordras ALDRIG autonomt till relationship.
import pg from 'pg';import {readFileSync} from 'node:fs';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(t,p)=>(await c.query(t,p)).rows;

// QID → person id
const qids=['Q47906','Q352','Q8016','Q259176','Q955847','Q154759','Q707785','Q865173'];
const id={};for(const r of await q(`select wikidata_qid,id from persons where wikidata_qid=any($1)`,[qids]))id[r.wikidata_qid]=r.id;
const need=qids.filter(x=>!id[x]);if(need.length){console.log('SAKNAS i persons:',need.join(', '),'— avbryter');await c.end();process.exit(1);}

const METHOD='historiker-agent: Sverige-koppling-dossié (aug 2026)';
// {key, subj, objQid|objText, statement, value_text, source, conf, status, note, polarity}
const CLAIMS=[
 // GÖRING
 {key:'swconn_goring_carin', subj:'Q47906', objQid:'Q259176', rel:'gift_med',
  statement:'Gift 1923 med Carin (född Fock, tidigare gift von Kantzow).',
  source:'Carin Göring (Wikipedia); Fontander, Görings Sverige', conf:'0.9', status:'needs_verification',
  note:'Vigseldatum ej entydigt (3 vs 25 jan 1923; Stockholm vs München).'},
 {key:'swconn_goring_vonrosen', subj:'Q47906', objQid:'Q955847', rel:'svager_till',
  statement:'Svåger till greve Eric von Rosen (Görings hustru Carins syster Mary var gift med von Rosen); mötte Carin på von Rosens Rockelstad 1920.',
  source:'Carin Göring (Wikipedia); Rockelstad slotts historik; Svensk Lufttrafik (Wikipedia)', conf:'0.9', status:'needs_verification',
  note:'Rockelstad-flygningen 20 vs 21 feb 1920 (ej avgjort). Objekt Rockelstad ej strukturerad plats-entitet än.'},
 {key:'swconn_goring_langbro', subj:'Q47906', objText:'Långbro sjukhus / Aspuddens sjukhem', rel:'vardad_vid',
  statement:'Vårdades i Stockholm 1925–1927 för opioidberoende (Eucodal) — Aspuddens sjukhem aug 1925, därefter Långbro sjukhus.',
  source:'Regionarkivet Stockholm (Görings sjukjournaler, primärnära); Långbro sjukhus (Wikipedia)', conf:'0.85', status:'needs_verification',
  note:'Aspudden-året 1924 vs 1925 (Regionarkivet=1925). Plats-entiteter ännu ej i KG.'},
 {key:'swconn_goring_pilot', subj:'Q47906', objText:'Svensk Lufttrafik AB', rel:'pilot_i_sverige',
  statement:'Verksam som pilot i Sverige första halvåret 1920, knuten till Svensk Lufttrafik.',
  source:'Svensk Lufttrafik (Wikipedia)', conf:'0.8', status:'needs_verification',
  note:'Svensk Lufttrafiks första flygning anges 7 aug 1920 — arbetsgivare för februariflygningen bör redas ut.'},
 {key:'swconn_goring_kalmar', subj:'Q47906', objText:'Kalmar (flyghamn, linjen Stockholm–Berlin)', rel:'mellanlandade',
  statement:'Mellanlandade som passagerare i Kalmar på linjen Stockholm–Berlin, ca 1929.',
  source:'Barometern 2014-10-25', conf:'0.5', status:'disputed',
  note:'MYT-VAKT: att Göring själv flög Kalmar-etappen är OBELAGT (källan säger bara att han "gärna ville"; foto "sägs visa" = ej belägg). Endast passagerare styrkt.'},
 // HITLER
 {key:'swconn_hitler_hedin', subj:'Q352', objQid:'Q154759', rel:'traffade_korresponderade',
  statement:'Träffade Sven Hedin personligen vid upprepade tillfällen på 1930-talet och stod i korrespondens; Hedin höll tal vid OS 1936.',
  source:'Sven Hedin, Utan uppdrag i Berlin (Fahlcrantz & Gumælius 1949, 291 s); Danielsson 2012; USHMM', conf:'0.85', status:'needs_verification',
  note:'Hedins hållning: protysk men vädjade om lindrigare politik; Danielsson visar samtidigt hans egen antisemitism — balanseras.'},
 {key:'swconn_hitler_vonrosen', subj:'Q352', objQid:'Q955847', rel:'indirekt_via_goring',
  statement:'Ingen dokumenterad direkt kontakt mellan Hitler och Eric von Rosen; kopplingen går indirekt via svågern Göring.',
  source:'Eric von Rosen (Wikipedia) — saknar Hitler-belägg', conf:'0.3', status:'unpublished_hypothesis', polarity:'negative',
  note:'NEGATIV EVIDENS ≠ motbevis. Kräver riktad arkivsökning för att uppgradera till "belagt: inget möte".'},
 {key:'swconn_hitler_dahlerus', subj:'Q352', objQid:'Q707785', rel:'traffade',
  statement:'Träffade Birger Dahlerus, Görings svenske vän, som hemlig mellanhand Berlin–London aug–sep 1939.',
  source:'Birger Dahlerus, Sista försöket (1948); Nürnberg-protokollet 19 mars 1946', conf:'0.85', status:'needs_verification',
  note:null},
 // CHURCHILL
 {key:'swconn_churchill_nerman', subj:'Q8016', objQid:'Q865173', rel:'nobelnominerad_av',
  statement:'Nominerades till Nobelpriset i litteratur 1953 (tilldelat av Svenska Akademien) av akademiledamoten och arkeologen Birger Nerman.',
  source:'Nobelprize.org (litteratur 1953); International Churchill Society', conf:'0.85', status:'needs_verification',
  note:'Nerman-nomineringen bör dubbelkollas mot Akademiens nomineringsarkiv.'},
 {key:'swconn_churchill_malm', subj:'Q8016', objText:'svensk järnmalm / Narvik / Gällivare–Kiruna', rel:'strategiskt_mal',
  statement:'Drev 1939–40 att strypa den svenska järnmalmen till Tyskland: minering av Narvikleden (Operation Wilfred) och planer att ockupera malmfälten (Plan R4/Stratford); även Östersjöflotta (Catherine) mot Luleå/Oxelösund.',
  source:'Churchills kabinettsmemo dec 1939; Operation Wilfred / Plan R4 (Wikipedia); historyofwar.org', conf:'0.85', status:'needs_verification',
  note:'Mål = malm-LEDEN och OCKUPATION, ej sprängning av gruvorna. Memo-datum 16 vs 31 dec 1939 (verifiera mot CAB-serien). Plats-entiteter ej i KG än.'},
 {key:'swconn_churchill_oxelosund', subj:'Q8016', objText:'Oxelösunds hamn (Rickman-komplotten)', rel:'tillskriven_myt',
  statement:'Folkminnets "Churchill ville spränga [svenskt]" härrör från sabotageplanen mot Oxelösunds hamn (Rickman/brittiska Section D, gripna april 1940).',
  source:'Stockholmskällan (förhör 1940); The Historical Journal (Cambridge)', conf:'0.2', status:'disputed', polarity:'negative',
  note:'MYT-VAKT: Section D låg under SIS, inte Churchills amiralitet. Churchills PERSONliga inblandning är OBELAGT — får ej framställas som faktum.'},
];

try{
  await c.query('BEGIN');
  // registrera attribut-vokabulär (medveten utökning, idempotent)
  await c.query(`insert into place_claim_attribute (attribute,claim_type,description)
    values ('sweden_connection','relation','Belagd/hypotetisk koppling mellan (ofta internationell) person och Sverige/svenska entiteter. Dossié-staging; befordras till relationship-edge efter verifierare.')
    on conflict (attribute) do nothing`);
  await c.query(`delete from place_claim where claim_key like 'swconn_%'`);
  let n=0;
  for(const cl of CLAIMS){
    const value_text = cl.objQid || cl.objText || null;
    await c.query(
     `insert into place_claim (claim_key,entity_type,entity_id,attribute,statement,value_text,source_locator,confidence,verification_status,created_by_method,proposed_by_agent,machine_verifiable,note,evidence_polarity)
      values ($1,'person',$2,'sweden_connection',$3,$4,$5,$6,$7,$8,'historiker',false,$9,$10)`,
     [cl.key, id[cl.subj], cl.statement, `${cl.rel} → ${value_text}`, cl.source, cl.conf, cl.status, METHOD, cl.note, cl.polarity||null]);
    n++;
  }
  await c.query('COMMIT');
  console.log(`KLART — stageade ${n} kopplings-claims i place_claim (claim_key swconn_*).`);
}catch(e){await c.query('ROLLBACK');console.error('FEL (rollback):',e.message);process.exitCode=1;}

console.log('\n=== staging-översikt ===');
console.log(JSON.stringify(await q(`
  select p.name as subject, pc.verification_status status, pc.confidence conf, pc.value_text as relation_obj, left(pc.statement,60) stmt
  from place_claim pc join persons p on p.id=pc.entity_id
  where pc.claim_key like 'swconn_%' order by p.name, pc.verification_status`),null,1));
await c.end();

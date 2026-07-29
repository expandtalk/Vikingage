// Korp/Oden — förkristen symbolvärld (BROTT-exemplen) + primärkällor + Kalmar-sigillets precisering.
// Copyright: endast FAKTA + bibliografiska citat; ingen klistrad prosa. Koordinat-disciplin: objekten
// (Torslundaplåtarna, bildstenarna) kopplas via target='external' + källhänvisning — inga fabricerade koord.
// INGA derives_from-kanter till heraldiska motiv (nordisk symbolvärld ärvdes EJ in — brott-regeln).
// Kör: node scripts/data/seed-oden-korp-sources.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:120000});
await c.connect();
const one = async (sql,p) => (await c.query(sql,p)).rows[0];

// (title, author, reliability, kind, rights) — primärtext=public_domain; modern forskning=copyrighted (endast metadata lagras)
const SOURCES = [
  ['Anglo-Saxon Chronicle, s.a. 878 (ed. Swanton 1996)','Anon.; ed. Swanton, M.','primary','publication','public_domain'],
  ['Annals of St Neots (ed. Dumville & Lapidge 1985)','ed. Dumville, D. & Lapidge, M.','secondary','publication','public_domain'],
  ['Orkneyinga saga (ed. Finnbogi Guðmundsson 1965, ÍF XXXIV)','ed. Finnbogi Guðmundsson','secondary','publication','public_domain'],
  ['Brennu-Njáls saga (ed. Einar Ól. Sveinsson 1954, ÍF XII)','ed. Einar Ól. Sveinsson','secondary','publication','public_domain'],
  ['Snorri Sturluson, Heimskringla III: Haralds saga Sigurðarsonar (ed. Bjarni Aðalbjarnarson 1951)','Snorri Sturluson','secondary','publication','public_domain'],
  ['Eddukvæði (Völuspá 24; Grímnismál 20)','Anon.','secondary','publication','public_domain'],
  ['Snorri Sturluson, Edda: Gylfaginning 38; Skáldskaparmál (ed. Faulkes)','Snorri Sturluson','secondary','publication','public_domain'],
  ['Blackburn, M. (2004): The Coinage of Scandinavian York','Blackburn, M.','secondary','publication','copyrighted'],
  ['Arrhenius, B. & Freij, H. (1992): Pressbleck Fragments … Laser Scanner, Laborativ Arkeologi 6','Arrhenius, B. & Freij, H.','primary','publication','copyrighted'],
  ['Price, N. (2002): The Viking Way. Aun 31','Price, N.','secondary','publication','copyrighted'],
  ['Price, N. & Mortimer, P. (2014): An Eye for Odin? EJA 17(3)','Price, N. & Mortimer, P.','secondary','publication','copyrighted'],
  ['Lindqvist, S. (1941–42): Gotlands Bildsteine I–II','Lindqvist, S.','secondary','publication','copyrighted'],
  ['Oehrl, S. (2019): Die Bildsteine Gotlands','Oehrl, S.','secondary','publication','copyrighted'],
  ['Hellers, T. (2012): Valknútr — Das Dreiecksymbol der Wikingerzeit','Hellers, T.','secondary','publication','copyrighted'],
  ['Jesch, J. (2001): Ships and Men in the Late Viking Age','Jesch, J.','secondary','publication','copyrighted'],
  ['Hagberg, U.E. (1976): Fundort und Fundgebiet der Modeln aus Torslunda','Hagberg, U.E.','secondary','publication','copyrighted'],
  ['Hammarström, I. (red.) (1979): Kalmar stads historia I','Hammarström, I. (red.)','secondary','publication','copyrighted'],
  ['Pastoureau, M. (1997): Traité d’héraldique','Pastoureau, M.','secondary','publication','copyrighted'],
  ['Societas Heraldica Scandinavica: Utvecklingen av stads- och kommunheraldiken (heraldik.org)','Societas Heraldica Scandinavica','secondary','dataset','copyrighted'],
];

async function source(title, author, reliability, kind, rights) {
  const r = await one(`select id from historical_sources where title=$1 limit 1`, [title]);
  if (r) { await c.query(`update historical_sources set rights=$2 where id=$1 and rights='unknown'`, [r.id, rights]); return r.id; }
  const ins = await one(
    `insert into historical_sources (title,title_en,author,reliability,language,kind,rights)
     values ($1,$1,$2,$3,'sv',$4,$5) returning id`, [title, author, reliability, kind, rights]);
  return ins.id;
}
async function motif(name,name_en,category,origin_note,description){
  const r=await one(`select motif_id from iconographic_motifs where name=$1`,[name]); if(r) return r.motif_id;
  const ins=await one(`insert into iconographic_motifs (name,name_en,category,origin_note,description) values ($1,$2,$3,$4,$5) returning motif_id`,[name,name_en,category,origin_note,description]);
  await c.query(`insert into entity_registry (id,entity_type,label) values ($1,'iconographic_motif',$2) on conflict (id) do nothing`,[ins.motif_id,name]);
  return ins.motif_id;
}
async function motifId(n){ return (await one(`select motif_id from iconographic_motifs where name=$1`,[n]))?.motif_id; }
async function coinId(n){ return (await one(`select id from coins where name=$1`,[n]))?.id; }
async function attest(subj, target, opts){
  const col = subj.arms_id ? 'arms_id' : 'motif_id'; const key = subj.arms_id ?? subj.motif_id;
  const dup = await one(
    `select attestation_id from heraldic_attestations where ${col}=$1 and target=$2 and coalesce(target_ref,'')=coalesce($3,'') and coalesce(target_id::text,'')=coalesce($4::text,'') limit 1`,
    [key, target, opts.target_ref??null, opts.target_id??null]);
  if (dup) return 0;
  await c.query(
    `insert into heraldic_attestations (motif_id,arms_id,target,target_id,target_ref,side,evidence_class,start_year,end_year,source_id,notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [subj.motif_id??null, subj.arms_id??null, target, opts.target_id??null, opts.target_ref??null, opts.side??null,
     opts.evidence_class??'belagd', opts.start_year??null, opts.end_year??null, opts.source_id, opts.notes??null]);
  return 1;
}

try {
  await c.query('BEGIN');
  const S = {}; for (const s of SOURCES) S[s[0].split(/[ ,(]/)[0]] = await source(...s);
  const srcBlackburn = await source(...SOURCES[7]);
  const srcArrhenius = await source(...SOURCES[8]);
  const srcPriceM   = await source(...SOURCES[10]);
  const srcLindqvist= await source(...SOURCES[11]);
  const srcOehrl    = await source(...SOURCES[12]);
  const srcHellers  = await source(...SOURCES[13]);
  const srcHammar   = await source(...SOURCES[16]);
  const srcSocHer   = await source(...SOURCES[18]);

  // --- FÖRKRISTNA MOTIV (brott-exempel; INGA derives_from till heraldik) ---
  const BROTT = 'Förkristet nordiskt motiv. Överfördes EJ till heraldiken (brott-regeln) — den nordiska symbolvärlden ärvdes inte in; riddarmärkena importerades söderifrån.';
  const m_korp   = await motifId('Korp');
  const m_valknut= await motif('Valknut','Valknut','geometrisk',
    'Tre sammanflätade trianglar. Termen "valknut" är SENTIDA och saknar belägg i fornvästnordiska källor; det järnålderstida namnet och exakta innebörden är okända (Hellers 2012). Kontext: döds-/offerscener. '+BROTT, null);
  const m_spjut  = await motif('Spjut (Gungner)','Spear (Gungnir)','foremal',
    'Odens spjut. Textstöd Völuspá 24 (Oden kastar spjut över hären = rituell invigning åt Oden). '+BROTT, null);
  const m_sleipner = await motif('Åttabent häst (Sleipner)','Eight-legged horse (Sleipnir)','fabeldjur',
    'Åttabent häst, allmänt tolkad som Sleipner (Lindqvist 1941–42; Oehrl 2019). '+BROTT, null);

  let n = 0;
  // --- YORK KORP-MYNT (oberoende samtida numismatiskt belägg) ---
  let york = await coinId('Silverpenning, Olav Guthfrithsson (Anlaf), York (korp)');
  if (!york) {
    york = (await one(
      `insert into coins (name,name_en,category,issuer,mint,metal,period_start,period_end,obverse,significance,sources)
       values ($1,$2,'nordic_royal',$3,'York','silver',939,941,$4,$5,$6) returning id`,
      ['Silverpenning, Olav Guthfrithsson (Anlaf), York (korp)','Penny of Olaf Guthfrithsson (Anlaf), York (raven)',
       'Olav Guthfrithsson (Anlaf)','Korp med utbredda vingar',
       'Oberoende samtida belägg för korpen som härskarsymbol i den anglo-skandinaviska sfären.',
       'Blackburn 2004; British Museum'])).id;
  }
  n += await attest({motif_id:m_korp}, 'coin', { target_id:york, side:'åtsida', evidence_class:'belagd',
    start_year:939, end_year:941, source_id:srcBlackburn,
    notes:'Korp med utbredda vingar; oberoende samtida numismatiskt belägg (York ca 939–941).' });

  // --- BILDSTENAR + TORSLUNDAPLÅTARNA (target='external'; koordinater ej fabricerade) ---
  n += await attest({motif_id:m_spjut}, 'external', {
    target_ref:'Torslundaplåtarna (Björnhovda, Torslunda sn, Öland; SHM, funna 1870)', side:null,
    evidence_class:'omtvistad', start_year:550, end_year:700, source_id:srcArrhenius,
    notes:'Enögd "vapendansare" med spjut. Ögonborttagningen laserverifierad (Arrhenius & Freij 1992) = FAKTUM; identifikationen som Oden är dominerande TOLKNING (Price & Mortimer 2014), ej belägg. Vendeltida hjälmmatris.' });
  n += await attest({motif_id:m_valknut}, 'external', {
    target_ref:'Stora Hammars I (Lärbro sn, Gotland)', side:null, evidence_class:'belagd',
    start_year:600, end_year:800, source_id:srcHellers,
    notes:'Offerscen med tre sammanflätade trianglar (sentida "valknut"). Kontext döds-/offer; innebörd okänd (Hellers 2012).' });
  n += await attest({motif_id:m_korp}, 'external', {
    target_ref:'Stora Hammars I (Lärbro sn, Gotland)', side:null, evidence_class:'omtvistad',
    start_year:600, end_year:800, source_id:srcLindqvist,
    notes:'Örn/korp i offerscen tillsammans med spjut (Lindqvist 1941–42).' });
  n += await attest({motif_id:m_sleipner}, 'external', {
    target_ref:'Ardre VIII / Tjängvide I (Gotland)', side:null, evidence_class:'belagd',
    start_year:700, end_year:900, source_id:srcOehrl,
    notes:'Åttabent häst (Sleipner-tolkning; Lindqvist 1941–42; Oehrl 2019).' });

  // --- KALMAR-SIGILLET: precisera 1255 → 1247–1269 + ikonografi + källa ---
  const kal = await coinId('Kalmars stadssigill 1255');
  if (kal) {
    await c.query(
      `update coins set period_start=1247, period_end=1269,
         description=$2, sources=coalesce(sources,'') || $3
       where id=$1`,
      [kal,
       'Nordens äldsta säkert daterbara stadssigill: sitter på en handling som Kalmars råd sände till Lübeck någon gång 1247–1269. Sigillbild: krenelerat torn med port omgivet av vågor — sannolikt kastalen på Slottsholmen (äldsta kärnan i Kalmar slott). Stockholms/Skaras sigill kända först 1280-tal.',
       ' | Societas Heraldica Scandinavica (heraldik.org); Hammarström (red.) 1979, Kalmar stads historia I']);
  }

  if (APPLY) { await c.query('COMMIT'); console.log(`SEEDED (committed): ${SOURCES.length} källor, 3 nya motiv, York-mynt, ${n} attesteringar, Kalmar-sigill preciserat.`); }
  else { await c.query('ROLLBACK'); console.log(`DRY RUN (rolled back): ${SOURCES.length} källor, 3 motiv, York-mynt, ${n} attesteringar, Kalmar-precisering. Kör med --apply.`); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode = 1; }
finally { await c.end(); }

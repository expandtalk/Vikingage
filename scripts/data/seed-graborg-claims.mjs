// Seed: Gråborg (Öland) — källkritisk claim-modell, samma mall som seed-ismantorp-claims.mjs.
// Fördelar källbelagda påståenden: dateringar→fortification_phases, tolkningar→fort_hypothesis,
// fynd→fortification_finds, attribut→place_claim. Källor→historical_sources. Konflikter via assert_conflict().
// Idempotent på source_key/claim_key. Parametriserat. INGEN GISSNING: endast källbelagda claims;
// oenighet loggas som konflikt, overifierat som needs_verification. INGEN geokemi/fingerprint för Gråborg.
//
// AVVIKELSER från Ismantorp-mallen (dokumenterade i slutrapporten):
//  1) Källupptaget adopterar två REDAN BEFINTLIGA historical_sources-rader (utan source_key) via
//     titel-fallback, så vi återanvänder dem i st.f. att skapa dubbletter.
//  2) Två nya place_claim_attribute läggs till: 'gate_tower', 'associated_monument'.
//  3) reliability härleds ur tier precis som Ismantorp (C/D→tertiary, annars secondary) — Fornsök är
//     egentligen primärregister, men vi håller oss till kända enum-värden.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const ENTITY = 'hillfort';
const ID = 'f82c3020-f03d-4e5c-b578-af3881cdf4f2';
const SLUG = 'graborg';
const METHOD = 'import_ai_assisted';

// source_key, title, author, year, url, isbn, tier, do_not_cite, note
// OBS: titlarna för src_brorsson_lindahl_2008 och src_lst_kalmar_knut måste matcha de BEFINTLIGA
// radernas titlar EXAKT (em-streck m.m.) — annars adopteras de inte utan dubbleras.
const SOURCES = [
  ['src_tegner_2008','Gråborg på Öland. Om en borg, ett kapell och en by','Tegnér, Göran (red.)',2008,'https://vitterhetsakad.bokorder.se/sv-se/article/1406/graborg-pa-oland','9789174023800','A',false,'HUVUDKÄLLA / standardverk — EJ läst i original. KVHAA/Riksantikvarieämbetet, Stockholm. Publicerar Gråborgsprojektets undersökningar 1998–2002. ISBN verifierad via bokhandel (studentapan/bokus/KVHAA).'],
  ['src_brorsson_lindahl_2008','Lindahl, A. & Brorsson, T. (2008): Gråborg och S:t Knuts kapell — keramiska materialet (i Tegnér red., Gråborg på Öland)','Lindahl, A. & Brorsson, T.',2008,null,null,'B',false,'BEFINTLIG rad (adopteras via titel). Kapitel i Tegnér 2008; enligt recension har kapitlet titeln "Keramiken i Gråborg och Sankt Knuts kapell – en resa i tid och rum". Källa till keramikmaterialet — exakta godstyper/dateringar kräver originalet.'],
  ['src_lst_kalmar_knut','Länsstyrelsen i Kalmar län: Sankt Knuts kapell (Gråborg)','Länsstyrelsen i Kalmar län',null,null,null,'C',false,'BEFINTLIG rad (adopteras via titel). Myndighetstext om kapellet/Knutsgillet vid Gråborg.'],
  ['src_raa_fornsok_fort','RAÄ Fornsök — Gråborg (fornborg), RAÄ Algutsrum 16:1','Riksantikvarieämbetet',null,null,null,'A',false,'Primärregister. Gammalt RAÄ-nr Algutsrum 16:1 verifierat (vår DB + sv/en Wikipedia). Nuvarande KMR lämnings-ID (Lxxxx:xxxx) EJ resolverat via öppet API 2026-08-09 (Fornsök = SPA; SOCH-sökningar gav ej träff på fornborgen). Kompletteras när L-numret verifierats.'],
  ['src_raa_fornsok_chapel','RAÄ Fornsök — Sankt Knuts kapell, L1959:6451 (Algutsrum 17:1)','Riksantikvarieämbetet',null,'https://app.raa.se/open/fornsok/lamning/e3ded603-c52a-4d75-b163-06f258e5b90e',null,'A',false,'Primärregister. Lämnings-ID L1959:6451 / Algutsrum 17:1 verifierat via K-samsök (SOCH). Koordinat 56.668°N 16.601°E.'],
  ['src_sv_wikipedia','Gråborg (svenska Wikipedia)','sv.wikipedia.org',null,'https://sv.wikipedia.org/wiki/Gr%C3%A5borg',null,'D',true,'Proximat webbkälla (EJ egen auktoritet). Anger Tegnér 2008 som källa men saknar radnivå-referenser. Uppgifter härifrån är needs_verification tills de belagts i Tegnér 2008.'],
  ['src_en_wikipedia','Gråborg (engelska Wikipedia)','en.wikipedia.org',null,'https://en.wikipedia.org/wiki/Gr%C3%A5borg',null,'D',true,'Proximat webbkälla (EJ egen auktoritet). Not: anger att Sörby borg (påträffad 2021) är större än Gråborg; att husgrunder saknas p.g.a. odling; datering "5th century" (jfr sv.wiki "500-talet").'],
  ['src_klm_museum','Kalmar läns museum — digitala samlingar (Gråborg)','Kalmar läns museum',null,null,null,'C',false,'Refererad av en.wiki. Fynd från borgen förvaras vid museet. Sekundär/museal.'],
];

// attribute, claim_type, unit, description  (upsertas; nya: gate_tower, associated_monument)
const ATTRS = [
  ['raa_designation','identifier',null,'RAÄ/KMR-beteckning'],
  ['ring_wall_diameter_m','measurement','m','Ringmurens diameter'],
  ['ring_wall_height_m','measurement','m','Ringmurens höjd'],
  ['wall_technique','construction',null,'Murkonstruktion'],
  ['gate_count','count',null,'Antal portar'],
  ['gate_tower','construction',null,'Porttorn / tornöverbyggnad vid port'],
  ['comparative_largest','comparison',null,'Störst-jämförelse'],
  ['excavation_history','research_history',null,'Undersökningskronologi'],
  ['associated_monument','context',null,'Angränsande/associerad lämning'],
  ['coordinate_wgs84','identifier',null,'WGS84-centrumkoordinat'],
  ['settlement_context','context',null,'Omgivande bebyggelsemiljö'],
  ['cultural_deposit','observation',null,'Kulturlager / fyndtäthet'],
];

// claim_key, order, phase_name, from, to, function, statement, src, conf, status
const PHASES = [
  ['gb_dating_400s',1,'Anläggning (folkvandringstid) — 400-tal',400,500,'construction','De äldsta delarna av borgen är enligt en läsning sannolikt från 400-talet (folkvandringstid).','src_en_wikipedia',0.4,'disputed'],
  ['gb_dating_500s',1,'Anläggning (folkvandringstid) — 500-tal',500,600,'construction','De äldsta delarna av borgen är enligt en annan läsning sannolikt från 500-talet.','src_sv_wikipedia',0.45,'disputed'],
  ['gb_phase_medieval',2,'Medeltida ombyggnad (nuvarande storlek + porttorn)',1100,1200,'rebuilding_and_use','Borgen fick sin nuvarande storlek under 1100-talet; en av portöppningarna försågs med en tornöverbyggnad (porttorn) under medeltiden och muren murades delvis i bruk.','src_sv_wikipedia',0.7,'needs_verification'],
];

// claim_key, school, proponent, year, statement, src, cited, conf, status, caveat, note
const HYPOS = [
  ['gb_hypo_refuge_defence','refugium/försvar','ospecificerad (via Tegnér 2008)',2008,'Ringborgen tolkas som en befäst anläggning — tillflykt/försvar — under järnålder och tidig medeltid.','src_sv_wikipedia','src_tegner_2008',0.55,'needs_verification','Funktionstolkning; verifiera resonemanget i Tegnér 2008.',null],
  ['gb_hypo_central_market','handel/centralplats','ospecificerad (via Tegnér 2008)',2008,'Gråborg tolkas ha haft en viktig roll under järnålder och tidig medeltid, inte bara lokalt på Öland — möjligen central-/marknadsplats. Kopplingen till S:t Knuts kapell och Knutsgillet knyter platsen till handels-/sjöfartsnätverk.','src_tegner_2008','src_brorsson_lindahl_2008',0.45,'needs_verification','Central-/marknadsfunktion = tolkning, ej entydigt belagd. Knutsgille-kopplingen bygger på kapellets patrocinium, inte på fynd i borgen.',null],
];

// claim_key, find_type, label, statement, src, conf, status, note
const FINDS = [
  ['gb_finds_ceramics','keramik','Keramiskt material (järnålder–medeltid)','Det keramiska materialet från Gråborg och S:t Knuts kapell har analyserats (Brorsson & Lindahl 2008) och speglar aktivitet från järnålder till medeltid.','src_brorsson_lindahl_2008',0.6,'needs_verification','Exakta godstyper, kvantiteter, dateringar och proveniens kräver kapitlet i Tegnér 2008 (ej läst i original).'],
];

// claim_key, attribute, statement, value, value_text, meas_ref, src, locator, cited, corrob[], conf, status, note
const PLACE = [
  ['gb_raa','raa_designation','Lämningen har RAÄ-nummer Algutsrum 16:1 (fornborg).',null,'Algutsrum 16:1',null,'src_raa_fornsok_fort',null,null,['src_sv_wikipedia','src_en_wikipedia'],0.9,'verified','Nuvarande KMR lämnings-ID (Lxxxx:xxxx) EJ resolverat via öppet API 2026-08-09 — komplettera från Fornsök.'],
  ['gb_dim_210x160','ring_wall_diameter_m','Borgen är elliptisk, ca 210 × 160 m.',null,'210 × 160 m',null,'src_sv_wikipedia',null,'src_tegner_2008',['src_en_wikipedia'],0.7,'needs_verification','Mått via Wikipedia som anger Tegnér 2008. Verifiera i originalet.'],
  ['gb_wall_height_4','ring_wall_height_m','Ringmuren är ca 4 m hög.',4,null,null,'src_sv_wikipedia',null,'src_tegner_2008',['src_en_wikipedia'],0.65,'needs_verification','Dagens höjd delvis resultat av restaurering (jfr ritningar 1946/1972, ATA).'],
  ['gb_wall_technique','wall_technique','Ringmuren är byggd av kalksten, delvis kallmurad och delvis murad i bruk; brukstekniken hör till den medeltida ombyggnaden.',null,'kalksten, delvis i bruk',null,'src_en_wikipedia',null,'src_tegner_2008',[],0.5,'needs_verification','Bruksmurning = medeltida fas. Verifiera i Tegnér 2008.'],
  ['gb_gates_three','gate_count','Ringmuren har tre portöppningar.',3,null,null,'src_sv_wikipedia',null,'src_tegner_2008',['src_en_wikipedia'],0.8,'needs_verification',null],
  ['gb_gate_tower','gate_tower','En av de tre portöppningarna har en tornöverbyggnad (porttorn/valvport) som uppfördes under medeltiden.',null,'medeltida porttorn',null,'src_sv_wikipedia',null,'src_tegner_2008',['src_en_wikipedia'],0.7,'needs_verification','Porttornet är Gråborgs mest särpräglade drag och det tydligaste medeltida inslaget.'],
  ['gb_largest_oland','comparative_largest','Gråborg har länge räknats som Ölands (och sannolikt Sveriges) största fornborg/ringborg.',null,null,null,'src_sv_wikipedia',null,'src_tegner_2008',['src_en_wikipedia'],0.6,'disputed','Se konflikt med gb_sorby_2021.'],
  ['gb_sorby_2021','comparative_largest','Sedan Sörby borg påträffades (2021) på mellersta Öland anges den vara större än Gråborg.',null,null,null,'src_en_wikipedia',null,null,[],0.4,'needs_verification','Verifiera Sörby borg-uppgiften i primärkälla (endast via en.wiki hittills).'],
  ['gb_excav_history','excavation_history','Borgen, kapellet och byn undersöktes 1998–2002 inom Gråborgsprojektet, publicerat i Tegnér (red.) 2008.',null,'1998–2002',null,'src_tegner_2008',null,null,['src_sv_wikipedia'],0.75,'needs_verification','Årsspann via forskningsöversikt/recension; verifiera exakta kampanjer i Tegnér 2008. Äldre dokumentation (ritningar 1946/1952/1972, foton 1930/1945) finns i ATA/K-samsök.'],
  ['gb_chapel_designation','associated_monument','Ca 170–200 m N om ringborgen ligger ruinen av S:t Knuts kapell (L1959:6451, RAÄ Algutsrum 17:1), uppförd på 1100-talet och övergiven på 1500-talet.',null,'S:t Knuts kapell (L1959:6451)',null,'src_raa_fornsok_chapel',null,null,['src_lst_kalmar_knut'],0.85,'verified','Kapellets lämnings-ID verifierat via K-samsök. Avstånd ~170 m enligt koordinater (kapell 56.668/16.601, borg 56.6664/16.604).'],
  ['gb_chapel_knutsgille','associated_monument','Kapellet är tillägnat den danske helgonkonungen Knut och kopplat till Knutsgillet (köpmanna-/sjöfarargille), vilket knyter Gråborg till handels- och sjöfartsnätverk.',null,'S:t Knut / Knutsgillet',null,'src_lst_kalmar_knut',null,null,[],0.5,'needs_verification','Knutsgille-kopplingen är en tolkning via kapellets patrocinium, inte ett fynd i borgen.'],
  ['gb_coordinate','coordinate_wgs84','Ringborgens ungefärliga centrumkoordinat är 56.6664°N, 16.6040°E (WGS84).',null,'56.6664, 16.6040',null,'src_raa_fornsok_fort',null,null,['src_raa_fornsok_chapel'],0.7,'needs_verification','Ur swedish_hillforts; konsistent med Fornsöks kapellkoordinat (~170 m N). Exakt centrum bör bekräftas mot Fornsöks fornborgsgeometri (lämnings-ID ännu ej resolverat).'],
  ['gb_village_context','settlement_context','Till lämningsmiljön hör även en by; borg, kapell och by behandlas tillsammans som en samlad miljö.',null,null,null,'src_tegner_2008',null,null,['src_sv_wikipedia'],0.6,'needs_verification','Speglas i verkets undertitel "om en borg, ett kapell och en by".'],
  ['gb_no_house_foundations','cultural_deposit','Inne i borgen har inga husgrunder påträffats; detta har förklarats med att ytan har odlats.',null,'inga husgrunder (odlad yta)',null,'src_en_wikipedia',null,'src_tegner_2008',[],0.4,'needs_verification','Kontrast mot t.ex. Ismantorp (bevarade husgrunder). Verifiera i Tegnér 2008.'],
  ['gb_ceramics_context','cultural_deposit','Keramikmaterialet (analyserat av Brorsson & Lindahl 2008) speglar aktivitet från järnålder till medeltid.',null,'keramik järnålder–medeltid',null,'src_brorsson_lindahl_2008',null,null,['src_klm_museum'],0.55,'needs_verification','Se fynd gb_finds_ceramics. Detaljer kräver originalkapitlet.'],
];

// [claim_key_a, claim_key_b, note]
const CONFLICTS = [
  ['gb_dating_400s','gb_dating_500s','anläggningsdatering: 400-tal (en.wiki) vs 500-tal (sv.wiki) — sannolikt olika läsning av samma folkvandringstida kronologi; avgör i Tegnér 2008'],
  ['gb_largest_oland','gb_sorby_2021','störst på Öland: Gråborg (traditionellt) vs Sörby borg (påträffad 2021)'],
];

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const ref = {}; // claim_key -> {table, id}
  try {
    // Källor → historical_sources. Idempotent: (1) source_key, annars (2) adoptera befintlig rad via
    // EXAKT titel (sätter source_key), annars (3) insert.
    const src = {};
    for (const [key,title,author,year,url,isbn,tier,dnc,note] of SOURCES) {
      const rel = (tier==='C'||tier==='D') ? 'tertiary' : 'secondary';
      const lang = key === 'src_en_wikipedia' ? 'en' : 'sv';
      const auth = author || (url ? new URL(url).hostname.replace(/^www\./,'') : 'okänd upphovsman');
      let id;
      const byKey = await client.query('select id from historical_sources where source_key=$1', [key]);
      if (byKey.rows.length) {
        id = byKey.rows[0].id;
        await client.query('update historical_sources set title=$2,title_en=$2,author=$3,written_year=$4,url=$5,isbn=$6,tier=$7,do_not_cite=$8,description=$9,reliability=$10,language=$11 where id=$1',
          [id,title,auth,year,url,isbn,tier,dnc,note,rel,lang]);
      } else {
        const byTitle = await client.query('select id from historical_sources where title=$1 and source_key is null', [title]);
        if (byTitle.rows.length) {
          id = byTitle.rows[0].id; // adoptera befintlig rad
          await client.query('update historical_sources set source_key=$2,title_en=$3,author=$4,written_year=$5,url=$6,isbn=$7,tier=$8,do_not_cite=$9,description=$10,reliability=$11,language=$12 where id=$1',
            [id,key,title,auth,year,url,isbn,tier,dnc,note,rel,lang]);
        } else {
          id = (await client.query('insert into historical_sources (title,title_en,author,written_year,url,isbn,tier,do_not_cite,description,source_key,reliability,language) values ($1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id',
            [title,auth,year,url,isbn,tier,dnc,note,key,rel,lang])).rows[0].id;
        }
      }
      src[key] = id;
    }

    // Attribut-vokabulär
    for (const [a,t,u,d] of ATTRS)
      await client.query('insert into place_claim_attribute (attribute,claim_type,unit,description) values ($1,$2,$3,$4) on conflict (attribute) do update set claim_type=excluded.claim_type,unit=excluded.unit,description=excluded.description',[a,t,u,d]);

    // Dateringar → fortification_phases
    for (const [key,ord,pname,from,to,fn,stmt,s,conf,status] of PHASES) {
      const id = (await client.query(
        `insert into fortification_phases (fortification_source,fortification_id,phase_order,phase_name,period_start,period_end,function,description,source_id,confidence,verification_status,created_by_method,claim_key)
         values ('swedish_hillforts',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         on conflict (claim_key) where claim_key is not null do update set phase_name=excluded.phase_name,period_start=excluded.period_start,period_end=excluded.period_end,function=excluded.function,description=excluded.description,source_id=excluded.source_id,confidence=excluded.confidence,verification_status=excluded.verification_status returning id`,
        [ID,ord,pname,from,to,fn,stmt,src[s]??null,conf,status,METHOD,key])).rows[0].id;
      ref[key] = { table:'fortification_phases', id };
    }

    // Tolkningar → fort_hypothesis
    for (const [key,school,prop,year,stmt,s,cited,conf,status,caveat,note] of HYPOS) {
      const id = (await client.query(
        `insert into fort_hypothesis (site,entity_type,entity_id,name,author,year,school,note,source_id,cited_authority_id,source_critical_caveat,confidence,verification_status,created_by_method,claim_key)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         on conflict (claim_key) where claim_key is not null do update set name=excluded.name,author=excluded.author,school=excluded.school,note=excluded.note,source_id=excluded.source_id,cited_authority_id=excluded.cited_authority_id,source_critical_caveat=excluded.source_critical_caveat,confidence=excluded.confidence,verification_status=excluded.verification_status returning id`,
        [ID,ENTITY,ID,key,prop,year,school,stmt+(note?` [${note}]`:''),src[s]??null,src[cited]??null,caveat,conf,status,METHOD,key])).rows[0].id;
      ref[key] = { table:'fort_hypothesis', id };
    }

    // Fynd → fortification_finds
    for (const [key,ft,label,stmt,s,conf,status,note] of FINDS) {
      const id = (await client.query(
        `insert into fortification_finds (fortification_source,fortification_id,find_type,label,description,source_id,confidence,verification_status,created_by_method,claim_key)
         values ('swedish_hillforts',$1,$2,$3,$4,$5,$6,$7,$8,$9)
         on conflict (claim_key) where claim_key is not null do update set find_type=excluded.find_type,label=excluded.label,description=excluded.description,source_id=excluded.source_id,confidence=excluded.confidence,verification_status=excluded.verification_status returning id`,
        [ID,ft,label,stmt+(note?` [${note}]`:''),src[s]??null,conf,status,METHOD,key])).rows[0].id;
      ref[key] = { table:'fortification_finds', id };
    }

    // Attribut → place_claim
    for (const [key,attr,stmt,val,vtext,mref,s,loc,cited,corrob,conf,status,note] of PLACE) {
      const cids = (corrob||[]).map(k=>src[k]).filter(Boolean);
      const id = (await client.query(
        `insert into place_claim (claim_key,entity_type,entity_id,place_slug,attribute,statement,value,value_text,measurement_reference,source_id,source_locator,cited_authority_id,corroborating_source_ids,confidence,verification_status,created_by_method,note)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         on conflict (claim_key) do update set attribute=excluded.attribute,statement=excluded.statement,value=excluded.value,value_text=excluded.value_text,measurement_reference=excluded.measurement_reference,source_id=excluded.source_id,source_locator=excluded.source_locator,cited_authority_id=excluded.cited_authority_id,corroborating_source_ids=excluded.corroborating_source_ids,confidence=excluded.confidence,verification_status=excluded.verification_status,note=excluded.note returning id`,
        [key,ENTITY,ID,SLUG,attr,stmt,val,vtext,mref,src[s]??null,loc,src[cited]??null,cids.length?cids:null,conf,status,METHOD,note])).rows[0].id;
      ref[key] = { table:'place_claim', id };
    }

    // Konflikter via assert_conflict()
    let cn = 0;
    for (const [a,b,note] of CONFLICTS) {
      if (!ref[a] || !ref[b]) { console.log(`  ⚠ konflikt hoppad (saknar ref): ${a} / ${b}`); continue; }
      await client.query('select public.assert_conflict($1,$2,$3,$4,$5,$6)',
        [ref[a].table, ref[a].id, ref[b].table, ref[b].id, 'conflicts_with', note]);
      cn++;
    }

    console.log(`✅ ${SOURCES.length} källor, ${PHASES.length} phases, ${HYPOS.length} hypotheses, ${FINDS.length} finds, ${PLACE.length} place_claims, ${cn} konflikter.`);
  } finally {
    await client.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });

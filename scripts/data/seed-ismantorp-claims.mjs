// Seed: Ismantorps borg — pilot för den källkritiska claim-modellen (se docs/DATA_GOVERNANCE.md).
// Fördelar Daniels 33 påståenden: dateringar→fortification_phases, tolkningar→fort_hypothesis,
// fynd→fortification_finds, attribut→place_claim. Källor→historical_sources (kanon, tier A–D).
// Konflikter via assert_conflict(). Idempotent på source_key/claim_key. Parametriserat.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const ENTITY = 'hillfort';
const ID = '6660de5b-9d2e-4fa4-b58e-f327fd256ae3';
const SLUG = 'ismantorp_borg';
const METHOD = 'import_ai_assisted';

// source_key, title, author, year, url, isbn, tier, do_not_cite, note
const SOURCES = [
  ['src_andren_2014','Tracing Old Norse Cosmology: The World Tree, Middle Earth and the Sun','Andrén, Anders',2014,null,'9789185509386','A',false,'HUVUDKÄLLA — ej läst i original. ISBN 978-91-85509-38-6.'],
  ['src_andren_2006','A world of stone. Warrior culture, hybridity, and Old Norse cosmology','Andrén, Anders',2006,null,null,'A',false,'Kortversion av 2014, Vägar till Midgård 8, s. 33-38.'],
  ['src_stenberger_1925','En preliminär undersökning av Ismantorps borg','Stenberger, Mårten',1925,'https://www.diva-portal.org/smash/get/diva2:1226736/FULLTEXT01.pdf',null,'A',false,'Fornvännen 20:358-375. Öppet via DiVA.'],
  ['src_stenberger_1933','Öland under äldre järnåldern. En bebyggelsehistorisk undersökning','Stenberger, Mårten',1933,null,null,'A',false,'Uppsala. Källa till katastrofteorin.'],
  ['src_wegraeus_1976','The Öland ring-forts','Wegraeus, Erik',1976,null,null,'A',false,'I Eketorp… s. 38 (Ismantorp).'],
  ['src_arne_1921','VERIFY — titel ej fastställd','Arne, T. J.',1921,null,null,'A',false,'Referens för tidiga undersökningar 1899/1904.'],
  ['src_alexandersson_2015','Renovering av sydvästra porten på Ismanstorps fornborg. Antikvarisk kontroll 2014','Alexandersson, Kenneth',2015,null,null,'B',false,'Bevarandehistorik/restaurering — vid tolkning av murmått.'],
  ['src_jonsson_2022','Undersökning av Långlöt 30:1. Aktiviteter kring ruinerna av Ismantorps borg','Jonsson, Maria',null,'https://www.researchcatalogue.net/view/1364677/1582870',null,'B',false,'Konstnärligt projekt m. korrekt forskningshistorik. Parafraserar Andrén — spårning.'],
  ['src_fornborgar_se','Fornborgsforskning — kort svensk forskningshistorik',null,null,'https://fornborgar.se/historik-fornborgsforskning/',null,'B',false,'Refererar korrekt vidare till Stenberger 1925/1933.'],
  ['src_bogen_2024','Borgarna vid vattnets kant','Bogen, Vera',2024,'https://uu.diva-portal.org/smash/get/diva2:1870811/FULLTEXT01.pdf',null,'B',false,'Jämför Eketorp II / Ismantorp / Sandby.'],
  ['src_academia_fornborg_katalog','Från stenkrigare till borgjarl. Befästningskonsten i östra Sverige, 375-750 e.Kr.','VERIFY — författare',2023,'https://www.academia.edu/109072986/',null,'B',false,'Katalogtabell; källa för L1957:426.'],
  ['src_klm_digitaltmuseum','Ismantorps borg (DigitaltMuseum)','Kalmar läns museum',null,'https://digitaltmuseum.se/021017072681/ismantorps-borg',null,'C',false,null],
  ['src_sfv','Ismantorps fornborg (SFV)','Statens fastighetsverk',null,'https://www.sfv.se/vara-fastigheter/sverige/kalmar-lan/isman-torps-fornborg',null,'C',false,'Blandar 88/95 husgrunder; "ny forskning" utan referens.'],
  ['src_wikipedia_en','Ismantorp Fortress','Wikipedia (en)',null,'https://en.wikipedia.org/wiki/Ismantorp_Fortress',null,'D',true,'Påstår "största ringborg" — motsägs av Stenberger 1925.'],
  ['src_alltpaoland','Ismantorps borg (alltpaoland.se)',null,null,'https://alltpaoland.se/platser/ismantorps-borg/',null,'D',true,null],
  ['src_visitoland','Ismanstorps borg (visitoland.com)',null,null,'https://visitoland.com/gora-pa-oland/ismanstorps-borg/',null,'D',true,null],
];

// attribute, claim_type, unit, description
const ATTRS = [
  ['raa_designation','identifier',null,'RAÄ/KMR-beteckning'],
  ['excavation_history','research_history',null,'Undersökningskronologi'],
  ['ring_wall_diameter_m','measurement','m','Ringmurens diameter'],
  ['ring_wall_height_m','measurement','m','Ringmurens höjd'],
  ['ring_wall_length_m','measurement','m','Ringmurens längd'],
  ['wall_technique','construction',null,'Murkonstruktion'],
  ['gate_count','count',null,'Antal portar'],
  ['house_foundation_count','count',null,'Antal husgrunder'],
  ['block_count','count',null,'Antal kvarter'],
  ['central_feature','feature',null,'Anläggning i borgens mitt'],
  ['cultural_deposit','observation',null,'Kulturlager / fyndtäthet'],
  ['settlement_context','context',null,'Omgivande bebyggelsemiljö'],
  ['comparative_largest','comparison',null,'Störst-jämförelse'],
  ['comparative_best_preserved','comparison',null,'Bäst bevarad-jämförelse'],
];

// claim_key, order, phase_name, from, to, function, statement, src, conf, status
const PHASES = [
  ['c_dating_200_650',1,'Anläggning + brukning',200,650,'construction_and_use','Borgen byggdes under 200-talet och var i bruk till 600-talet.','src_klm_digitaltmuseum',0.65,'needs_verification'],
  ['c_dating_300_600',1,'Belagd brukning (fynd)',300,600,'attested_use','Fynden visar att borgen använts 300-600 e.Kr.','src_visitoland',0.3,'disputed'],
  ['c_dating_ca500',1,'Anläggning (föråldrad)',450,550,'construction','Borgens anläggande sattes till ca 500 e.Kr. (föråldrat).','src_alltpaoland',0.15,'rejected'],
  ['c_reuse_900_1200',2,'Återbruk',900,1200,'reuse','Under 900-1200-talet återanvändes borgen i liten skala (smedja, silvermynt).','src_visitoland',0.4,'needs_verification'],
];

// claim_key, school, proponent, year, statement, src, cited, conf, status, caveat, note
const HYPOS = [
  ['i_stenberger_ritual','kult','Stenberger, Mårten',1925,'De nio portarna talar emot militär användning; portantalet indikerar en plats för riter och ceremonier.','src_jonsson_2022','src_stenberger_1925',0.8,'needs_verification',null,null],
  ['i_stenberger_temple','kult','Stenberger, Mårten',1925,'Stenkretsen i mitten har sannolikt haft med kulten att göra, möjligen postament till en byggnad för religiöst bruk.','src_jonsson_2022','src_stenberger_1925',0.8,'needs_verification',null,null],
  ['i_stenberger_catastrophe','refugium','Stenberger, Mårten',1933,'En katastrof under 400-talets senare del; borgarna byggdes efter den, i oroliga tider, för skydd mot faror utifrån.','src_fornborgar_se','src_stenberger_1933',0.85,'needs_verification',null,'Överspelad datering, historiografiskt viktig.'],
  ['i_andren_martial','krigarkultur','Andrén, Anders',2014,'Borgen fungerade primärt militärt: stödjepunkt, samlingsplats inför anfall, utbildning/initiering av krigare, ev. bytesfördelning. Utesluter ej rituell funktion.','src_jonsson_2022','src_andren_2014',0.6,'needs_verification',null,'PRIORITET 2. Parafras av parafras — hämta ur Andrén 2014 kap. 3.'],
  ['i_andren_cosmology','kosmologi','Andrén, Anders',2014,'Nio markeringar i muren kan representera de nio världarna; stolphål+grop i mitten = världens mitt (världsträdet, ödeskällan). Möjlig översättning av det romerska lägrets fyra världar.','src_jonsson_2022','src_andren_2014',0.55,'needs_verification','Bygger på isländsk litteratur nedtecknad 700-1000 år efter övergivandet. Långtidskontinuitet = teoretiskt antagande, ej arkeologiskt fynd. Måste märkas i gränssnittet.',null],
  ['i_market_place','handel','ospecificerad',null,'Borgen kan liksom Gråborg ha varit en marknadsplats.','src_klm_digitaltmuseum',null,0.25,'needs_verification',null,'SFV: "ny forskning visar" utan referens. Spåra eller stryk.'],
  ['i_social_organisation','social_organisation','redaktionell hypotes (ej publicerad)',null,'Antalet portar kan spegla social organisation: bygdeenheter/gårdsgrupper med egen ingång till sitt kvarter. Läget i gränslandet mellan socknar är förenligt med detta.',null,null,0.0,'unpublished_hypothesis',null,'FÅR EJ PUBLICERAS SOM FORSKNINGSLÄGE. Bygger dessutom på c_blocks_12 (tolv, ej nio kvarter).'],
];

// claim_key, find_type, label, statement, src, conf, status, note
const FINDS = [
  ['c_finds_objects','dräkt/vapen','Dräktspänne + pilspets','Vid undersökning i början av 2000-talet gjordes ett fåtal fynd, bl.a. ett dräktspänne i järn och en pilspets.','src_alltpaoland',0.4,'needs_verification','Kräver fyndlista ur rapport eller Andrén 2014.'],
  ['c_coin_arabic','mynt','Silvermynt (troligen arabiskt)','Ett silvermynt, troligen arabiskt, visar att borgen besökts under vikingatiden.','src_alltpaoland',0.35,'needs_verification','Om dirham: sannolikt i Corpus Nummorum Saec. IX-XI.'],
];

// claim_key, attribute, statement, value, value_text, meas_ref, src, locator, cited, corrob[], conf, status, note
const PLACE = [
  ['c_id_kmr','raa_designation','Lämningen har KMR-beteckning L1957:426, äldre RAÄ Långlöt 30:1.',null,'L1957:426',null,'src_academia_fornborg_katalog','katalogtabell',null,[],0.9,'needs_verification',"Källan skrev 'LL1957:426', sannolikt tryckfel."],
  ['c_excav_history','excavation_history','Undersökningar genomförda (1899), 1904, 1925 samt 1997-2001.',null,'(1899),1904,1925,1997-2001',null,'src_academia_fornborg_katalog',null,null,[],0.85,'needs_verification','1997-2001 = Andréns projekt.'],
  ['c_excav_history_alt','excavation_history',"Undersökning genomförd 'i början av 2000-talet'.",null,'början av 2000-talet',null,'src_alltpaoland',null,null,[],0.2,'disputed',null],
  ['c_diameter_125','ring_wall_diameter_m','Ringmurens diameter är ca 125 m.',125,null,null,'src_klm_digitaltmuseum',null,null,[],0.7,'needs_verification',null],
  ['c_diameter_127','ring_wall_diameter_m','Borgens diameter är 127 m.',127,null,null,'src_alltpaoland',null,null,[],0.3,'disputed','125 vs 127 = sannolikt ytter- vs innerkant, ej konflikt. Ange mätreferens.'],
  ['c_wall_height_4','ring_wall_height_m','Muren är upp till ca 4 m hög.',4,null,'max','src_klm_digitaltmuseum',null,null,[],0.6,'needs_verification','Dagens höjd delvis 1900-talsrestaurering (Alexandersson 2015).'],
  ['c_wall_height_2_5','ring_wall_height_m','Borgen har en höjd av 2,5 m.',2.5,null,null,'src_alltpaoland',null,null,[],0.25,'disputed',null],
  ['c_wall_technique','wall_technique','Ringmuren är uppbyggd i skalmursteknik.',null,'skalmur',null,'src_alltpaoland',null,null,[],0.5,'needs_verification','Bör beläggas ur Wegraeus 1976 eller Andrén 2014.'],
  ['c_gates_nine','gate_count','Ringmuren har nio portar.',9,null,null,'src_klm_digitaltmuseum',null,null,['src_stenberger_1925','src_jonsson_2022','src_sfv','src_visitoland'],0.98,'verified','Enda uppgiften ingen källa ifrågasätter.'],
  ['c_houses_88','house_foundation_count','Innanför muren finns 88 bevarade husgrunder, radiellt byggda.',88,null,null,'src_klm_digitaltmuseum',null,null,['src_alltpaoland'],0.7,'disputed','Traditionella siffran.'],
  ['c_houses_95','house_foundation_count','Innanför muren finns 95 husgrunder.',95,null,null,'src_wikipedia_en',null,'src_andren_2006',['src_sfv','src_visitoland'],0.5,'needs_verification','Måste avgöras mot Andrén 2014.'],
  ['c_blocks_12','block_count','Husgrunderna är ordnade i 12 kvarter kring en öppen mittplats.',12,null,null,'src_wikipedia_en',null,'src_andren_2006',[],0.4,'needs_verification','KRITISK. Populärt antyds ibland nio → cirkulärt niotalsargument.'],
  ['c_wall_length_300','ring_wall_length_m','Ringmuren är ca 300 m lång.',300,null,null,'src_wikipedia_en',null,null,[],0.4,'needs_verification','Inkonsekvent med diametern (125 m ⇒ ~393 m). Sannolikt fel.'],
  ['c_central_place','central_feature','Mitt i borgen finns resterna av ett runt torg / öppen mittplats.',null,'öppen mittplats',null,'src_klm_digitaltmuseum',null,null,[],0.8,'needs_verification',null],
  ['c_central_stone_circle','central_feature','I borgens mitt finns en halvcirkelformad stenkrets; senare utgrävningar har påvisat grop och stolphål intill.',null,'stenkrets + grop + stolphål',null,'src_jonsson_2022',null,'src_stenberger_1925',[],0.75,'needs_verification','Den konkreta observation Andréns axis mundi-tolkning vilar på.'],
  ['c_finds_sparse','cultural_deposit','Mycket få fynd och inga kulturlager har noterats, vilket talar för bruk endast i korta perioder.',null,'inga kulturlager / få fynd',null,'src_alltpaoland',null,null,['src_visitoland','src_sfv'],0.55,'needs_verification','PRIORITET 1. Empiriskt fundament för icke-bosättningstolkningen.'],
  ['c_context_settlement','settlement_context','NO om borgen: 1400x300 m husgrunder/stensträngar/gravar; 2 km V: Rönnerums fornlämningsmiljö, förmodligen samtida.',null,null,null,'src_alltpaoland',null,null,[],0.5,'needs_verification','Ismantorp = nod i ett bebyggelsesystem.'],
  ['c_not_largest','comparative_largest','Gråborg är Ölands ansenligaste fornborg och sannolikt landets största ringborg — inte Ismantorp.',null,null,null,'src_stenberger_1925','s. 358',null,[],0.9,'verified',null],
  ['c_largest_wikipedia','comparative_largest','Ismantorp är den största och troligen äldsta ringborgen på Öland.',null,null,null,'src_wikipedia_en',null,null,[],0.1,'rejected','Spårningspost. Sannolik sammanblandning "största"/"bäst bevarade".'],
  ['c_best_preserved','comparative_best_preserved','Ismantorp är Kalmar läns bäst bevarade fornborg; andra öländska borgar har husgrunderna bortodlade/använda som byggmaterial.',null,null,null,'src_sfv',null,null,['src_stenberger_1925','src_alltpaoland'],0.85,'verified',null],
];

const CONFLICTS = [
  ['c_diameter_125','c_diameter_127','ev. ytter- vs innerkant'],
  ['c_wall_height_4','c_wall_height_2_5',null],
  ['c_houses_88','c_houses_95',null],
  ['c_excav_history','c_excav_history_alt',null],
  ['c_not_largest','c_largest_wikipedia',null],
  ['c_dating_200_650','c_dating_300_600','olika target_event: total brukning vs daterbara fynd'],
  ['c_dating_200_650','c_dating_ca500',null],
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
    // Källor → historical_sources (idempotent på source_key)
    const src = {};
    for (const [key,title,author,year,url,isbn,tier,dnc,note] of SOURCES) {
      const rel = (tier==='C'||tier==='D') ? 'tertiary' : 'secondary'; // proximitet-axel, approx ur tier
      const lang = ['src_andren_2014','src_andren_2006','src_wegraeus_1976','src_wikipedia_en'].includes(key) ? 'en' : 'sv';
      // author krävs (narrative_needs_author) → institutionell författare = domänen för webbkällor
      const auth = author || (url ? new URL(url).hostname.replace(/^www\./,'') : 'okänd upphovsman');
      const ex = await client.query('select id from historical_sources where source_key=$1', [key]);
      let id;
      if (ex.rows.length) {
        id = ex.rows[0].id;
        await client.query('update historical_sources set title=$2,title_en=$2,author=$3,written_year=$4,url=$5,isbn=$6,tier=$7,do_not_cite=$8,description=$9,reliability=$10,language=$11 where id=$1',
          [id,title,auth,year,url,isbn,tier,dnc,note,rel,lang]);
      } else {
        id = (await client.query('insert into historical_sources (title,title_en,author,written_year,url,isbn,tier,do_not_cite,description,source_key,reliability,language) values ($1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id',
          [title,auth,year,url,isbn,tier,dnc,note,key,rel,lang])).rows[0].id;
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

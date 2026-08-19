// Ingest: "People Also Ask"-underfrågor till Njord-FAQ:n (slug 'vem-var-njord').
// KÄLLKRITIK: detta är MYTOLOGI, inte historisk fakta. Varje lens-svar märks som
// myt/tradition (status 'tolkning'); Nerthus-kopplingen är en omstridd filologisk
// hypotes (status 'omstridt'). Myt-innehållet återges i egna ord (ej kopierad prosa).
// Disciplinerna begränsas till koder som finns i research_discipline (INNER JOIN i
// get_faq), därför 'historiker' (religionshistorisk/källkritisk lins) + 'filolog'.
// Idempotent på slug. Kör från projektroten:  node scripts/data/ingest-faq-njord-paa.mjs
import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(s,p)=>(await c.query(s,p)).rows;
const RUN='deity:njord-paa:2026-08-19';

// gemensam källkritisk bias-not (myt ur sena kristna källor)
const BIAS_KALLA='Källorna om Njord är sena och kristet nedtecknade (Snorres Edda ~1220, Poetiska Eddan ~1270) — långt efter att hedendomen upphört som levande kult. Innehållet är myt och tradition, inte historisk fakta, och den sammanhängande berättelsen är till stor del Snorris efterhandssystematisering, inte ett direkt fönster in i vikingatida tro.';

const SNORRE='Snorri Sturluson: Prosaiska Eddan (Skáldskaparmál)';
const PE_VG='Poetiska Eddan (Vafþrúðnismál, Grímnismál)';
const PE_LOKA='Poetiska Eddan (Lokasenna)';
const MYTHO='Mythopedia — Thomas Apel (2022)';
const BLOGG='kulturminnet.wordpress.com (2019)';
const TACITUS='Tacitus, Germania kap. 40 (~98 e.Kr.)';
const VIKSTRAND='Per Vikstrand, Gudarnas platser (2001)';

// question_sv, question_en, variants[], [lenses], rank i Njords PAA-träd
const Q=[
 {slug:'vem-var-gift-med-njord', sv:'Vem var gift med Njord?', en:'Who was Njord married to?',
  variants:['vem var gift med njord','vem var njords fru','vem var njords hustru','vilka var njord gift med','njords maka','njords hustru','who was njord married to','njords wife'],
  rank:30,
  lenses:[
   ['historiker','tolkning',0.70,
    'I den fornnordiska mytologin — så som den bevarats i de sena, kristet nedtecknade eddatexterna — var Njord gift med jättinnan (jötunn) Skade, dotter till jätten Tjatse. Enligt Snorres Skáldskaparmál fick Skade gottgörelse av gudarna efter faderns död och tilläts välja sig en make bland dem, men bara genom att betrakta deras fötter; hon valde de vackraste fötterna i tron att de tillhörde Balder, men det var Njord. Äktenskapet höll inte: Njord ville bo vid havet i Noatun medan Skade ville bo i bergen i Thrymheim, och när de inte kunde enas om hemvist skildes de. Detta är myt och tradition, inte en historisk händelse.',
    'Myt/tradition ur sena källor (Snorre ~1220, Poetiska Eddan ~1270). Berättelsen om fotvalet och den misslyckade gemensamma bosättningen finns i Skáldskaparmál. Redovisas som mytologiskt stoff, ej som historiskt faktum.',
    [SNORRE,PE_VG,MYTHO,BLOGG]],
   ['filolog','omstridt',0.55,
    'Njords barn Frej och Freja föddes enligt myten inte med Skade utan med en i källorna onämnd kvinna; i Lokasenna antyds att det skedde med Njords egen syster (vanernas seder tillät enligt traditionen syskonäktenskap). En filologisk hypotes kopplar denna namnlösa moder/syster till gudinnan Nerthus, som Tacitus beskriver omkring 98 e.Kr. (Germania), eftersom teonymerna Njǫrðr och Nerthus kan föras till samma germanska urform (till ie. roten *ner-). Kopplingen är dock omstridd: den vilar på en rekonstruerad språklig kontinuitet över närmare tusen år och en könsväxling (feminin Nerthus → maskulin Njǫrðr), och bör inte tas som fastställt faktum (jfr Per Vikstrands kritik mot lättvindiga teofora härledningar).',
    'Namnidentiteten Njǫrðr ~ Nerthus står stark på ljudlagsgrund, men att Nerthus vore Njords maka/syster är hypotes, ej belagt. Markeras omstritt. Belägg-ålder (Tacitus text ~98 e.Kr.) är inte detsamma som mytens eller kultens ålder.',
    [PE_LOKA,TACITUS,VIKSTRAND,MYTHO]],
  ]},
 {slug:'var-bodde-njord', sv:'Var bodde Njord?', en:'Where did Njord live?',
  variants:['var bodde njord','var bodde guden njord','var levde njord','njords hem','njords boning','noatun','where did njord live'],
  rank:40,
  lenses:[
   ['historiker','tolkning',0.72,
    'Enligt myten bodde Njord i Noatun, som brukar uttydas som "skeppens gård" eller "båtarnas plats". Boningen låg vid havet, vilket passar hans roll som gud knuten till hav och sjöfart. Uppgiften kommer ur eddatexterna och redovisas som mytologisk tradition, inte som en historisk plats.',
    'Myt/tradition. Noatun som Njords hem nämns i Grímnismál (Poetiska Eddan) och hos Snorre. Ej en historiskt belagd geografisk plats.',
    [PE_VG,SNORRE,MYTHO,BLOGG]],
   ['filolog','tolkning',0.62,
    'Det mytiska ortnamnet Nóatún tolkas som en sammansättning av fornnordiskans nór "skepp/farkost" (i genitiv plural) och tún "inhägnad gård/plats" — alltså ungefär "skeppens/båtarnas inhägnad". Uttydningen understryker den mytiska kopplingen mellan Njord och havet, men är en språklig tolkning av ett mytnamn, inte ett belägg för en verklig ort.',
    'Språklig uttydning av mytnamnet Nóatún (nór "skepp" + tún "gård/inhägnad"). Tolkning av litterärt namn; ingen belagd geografisk plats.',
    [PE_VG,MYTHO]],
  ]},
 {slug:'vilka-var-njords-barn', sv:'Vilka var Njords barn?', en:"Who were Njord's children?",
  variants:['vilka var njords barn','njords barn','vilka barn hade njord','vem var njords barn','who were njords children','njords söner och döttrar','njords avkomma'],
  rank:50,
  lenses:[
   ['historiker','tolkning',0.72,
    'Njords barn var enligt myten fruktbarhetsguden Frej och gudinnan Freja — två av de mest framträdande vanagudarna. Deras mor är inte namngiven i de bevarade källorna; i Lokasenna antyds att Njord fick dem med sin egen syster, i enlighet med den syskonäktenskaps-sed som myten tillskriver vanerna. Barnen föddes alltså inte med jättinnan Skade, som Njord gifte sig med senare. Allt detta är mytologiskt stoff ur sena källor och redovisas som tradition, inte som historia.',
    'Myt/tradition. Frej och Freja som Njords barn; modern onämnd (systern enligt Lokasenna). Skade var maka, inte barnens mor. Ej historiskt faktum.',
    [SNORRE,PE_LOKA,MYTHO,BLOGG]],
  ]},
 {slug:'vilket-gudaslakte-tillhorde-njord', sv:'Vilket gudasläkte tillhörde Njord?', en:'Which family of gods did Njord belong to?',
  variants:['vilket gudasläkte tillhörde njord','var njord en van eller as','vilken gudaätt tillhörde njord','tillhörde njord vanerna eller asarna','njord van eller as','was njord a vanir or aesir','var njord van'],
  rank:60,
  lenses:[
   ['historiker','tolkning',0.72,
    'Njord räknades till vanerna, det ena av mytologins två gudasläkten (det andra är asarna). Enligt myten kom han till asarna som fredsgisslan sedan asa-van-kriget avslutats med en uppgörelse där gudaätterna utväxlade gisslan — Njord sändes till asarna medan Höner gick till vanerna. Ett särdrag i traditionen är att Njord är ödesbestämd att överleva Ragnarök och återvända till vanerna vid gudarnas undergång. Detta är mytologisk tradition ur sena källor, inte en historisk händelse.',
    'Myt/tradition. Vanagud; gisslautväxling efter vanakriget (Snorre, med Höner till vanerna); återkomst till vanerna vid Ragnarök (Vafþrúðnismál). Redovisas som mytstoff.',
    [SNORRE,PE_VG,MYTHO,BLOGG]],
  ]},
 {slug:'vad-var-njord-gud-over', sv:'Vad var Njord gud över?', en:'What was Njord the god of?',
  variants:['vad var njord gud över','vad var njord gud för','vad rådde njord över','vad styrde njord över','njords domäner','what was njord god of','vad var njord gud över för något'],
  rank:70,
  lenses:[
   ['historiker','tolkning',0.72,
    'Njord framställs i myten som en gud knuten till havet, vinden, fisket, sjöfarten och rikedomen — sjöfararnas och fiskarnas beskyddare, som man åkallade för gynnsam vind och god fångst. Enligt sekundärkällor levde en folklig vördnad för honom kvar i Norge långt efter kristnandet, in på 1700-talet, där han tackades för god fiskelycka. Rollen och kulten redovisas som mytologisk och folklig tradition, inte som historiskt belagd teologi.',
    'Myt/folklig tradition. Njords domäner (hav, vind, fiske, sjöfart, rikedom) enligt eddatexterna; uppgiften om kvarlevande norsk folktro in på 1700-talet vilar på sekundärkällor. Markeras tolkning.',
    [SNORRE,PE_VG,MYTHO,BLOGG]],
  ]},
];

const njordId=(await q(`select id from faq_question where slug='vem-var-njord'`))[0].id;
const added=[];
for(const item of Q){
  const id=(await q(`insert into faq_question(slug,question_sv,question_en,variants,entity_type,status)
    values($1,$2,$3,$4,'deity','published')
    on conflict(slug) do update set question_sv=excluded.question_sv, question_en=excluded.question_en,
      variants=excluded.variants, entity_type='deity', status='published', updated_at=now()
    returning id`,[item.slug,item.sv,item.en,item.variants]))[0].id;
  // idempotens: rensa och skriv om lenses/bias för denna fråga
  await q(`delete from faq_answer_lens where question_id=$1 and agent_run_ref=$2`,[id,RUN]);
  await q(`delete from faq_bias_note where question_id=$1`,[id]);
  let sort=10;
  for(const [disc,st,cf,ans,ev,src] of item.lenses){
    await q(`insert into faq_answer_lens(question_id,discipline,answer_sv,evidence_sv,status,confidence,sources,review_status,agent_run_ref,sort)
      values($1,$2,$3,$4,$5,$6,$7,'verified',$8,$9)`,[id,disc,ans,ev,st,cf,src,RUN,sort]); sort+=10;
  }
  await q(`insert into faq_bias_note(question_id,bias_type,note_sv) values($1,'kalloverlevnad',$2)`,[id,BIAS_KALLA]);
  // länka in i Njords PAA-träd (njord -> underfråga)
  await q(`insert into faq_related(question_id,related_id,relation,rank) values($1,$2,'paa',$3)
    on conflict(question_id,related_id) do update set relation='paa', rank=excluded.rank`,[njordId,id,item.rank]);
  added.push(item.slug);
}
console.log('Tillagda/uppdaterade frågor:', added.join(', '));

// verifiering
const probes=['vem var gift med njord?','var bodde njord','vilka var njords barn?','vilket gudasläkte tillhörde njord','vad var njord gud över?'];
for(const p of probes){
  const r=(await q(`select get_faq($1) r`,[p]))[0].r;
  console.log(`\nget_faq('${p}') → ${r? r.question_sv : 'NULL'}`);
  if(r) console.log('   linser: '+r.lenses.map(l=>l.discipline+':'+l.status+' ('+(l.sources?.length||0)+' källor)').join(', ')+
                    ' | bias:'+r.bias.length);
}
// visa att de nu hänger under Njord
const nj=(await q(`select get_faq('vem var njord') r`))[0].r;
console.log('\nNjords PAA-träd:', nj.related.map(x=>x.slug).join(', '));
await c.end();

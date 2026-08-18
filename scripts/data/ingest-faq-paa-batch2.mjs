import pg from 'pg'; import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(s,p)=>(await c.query(s,p)).rows;
const RUN='paa:2026-08-19';
async function fill(slug, lenses, bias){
  const id=(await q(`select id from faq_question where slug=$1`,[slug]))[0].id;
  await q(`delete from faq_answer_lens where question_id=$1`,[id]);
  await q(`delete from faq_bias_note where question_id=$1`,[id]);
  let s=10;
  for(const [disc,st,cf,ans,ev,src] of lenses){
    await q(`insert into faq_answer_lens(question_id,discipline,answer_sv,evidence_sv,status,confidence,sources,review_status,agent_run_ref,sort)
      values($1,$2,$3,$4,$5,$6,$7,'verified',$8,$9)`,[id,disc,ans,ev,st,cf,src,RUN,s]); s+=10;
  }
  for(const [t,n] of bias) await q(`insert into faq_bias_note(question_id,bias_type,note_sv) values($1,$2,$3)`,[id,t,n]);
  await q(`update faq_question set status='published', updated_at=now() where id=$1`,[id]);
  const r=(await q(`select get_faq($1) r`,[slug]))[0].r;
  console.log(`${slug}: linser=${r?.lenses?.length} bias=${r?.bias?.length} status=published`);
}
// Q4
await fill('vad-var-varingarna',[
 ['historiker','belagt',0.90,'Väringar (fornnord. Væringjar, grek. Βάραγγοι) var nordiska — framför allt östnordiska/svenska — legoknektar, handelsmän och krigare verksamma på österleden genom Gårdarike (Rus) ned mot Konstantinopel (Miklagård). Från slutet av 900-talet organiserades många i Väringagardet, den bysantinske kejsarens elitlivvakt, en tjänst som gav lön, byte och prestige. Den mest kända enskilda väringen är den blivande norske kungen Harald Hårdråde, som enligt traditionen tjänstgjorde i Bysans på 1030-talet. Fenomenet är historiskt belagt oberoende av varandra i bysantinska källor och i svenska runstenar, medan de detaljerade äventyren i sagorna hör till en senare, litterär tradition.',
  'Belagt (hög tyngd): Væringar/Varangoi i bysantinska källor (Kekaumenos Strategikon ~1075, Psellos, Anna Komnenes Alexiaden) som identifierbar nordisk gardestrupp; oberoende av detta bär ett trettiotal Greklandsfarar-runstenar formler om män som "for/dog i Grekland". Två oberoende källtyper samstämmer → stark evidens. Svagare/traderat: Haralds konkreta gärningar i Heimskringla (1200-tal). Enskilda signa kräver Rundata-verifiering.',
  ['Kekaumenos, Strategikon (~1075–78)','Anna Komnene, Alexiaden; Michael Psellos, Chronographia','Greklandsfarar-runstenarna (Mälardalen; signa kräver verifiering mot Rundata)','Snorri Sturluson, Heimskringla — 1200-tal, litterär källa']],
 ['kulturgeograf','tolkning',0.82,'Kulturgeografiskt är väringafenomenet en fråga om vattenvägar: floderna genom dagens Ryssland och Ukraina band samman Östersjön med Svarta havet och Kaspiska havet. Från Ladoga och Volchov nådde man Holmgård (Novgorod), vidare mot Dnepr och Kiev och ned mot Miklagård, medan Volgavägen ledde mot bulgarernas rike och kalifatet varifrån silvret kom. Där flodsystemen inte möttes drogs fartyg och last över land (portage/drag), och forspassager — mest kända Dneprforsarna — var kritiska flaskhalsar. Kopplingen väringar–Rus är central men omdiskuterad; benämningen avser i öster oftast legosoldater/handelsmän, och Väringagardet är ett senare, institutionaliserat uttryck för samma östkontakt.',
  'Belagt: flodvägarnas geografi och knutpunkterna Staraja Ladoga/Novgorod/Kiev; Konstantin VII (De administrando imperio ~950) återger Dneprforsarnas namn i både "rhosisk" (fornnordisk) och slavisk form — direktbelägg för skandinavisk närvaro; dirham-skatter (Gotland/Mälardalen) belägger östhandelns volym; Ingvarsstenarna + Ibn Fadlan (922). Tolkning: etymologin "Rus" (róðr/Ruotsi) och väring=svear i varje enskilt fall är omdiskuterade.',
  ['Konstantin VII, De administrando imperio (~950), kap. 9','Ibn Fadlan, Risala (921–922)','Duczko, Viking Rus (2004)','SHM: dirham-skatter & Ingvarsstenarna (Mälardalen/Gotland)']],
],[
 ['perspektiv','Bysantinska källor speglar hovets perspektiv och framställer väringarna som exotiska, lojala "barbarer" — och beteckningen glider (varangoi kom senare även att omfatta anglosaxare). Runstenarna är minnesmonument med prestige-agenda, inte neutrala rapporter; sagatraditionen är hjältecentrerad och nedtecknad ~200 år senare (skilj händelseår från nedteckningsår).'],
 ['nationell','Skandinavernas roll i Rus statsbildning har av nationella skäl över- respektive underdrivits i den s.k. normanist-debatten (ryskt vs skandinaviskt) — etymologier och folkgruppsidentiteter är därför politiskt laddade och ska hållas som tolkning, inte fakta.'],
]);
// Q5
await fill('nar-slutade-vikingatiden',[
 ['historiker','tolkning',0.72,'Det konventionella slutåret 1066 (Stamford Bridge och Hastings) speglar ett engelskt perspektiv och passar dåligt på Skandinavien. Olika länder sätter olika slutpunkter, och forskningen betonar idag hellre processer än ett årtal: kristnandet, kungamaktens och kyrkans konsolidering samt övergången till medeltida statsbildning, ungefär 1050–1150. För Sverige och österleden löper kronologin delvis annorlunda, och en vanlig svensk konvention är cirka 1050 eller 1100 snarare än 1066. Periodgränser är historikers efterhandskonstruktioner, inte något samtiden upplevde — de fyller en ordnande funktion men markerar ingen skarp brytpunkt.',
  'Belagt: 1066 är den etablerade angloamerikanska konventionen, knuten till England; kristnande och statskonsolidering pågick i Skandinavien ~1000–1150. Tolkning: exakt slutår (1050 vs 1066 vs 1100) är en definitionsfråga utan källkonsensus; valet av markör (händelse vs process) styr svaret.',
  ['Sawyer (red.), The Oxford Illustrated History of the Vikings (1997)','Brink & Price (red.), The Viking World (2008)','Roesdahl, The Vikings (rev. 2016)','Nationalencyklopedin, "vikingatiden"']],
 ['arkeolog','tolkning',0.78,'Ur arkeologins perspektiv slutade vikingatiden inte ett bestämt år utan övergick gradvis i tidig medeltid. Den materiella kulturen visar kontinuitet snarare än brott: hedniska gravfält upphör och begravning flyttar till kyrkogårdar, det uppländska runstensresandet klingar av mot 1000-talets slut, och kyrkor, sockenbildning och tidiga städer etableras successivt. Traditionellt sätts en gräns kring 1050 (ibland 1100) i svensk periodisering, men detta är en forskningskonvention, inte en observerbar händelse i fyndmaterialet. Övergången är bäst beskriven som en process under 1000- och tidigt 1100-tal.',
  'Belagt: runstenskronologin (Gräslunds stilgrupper Pr1–Pr5) visar att modet toppar mitten av 1000-talet och avtar mot 1100; gravskicksskiftet hednisk→kristen kyrkogård är dokumenterat som gradvis process. Tolkning/omtvistat: var gränsen dras (750/800–1050 vs ~1100) varierar mellan forskare och regioner; kristnandets tempo skilde sig lokalt.',
  ['Anne-Sofie Gräslund, runstenskronologi (Pr1–Pr5)','Standardhandböcker i svensk arkeologi (vikingatid ~750/800–1050/1100)','Litteratur om kristnandeprocessen/gravskicksförändring']],
],[
 ['perspektiv','Slutåret 1066 är anglo-centriskt: det utgår från engelsk politisk historia och exporteras felaktigt som allmän skandinavisk periodgräns. En svensk/östnordisk lins ger annan kronologi. All periodisering är en tolkande konstruktion — runstenskronologin är dessutom uppländskt tyngd och generaliserar dåligt till hela Skandinavien.'],
]);
await c.end();

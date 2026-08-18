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
// Q1
await fill('var-bodde-vikingarna',[
 ['arkeolog','belagt',0.90,'Arkeologiskt är vikingatidens bebyggelse dominerad av landsbygd: de flesta bodde som bönder på enskilda gårdar eller i små byar, ofta med ett rektangulärt långhus med bostads- och fähusdel, omgivet av grophus, smedjor och förråd. Utgrävda handels- och hantverksplatser (proto-städer) som Birka i Mälaren, Hedeby/Haithabu i Slesvig, Kaupang i Vestfold och Ribe i Jylland visar tätare, säsongs- eller helårsbebodda miljöer, men de var undantag snarare än regel. Kolonisationens boplatser är också belagda: norröna gårdar på Island och Grönland (Brattahlíð), skandinavisk bosättning i Danelagen (York/Jorvik) och längs östliga flodvägar (Staraja Ladoga). Skillnaden gård–stad och platsernas exakta funktion är delvis tolkning byggd på fyndsammansättning och byggnadsplaner.',
  'Evidens: utgrävda huslämningar (stolphål, syllstenar, härdar), stratigrafi, kulturlager, fyndkontext, datering (C14/dendro/mynt). KAN belägga byggnaders form/funktion/datering; KAN INTE avgöra självbeteckning, exakt befolkning eller etnicitet ur lämningar.',
  ['Ambrosiani & Clarke, Birka och Hovgården (RAÄ)','Skre (red.), Kaupang in Skiringssal','Hedeby/Haithabu: von Carnap-Bornheim & Hilberg (ZBSA)','Roesdahl, The Vikings (Penguin 2016)']],
 ['kulturgeograf','belagt',0.72,'Bosättningen var koncentrerad till kärnbygder med god odlingsmark och farleder: östra Mellansverige (Mälardalen, Uppland), Sydskandinavien (Skåne, Själland, Jylland), norska Vestlandet med fjordarna, samt Gotland och Öland. Bebyggelsen låg i regel spridd — enstaka gårdar och små byar på höjder ovanför dåtidens strandlinje, inte i tätorter — organiserad kring centralplatser (Uppåkra, Tissø, Gamla Uppsala, Helgö/Birka). Landskapet läses som palimpsest: gravfält, ortnamn (äldre -tuna, -sta, -hem) och odlingsspår visar var bebyggelsen fanns och hur den vandrade. Expansionen skedde åt två håll med olika logik — kolonisation av glest bebodd mark i Nordatlanten mot handels-/plundringsorienterad närvaro i österled.',
  'Metod (bebyggelsearkeologi + kartanalys + ortnamnskronologi + strandförskjutning) KAN visa gårdars/gravfälts läge och samband med mark/vatten; KAN INTE ge exakta folkmängder eller bevisa samtidighet mellan platser. Belagt: kärnbygder + centralplatser. Tolkning: territoriell räckvidd, namndatering.',
  ['Stefan Brink, centralplatsforskning','Fabech & Näsman (red.), centralplatser i Sydskandinavien','Dan Carlsson, bebyggelse/hamnar på Gotland','SOL (Svenskt ortnamnslexikon 2003)']],
],[
 ['kalloverlevnad','Utgrävningarna är snedfördelade mot spektakulära, välbevarade platser (proto-städer, elitgårdar), medan vanliga småbönders anläggningar är underrepresenterade; bevarandebias gynnar sten-/stolpkonstruktioner och detektorförande elitmiljöer. "Proto-stad"/"stad" är en modern kategori som riskerar att projicera senare urbanitet bakåt.'],
]);
// Q2
await fill('vad-betyder-ordet-viking',[
 ['filolog','belagt',0.78,'Fornnordiskan skilde på víkingr (mask.) = personen (sjökrigaren/plundraren, även mansnamn/tillnamn) och víking (fem.) = själva företaget, den kombinerade rov- och handelsfärden till sjöss. Det var en syssla man ägnade sig åt, inte ett folk; det stående uttrycket är "fara í víking". Ordet är belagt i runsvenskan på 900–1000-talet, men fornengelska wīcing är belagt tidigare (700–800-tal, glossat med latinets piraticum "sjöröveri"). Etymologin är omstridd: konkurrerande förslag knyter ordet till vík "vik" (ev. landskapet Viken), vika "roddarskifte/sjömil" (roddarhypotesen, Heide/Daggfeldt), forneng. wīc/lat. vicus "handelsplats", eller víkja "vika av". Den etniska betydelsen "viking = folkslag" är en yngre, romantiserande omtolkning från 1800-talet.',
  'Belagt: skillnaden víkingr (person) vs víking (färd) och frasen "fara í víking"; wīcing (Épinal-Erfurt ~700, Widsith) äldre än nordiska runbelägg. Runsigna kräver verifiering mot Rundata (citeras ej ur minnet). Ordbetydelsen belagd; ursprunget tolkning — ingen av de fyra hypoteserna bevisad.',
  ['de Vries, Altnordisches etym. Wörterbuch (1962)','Eldar Heide, "Víking — rower shifting?", ANF 120 (2005); jfr Daggfeldt, Fornvännen 78 (1983)','Askeberg, Norden och kontinenten i gammal tid (1944)','Hellquist, Svensk etymologisk ordbok (1922)']],
 ['historiker','belagt',0.85,'"Viking" var i samtiden ovanligt som självbenämning. Fornnordiskan har víkingr (person) och víking (färden), belagt på runstenar och i skaldediktning, men ofta med specifik eller negativ innebörd — en verksamhet, inte en identitet. Samtida omvärld kallade dem efter härkomst eller karaktär: frankiska annaler Nordmanni/Dani (Normanni), i öst Rus, kristna källor nedsättande pagani/"hedningar". Att "viking" idag betecknar en hel epok (~793–1066) och ett romantiserat sjöfararfolk är en modern lärd konstruktion: både periodbegreppet "vikingatiden" och ordets laddning fick sin form under 1800-talets nationalromantik.',
  'Belagt: exonymerna Nordmanni/Dani, Rus, pagani; víkingr/víking i runinskrifter (Rundata) och skaldik. Tolkning: etymologin. Belagt men tolkande syntes: den moderna innebörden är en 1800-talskonstruktion. Källkritik: skaldik/sagor sent nedtecknade (1200-tal), runstenar samtida men fåordiga.',
  ['Judith Jesch, The Viking Diaspora (2015)','Brink & Price (red.), The Viking World (2008)','Andrew Wawn, The Vikings and the Victorians (2000)','Rundata (Samnordisk runtextdatabas)']],
],[
 ['nationell','Populära framställningar övertar 1800-talets nationalromantiska etnifiering ("vikingarna som folk") och presenterar ofta vík "bukt" som den säkra etymologin — men källorna ger ordet som en syssla, och ursprunget är olöst.'],
 ['perspektiv','Nordister tenderar att hålla ordet för (ur)nordiskt medan anglister lyfter det tidiga fornengelska belägget (wīcing, ~700) — vilken lins man väljer färgar slutsatsen om ordets hemvist.'],
]);
// Q3
await fill('fanns-kvinnliga-vikingar',[
 ['osteolog','belagt',0.90,'Ja — biologiskt fanns kvinnor i alla vikingatida populationer, och det är mätbart. Skilj två frågor: biologiskt kön (skattas ur pelvis-/kraniemorfologi, säkras med aDNA) och social roll (tolkas ur gravkontext). Att kvinnor deltog i samhällena är belagt; att enskilda kvinnor var "krigare" är en tolkning som prövas grav för grav, inte en generell osteologisk slutsats. Birka Bj 581 — länge tolkad som manlig krigargrav p.g.a. vapengåvor — är genetiskt XX och osteologiskt förenlig med kvinna (Hedenstierna-Jonson 2017); krigarfunktionen bygger dock på gravgodset, inte på belagt vapentrauma, och är omstridd (Price 2019). Kön ur ben är alltid en probabilistisk skattning, inte en identitet.',
  'Belagt: Bj 581 biologiskt kvinna (aDNA). Omtvistat/tolkning: krigarrollen (ur gravgåvor, ej vapentrauma; frågan om benen hör till gåvorna). Observation (vapen i grav) ≠ tolkning ("krigare"). Kvinnor generellt beskrivbara via ålder/patologi/belastning — som skattningar med intervall.',
  ['Hedenstierna-Jonson et al. 2017, Am J Phys Anthropol 164:853–860','Price et al. 2019, Antiquity 93:181–198','Buikstra & Ubelaker 1994, Standards for Data Collection']],
 ['historiker','omstridt',0.80,'Ja och nej — det beror på vad man menar. Den beväpnade "sköldmön" (skjaldmær) och valkyrian är framför allt ett LITTERÄRT motiv i sena isländska sagor och hos Saxo Grammaticus (nedtecknat 1200-tal, långt efter vikingatiden) och kan inte tas som samtida belägg för kvinnliga krigare. Att kvinnor kunde begravas med vapen är arkeologiskt belagt (Bj 581, genetiskt kvinna) — men krigarfunktionen är en tolkning av gravgodset och omstridd. Kvinnors väl dokumenterade roller var handel, hushållsmakt (nyckelmakt), kult/religion (völva), samt som arvtagare och beställare av minnesmärken — flera runstenar restes av kvinnor. Skilj det litterära sköldmö-motivet från det historiskt belagda; kvinnors reella maktpositioner behövde inte krig för att vara betydande.',
  'Belagt: kvinnor som runstensresare och egendomsförvaltare (samtida primärkällor). Belagt men tolkat: Bj 581. Litterärt/traderat: skjaldmær/valkyria i sagor och Saxo (1200-tal) — sen, tendentiös, delvis mytisk.',
  ['Saxo Grammaticus, Gesta Danorum (~1200; litterär källa)','Hedenstierna-Jonson et al. 2017 (Bj 581)','Price et al. 2019','Judith Jesch, Women in the Viking Age (1991)']],
],[
 ['genus','Genusbias verkar åt BÅDA håll: äldre forskning läste automatiskt vapengravar som manliga (androcentrisk feltilldelning av kön ur artefakter), medan ett motsatt tryck kan överdriva enskilda fynd till en generell "kvinnliga krigare"-berättelse. Korrektiv: låt biologiskt kön avgöras av morfologi/aDNA, inte av gravgåvor, och håll isär kön (mätning) från könsroll (tolkning). Frånvaro av vapengrav bevisar inte frånvaro av kvinnors makt.'],
 ['kalloverlevnad','Sköldmö-/valkyriemotivet vilar på sena källor (sagor, Saxo, 1200-tal) som är tendentiösa och delvis mytiska — risk för anakronism om de läses som samtida fakta.'],
]);
await c.end();

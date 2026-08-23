// Stagear filolog-agentens källbelagda betydelse+etymologi+tradition_layer (axel 1+2) → name_authority.
// Kurerad kärnbatch ur filolog-dossién (NRL/Peterson, SOL, Wiktionary CC BY-SA; egen prosa).
// notes_sv får kort proveniens. tradition_layer = axel 2 (var NULL, gissades ej maskinellt).
import pg from 'pg';import {readFileSync} from 'node:fs';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
// [canonical, tradition_layer, origin_language, meaning, etymology, theophoric, source]
const T_FN='fornnordiskt', T_TE='fornnordiskt-teofort', T_BI='bibliskt-kristet', T_KL='klassiskt', T_LT='lågtyskt-tyskt';
const NRL='Nordiskt runnamnslexikon (Peterson/Isof)', WIK='Wiktionary (CC BY-SA)';
const D=[
// FORNNORDISKT
['Björn',T_FN,'fornnordiska','björn','Fornnord. Bjǫrn till bjǫrn "björn"; även kortform till Bjǫrn-namn.',false,NRL],
['Sigrid',T_FN,'fornnordiska','seger + skön/älskad','Sigríðr av sigr "seger" + fríðr "vacker, älskad".',false,NRL],
['Sten',T_FN,'fornnordiska','sten','Steinn "sten", el. kortform till Sten-namn.',false,NRL],
['Ulf',T_FN,'fornnordiska','varg','Ulfr "varg".',false,NRL],
['Orm',T_FN,'fornnordiska','orm, drake','Ormr "orm, drake".',false,NRL],
['Rolf',T_FN,'fornnordiska','ärorik varg','Sammandraget av Hróðulfr: hróðr "ära" + ulfr "varg".',false,NRL],
['Dag',T_FN,'fornnordiska','dag','Dagr "dag".',false,NRL],
['Finn',T_FN,'fornnordiska','finne/same','Finnr, folkslagsbeteckning; även kortform.',false,NRL],
['Erling',T_FN,'fornnordiska','jarlens ättling','Till jarl/erl "förnäm man" + patronymiskt -ling.',false,NRL],
['Halfdan',T_FN,'fornnordiska','halvdansk','Halfr "halv" + Danr "dan(sk)".',false,NRL],
['Sven',T_FN,'fornnordiska','ung man, dräng','Fornnord. sveinn "yngling, tjänare, väpnare".',false,NRL],
['Sune',T_FN,'fornnordiska','son','Sún(i) till sonr/sunr "son".',false,NRL],
['Viking',T_FN,'fornnordiska','viking, sjökrigare','Personnamnet Víkingr till víkingr.',false,NRL],
['Helga',T_FN,'fornnordiska','helig, invigd','Fem. av Helgi, till heilagr "helig".',false,NRL],
['Disa',T_FN,'fornnordiska','gudinna/skyddsande','Dísa, kortform till -dís-namn, till dís "kvinnlig skyddsmakt".',false,NRL],
['Gerda',T_FN,'fornnordiska','inhägnad/skydd','Jättinnenamnet Gerðr (Freyrs brud), till garðr "gård, inhägnad".',false,NRL],
['Gunnhild',T_FN,'fornnordiska','strid + strid','Gunnr "strid" + hildr "strid" — tautologiskt kampnamn.',false,NRL],
['Ragnhild',T_FN,'fornnordiska','gudamakter + strid','Regin "rådande makter" + hildr "strid".',false,NRL],
['Håkan',T_FN,'fornnordiska','högättad son','Hákon < *hauha-kunjaz: há- "hög, förnäm" + konr "ätt, son".',false,NRL],
// TEOFORT
['Tor',T_TE,'fornnordiska','åskguden Tor','Gudanamnet Þórr < urgerm. *Þunraz "åska".',true,NRL],
['Tyr',T_TE,'fornnordiska','himmels-/krigsguden','Týr < urgerm. *Tīwaz < ie. *deiu̯ós "gud, himmel" (kognat lat. deus, grek. Zeus).',true,NRL],
['Frej',T_TE,'fornnordiska','herre','Gudanamnet Freyr < urgerm. *frawjaz "herre".',true,NRL],
['Freja',T_TE,'fornnordiska','härskarinna','Gudinnan Freyja < urgerm. *frawjōn "härskarinna".',true,NRL],
['Brage',T_TE,'fornnordiska','den främste/skalden','Skaldeguden Bragi, till bragr "diktning; det förnämsta".',true,NRL],
['Yngve',T_TE,'fornnordiska','Frejs binamn','Gudanamnet Yngvi (= Freyr); förled Ing(un)-.',true,NRL],
['Ingegerd',T_TE,'fornnordiska','Ings skydd','Ing(v)i (gud) + gerðr "skydd" (till garðr).',true,NRL],
['Torbjörn',T_TE,'fornnordiska','Tors björn','Þórbjǫrn: Þórr + bjǫrn.',true,NRL],
['Torkel',T_TE,'fornnordiska','Tors offergryta','Þórketill: Þórr + ketill "offerkittel".',true,NRL],
['Åsbjörn',T_TE,'fornnordiska','gudabjörn','Ásbjǫrn: áss "asagud" + bjǫrn.',true,NRL],
['Estrid',T_TE,'fornnordiska','gudaskön','Ástríðr: áss "asagud" + fríðr "skön/älskad".',true,NRL],
['Astrid',T_TE,'fornnordiska','gudaskön','Ástríðr; vanligaste moderna formen (se Estrid).',true,NRL],
['Saga',T_TE,'fornnordiska','gudinnan Sága','Fornnord. Sága, trol. till sjá "se" el. saga "berättelse".',true,NRL],
// BIBLISKT-KRISTET
['Adam',T_BI,'hebreiska','människa; av jord','Hebr. ʾāḏām "människa", till ʾăḏāmā "jord".',false,WIK],
['Anna',T_BI,'hebreiska','nåd, ynnest','Grek. form av hebr. Ḥannā "nåd".',false,WIK],
['David',T_BI,'hebreiska','den älskade','Hebr. Dāwīḏ "älskad".',false,WIK],
['Isak',T_BI,'hebreiska','han skrattar','Hebr. Yiṣḥāq "han (Gud) ler"; runform Ísakr.',false,WIK],
['Jakob',T_BI,'hebreiska','efterträdaren','Hebr. Yaʿăqōḇ "han griper hälen".',false,WIK],
['Josef',T_BI,'hebreiska','(Gud) skall föröka','Hebr. Yôsēp̄.',false,WIK],
['Simon',T_BI,'hebreiska','(Gud) har hört','Grek. form av hebr. Šimʿōn.',false,WIK],
['Johannes',T_BI,'hebreiska','Jahve är nådig','Hebr. Yôḥānān; Jón är fornnord. reflexen.',false,WIK],
['Johan',T_BI,'hebreiska','Jahve är nådig','Kortform av Johannes (< hebr. Yôḥānān).',false,WIK],
['Gabriel',T_BI,'hebreiska','Gud är min styrka','Hebr. Gaḇrīʾēl.',false,WIK],
['Mikael',T_BI,'hebreiska','vem är som Gud?','Hebr. Mīḵāʾēl.',false,WIK],
['Elias',T_BI,'hebreiska','Jahve är min Gud','Grek. form av hebr. Ēlīyāhū.',false,WIK],
['Peter',T_BI,'grekiska','sten, klippa','Grek. Pétros (övers. av aram. Kēfāʾ).',false,WIK],
['Per',T_BI,'grekiska','sten, klippa','Nord. folkform av Petrus (< grek. Pétros).',false,WIK],
['Anders',T_BI,'grekiska','manlig, tapper','Nord. form av Andreas < grek. Andréas till anḗr "man".',false,WIK],
['Nils',T_BI,'grekiska','folkets seger','Nord. kortform av Nikolaus < grek. Nikólaos: níkē + laós.',false,WIK],
['Noah',T_BI,'hebreiska','vila, tröst','Hebr. Nōaḥ.',false,WIK],
['Axel',T_BI,'hebreiska','fadern är frid','Nord. form av Absalon < hebr. Aḇšālōm.',false,WIK],
['Elsa',T_BI,'hebreiska','min Gud är (min) ed','Kortform av Elisabet (< hebr. Ĕlīšeḇaʿ).',false,WIK],
['Lucia',T_KL,'latin','den ljusa','Lat. lux, lucis "ljus"; kristet helgonnamn.',false,WIK],
['Theodor',T_KL,'grekiska','Guds gåva','Grek. Theódōros: theós "gud" + dôron "gåva".',false,WIK],
// KLASSISKT
['Lukas',T_KL,'grekiska','man från Lucania','Grek. Loukâs, kortform av Loukanós.',false,WIK],
['Markus',T_KL,'latin','tillägnad Mars','Lat. Mārcus, avlett av krigsguden Mars.',false,WIK],
['Mårten',T_KL,'latin','krigisk (Mars)','Lat. Martīnus av Mars; helgon Martin av Tours.',false,WIK],
['Magnus',T_KL,'latin','stor, mäktig','Lat. magnus "stor"; in i nord. via Magnús inn góði (1000-t).',false,NRL],
['Alexander',T_KL,'grekiska','manförsvarare','Grek. Aléxandros: aléxein "skydda" + anḗr "man".',false,WIK],
['August',T_KL,'latin','upphöjd, vördad','Lat. augustus (kejsartitel).',false,WIK],
['Leo',T_KL,'latin','lejon','Lat. leō / grek. léōn.',false,WIK],
['Frans',T_KL,'latin','frank, fransman','Lat. Franciscus; helgon Franciskus.',false,WIK],
// LÅGTYSKT-TYSKT / GERMANSKT
['Vilhelm',T_LT,'tyska','beslutsam beskyddare','Germ. Willahelm: willo "vilja" + helm "hjälm, skydd".',false,WIK],
['William',T_LT,'tyska','beslutsam beskyddare','Eng./germ. form av Vilhelm.',false,WIK],
['Hans',T_LT,'tyska','Jahve är nådig','Lågty. kortform av Johannes.',false,WIK],
['Fredrik',T_LT,'tyska','fridfull härskare','Germ. Frithurīk: fridu "fred" + rīk "mäktig".',false,WIK],
['Karl',T_LT,'germanska','fri man','Germ. karl "karl, fri man"; spritt via Karl den store.',false,NRL],
['Hugo',T_LT,'tyska','sinne, tanke','Germ. hugu "sinne, förstånd".',false,WIK],
['Otto',T_LT,'tyska','arv, rikedom','Germ. kortform av Aud-/Od-namn, till auda "egendom".',false,WIK],
['Ludvig',T_LT,'tyska','berömd kämpe','Germ. Hlūdwīg: hlūd "berömd" + wīg "strid".',false,WIK],
['Henrik',T_LT,'tyska','hemmets härskare','Germ. Haimirīk: haim "hem" + rīk "mäktig".',false,WIK],
['Alfred',T_LT,'fornengelska','alf-råd','Fornengelska Ælfrǣd: ælf "alf" + rǣd "råd".',false,WIK],
['Edvard',T_LT,'fornengelska','egendomens väktare','Fornengelska Ēadweard: ēad "rikedom" + weard "väktare".',false,WIK],
['Alice',T_LT,'tyska','av ädel art','Fr. Aalis < germ. Adalheidis: aþala "ädel" + heid "art".',false,WIK],
];
let n=0;
for(const [can,tl,ol,me,et,theo,src] of D){
  const r=await c.query(`update name_authority set tradition_layer=$2, origin_language=$3, meaning=coalesce($4,meaning),
    etymology=$5, theophoric=$6, notes_sv=coalesce(notes_sv, $7), updated_at=now() where lower(canonical)=lower($1)`,
    [can,tl,ol,me,et,theo,'Etymologi: '+src+' (filolog-agent, egen prosa)']);
  if(r.rowCount) n++; else console.log('  saknas i name_authority:',can);
}
console.log(`KLART — ${n}/${D.length} namn fick etymologi + tradition_layer.`);
const q=async t=>(await c.query(t)).rows;
console.log('tradition_layer-fördelning:',JSON.stringify(await q(`select tradition_layer, count(*)::int n from name_authority where tradition_layer is not null group by 1 order by 2 desc`)));
console.log('teofora:',JSON.stringify(await q(`select count(*)::int n from name_authority where theophoric`)));
console.log('stickprov Anna:',JSON.stringify(await q(`select canonical,meaning,etymology,tradition_layer,origin_language,swedish_usage_layer,name_day_text,total_bearers from name_authority where canonical='Anna'`),null,1));
await c.end();

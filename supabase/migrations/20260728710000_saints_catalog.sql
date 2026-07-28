-- Helgonkatalog (Daniel: "har vi alla skyddshelgon?"). Referenstabell bakom patron_saint —
-- som language_periods bakom språk. Bär forskningsdimensionerna: typ, kön, kult-era, inhemsk/
-- nordisk, festdag, regional betydelse, skyddsområde. Varianter normaliserar röran
-- (Örjan/Jörgen/Göran/Georgios=Georg; Petri/Peter=Petrus; Hans/Johannis=Johannes; Britas=Birgitta).
-- Källor: Wikipedia (Erik/Olof d.h.), SHM/Historiska museet (Anna/Barbara/Birgitta/Maria), standard
-- hagiografi. Kön+era gör dedikationstrender mätbara (Olof/Erik tidig-kungligt vs Anna/Birgitta senmedeltid-kvinnligt).
create table if not exists public.saints (
  code text primary key,
  name text not null, name_en text,
  variants text[] default '{}',
  saint_type text,            -- royal_martyr|native_missionary|apostle|evangelist|virgin_martyr|marian|archangel|confessor|birgittine|martyr
  gender text,                -- M|F
  lived_from int, lived_to int,
  cult_era text,              -- vikingatid|tidig_medeltid|hogmedeltid|senmedeltid
  feast_day text,
  is_native_nordic boolean default false,
  region_significance text,
  patron_of text,
  source text
);
alter table public.saints enable row level security;
do $$ begin if not exists (select 1 from pg_policies where tablename='saints' and policyname='saints_read')
  then create policy saints_read on public.saints for select using (true); end if; end $$;

insert into public.saints (code,name,name_en,variants,saint_type,gender,lived_from,lived_to,cult_era,feast_day,is_native_nordic,region_significance,patron_of,source) values
 ('olof','Olof den helige','St Olaf','{Olof,Olov,Olav,Olofs,Olovs,Olai}','royal_martyr','M',995,1030,'vikingatid','29 juli (Olsmässa)',true,'Nordens första + mest populära helgon; stark i Medelpad/Jämtland; kungahelgon','Sjömän på Östersjön, bönder','Wikipedia (Olof Haraldsson)'),
 ('erik','Erik den helige','St Eric','{Erik,Eriks,Erici}','royal_martyr','M',1125,1160,'hogmedeltid','18 maj',true,'Sveriges nationalhelgon + Stockholms skyddshelgon; Erikska ätten; ej påvligt kanoniserad','Stockholm; kungar','Wikipedia (Erik den helige)'),
 ('knut','Knut den helige','St Canute','{Knut,Knuts}','royal_martyr','M',1042,1086,'tidig_medeltid','10 juli',true,'Dansk kungahelgon; ofta med Olof+Erik (tre nordiska kungahelgon)','—','standard'),
 ('maria','Jungfru Maria','Virgin Mary','{Maria,Marie,Vårfru,Marias}','marian','F',null,null,'vikingatid','flera (bl.a. 15 aug, 8 sep)',false,'Stod närmast Kristus; altare i nästan varje kyrka; vanligaste dedikationen; kult även på vardagsföremål (Maria-ring, Borgholm 1400-tal)','Alla; barnaföderskor','SHM/Historiska museet'),
 ('anna','Sankta Anna','St Anne','{Anna,Annas}','confessor','F',null,null,'senmedeltid','9 december',false,'Marias moder; ett av 1400-talets mest populära helgon; "Anna själv-tredje"','Blivande mödrar, bergsmän','SHM/Historiska museet'),
 ('barbara','Sankta Barbara','St Barbara','{Barbara,Barbro}','virgin_martyr','F',null,300,'senmedeltid','4 december',false,'En av de fyra huvudjungfrurna','Gruvarbetare, artillerister, byggnadsarbetare, arkitekter','SHM/Historiska museet'),
 ('birgitta','Heliga Birgitta','St Bridget of Sweden','{Birgitta,Birgittas,Brita,Britas,Birgittakyrkan}','birgittine','F',1303,1373,'senmedeltid','23 juli (7 okt translation)',true,'Grundade Vadstena/Birgittinorden; kanoniserad 1391; en av Europas tre kvinnliga skyddshelgon','Änkor, pilgrimer, Europa','SHM/Historiska museet'),
 ('katarina','Katarina av Alexandria','St Catherine','{Katarina,Katharina,Karin}','virgin_martyr','F',null,305,'senmedeltid','25 november',false,'En av huvudjungfrurna','Bibliotekarier, filosofer, predikanter','standard'),
 ('gertrud','Sankta Gertrud','St Gertrude','{Gertrud,Gertruds}','confessor','F',626,659,'hogmedeltid','17 mars',false,'Gillehelgon; resandes/köpmäns skydd (Gertrudsgillen)','Resande, pilgrimer, härbärgen','standard'),
 ('helena','Sankta Helena (av Skövde)','St Helena','{Helena,Elin,Elins}','martyr','F',null,1160,'hogmedeltid','31 juli',true,'Inhemskt kvinnligt helgon, Västergötland (Skövde)','—','standard'),
 ('sigfrid','Sankt Sigfrid','St Sigfrid','{Sigfrid,Sigfrids}','native_missionary','M',null,1045,'tidig_medeltid','15 februari',true,'Engelsk missionsbiskop; Växjö stift; döpte enligt legenden Olof Skötkonung','Växjö; Småland','Sigfridslegenden'),
 ('eskil','Sankt Eskil','St Eskil','{Eskil,Eskils}','native_missionary','M',null,1080,'tidig_medeltid','12 juni',true,'Engelsk missionsmartyr; Södermanland (Eskilstuna)','Södermanland','standard'),
 ('botvid','Sankt Botvid','St Botvid','{Botvid,Botvids}','native_missionary','M',null,1120,'tidig_medeltid','28 juli',true,'Inhemskt svenskt helgon; Botkyrka (kyrka rest av brodern)','Södermanland','standard'),
 ('henrik','Sankt Henrik','St Henry','{Henrik,Henriks,Herva}','native_missionary','M',null,1156,'tidig_medeltid','19 januari (Hindersmässa)',true,'Finlands apostel/nationalhelgon; martyr (bonden Lalli)','Finland','Wikipedia'),
 ('ansgar','Ansgar','St Ansgar','{Ansgar,Ansgars}','native_missionary','M',801,865,'vikingatid','3 februari',false,'Nordens apostel; grundade första kristna församlingen i Birka ~829','Norden; mission','standard'),
 ('nikolaus','Sankt Nikolaus','St Nicholas','{Nikolaus,Nicolai,Nikolai,Nicolaus,Niklas,Nils}','confessor','M',270,343,'hogmedeltid','6 december',false,'Biskop av Myra; handelsstädernas helgon (Nicolai-kyrkor = köpstäder)','Sjömän, köpmän, barn','standard'),
 ('goran','Sankt Göran','St George','{Göran,Görans,Örjan,Örjans,Jörgen,Jörgens,Georgios,Georg,Ibbs}','martyr','M',null,303,'senmedeltid','23 april',false,'Drakdödaren; Sankt Göran och draken (Stockholm, Notke 1489)','Riddare, bönder, soldater','standard'),
 ('laurentius','Sankt Laurentius','St Lawrence','{Laurentius,Lars,Laurentii,Laurentiuskyrkan,Lorens}','martyr','M',225,258,'hogmedeltid','10 augusti',false,'Diakonmartyr (halstret)','Kockar, bibliotekarier','standard'),
 ('mikael','Ärkeängeln Mikael','Archangel Michael','{Mikael,Mikaels,Mikaelskyrkan,Michael}','archangel','M',null,null,'vikingatid','29 september (Mickelsmäss)',false,'Själavägaren; soldaters skydd','Soldater, handlare, polis','standard'),
 ('johannes','Johannes','St John','{Johannes,Johannis,Hans,Johanneskyrkan,Johan}','apostle','M',null,null,'hogmedeltid','24 juni (Döparen) / 27 dec (ev.)',false,'Döparen och/eller evangelisten (namnform skiljer ej alltid)','Många','standard'),
 ('petrus','Sankt Petrus','St Peter','{Petrus,Petri,Peter,Peters,Peterskyrkan,Per,Peder}','apostle','M',null,64,'hogmedeltid','29 juni',false,'Apostlafursten; ofta med Paulus','Fiskare, påvar, byggmästare','standard'),
 ('paulus','Sankt Paulus','St Paul','{Paulus,Pauli,Pauls,Paulskyrkan,Pål}','apostle','M',5,67,'hogmedeltid','29 juni',false,'Hednamissionären; ofta med Petrus','—','standard'),
 ('andreas','Sankt Andreas','St Andrew','{Andreas,Anders}','apostle','M',null,60,'hogmedeltid','30 november',false,'Aposteln; fiskare','Fiskare, fiskhandlare','standard'),
 ('jakob','Sankt Jakob','St James','{Jakob,Jacob,Jacobs}','apostle','M',null,44,'hogmedeltid','25 juli',false,'Jakob den äldre; Santiago-pilgrimsmål','Pilgrimer, körsnärer','standard'),
 ('matteus','Sankt Matteus','St Matthew','{Matteus,Mattias,Mats}','evangelist','M',null,null,'hogmedeltid','21 september',false,'Evangelist','Bokhållare, tulltjänstemän','standard'),
 ('lukas','Sankt Lukas','St Luke','{Lukas,Lucas}','evangelist','M',null,null,'hogmedeltid','18 oktober',false,'Evangelist','Läkare, konstnärer','standard'),
 ('markus','Sankt Markus','St Mark','{Markus,Marks}','evangelist','M',null,null,'hogmedeltid','25 april',false,'Evangelist','—','standard'),
 ('tomas','Sankt Tomas','St Thomas','{Tomas,Thomas}','apostle','M',null,72,'hogmedeltid','3 juli',false,'Tvivlaren; arkitekter','Arkitekter','standard'),
 ('clemens','Sankt Clemens','St Clement','{Clemens,Klemens}','confessor','M',null,99,'vikingatid','23 november',false,'Sjömäns helgon; Clemenskyrkor ofta TIDIGA (vikingatida handelsplatser)','Sjömän','standard'),
 ('stefan','Sankt Stefan','St Stephen','{Stefan,Stefans,Staffan}','martyr','M',null,34,'hogmedeltid','26 december',false,'Protomartyren; Staffan stalledräng-traditionen','Hästar, murare','standard'),
 ('martin','Sankt Martin','St Martin','{Martin,Martins,Mårten,Mårtens}','confessor','M',316,397,'hogmedeltid','11 november (Mårtensmäss)',false,'Martin av Tours','Soldater, tiggare','standard'),
 ('ursula','Sankta Ursula','St Ursula','{Ursula,Ursulas}','virgin_martyr','F',null,383,'senmedeltid','21 oktober',false,'11000 jungfrur-legenden','—','standard'),
 ('elav','Sankt Elav','St Elavus','{Elav,Elavi,Elov,Elof}','martyr','M',null,null,'hogmedeltid',null,true,'Lokalt öländskt/småländskt helgon (Sankt Elavi kapell)','Öland','standard')
on conflict (code) do nothing;

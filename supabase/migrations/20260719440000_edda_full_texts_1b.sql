-- Edda full texts batch 1b: 8 priority poems (Old Norse + Swedish Brate). English (Bellows) deferred.
-- Sources: Guðni Jónsson, Eddukvæði/Sæmundar-Edda (norrønt, PD) / Erik Brate, Sämunds Edda 1913 (sv, PD). Verbatim; NULL where that language lacks the stanza.
-- NOTE 1: Bellows (1923 English) omitted here because he systematically reorders/renumbers stanzas vs the Guðni/Brate edition; safe alignment requires per-stanza verification (future batch).
-- NOTE 2: Sången om Hamder is Norse-only: Brate arranges Hamðismál in a different stanza order than the Guðni edition, so Swedish cannot be aligned by stanza number (future crosswalk batch).
-- Idempotent: WHERE NOT EXISTS on (source_id, stanza_no). Joins historical_sources by title + work_type='edda_poem'.

-- ===== Sången om Fafner (favner) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Sveinn ok sveinn,
hverjum ertu svein of borinn?
Hverra ertu manna mögr,
er þú á Fáfni rautt
þinn inn frána mæki?
Stöndumk til hjarta hjörr."$txt$, $txt$»Du sven, du sven,
som son åt vem är, sven, du född,
som vilka människors barn är du boren,
då på Favner du blodade
det blixtrande svärdet;
i mitt hjärta jagad är klingan»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Göfugt dýr ek heiti,
en ek gengit hefk
inn móðurlausi mögr,
föður ek ákk-a
sem fira synir;
æ geng ek einn saman."$txt$, $txt$»Härligt djur jag heter
och har hankat mig fram
som en man utan moder,
fader jag har ej,
som folk brukar,
jag vandrar i världen ensam.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Veiztu, ef föður né átt-at
sem fira synir,
af hverju vastu undri alinn?"$txt$, $txt$»Vet du, om fader du ej har,
som folk brukar,
av vad under blev du avlad?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Ætterni mitt
kveð ek þér ókunnigt vera
ok mik sjalfan it sama;
Sigurðr ek heiti,
Sigmundr hét minn faðir,
er hefk þik vápnum vegit."$txt$, $txt$»Min ätt jag säger
dig okänd vara
och likaledes mig själv.
Sigurd jag heter,
Sigmund hette min fader,
med svärd jag dig slagit har.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Hverr þik hvatti?
Hví hvetjask lézt
mínu fjörvi at fara?
Inn fráneygi sveinn,
þú áttir föður bitran;
óbornum skjór á skeið."$txt$, $txt$»Vem hetsade dig,
vi har du hetsa dig låtit
att fara efter mitt fall?
Bjärtögde sven,
bister fader hade du,
fram att rusa hans barn icke rädas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$"Hugr mik hvatti,
hendr mér fulltýðu
ok minn inn hvassi hjörr;
fár er hvatr,
er hröðask tekr,
ef í barnæsku er blauðr."$txt$, $txt$»Hågen mig hetsade,
händerna hjälpte
och mitt vassa vapen.
Ej mången är modig
vid mogen ålder,
som blödig i barndomen varit.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$"Veit ek, ef þú vaxa næðir
fyr þinna vina brjósti,
sæi maðr þik vreiðan vega;
nú ertu haftr
ok hernuminn;
æ kveða bandingja bifask."$txt$, $txt$»Vet du, om växa
vid vänners bröst du fått,
man såge dig käckt kämpa.
Nu är du fjättrad
och fången i krig,
en bunden man alltid bävar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Því bregðr þú mér, Fáfnir,
at til fjarri séak
mínum feðrmunum;
eigi em ek haftr,
þótt ek væra hernumi;
þú fannt, at ek laus lifi."$txt$, $txt$»Du förebrår mig, Favner,
att för fjärran jag är
ifrån faders arvedel faren.
Icke är jag fjättrad,
om ock fången i krig,
du fann, att jag lös var och ledig.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$"Heiftyrði ein
telr þú þér í hvívetna,
en ek þér satt eitt segik:
It gjalla gull
ok it glóðrauða fé,
þér verða þeir baugar at bana."$txt$, $txt$»Hatets ord
du hör i allt,
men ett jag säger dig sant:
guldet, som klingar,
och glänsande skatten,
ringarne, bliva din bane.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Féi ráða
vill fyrða hverr
æ til ins eina dags;
því at einu sinni
skal alda hverr
fara til heljar heðan."$txt$, $txt$»Sin rikedom envar
råda vill
ända till sin yttersta dag,
ty varje människa
måste en gång
fara hädan till Hel.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Norna dóm
þú munt fyr nesjum hafa
ok ósvinns apa;
í vatni þú drukknar,
ef í vindi rær;
allt er feigs forað."$txt$, $txt$»Nornors dom
vid näsen du får
och ovis dåres öde.
I vattnet du drunknar,
om i vind du ror,
för dödsdömd är allt fördärv.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"Segðu mér, Fáfnir,
alls þik fróðan kveða
ok vel margt vita,
hverjar ro þær nornir,
er nauðgönglar ro
ok kjósa mæðr frá mögum."$txt$, $txt$»Säg mig, Favner,
då du frejdad är för kunskap
och att veta mycket väl!
Vilka äro de nornor,
som i nöd hjälpa
och förlossa från livsfrukt mödrar?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$"Sundrbornar mjök
segi ek nornir vera,
eigu-t þær ætt saman;
sumar eru áskunngar,
sumar alfkunngar,
sumar dætr Dvalins."$txt$, $txt$»Av skilda ätter vara
skönjer jag nornor,
de äro ej av samma släkt:
somliga äro av asar,
somliga av alfer,
somliga Dvalins döttrar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$"Segðu mér þat, Fáfnir,
alls þik fróðan kveða
ok vel margt vita,
hvé sá holmr heitir,
er blanda hjörlegi
Surtr ok æsir saman."$txt$, $txt$»Säg du mig, Favner,
då du frejdad är för kunskap
och att veta mycket väl,
vad den holme heter,
där huggsaft asarne
och Surt samman blanda.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$"Óskópnir hann heitir,
en þar öll skulu
geirum leika goð;
Bilröst brotnar,
er þeir á brú fara,
ok svima í móðu marir."$txt$, $txt$»Oskopner han heter,
och alla gudar där
med spjut och stång skola stinga.
Bifrost brister,
då på bron de komma,
och i floden fålarne simma.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Ægishjalm
bar ek of alda sonum,
meðan ek of menjum lák;
einn rammari
hugðumk öllum vera,
fannk-a ek svá marga mögu."$txt$, $txt$Skräckhjälm jag bar
att skrämma människor,
så länge jag på smyckena låg.
Allra starkast vara
av alla jag trodde mig,
hur många män jag än fann.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$"Ægishjalmr
bergr einungi,
hvar skulu vreiðir vega;
þá þat finnr,
er með fleirum kemr,
at engi er einna hvatastr."$txt$, $txt$»Skräckhjälm skänker
ej skydd åt någon,
där vreda vapen skifta.
Då han märker,
när bland modiga han kommer,
att ingen är djärv framför alla.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Eitri ek fnæsta,
er ek á arfi lá
miklum míns föður."
-- -- -- --$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Inn fráni ormr,
þú gerðir fræs mikla
ok galzt harðan hug;
heift at meiri
verðr hölða sonum,
at þann hjalm hafi."$txt$, $txt$»Glänsande orm,
gräsligt du fräste
och hug du visade hård.
Hetare varder
hatet hos folk,
som den hjälmen på huvudet hava.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Ræð ek þér nú, Sigurðr,
en þú ráð nemir,
ok ríð heim heðan;
it gjalla gull
ok it glóðrauða fé,
þér verða þeir baugar at bana."$txt$, $txt$»Jag råder dig nu, Sigurd,
men råd må du taga
och rid hädan hem!
Det glödröda gods
och guldet det klingande,
dig ringarna bliva till bane.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Ráð er þér ráðit,
en ek ríða mun
til þess gulls, er í lyngvi liggr,
en þú, Fáfnir,
ligg í fjörbrotum,
þar er þik hel hafi."$txt$, $txt$»Ditt råd har du rådit,
men rida jag skall
till det guld, som i ljungen är gömt;
men ligg du, Favner,
och lid din död,
till dess att Hel dig har!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Reginn mik réð,
hann þik ráða mun,
hann mun okkr verða báðum at bana;
fjör sitt láta,
hygg ek, at Fáfnir myni;
þitt varð nú meira megin."$txt$, $txt$»Regin mig förrådde,
förråda dig han skall,
han skall bliva oss båda till bane.
Sitt liv tror jag Favner
låta skall,
din styrka nu större blev.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$"Heill þú nú, Sigurðr,
nú hefir þú sigr vegit
ok Fáfni of farit;
manna þeira,
er mold troða,
þik kveð ek óblauðastan alinn."$txt$, $txt$»Hell dig, Sigurd,
seger du vunnit,
Favner fällt du har.
Bland alla de män,
som mullen trampa,
ej käckare kämpe är född.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$"Þat er óvíst at vita,
þá er komum allir saman,
sigtíva synir,
hverr óblauðastr er alinn;
margr er sá hvatr,
er hjör né rýðr
annars brjóstum í."$txt$, $txt$»Ovisst är att veta,
då alla komma samman,
segergudars söner,
vem den käckaste kämpen är;
mången är rask,
som ej rödfärgar svärdet
med blod ur annans bröst.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Glaðr ertu nú, Sigurðr,
ok gagni feginn,
er þú þerrir Gram á grasi;
bróður minn
hefr þú benjaðan,
ok vald ek þó sjalfr sumu."$txt$, $txt$»Glad är du, Sigurd,
av segern du fröjdas,
där du Gram på gräset torkar.
Min broder har du
banesår givit,
något själv jag ock skyldig är.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Þú því rétt,
er ek ríða skyldak
hélug fjöll hinig;
féi ok fjörvi
réði sá inn fráni ormr,
nema þú frýðir mér hvats hugar."$txt$, $txt$»Du rådde därtill,
att jag rida skulle
hit över frostiga fjäll.
Gods och liv ägde
än glänsande ormen,
om mig feghet du ej förevitat.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$"Sittu nú, Sigurðr,
en ek mun sofa ganga,
ok halt Fáfnis hjarta við funa;
eisköld ek vil
etin láta
eftir þenna dreyra drykk."$txt$, $txt$»Sitt du nu, Sigurd,
men att sova jag skall gå,
och håll Favners hjärta
vid flamman;
det alltid slående
jag äta vill
efter drycken av blod, som jag drack.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Fjarri þú gekkt,
meðan ek á Fáfni rauðk
minn inn hvassa hjör;
afli mínu
atta ek við orms megin,
meðan þú í lyngvi látt."$txt$, $txt$»Fjärran du flydde,
medan på Favner
jag blodade mitt bitande svärd.
Jag eggade min kraft
mot ormens styrka,
medan du låg i ljungen gömd.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Lengi liggja
létir þú lyngvi í
þann inn aldna jötun,
ef þú sverðs né nytir,
þess er ek sjalfr gerða,
ok þíns ins hvassa hjörs."$txt$, $txt$»Länge i ljungen
jätten du låtit,
ligga gammal och grå,
om ej svärdet du nyttjat,
som jag smidde själv,
ditt vassa, bitande vapen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$"Hugr er betri
en sé hjörs megin,
hvars vreiðir skulu vega,
því at hvatan mann
ek sé harðliga vega
með slævu sverði sigr."$txt$, $txt$»Mod är bättre
än makten i svärdet,
där i vrede vapen skiftas,
ty en duktig karl
såg jag dristigt vinna
segern med slött svärd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$"Hvötum er betra
en sé óhvötum
í hildileik hafask;
glöðum er betra
en sé glúpnanda,
hvat sem at hendi kemr."$txt$, $txt$Bättre för den raske
än den rädde det är
att stå i stridens lek;
bättre vara glad
än gapa av häpnad
för vad helst som för handen är.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$"Þar sitr Sigurðr
sveita stokkinn,
Fáfnis hjarta
við funa steikir;
spakr þætti mér
spillir bauga,
ef hann fjörsega
fránan æti."$txt$, $txt$»Där sitter Sigurd,
sölad med blod,
och Favners hjärta
vid flamman steker;
rådig syntes mig
ringklyvaren,
om själv han åte
skimrande hjärtat.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$"Þar liggr Reginn,
ræðr um við sik,
vill tæla mög,
þann er trúir hánum,
berr af reiði
röng orð saman,
vill bölvasmiðr
bróður hefna."$txt$, $txt$»Där ligger Regin,
och ränker smider,
med list vill svika,
den som litar på honom,
samkar i vrede
vrånga ord,
den brottstämplarn
sin broder vill hämna.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$"Höfði skemmra
láti hann inn hára þul
fara til heljar heðan;
öllu gulli
þá kná hann einn ráða,
fjölð því er und Fáfni lá."$txt$, $txt$»Ett huvud kortare gråhårig
gubbe han låte
fara hädan till Hel!
Allt guld han kan
då ensam råda,
den mängd, som under Favner fanns.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Horskr þætti mér,
ef hafa kynni
ástráð mikit
yðvar systra,
hygði hann of sik
ok hugin gleddi;
þar er mér ulfs ván,
er ek eyru sék."$txt$, $txt$»Klok han mig tycktes,
kunde han följa
det råd, ni gåvo, systrar,
som goda vänner,
och tänkte på sin fördel
och fägnade korpen;
ulven är att vänta,
då man öronen ser.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$"Er-at svá horskr
hildimeiðr
sem ek hers jaðar
hyggja myndak,
ef hann bróður lætr
á brot komask,
en hann öðrum hefir
aldrs of synjat."$txt$, $txt$»Så klok är icke
krigshjälten,
som härens främste
jag finna tänkte,
om han brodern låter
bort komma,
då den andre han har
avdagatagit.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$"Mjök er ósviðr,
ef hann enn sparir
fjánda inn folkskáa,
þar er Reginn liggr,
er hann ráðinn hefr,
kann-at hann við slíku at séa."$txt$, $txt$»Mycket ovis han är,
om han yttermera
farlig fiende spår.
Där Regin ligger,
som honom ränker smidit;
han kan sig ej mot falskhet fria.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$"Höfði skemmra láti hann
þann inn hrímkalda jötun
ok af baugum búa;
þá mun hann fjár þess,
er Fáfnir réð,
einvaldi vera."$txt$, $txt$»Ett huvud kortare låte han
kalle jätten
bli och fran guldringar gå!
Då ensam skall han härska
över allt det gods,
som Favner en gång ägde.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$"Verða-t svá rík sköp,
at Reginn skyli
mitt banorð bera;
því at þeir báðir bræðr
skulu bráðliga
fara til heljar heðan."$txt$, $txt$»Ej råde så hårt öde,
att Regin skall
namn av min bane bära,
ty båda bröderna
i brådkastet skola
fara hädan till Hel.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$"Bitt þú, Sigurðr,
bauga rauða;
er-a konungligt
kvíða mörgu.
Mey veit ek eina
miklu fegrsta,
gulli gædda,
ef þú geta mættir."$txt$, $txt$»Bind ihop röda
ringarne, Sigurd,
konungsligt är ej
att kvida mycket.
En flicka jag vet
fagrast av alla,
med gyllene smycken;
om det ginge henne vinna!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$"Liggja til Gjúka
grænar brautir,
fram vísa sköp
folklíðöndum;
þar hefir dýrr konungr
dóttur alna;
þá muntu, Sigurðr,
mundi kaupa."$txt$, $txt$Till Gjuke gå
gröna vägar,
framåt visar ödet
för frejdade krigaren;
den dråplige drotten
en dotter fostrat,
henne skall du, Sigurd,
hava till äkta.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$"Salr er á háu
Hindarfjalli,
allr er hann útan
eldi sveipinn,
þann hafa horskir
halir of görvan
ór ódökkum
Ógnar ljóma."$txt$, $txt$En sal är på höga
Hindarfjället,
av eld omsvept
allt utomkring;
den hava vise
väsen uppbyggt
av lysande guld,
som glänser och skimrar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$"Veit ek á fjalli
folkvitr sofa
ok leikr yfir
lindar váði;
Yggr stakk þorni,
aðra felldi
hör-Gefn hali
en hafa vildi."$txt$, $txt$Jag vet, att på fjället
en fejdjungfru sover,
lindens härjare
leker däröver.
Ygg med törne
ungmön stuckit,
då andra hon fällde,
än han erhålla ville.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$"Knáttu, mögr, séa
mey und hjalmi,
þá er frá vígi
Vingskorni reið;
má-at Sigrdrífar
svefni bregða
skjöldunga niðr
fyr sköpum norna."$txt$, $txt$Se kan du, hjälte,
hjälmklädda mön,
som från valplats
på Vingskorner red.
Det är ödets skickelse,
sköldungaättling,
att Sigrdriv ej
ur sömnen kan väckas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Fafner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);

-- ===== Sången om Regin (regin) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Hvat er þat fiska,
er renn flóði í,
kann-at sér við víti varask?
Höfuð þitt
leystu helju ór,
finn mér lindar loga."$txt$, $txt$»Vad är det för fisk,
som i floden ränner,
kan sig ej för fara frälsa.
Lös du ditt huvud
ur Hels våld,
skaffa mig guldets glans!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Andvari ek heiti,
Óinn hét minn faðir,
margan hef ek fors of farit;
aumlig norn
skóp oss í árdaga,
at ek skylda í vatni vaða."$txt$, $txt$»Andvare heter jag,
Oin hette min fader,
i mången fors jag farit;
en olycklig norna
i urtid bestämde,
att jag skulle i vattnet vada.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Segðu þat, Andvari,
ef þú eiga vill
líf í lýða sölum,
hver gjöld fáa
gumna synir,
ef þeir höggvask orðum á?"$txt$, $txt$»Säg du, Andvare,
om du äga vill
ditt liv i de levandes salar!
Vad straff möter
människors söner
om med ord de ömsesidigt såra?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Ofrgjöld fáa
gumna synir,
þeir er Vaðgelmi vaða;
ósaðra orða,
hverr er á annan lýgr,
oflengi leiða limar."$txt$, $txt$»Mycken vedergällning
få människors söner,
som i Vadgelmer vada.
Från de osanna ord,
som på en annan man ljuger,
gå grenarna ganska långt.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Þat skal gull,
er Gustr átti,
bræðrum tveim
at bana verða
ok öðlingum
átta at rógi;
mun míns féar
manngi njóta."$txt$, $txt$»Detta guld
som Gust hade,
skall tvänne bröder
till bane varda
och åtta furstar
egga till strid;
ingen människa skall
av mitt gods njuta.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$"Gull er þér nú reitt,
en þú gjöld hefir
mikil míns höfuðs;
syni þínum
verðr-a sæla sköpuð;
þat verðr ykkarr beggja bani."$txt$, $txt$»Guld är dig nu givet,
och gäldat är dig
mycket för mitt huvud.
Åt din son blir ej
sällhet bestämd,
det varder bådas eder bane.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$"Gjafar þú gaft,
gaft-at-tu ástgjafar,
gaft-at-tu af heilum hug;
fjörvi yðru
skylduð ér firrðir vera,
ef ek vissa ek þat fár fyrir."$txt$, $txt$»Gåvor du gav,
du gav ej vängåvor,
du gav ej av gott hjärta.
Ert liv I skullen
förlora fått,
om jag anat er olycksspådom.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Enn er verra
- þat vita þykkjumk -
niðja stríð of neppt;
jöfra óborna
hygg ek þá enn vera
er þat er til hatrs hugat."$txt$, $txt$»Än värre är
- det veta jag tror mig -
den fränders fejd, som hotar.
De furstar tror jag
ej födda ännu,
som till oenighet det är ämnat.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$"Rauðu gulli
hygg ek mik ráða munu,
svá lengi sem ek lifi;
hót þín
hræðumk ekki lyf,
of haldið heim heðan."$txt$, $txt$»Över röda guldet
tror jag mig råda skola,
så länge som jag lever.
För ditt hot
ej ett dugg jag rädes.
Hallen nu hem härifrån!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Lyngheiðr ok Lofnheiðr,
vitið mínu lífi farit,
mart er þat, er þörf þéar."$txt$, $txt$»Lyngheid och Lovnheid,
veten, livet mitt är ute!
Mycket är, vartill tvång tvingar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Al þú þó dóttur,
dís ulfhuguð,
ef þú getr-at son
við siklingi;
fá mey mann
í meginþarfar;
þá mun þeirar sonr
þíns harms reka."$txt$, $txt$»En dotter dock föd,
du dis med ulvahåg,
om ej du får
med fursten en son.
Giv mön en man,
då så mycken är nöden,
då skall hennes son
hämnas din sorg.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"Bróður kveðja
skaltu blíðliga
arfs ok æðra hugar;
er-a þat hæft,
at þú hjörvi skylir
kveðju Fáfni féar."$txt$, $txt$»Med blidhet din broder
du bedja skall
om arv och huldare håg.
Ej synes det rätt,
att med svärdet du skall
fordra av Favner gods.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$"Kominn er hingat
konr Sigmundar,
seggr inn snarráði,
til sala várra,
móð hefir meira
en maðr gamall,
ok er mér fangs ván
at frekum ulfi.$txt$, $txt$»Hit är Sigmunds
son kommen,
snabbtänkt sven,
till salarne våra.
Mod har han mera
än man, som är gammal;
av vilde vargen
väntar jag rov.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Ek mun fæða
folkdjarfan gram;
nú er Yngva konr
með oss kominn;
sjá mun ræsir
ríkstr und sólu;
þrymr um öll lönd
örlögsímu."$txt$, $txt$Stridsdjärve fursten
fostra jag skall,
nu är Yngves ättling
till oss kommen.
Han bliver den främste
furste under solen,
hans ödestråd ligger
kring alla land.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$"Hátt munu hlæja
Hundings synir,
þeir er Eylima
aldrs synjuðu,
ef meir tyggja
munar at sækja
hringa rauða
en hefnd föður."$txt$, $txt$»Hundings söner
högt skola skratta,
de som ändade
Eylimes liv,
om fursten mera
manas att söka
fagra ringar
än fadershämnd.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$"Hverir ríða þar
Ræfils hestum
hávar unnir,
haf glymjanda?
Seglvigg eru
sveita stokkin,
mun-at vágmarar
vind of standask."$txt$, $txt$»Vilka rida där
med Rävils hästar
på höga böljor,
på brusande hav?
Över segelspringarne
svallet sprutar;
mot vinden skola ej
vågfålar stå sig.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$"Hér ro vér Sigurðr
á sætréum;
er oss byrr gefinn
við bana sjalfan;
fellr brattr breki
bröndum hæri,
hlunnvigg hrapa.
Hverr spyrr at því?"$txt$, $txt$»Här är Sigurd och jag
på simmande plankor,
by är oss given
var bane nära,
över stävens plankor
störtsjön bryter,
fartygen sjunka.
Vem frågar oss därom?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Hnikar hétu mik,
þá er hugin gladdak
Völsungr ungi,
ok vegit hafðak;
nú máttu kalla
karl af bergi
Fengi eða Fjölni;
far vil ek þiggja."$txt$, $txt$»Jag kallades Nikar,
då jag korpen gladde,
volsung unge,
och på valplatsen stred.
Nu kan du kalla
karlen på berget
Feng eller Fjolner;
eder följa vill jag få.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Segðu mér þat, Hnikarr,
alls þá hvárttveggja veizt
goða heill ok guma:
hver bözt eru,
ef berjask skal,
heill at sverða svipun."$txt$, $txt$»Säg mig, Nikar,
då således gudars
och människors varsel du vet!
Vilka varsel vittna,
då man väntar strid,
bäst vid svärdens svingning?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Mörg eru góð,
ef gumar vissi,
heill at sverða svipun;
dyggva fylgju
hygg ek ins dökkva vera
hrottameiði hrafns.$txt$, $txt$»Många äro goda,
om människor dem visste,
varsel vid svärdens svingning.
Pålitligt sällskap
tror jag svarte korpen
vara för väpnad man.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Þat er annat,
ef þú ert út of kominn
ok ert á braut búinn,
tvá þú lítr
á tái standa
hróðrfúsa hali.$txt$, $txt$Ett annat är,
om ut du kommit
och färdig är att fara,
du ser tvänne
tappra män
stå tätt utanför stugan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Þat er it þriðja,
ef þú þjóta heyrir
ulf und asklimum;
heilla auðit
verðr þér af hjalmstöfum,
ef þú sér þá fyrri fara.$txt$, $txt$Ett tredje det är,
om det träffar in,
att ulv under askgrenar tjuter;
över hjälmklädda män
ges dig varsel om seger,
om först du ser deras färd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Engr skal gumna
í gögn vega
síð skínandi
systur Mána;
þeir sigr hafa,
er séa kunnu,
hjörleiks hvatir,
eða hamalt fylkja.$txt$, $txt$Ingen skall kämpa
med ansiktet vänt
mot månens syster,
då sent hon skiner.
Seger de hava,
som se kunna,
de käcka kämpar,
eller kilformigt fylka.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Þat er fár mikit,
ef þú fæti drepr,
þars þú at vígi veðr;
tálar dísir
standa þér á tvær hliðar
ok vilja þik sáran sjá.$txt$, $txt$Det är mycket farligt,
om med foten du snavar,
när du till valplats vandrar;
då stå på båda sidor
svekfulla diser
och vilja dig sårad se.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Kembður ok þveginn
skal kænna hverr
ok at morgni mettr,
því at ósýnt er,
hvar at aftni kemr;
illt er fyr heill at hrapa."$txt$, $txt$Kammad och tvagen
var klok skall vara
och på morgonen mätt,
ty ovisst är,
var till afton han kommer;
illa är av järtecken gäckas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Nú er blóðugr örn
bitrum hjörvi
bana Sigmundar
á baki ristinn;
engr var fremri,
sá er fold ryði,
hilmis arfi,
ok hugin gladdi."$txt$, $txt$»Nu är blodig örn
med bitande svärd
på ryggen av Sigmunds
baneman ristad;
ingen fursteson
främre varit,
som blodade jorden
och gödde korpen.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Regin$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);

-- ===== Sången om Sigdriva (sigrdriva) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Hvat beit brynju?
Hví brá ek svefni?
Hverr felldi af mér
fölvar nauðir?"$txt$, $txt$»Vad bet på brynjan?
Vi bröts min sömn?
Vem fogade, att fjättrarna
föllo, de blekgrå?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Lengi ek svaf,
lengi ek sofnuð var,
löng eru lýða læ;
Óðinn því veldr,
er ek eigi máttak
bregða blundstöfum."$txt$, $txt$»Länge jag sov,
länge var jag somnad,
länge få människor lida.
Oden vållar,
att icke jag mäktade
slita min djupa sömn.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Heill dagr!
Heilir dags synir!
Heil nótt ok nift!
Óreiðum augum
lítið okkr þinig
ok gefið sitjöndum sigr!$txt$, $txt$»Hell dag!
Hell dagens söner!
Hell natt och närmaste fränka!
Blicken på oss
med blida ögon,
gen seger åt oss, som här sitta!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Heilir æsir!
Heilar ásynjur!
Heil sjá in fjölnýta fold!
Mál ok mannvit
gefið okkr mærum tveim
ok læknishendr, meðan lifum."$txt$, $txt$Hell eder, asar!
Hell er, asynjor!
Hell dig, du givmilda jord!
Ord och visdom
oss två given
och läkande händer i livet!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Bjór færi ek þér,
brynþings apaldr,
magni blandinn
ok megintíri;
fullr er hann ljóða
ok líknstafa,
góðra galdra
ok gamanrúna.$txt$, $txt$»Jag bjuder dig öl,
du brynjetings apel,
blandat med styrka
och starkhets ära.
Det är fullt av sånger
och hugsvalande stavar,
goda galdrar
och gammanrunor.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Sigrúnar skaltu kunna,
ef þú vilt sigr hafa,
ok rísta á hjalti hjörs,
sumar á véttrimum,
sumar á valböstum,
ok nefna tysvar Tý.$txt$, $txt$Segerrunor skall du kunna,
om seger du vill hava,
och sätta dem på svärdets fäste,
somliga på slagstången,
somliga pa svärdkavlen
och nämna två gånger Tyr.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Ölrúnar skaltu kunna,
ef þú vill annars kvæn
véli-t þik í tryggð, ef þú trúir;
á horni skal þær rísta
ok á handar baki
ok merkja á nagli Nauð.$txt$, $txt$Ölrunor skall du kunna
om du vill, att annans hustru
ej sviker dig, då säker du tror dig.
På hornet skall du rista dem
och på handens bak
och märka på nageln Naud.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Full skal signa
ok við fári sjá
ok verpa lauki í lög;
þá ek þat veit,
at þér verðr aldri
meinblandinn mjöðr.$txt$, $txt$Fyllda bägarn signa
och för fara dig akta,
du skall lägga i vätskan lök;
då vet jag,
att det varder dig aldrig
något menligt i mjödet blandat.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Bjargrúnar skaltu kunna,
ef þú bjarga vilt
ok leysa kind frá konum;
á lófum þær skal rísta
ok of liðu spenna
ok biðja þá dísir duga.$txt$, $txt$Hjälprunor skall du kunna,
om du hjälpa vill,
och lösa livsfrukt från kvinnor.
I handen skall du dem rista
och om handlederna spänna
och bedja diserna giva dig hjälp.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Brimrúnar skaltu rísta,
ef þú vilt borgit hafa
á sundi seglmörum;
á stafni skal rísta
ok á stjórnarblaði
ok leggja eld í ár,
er-a svá brattr breki
né svá bláar unnir,
þó kemstu heill af hafi.$txt$, $txt$Bränningsrunor skall du rista,
om bärga du vill
på havet seglets hästar.
På stammen skall man dem rista
och på styrårans blad
och bränna dem i äran med eld.
Så brådstört är ej brottsjö,
så blå ej vågor,
att ej från havet du helbrägda kommer.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Limrúnar skaltu kunna,
af þú vilt læknir vera,
ok kunna sár at sjá;
á berki skal þær rísta
ok á baðmi viðar,
þeim er lúta austr limar.$txt$, $txt$Kvistrunor skall du kunna,
om kunnig du vill vara
att som läkare se på sår.
Skriv dem på barken
och det skogens träd,
vars lövkvistar luta åt öster.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Málrúnar skaltu kunna,
ef þú vilt, at manngi þér
heiftum gjaldi harm:
þær of vindr,
þær of vefr,
þær of setr allar saman
á því þingi,
er þjóðir skulu
í fulla dóma fara.$txt$, $txt$Målrunor skall du kunna
att icke någon människa
med hat skall harm dig löna.
Dem snor man om,
dem sveper man om,
dem sätter man alla tillsamman,
på det ting,
där talrik menighet
råkas till fullsutten rätt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Hugrúnar skaltu kunna,
ef þú vilt hverjum vera
geðsvinnari guma;
þær of réð,
þær of reist,
þær of hugði Hroftr
af þeim legi,
er lekit hafði
ór hausi Heiðdraupnis
ok ór horni Hoddrofnis.$txt$, $txt$Tankerunor skall du kunna,
om du tankekraft vill äga
mer än varje man.
Dessa tydde,
dessa tecknade,
dessa runor betänkte Ropt,
av den saft,
som sipprat hade
ur Heiddraupners huvudskål
och ur Hoddrovners horn.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Á bjargi stóð
með Brimis eggjar,
hafði sér á höfði hjalm;
þá mælti Mímis höfuð
fróðligt it fyrsta orð
ok sagði sanna stafi.$txt$, $txt$På berget han stod
med Brimers eggar
och hade på huvudet hjälm.
Då höjde Mims huvud
först sin rådande röst
och sade sanna ord.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Á skildi kvað ristnar,
þeim er stendr fyr skínandi goði,
á eyra Árvakrs
ok á Alsvinns hófi,
á því hvéli, er snýsk
undir reið Hrungnis,
á Sleipnis tönnum
ok á sleða fjötrum.$txt$, $txt$Sade dem på skölden ristade,
som för skinande guden står,
på Arvakrs öra,
och Alsvinns hov
på det hjul, som går runt
under Rungners banes vagn,
på Sleipners tänder
och på slädens fjättrar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Á bjarnar hrammi
ok á Braga tungu,
á ulfs klóum
ok á arnar nefi,
á blóðgum vængjum
ok á brúar sporði,
á lausnar lófa
ok á líknar spori.$txt$, $txt$På björnens ramar
och på Brages tunga,
på ulvens klor
och på örnens näbb,
på blodiga vingar
och på brons landfäste,
på förlossande love
och i lisans spår.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Á gleri ok á gulli
ok á gumna heillum,
í víni ok í virtri
ok vilisessi,
á Gugnis oddi
ok á Grana brjósti,
á nornar nagli
ok á nefi uglu.$txt$, $txt$På glas och på guld
och på godlyckesmycken,
i vin och i vört
och på välbehaglig sittplats,
på Gungners udd
och på Granes bröst,
på nornans nagel
och på näbben av ugglan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Allar váru af skafnar,
þær er váru á ristnar,
ok hverfðar við inn helga mjöð
ok sendar á víða vega;
þær ro með ásum,
þær ro með alfum,
sumar með vísum vönum
sumar hafa mennskir menn.$txt$, $txt$Alla avskavna blevo,
som in voro ristade
och mängda med det heliga mjöd
och sända vida vägar.
De äro hos asar,
de äro hos alfer,
somliga hos visa vaner,
somliga hos människors menighet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Þat eru bókrúnar,
þat eru bjargrúnar
ok allar ölrúnar
ok mætar meginrúnar,
hveim er þær kná óvilltar
ok óspilltar
sér at heillum hafa;
njóttu, ef þú namst,
unz rjúfask regin.$txt$, $txt$Det är bokrunor,
det är bärgerunor,
och alla ölrunor,
och kostliga kraftrunor
för den som utan villa
och utan att dem spilla
kan dem sig till båtnad bruka.
Lev väl, om du lärt dem,
tills gudamakterna förgås!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Nú skaltu kjósa,
alls þér er kostr of boðinn,
hvassa vápna hlynr;
sögn eða þögn
hafðu þér sjalfr í hug;
öll eru mein of metin."$txt$, $txt$Nu skall du välja,
då val dig bjudes,
du vassa vapnens stam!
Skall jag tala eller tiga?
Tänk därpå själv!
Allt ont är av ödet tillmätt.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Munk-a ek flæja,
þótt mik feigan vitir,
emk-a ek með bleyði borinn;
ástráð þín
ek vil öll hafa;
svá lengi sem ek lifi."$txt$, $txt$»Fly jag ej skall,
fast förfallen åt död,
blödig är jag ej boren.
Dina vänskapsråd
alla vinna jag vill,
så länge som jag lever.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Þat ræð ek þér it fyrsta,
at þú við frændr þína
vammalaust verir;
síðr þú hefnir,
þótt þeir sakar geri;
þat kveða dauðum duga.$txt$, $txt$»Det råder jag dig för det första,
att mot dina fränder,
utan vank du må vara.
Hämnas må du ej,
fast harm de dig göra;
det båtar dig bäst efter döden.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Þat ræð ek þér annat,
at þú eið né sverir,
nema þann er saðr sé;
grimmar limar
ganga at tryggðrofi;
armr er vára vargr.$txt$, $txt$För det andra jag dig råder,
att du ed icke svär,
om ej därmed sanning du säger.
Svåra följder
har sviken förlikning;
usel är menedig man.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Þat ræð ek þér þriðja,
at þú þingi á
deili-t við heimska hali,
því að ósviðr maðr
lætur oft kveðin
verri orð en viti.$txt$, $txt$För det tredje jag dig råder,
att du på tinget
ej strider med stolliga sällar,
ty ovis man
ofta säger
värre ord, än han vet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Allt er vant,
ef þú við þegir,
þá þykkir þú með bleyði borinn
eða sönnu sagðr;
hættr er heimis kviðr,
nema sér góðan geti; -
annars dags
láttu hans öndu farit,
ok launa svá lýðum lygi.$txt$, $txt$Allt är svart;
säger du intet,
så tyckes du blödig boren
eller med sanning sakförd.
Farligt är hembygdens folkprat,
lyder det ej till ditt lov.
Låt andra dagen
honom uppgiva andan
och löna så folk för lögn.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Þat ræð ek þér it fjórða,
ef býr fordæða
vammafull á vegi,
ganga er betra
en giska sé,
þótt þik nótt of nemi.$txt$, $txt$För det fjärde jag dig råder,
om det bor en fläckfull
trollpacka tätt invid vägen.
Hellre giv dig i väg
än gästa där,
även om natten är nära!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Fornjósnar augu
þurfu fira synir,
hvars skulu vreiðir vega;
oft bölvísar konur
sitja brautu nær,
þær er deyfa sverð ok sefa.$txt$, $txt$Ögon som spana,
önskvärda äro,
då i vrede vapen skiftas;
ofta vrångvisa kvinnor
vid vägen sitta,
som döva svärd och sinne.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Þat ræð ek þér it fimmta,
þóttú fagrar séir
brúðir bekkjum á,
sifja silfr
lát-a-ðu þínum svefni ráða;
teygj-at-tu þér at kossi konur.$txt$, $txt$För det femte jag dig råder,
fast du ser fagra
brudar på bänkarne sitta,
låt ej de silversmyckade
för din sömn råda,
locka ej i kärlek dem till kyssar!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$Þat ræð ek þér it sétta,
þótt með seggjum fari
ölðrmál til öfug,
drukkin deila
skal-at-tu við dolgviðu;
margan stelr vín viti.$txt$, $txt$För det sjätte jag dig råder,
om det sker bland män,
att vid öl fällas avoga ord,
giv dig ej i delo
med druckna slagskämpar;
vin stjäl mångens vett.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Söngr ok öl
hefr seggjum verit
mörgum at móðtrega,
sumum at bana,
sumum at bölstöfum;
fjölð er, þat er fira tregr.$txt$, $txt$Öl och trätor
ha ofta varit
mången man till sorg;
somliga till undergång,
somliga till ofärd,
mycket vållar människor ve.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Þat ræð ek þér it sjaunda,
ef þú sakar deilir
við hugfulla hali,
berjask er betra
en brenna sé
inni auðstöfum.$txt$, $txt$För det sjunde jag råder dig,
om du själv i delo
råkar med modiga män,
bättre är slåss
än brännas inne
själv med gård och grund.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Þat ræð ek þér it átta,
at þú skalt við illu sjá
ok firrask flærðarstafi;
mey þú teygj-at
né manns konu
né eggja ofgamans.$txt$, $txt$För det åttonde jag dig råder
att akta dig för ont
och all slags falskhet fly.
Ej mö må du locka
eller mans hustru
och till brottslig älskog ej egga.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Þat ræð ek þér it níunda,
at þú náum bjargir,
hvars þú á foldu finnr,
hvárts eru sóttdauðir
eða eru sædauðir
eða eru vápndauðir verar.$txt$, $txt$För det nionde jag dig råder
att ge nödig vård åt lik,
evar dem i världen du varsnar,
om av sjukdom de dött,
om på sjön de dött,
om dem vapen på valplatsen dödat.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$Laug skal gera,
þeim er liðnir eru,
þváa hendr ok höfuð,
kemba ok þerra,
áðr í kistu fari,
ok biðja sælan sofa.$txt$, $txt$Bad skall man göra
åt dem, som bortgångna äro,
två deras händer och huvud;
dem kamma och torka,
förrn de komma i kista,
och bedja dem saligen sova.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Þat ræð ek þér it tíunda,
at þú trúir aldregi
várum vargdropa,
hvárstu ert bróður bani
eða hafir þú felldan föður;
ulfr er í ungum syni,
þó sé hann gulli gladdr.$txt$, $txt$För det tionde jag dig råder,
tro du aldrig ord
av en fredlös fiendes son!
Är du broderns baneman
eller har fadern du fällt,
är en ulv i unge sonen,
fast glad han göres med guld.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$Sakar ok heiftir
hyggja-t svefngar vera
né harm in heldr;
vits ok vápna
vant er jöfri at fá
þeim er skal fremstr með firum.$txt$, $txt$Aldrig hinna harm
och hätskhet att somna
och sorgen lika litet.
Att få vett och vapen
är vanskligt för fursten,
som främst i folket skall gå.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$Þat ræð ek þér it ellifta,
at þú við illu séir
hvern veg at vini;
langt líf þykkjumk-a-k
lofðungs vita;
römm eru róg of risin."$txt$, $txt$För det elfte jag dig råder,
att för ont du dig aktar
i varje fall från en vän.
Jag tror furstens liv
ej långt skola bliva;
stora strider begynna.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Sigdriva$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);

-- ===== Kvädet om Hymer (hymer) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Ár valtívar
veiðar námu
ok sumblsamir,
áðr saðir yrði,
hristu teina
ok á hlaut sáu;
fundu þeir at Ægis
örkost hvera.$txt$, $txt$Det var en gång, som stridsgudar
stek av villebråd
och mjöd desamma njöto,
innan de mätta blevo;
de skakade spådomskvistar,
skådade på offerblod
och funno hos Äger
överflöd på kittlar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Sat bergbúi
barnteitr fyr
mjök glíkr megi
miskorblinda;
leit í augu
Yggs barn í þrá:
"Þú skalt ásum
oft sumbl gera."$txt$, $txt$Bergsbon satt
barnaglad framför dem,
mycket lik sonen
av Miskorblinde.
Yggs son honom trotsigt
i ögat såg:
»Gör du rikligt
gille åt asarne!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Önn fekk jötni
orðbæginn halr,
hugði at hefndum
hann næst við goð,
bað hann Sifjar ver
sér færa hver, -
"þanns ek öllum öl
yðr of heita."$txt$, $txt$Brydd blev jätten
av den bistres ord,
på hämnd mot gudarne
han härefter tänkte;
han bad Sivs man
sörja för en kittel,
»så att åt eder alla
jag öl må brygga.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Né þat máttu
mærir tívar
ok ginnregin
of geta hvergi,
unz af tryggðum
Týr Hlórriða
ástráð mikit
einum sagði:$txt$, $txt$Det stod ej till
för de store gudar
och heliga makter
att hitta den någonstädes,
tills i förtroende
Tyr vänskapligt
ensamt åt Lorride
en utväg sade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Býr fyr austan
Élivága
hundvíss Hymir
at himins enda;
á minn faðir
móðugr ketil,
rúmbrugðinn hver,
rastar djúpan."$txt$, $txt$»Där bor i öster
om Elivågorna
den högvise Hymer
vid himmelens ända;
min käcka fader
en kittel äger,
ett mycket stort kärl,
en mil djupt.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$"Veiztu ef þiggjum
þann lögvelli?"$txt$, $txt$»Vet du, om vi kunna
den kokaren få?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Fóru drjúgum
dag þann fram
Ásgarði frá,
unz til Egils kvámu;
hirði hann hafra
horngöfgasta;
hurfu at höllu,
er Hymir átti.$txt$, $txt$De färdades duktigt
den dagen fram
från Asgård,
tills till Egil de kommo.
Hos honom de insatte
hornprydda bockarne
och begåvo sig till hallen,
som Hymer ägde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Mögr fann ömmu
mjök leiða sér,
hafði höfða
hundruð níu,
en önnur gekk
algullin fram
brúnhvít bera
bjórveig syni:
9. "Áttniðr jötna,
ek viljak ykkr
hugfulla tvá
und hvera setja;
er minn fríi
mörgu sinni
glöggr við gesti,
görr ills hugar."$txt$, $txt$Sonen fann där farmodern,
faslig att skåda,
hon nio hundra
huvuden hade;
då går, som guld
glänsande, en annan
ljuslätt, att bära
en bägare åt sonen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, NULL, $txt$»Jättars frände!
Gömma jag ville
er båda käcka
under kittlarne.
Maken min
är mången gång
snål mot gäster,
snar till ondska.»$txt$, NULL, NULL, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$En váskapaðr
varð síðbúinn
harðráðr Hymir
heim af veiðum,
gekk inn í sal,
glumðu jöklar,
var karls, en kom,
kinnskógr frörinn.$txt$, $txt$Sent färdig, vände
den vanskaplige,
hårdsinte Hymer
hem från jakten.
In gick han i salen,
istappar slamrade,
kindskogen på karlen,
som kom, var tjälad.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Ver þú heill, Hymir,
í hugum góðum,
nú er sonr kominn
til sala þinna,
sá er vit vættum
af vegi löngum;
fylgir hánum
hróðrs andskoti,
vinr verliða;
Véurr heitir sá.$txt$, $txt$»Var hälsad, Hymer,
och i hågen god;
till dina salar
nu sonen kommit
han, som vi väntat
från vägar långa.
Den frejdade fienden,
följer honom,
vännen till människor;
Veor han heter.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Sé þú, hvar sitja
und salar gafli,
svá forða sér,
stendr súl fyrir."
Sundr stökk súla
fyr sjón jötuns,
en áðr í tvau
áss brotnaði.$txt$, $txt$Ser du, var de sitta
under salens gavel,
bakom en stolpe
de stå till skydd.»
För jättens syn
sönder sprang stolpen,
innan bjälken
brast i tu.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Stukku átta,
en einn af þeim
hverr harðsleginn
heill af þolli;
fram gengu þeir,
en forn jötunn
sjónum leiddi
sinn andskota.$txt$, $txt$Åtta föllo,
men en av dem,
en hårdhamrad kittel,
föll hel från stocken.
Fram de gingo,
men fornåldrig jätte
följde med ögonen
sin fiende.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Sagði-t hánum
hugr vel þá,
er hann sá gýgjar græti
á golf kominn,
þar váru þjórar
þrír of teknir,
bað senn jötunn
sjóða ganga.$txt$, $txt$Ej sade honom då
hans sinne något gott,
när han såg på sitt golv,
den att gråta kom jättekvinnor.
Där togs nu
trenne tjurar,
tillsammans dem jätten
sände att kokas.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Hvern létu þeir
höfði skemmra
ok á seyði
síðan báru;
át Sifjar verr,
áðr sofa gengi,
einn með öllu
öxn tvá Hymis.$txt$, $txt$De höggo dem alla
ett huvud kortare
och i kokgropen
kastade dem sedan.
Sivs man åt ensam,
innan sova han gick,
hela och hållna
två Hymers oxar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Þótti hárum
Hrungnis spjalla
verðr Hlórriða
vel fullmikill:
"Munum at aftni
öðrum verða
við veiðimat
vér þrír lifa."$txt$, $txt$För Rungners gråe,
gode vän
tycktes Lorrides måltid
väl mycken vara.
»Nästa afton
nödgas nog
av villebråd
vi tre leva.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Véurr kvaðzk vilja
á vág róa,
ef ballr jötunn
beitr gæfi.$txt$, $txt$Veor sade sig vilja
på vågen ro ut,
om bålde jätten
bete gåve.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Þess vænti ek,
at þér myni-t
ögn af oxa
auðfeng vera."
Sveinn sýsliga
sveif til skógar,
þar er uxi stóð
alsvartr fyrir.$txt$, $txt$Det jag väntar,
att dig skall ej lätt
agn av oxen
att erhålla bliva.»
Svennen styrde
strax till skogs,
där ramsvart oxe
råmande stod.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Braut af þjóri
þurs ráðbani
hátún ofan
horna tveggja.$txt$, $txt$Tursars baneman
bröt från tjuren
de båda hornens
högborg upptill.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Bað hlunngota
hafra dróttinn
áttrunn apa
útar færa,
en sá jötunn
sína talði
lítla fýsi
at róa lengra.$txt$, $txt$Båten bad
bockarnes herre
den hisklige jätten
ut till havs att föra,
men apors släkting
sade sig äga
liten lust
att längre ro.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Dró meir Hymir
móðugr hvali
einn á öngli
upp senn tváa,
en aftr í skut
Óðni sifjaðr
Véurr við vélar
vað gerði sér.$txt$, $txt$Dristige Hymer
drog två valar
ensam på kroken
upp tillsammans,
men akterut
Odens son,
Veor, sig redde
en rev med list.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Egndi á öngul,
sá er öldum bergr,
orms einbani
uxa höfði;
gein við agni,
sú er goð fía,
umgjörð neðan
allra landa.$txt$, $txt$Han, som människor skyddar
och mäter sig med ormen,
hängde på kroken
huvudet av oxen.
Mot betet gapade,
den som gudarne hata,
som runt kring världen
sig ringlar i djupet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Dró djarfliga
dáðrakkr Þórr
orm eitrfáan
upp at borði;
hamri kníði
háfjall skarar
ofljótt ofan
ulfs hnitbróður.$txt$, $txt$Dristigt drog
dådkraftige Tor
etterglänsande ormen
upp på båtkanten;
hårets högfjäll
med hammaren han slog,
det omåttligt fula
på ulvens broder.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Hraungalkn hlumðu,
en hölkn þutu,
fór in forna
fold öll saman;
sökkðisk síðan
sá fiskr í mar.$txt$, $txt$Ulvar tjöto,
ödemarker ljödo,
urgamla jorden
av ångest skalv;
sedan i sjön
sjönk den fisken.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Óteitr jötunn,
er aftr reru,
svá at ár Hymir
ekki mælti,
veifði hann ræði
veðrs annars til.$txt$, $txt$Oglad var jätten,
när de åter rodde,
så att Hymer att börja med
bara teg;
på en annan bog
sen böjde han av.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Mundu of vinna
verk halft við mik,
at þú heim hvali
haf til bæjar
eða flotbrúsa
festir okkarn."$txt$, $txt$»Halva mödan
med mig du dele:
hem till gården
du går med valarne
eller binder böljornas
bock vid stranden.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Gekk Hlórriði,
greip á stafni
vatt með austri
upp lögfáki,
einn með árum
ok með austskotu
bar hann til bæjar
brimsvín jötuns
ok holtriða
hver í gegnum.$txt$, $txt$Gick Lorride och tog
tag i stammen,
svängde sjöhäst
med sump upp på axeln.
Ensam med åror
och med öskar
till gårds bar han båten,
som bränningen klyver,
åt jätten igenom
djupa klyftor.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Ok enn jötunn
um afrendi,
þrágirni vanr,
við Þór sennti,
kvað-at mann ramman,
þótt róa kynni
kröfturligan,
nema kálk bryti.$txt$, $txt$Men ännu om styrka
strida ville
med Tor jätten,
vid trots van.
»Intet rår man», han sade,
»fast ro man kan;
den som bägare ej krossar,
icke kraftig är.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$En Hlórriði,
er at höndum kom,
brátt lét bresta
brattstein gleri;
sló hann sitjandi
súlur í gögnum;
báru þó heilan
fyr Hymi síðan.$txt$, $txt$Men när den lades
i Lorrides hand,
lät han strax för kristallen
stenstod brista,
stolpen han sittande
slog den igenom;
de buro den dock hel
till Hymer sedan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Unz þat in fríða
frilla kenndi
ástráð mikit,
eitt er vissi:
"Drep við haus Hymis,
hann er harðari,
kostmóðs jötuns
kálki hverjum."$txt$, $txt$Till dess den fagra
frillan lärde
ett vänskapsråd,
som hon visste:
»Slå mot Hymers huvud,
ty det hårdare på jätten,
som vill dig pröva,
än varje kalk är.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Harðr reis á kné
hafra dróttinn,
færðisk allra
í ásmegin;
heill var karli
hjalmstofn ofan,
en vínferill
valr rifnaði.$txt$, $txt$Barsk reste sig på knä
bockarnas herre,
iförde sig all
sin asakraft;
helt var på jätten
hjälmens underlag,
men i tu rämnade
runda vinkärlet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$"Mörg veit ek mæti
mér gengin frá,
er ek kálki sé
ór knéum hrundit;"
karl orð of kvað:
"knákat ek segja
aftr ævagi,
þú ert, ölðr, of heitt.$txt$, $txt$»Mycket dyrbart
mist jag vet mig hava,
då kalken jag ser
ur knäna på mig stött.»
Så karlen talade:
»Jag kan ej taga
åter mitt ord.
Du, öl, är för hett.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Þat er til kostar,
ef koma mættið
út ór óru
ölkjól hofi."
Týr leitaði
tysvar hræra;
stóð at hváru
hverr kyrr fyrir.$txt$, $txt$»Ett villkor är,
att ni väldiga ölskeppet
bort från vår gård
bringa mäkta.»
Tyr försökte
två gånger den röra;
stilla ändock
stod kittlen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$Faðir Móða
fekk á þremi
ok í gegnum steig
golf niðr í sal;
hóf sér á höfuð upp
hver Sifjar verr,
en á hælum
hringar skullu.$txt$, $txt$Modes fader
fick fatt i kanten
och från stället vid elden
han steg ned i salen.
Sivs man hävde
på huvudet kitteln,
men på hälarne
handtagen skramlade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Fóru-t lengi,
áðr líta nam
aftr Óðins sonr
einu sinni;
sá hann ór hreysum
með Hymi austan
folkdrótt fara
fjölhöfðaða.$txt$, $txt$Ej längre de färdades,
förrän litet
Odens son
såg sig om;
då såg han en månghövdad
mängd med Hymer
strömma från öster
ur stenrösena.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$Hóf hann sér af herðum
hver standanda,
veifði hann Mjöllni
morðgjörnum fram,
ok hraunhvala
hann alla drap.$txt$, $txt$Kitteln från axeln
av sig han lyfte,
svängde Mjollner,
mordlystne hammarn,
och bergöknars bestar
till bane han slog.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$Fóru-t lengi,
áðr liggja nam
hafr Hlórriða
halfdauðr fyrir;
var skær skökuls
skakkr á beini,
en því inn lævísi
Loki of olli.$txt$, $txt$Ej längre de färdades,
förrän Lorrides bock
halvdöd föll
framför kärran;
betseldjuret
på benet var halt,
och det hade lömske
Loke vållat.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$En ér heyrt hafið, -
hverr kann of þat
goðmálugra
görr at skilja? -
hver af hraunbúa
hann laun of fekk,
er hann bæði galt
börn sín fyrir.$txt$, $txt$Men hört I haven —
— ho kan väl det
av i gudasägner kunniga
klarare reda —
vilken bot honom bergöknens
bonde lämnade,
då båda sina barn
han bötade därför.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$Þróttöflugr kom
á þing goða
ok hafði hver,
þanns Hymir átti;
en véar hverjan
vel skulu drekka
ölðr at Ægis
eitt hörmeitið.$txt$, $txt$Kraftig han trädde
på tinget till gudarne
och hade kitteln,
som Hymer ägde.
Men varje vinter
väldigt dricka
gudarne hos Äger
det öl, han måst lova.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Hymer$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);

-- ===== Sången om Hamder (hamder) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Spruttu á tái
tregnar íðir,
græti alfa
in glýstömu;
ár of morgin
manna bölva
sútir hverjar
sorg of kveykva.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Var-a þat nú
né í gær,
þat hefir langt
liðit síðan,
- er fátt fornara,
fremr var þat halfu, -
er hvatti Guðrún
Gjúka borin,
sonu sína unga
at hefna Svanhildar:$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Systir var ykkur
Svanhildr of heitin,
sú er Jörmunrekkr
jóm of traddi,
hvítum ok svörtum
á hervegi,
grám, gangtömum
Gotna hrossum.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Eftir er ykkr þrungit
þjóðkonunga;
lifið einir ér
þátta ættar minnar.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Einstæð em ek orðin,
sem ösp í holti,
fallin at frændum
sem fura at kvisti,
vaðin at vilja,
sem viðr at laufi,
þá er in kvistskæða
kemr um dag varman."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Hitt kvað þá Hamðir
inn hugumstóri:
"Lítt myndir þú þá, Guðrún,
leyfa dáð Högna,
er þeir Sigurð vökðu
svefni ór,
saztu á beð,
en banar hlógu.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Bækr váru þínar
inar bláhvítu
ofnar völundum,
flutu í vers dreyra;
svalt þá Sigurðr,
saztu yfir dauðum,
glýja þú né gáðir,
Gunnarr þér svá vildi.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Atla þóttisk þú stríða
at Erps morði
ok at Eitils aldrlagi,
þat var þér enn verra;
svá skyldi hverr öðrum
verja til aldrlaga
sverði sárbeitu,
at sér né stríddi-t."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Hitt kvað þá Sörli,
- svinna hafði hann hyggju -:
"Vilk-at ek við móður
málum skipta;
orðs þykkir enn vant
ykkru hváru.
Hvers biðr þú nú, Guðrún,
er þú at gráti né fær-at?$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Bræðr grát þú þína
ok buri svása,
niðja náborna
leidda nær rógi;
okkr skaltu ok, Guðrún,
gráta báða,
er hér sitjum feigir á mörum,
fjarri munum deyja."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Gengu ór garði
görvir at eiskra,
liðu þá yfir ungir
úrig fjöll
mörum húnlenzkum
morðs at hefna.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Fundu á stræti
stórbrögðóttan:
"Hvé mun jarpskammr
okkr fulltingja?"$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Svaraði inn sundrmæðri,
svá kvaðsk veita mundu
fullting frændum,
sem fótr öðrum.
"Hvat megi fótr
fæti veita
né holdgróin
hönd annarri?"$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Þá kvað þat Erpr
einu sinni,
- mærr of lék
á mars baki -:
"Illt er blauðum hal
brautir kenna."
Kóðu harðan mjök
hornung vera.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Drógu þeir ór skíði
skíðiéarn,
mækis eggjar,
at mun flagði;
þverrðu þeir þrótt sinn
at þriðjungi,
létu mög ungan
til moldar hníga.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Skóku loða,
skalmir festu,
ok góðbornir
smugu í guðvefi.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Fram lágu brautir,
fundu vástigu
ok systurson
sáran á meiði,
vargtré vindköld
vestan bæjar,
trýtti æ trönu hvöt,
titt var-at bíða.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Glamr var í höllu,
halir ölreifir,
ok til gota ekki
gerðu at heyra,
áðr halr hugfullr
í horn of þaut.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Segja fóru ærir
Jörmunrekki,
at sénir váru
seggir und hjalmum:
"Ræðið ér um ráð,
ríkir eru komnir,
fyr máttkum hafið ér mönnum
mey of tradda."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Hló þá Jörmunrekkr,
hendi drap á kampa,
beiddisk-at bröngu,
böðvaðisk at víni;
skók hann skör jarpa,
sá á skjöld hvítan,
lét hann sér í hendi
hvarfa ker gullit.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Sæll ek þá þóttumk,
ef ek sjá knætta
Hamði ok Sörla
í höllu minni,
buri mynda ek þá binda
með boga strengjum,
góð börn Gjúka
festa á galga."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Hitt kvað þá Hróðrglöð,
stóð of hleðum,
mæfingr mælti
við mög þenna:
-- -- --
"Því at þat heita,
at hlýðigi myni;
megu tveir menn einir
tíu hundruð Gotna
binda eða berja
í borg inni háu."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Styrr varð í ranni,
stukku ölskálir,
í blóði bragnar lágu,
komit ór brjósti Gotna.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Hitt kvað þá Hamðir
inn hugumstóri:
"Æstir, Jörmunrekkr,
okkarrar kvámu
bræðra sammæðra
innan borgar þinnar;
fætr sér þína,
höndum sér þú þínum,
Jörmunrekkr, orpit
í eld heitan."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Þá hraut við
inn reginkunngi
baldr í hrynju,
sem björn hryti:
"Grýtið ér á gumna,
alls geirar né bíta,
eggjar né éarn
Jónakrs sonu."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Hitt kvað þá Hamðir
inn hugumstóri:
"Böl vanntu, bróðir,
er þú þann belg leystir;
oft ór þeim belg
böll ráð koma."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$"Hug hefðir þú, Hamðir,
ef þú hefðir hyggjandi;
mikils er á mann hvern vant,
er mannvits er!"$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Af væri nú höfuð,
ef Erpr lifði,
bróðir okkarr inn böðfrækni,
er vit á braut vágum,
verr inn vígfrækni,
- hvöttumk at dísir, -
gumi inn gunnhelgi,
- gerðumk at vígi -."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Ekki hygg ek okkr
vera ulfa dæmi,
at vit mynim sjalfir of sakask
sem grey norna,
þá er gráðug eru
í auðn of alin.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Vel höfum vit vegit,
stöndum á val Gotna,
ofan eggmóðum,
sem ernir á kvisti;
góðs höfum tírar fengit,
þótt skylim nú eða í gær deyja;
kveld lifir maðr ekki
eftir kvið norna."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Þar fell Sörli
at salar gafli,
enn Hamðir hné
at húsbaki.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Hamder$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);

-- ===== Gudruns eggelse (gudrunseggelse) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Þá frá ek sennu
slíðrfengligsta,
trauð mál, talið
af trega stórum,
er harðhuguð
hvatti at vígi
grimmum orðum
Guðrún sonu:$txt$, $txt$Den ordväxling sporde jag
mest olycksbringande,
tunga ord, talade
av tyngsta sorg,
då Gudrun hårdsint
hetsade till strid
med bistra ord
sina båda söner.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Hví sitið ér,
hví sofið lífi,
hví tregr-at ykkr
teiti at mæla,
er Jörmunrekkr
yðra systur,
unga at aldri,
jóm of traddi,
hvítum ok svörtum,
á hervegi,
grám, gangtömum
Gotna hrossum?$txt$, $txt$»Vi sitten I stilla
och soven bort livet?
Vi ledsnen I ej
vid lättsinnigt tal,
då Jormunrek
givit eder syster,
ung till åren,
att på allmän väg
söndertrampas
av svarta och vita,
gråa, gångvana,
gotiska hästar?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Urðu-a it glíkir
þeim Gunnari
né in heldr hugðir
sem var Högni;
hennar munduð it
hefna leita,
ef móð ættið
minna bræðra
eða harðan hug
Húnkonunga."$txt$, $txt$I bleven ej lika
den bragdrike Gunnar,
ej heller modiga,
som Hogne var.
Henne skullen I
hämna söka,
om mod I haden
som mina bröder
eller hunkonungarnes
hårda sinne.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Þá kvað þat Hamðir
inn hugumstóri:
"Lítt myndir þú
leyfa dáð Högna,
þá er Sigurð vökðu
svefni ór;
bækr váru þínar
enar bláhvítu
roðnar í vers dreyra,
folgnar í valblóði.$txt$, $txt$Då sade Hamder,
i hågen djärv:
»Högt du ej lovade
Hognes gärning,
när Sigurd de väckte
ur sömnen upp.
Dina blåvita täcken
i blod av din man
färgades röda,
flöto i mordvätska.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Urðu þér beggja
bræðra hefndir
slíðrar ok sárar,
er þú sonu myrðir;
knættim allir
Jörmunrekki
samhyggjendr
systur hefna.$txt$, $txt$Dig blev för dina båda
bröder hämnden
svår och smärtsam,
då du sönerna mördat.
Jämte dem vi
på Jormunrek
samstämmiga
vår syster kunnat hämna.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Berið hnossir fram
Húnkonunga;
hefir þú okkr hvatta
at hjörþingi."$txt$, $txt$Hämten oss hit
hunkonungarnas praktvapen!
Sporrat oss har du
till spjutens ting.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Hlæjandi Guðrún
hvarf til skemmu,
kumbl konunga
ór kerum valði,
síðar brynjur,
ok sonum færði,
hlóðusk móðgir
á mara bógu.$txt$, $txt$Leende begav sig
Gudrun till fatburn,
konungarnas hjälmar
ur gömmorna upptog,
sida brynjor,
och till sönerna förde;
de satte sig hurtiga
på hästarnes rygg.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Þá kvað þat Hamðir
inn hugumstóri:
"Svá kemsk meir aftr
móður at vitja
geir-Njörðr hniginn
á Goðþjóðu,
at þú erfi
at öll oss drykkir,
at Svanhildi
ok sonu þína."$txt$, $txt$Då sade Hamder
i hågen djärv:
»Så kommer jag sedermera
att besöka min moder,
sen i gräset jag bitit
i goternas land,
att över oss alla
du arvöl dricker,
över Svanhild men ock
över sönerna dina.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Guðrún grátandi,
Gjúka dóttir,
gekk hon tregliga
á tái sitja
ok at telja
tárughlýra
móðug spjöll
á margan veg:$txt$, $txt$Gråtande Gudrun,
Gjukes dotter,
gick att sig sätta
i sorg vid husväggen
och att tälja
med tårade kinder
sagan om sina
sorger många.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Þrjá vissa ek elda,
þrjá vissa ek arna,
var ek þrimr verum
vegin at húsi;
einn var mér Sigurðr
öllum betri,
er bræðr mínir
at bana urðu.$txt$, $txt$»Tre eldar jag kände,
tre ärilar kände jag,
till tre mäns hem
som hustru jag fördes.
Av dem alla var Sigurd
den allra bästa,
som mina bröder
till bane blevo.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Svárra sára
sák-at ek né kunna,
-- -- --
meir þóttusk
mér of stríða,
er mik öðlingar
Atla gáfu.$txt$, $txt$Svårt och smärtsamt
[sin syster de bedrogo,
så att svårare]
ej jag såg eller de kunde.
Mot mig än mer
de menade illa,
när ädlingarne mig
åt Atle gåvo.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Húna hvassa
hét ek mér at rúnum;
máttig-a-k bölva
betr of vinna,
áðr ek hnóf höfuð
af Hniflungum.$txt$, $txt$Mina hurtiga småttingar
jag hemligen kallade;
jag ej kunde för mitt onda
upprättelse få,
förr än jag huvudet
högg av nivlungarne.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Gekk ek til strandar,
gröm vark nornum,
vilda ek hrinda
stríð grið þeira;
hófu mik, né drekkðu,
hávar bárur,
því ek land of sték,
at lifa skyldak.$txt$, $txt$Jag begav mig till stranden,
gramse på nornorna,
stacka jag ville
deras starka anlopp.
Höga böljor
buro mig, ej dränkte mig,
och på land jag steg,
att leva jag skulle.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Gekk ek á beð,
hugðak mér fyr betra,
þriðja sinni
þjóðkonungi;
ól ek mér jóð,
erfivörðu,
erfivörðu,
Jónakrs sonum.$txt$, $txt$I brudsäng jag gick
- bättre jag förr tyckte det -
gav för tredje gången
min tro åt en folkkonung;
barn jag födde,
födde arvingar,
söner som arvingar
efter Jonakr.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$En um Svanhildi
sátu þýjar,
er ek minna barna
bazt fullhugðak;
svá var Svanhildr
í sal mínum
sem væri sæmleitr
sólar geisli.$txt$, $txt$Men kring Svanhild
sutto tärnor,
och jag tyckte av barnen
bäst om henne.
Sådan var Svanhild
i salen hos mig,
som solens stråle
med sitt starka ljus.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Gædda ek gulli
ok guðvefjum,
áðr ek gæfak
Goðþjóðar til;
þat er mér harðast
harma minna
of þann inn hvíta
hadd Svanhildar,
auri tröddu
und jóa fótum.$txt$, $txt$Jag gav henne guld
och glänsande siden,
förrn jag gav henne bort
till goternas land.
Bland mina sorger
den svåraste är,
när på Svanhilds linvita
lockar jag tänker,
som de i gruset under hästars
hovar läto trampas.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$En sá sárastr,
er þeir Sigurð minn,
sigri ræntan,
í sæing vágu,
en sá grimmastr,
er þeir Gunnari
fránir ormar
til fjörs skriðu,
en sá hvassastr,
er til hjarta
konung óblauðan
kvikvan skáru.$txt$, $txt$Den smärtsammaste
då min Sigurd,
seger berövad,
i sängen de dödade,
och den grymmaste,
då mot Gunnars liv
glittrande ormar
gaddarne stucko,
och kvalfullast den,
då med kortsvärd de skuro
till hjärtat på levande
hjältemodig konung.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Fjölð man ek bölva,
-- -- --
Beittu, Siguðr,
inn blakka mar,
hest inn hraðfæra
láttu hinig renna;
sitr eigi hér
snör né dóttir,
sú er Guðrúnu
gæfi hnossir.$txt$, $txt$Av ont minns jag mycket
[och många sorger].
Betsla, Sigurd,
din becksvarta häst,
låt raska springaren
spränga hitåt.
Här sitter icke
sonhustru eller dotter,
som at Gudrun
gåve klenoder.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Minnsktu, Sigurðr,
hvat vit mæltum,
þá er vit á beð
bæði sátum,
at þú myndir mín,
móðugr, vitja,
halr, ór helju,
en ek þín ór heimi.$txt$, $txt$Minns nu, Sigurd,
vad vi sade varandra,
då vi på bädden
båda sutto,
att mig du skulle,
modige, gästa
som vålnad från Hel
och ur världen jag dig!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Hlaðið ér, jarlar,
eikiköstinn,
látið þann und hilmi
hæstan verða;
megi brenna brjóst
bölvafullt eldr,
þrungit um hjarta
þiðni sorgir."$txt$, $txt$Byggen nu, karlar,
bålet av ekved,
till högsta höjd
det höjen under fursten!
Må eld bränna bröstet,
bräddfullt av olycka!
Må sorgerna tina
kring tryckta hjärtat!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Jörlum öllum
óðal batni,
snótum öllum
sorg at minni,
at þetta tregróf
of talit væri.$txt$, $txt$För alla karlar
ont må bättras,
må för alla kvinnor
klagan bli mindre,
då denna lidandens lista
läses för dem!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gudruns eggelse$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);

-- ===== Valans spådom (valan) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Hljóðs bið ek allar
helgar kindir,
meiri ok minni
mögu Heimdallar;
viltu at ek, Valföðr,
vel fyr telja
forn spjöll fira,
þau er fremst of man.$txt$, $txt$»Hören mig alla
heliga släkten,
större och smärre
söner av Heimdall;
du vill ju, Valfader,
att väl jag täljer
forntida sägner,
de första, jag minnes.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Ek man jötna
ár of borna,
þá er forðum mik
fædda höfðu;
níu man ek heima,
níu íviðjur,
mjötvið mæran
fyr mold neðan.$txt$, $txt$Jättar, i urtid
alstrade, minns jag,
som mig fordom
fostrat hava;
nio världar jag minns,
och vad som var i de nio,
måttgivande trädet
under mullen djupt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Ár var alda,
þat er ekki var,
var-a sandr né sær
né svalar unnir;
jörð fannsk æva
né upphiminn,
gap var ginnunga
en gras hvergi.$txt$, $txt$I åldrarnes morgon,
då Ymer levde,
var ej sand, ej sjö,
ej svala vågor;
jorden fanns icke;
ej upptill himlen;
ett gapande svalg fanns
men gräs fanns ingenstädes.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Áðr Burs synir
bjöðum of yppðu,
þeir er Miðgarð
mæran skópu;
sól skein sunnan
á salar steina,
þá var grund gróin
grænum lauki.$txt$, $txt$Innan Bors söner lyfte
landen i höjden,
de som mångberömd
Midgård skapade.
Solen strålade
från söder på stenar,
och gröna örter
grodde i marken.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Sól varp sunnan,
sinni mána,
hendi inni hægri
um himinjöður;
sól þat né vissi,
hvar hon sali átti,
máni þat né vissi,
hvat hann megins átti,
stjörnur þat né vissu
hvar þær staði áttu.$txt$, $txt$Solen kom från söder
I sällskap med månen
på höger hand
över himlaranden.
Solen ej visste,
var salar hon hade,
månen ej visste
vad makt han hade,
stjärnorna ej visste,
var de skimra skulle.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Þá gengu regin öll
á rökstóla,
ginnheilög goð,
ok um þat gættusk;
nótt ok niðjum
nöfn of gáfu,
morgin hétu
ok miðjan dag,
undorn ok aftan,
árum at telja.$txt$, $txt$Då drogo alla makter
till sina domaresäten,
högheliga gudar,
och höllo rådslag;
åt natt och nedan
namn de gåvo,
uppkallade morgon
och middag också,
eftermiddag och afton,
för att med åratal räkna.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Hittusk æsir
á Iðavelli,
þeir er hörg ok hof
hátimbruðu;
afla lögðu,
auð smíðuðu,
tangir skópu
ok tól gerðu.$txt$, $txt$Asarne möttes
på Idavallen,
timrade höga
tempel och altar,
smedjor byggde,
smycken gjorde,
skaffade sig tänger
och skapade verktyg.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Tefldu í túni,
teitir váru,
var þeim vettergis
vant ór gulli,
uns þrjár kvámu
þursa meyjar
ámáttkar mjök
ór Jötunheimum.
'''---------'''$txt$, $txt$På gården med brädspel
de glada lekte,
armod på guld
fanns ingalunda,
tills tursamöar
trenne kommo,
mycket mäktiga
mör, från jättevärlden.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Þá gengu regin öll
á rökstóla,
ginnheilög goð,
ok um þat gættusk,
hverir skyldi dverga
dróttir skepja
ór Brimis blóði
ok ór Bláins leggjum.$txt$, $txt$Då drogo alla makter
till sina domaresäten,
högheliga gudar,
och höllo rådslag,
vem dvärgars skara
skapa skulle
av blodig bränning
och Blains ben.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Þar var Móðsognir
mæztr of orðinn
dverga allra,
en Durinn annarr;
þeir mannlíkun
mörg of gerðu
dvergar í jörðu,
sem Durinn sagði.$txt$, $txt$Där var Modsogner vorden
den mest förnämlige
av dvärgar alla
och Durin den andre;
de gjorde många
människobilder,
dessa dvärgar, av jord,
som Durin sade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Nýi, Niði,
Norðri, Suðri,
Austri, Vestri,
Alþjófr, Dvalinn,
Nár ok Náinn
Nípingr, Dáinn
Bívurr, Bávurr,
Bömburr, Nóri,
Ánn ok Ánarr,
Óinn, Mjöðvitnir.$txt$, $txt$Nye och Nide,
Nordre och Sudre,
Austre och Västre,
Alltjov, Dvalin,
Bivor, Bavor,
Bombur, Nore,
An och Anar,
Ae, Mjodvitner.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Veggr ok Gandalfr,
Vindalfr, Þorinn,
Þrár ok Þráinn,
Þekkr, Litr ok Vitr,
Nýr ok Nýráðr,
nú hefi ek dverga,
Reginn ok Ráðsviðr,
rétt of talða.$txt$, $txt$Veig och Gandalv,
Vindalv, Train,
Täck och Torin,
Tro, Vitr och Lit,
Na och Nyrad.
Nu har jag dvärgarna
- Regin och Radsvid -
rätt omtalat.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Fíli, Kíli,
Fundinn, Náli,
Hefti, Víli,
Hannar, Svíurr,
Billingr, Brúni,
Bíldr ok Buri,
Frár, Hornbori,
Frægr ok Lóni,
Aurvangr, Jari,
Eikinskjaldi.$txt$, $txt$File, Kile,
Funden, Nale,
Hepte, Vile,
Hanar, Svior,
Fra, Hornbore,
Fräg och Lone,
Aurvang, Jare,
Eikinskjalde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Mál er dverga
í Dvalins liði
ljóna kindum
til Lofars telja,
þeir er sóttu
frá salar steini
Aurvanga sjöt
til Jöruvalla.$txt$, $txt$Tid är att dvärgar
i Dvalins skara
för människorna leda
till Lovar i ättlängd;
de som sandfältens säte
sökte åt sig
till grusslätterna
från grundens sten.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Þar var Draupnir
ok Dolgþrasir,
Hár, Haugspori,
Hlévangr, Glóinn,
Dóri, Óri
Dúfr, Andvari
Skirfir, Virfir,
Skáfiðr, Ái.$txt$, $txt$Där var Draupner
och Dolgtraser,
Ha, Haugspore,
Lävang, Gloe,
Dore, Ore,
Duv, Andvare,
Skirver, Virver,
Skavid, Ae.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Alfr ok Yngvi,
Eikinskjaldi,
Fjalarr ok Frosti,
Finnr ok Ginnarr;
þat mun æ uppi
meðan öld lifir,
langniðja tal
Lofars hafat.
'''---------'''$txt$, $txt$Alf och Yngve,
Eikinskjalde,
Fjalar och Froste,
Finn och Ginnar.
Alltid skall minnas,
så länge människor leva,
denna långa räcka
av Lovars förfäder.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Unz þrír kvámu
ór því liði
öflgir ok ástkir
æsir at húsi,
fundu á landi
lítt megandi
Ask ok Emblu
örlöglausa.$txt$, $txt$Tills ur den skaran
trenne asar,
kraftiga och kärleksfulla,
kommo till ett hus.
De funno på land
föga förmående
Ask och Embla
utan livsmål.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Önd þau né áttu,
óð þau né höfðu,
lá né læti
né litu góða;
önd gaf Óðinn,
óð gaf Hænir,
lá gaf Lóðurr
ok litu góða.$txt$, $txt$Ande de ej ägde,
omdöme ej hade,
ej livssaft, ej läte,
ej livlig färg.
Ande gav Oden,
omdöme Höner,
livssaft gav Lodur
och livlig färg.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Ask veit ek standa,
heitir Yggdrasill,
hár baðmr, ausinn
hvíta auri;
þaðan koma döggvar,
þærs í dala falla,
stendr æ yfir grænn
Urðarbrunni.$txt$, $txt$En ask vet jag stånda,
den Yggdrasil heter,
ett väldigt träd, överöst
av vita sanden.
Därifrån kommer daggen,
som i dalarne faller,
den står evigt grön
över Urdarbrunnen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Þaðan koma meyjar
margs vitandi
þrjár ór þeim sæ,
er und þolli stendr;
Urð hétu eina,
aðra Verðandi,
- skáru á skíði, -
Skuld ina þriðju;
þær lög lögðu,
þær líf kuru
alda börnum,
örlög seggja.$txt$, $txt$Därifrån komma möar,
som mycket veta,
tre ur den sal,
som under trädet står.
Urd hette en,
den andra Verdandi,
man skar på trä
namnet Skuld på den tredje.
Lagar de satte,
liv de korade
för människors barn,
männens öden.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Þat man hon folkvíg
fyrst í heimi,
er Gullveigu
geirum studdu
ok í höll Hárs
hana brenndu,
þrisvar brenndu,
þrisvar borna,
oft, ósjaldan,
þó hon enn lifir.$txt$, $txt$Det fältslag minns hon
först i världen,
när de med spjuten
spetsade Gullveig
och i den Höges sal
henne brände.
Tre gånger brände de
den tre gånger borna,
ofta, ej sällan,
dock än hon lever.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Heiði hana hétu
hvars til húsa kom,
völu velspáa,
vitti hon ganda;
seið hon, hvars hon kunni,
seið hon hug leikinn,
æ var hon angan
illrar brúðar.$txt$, $txt$Heid hon hette,
var till husen hon kom,
en väl siande vala.
Hon signade stavar,
hon trollade, var hon kunde,
trollade förryckthet.
Alltid var hon älskad
av onda kvinnor.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Þá gengu regin öll
á rökstóla,
ginnheilög goð,
ok um þat gættusk,
hvárt skyldu æsir
afráð gjalda
eða skyldu goðin öll
gildi eiga.$txt$, $txt$Då drogo alla makter
till sina domaresäten,
högheliga gudar,
och höllo rådslag,
om asarne skulle
skada lida
eller alla gudar
ersättning få.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Fleygði Óðinn
ok í folk of skaut,
þat var enn folkvíg
fyrst í heimi;
brotinn var borðveggr
borgar ása,
knáttu vanir vígspá
völlu sporna.$txt$, $txt$Spjut slungade Oden
och sände bland flocken,
det fältslaget ock
var först i världen.
Brutet var bröstvärn
på borgen hos asar,
över vapentagna fält
kunde vanerna tränga.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Þá gengu regin öll
á rökstóla,
ginnheilög goð,
ok um þat gættusk,
hverjir hefði loft allt
lævi blandit
eða ætt jötuns
Óðs mey gefna.$txt$, $txt$Då drogo alla makter
till sina domaresäten,
högheliga gudar,
och höllo rådslag,
vem all luften
med lyte blandat
eller åt jättens ätt
Ods mö givit.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Þórr einn þar vá
þrunginn móði,
- hann sjaldan sitr -
er hann slíkt of fregn -:
á gengusk eiðar,
orð ok særi,
mál öll meginlig,
er á meðal fóru.$txt$, $txt$Blott Tor slog till
i trotsigt mod,
han sällan sitter,
då slikt han hör,
Eder brötos,
ord och löften,
alla viktiga avtal,
som växlats dem emellan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Veit hon Heimdallar
hljóð of folgit
und heiðvönum
helgum baðmi,
á sér hon ausask
aurgum forsi
af veði Valföðrs.
Vituð ér enn - eða hvat?$txt$, $txt$Hon vet Heimdalls
hornlåt bero
på det himmelshöga
heliga trädet.
På detta ser hon svämma
en sandblandad fors
från Valfaders pant.
Veten I än mer och vad?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Ein sat hon úti,
þá er inn aldni kom
yggjungr ása
ok í augu leit.
Hvers fregnið mik?
Hví freistið mín?
Allt veit ek, Óðinn,
hvar þú auga falt,
í inum mæra
Mímisbrunni.
Drekkr mjöð Mímir
morgun hverjan
af veði Valföðrs.
Vituð ér enn - eða hvat?$txt$, $txt$Ensam satt hon ute,
när asarnes skräckgud,
den åldrige, kom
och i ögat henne såg.
»Vad frågen I mig?
Vi fresten I mig?
Allt vet jag, Oden,
var ditt öga du gömde
i Mimers brunn,
den mycket berömda.
Mjöd var morgon
Mimer dricker
av Valfaders pant.»
Veten I än mer och vad?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$Valði henni Herföðr
hringa ok men,
fekk spjöll spaklig
ok spá ganda,
sá hon vítt ok of vítt
of veröld hverja.$txt$, $txt$Gav Härfader henne
halsguld och ringar,
fick visdomsord
och varsel av stavar;
hon såg vida omkring
i varje värld.
:—————$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Sá hon valkyrjur
vítt of komnar,
görvar at ríða
til Goðþjóðar;
Skuld helt skildi,
en Skögul önnur,
Gunnr, Hildr, Göndul
ok Geirskögul.
Nú eru talðar
nönnur Herjans,
görvar at ríða
grund valkyrjur.$txt$, $txt$Hon såg valkyrior,
komna från fjärran,
redo att göra
ritten till Godtjod.
Skuld höll sköld,
och Skogul var den andra,
Gunn, Hild, Gondul
och Geirskogul.
Nu äro Härjans
härjungfrur nämnda,
valkyrior, redo
att rida på jorden.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Ek sá Baldri,
blóðgum tívur,
Óðins barni,
örlög folgin;
stóð of vaxinn
völlum hæri
mjór ok mjök fagr
mistilteinn.$txt$, $txt$Jag såg åt Balder,
blodige guden,
Odens barn,
ett öde gömmas.
Högt över slätterna
smal stod vuxen
och mycket fager
misteltenen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Varð af þeim meiði,
er mær sýndisk,
harmflaug hættlig,
Höðr nam skjóta;
Baldrs bróðir var
of borinn snemma,
sá nam Óðins sonr
einnættr vega.$txt$, $txt$Från det trädet, som tycktes
en telning vara,
ett sorgeskott blev skjutet,
och skytten var Höder.
Balders broder
blev boren inom kort,
Odenssonen stred
blott en natt gammal.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Þó hann æva hendr
né höfuð kembði,
áðr á bál of bar
Baldrs andskota;
en Frigg of grét
í Fensölum
vá Valhallar.
Vituð ér enn - eða hvat?$txt$, $txt$Sina händer han ej tvådde,
sitt huvud han ej kammade,
förrän på bålet han bar
Balders fiende.
Men Frigg grät
i Fensalarna
över Valhalls ve.
Veten I än mer och vad?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$Þá kná Váli
vígbönd snúa,
heldr váru harðgör
höft ór þörmum.$txt$, $txt$Då kunde fängsel man vrida
av Vales tarmar,
ganska fasta voro
fjättrarne snodda.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Haft sá hon liggja
und Hveralundi,
lægjarns líki
Loka áþekkjan;
þar sitr Sigyn
þeygi of sínum
ver vel glýjuð.
Vituð ér enn - eða hvat?$txt$, $txt$I kedjor såg hon ligga
under Kittellunden
en led skepnad
med Lokes drag.
Där sitter Sigyn
i sorg hos maken,
föga väl till mods.
Veten I än mer och vad?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$Á fellur austan
um eitrdala
söxum ok sverðum,
Slíðr heitir sú.$txt$, $txt$En å från öster
genom etterdalar flyter,
med svärd och stridsknivar;
Slidr den heter.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$Stóð fyr norðan
á Niðavöllum
salr ór gulli
Sindra ættar;
en annarr stóð
á Ókólni
bjórsalr jötuns,
en sá Brimir heitir.$txt$, $txt$Norrut stod
på Nidaslätterna
en sal av guld
för Sindres ätt;
en annan stod
på Okolner,
gästabudssal
för jätten Brimer.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$Sal sá hon standa
sólu fjarri
Náströndu á,
norðr horfa dyrr;
falla eitrdropar
inn um ljóra,
sá er undinn salr
orma hryggjum.$txt$, $txt$En sal såg hon stånda
från solen fjärran
på Nastranden;
åt norr vetter dörren.
Etterdroppar föllo
in genom rökhålet,
av ormars ryggar
är rummet flätat.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$Sá hon þar vaða
þunga strauma
menn meinsvara
ok morðvarga
ok þann er annars glepr
eyrarúnu;
þar saug Niðhöggr
nái framgengna,
sleit vargr vera.
Vituð ér enn - eða hvat?$txt$, $txt$Där såg hon i strida
strömmar vada
menediga män
och för mord fredlösa
och den, en annans hustru
hemligt lockar.
Där sög Nidhögg
de dödas kroppar,
vidundret slet männen.
Veten I än mer och vad?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$Austr sat in aldna
í Járnviði
ok fæddi þar
Fenris kindir;
verðr af þeim öllum
einna nokkurr
tungls tjúgari
í trölls hami.$txt$, $txt$Österut i Järnskogen
den åldriga satt
och födde där
Fenrers avkomlingar.
En bliver mest
av alla förnämlig,
tunglets rövare,
i trolls skepnad.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$Fyllisk fjörvi
feigra manna,
rýðr ragna sjöt
rauðum dreyra;
svört verða sólskin
um sumur eftir,
veðr öll válynd.
Vituð ér enn - eða hvat?$txt$, $txt$Han mättar sig med lik
av män, som dött,
gudars boning
med blod besudlar.
Svart blir solskenet
om somrarne efter,
all väderlek vansklig.
Veten I än mer och vad?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$Sat þar á haugi
ok sló hörpu
gýgjar hirðir,
glaðr Eggþér;
gól of hánum
í galgviði
fagrrauðr hani,
sá er Fjalarr heitir.$txt$, $txt$Satt där på högen
och slog harpan
gygens värnare,
den glade Eggder.
Över honom gol
i granskog med pors
en fagerröd hane,
som Fjalar heter.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$Gól of ásum
Gullinkambi,
sá vekr hölða
at Herjaföðrs;
en annarr gelr
fyr jörð neðan
sótrauðr hani
at sölum Heljar.$txt$, $txt$Gol över asarne
Gullinkambe,
han hos Härfader
härmännen väcker;
en annan gal
under jorden,
en sotröd hane,
i Hels salar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$Geyr nú Garmr mjök
fyr Gnipahelli,
festr mun slitna,
en freki renna;
fjölð veit ek fræða,
fram sé ek lengra
um ragna rök
römm sigtíva.$txt$, $txt$Gram skäller gräsligt
framför Gnipahålan;
fjättern skall brista,
fri varder ulven.
Visdom vet jag mycken,
långt vidare ser jag
över segergudars väldiga
slutliga öden.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$Bræðr munu berjask
ok at bönum verðask,
munu systrungar
sifjum spilla;
hart er í heimi,
hórdómr mikill,
skeggöld, skalmöld,
skildir ro klofnir,
vindöld, vargöld,
áðr veröld steypisk;
mun engi maðr
öðrum þyrma.$txt$, $txt$Bröder skola kämpa,
varandras banemän bliva,
systrars barn
sin släktskap spilla;
hårt är i världen,
hordom mycken,
yxtid, klingtid,
kluvna bliva sköldar,
vindålder, vargålder,
innan världen störtas;
ingen man skall
den andre skona.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$Leika Míms synir,
en mjötuðr kyndisk
at inu galla
Gjallarhorni;
hátt blæss Heimdallr,
horn er á lofti,
mælir Óðinn
við Míms höfuð.$txt$, $txt$Mims söner leka
och slutödet tändes
vid Gjallarhornets ljud,
det genomträngande.
Högt blåser Heimdall,
med hornet i vädret;
med Mims huvud
håller Oden råd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$Skelfr Yggdrasils
askr standandi,
ymr it aldna tré,
en jötunn losnar;
hræðask allir
á helvegum
áðr Surtar þann
sefi of gleypir.$txt$, $txt$Då skälver Yggdrasils
ask, där den står,
urträdet jämrar sig,
jätten blir lös.
På resan till Hel
rädas alla,
innan Surts släkting
slukar honom.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$Hvat er með ásum?
Hvat er með alfum?
Gnýr allr Jötunheimr,
æsir ro á þingi,
stynja dvergar
fyr steindurum,
veggbergs vísir.
Vituð ér enn - eða hvat?$txt$, $txt$Vad är med asar?
Vad är med alver?
Allt Jättehem gnyr,
asar hava möte.
Dvärgarna stöna
framför stendörrarna,
bergväggens vise.
Veten I än mer och vad?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$Geyr nú Garmr mjök
fyr Gnipahelli,
festr mun slitna
en freki renna;
fjölð veit ek fræða,
fram sé ek lengra
um ragna rök
römm sigtíva.$txt$, $txt$Garm nu skäller gräsligt
framför Gnipahålan;
fjättern skall brista,
och fri blir ulven.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$Hrymr ekr austan,
hefisk lind fyrir,
snýsk Jörmungandr
í jötunmóði;
ormr knýr unnir,
en ari hlakkar,
slítr nái niðfölr,
Naglfar losnar.$txt$, $txt$Rym far från öster,
på arm håller skölden;
i jättevrede vrider
världsormen sig;
ormen piskar vågen,
och örnen skriar,
sliter lik, blek om näbben,
och Naglfar lossnar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$Kjóll ferr austan,
koma munu Múspells
of lög lýðir,
en Loki stýrir;
fara fíflmegir
með freka allir,
þeim er bróðir
Býleists í för.$txt$, $txt$Skeppet far från öster;
över sjön skall Muspells
ledung komma,
och Loke styr.
Vidunders yngel
med ulven kommer;
med dem är Byleipts
broder i följe.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 52, $txt$Surtr ferr sunnan
með sviga lævi,
skínn af sverði
sól valtíva;
grjótbjörg gnata,
en gífr rata,
troða halir helveg,
en himinn klofnar.$txt$, $txt$Surt far från söder
med svedjande låga,
stridsgudars sol
av svärdet skiner.
Stenberg störta,
det stupar jättekvinnor;
trampa dödingar Hels väg,
och himmelen rämnar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=52);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 53, $txt$Þá kemr Hlínar
harmr annarr fram,
er Óðinn ferr
við ulf vega,
en bani Belja
bjartr at Surti;
þá mun Friggjar
falla angan.$txt$, $txt$Ett andra lidande
för Lin då kommer,
när Oden går
mot ulven att strida,
och Beles bjärte
bane mot Surt;
falla då skall
Friggs älskade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=53);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 54, $txt$Geyr nú Garmr mjök
fyr Gnipahelli,
festr mun slitna,
en freki renna;
fjölð veit ek fræða,
fram sé ek lengra
um ragna rök
römm sigtíva.$txt$, $txt$Garm nu skäller gräsligt
framför Gnipahålan;
fjättern skall brista,
och fri blir ulven.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=54);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 55, $txt$Þá kemr inn mikli
mögr Sigföður,
Víðarr, vega
at valdýri.
Lætr hann megi Hveðrungs
mundum standa
hjör til hjarta,
þá er hefnt föður.$txt$, $txt$Då kommer Segerfaderns
son, den väldige,
Vidar, att strida
mot valplatsens odjur.
På jättesonen
till hjärtat svärdet
med handen han stöter.
Hämnad är då fadern.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=55);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 56, $txt$Þá kemr inn mæri
mögr Hlóðynjar,
gengr Óðins sonr
við orm vega,
drepr af móði
Miðgarðs véurr,
munu halir allir
heimstöð ryðja;
gengr fet níu
Fjörgynjar burr
neppr frá naðri
níðs ókvíðnum.$txt$, $txt$Då kommer Lodyns
lysande ättling;
Odens son
går mot ormen att kämpa
I vrede denne dräper
värjaren av Midgård.
Från sitt hem all draga
döda hädan.
Nio fjät döende
går Fjorgyns son
fram från ormen,
som ofrejd ej fruktar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=56);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 57, $txt$Sól tér sortna,
sígr fold í mar,
hverfa af himni
heiðar stjörnur;
geisar eimi
ok aldrnari,
leikr hár hiti
við himin sjalfan.$txt$, $txt$Solen börjar svartna,
jord sänkes i havet,
från fästet falla
flammande stjärnor;
upp ångar imma,
och elden lågar,
hettan leker högt
mot himlen själv.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=57);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 58, $txt$Geyr nú Garmr mjök
fyr Gnipahelli,
festr mun slitna
en freki renna;
fjölð veit ek fræða
fram sé ek lengra
um ragna rök
römm sigtíva.$txt$, $txt$Garm skäller gräsligt
framför Gnipahålan;
fjättern skall brista,
och fri blir ulven.
:—————$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=58);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 59, $txt$Sér hon upp koma
öðru sinni
jörð ór ægi
iðjagræna;
falla forsar,
flýgr örn yfir,
sá er á fjalli
fiska veiðir.$txt$, $txt$Upp ser hon komma
för andra gången
jorden ur havet,
igen grönskande;
forsar falla,
örn flyger däröver,
den som på fjället
fiskar griper.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=59);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 60, $txt$Finnask æsir
á Iðavelli
ok um moldþinur
máttkan dæma
ok minnask þar
á megindóma
ok á Fimbultýs
fornar rúnir.$txt$, $txt$Asarne mötas
på Idavallen
och om jordens gördel,
jätteormen, tala,
föra sig till minnes
märkliga öden
och Fimbultyrs
forntida runor.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=60);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 61, $txt$Þar munu eftir
undrsamligar
gullnar töflur
í grasi finnask,
þærs í árdaga
áttar höfðu.$txt$, $txt$Där skola åter
de underbara
guldspelsbrickorna
i gräset hittas,
som i tidens morgon
dem tillhört hade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=61);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 62, $txt$Munu ósánir
akrar vaxa,
böls mun alls batna,
Baldr mun koma;
búa þeir Höðr ok Baldr
Hrofts sigtoftir,
vé valtíva.
Vituð ér enn - eða hvat?$txt$, $txt$Osådda skola
åkrar växa,
allt ont sig bättra;
Balder skall komma.
I Ropts segersalar
sitta Balder och Höder,
valplatsens gudar.
Veten I än mer och vad?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=62);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 63, $txt$Þá kná Hænir
hlautvið kjósa
ok burir byggja
bræðra tveggja
vindheim víðan.
Vituð ér enn - eða hvat?$txt$, $txt$Då kan Höner lyckans
lotter kasta
och de båda brödernas
barn bebo
det vida Vindhem.
Veten i än mer och vad?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=63);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 64, $txt$Sal sér hon standa
sólu fegra,
gulli þakðan
á Gimléi;
þar skulu dyggvar
dróttir byggja
ok um aldrdaga
ynðis njóta.$txt$, $txt$En sal ser fagrare
än solen stånda,
täckt med guld,
på Gimle.
Där skola hövdingtrogna
härskaror bo
och i allan tid
äga hugnad.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=64);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 65, $txt$Þá kemr inn ríki
at regindómi
öflugr ofan,
sá er öllu ræðr.$txt$, $txt$Då kommer den mäktige
till maktdomen,
den starke, ovanifrån,
han som styr över allt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=65);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 66, $txt$Þar kemr inn dimmi
dreki fljúgandi,
naðr fránn, neðan
frá Niðafjöllum;
berr sér í fjöðrum,
- flýgr völl yfir, -
Niðhöggr nái.
Nú mun hon sökkvask.$txt$, $txt$Då kommer dunklets
drake flygande,
en blank orm, nedifrån,
från Nidafjällen.
I fjädrarne bär,
och flyger över slätten.
Nidhögg lik.
Nu skall hon sjunka.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Valans spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=66);

-- ===== Den Höges sång (hoges) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Gáttir allar,
áðr gangi fram,
um skoðask skyli,
um skyggnast skyli,
því at óvíst er at vita,
hvar óvinir
sitja á fleti fyrir.$txt$, $txt$Alla dörrar,
innan in man går,
skarpt skådas skola,
skarpt granskas skola,
ty ovisst är att veta,
var ovänner sitta
borta på salens bänkar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Gefendr heilir!
Gestr er inn kominn,
hvar skal sitja sjá?
Mjök er bráðr,
sá er á bröndum skal
síns of freista frama.$txt$, $txt$I givande, hell er!
Gäst är in kommen,
Sägen, var sitta han skall!
Brått har den,
som på bränderna vid härden
skall fresta, vad framgång han får.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Elds er þörf,
þeims inn er kominn
ok á kné kalinn;
matar ok váða
er manni þörf,
þeim er hefr um fjall farit.$txt$, $txt$Eld behöver,
den in har kommit,
och kall har blivit om knäna.
Mat och kläder
den man tarvar,
som har över fjällen farit.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Vatns er þörf,
þeim er til verðar kemr,
þerru ok þjóðlaðar,
góðs of æðis,
ef sér geta mætti,
orðs ok endrþögu.$txt$, $txt$Vatten tarvar
vandrarn, som kommer till måltid,
handduk och vänlig välkomst;
välvilligt sinne,
om han sådant kan vinna,
samspråk och bjudning tillbaka.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Vits er þörf,
þeim er víða ratar;
dælt er heima hvat;
at augabragði verðr,
sá er ekki kann
ok með snotrum sitr.$txt$, $txt$Vett behöver,
den som vida färdas;
lätt är hemma vadhelst.
Mång ögonkast får,
den som intet förstår
och sitter med kloka tillsammans.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$At hyggjandi sinni
skyli-t maðr hræsinn vera,
heldr gætinn at geði;
þá er horskr ok þögull
kemr heimisgarða til,
sjaldan verðr víti vörum,
því at óbrigðra vin
fær maðr aldregi
en mannvit mikit.$txt$, $txt$Över sitt förstånd
skall man stolt ej vara,
fasthellre i väsendet varsam!
När en klok och sluten
kommer till gården,
sällan den försiktige sig skadar,
ty osvikligare vän
man aldrig får
än mycket mannavett.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Inn vari gestr,
er til verðar kemr,
þunnu hljóði þegir,
eyrum hlýðir,
en augum skoðar;
svá nýsisk fróðra hverr fyrir.$txt$, $txt$Den varsamme gästen,
som till gille kommer
tiger under lyssnande tystnad;
med öronen hör efter,
med ögonen skådar,
så spanar var klok och spejar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Hinn er sæll,
er sér of getr
lof ok líknstafi;
ódælla er við þat,
er maðr eiga skal
annars brjóstum í.$txt$, $txt$Säll är den,
som åt sig vinner,
lovord och lisa i nöden.
Otryggt är allt,
som man äga skall,
buret i andras bröst.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Sá er sæll,
er sjalfr of á
lof ok vit, meðan lifir;
því at ill ráð
hefr maðr oft þegit
annars brjóstum ór.$txt$, $txt$Säll är den,
som för sig äger
lovord och förstånd uti livet,
ty onda anslag
man ofta rönt
alstras ur andras bröst.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Byrði betri
berr-at maðr brautu at
en sé mannvit mikit;
auði betra
þykkir þat í ókunnum stað;
slíkt er válaðs vera.$txt$, $txt$Bättre börda
man bär ej på vägen
än mycket mannavett.
På främmande ort
går det framför guld.
Slikt är den torftiges tillflykt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Byrði betri
berr-at maðr brautu at
en sé mannvit mikit;
vegnest verra
vegr-a hann velli at
en sé ofdrykkja öls.$txt$, $txt$Bättre börda
man bär ej på vägen
än mycket mannavett.
Sämre vägkost
man ej släpar över fältet
än övermått utav öl.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Er-a svá gótt
sem gótt kveða
öl alda sona,
því at færa veit,
er fleira drekkr
síns til geðs gumi.$txt$, $txt$Ej är så gott,
som gott man säger,
öl för människors ätt;
ty mindre en man,
ju mera han dricker,
vet till sig, vad tankar han har.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Óminnishegri heitir
sá er yfir ölðrum þrumir,
hann stelr geði guma;
þess fugls fjöðrum
ek fjötraðr vark
í garði Gunnlaðar.$txt$, $txt$Glömskans häger heter,
den över glatt lag svävar;
han snattar från män deras sans.
Med den fågelns fjädrar
jag fjättrad blev
i Gunnlods gård.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Ölr ek varð,
varð ofrölvi
at ins fróða Fjalars;
því er ölðr bazt,
at aftr of heimtir
hverr sitt geð gumi.$txt$, $txt$Drucken jag blev,
blev döddrucken
hos den förfarne Fjalar.
Gille är ypperst,
då var gäst går hem
med sinnen i full sans.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Þagalt ok hugalt
skyli þjóðans barn
ok vígdjarft vera;
glaðr ok reifr
skyli gumna hverr,
unz sinn bíðr bana.$txt$, $txt$Tyst och klok
vare konungason,
och djärv, när strid står;
munter och glad
bland män envar,
tills han av döden drabbas!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Ósnjallr maðr
hyggsk munu ey lifa,
ef hann við víg varask;
en elli gefr
hánum engi frið,
þótt hánum geirar gefi.$txt$, $txt$Ovis man
tror sig alltid skola leva,
om för vapenskifte han sig aktar,
men ålderdomen giver
honom ingen frid,
fast honom spjuten spara.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Kópir afglapi
er til kynnis kemr,
þylsk hann um eða þrumir;
allt er senn,
ef hann sylg of getr,
uppi er þá geð guma.$txt$, $txt$En gäck stirrar,
när han till gille kommer;
han talar om allt eller tiger;
på samma gång,
som en sup han får,
då är det slut med hans slughet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Sá einn veit
er víða ratar
ok hefr fjölð of farit,
hverju geði
stýrir gumna hverr,
sá er vitandi er vits.$txt$, $txt$Blott den vet,
som vida reser
och fjärran farit har,
vad lynnesart
leder envar.
Han vet, vad vett är.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Haldi-t maðr á keri,
drekki þó at hófi mjöð,
mæli þarft eða þegi,
ókynnis þess
vár þik engi maðr,
at þú gangir snemma at sofa.$txt$, $txt$Håll ej på hornet,
drick dock hovsamt själv,
tala, vad som höves, eller tig!
För det okynnet
ingen dig tadlar,
att du tidigt sängen söker.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Gráðugr halr,
nema geðs viti,
etr sér aldrtrega;
oft fær hlægis,
er með horskum kemr,
manni heimskum magi.$txt$, $txt$Glupske slukaren,
om besinning han ej vet,
äter sig ohälsa.
Löje skaffar ofta
i lag med okloka
åt enfaldig man hans mage.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Hjarðir þat vitu,
nær þær heim skulu,
ok ganga þá af grasi;
en ósviðr maðr
kann ævagi
síns of mál maga.$txt$, $txt$Hjordar veta
när vända hem de skola,
och gånga då från gräset,
men ovis man
aldrig känner
sin egen mages mått.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Vesall maðr
ok illa skapi
hlær at hvívetna;
hittki hann veit,
er hann vita þyrfti,
at hann er-a vamma vanr.$txt$, $txt$En eländig man
och illasinnad
gör hån åt vad som helst;
det vet han icke,
som han veta behövde,
att honom fel ej fattas.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Ósviðr maðr
vakir um allar nætr
ok hyggr at hvívetna;
þá er móðr,
er at morgni kemr,
allt er víl sem var.$txt$, $txt$Ovis man
alla nätter vakar,
grubblar och grämer sig för allt;
matt är han,
när morgonen kommer;
vedermödan är, som den var.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Ósnotr maðr
hyggr sér alla vera
viðhlæjendr vini;
hittki hann fiðr,
þótt þeir um hann fár lesi,
ef hann með snotrum sitr.$txt$, $txt$Ovis man
tror alla vara
vänner, som vänligt le;
han förstår icke,
fast de stämpla mot honom,
om han bland sluga sitter.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Ósnotr maðr
hyggr sér alla vera
viðhlæjendr vini;
þá þat finnr,
er at þingi kemr,
at hann á formælendr fáa.$txt$, $txt$Ovis man
tror alla vara
vänner, som vänligt le;
när på tinget han kommer,
det ter sig klart,
att få hans talan föra.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Ósnotr maðr
þykkisk allt vita,
ef hann á sér í vá veru;
hittki hann veit,
hvat hann skal við kveða,
ef hans freista firar.$txt$, $txt$Ovis man
tror sig allt veta.
när i vrå i skygd han vistas;
men slätt han vet,
vad han svara skall,
när män hans förmåga fresta.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Ósnotr maðr,
er með aldir kemr,
þat er bazt, at hann þegi;
engi þat veit,
at hann ekki kann,
nema hann mæli til margt;
veit-a maðr,
hinn er vettki veit,
þótt hann mæli til margt.$txt$, $txt$Ovis man,
som bland andra kommer,
gör bäst i att tyst förbliva;
ingen vet,
att han intet kan,
om ej för ymnigt han ordar.
Ingen känner
den, som ingenting vet,
om icke för ymnigt han ordar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Fróðr sá þykkisk,
er fregna kann
ok segja it sama;
eyvitu leyna
megu ýta synir,
því er gengr um guma.$txt$, $txt$Klok den synes,
som kunnig är
att spörja och spörsmål besvara.
Hemligt aldrig
kan hållas sådant,
som går ifrån mun till mun.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$Ærna mælir,
sá er æva þegir,
staðlausu stafi;
hraðmælt tunga,
nema haldendr eigi,
oft sér ógótt of gelr.$txt$, $txt$Alltför mycket talar,
den som aldrig tiger,
av ord med ingen mening.
Hastig tunga,
som ej hålles i styr,
ofta sig ofärd pratar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$At augabragði
skal-a maðr annan hafa,
þótt til kynnis komi;
margr þá fróðr þykkisk,
ef hann freginn er-at
ok nái hann þurrfjallr þruma.$txt$, $txt$Till ögnagyckel
skall man annan ej hava,
om han gör som gäst besök.
Klok mången tyckes,
om han ej tilltalas,
och helskinnad hållas han får.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Fróðr þykkisk,
sá er flótta tekr,
gestr at gest hæðinn;
veit-a görla,
sá er of verði glissir,
þótt hann með grömum glami.$txt$, $txt$Klok förefaller,
den till flykten tager,
en gäst, som är hånfull mot gäst.
Föga den vet,
som flinar vid måltid,
om han med gramsne ej glammar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Gumnar margir
erusk gagnhollir,
en at virði vrekask;
aldar róg
þat mun æ vera,
órir gestr við gest.$txt$, $txt$Många män
med mångprövad vänskap
gyckla med varandra vid gillet.
Alltid det är
ett upphov till strid,
att gäst tvistar med gäst.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Árliga verðar
skyli maðr oft fáa,
nema til kynnis komi:
str ok snópir,
lætr sem solginn sé
ok kann fregna at fáu.$txt$, $txt$På morgonen en man,
sig måltid rikligt skaffe,
om han till bekanta ej kommer;
annars sitter han och snappar,
som svulten han vore,
och kan föga fråga.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$Afhvarf mikit
er til ills vinar,
þótt á brautu búi,
en til góðs vinar
liggja gagnvegir,
þótt hann sé firr farinn.$txt$, $txt$Stor omväg
till ovän är,
fast vid vägen hans stuga stode;
men till god vän
på gen vägar,
vore han än fjärran faren.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Ganga skal,
skal-a gestr vera
ey í einum stað;
ljúfr verðr leiðr,
ef lengi sitr
annars fletjum á.$txt$, $txt$Gå skall man,
ej är gott, att gäst
är ständigt på samma ställe.
Ljuv bliver led,
om länge kvar
på en annans bänk han bliver.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$Bú er betra,
þótt lítit sé,
halr er heima hverr;
þótt tvær geitr eigi
ok taugreftan sal,
þat er þó betra en bæn.$txt$, $txt$Ett bo är bäst,
fast blott helt litet,
herre är hemma envar.
Fast man tågor har till tak
och blott två getter äger,
är det bättre än bedja om mat.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$Bú er betra,
þótt lítit sé,
halr er heima hverr;
blóðugt er hjarta,
þeim er biðja skal
sér í mál hvert matar.$txt$, $txt$Ett bo är bäst,
fast blott helt litet,
herre är hemma envar.
blödande är hjärtat
på den, som bedja skall
sig mat till varje mål.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$Vápnum sínum
skal-a maðr velli á
feti ganga framar,
því at óvíst er at vita,
nær verðr á vegum úti
geirs of þörf guma.$txt$, $txt$Från sina vapen
ej vike en man
på fältet ett enda fjät,
ty ovisst är att veta,
när ute på vägen
spjutets spets kan tarvas.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$Fannk-a ek mildan mann
eða svá matar góðan,
at væri-t þiggja þegit,
eða síns féar
svági [glöggvan],
at leið sé laun, ef þægi.$txt$, $txt$Ej så givmild man
eller gästfri jag fann,
att ej åt gåvor han gladdes,
eller så litet snål
på sitt gods,
att led vore lön, om han finge.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$Féar síns,
er fengit hefr,
skyli-t maðr þörf þola;
oft sparir leiðum,
þats hefr ljúfum hugat;
margt gengr verr en varir.$txt$, $txt$Den som välstånd
förvärvat har,
skall torftighet ej tåla;
ofta spars åt okär,
vad åt älskling var ämnat;
mycket går värre, än man väntat.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$Vápnum ok váðum
skulu vinir gleðjask;
þat er á sjalfum sýnst;
viðrgefendr ok endrgefendr
erusk lengst vinir,
ef þat bíðr at verða vel.$txt$, $txt$Med vapen och kläder
glädje vänner varandra!
Själv man skönjer det bäst.
Genom gengåvor vänskapen
varar längst;
om annars det vill sig väl.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$Vin sínum
skal maðr vinr vera
ok gjalda gjöf við gjöf;
hlátr við hlátri
skyli hölðar taka
en lausung við lygi.$txt$, $txt$Till sin vän
skall man vän vara
och vedergälla gåva med gåva;
med löje skall man
löje gälda
och försök att lura med lögn.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$Vin sínum
skal maðr vinr vera,
þeim ok þess vin;
en óvinar síns
skyli engi maðr
vinar vinr vera.$txt$, $txt$Till sin vän
skall man vän vara,
till honom och hans vän;
men till oväns vän
skall ingen man
någonsin vän vara.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$Veiztu, ef þú vin átt,
þann er þú vel trúir,
ok vill þú af hánum gótt geta,
geði skaltu við þann blanda
ok gjöfum skipta,
fara at finna oft.$txt$, $txt$Vet du, om vän du har,
som du väl tror
och gott av honom vill hava;
förtrolig skall du vara
och vängåvor skifta,
träffa honom titt och ofta.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$Ef þú átt annan,
þanns þú illa trúir,
vildu af hánum þó gótt geta,
fagrt skaltu við þann mæla
en flátt hyggja
ok gjalda lausung við lygi.$txt$, $txt$Om du har en annan,
som du illa tror,
och av honom dock gott vill hava;
fagert skall du tala
men falskt tänka
och vedergälla list med lögn.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$Það er enn of þann
er þú illa trúir
ok þér er grunr at hans geði,
hlæja skaltu við þeim
ok um hug mæla;
glík skulu gjöld gjöfum.$txt$, $txt$Ytterligare gäller
om den, du illa tror
och vars onda sinne du anar:
mot honom skall du le
och låtsa vänskap;
samma gåva åt givaren gälda.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$Ungr var ek forðum,
fór ek einn saman,
þá varð ek villr vega;
auðigr þóttumk,
er ek annan fann,
maðr er manns gaman.$txt$, $txt$Ung var jag fordom
och for ensamen,
då råkade jag vilse om vägen;
jag tyckte mig rik,
då jag träffade en annan:
man är mans gamman.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$Mildir, fræknir
menn bazt lifa,
sjaldan sút ala;
en ósnjallr maðr
uggir hotvetna,
sýtir æ glöggr við gjöfum.$txt$, $txt$Modiga och givmilda
män leva bäst,
nära sällan sorg;
men fåvitsk man
fruktar allt möjligt,
sörjer alltid snål vid gåvor.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$Váðir mínar
gaf ek velli at
tveim trémönnum;
rekkar þat þóttusk,
er þeir rift höfðu;
neiss er nökkviðr halr.$txt$, $txt$Med kläderna mina
jag klädde på fältet
tvänne gubbar av trä;
hela karlar de tycktes,
när en klut de hade;
nesligt är naken vara.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$Hrörnar þöll,
sú er stendr þorpi á,
hlýr-at henni börkr né barr;
svá er maðr,
sá er manngi ann.
Hvat skal hann lengi lifa?$txt$, $txt$Tallen torkar,
som på tomten står,
och ej skyddas av bark eller barr;
så är ock en,
som ingen älskar.
Vi skall han länge leva?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$Eldi heitari
brennr með illum vinum
friðr fimm daga,
en þá sloknar,
er inn sétti kemr,
ok versnar allr vinskapr.$txt$, $txt$Om ock hetare än eld
med osäkra vänner
brinner fem dagars fred,
så slocknar den dock,
när sex de bliva,
och vissnar all vänskap.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 52, $txt$Mikit eitt
skal-a manni gefa;
oft kaupir sér í litlu lof,
með halfum hleif
ok með höllu keri
fekk ek mér félaga.$txt$, $txt$Mycket skall
ej mannen giva,
ofta får han lovord för litet;
med hälften av en bulle
och med bägare på lut
vann jag mig en vän.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=52);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 53, $txt$Lítilla sanda
lítilla sæva
lítil eru geð guma;
því allir menn
urðu-t jafnspakir;
half er öld hvar.$txt$, $txt$Små sandstränder,
små sjöar,
små äro människors sinnen.
Ej samtliga män
fingo samma visdom;
ovis överallt är enhälft.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=53);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 54, $txt$Meðalsnotr
skyli manna hverr;
æva til snotr sé;
þeim er fyrða
fegrst at lifa,
er vel margt vitu.$txt$, $txt$Medelmåttigt klok
var man skall vara,
aldrig vara alltför klok.
Bland män är livet
mest fagert för dem,
som väl veta mycket.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=54);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 55, $txt$Meðalsnotr
skyli manna hverr,
æva til snotr sé;
því at snotrs manns hjarta
verðr sjaldan glatt,
ef sá er alsnotr, er á.$txt$, $txt$Medelmåttigt klok
var man skall vara,
aldrig vara alltför klok.
Klok mans sinne
är sällan glatt,
om allvis han är, som det äger.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=55);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 56, $txt$Meðalsnotr
skyli manna hverr,
æva til snotr sé;
örlög sín
viti engi fyrir,
þeim er sorgalausastr sefi.$txt$, $txt$Medelmåttigt klok
var man skall vara,
aldrig vara alltför klok.
Sitt öde vete
ingen på förhand;
då är honom sorglösast sinnet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=56);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 57, $txt$Brandr af brandi
brenn, unz brunninn er,
funi kveikisk af funa;
maðr af manni
verðr at máli kuðr,
en til dælskr af dul.$txt$, $txt$Brand brinner av brand,
tills han brunnen är,
låga tändes av låga.
Den ene för den andre
genom ord blir känd,
och den alltför slöe genom slapphet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=57);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 58, $txt$Ár skal rísa,
sá er annars vill
fé eða fjör hafa;
sjaldan liggjandi ulfr
lær of getr
né sofandi maðr sigr.$txt$, $txt$Arla stige upp,
den som äga vill
en annan egendom eller liv!
Sällan liggande ulv
ett lårstycke får
eller sovande man seger.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=58);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 59, $txt$Ár skal rísa,
sá er á yrkjendr fáa,
ok ganga síns verka á vit;
margt of dvelr,
þann er um morgin sefr,
hálfr er auðr und hvötum.$txt$, $txt$Arla stige upp
som har arbetsfolk få,
och tage med sin syssla i tu!
Mycket försinkas
för den, om morgonen sover;
rask är till hälften rik.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=59);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 60, $txt$Þurra skíða
ok þakinna næfra,
þess kann maðr mjöt,
þess viðar,
er vinnask megi
mál ok misseri.$txt$, $txt$Av torrt trä
och taknäver
en man måttet känner,
och vad ved
vara kan
ett helt kvartal eller halvår.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=60);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 61, $txt$Þveginn ok mettr
ríði maðr þingi at,
þótt hann sé-t væddr til vel;
skúa ok bróka
skammisk engi maðr
né hests in heldr,
þótt hann hafi-t góðan$txt$, $txt$Tvagen och mätt
ride mannen till tinget,
fast klent han är klädd!
Över skor och knäbyxor
ej skamsen någon vare,
ej heller över hästen,
fast han har en dålig!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=61);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 62, $txt$Snapir ok gnapir,
er til sævar kemr,
örn á aldinn mar;
svá er maðr,
er með mörgum kemr
ok á formælendr fáa.$txt$, $txt$Han far och fikar
med framåtböjt huvud
örnen på urgammalt hav;
så ock den man,
som bland många kommer
och har förespråkare få.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=62);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 63, $txt$Fregna ok segja
skal fróðra hverr,
sá er vill heitinn horskr;
einn vita
né annarr skal,
þjóð veit, ef þrír ro.$txt$, $txt$Frågor den göre
och give svar,
som klok vill kallas!
En må få veta,
en andre icke;
veta det tre, så vet världen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=63);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 64, $txt$Ríki sitt
skyli ráðsnotra
hverr í hófi hafa;
þá hann þat finnr,
er með fræknum kemr
at engi er einna hvatastr.$txt$, $txt$En klok man
skall kuva sitt lynne,
sin härsklystnad hålla i tygel.
Då han märker,
när bland modiga han kommer,
att ingen är djärv framför alla.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=64);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 65, $txt$-- -- -- --
orða þeira,
er maðr öðrum segir
oft hann gjöld of getr.$txt$, $txt$För de ord,
som till andra man har sagt,
ofta man bitter får böta.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=65);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 66, $txt$Mikilsti snemma
kom ek í marga staði,
en til síð í suma;
öl var drukkit,
sumt var ólagat,
sjaldan hittir leiðr í líð.$txt$, $txt$Mycket för tidigt
kom jag på många ställen
men alltför sent på somliga;
drucket var ölet,
obryggt ibland;
sällan kommer led till lags.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=66);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 67, $txt$Hér ok hvar
myndi mér heim of boðit,
ef þyrftak at málungi mat,
eða tvau lær hengi
at ins tryggva vinar,
þars ek hafða eitt etit.$txt$, $txt$Här och var
man mig hem hade bjudit,
om ej mat till målen jag behövt,
eller två lår hängt
hos den trofaste vännen,
sedan ett jag ätit hade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=67);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 68, $txt$Eldr er beztr
með ýta sonum
ok sólar sýn,
heilyndi sitt,
ef maðr hafa náir,
án við löst at lifa.$txt$, $txt$Elden är bäst
för barn av människor
och solens syn,
och om sin hälsa
man hava får
och leva utan last.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=68);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 69, $txt$Er-at maðr alls vesall,
þótt hann sé illa heill;
sumr er af sonum sæll,
sumr af frændum,
sumr af fé ærnu,
sumr af verkum vel.$txt$, $txt$En man är ej olycklig,
fast usel till hälsan;
mången är av söner säll,
mången av fränder,
mången av fullt upp med gods,
mången av välgjort verk.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=69);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 70, $txt$Betra er lifðum
en sé ólifðum,
ey getr kvikr kú;
eld sá ek upp brenna
auðgum manni fyrir,
en úti var dauðr fyr durum.$txt$, $txt$Bättre är leva
än att liv sakna;
vid liv, får sig karl alltid ko.
Eld såg jag brinna
i bål åt den rike,
och död låg han utanför dörren.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=70);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 71, $txt$Haltr ríðr hrossi,
hjörð rekr handar vanr,
daufr vegr ok dugir,
blindr er betri
en brenndr séi,
nýtr manngi nás.$txt$, $txt$Den halte rider häst,
den handen mist, blir herde,
den döve duger i strid.
Blind är bättre
än att bränd vara;
ej av någon nytta är liket.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=71);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 72, $txt$Sonr er betri,
þótt sé síð of alinn
eftir genginn guma;
sjaldan bautarsteinar
standa brautu nær,
nema reisi niðr at nið.$txt$, $txt$En son är bättre,
fastän sent född,
sedan faderns levnad är liden.
Sällan bautastenar
man ser vid vägen,
om ej frände över frände dem rest.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=72);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 73, $txt$Tveir ro eins herjar,
tunga er höfuðs bani;
er mér í heðin hvern
handar væni.$txt$, $txt$Två äro stridsmän:
tungan dödar huvudet;
under varje päls
jag väntar en hand.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=73);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 74, $txt$Nótt verðr feginn
sá er nesti trúir,
skammar ro skips ráar;
hverf er haustgríma;
fjölð of viðrir
á fimm dögum
en meira á mánuði.$txt$, $txt$Med fröjd den natten motser,
som matsäck har att njuta,
Kort räcka skepps rår,
höstnatt hastigt skiftar.
På fem dagar växlar
vädret mycket
men mer på en månad.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=74);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 75, $txt$Veit-a hinn,
er vettki veit,
margr verðr af aurum api;
maðr er auðigr,
annar óauðigr,
skyli-t þann vítka váar.$txt$, $txt$Den icke något vet,
som ingenting vet;
av rikedom mången röjes som narr.
Den ene är rik,
den andre fattig,
lägg ej den det till last!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=75);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 76, $txt$Deyr fé,
deyja frændr,
deyr sjalfr it sama,
en orðstírr
deyr aldregi,
hveim er sér góðan getr.$txt$, $txt$Fä dör,
fränder dö,
även själv skiljes du hädan,
men eftermålet
aldrig dör
för envar, som ett gott har vunnit.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=76);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 77, $txt$Deyr fé,
deyja frændr,
deyr sjalfr it sama,
ek veit einn,
at aldrei deyr:
dómr um dauðan hvern.$txt$, $txt$Fä dör,
fränder dö,
även själv skiljes du hädan,
men ett vet jag,
som aldrig dör,
domen över död man.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=77);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 78, $txt$Fullar grindr
sá ek fyr Fitjungs sonum,
nú bera þeir vánar völ;
svá er auðr
sem augabragð,
hann er valtastr vina.$txt$, $txt$Fulla fårfållor
såg jag hos Fitjungs söner,
nu traska de med tiggarens stav.
Överflöd är
som en ögonblink,
vankelmodigast av vänner.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=78);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 79, $txt$Ósnotr maðr,
ef eignask getr
fé eða fljóðs munuð,
metnaðr hánum þróask,
en mannvit aldregi,
fram gengr hann drjúgt í dul.$txt$, $txt$En ovis man,
om han erhålla kan
gods eller kvinnors gunst,
hans stolthet växer,
men förståndet icke,
i dårskap går han duktigt långt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=79);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 80, $txt$Þat er þá reynt,
er þú að rúnum spyrr
inum reginkunnum,
þeim er gerðu ginnregin
ok fáði fimbulþulr,
þá hefir hann bazt, ef hann þegir.$txt$, $txt$Det rönes då,
när om runor du spörjer,
om de stavar, som från gudarne stamma,
som höga makter höggo,
och skaldefadern skar,
då tyckes det bäst, att han tiger.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=80);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 81, $txt$At kveldi skal dag leyfa,
konu, er brennd er,
mæki, er reyndr er,
mey, er gefin er,
ís, er yfir kemr,
öl, er drukkit er.$txt$, $txt$Om kvällen skall dagen prisas,
gift kvinna, då hon bränd är,
svärdet, då det frestat är,
flicka, då gift hon är;
is, då man över kommer,
öl, då det drucket är.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=81);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 82, $txt$Í vindi skal við höggva,
veðri á sjó róa,
myrkri við man spjalla,
mörg eru dags augu;
á skip skal skriðar orka,
en á skjöld til hlífar,
mæki höggs,
en mey til kossa.$txt$, $txt$I blåsväder skall skog man fälla,
i bris ro ut på öppet hav,
i mörkret med mö språka,
ty många är dagens ögon.
Å skepp skall man fart göra
och skölden till skydd hava,
till fäktning svärdet
och flickan att kyssa.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=82);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 83, $txt$Við eld skal öl drekka,
en á ísi skríða,
magran mar kaupa,
en mæki saurgan,
heima hest feita,
en hund á búi.
'''II.'''$txt$, $txt$Vid eld skall man öl dricka,
på isen skridsko åka,
en kamp skall man mager köpa,
en klinga med rost uppå;
hemma skall man höst göda
men hund i fäbod.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=83);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 84, $txt$Meyjar orðum
skyli manngi trúa
né því, er kveðr kona,
því at á hverfanda hvéli
váru þeim hjörtu sköpuð,
brigð í brjóst of lagið.$txt$, $txt$På ord av en mö
må ingen man lita,
eller tro på gift kvinnas tal;
ty på rullande hjul
deras hjärta är skapat,
föränderlighet i bröstet inlagd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=84);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 85, $txt$Brestanda boga,
brennanda loga,
gínanda ulfi,
galandi kráku,
rýtanda svíni,
rótlausum viði,
vaxanda vági,
vellanda katli,$txt$, $txt$Bristande båge,
brinnande låga,
glupande ulv,
gormande kråka,
grymtande svin,
gran utan rot,
växande våg,
vällande gryta.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=85);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 86, $txt$Fljúganda fleini,
fallandi báru,
ísi einnættum,
ormi hringlegnum,
brúðar beðmálum
eða brotnu sverði,
bjarnar leiki
eða barni konungs.$txt$, $txt$Flygande spjut,
fallande bölja,
is, blott nattgammal,
orm i ring,
bruds ord i bädden,
ett brustet svärd,
björnens lek,
ett barn av en konung.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=86);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 87, $txt$Sjúkum kalfi,
sjalfráða þræli,
völu vilmæli,
val nýfelldum.$txt$, $txt$En sjuk kalv,
en självrådig träl,
en foglig vala,
de nyss fallne i striden.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=87);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 88, $txt$Akri ársánum
trúi engi maðr
né til snemma syni,
- veðr ræðr akri.
en vit syni;
hætt er þeira hvárt.$txt$, $txt$Tidigt sådd åker
må ingen tro,
och ej för snart sin son;
av vädret beror åkern,
av sitt vett sonen,
båda tvivelaktiga ting.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=88);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 89, $txt$Bróðurbana sínum
þótt á brautu mæti,
húsi hálfbrunnu,
hesti alskjótum,
- þá er jór ónýtr,
ef einn fótr brotnar -,
verði-t maðr svá tryggr
at þessu trúi öllu.$txt$, $txt$Din broders mördare,
om han mötes på vägen,
ett halvbrunnet hus,
en häst, än så snabb,
— ty borta är gagnet,
om ett ben skadas —
ingen vare så lättrogen,
att han litar på allt detta!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=89);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 90, $txt$Svá er friðr kvenna,
þeira er flátt hyggja,
sem aki jó óbryddum
á ísi hálum,
teitum, tvévetrum
ok sé tamr illa,
eða í byr óðum
beiti stjórnlausu,
eða skyli haltr henda
hrein í þáfjalli.$txt$, $txt$Kärlek av kvinnor,
som känna falskhet,
är som med häst utan broddar
på hal is åka
med en yster tvååring
och illa tämd,
eller i stickande storm
med ett styreslöst skepp
eller som halt man på töfjäll
skulle taga en ren.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=90);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 91, $txt$Bert ek nú mæli,
því at ek bæði veit,
brigðr er karla hugr konum;
þá vér fegrst mælum,
er vér flást hyggjum:
þat tælir horska hugi.$txt$, $txt$Bar sanning jag talar,
ty båda jag känner:
karlars tro mot kvinnor även vacklar.
Då tala vi fagrast,
när vi falskast tänka,
det snärjer ock kloka sinnen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=91);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 92, $txt$Fagrt skal mæla
ok fé bjóða,
sá er vill fljóðs ást fá,
líki leyfa
ins ljósa mans,
sá fær, er fríar.$txt$, $txt$Fagert skall man tala,
friarskänk bjuda,
om en flickas kärlek man vill få,
den ljuslätta ungmöns
älsklighet prisa;
då får, den som friar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=92);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 93, $txt$Ástar firna
skyli engi maðr
annan aldregi;
oft fá á horskan,
er á heimskan né fá,
lostfagrir litir.$txt$, $txt$För älskog lasta
aldrig man skall
sin nästa någonsin;
ofta verkar på den vise
men på vettlös man ej
bedårande däjlighet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=93);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 94, $txt$Eyvitar firna
er maðr annan skal,
þess er um margan gengr guma;
heimska ór horskum
gerir hölða sonu
sá inn máttki munr.$txt$, $txt$Ty ingalunda lasta
en annan man skall
för fel, som är fleras;
till galna från kloka
gör karlars söner
älskogs mäktiga åtrå.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=94);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 95, $txt$Hugr einn þat veit,
er býr hjarta nær,
einn er hann sér of sefa;
öng er sótt verri
hveim snotrum manni
en sér engu at una.$txt$, $txt$Blott själen gömmer,
vad i hjärtat bor,
ensam sin känsla han känner.
Ingen sjukdom är värre
för en själfull man
än att leva, med intet belåten.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=95);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 96, $txt$Þat ek þá reynda,
er ek í reyri sat,
ok vættak míns munar;
hold ok hjarta
var mér in horska mær;
þeygi ek hana at heldr hefik.$txt$, $txt$Det varsnade jag,
då i vassen jag satt
för att möta min älskade mö;
kött och blod
mig min käresta var,
och dock jag ingenting av henne fick.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=96);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 97, $txt$Billings mey
ek fann beðjum á
sólhvíta sofa;
jarls ynði
þótti mér ekki vera
nema við þat lík at lifa.$txt$, $txt$Billings mö
jag i bädden fann
solvit sova.
En jarls härlighet
höll jag för intet
mot att med denna förlederska leva.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=97);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 98, $txt$"Auk nær aftni
skaltu, Óðinn, koma,
ef þú vilt þér mæla man;
allt eru ósköp,
nema einir viti
slíkan löst saman."$txt$, $txt$»Nära afton
du, Oden, skall komma,
om mö du dig vinna vill;
allt går illa,
om ej ensamma vi
slik sak veta.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=98);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 99, $txt$Aftr ek hvarf
ok unna þóttumk
vísum vilja frá;
hitt ek hugða,
at ek hafa mynda
geð hennar allt ok gaman.$txt$, $txt$Åter jag kom
och älska mig tyckte;
vist var ej, vad jag ville.
Jag hoppades då,
att jag hava skulle
all hennes kärlek och tjusning.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=99);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 100, $txt$Svá kom ek næst,
at in nýta var
vígdrótt öll of vakin
með brennandum ljósum
ok bornum viði,
svá var mér vílstígr of vitaðr.$txt$, $txt$När jag kom fram,
fick jag där se
hela vakten av kämpar vaken,
med burna bloss
och brinnande ljus;
min väg sig visade farlig.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=100);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 101, $txt$Auk nær morgni,
er ek var enn of kominn,
þá var saldrótt of sofin;
grey eitt ek þá fann
innar góðu konu
bundit beðjum á.$txt$, $txt$Och nära morgonen,
när jag närmade mig åter,
då sov salens vakt.
En hynda jag då fann
på det hulda vivets
bädd bunden ligga.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=101);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 102, $txt$Mörg er góð mær,
ef görva kannar,
hugbrigð við hali;
þá ek þat reynda,
er it ráðspaka
teygða ek á flærðir fljóð;
háðungar hverrar
leitaði mér it horska man,
ok hafða ek þess vettki vífs.
'''III.'''$txt$, $txt$Mången mö god,
om man mönstrar noga,
lätt ändrar sitt lynne mot män.
Det jag rönte,
när jag rådklok mö
till lättsinne lockade;
allehanda smälek
den sluga mig ådrog,
och intet jag fick av den flickan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=102);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 103, $txt$Heima glaðr gumi
ok við gesti reifr,
sviðr skal um sig vera,
minnigr ok málugr,
ef hann vill margfróðr vera,
oft skal góðs geta;
fimbulfambi heitir,
sá er fátt kann segja,
þat er ósnotrs aðal.$txt$, $txt$Man skall glad i hemmet vara.
och glamma med gäster,
dock förståndigt man sörje för sitt;
minnesgod och målför,
om man mångvis vill vara,
omtala ofta det goda.
Ärkenöt den heter,
som har intet att säga;
det är de ovisas art.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=103);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 104, $txt$Inn aldna jötun ek sótta,
nú em ek aftr of kominn:
fátt gat ek þegjandi þar;
mörgum orðum
mælta ek í minn frama
í Suttungs sölum.$txt$, $txt$Åldrig jätte jag besökte,
nu är åter jag kommen;
där föga jag fick med att tiga.
Ej få ord
till min fromma jag talte
i Suttungs salar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=104);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 105, $txt$Gunnlöð mér of gaf
gullnum stóli á
drykk ins dýra mjaðar;
ill iðgjöld
lét ek hana eftir hafa
síns ins heila hugar,
síns ins svára sefa.$txt$, $txt$Gunnlod mig gav
på guldstolen
en dryck av det dyrbara mjödet.
En lumpen lön
lät jag henne få
för hennes ärliga ömhet,
för hennes lidelses längtan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=105);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 106, $txt$Rata munn
létumk rúms of fá
ok um grjót gnaga;
yfir ok undir
stóðumk jötna vegir,
svá hætta ek höfði til.$txt$, $txt$Borrens mun
lät jag bana mig väg
och gång i stenen gnaga;
jag över och under
omgavs av jättars väg;
då gällde det hals och huvud.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=106);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 107, $txt$Vel keypts litar
hefi ek vel notit,
fás er fróðum vant,
því at Óðrerir
er nú upp kominn
á alda vés jaðar.$txt$, $txt$Av skickligt vunnen skönhet
har jag skickligt mig begagnat,
den kunnige föga fattas;
ty Odrörer
har nu upp kommit,
dit, där människor bygga och bo.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=107);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 108, $txt$Ifi er mér á,
at ek væra enn kominn
jötna görðum ór,
ef ek Gunnlaðar né nytak,
innar góðu konu,
þeirar er lögðumk arm yfir.$txt$, $txt$Ovisst är,
om än jag kommit
igen från jättars gårdar,
om ej av Gunnlod jag hjälpts,
den goda flickan,
som jag fick i famnen sluta.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=108);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 109, $txt$Ins hindra dags
gengu hrímþursar
Háva ráðs at fregna
Háva höllu í;
at Bölverki þeir spurðu,
ef hann væri með böndum kominn
eða hefði hánum Suttungr of sóit.$txt$, $txt$Följande dag rimtursarne
att fråga gingo
om den Höges gifte
i den Höges sal;
efter Bolverk de sporde,
om tillbaka han kommit
eller Suttung ihjäl honom slagit.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=109);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 110, $txt$Baugeið Óðinn,
hygg ek, at unnit hafi;
hvat skal hans tryggðum trúa?
Suttung svikinn
hann lét sumbli frá
ok grætta Gunnlöðu.
'''IV.'''$txt$, $txt$Ed på ring tror jag Oden
avlagt hava;
hur kan man på hans löften lita?
Med svek han mjödet
från Sutting tog,
och i gråt han lämnade Gunnlod.
:—————$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=110);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 111, $txt$Mál er at þylja
þular stóli á
Urðarbrunni at,
sá ek ok þagðak,
sá ek ok hugðak,
hlýdda ek á manna mál;
of rúnar heyrða ek dæma,
né of ráðum þögðu
Háva höllu at,
Háva höllu í,
heyrða ek segja svá:$txt$, $txt$Tid är att förtälja
på talarens stol,
som vid Urds brunn är.
Jag såg och teg,
jag såg och tänkte,
jag lyssnade till männens mål.
Om runor hörde jag dem tala,
om råd de ej heller tego,
vid den Höges sal,
i den Höges sal
hörde jag sägas så.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=111);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 112, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
nótt þú rís-at
nema á njósn séir
eða þú leitir þér innan út staðar.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Stig ej upp om natten,
om du ej är ute och spanar
eller måste ut på gården gå!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=112);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 113, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
fjölkunnigri konu
skal-at-tu í faðmi sofa,
svá at hon lyki þik liðum.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Sov ej hos kvinna,
som är kunnig i trolldom,
så att hon i famnen dig fängslar!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=113);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 114, $txt$Hon svá gerir,
at þú gáir eigi
þings né þjóðans máls;
mat þú vill-at
né mannskis gaman,
ferr þú sorgafullr at sofa.$txt$, $txt$Hon gör det så,
att du ger varken akt,
om till ting eller konungen du kallas;
mat du vill ej hava
eller människors umgänge;
sorgsen går du att sova.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=114);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 115, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
annars konu
teygðu þér aldregi
eyrarúnu at.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
En annans hustru
du aldrig locke
att förtroligt med dig tala!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=115);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 116, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
á fjalli eða firði,
ef þik fara tíðir,
fásktu at virði vel.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Om på fjäll eller fjärd
du fara lyster
skaffa dig riklig reskost!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=116);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 117, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
illan mann
láttu aldregi
óhöpp at þér vita,
því at af illum manni
fær þú aldregi
gjöld ins góða hugar.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
En elak man
du aldrig låte
höra vad otur dig hänt;
ty av en elak man
du aldrig får
för lämnat förtroende lön.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=117);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 118, $txt$Ofarla bíta
ek sá einum hal
orð illrar konu;
fláráð tunga
varð hánum at fjörlagi
ok þeygi of sanna sök.$txt$, $txt$Svårt tilltygad
såg jag en man
genom ord av en ond kvinna;
falsk tunga
tog hans liv,
och dock ej för sann sak.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=118);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 119, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
veistu, ef þú vin átt,
þann er þú vel trúir,
far þú at finna oft,
því at hrísi vex
ok hávu grasi
vegr, er vættki treðr.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Vet, om en vän du har,
som du väl tror,
far träget att honom träffa;
ty av ris höljes
och högt gräs
den väg, som ingen vandrar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=119);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 120, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
góðan mann
teygðu þér at gamanrúnum
ok nem líknargaldr, meðan þú lifir.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
En god man du locke
till gamman och förtrolighet;
lär dig tjusa folk att hålla dig kär!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=120);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 121, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
vin þínum
ver þú aldregi
fyrri at flaumslitum;
sorg etr hjarta,
ef þú segja né náir
einhverjum allan hug.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
När du får en vän,
den förste var aldrig
att våldsamt vänskapen slita;
sorg fräter hjärtat,
när man säga ej får
för någon hela sin hug.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=121);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 122, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
orðum skipta
þú skalt aldregi
við ósvinna apa,$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Ord skifta,
aldrig du skall
med dåraktig dumbom.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=122);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 123, $txt$Því at af illum manni
mundu aldregi
góðs laun of geta,
en góðr maðr
mun þik gerva mega
líknfastan at lofi.$txt$, $txt$Ty av illasinnad man
du aldrig skall
få gott med gott lönat.
Men en god man
dig gagnar med sitt lov
och gör dig omtyckt av andra.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=123);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 124, $txt$Sifjum er þá blandat,
hver er segja ræðr
einum allan hug;
allt er betra
en sé brigðum at vera;
er-a sá vinr öðrum, er vilt eitt segir.$txt$, $txt$Lik släktskap är vänskap,
då man säga får
en annan hela sin hug.
Allt är bättre
än vara brått föränderlig;
den är ej vän, som blott välkommet säger.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=124);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 125, $txt$Ráðumk, þér Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
þrimr orðum senna
skal-at-tu þér við verra mann
oft inn betri bilar,
þá er inn verri vegr.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Tre ord icke växla
i träta med en usling;
den bättre är ofta böjlig,
när den sämre slår.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=125);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 126, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
skósmiðr þú verir
né skeftismiðr,
nema þú sjalfum þér séir:
skór er skapaðr illa
eða skaft sé rangt,
þá er þér böls beðit.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Skomakare var ej
eller skaftmakare
annat än åt dig själv;
om skon är illa skapad
eller skaftet snett,
då önskas över dig ont.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=126);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 127, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
hvars þú böl kannt,
kveð þú þér bölvi at
ok gef-at þínum fjándum frið.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Om ont du märker,
säg, att ont det är,
och giv ej din fiende frid.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=127);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 128, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
illu feginn
ver þú aldregi,
en lát þér at góðu getit.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Åt ont glad
aldrig var,
men gläds åt det goda!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=128);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 129, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
upp líta
skal-at-tu í orrustu,
- gjalti glíkir
verða gumna synir, -
síðr þitt of heilli halir.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
I träffningens tummel
titta ej uppåt
— dödlig fruktan
drabbar männen —
att icke förtrollning dig träffar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=129);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 130, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
ef þú vilt þér góða konu
kveðja at gamanrúnum
ok fá fögnuð af,
fögru skaltu heita
ok láta fast vera;
leiðisk manngi gótt, ef getr.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Om hos god kvinna
du vill komma i ynnest
och få fägnad av,
fagert skall du lova
och fast löftet hålla;
den blir glad, som får något gott.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=130);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 131, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
varan bið ek þik vera
ok eigi ofvaran;
ver þú við öl varastr
ok við annars konu
ok við þat it þriðja,
at þjófar né leiki.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Varsam ber jag dig vara,
dock ej alltför varsam.
Var med ölet varsammast
och med annans hustru,
och med det tredje,
att ej dig toppride tjuvar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=131);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 132, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
at háði né hlátri
hafðu aldregi
gest né ganganda.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Till hån och löje
hav aldrig
gäst eller främling, som färdas!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=132);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 133, $txt$Oft vitu ógörla,
þeir er sitja inni fyrir,
hvers þeir ro kyns, er koma;
er-at maðr svá góðr
at galli né fylgi,
né svá illr, at einugi dugi.$txt$, $txt$Ofta illa veta,
de som inne sitta,
vad slags folk, som farande komma.
Ingen är så bra,
att ej brist han äger,
eller så dålig, att till intet han duger.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=133);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 134, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
at hárum þul
hlæ þú aldregi,
oft er gótt, þat er gamlir kveða;
oft ór skörpum belg
skilin orð koma
þeim er hangir með hám
ok skollir með skrám
ok váfir með vílmögum.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Åt åldrig talare
du aldrig må skratta;
ofta gott är, vad de gamle säga.
Ofta ur skrumpet skinn
skarptänkta ord komma,
sådant som hänger bland hudar
och slänger bland småskinn
och lätt dinglar bland löpmagar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=134);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 135, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
gest þú né geyja
né á grind hrekir;
get þú váluðum vel.$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
En gäst du skall ej skymfa
eller jaga på porten;
fägna den fattige väl!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=135);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 136, $txt$Rammt er þat tré,
er ríða skal
öllum at upploki;
baug þú gef,
eða þat biðja mun
þér læs hvers á liðu.$txt$, $txt$Ej svag är den dörrtapp,
som svänga skall
och öppna för alla.
En ring du dock giv,
eller på din rygg
allt ont de dig önska.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=136);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 137, $txt$Ráðumk þér, Loddfáfnir,
en þú ráð nemir, -
njóta mundu, ef þú nemr,
þér munu góð, ef þú getr -:
hvars þú öl drekkir,
kjós þér jarðar megin,
því at jörð tekr við ölðri,
en eldr við sóttum,
eik við abbindi,
ax við fjölkynngi,
höll við hýrógi,
- heiftum skal mána kveðja, -
beiti við bitsóttum,
en við bölvi rúnar,
fold skal við flóði taka.
'''V.'''$txt$, $txt$Jag råder dig, Loddfavner,
men råd må du taga;
du får fördel, om du följer dem,
de bli goda att begagna.
Då öl du dricker, sök hjälp
av jordens kraft,
ty jord mot ölrus hjälper
och eld mot sjukdomar,
ek ger avföring,
ax skyddar för trolldom,
mjöldryga mot bråck,
månen mot rasande,
bete mot bitsjuka,
bot mot ont äro runor,
mot fluss är fast mark.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=137);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 138, $txt$Veit ek, at ek hekk
vindga meiði á
nætr allar níu,
geiri undaðr
ok gefinn Óðni,
sjalfr sjalfum mér,
á þeim meiði,
er manngi veit
hvers af rótum renn.$txt$, $txt$Jag vet, att jag hängde
på det vindiga trädet
nio hela nätter,
djupt stungen med spjut
och given åt Oden,
jag själv åt mig själv,
uppe i det träd,
varom ingen vet,
av vad rot det runnit upp.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=138);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 139, $txt$Við hleifi mik sældu
né við hornigi;
nýsta ek niðr,
nam ek upp rúnar,
æpandi nam,
fell ek aftr þaðan.$txt$, $txt$Man bröd mig ej bar
eller bjöd mig horn,
skarpt jag nedåt skådade;
jag tog upp runor,
med rop jag tog dem,
så föll jag åter därifrån.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=139);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 140, $txt$Fimbulljóð níu
nam ek af inum frægja syni
Bölþorns, Bestlu föður,
ok ek drykk of gat
ins dýra mjaðar,
ausinn Óðreri.$txt$, $txt$Nio kraftsånger lärde jag
av namnkunnig son
till Boltorn, Bestlas fader,
och en dryck jag fick,
av det dyrbara mjödet,
som östes ur Odrörer.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=140);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 141, $txt$Þá nam ek frævask
ok fróðr vera
ok vaxa ok vel hafask,
orð mér af orði
orðs leitaði,
verk mér af verki
verks leitaði.$txt$, $txt$Då tog jag att förkovras
och kunnig vara,
att växa och väl trivas;
ord mig av ord
ord skapade,
verk mig av verk
verk alstrade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=141);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 142, $txt$Rúnar munt þú finna
ok ráðna stafi,
mjök stóra stafi,
mjök stinna stafi,
er fáði fimbulþulr
ok gerðu ginnregin
ok reist hroftr rögna.$txt$, $txt$Runor skall du finna,
rätt uttydda stavar,
mycket stora stavar,
mycket starka stavar,
som skaldefadern skar
och gudamakter grovo
och de rådandes herre ristade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=142);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 143, $txt$Óðinn með ásum,
en fyr alfum Dáinn,
Dvalinn ok dvergum fyrir,
Ásviðr jötnum fyrir,
ek reist sjalfr sumar.$txt$, $txt$Oden bland asarne
men för alferna Dain
och Dvalin för dvärgarna,
Allsvinn åt jättar
gjorde runor,
några runor jag ristade själv.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=143);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 144, $txt$Veistu, hvé rísta skal?
Veistu, hvé ráða skal?
Veistu, hvé fáa skal?
Veistu, hvé freista skal?
Veistu, hvé biðja skal?
Veistu, hvé blóta skal?
Veistu, hvé senda skal?
Veistu, hvé sóa skal?$txt$, $txt$Vet du, hur du rista skall?
Vet du, hur du reda skall?
Vet du, hur du färga skall?
Vet du, hur du fresta skall?
Vet du, hur du bedja skall?
Vet du, hur du blota skall?
Vet du, hur du sända skall?
Vet du, hur du slopa skall?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=144);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 145, $txt$Betra er óbeðit
en sé ofblótit,
ey sér til gildis gjöf;
betra er ósent
en sé ofsóit.
Svá Þundr of reist
fyr þjóða rök,
þar hann upp of reis,
er hann aftr of kom.$txt$, $txt$Bättre är intet bedja
än att blota för mycket;
gåva önskar, att gengåva gives.
Bättre är intet sända
än alltför mycket slopa.
Så ristade Tund
före tidsåldrarna,
när han reste sig upp,
när han återkom.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=145);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 146, $txt$Ljóð ek þau kann,
er kann-at þjóðans kona
ok mannskis mögr.
Hjalp heitir eitt,
en þat þér hjalpa mun
við sökum ok sorgum
ok sútum görvöllum.$txt$, $txt$De kraftsånger kan jag,
som ej konungens maka
och ingen mans ättling kan.
Hjälp heter en,
och hjälpa dig den skall
mot processer och sorger
och samtliga lidanden.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=146);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 147, $txt$Þat kann ek annat,
er þurfu ýta synir,
þeir er vilja læknar lifa.$txt$, $txt$Den nästa, jag kan,
är nödig för dem,
som vilja som läkare leva.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=147);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 148, $txt$Það kann ek þriðja:
ef mér verðr þörf mikil
hafts við mína heiftmögu,
eggjar ek deyfi
minna andskota,
bíta-t þeim vápn né velir.$txt$, $txt$Den tredje jag kan,
om det tarvas mig få
fjättrar åt fiender mina;
eggen jag dövar
på mina ovänners svärd,
att deras klingor och knölpåkar ej bita.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=148);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 149, $txt$Þat kann ek it fjórða:
ef mér fyrðar bera
bönd að boglimum,
svá ek gel,
at ek ganga má,
sprettr mér af fótum fjöturr,
en af höndum haft.$txt$, $txt$Den fjärde jag kan,
om fiender på mig
med band ha lemmarne bundit.
Galder jag sjunger,
så att gå jag kan;
från foten fjättern springer
och från handen handkloven.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=149);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 150, $txt$Þat kann ek it fimmta:
ef ek sé af fári skotinn
flein í folki vaða,
fýgr-a hann svá stinnt,
at ek stöðvig-a-k,
ef ek hann sjónum of sék.$txt$, $txt$Den femte jag kan,
om fiendepil skjuten
jag falla i flocken ser;
så häftigt han ej flyger,
att jag hejdar honom ej,
om blott min syn honom sett.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=150);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 151, $txt$Þat kann ek it sétta:
ef mik særir þegn
á vrótum hrás viðar,
ok þann hal
er mik heifta kveðr,
þann eta mein heldr en mik.$txt$, $txt$Den sjätte jag säger,
om mig sårar en man
genom runor på rötter av träd,
och för denne fyr,
som min fiendskap kräver,
det blir menligt mera än för mig.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=151);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 152, $txt$Þat kann ek it sjaunda:
ef ek sé hávan loga
sal of sessmögum,
brennr-at svá breitt,
at ek hánum bjargig-a-k;
þann kann ek galdr at gala.$txt$, $txt$Den sjunde jag kan,
om själva salen jag ser
brinna kring bänkat lag;
lågan slår ej så högt
att jag släcker den ej,
slik galder, som jag säga kan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=152);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 153, $txt$Þat kann ek it átta,
er öllum er
nytsamligt at nema:
hvars hatr vex
með hildings sonum
þat má ek bæta brátt.$txt$, $txt$Den åttonde jag kan,
som för alla är
lämplig att lära;
när hat uppstår
bland hövdings söner,
jag botar det brått.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=153);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 154, $txt$Þat kann ek it níunda:
ef mik nauðr of stendr
at bjarga fari mínu á floti,
vind ek kyrri
vági á
ok svæfik allan sæ.$txt$, $txt$Den nionde jag kan,
om mig nöd hotar,
att bärga min båt på hav;
vinden jag stillar
på vågen ute
och sjunger all sjö i sömn.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=154);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 155, $txt$Þat kann ek it tíunda:
ef ek sé túnriður
leika lofti á,
ek svá vinnk,
at þær villar fara
sinna heimhama,
sinna heimhuga.$txt$, $txt$Den tionde jag kan,
om trollkvinnor jag ser
högt i luften leka.
Jag vållar det så,
att de vilse fara
om skepnaden, de själva äga,
om själen, som de själva ha.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=155);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 156, $txt$Þat kann ek it ellifta:
ef ek skal til orrostu
leiða langvini,
und randir ek gel,
en þeir með ríki fara
heilir hildar til,
heilir hildi frá,
koma þeir heilir hvaðan.$txt$, $txt$Den elfte jag kan,
om till örlog jag skall
gå med gamla vänner.
Under sköldarna jag sjunger,
och de skynda med kraft
utan sår till slaget,
utan sår från slaget,
komma helbrägda från vad som helst.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=156);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 157, $txt$Þat kann ek it tolfta:
ef ek sé á tré uppi
váfa virgilná,
svá ek ríst
ok í rúnum fák,
at sá gengr gumi
ok mælir við mik.$txt$, $txt$Den tolfte jag kan,
om uppi träd jag ser
hängda döda dingla.
Så ristar jag
och runor färgar,
att den kroppen kommer
och talar mig till.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=157);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 158, $txt$Þat kann ek it þrettánda:
ef ek skal þegn ungan
verpa vatni á,
mun-at hann falla,
þótt hann í folk komi,
hnígr-a sá halr fyr hjörum.$txt$, $txt$Den trettonde jag brukar,
om ett barn jag skall
genom vattenösning viga.
Stupa han skall ej,
fast i strid han kommer,
ej segnar denne krigare för svärd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=158);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 159, $txt$Þat kann ek it fjögurtánda:
ef ek skal fyrða liði
telja tíva fyrir,
ása ok alfa
ek kann allra skil;
fár kann ósnotr svá.$txt$, $txt$Den fjortonde jag kan,
om för folkets skara
jag skall tälja gudars tal;
asar och alfer
jag alla vet besked om;
den ej kunnig är, det ej kan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=159);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 160, $txt$Þat kann ek it fimmtánda
er gól Þjóðrerir
dvergr fyr Dellings durum:
afl gól hann ásum,
en alfum frama,
hyggju Hroftatý.$txt$, $txt$Den femtonde jag kan,
som Tjodreyrer sjöng,
en dvärg framför Dellings dörr;
kraft han sjöng åt asar
och åt alfer framgång,
förstånd åt stridernas gud.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=160);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 161, $txt$Þat kann ek it sextánda:
ef ek vil ins svinna mans
hafa geð allt ok gaman,
hugi ek hverfi
hvítarmri konu,
ok sný ek hennar öllum sefa.$txt$, $txt$Den sextonde jag kan,
om den sluga möns
lidelse och lust jag vill hava.
Hågen jag vänder
hos vitarmad kvinna
och förändrar all hennes själ.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=161);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 162, $txt$Þat kann ek it sjautjánda
at mik mun seint firrask
it manunga man.
Ljóða þessa
mun þú, Loddfáfnir,
lengi vanr vera;
þó sé þér góð, ef þú getr,
nýt ef þú nemr,
þörf ef þú þiggr.$txt$, $txt$Den sjuttonde jag kan,
att sent skiljes från mig
den ungmö, jag älskar.
Dessa sånger
du sakna skall
länge, Loddfavner.
Men de äro goda som gåva,
nyttiga att nå,
behövliga att hava.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=162);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 163, $txt$Þat kann ek it átjánda,
er ek æva kennik
mey né manns konu,
- allt er betra,
er einn of kann;
þat fylgir ljóða lokum, -
nema þeiri einni,
er mik armi verr,
eða mín systir sé.
'''VII.'''$txt$, $txt$Den adertonde jag kan,
som jag aldrig lär
åt mö eller mans hustru —
allt är bäst,
som man ensam kan;
det är sångens slut —
utom åt henne
som med armen mig famnar
eller åt mig syster är.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=163);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 164, $txt$Nú eru Háva mál
kveðin Háva höllu í,
allþörf ýta sonum,
óþörf jötna sonum;
heill sá, er kvað,
heill sá, er kann,
njóti sá, er nam,
heilir, þeirs hlýddu.$txt$, $txt$Nu är den Höges sång framsagd
i den Höges sal,
gagnrik för människors söner,
gagnlös för jättars söner.
Hell den, som framsade!
Hell den, som kan!
Njute gott, den som begrep!
Lycklige de, som lyssnat!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den Höges sång$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=164);

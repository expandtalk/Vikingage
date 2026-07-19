-- Edda full texts batch 2: the remaining 23 poems (Old Norse + Swedish Brate where alignable).
-- Old Norse: Guðni Jónsson, Eddukvæði/Sæmundar-Edda (PD) — or, for the 3 poems only printed in
--   the Finnur Jónsson recension on heimskringla.no, De gamle Eddadigte (1932, PD).
-- Swedish: Erik Brate, Sämunds Edda (1913, PD). English (Bellows) deferred (renumbering crosswalk).
-- Verbatim; translation_sv NULL where Brate lacks/renumbers that stanza. Idempotent:
--   WHERE NOT EXISTS on (source_id, stanza_no). Joins historical_sources by title + work_type='edda_poem'.
-- ALIGNMENT NOTES:
--   * Bilingual, aligned by the editions' own stanza numbers (verified content match at st.1, at
--     every gap boundary and at the final stanza). A few Old Norse stanzas that Brate merged/omitted
--     carry translation_sv NULL: HHb II st.31; Helge Hjorvardsson st.12,33; Atlakviða st.10,17,19,20;
--     Atlamál st.13,63,92.
--   * SWEDISH DEFERRED (Old Norse only, translation_sv NULL) for 3 poems whose Brate stanza order
--     cannot be aligned per number and must not be guessed:
--       - Brottstycke av det större kvädet om Sigurd (Brate n = Guðni/Finnur n+5, constant offset)
--       - Oddruns gråt (Brate inserts stanzas mid-poem; offset drifts to +2 by the end)
--       - Brynhilds färd till Hel (variable offset, +2 early then -1 at the close)
--     These need a per-stanza crosswalk (future batch).

-- ===== Sången om Vavtrudner  (Vafþrúðnismál) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Ráð þú mér nú, Frigg,
alls mik fara tíðir
at vitja Vafþrúðnis;
forvitni mikla
kveð ek mér á fornum stöfum
við þann inn alsvinna jötun."$txt$, $txt$»Råd du mig nu, Frigg,
då fara att gästa
Vavtrudner jag vill!
Högst ivrig är jag
att allvise jättens
forntidskunskap fresta.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Heima letja
ek mynda Herjaföðr
í görðum goða;
því at engi jötun
ek hugða jafnramman
sem Vafþrúðni vera."$txt$, $txt$»Hemma jag ville hålla
Härjafader kvar
i gudarnes gårdar,
ty ingen jätte
jag jämnstark känner
med Vavtrudner vara.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Fjölð ek fór,
fjölð ek freistaða,
fjölð ek reynda regin;
hitt vil ek vita,
hvé Vafþrúðnis
salakynni sé."$txt$, $txt$»Mycket jag for,
mycket jag frestade,
mycket jag makterna prövat;
det vill jag nu veta,
hurudana Vavtrudners
salar mig synas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Heill þú farir!
heill þú aftr komir!
heill þú á sinnum sér!
æði þér dugi,
hvars þú skalt, Aldaföðr,
orðum mæla jötun.$txt$, $txt$»Lycklig du fare!
Lycklig du åter komme!
Lycklig du på vägen vare!
Må, människors fader,
din förmåga stå bi,
då du samtal söker med jätten!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Fór þá Óðinn
at freista orðspeki
þess ins alsvinna jötuns;
at höllu hann kom,
ok átti Íms faðir;
inn gekk Yggr þegar.$txt$, $txt$For så Oden
att fresta jättens
vida frejdade visdom.
Anländ till salen,
som Ims fader ägde,
gick Ygg genast in.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$"Heill þú nú, Vafþrúðnir,
nú em ek í höll kominn
á þik sjalfan sjá;
hitt vil ek fyrst vita,
ef þú fróðr sér
eða alsviðr jötunn."$txt$, $txt$»Hell dig, Vavtrudner,
nu till hallen är jag kommen
att se dig själv, där du sitter.
Först vill jag veta,
om vis du är
och gömmande all kunskap, jätte.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$"Hvat er þat manna
er í mínum sal
verpumk orði á?
Út þú né komir
órum höllum frá,
nema þú inn snotrari sér."$txt$, $txt$»Vem är den man,
som i min sal
slungar ut slika ord?
Ut du ej kommer
ur vår sal,
är av oss du icke visast.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Gagnráðr ek heiti,
nú emk af göngu kominn,
þyrstr til þinna sala;
laðar þurfi -
hef ek lengi farit -
ok þinna andfanga, jötunn."$txt$, $txt$»Gagnråd jag heter:
nyss, av gången tröttad,
törstig jag trädde i din sal.
Länge jag färdats,
längtar att hälsas
och att mig du mottager, jätte.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$"Hví þú þá, Gagnráðr,
mælisk af golfi fyr?
Far þú í sess í sal!
Þá skal freista,
hvárr fleira viti,
gestr eða inn gamli þulr."$txt$, $txt$»Vi står du då, Gagnråd,
på golvet och talar?
Sätt dig på bänk i salen!
Utröna skall vi,
om åldrige talarn
vet mer eller mindre än gästen.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Óauðigr maðr,
er til auðigs kemr,
mæli þarft eða þegi;
ofrmælgi mikil,
hygg ek, at illa geti
hveim er við kaldrifjaðan kemr."$txt$, $txt$»Ringa man,
som till rik man kommer,
tale, vad som hövs, eller tige.
Ordsvall tänker jag
illa båtar
den, som kommer till kallsinning värd.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Seg þú mér, Gagnráðr,
alls þú á golfi vill
þíns of freista frama,
hvé sá hestr heitir,
er hverjan dregr
dag of dróttmögu."$txt$, $txt$»Säg mig, Gagnråd,
då på golvet du vill
fresta din framgång,
hur den hästen
heter, som drager
dagen över människor var morgon!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"Skinfaxi heitir,
er inn skíra dregr
dag of dróttmögu;
hesta beztr
þykkir hann með Hreiðgotum;
ey lýsir mön af mari."$txt$, $txt$»Skinfaxe han kallas,
som den klara dagen
var morgon över människor drar.
För den bästa av hästar
han hålles av reidgoter,
ljus sprider springarens man.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$"Seg þú þat, Gagnráðr,
alls þú á golfi vill
þíns of freista frama,
hvé sá jór heitir,
er austan dregr
nótt of nýt regin."$txt$, $txt$»Säg mig, Gagnråd,
då på golvet du vill
fresta din framgång,
hur den hästen
heter, som från öster
drager natten över nådiga gudar!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$"Hrímfaxi heitir,
er hverja dregr
nótt of nýt regin;
méldropa fellir hann
morgin hvern;
þaðan kemr dögg um dala."$txt$, $txt$»Rimfaxe heter
den häst, som drager
var natt över nådige gudar;
ur munnen från betslet
var morgon det droppar,
och så kommer dagg i dalar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Seg þú þat, Gagnráðr,
alls þú á golfi vill
þíns of freista frama,
hvé sú á heitir,
er deilir með jötna sonum
grund ok með goðum."$txt$, $txt$»Säg mig, Gagnråd,
då på golvet du vill
fresta din framgång,
hur den å heter,
som åtskiljer
jättars och gudars jord!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$"Ífing heitir á,
er deilir með jötna sonum
grund ok með goðum;
opin renna
hon skal of aldrdaga;
verðr-at íss á á."$txt$, $txt$»Iving heter ån,
som åtskiljer
jättars och gudars jord;
öppen skall hon rinna
i alla tider,
is bliver ej på den ån.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Seg þú þat, Gagnráðr,
alls þú á golfi vill
þíns of freista frama,
hvé sá völlr heitir,
er finnask vígi at
Surtr ok in svásu goð."$txt$, $txt$»Säg mig, Gagnråd,
då på golvet du vill
fresta din framgång,
vad den slätt heter,
där till slag mötas
Surt och de milda makter!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Vígriðr heitir völlr,
er finnask vígi at
Surtr ok in svásu goð;
hundrað rasta
hann er á hverjan veg;
sá er þeim völlr vitaðr."$txt$, $txt$»Vigrid heter slätten,
där till slag mötas
Surt och de milda makter;
åt alla håll
är den hundra mil,
denna valplats dem visats an.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Fróðr ertu nú, gestr,
far þú á bekk jötuns,
ok mælumk í sessi saman;
höfði veðja
vit skulum höllu í,
gestr, of geðspeki.$txt$, $txt$»Gäst, du kunnig är.
Till jättens bänk kom!
Låt oss sitta tillsammans och tala!
Om huvudet, främling,
i hallen vi slå vad,
vem som av oss är visast.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Seg þú þat it eina,
ef þitt æði dugir
ok þú, Vafþrúðnir, vitir,
hvaðan jörð of kom
eða upphiminn
fyrst, inn fróði jötunn."$txt$, $txt$»Säg du ett,
om du äger förstånd
och du, Vavtrudner, vet det,
vadan jorden först kom,
du kunnige jätte,
eller den höga himlen!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Ór Ymis holdi
var jörð of sköpuð,
en ór beinum björg,
himinn ór hausi
ins hrímkalda jötuns,
en ór sveita sær."$txt$, $txt$»Av Ymers kött
åstadkoms jorden
och av benen berg;
av rimfrostjättens huvudskål
himlen blev skapad,
böljan av hans blod.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Seg þú þat annat,
ef þitt æði dugir
ok þú, Vafþrúðnir, vitir,
hvaðan máni kom,
sá er ferr menn yfir,
eða sól it sama."$txt$, $txt$»Säg du det andra,
om insikt du äger,
och du, Vavtrudner, vet det,
vadan månen kom,
som över människor far,
sammaledes ock solen!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$"Mundilfari heitir,
hann er mána faðir
ok svá Sólar it sama;
himin hverfa
þau skulu hverjan dag
öldum at ártali."$txt$, $txt$»Mundelföre heter
han, som är månens fader,
sammaledes också solens.
På himlen vandra
de varje dag skola
för människorna tiden att tälja.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$"Seg þú þat it þriðja,
alls þik svinnan kveða
ok þú, Vafþrúðnir, vitir,
hvaðan dagr of kom,
sá er ferr drótt yfir,
eða nótt með niðum."$txt$, $txt$»Säg du det tredje,
då man talar om din kunskap
och du, Vavtrudner, vet det,
vadan dagen kom
som drager över människor,
eller natten med nedan!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Dellingr heitir,
hann er Dags faðir,
en Nótt var Nörvi borin;
ný ok nið
skópu nýt regin
öldum at ártali."$txt$, $txt$»Delling han heter,
han är dagens fader,
men natten av Norve föddes;
ny och nedan
skapade nådiga gudar
att för människorna tiden tälja.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Seg þú þat it fjórða,
alls þik fróðan kveða,
ok þú, Vafþrúðnir, vitir,
hvaðan vetr of kom
eða varmt sumar
fyrst með fróð regin."$txt$, $txt$»Säg du det fjärde,
då du frejdad är för kunskap
och du, Vavtrudner, vet det,
vadan vintern först kom
eller varma sommaren
bland visa gudar att vara!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$"Vindsvalr heitir,
hann er Vetrar faðir,
en Svásuðr sumars."$txt$, $txt$»Vindsval han heter,
som är vinterns fader,
men Svasud är sommarens.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Seg þú þat it fimmta,
alls þik fróðan kveða,
ok þú, Vafþrúðnir, vitir,
hverr ása ellztr
eða Ymis niðja
yrði í árdaga."$txt$, $txt$»Säg du det femte,
då du frejdad är för kunskap
och du, Vavtrudner, vet det,
vem äldst av asar
eller Ymers fränder
i urtiden alstrades!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Örófi vetra
áðr væri jörð of sköpuð,
þá var Bergelmir borinn,
Þrúðgelmir
var þess faðir,
en Aurgelmir afi."$txt$, $txt$»Ett jätteantal vintrar,
innan jorden var skapad,
vart Bergelmer boren;
äldre var Trudgelmer,
och än äldre Aurgelmer,
hans fader och farfader.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$"Seg þú þat it sétta,
alls þik svinnan kveða,
ok þú, Vafþrúðnir, vitir,
hvaðan Aurgelmir kom
með jötna sonum
fyrst, inn fróði jötunn."$txt$, $txt$»Säg du det sjätte,
då man skicklig dig kallar
och du, Vavtrudner, vet det,
varifrån jätten Aurgelmer
bland jättars söner
först kom, du kunnige jätte!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$"Ór Élivágum
stukku eitrdropar,
svá óx, unz varð jötunn;
þar eru órar ættir
komnar allar saman;
því er þat æ allt til atalt."$txt$, $txt$»Ur Elivågor
etterdroppar stänkte;
det växte, tills det vart till en jätte;
därav våra ätter
allesammans kommit,
äro därför alla elaka.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$"Seg þú þat it sjaunda,
alls þik svinnan kveða,
ok þú, Vafþrúðnir, vitir,
hvé sá börn gat,
inn baldni jötunn,
er hann hafði-t gýgjar gaman."$txt$, $txt$»Säg du det sjunde,
då man skicklig dig kallar
och du, Vavtrudner, vet det,
huru barn han fick
den bålde jätten,
då ej till gifte jättekvinna fanns!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$"Undir hendi vaxa
kváðu hrímþursi
mey ok mög saman;
fótr við fæti
gat ins fróða jötuns
sexhöfðaðan son."$txt$, $txt$»Under armen växte
på väldige rimtursen
mö och man tillsammans;
fot med fot
födde åt jätten,
den vise, en sexhövdad son.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$"Seg þú þat it átta,
alls þik svinnan kveða,
ok þú, Vafþrúðnir, vitir,
hvat þú fyrst of mant
eða fremst of veizt,
þú ert alsviðr, jötunn."$txt$, $txt$»Säg du det åttonde,
då du anses kunnig,
och du, Vavtrudner, vet det,
vad det första är, du minnes,
och det fjärmaste, du vet,
du gömmer all kunskap, jätte!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Örófi vetra
áðr væri jörð of sköpuð,
þá var Bergelmir borinn;
þat ek fyrst of man,
er sá inn fróði jötunn
á var lúðr of lagiðr."$txt$, $txt$»Ett jätteantal vintrar,
innan jorden var skapad,
vart Bergelmer boren;
det är det första jag minnes,
när förfarne jätten
på urholkad ökstock lades.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$"Seg þú þat it níunda,
alls þik svinnan kveða,
ok þú, Vafþrúðnir, vitir,
hvaðan vindr of kemr,
svá at ferr vág yfir;
æ menn han sjalfan of sjá."$txt$, $txt$»Säg du det nionde,
då du nämnes vis
och du, Vavtrudner, vet det,
varifrån vinden kommer,
som över vågen far!
Aldrig man skönjer honom själv.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$"Hræsvelgr heitir,
er sitr á himins enda,
jötunn í arnar ham;
af hans vængjum
kvæða vind koma
alla menn yfir."$txt$, $txt$»Räsvälg han heter,
som vid himlens ända sitter,
en jätte med örns utseende;
av hans vingar
säges vinden komma,
som far över alla folk.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$"Seg þú þat it tíunda,
alls þú tíva rök
öll, Vafþrúðnir, vitir,
hvaðan Njörðr of kom
með ása sonum -
hofum ok hörgum
hann ræðr hundmörgum -
ok varð-at hann ásum alinn."$txt$, $txt$»Säg du det tionde,
då förtälja om gudars
alla öden du, Vavtrudner, vet,
varifrån Njord kom in
bland asars söner,
- över tallösa altare
och tempel han råder -
fast åt fader bland asar han ej föddes!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$"Í Vanaheimi
skópu hann vís regin
ok seldu at gíslingu goðum,
í aldar rök
hann mun aftr koma
heim með vísum vönum."$txt$, $txt$»I Vanahem han skaptes
av visa makter
och gavs som gisslan åt gudar;
i åldrarnes ände
skall han åter komma
hem till de visa vaner.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$"Seg þú þat et ellifta,
hvar ýtar túnum í
höggvask hverjan dag;
val þeir kjósa
ok ríða vígi frá,
sitja meir of sáttir saman."$txt$, $txt$»Säg du det elfte
var med svärd de i gården
var dag skifta duktiga hugg;
de kora, vem skall falla,
och från kampen rida,
sitta sedan försonta tillsammans.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$"Allir einherjar
Óðins túnum í
höggvask hverjan dag,
val þeir kjósa
ok ríða vígi frá,
sitja meirr of sáttir saman."$txt$, $txt$»Alla einhärjar
i Odens gårdar
var dag skifta duktiga hugg,
kora, vem skall falla,
och från kampen rida,
sitta sedan försonta tillsammans.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$"Seg þú þat it tolfta,
hví þú tíva rök
öll, Vafþrúðnir, vitir,
frá jötna rúnum
ok allra goða
segir þú it sannasta,
inn alsvinni jötunn."$txt$, $txt$»Säg du det tolfte,
hur förtälja om gudars
alla öden du, Vavtrudner, vet;
var hemlighet om jättar
och jämväl alla gudar
på det sannaste du säger,
du jätte, som gömmer all vishet!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$"Frá jötna rúnum
ok allra goða
ek kann segja satt,
því at hvern hef ek
heim of komit;
níu kom ek heima
fyr Niflhel neðan;
hinig deyja ór helju halir."$txt$, $txt$»Om jättars hemlighet
och jämväl alla gudars
jag sanning kan säga,
ty till varje värld
jag vandrat har,
till nio världar kom jag,
ända nedom Nivlhel,
hit avlida döda från Hel.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$"Fjölð ek fór,
fjölð ek freistaðak,
fjölð ek of reynda regin:
Hvat lifir manna,
þá er inn mæra líðr
fimbulvetr með firum?"$txt$, $txt$»Mycket for jag,
mycket jag frestade,
mycket jag makterna prövat.
Vad för människor leva,
medan den långa
fimbulvintern varar i världen?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$"Líf ok Lifþrasir,
en þau leynask munu
í holti Hoddmímis;
morgindöggvar
þau sér at mat hafa,
en þaðan af aldir alask."$txt$, $txt$»Liv och Leivtraser,
och leva de skola,
gömda i Hoddmimers hult;
morgondagg
till mat de hava;
de bliva människornas moder och fader.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$"Fjölð ek fór,
fjölð ek freistaðak,
fjölð ek of reynda regin:
Hvaðan kemr sól
á inn slétta himin,
er þessa hefr fenrir farit?"$txt$, $txt$»Mycket for jag,
mycket jag frestade,
mycket jag makterna prövat.
Vadan kommer sol
på den släta himlen,
när ulven denna sol hunnit upp?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$"Eina dóttur
berr alfröðull,
áðr hana fenrir fari;
sú skal ríða,
þá er regin deyja,
móður brautir, mær."$txt$, $txt$»Alvrodul föder
en fager dotter,
innan henne ulven hunnit upp;
hon skall gå,
när gudarne dö,
en mö på sin moders vägar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$"Fjölð ek fór,
fjölð ek freistaðak,
fjölð ek of reynda regin:
Hverjar ro þær meyjar,
er líða mar yfir,
fróðgeðjaðar fara?"$txt$, $txt$»Mycket for jag,
mycket jag frestade,
mycket jag makterna prövat.
Vilka äro de flickor,
som fara över havet,
och med klokhet och kunskap färdas?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$"Þríar þjóðár
falla þorp yfir
meyja Mögþrasis;
hamingjur einar
þær er í heimi eru,
þó þær með jötnum alask."$txt$, $txt$»Tre väldiga floder
falla över bygden,
som Mogtrasers möar behärska;
ödets gudinnor
de enda i världen,
dock bland jättar de fötts och fostrats.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$"Fjölð ek fór,
fjölð ek freistaðak,
fjölð ek of reynda regin:
Hverir ráða æsir
eignum goða,
þá er sloknar Surta logi?"$txt$, $txt$»Mycket for jag,
mycket jag frestade,
mycket jag makterna prövat.
Vilka asar råda
för gudarnes ägor,
då Surts låga slocknar?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$"Víðarr ok Váli
byggja vé goða,
þá er sloknar Surta logi,
Móði ok Magni
skulu Mjöllni hafa
Vingnis at vígþroti."$txt$, $txt$»Vidar bor och Vale
i de vigda gudaboningar,
när Surts låga slocknar;
Mode och Magne
skola Mjollner hava,
då Vingners strid har stannat.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 52, $txt$"Fjölð ek fór,
fjölð ek freistaðak,
fjölð ek of reynda regin;
Hvat verðr Óðni
at aldrlagi,
þá er of rjúfask regin?"$txt$, $txt$»Mycket for jag,
mycket jag frestade,
mycket jag makterna prövat.
Vad blir Oden
till undergång,
då alla gudar förgås?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=52);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 53, $txt$"Ulfr gleypa
mun Aldaföðr,
þess mun Víðarr vreka;
kalda kjafta
hann klyfja mun
vitnis vígi at."$txt$, $txt$»Ulven skall sluka
Aldafader,
men honom skall Vidar hämna;
kalla käftar
han klyva skall
på vargen i stridens stund.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=53);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 54, $txt$"Fjölð ek fór,
fjölð ek freistaðak,
fjölð ek of reynda regin;
Hvat mælti Óðinn,
áðr á bál stigi,
sjalfr í eyra syni?"$txt$, $txt$»Mycket for jag,
mycket jag frestade,
mycket jag makterna prövat.
Vad sade Oden
i sonens öra,
innan denne å bålet bars?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=54);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 55, $txt$"Ey manni þat veit,
hvat þú í árdaga
sagðir í eyra syni;
feigum munni
mælta ek mína forna stafi
ok of ragnarök.
Nú ek við Óðin
deildak mína orðspeki;
þú ert æ vísastr vera."$txt$, $txt$»Ingen vet,
vad du i urtiden
sade i örat på sonen.
Med åt fallet vigd mun
min forntids kunskap
och gudars öden jag om talt.
Med Oden själv
jag skiftat visdomsord;
du av alla väsen är visast.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Vavtrudner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=55);

-- ===== Sången om Grimner  (Grímnismál) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Heitr ertu, hripuðr,
ok heldr til mikill;
göngumk firr, funi!
loði sviðnar,
þótt ek á loft berak;
brennumk feldr fyr.$txt$, $txt$»Het är du, eld,
och nästan alltför stor.
Gå fjärran från mig, fyr!
Ludna kappan svedes,
fast jag lyfter den upp,
fällen för mig brinner.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Átta nætr sat ek
milli elda hér,
svá at mér manngi
mat né bauð
nema einn Agnarr,
er einn skal ráða,
Geirröðar sonr,
Gotna landi.$txt$, $txt$Åtta nätter satt jag
mellan eldarne här,
och ingen människa mat mig bjöd,
utom Agnar allena,
som ensam skall råda,
Geirröds son, över goter.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Heill skaltu, Agnarr,
alls þik heilan biðr
Veratýr vera;
eins drykkjar
þú skalt aldrigi
betri gjöld geta.$txt$, $txt$Lycklig blir du, Agnar,
då lycklig dig beder
Veratyr vara;
för en enda dryck
dig aldrig skall
bättre lön lämnas.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Land er heilagt,
er ek liggja sé
ásum ok alfum nær;
en í Þrúðheimi
skal Þórr vera
unz of rjúfask regin.$txt$, $txt$Det land är heligt,
som jag ligga ser
asar och alfer nära,
och i Trudheim
skall Tor vara,
tills alla gudar förgås.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Ýdalir heita,
þar er Ullr hefir
sér of görva sali;
Alfheim Frey
gáfu í árdaga
tívar at tannféi.$txt$, $txt$Ydalar det heter,
där Ull åt sig
har sina salar byggt;
Alvheim gåvo
gudarne till tandskänk
åt Frej i fjärran urtid.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Bær er sá inn þriði,
er blíð regin
silfri þökðu sali;
Valaskjalf heitir,
er vélti sér
áss í árdaga.$txt$, $txt$En tredje är den gård,
där goda makter
med silver salarna täckt;
Valaskjalv den heter,
som vist åt sig
asagud i urtiden byggt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Sökkvabekkr heitir inn fjórði,
en þar svalar knegu
unnir yfir glymja;
þar þau Óðinn ok Sága
drekka um alla daga
glöð ór gullnum kerum.$txt$, $txt$Söckvabäck heter den fjärde,
men däröver svala
böljor brusa fram;
Oden och Saga
i all tid där dricka
glada ur kärl av guld.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Glaðsheimr heitir inn fimmti,
þars in gullbjarta
Valhöll víð of þrumir;
en þar Hroftr kýss
hverjan dag
vápndauða vera.$txt$, $txt$Gladsheim heter den femte,
där guldglänsande
Valhall sig vidsträckt reser;
där väljer Ropt
varje dag
hjältar, som vapendöd ljutit.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Mjök er auðkennt,
þeim er til Óðins koma
salkynni at séa;
sköftum er rann reft,
skjöldum er salr þakiðr,
brynjum um bekki strát.$txt$, $txt$Lätt de alla,
som till Oden komma,
känna kynnet av hans sal;
spjutskaft äro sparrar,
spån på taket sköldar,
och brynjor på bänkarna strödda.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Mjök er auðkennt,
þeir er til Óðins koma
salkynni at séa:
vargr hangir
fyr vestan dyrr,
ok drúpir örn yfir.$txt$, $txt$Lätt de alla,
som till Oden komma,
känna kynnet av hans sal;
en varg hänger
väster om dörren,
en örn ovanför svävar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Þrymheimr heitir inn sétti,
er Þjazi bjó,
sá inn ámáttki jötunn;
en nú Skaði byggvir,
skír brúðr goða,
fornar tóftir föður.$txt$, $txt$Trymheim heter den sjätte,
där Tjatse bodde,
den mycket mäktige jätten;
där bor nu Skade,
gudars brud den ljusa,
på faderns forna tomter.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Breiðablik eru in sjaundu,
en þar Baldr hefir
sér of gerva sali,
á því landi,
er ek liggja veit
fæsta feiknstafi.$txt$, $txt$Breidablick är den sjunde,
och Balder har där
åt sig byggt salar;
å det land,
där ligga jag vet
minst av menlighet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Himinbjörg eru in áttu,
en þar Heimdall
kveða valda véum;
þar vörðr goða
drekkr í væru ranni
glaðr inn góða mjöð.$txt$, $txt$Himinbjorg är den åttonde,
och Heimdall där säges
över helgedomarna härska;
i sitt trevna hus
tömmer gudaväktarn
glad sitt goda mjöd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Fólkvangr er inn níundi,
en þar Freyja ræðr
sessa kostum í sal;
halfan val
hon kýss hverjan dag,
en halfan Óðinn á.$txt$, $txt$Folkvang är den nionde,
och Freja där råder
för hur sittplats i sal skall fördelas;
hälften av de fallna
har hon att välja,
den andra Oden har.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Glitnir er inn tíundi,
hann er gulli studdr
ok silfri þakðr it sama;
en þar Forseti
byggir flestan dag
ok svæfir allar sakir.$txt$, $txt$Glitner är den tionde;
på guldstolpar stödd
och med silver takad är salen.
Forsete bor där,
fredsdomaren,
som stillar varje strid.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Nóatún eru in elliftu,
en þar Njörðr hefir,
sér of görva sali;
manna þengill
inn meins vani
hátimbruðum hörgi ræðr.$txt$, $txt$Noatun är den elfte,
och Njord har där
åt sig salar byggt;
männens furste,
som ej men har,
för högtimrad helgedom råder.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Hrísi vex
ok háu grasi
Víðars land viði;
en þar mögr of læzt
af mars baki
frækn at hefna föður.$txt$, $txt$Höljt av ris
och högt gräs
är Vidars land Vide;
från hästens rygg, lysten
att hämna sin fader,
där sonen sig vara säger.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Andhrímnir
lætr í Eldhrímni
Sæhrímni soðinn,
fleska bezt;
en þat fáir vitu,
við hvat einherjar alask.$txt$, $txt$Andrimner låter
i Eldrimner
Särimner suden varda;
av fläsket det bästa,
men få veta,
vad mat einhärjarne mättar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Gera ok Freka
seðr gunntamiðr
hróðigr Herjaföður;
en við vín eitt
vápngöfugr
Óðinn æ lifir.$txt$, $txt$Gere och Freke
fodrar stridsvane
högtberömde Härfader,
men av vin endast
vapenfrejdade
Oden alltid lever.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Huginn ok Muninn
fljúga hverjan dag
Jörmungrund yfir;
óumk ek of Hugin,
at hann aftr né komi-t,
þó sjámk meir of Munin.$txt$, $txt$Hugin och Munin
var morgon flyga
ut över världen vida;
jag ängslas för Hugin,
att ej åter han kommer,
dock bekymras jag mera för Munin.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Þýtr Þund,
unir Þjóðvitnis
fiskr flóði í;
árstraumr þykkir
ofmikill
Valglaumni at vaða.$txt$, $txt$Tund tjuter
och Tjodvitners
fisk trives i floden;
åns ström
synes alltför stark
att vada över Valglaumner.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Valgrind heitir,
er stendr velli á
heilög fyr helgum dyrum;
forn er sú grind,
en þat fáir vitu,
hvé hon er í lás of lokin.$txt$, $txt$Valgrind den heter,
som varsnas på slätten,
helig framför helig dörrgång;
fornåldrig är grinden,
och få veta,
hur hon i lås är lyckt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Fimm hundruð dura
ok umb fjórum tögum,
svá hygg ek á Valhöllu vera;
átta hundruð Einherja
ganga senn ór einum durum,
þá er þeir fara við vitni at vega.$txt$, $txt$Fem hundra dörrar
och fyrtio därtill
tänker jag på Valhall vara;
åttahundra einhärjar,
gå på en gång ur var dörr,
när till dust emot ulven de draga.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Fimm hundruð golfa
ok umb fjórum tögum,
svá hygg ek Bilskirrni með bugum;
ranna þeira,
er ek reft vita,
míns veit ek mest magar.$txt$, $txt$Fem hundra rum inalles
och fyrtio därtill
i Bilskirner byggda jag tänker;
mig tyckes av hus,
som takade äro,
ett större än min sons ej stånda.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Heiðrún heitir geit,
er stendr höllu á
ok bítr af Læraðs limum;
skapker fylla
hon skal ins skíra mjaðar;
kná-at sú veig vanask.$txt$, $txt$Heidrun heter geten,
som på Härfaders sal
står och gnager av Lärads grenar;
en kanna skall hon fylla
med det klara mjöd;
det mjödet ej minskas kan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Eikþyrnir heitir hjörtr,
er stendr höllu á
ok bítr af Læraðs limum;
en af hans hornum
drýpr í Hvergelmi,
þaðan eigu vötn öll vega.$txt$, $txt$Hjorten Eiktyrner heter,
som på Härfaders sal
står och gnager av Lärads grenar;
från hans horn drypa
droppar i Vergelmer,
därifrån alla vatten välla.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Síð ok Víð,
Sækin ok Eikin,
Svöl ok Gunnþró,
Fjörm ok Fimbulþul,
Rín ok Rennandi,
Gipul ok Göpul,
Gömul ok Geirvimul,
þær hverfa um hodd goða,
Þyn ok Vín,
Þöll ok Höll,
Gráð ok Gunnþorin.$txt$, $txt$Sid och Vid,
Säkin och Äkin,
Sval och Gunntro,
Fjorm och Fimbultul,
Rin och Rennande,
Gipul och Gopul,
Gomul och Geirvimul,
kring gudars helgedom de gå;
Tyn och Vin,
Toll och Holl,
Grad och Gunntorin.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Vína heitir ein,
önnur Vegsvinn,
þriðja Þjóðnuma,
Nyt ok Nöt,
Nönn ok Hrönn,
Slíð ok Hríð,
Sylgr ok Ylgr,
Víð ok Ván,
Vönd ok Strönd,
Gjöll ok Leiftr,
þær falla gumnum nær,
er falla til Heljar heðan.$txt$, $txt$Vidare heter en Vina,
Vegsvinn en annan,
den tredje Tjodnuma;
Nyt och Not,
Nonn och Ronn,
Slid och Rid,
Sylg och Ylg,
Vid och Van,
Vond och Strond,
Gjoll och Leipt,
de löpa människor nära
och härifrån falla till Hel.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$Körmt ok Örmt
ok Kerlaugar tvær,
þær skal Þórr vaða
dag hvern,
er hann dæma ferr
at aski Yggdrasils,
því at ásbrú
brenn öll loga,
heilög vötn hlóa.$txt$, $txt$Kormt och Ormt
och Kerlaugar två,
över vilka Tor skall vada,
varje dag,
då att döma han går
vid Yggdrasils ask,
ty då brinner asarnes
bro i låga
och heta bli heliga vattnen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Glaðr ok Gyllir,
Glær ok Skeiðbrimir,
Silfrintoppr ok Sinir,
Gísl ok Falhófnir,
Gulltoppr ok Léttfeti,
þeim ríða æsir jóm
dag hvern,
er þeir dæma fara
at aski Yggdrasils.$txt$, $txt$Glad och Gyller,
Gler och Skeidbrimer,
Silvrintopp och Siner,
Gisl och Falhovner,
Gulltopp och Lettfete,
dessa hästar asar hava
var dag till att rida,
när att döma de fara
vid Yggdrasils ask.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Þríar rætr
standa á þría vega
undan aski Yggdrasils;
Hel býr und einni,
annarri hrímþursar,
þriðju mennskir menn.$txt$, $txt$Tre rötter stå
åt tre håll
ut från Yggdrasils ask.
Hel bor under en,
under den andra rimtursar,
den tredje människor täcker.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Ratatoskr heitir íkorni,
er renna skal
at aski Yggdrasils,
arnar orð
hann skal ofan bera
ok segja Niðhöggvi niðr.$txt$, $txt$Ratatosk heter ekorren,
som ränna skall
på Yggdrasils ask;
örnens ord
skall han uppifrån bära
och säga dem för Nidhogg där nere.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Hirtir eru ok fjórir,
þeirs af hæfingar
gaghalsir gnaga:
Dáinn ok Dvalinn,
Duneyrr ok Duraþrór.$txt$, $txt$Hjortar finnas ock fyra
med finböjda halsar,
som å trädet på grenarna gnaga,
Dain och Dvalin,
Duneyr och Duratro.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$Ormar fleiri liggja
und aski Yggdrasils,
en þat of hyggi hverr ósviðra apa:
Góinn ok Móinn,
þeir ro Grafvitnis synir,
Grábakr ok Grafvölluðr,
Ófnir ok Sváfnir,
hygg ek, at æ skyli
meiðs kvistu má.$txt$, $txt$Flera ormar ligga
under Yggdrasils ask,
än en okunnig dåre anar.
Gion och Moin,
de äro Gravvitners söner,
Grabak och Gravvollud;
Ovner och Svavner
alltid tror jag skola
trädets kvistar tära.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Askr Yggdrasils
drýgir erfiði
meira en menn um viti:
hjörtr bítr ofan,
en á hliðu fúnar,
skerðir Niðhöggr neðan.$txt$, $txt$Yggdrasils ask
utstår vedermöda
mera, än män veta;
hjorten uppifrån raspar
men det ruttnar på sidan,
nedifrån Nidhogg skär.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$Hrist ok Mist
vil ek, at mér horn beri,
Skeggjöld ok Skögul,
Hildr ok Þrúðr,
Hlökk ok Herfjötur,
Göll ok Geirönul,
Randgríðr ok Ráðgríðr
ok Reginleif,
þær bera Einherjum öl.$txt$, $txt$Rist och Mist
skola räcka mig hornet;
Skeggjold och Skogul,
Hild och Trud,
Loch och Herfjotur,
Goll och Geironul,
Randgrid och Radgrid
och Reginleiv,
de bära åt einhärjarne öl.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$Árvakr ok Alsviðr
þeir skulu upp heðan
svangir sól draga;
en und þeira bógum
fálu blíð regin,
æsir, ísarnkol.$txt$, $txt$Arvakr och Alsvinn,
de skola upp på himlen,
smärta, solen draga
och under deras bogar
blida makter,
asarne, järnbläster gömde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$Svalinn heitir,
hann stendr sólu fyrir,
skjöldr, skínanda goði;
björg ok brim,
ek veit, at brenna skulu,
ef hann fellr í frá.$txt$, $txt$Svalin den heter,
som framför solen står,
en sköld framför skinande guden;
berg och bränning
vet jag brinna skulle,
om han skulle falla ifrån.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$Sköll heitir ulfr,
er fylgir inu skírleita goði
til varna viðar,
en annarr Hati,
hann er Hróðvitnis sonr,
sá skal fyr heiða brúði himins.$txt$, $txt$Skoll heter den ulv,
som till skogens hägn
den glänsande guden förföljer;
en annan är Hate,
han är ättling av Rodvitner,
skall stänga strålande himlabrud vägen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$Ór Ymis holdi
var jörð of sköpuð,
en ór sveita sær,
björg ór beinum,
baðmr ór hári,
en ór hausi himinn.$txt$, $txt$Av Ymers kött
åstadkoms jorden,
böljan av hans blod;
berg skapades av benen,
buskar av håret,
och av huvudskålen himlen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$En ór hans brám
gerðu blíð regin
Miðgarð manna sonum,
en ór hans heila
váru þau in harðmóðgu
ský öll of sköpuð.$txt$, $txt$Av hans ögons bryn
gjorde blida makter
Midgård åt människors söner,
och av hans hjärna
gjordes de tunga
moln, som på fästet flockas.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$Ullar hylli
hefr ok allra goða
hverr er tekr fyrstr á funa,
því at opnir heimar
verða of ása sonum,
þá er hefja af hvera.$txt$, $txt$Ulls huldhet har den
och alla gudarnes,
som först med flamman tar i tu,
ty öppna bliva världar
över asars söner,
när kittlar från lågan lyftas.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$Ívalda synir
gengu í árdaga
Skíðblaðni at skapa,
skipa bezt,
skírum Frey,
nýtum Njarðar bur.$txt$, $txt$Ivaldes söner
i urtiden gingo
att skapa Skidbladners skepp,
det bästa fartyg,
åt bländande Frej,
snarrådige sonen till Njord.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$Askr Yggdrasils,
hann er æðstr viða,
en Skíðblaðnir skipa,
Óðinn ása,
en jóa Sleipnir,
Bilröst brúa,
en Bragi skalda,
Hábrók hauka,
en hunda Garmr.$txt$, $txt$Yggdrasils ask
är ypperst av träd,
men Skidbladner av skepp,
Oden av gudar,
av gångare Sleipner,
Bilrost av broar
och Brage av skalder,
Habrik av hökar
och av hundar Garm.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$Svipum hef ek nú yppt
fyr sigtíva sonum,
við þat skal vilbjörg vaka;
öllum ásum
þat skal inn koma
Ægis bekki á,
Ægis drekku at.$txt$, $txt$Jag segergudars söner
syn av gudomen givit,
därav välkommen hjälp skall väckas.
För alla asar
skall det in komma
på Ägers bänkar,
vid Ägers dryckeslag.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$Hétumk Grímr,
hétumk Gangleri,
Herjann ok Hjalmberi,
Þekkr ok Þriði,
Þundr ok Uðr,
Herblindi ok Hár.$txt$, $txt$Jag heter Grim,
jag heter Ganglere,
Herjan och Hjalmbere,
Teck och Tride,
Tud och Ud,
Helblinde och Har.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$Saðr ok Svipall
ok Sanngetall,
Herteitr ok Hnikarr,
Bileygr, Báleygr,
Bölverkr, Fjölnir,
Grímr ok Grímnir,
Glapsviðr ok Fjölsviðr;$txt$, $txt$Sann och Svipal
och Sanngetal,
Herteit och Nikar,
Bileyg, Baleyg,
Bolverk, Fjolner,
Grim och Grimner,
Glappsvinn och Fjolsvinn.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$Síðhöttr, Síðskeggr,
Sigföðr, Hnikuðr,
Alföðr, Valföðr,
Atríðr ok Farmatýr;
einu nafni
hétumk aldregi,
síz ek með folkum fór.$txt$, $txt$Sidhott, Sidskägg
Sigfodr, Nikud,
Alfodr, Valfodr,
Atrid och Farmatyr;
med ett enda namn
nämnde jag mig aldrig,
sålänge jag bland folken farit.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$Grímni mik hétu
at Geirröðar,
en Jalk at Ásmundar,
en þá Kjalar,
er ek kjálka dró,
Þrór þingum at,
Viðurr at vígum,
Óski ok Ómi,
Jafnhár ok Biflindi,
Göndlir ok Hárbarðr með goðum.$txt$, $txt$Grimner de mig kallade
hos Geirröd
och Ialk hos Asmund,
men Kjalar då,
när jag kälke drog,
vid ting Tro,
Vidur på valplats,
Oske och Ome,
Javnha och Bivlinde,
Gondler och Harbard bland gudar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$Sviðurr ok Sviðrir
er ek hét at Sökkmímis,
ok dulðak þann inn aldna jötun,
þá er ek Miðvitnis vark
ins mæra burar
orðinn einbani.$txt$, $txt$Svidur och Svidrer
jag hette hos Sockmimer,
och då gäckade jag den gamla jätten,
då till Midvitner,
hans märklige son,
baneman jag blivit hade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$Ölr ertu, Geirröðr,
hefr þú ofdrukkit;
miklu ertu hnugginn,
er þú ert mínu gengi,
öllum Einherjum
ok Óðins hylli.$txt$, $txt$Rusig är du, Geirröd,
har riktigt mycket druckit;
mycket du mistat,
då min hjälp dig frångår,
alla einhärjar
och Odens huldhet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 52, $txt$Fjölð ek þér sagðak,
en þú fátt of mant;
of þik véla vinir;
mæki liggja
ek sé míns vinar
allan í dreyra drifinn.$txt$, $txt$Till fullo jag sagt dig,
men föga du minnes,
vänner dig listigt lura.
Min väns svärd
ser jag ligga
med bladet drypande av blod.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=52);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 53, $txt$Eggmóðan val
nú mun Yggr hafa,
þitt veit ek líf of liðit;
úfar ro dísir,
nú knáttu Óðin sjá,
nálgasktu mik, ef þú megir.$txt$, $txt$Den för eggen fallne
skall Ygg nu hava,
ditt liv vet jag lidet;
vreda äro diserna,
varse är du Oden,
kom, om du kan, till mig.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=53);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 54, $txt$Óðinn ek nú heiti,
Yggr ek áðan hét,
hétumk Þundr fyr þat,
Vakr ok Skilfingr,
Váfuðr ok Hroftatýr,
Gautr ok Jalkr með goðum,
Ófnir ok Sváfnir,
er ek hygg, at orðnir sé
allir af einum mér.$txt$, $txt$Oden jag nu heter,
Ygg jag hette nyss,
tidigare Tund var mitt namn,
Vakr och Skilving,
Vavud och Roptatyr,
Gaut och Ialk bland gudar,
Ovner och Svavner,
jag tror alla hava
av mig allena uppstått.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Grimner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=54);

-- ===== Sången om Skirner  (Skírnismál) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Rístu nú, Skírnir,
ok gakk skjótt at beiða
okkarn mála mög
ok þess at fregna,
hveim inn fróði sé
ofreiði afi."$txt$, $txt$»Res dig nu, Skirner,
gå raskt att bedja
vår son om samtal,
och fråga den vise,
på vem han kan vara
så övermåttan ond!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Illra orða
er mér ón at ykkrum syni,
ef ek geng at mæla við mög
ok þess at fregna,
hveim inn fróði sé
ofreiði afi."$txt$, $txt$»Vreda ord
jag väntar av er son,
om jag går att tala honom till
och fråga den vise,
på vem han kan vara
så övermåttan ond.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Segðu mér þat, Freyr,
folkvaldi goða,
ok ek vilja vita:
Hví þú einn sitr
endlanga sali,
minn dróttinn, um daga?"$txt$, $txt$»Säg du mig, Frej,
du furste bland gudar,
det som jag veta vill,
vi allena du sitter
i den långa salen
om dagarna, min drott!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Hví um segjak þér,
seggr inn ungi,
mikinn móðtrega?
Því at álfröðull
lýsir um alla daga
ok þeygi at mínum munum."$txt$, $txt$»Vi skulle jag yppa
ungersven, för dig
min svåra sorg,
ty skimrande sol
skiner alla dagar
men lyser dock ej, som jag åtrår.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Muni þína
hykk-a ek svá mikla vera,
at þú mér, seggr, né segir,
því at ungir saman
várum í árdaga,
vel mættim tveir trúask."$txt$, $txt$»Så mycken din åtrå
jag menar ej vara,
att förtro den åt mig du ej törs,
ty unga vi fordom
fostrades tillsamman,
väl vi två varann kunna tro.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$"Í Gymis görðum
ek ganga sá
mér tíða mey;
armar lýstu,
en af þaðan
allt loft ok lögr."$txt$, $txt$»I Gymers gårdar
jag gånga såg
en mö, som till kärlek mig tjusat;
armarne lyste,
och återsken
gåvo både himlen och havet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$"Mær er mér tíðari
en manna hveim
ungum í árdaga;
ása ok alfa
þat vill engi maðr
at vit samt séim."$txt$, $txt$Mer mön är mig kär
än en mö någonsin
för en ung man i all tid har varit;
av asar och alfer
ingen vill,
att vi skola vara tillsammans.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Mar gefðu mér þá
þann er mik um myrkvan beri
vísan vafrloga,
ok þat sverð,
er sjalft vegisk
við jötna ætt."$txt$, $txt$»Häst mig då giv,
som hastigt mig bär
över mörk, trolsk, fladdrande flamma,
och det svärd,
som svingar sig självt,
förgörande jättars ätt!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$"Mar ek þér þann gef,
er þik um myrkvan berr
vísan vafrloga,
ok þat sverð,
er sjalft mun vegask
ef sá er horskr, er hefr."$txt$, $txt$»En häst jag dig då giver,
som hastigt dig bär
över mörk, trolsk, fladdrande flamma,
och det svärd,
som svingar sig självt,
om dristig den är, som det drager.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Myrkt er úti,
mál kveð ek okkr fara
úrig fjöll yfir,
þursa þjóð yfir;
báðir vit komumk,
eða okkr báða tekr
sá inn ámáttki jötunn."$txt$, $txt$»Mörkt är det ute;
inne är tiden,
att vi fara över våta fjäll,
över tursars tillhåll;
båda vi oss bärga
eller oss båda tar
den mycket mäktige jätten.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Segðu þat, hirðir,
er þú á haugi sitr
ok varðar alla vega:
Hvé ek at andspilli
komumk ins unga mans
fyr greyjum Gymis?"$txt$, $txt$»Säg du, herde,
som på högen sitter
och vaktar åt varje håll,
hur med den unga mön
till möte jag kommer
för Gymers gläfsande hundar!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"Hvárt ertu feigr,
eða ertu framgenginn?
-- -- --
Andspillis vanr
þú skalt æ vera
góðrar meyjar Gymis."$txt$, $txt$»Är åt döden du vigd
eller död allaredan?
Om möte du alltid
skall miste gå
med Gymers goda mö.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$"Kostir ro betri
heldr en at klökkva sé,
hveim er fúss er fara;
einu dægri
mér var aldr of skapaðr
of allt líf of lagit."$txt$, $txt$»Bättre råd jag känner
än kinka och klaga,
då till färd man är färdig;
intill en dag
blev min ålder utmätt
och livets längd bestämd.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$"Hvat er þat hlym hlymja,
er ek heyri nú til
ossum rönnum í?
Jörð bifask,
en allir fyrir
skjalfa garðar Gymis."$txt$, $txt$»Vad är det för buller
och bråk jag hör
inne här i vårt hus;
jorden darrar
och därav alla
Gymers gårdar skälva.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$"Maðr er hér úti,
stiginn af mars baki,
jó lætr til jarðar taka."
-- -- --$txt$, $txt$»Det står en man härute,
stigen från hästryggen,
i gräset får gångaren beta.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$"Inn bið þú hann ganga
í okkarn sal
ok drekka inn mæra mjöð;
þó ek hitt óumk,
at hér úti sé
minn bróðurbani.$txt$, $txt$»Bed honom in
i vår boning stiga
och dricka det mustiga mjöd;
dock med ängslan jag anar
att härute är
min broders baneman.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Hvat er þat alfa
né ása sona
né víssa vana?
Hví þú einn of komt
eikinn fúr yfir
ór salkynni at séa?"$txt$, $txt$»Vem är det av alfer
eller asars söner
eller visa vaner?
Vi kom du ensam
över ursinning eld
att se vår sal?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Emk-at ek alfa
né ása sona
né víssa vana;
þó ek einn of komk
eikinn fúr yfir
yður salkynni at séa."$txt$, $txt$»Jag är ej av alfer
eller asars söner
eller visa vaner;
dock kom jag ensam
över ursinning eld
att se eder sal.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Epli ellifu
hér hef ek algullin,
þau mun ek þér, Gerðr, gefa,
frið at kaupa,
at þú þér Frey kveðir
óleiðastan lifa."$txt$, $txt$Elva äpplen
jag äger av guld,
dem som gåva dig, Gärd, skall jag giva,
att köpa din älskog
och, att kärast dig Frej
är av alla, för sann du säger.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Epli ellifu
ek þigg aldregi
at mannskis munum,
né vit Freyr,
meðan okkart fjör lifir,
byggjum bæði saman."$txt$, $txt$»Elva äpplen
jag aldrig tager
för att vara någon till viljes,
Aldrig vi, jag och Frej,
medan vårt liv varar,
skola båda tillsammans bo.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Baug ek þér þá gef,
þann er brenndr var
með ungum Óðins syni;
átta eru jafnhöfðir,
er af drjúpa
ina níundu hverja nótt."$txt$, $txt$»Jag bjuder dig ringen,
som bränd blev
med Odens unge son;
åtta lika tunga
av honom drypa
varje nionde natt.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Baug ek þikk-a-k,
þótt brenndr séi
með ungum Óðins syni;
er-a mér gulls vant
í görðum Gymis,
at deila fé föður."$txt$, $txt$»Jag bryr mig ej om ringen,
fast bränd han är
med Odens unga son;
guld mig ej fattas
i Gymers gårdar;
jag får av min faders gods.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$"Sér þú þenna mæki, mær,
mjóvan, málfáan,
er ek hef í hendi hér?
Höfuð höggva
ek mun þér hálsi af,
nema þú mér sætt segir."$txt$, $txt$»Ser du detta svärd, mö?
smalt och sirat,
som jag här i handen har;
huvudet hugga
av halsen skall jag dig,
om ej mig ditt jaord du giver.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$"Ánauð þola
ek vil aldregi
at mannskis munum;
þó ek hins get,
ef it Gymir finnizk,
vígs ótrauðir,
at ykkr vega tíði."$txt$, $txt$»Tvång jag aldrig
tåla vill
för att vara någon till viljes;
dock känner jag nog,
att kämpar som du
och Gymer till kamp skola komma.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Sér þú þenna mæki, mær,
mjóvan, málfáan,
er ek hef í hendi hér?
Fyr þessum eggjum
hnígr sá inn aldni jötunn,
verðr þinn feigr faðir.$txt$, $txt$»Ser du detta svärd, mö,
smalt och sirat,
som jag här i handen har;
för eggen däruppå
skall åldrig jätte segna,
faller i döden din fader.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Tamsvendi ek þik drep,
en ek þik temja mun,
mær, at mínum munum;
þar skaltu ganga,
er þik gumna synir
síðan æva séi.$txt$, $txt$Med tamtrollspö slår jag dig,
och tämja dig skall jag,
mö, att vara mig till viljes;
dit måste du gå,
där människors söner
sedan dig aldrig se.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Ara þúfu á
skaltu ár sitja
horfa heimi ór,
snugga heljar til;
matr né þér meir leiðr
en manna hveim
innfráni ormr með firum.$txt$, $txt$På örnens klippa
du arla skall sitta,
blicka bort ur världen,
blänga hän mot Hel.
Mat mer led dig vare
än för människors barn
glänsande ormen är.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$At undrsjónum þú verðir,
er þú út kemr;
á þik Hrímnir hari,
á þik hotvetna stari;
víðkunnari þú verðir
en vörðr með goðum,
gapi þú grindum frá.$txt$, $txt$Till undran du blive,
då ut du kommer.
På dig må Rimner bliga,
på dig vem helst må stirra;
vittberyktad du varde
mer än väktaren hos gudar;
gape du från grindarne ut!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$Tópi ok ópi,
tjösull ok óþoli,
vaxi þér tár með trega;
sezk þú niðr,
en ek mun segja þér
sváran súsbreka
ok tvennan trega:$txt$, $txt$Sinnessvaghet, våpighet,
smärta och otålighet;
må tåren din växa med betrycket!
Sätt dig ned,
och säga dig skall jag
en svår sorgens våg
och tvefaldigt trångmål.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Tramar gneypa
þik skulu gerstan dag
jötna görðum í;
til hrímþursa hallar
þú skalt hverjan dag
kranga kostalaus,
kranga kostavön;
grát at gamni
skaltu í gögn hafa
ok leiða með tárum trega.$txt$, $txt$Gastar skola
dig gruvligt plåga
alltjämt i jättarnas gårdar.
Var dag från ditt rum
till rimtursars sal
du vanke viljesvag,
du vanke viljelös!
Med gråt för gamman
må till godo du hålla
och ledsaga ditt betryck med tårar!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Með þursi þríhöfðuðum
þú skalt æ nara,
eða verlaus vera;
þitt geð grípi,
þik morn morni;
ver þú sem þistill,
sá er var þrunginn
í önn ofanverða.$txt$, $txt$Med trehövdad turs
skall du tillbringa livet
eller ingen make möta.
Ditt sinne sorg gripe,
bekymmer dig bekymre!
Var du som tisteln,
som man trycker ihop,
mot slutet av sädesskörden!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Til holts ek gekk
ok til hrás viðar,
gambantein at geta,
gambantein ek gat.$txt$, $txt$Till skogen jag vandrade,
till de växande träd
en trollstav att träffa,
och trollstav jag träffade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Reiðr er þér Óðinn,
reiðr er þér Ásabragr,
þik skal Freyr fíask,
in firinilla mær,
en þú fengit hefr
gambanreiði goða.$txt$, $txt$Vred är dig Oden,
vred på dig asafursten,
Frej skall din fiende vara.
Ondskefulla mö,
du ådragit dig
gudarnes gränslösa vrede.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$Heyri jötnar,
heyri hrímþursar,
synir Suttungs,
sjalfir ásliðar,
hvé ek fyrbýð,
hvé ek fyrirbanna
manna glaum mani,
manna nyt mani.$txt$, $txt$Höre det jättar,
höre det rimtursar,
Suttungs söner,
och samtliga asar,
hur jag förbjuder,
hur med bann jag belägger,
för mön människors samkväm,
för mön att med människor umgås!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Hrímgrímnir heitir þurs,
er þik hafa skal
fyr nágrindr neðan;
þar þér vílmegir
á viðarrótum
geitahland gefi;
æðri drykkju
fá þú aldregi,
mær, af þínum munum,
mær, at mínum munum.$txt$, $txt$Rimgrimner heter tursen,
som du tillhöra skall
långt nedom likgrinden.
Dig trashankar där
på trädens rötter,
getters spillning give!
Ädlare dryck
må du aldrig få,
du mö, emot din vilja,
du mö, men med min vilja!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$Þurs ríst ek þér
ok þría stafi,
ergi ok æði ok óþola;
svá ek þat af ríst,
sem ek þat á reist,
ef gerask þarfar þess."$txt$, $txt$Turs jag ristar
och trenne stavar:
otukt, lidelse och otålighet.
Jag ristar det så bort,
som jag ristade det dit,
om sådant nödigt synes.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$"Heill ver þú nú heldr, sveinn,
ok tak við hrímkálki
fullum forns mjaðar;
þó hafðak ek þat ætlat,
at myndak aldregi
unna vaningja vel."$txt$, $txt$»Hellre, sven, då, hell dig!
Här får du bägarn,
full med flerårigt mjöd!
Tänkt dock jag hade,
att mitt tycke aldrig
vanernas ättling skulle vinna.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$"Örendi mín
vil ek öll vita,
áðr ek ríða heim heðan,
nær þú á þingi
munt inum þroska
nenna Njarðar syni."$txt$, $txt$»Om ärendet mitt
vill allt jag veta,
innan hädan hem jag rider,
när vid ett möte
du medgiva vill,
att sonen av Njord dig nalkas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$"Barri heitir,
er vit bæði vitum,
lundr lognfara;
en eft nætr níu
þar mun Njarðar syni
Gerðr unna gamans."$txt$, $txt$»Barre heter,
som båda vi känna,
lunden, lugn och stilla;
efter nio nätter
åt Njords son
skall Gärd där unna sin älskog.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$"Segðu mér þat, Skírnir,
áðr þú verpir söðli af mar
ok þú stígir feti framar:
Hvat þú árnaðir
í Jötunheima
þíns eða míns munar?"$txt$, $txt$»Säg mig, Skirner,
förrn du sadel av häst tar,
och stiger ett steg framåt,
vad gjort du har
i Jotunheim
till bästa för bådas vår önskan!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$"Barri heitir,
er vit báðir vitum,
lundr lognfara;
en eft nætr níu
þar mun Njarðar syni
Gerðr unna gamans."$txt$, $txt$»Barre heter,
som vi båda känna,
lunden, så lugn och stilla;
efter nio nätter
åt Njords son
skall Gärd där unna sin älskog.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$"Löng er nótt,
langar ro tvær,
hvé of þreyjak þrjár?
Oft mér mánaðr
minni þótti
en sjá half hýnótt."$txt$, $txt$»Lång är en natt,
långa äro två,
hur kan jag under tre tråna?
Ofta en månad
mig mindre tycktes
än halva denna natt av nöd.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Skirner$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);

-- ===== Sången om Harbard  (Hárbarðsljóð) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Hverr er sá sveinn sveina,
er stendr fyr sundit handan?"$txt$, $txt$»Vem är den svennernas sven,
som på andra sidan sundet står?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Hverr er sá karl karla,
er kallar of váginn?"$txt$, $txt$»Vem är den karlarnas karl,
som kallar på mig över vägen?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Fer þú mik um sundit,
fæði ek þik á morgun;
meis hef ek á baki,
verðr-a matr in betri;
át ek í hvíld,
áðr ek heiman fór,
síldr ok hafra;
saðr em ek enn þess."$txt$, $txt$»För mig över sundet
och frukost jag dig giver;
matsäck har jag på ryggen,
mat ej bättre finnes.
Jag åt i ro,
förrn jag reste hemifrån,
sill och havregröt,
hungrig jag ej än är.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Árligum verkum
hrósar þú, verðinum;
veizt-at-tu fyrir görla,
döpr eru þín heimkynni,
dauð, hygg ek, at þín móðir sé."$txt$, $txt$»Såsom morgonbragder
du måltiden prisar,
men mycket du förutser ej;
dystert är ditt hem,
död tror jag din moder är.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Þat segir þú nú,
er hverjum þykkir
mest at vita,
at mín móðir dauð sé."$txt$, $txt$»Det säger du nu,
som synes envar
mest märkligt att veta,
att min moder är död.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$"Þeygi er sem þú
þrjú bú góð eigir;
berbeinn þú stendr
ok hefr brautinga gervi,
þatki, at þú hafir brækr þínar."$txt$, $txt$»Ej tyckes du mig,
som tre gårdar du ägde;
barbent du står,
som en buse klädd,
så att inte ens byxor du har.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$"Stýrðu hingat eikjunni,
ek mun þér stöðna kenna, -
eða hverr á skipit,
er þú heldr við landit?"$txt$, $txt$»Styr du ekan hitåt,
ställe att landa jag visar,
eller vem är herre till båten,
som du håller vid land?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Hildolfr sá heitir,
er mik halda bað,
rekkr inn ráðsvinni,
er býr í Ráðseyjarsundi;
bað-at hann hlennimenn flytja
eða hrossaþjófa,
góða eina
ok þá, er ek görva kunna;
segðu til nafns þíns,
ef þú vill um sundit fara!"$txt$, $txt$»Hildolv han heter,
som hålla den mig bad,
den rådkloke kämpen,
som i Rådsösund bor;
han bad mig landstrykare ej färja
eller frakta hästtjuvar,
endast redligt folk,
som jag riktigt kände.
Säg mig ditt namn,
om över sundet du vill fara!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$"Segja mun ek til nafns míns,
þótt ek sekr séak,
ok til alls eðlis:
Ek em Óðins sonr,
Meila bróðir,
en Magna faðir,
þrúðvaldr goða,
við Þór knáttu hér dæma!
Hins vil ek nú spyrja,
hvat þú heitir."$txt$, $txt$»Mitt namn skall jag säga,
fast jag sakskyldig vore,
och nämna all min ätt.
Jag är Odens son,
Meiles broder
och Magnes fader,
styrkans herre bland gudar;
du står med Tor och språkar.
Det vill jag nu spörja,
vad du heter.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Hárbarðr ek heiti,
hylk um nafn sjaldan."$txt$, $txt$»Harbard jag heter,
håller ej namnet hemligt.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Hvat skaltu of nafn hylja,
nema þú sakar eigir?"$txt$, $txt$»Varför hemlighålla namnet,
om ej hämnd för brott du rädes?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"En þótt ek sakar eiga,
þá mun ek forða fjörvi mínu
fyr slíkum sem þú ert,
nema ek feigr sé."$txt$, $txt$»Om än hämnd jag räddes,
jag mig reda skulle
mot en sådan, som du är,
om ej till döden jag bestämts.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$"Harm ljótan
mér þykkir í því
at vaða um váginn til þín
ok væta ögur minn;
skylda ek launa
kögursveini þínum
kanginyrði,
ef ek kæmumk yfir sundit."$txt$, $txt$»Otäckt jag tycker att vada
över vågen till dig
och väta min börda.
Jag skulle ge dig, ditt kräk,
för dina kränkande ord,
komme jag blott över sundet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$"Hér mun ek standa
ok þín heðan bíða;
fannt-a þú mann in harðara
at Hrungni dauðan."$txt$, $txt$»Här skall jag stå,
och härifrån dig bida;
efter Rugners död
du ej dråpligare mött.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$"Hins viltu nú geta,
er vit Hrungnir deildum,
sá inn stórúðgi jötunn,
er ór steini var höfuðit á;
þó lét ek hann falla
ok fyrir hníga.
Hvat vanntu þá meðan, Hárbarðr?"$txt$, $txt$»Det vill du nu nämna,
då jag nappades med Rungner,
den stormodige jätten,
av sten var hans huvud;
dock fick jag honom att falla
och för mig segna.
Vad tog du dig till, medan dess, Harbard?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$"Var ek með Fjölvari
fimm vetr alla
í ey þeiri,
er Algræn heitir;
vega vér þar knáttum
ok val fella,
margs at freista,
mans at kosta."$txt$, $txt$»Med Fjolvar jag var
hela fem vintrar
på den ö
som Allgrön heter.
Där fingo vi strida
och stridsmän fälla,
mycket fresta
och mö vinna.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$"Hversu snúnuðu yðr konur yðrar?"$txt$, $txt$»Hur artade sig kvinnorna edra?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Sparkar áttu vér konur,
ef oss at spökum yrði;
horskar áttu vér konur,
ef oss hollar væri;
þær ór sandi
síma undu,
ok ór dali djúpum
grund of grófu;
varð ek þeim einn öllum
efri at ráðum;
hvílda ek hjá þeim systrum sjau,
ok hafða ek geð þeira allt ok gaman.
Hvat vanntu þá meðan, Þórr?"$txt$, $txt$»Muntra kvinnor hade vi,
om de kloka mot oss varit;
gott huvud de hade,
om oss hulda de varit.
De av sand
snodde rep
och ur djupan dal
däld grävde;
dem alla jag ensam
överlistade,
sov hos systrar sju,
hade all deras ynnest och älskog.
Vad tog du dig till medan dess, Tor?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Ek drap Þjaza,
inn þrúðmóðga jötun,
upp ek varp augum
Alvalda sonar
á þann inn heiða himin;
þau eru merki mest
minna verka,
þau er allir menn síðan of séa.
Hvat vanntu þá meðan, Hárbarðr?"$txt$, $txt$»Jag dräpte Tjatse,
den kärve jätten;
Allvaldes sons
ögon jag kastade
högt upp på klara himlen.
Dessa äro minnen
av mina storverk,
som alla människor sedan se.
Vad tog du dig till medan dess, Harbard?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Miklar manvélar
ek hafða við myrkriður,
þá er ek vélta þær frá verum;
harðan jötun
ek hugða Hlébarð vera,
gaf hann mér gambantein,
en ek vélta hann ór viti."$txt$, $txt$»Trolöst svek
jag mot trollpackor övade
och lockade dem med list från männen.
För en hård jätte,
höll jag Lebard;
han lät mig taga trollstav,
men jag villade honom från vettet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Illum huga
launaðir þú þá góðar gjafar."$txt$, $txt$»Med elakhet gav du då
för goda gåvor lön.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Þat hefr eik,
er af annarri skefr,
of sik er hverr í slíku.
Hvat vanntu þá meðan Þórr?"$txt$, $txt$»Den ena eken får,
vad av den andra den skaver,
sig själv sköter envar om.
Vad tog du dig till medan dess, Tor?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$"Ek var austr
ok jötna barðak
brúðir bölvísar,
er til bjargs gengu;
mikil myndi ætt jötna,
ef allir lifði
vætr myndi manna
undir Miðgarði.
Hvat vanntu þá meðan, Hárbarðr?"$txt$, $txt$»Jag var i öster
och ihjälslog jättars
ondskefulla brudar,
som till berget gingo.
Jättars ätt vore stor,
om alla levde,
inga människor skulle
inom Midgård dväljas.
Vad tog du dig till medan dess, Harbard?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$"Var ek á Vallandi
ok vígum fylgdak,
atta ek jöfrum,
en aldri sættak;
Óðinn á jarla,
þá er í val falla,
en Þórr á þrælakyn."$txt$, $txt$»Jag var i Valland
och i vapenskiften deltog,
jag hetsade furstar,
men fred ej mäklade.
Oden får jarlar,
som hjältemodigt falla,
med Tor får trälars släkt.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Ójafnt skipta
er þú myndir með ásum liði,
ef þú ættir vilgi mikils vald."$txt$, $txt$»Ojämnt du skulle skifta
mellan asarne folket,
om du mäktade så mycket.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Þórr á afl ærit,
en ekki hjarta;
af hræðslu ok hugbleyði
þér var í hanzka troðit,
ok þóttisk-a þú þá Þórr vera;
hvárki þú þá þorðir
fyr hræðslu þinni
hnjósa né físa,
svá at Fjalarr heyrði."$txt$, $txt$»Tor har jättelik styrka
men intet hjärta i bröstet;
av rädsla och skrämsel
du skvatt in i handsken,
och tycktes du då Tor ej vara.
Du tordes varken,
betagen av fruktan,
fnysa eller nysa,
så att Fjalar hörde.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$"Hárbarðr inn ragi,
ek mynda þik í hel drepa,
ef ek mætta seilask um sund."$txt$, $txt$»Harbard, din svinpäls!
Jag sloge dig ihjäl,
om jag nådde dig nu över sundet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Hvat skyldir um sund seilask,
er sakir ro alls engar?
Hvat vanntu þá, Þórr?"$txt$, $txt$»Varför nå mig över sundet,
då sak ej finnes.
Vad tog du dig till, då, Tor?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Ek var austr
ok ána varðak,
þá er mik sóttu
þeir Svárangs synir;
grjóti þeir mik börðu,
gagni urðu þeir þó lítt fegnir,
þó urðu þeir mik fyrri
friðar at biðja.
Hvat vanntu þá meðan, Hárbarðr?"$txt$, $txt$»Jag var österut
och ån värjde,
när Svarangs söner
satte mig an;
sten de på mig slungade,
åt seger föga gladdes,
ty de måste först
om fred mig bedja.
Vad tog du dig till medan dess, Harbard?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$"Ek var austr
ok við einhverja dæmðak,
lék ek við ina línhvítu
ok launþing háðak;
gladdak ina gullbjörtu,
gamni mær unði."$txt$, $txt$»Jag var österut,
med älskarinna jag pratade,
lekte med den linvita
och lönligt möte hade,
gladde den guldbjärta,
som gamman mig unnade.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$"Góð átt þú þér mankynni þar þá."$txt$, $txt$»Bra kvinnfolk ni kom till där.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$"Liðs þíns
væra ek þá þurfi, Þórr,
at ek helda þeiri inni línhvítu mey."$txt$, $txt$»Jag behövde din hjälp, Tor,
att behålla den linvita mö.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$"Ek munda þér þá þat veita,
ef ek viðr of kæmumk."$txt$, $txt$»Jag skulle dig den lämna,
om det lämpade sig.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$"Ek mynda þér þá trúa,
nema þú mik í tryggð véltir."$txt$, $txt$»Jag lita på dig skulle,
om du ej lurade mig.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$"Emk-at ek sá hælbítr
sem húðskór forn á vár."$txt$, $txt$»Ej biter jag dig bakifrån,
som brukad sko om våren.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$"Hvat vanntu þá meðan, Þórr?"$txt$, $txt$»Vad tog du dig till medan dess, Tor?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$"Brúðir berserkja
barðak í Hléseyju;
þær höfðu verst unnit,
vélta þjóð alla."$txt$, $txt$»Berserkars brudar
jag bultade på Lässö;
det värsta de förskyllat,
villat hela folket.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$"Klæki vanntu þá, Þórr,
er þú á konum barðir."$txt$, $txt$»Neslig sak det var, Tor,
då du slogs med kvinnor.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$"Vargynjur þat váru,
en varla konur,
skelldu skip mitt,
er ek skorðat hafðak,
ægðu mér járnlurki
en eltu Þjalfa.
Hvat vanntu meðan, Hárbarðr?"$txt$, $txt$»Vargkvinnor de voro
men visst icke kvinnor;
de stötte kull min farkost,
som jag stöttat hade,
hotade mig med järnklubba
och jagade Tjalve.
Vad tog du dig till medan dess, Harbard?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$"Ek vark í hernum,
er hingat gerðisk
gnæfa gunnfana,
geir at rjóða."$txt$, $txt$»Jag var i hären,
som hit lät sina
fanor fladdra
och färga spjut röda.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$"Þess viltu nú geta,
er þú fórt oss óljúfan at bjóða."$txt$, $txt$»Det vill du nämna,
att du kom att oss olust bereda.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$"Bæta skal þér þat þá
munda baugi,
sem jafnendr unnu,
þeir er okkr vilja sætta."$txt$, $txt$»Det skall jag dig böta
med buktig armring,
som de skiljemän sagt,
som skötte vår förlikning.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$"Hvar namtu þessi
in hnæfiligu orð,$txt$, $txt$»Var hämtade du dessa
så hånande ord,
att jag aldrig hörde
mera hånande.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$"Nam ek at mönnum
þeim inum aldrænum,
er búa í heimis skógum."$txt$, $txt$»Dem har jag av de gamla
gubbar lärt,
som bo i hemmets högar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$"Þó gefr þú gott nafn dysjum,
er þú kallar þær heimis skóga."$txt$, $txt$»Ett gott namn dock
gav du stendösar,
då du kallar dem hemmets högar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$"Svá dæmi ek of slíkt far."$txt$, $txt$»Om slik sak
så jag dömer.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$"Orðkringi þín
mun þér illa koma,
ef ek ræð á vág at vaða;
ulfi hæra
hygg ek þik æpa munu,
ef þú hlýtr af hamri högg."$txt$, $txt$»Din munvighet
dig mindre väl bekommer,
om jag tar och vadar över vägen;
värre än vargen
du vråla skall,
om du får av hammaren hugg.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$"Sif á hó heima,
hans muntu fund vilja,
þann muntu þrek drýgja,
þat er þér skyldara."$txt$, $txt$»Siv har en älskare hemma,
honom vill du nog träffa;
det storverket vill du öva,
större skäl har du därtill.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$"Mælir þú at munns ráði,
svá at mér skyldi verst þykkja,
halr inn hugblauði,
hygg ek, at þú ljúgir."$txt$, $txt$»Vad i munnen dig kommer, du talar,
för att mig det värsta må tyckas.
Din fega fähund,
för mig du ljuger.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$"Satt hygg ek mik segja;
seinn ertu at för þinni,
langt myndir þú nú kominn, Þórr,
ef þú litum færir."$txt$, $txt$»Sant jag tror mig säga,
sen är du på din resa;
långt du vore kommen, Tor,
om i lånad hamn du farit.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$"Hárbarðr inn ragi,
heldr hefr þú nú mik dvalðan."$txt$, $txt$»Harbard, din hare,
du hindrat mig mycket.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 52, $txt$"Ása-þórs hugða ek
aldregi mundu
glepja féhirði farar."$txt$, $txt$»För Asa-Tor tänkte jag,
att aldrig skulle
en fäherde färden hindra.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=52);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 53, $txt$"Ráð mun ek þér nú ráða;
ró þú hingat bátinum,
hættum hætingi,
hittu föður Magna."$txt$, $txt$»Ett råd skall jag dig råda,
ro du hit med båten;
låt oss mer ej munhuggas,
kom till Magnes fader!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=53);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 54, $txt$"Farðu firr sundi,
þér skal fars synja."$txt$, $txt$»Far från sundet fjärran,
förrän jag dig nekar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=54);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 55, $txt$"Vísa þú mér nú leiðina,
alls þú vill mik eigi um váginn ferja."$txt$, $txt$»Visa mig då vägen,
när över vågen du vill mig ej färja!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=55);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 56, $txt$Lítit er at synja,
langt er at fara;
stund er til stokksins,
önnur til steinsins,
haltu svá til vinstra vegsins,
unz þú hittir Verland;
þar mun Fjörgyn
hitta Þór, son sinn,
ok mun hon kenna hánum áttunga brautir
til Óðins landa."$txt$, $txt$»För litet är det att neka,
långt det är att fara:
en stund det är till stocken,
en annan till stenen,
håll så vägen till vänster,
tills till Verland du kommer;
där träffar Fjorgyn
Tor, sin son,
och skall lära vägen åt ättlingen
till Odens länder.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=56);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 57, $txt$"Mun ek taka þangat í dag?"$txt$, $txt$»Skall dit idag jag hinna?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=57);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 58, $txt$"Taka við víl ok erfiði,
at upprennandi sólu,
er ek get þána."$txt$, $txt$»Hinna med slit och möda.
Snön nog smälter,
då solen stiger.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=58);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 59, $txt$"Skammt mun nú mál okkat,
alls þú mér skætingu einni svarar;
launa mun ek þér farsynjun,
ef vit finnumk í sinn annat."$txt$, $txt$»Kort blir vårt samtal,
då med smädelse blott du svarar;
att du med färjan mig vägrat,
skall du få för, när vi träffas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=59);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 60, $txt$"Far þú nú,
þars þik hafi allan gramir."$txt$, $txt$»Traska du i väg,
dit där trollen dig tage!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Harbard$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=60);

-- ===== Loketrätan  (Lokasenna) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Segðu þat, Eldir,
svá at þú einugi
feti gangir framar,
hvat hér inni
hafa at ölmálum
sigtíva synir."$txt$, $txt$»Säg du mig, Elder,
utan att ett enda
steg du framåt stiger,
varom här inne
vid ölet tala
segergudarnes söner.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Of vápn sín dæma
ok um vígrisni sína
sigtíva synir;
ása ok alfa
er hér inni eru,
manngi er þér í orði vinr."$txt$, $txt$»Om vapen tala
och sin visade mandom
segergudarnes söner;
av asar och alfer,
som här inne äro,
ingen i ord är din vän.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Inn skal ganga
Ægis hallir í
á þat sumbl at sjá;
jöll ok áfu
færi ek ása sonum,
ok blend ek þeim svá meini mjöð."$txt$, $txt$»In skall jag gå
i Ägers sal
att akt på gillet ge;
ondska och ilska
för jag åt asars söner
och blandar dem så men i mjödet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Veiztu, ef þú inn gengr
Ægis hallir í
á þat sumbl at sjá,
hrópi ok rógi
ef þú eyss á holl regin,
á þér munu þau þerra þat."$txt$, $txt$»Vet du, om du in går
i Ägers sal
att akt på det gillet ge;
om skällsord på gudar
och skymf du öser,
torka de nog det på dig.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Veiztu þat, Eldir,
ef vit einir skulum
sáryrðum sakask,
auðigr verða
mun ek í andsvörum,
ef þú mælir til margt."$txt$, $txt$»Vet du, Elder,
om vi två skola
strida med stickande ord;
svår jag skall
i svar bliva,
om för mycket du säger emot.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$"Þyrstr ek kom
þessar hallar til,
Loftr, um langan veg
ásu at biðja,
at mér einn gefi
mæran drykk mjaðar.$txt$, $txt$»Törstig jag hit
till hallen kom,
Lopt, från långan väg
att asarne bedja,
det en de mig giva
dråplig dryck av mjöd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Hví þegið ér svá,
þrungin goð,
at þér mæla né meguð?
Sessa ok staði
velið mér sumbli at
eða heitið mik heðan."$txt$, $txt$Vi tigen I så,
I trumpna gudar,
att målet ni mistat ha?
Visen mig sittplats
att vara på vid gillet
eller på dörren mig driven!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Sessa ok staði
velja þér sumbli at
æsir aldregi,
því at æsir vitu,
hveim þeir alda skulu
gambansumbl of geta."$txt$, $txt$»Visa dig sittplats
att vara på vid gillet
asarne aldrig göra,
ty asarne veta
åt ''vad'' folk de skola
ypperligt gille giva.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$"Mantu þat, Óðinn,
er vit í árdaga
blendum blóði saman?
Ölvi bergja
lézktu eigi mundu,
nema okkr væri báðum borit."$txt$, $txt$»Minns du, Oden,
när vi i urtiden
blandade blod tillsamman;
öl smaka
du sade dig ej skola,
om det ej åt oss båda bures.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Rístu þá, Viðarr,
ok lát ulfs föður
sitja sumbli at,
síðr oss Loki
kveði lastastöfum
Ægis höllu í."$txt$, $txt$»Res dig då, Vidar,
och låt vargens fader
sitta i vårt samkväm,
på det att ej Loke
oss lasta må
här i Ägers hall.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Heilir æsir,
heilar ásynjur
ok öll ginnheilög goð -
nema sá einn áss
er innar sitr,
Bragi, bekkjum á."$txt$, $txt$»Hell eder, asar!
Hell, asynjor!
Hell, alla heliga gudar!
Blott den asagud icke,
som inåt sitter
på bänken, nämligen Brage!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"Mar ok mæki
gef ek þér míns féar,
ok bætir þér svá baugi Bragi,
síðr þú ásum
öfund of gjaldir,
grem þú eigi goð at þér."$txt$, $txt$»Häst och svärd
av mina håvor jag dig giver,
och så bötar dig ock Brage en ring,
på det du ej asarne
elakhet visar.
Gör gudarne ej dig gramse!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$"Jós ok armbauga
mundu æ vera
beggja vanr, Bragi;
ása ok alfa,
er hér inni eru,
þú ert við víg varastr
ok skjarrastr við skot."$txt$, $txt$»Häst och armringar,
du alltid skall
båda sakna, Brage;
av asar och alfer,
som här inne äro,
är du i fejd fegast
och för skott skrämdast.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$"Veit ek, ef fyr útan værak,
svá sem fyr innan emk,
Ægis höll of kominn,
höfuð þitt
bæra ek í hendi mér;
lykak þér þat fyr lygi."$txt$, $txt$»Vore jag utanför,
som nu inne jag är
uti Ägers sal,
ditt huvud jag bure
i handen på mig;
litet det vore för din lögn.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$"Snjallr ertu í sessi,
skal-at-tu svá gera,
Bragi bekkskrautuðr;
vega þú gakk,
ef þú vreiðr séir;
hyggsk vætr hvatr fyrir."$txt$, $txt$»Dristig är du, där du sitter,
du dylikt ej skall göra,
du Brage, som på bänken prålar.
Till vapen grip,
om vred du är!
Den tappre sig icke betänker.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$"Bið ek þik, Bragi,
barna sifjar duga
ok allra óskmaga,
at þú Loka
kveðir-a lastastöfum
Ægis höllu í."$txt$, $txt$»Jag beder dig, Brage,
vid barnen våra,
egna och upptagna,
att till Loke du ej talar
lastande ord
här i Ägers hall.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$"Þegi þú, Iðunn,
þik kveð ek allra kvenna
vergjarnasta vera,
síztu arma þína
lagðir ítrþvegna
um þinn bróðurbana."$txt$, $txt$»Tig du, Idun»
Av alla kvinnor
jag menar dig mangalnast vara,
sen du lade dina armar,
lysande tvagna,
kring din broders baneman.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Loka ek kveðk-a
lastastöfum
Ægis höllu í:
Braga ek kyrri
bjórreifan;
vilk-at ek, at it vreiðir vegizk."$txt$, $txt$»Till Loke jag ej talar
lastande ord
här i Ägers hall.
Brage jag lugnar,
som är lustig av ölet.
Jag vill ej, att vreda ni kämpa.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Hví it æsir tveir
skuluð inni hér
sáryrðum sakask?
Loftki þat veit,
at hann leikinn er
ok hann fjörg öll fía."$txt$, $txt$»Varför skolen I två asar inne här
strida med stickande ord?
Loke vet, att gyckel
liknar Brage
och allt levande vill honom väl.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Þegi þú, Gefjun,
þess mun ek nú geta,
er þik glapði at geði
sveinn inn hvíti,
er þér sigli gaf
ok þú lagðir lær yfir."$txt$, $txt$»Tig du, Gevjon!
Nu talar jag om,
huru ditt hjärta den ljuse
svennen besvek,
som dig smycke gav
och som dig famna fick.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Ærr ertu, Loki,
ok örviti,
er þú fær þér Gefjun at gremi,
því at aldar örlög
hygg ek, at hon öll of viti
jafngörla sem ek."$txt$, $txt$»Tokig är du, Loke,
och har tappat förståndet
då du Gevjon gramse dig gör,
ty världens öden
vet hon alla
och skönjer så väl som jag själv.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Þegi þú, Óðinn,
þú kunnir aldregi
deila víg með verum;
oft þú gaft,
þeim er þú gefa skyldir-a,
inum slævurum sigr."$txt$, $txt$»Tig du, Oden!
Aldrig du rätt
kunde dela lyckan i drabbning;
ofta skänkte du den,
som du skänka ej skulle,
den sämre nämligen, seger.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$"Veiztu, ef ek gaf,
þeim er ek gefa né skylda,
inum slævurum, sigr,
átta vetr
vartu fyr jörð neðan,$txt$, $txt$»Vet du, skänkte jag den,
som jag skänka ej skulle,
den sämre nämligen, seger,
åtta vintrar var du
under jorden
kor mjölkande och kvinna;
där barn du till världen bringat,
det för skamlig omanlighet skattas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$"En þik síða kóðu
Sámseyu í,
ok draptu á vétt sem völur;
vitka líki
fórtu verþjóð yfir,
ok hugða ek þat args aðal."$txt$, $txt$»Också sejd man sade dig
öva på Samsö,
du valors vidskepelse brukte;
i gestalt av trollkarl
du strövade kring världen;
det för skamlig omanlighet skattas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Örlögum ykkrum
skylið aldregi
segja seggjum frá,
hvat it æsir tveir
drýgðuð í árdaga;
firrisk æ forn rök firar."$txt$, $txt$»Edra öden
skolen I aldrig
nämna om för någon,
vad ni båda asar
i urtiden gjorde;
det forna förblive folk fjärran!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Þegi þú, Frigg,
þú ert Fjörgyns mær
ok hefr æ vergjörn verit,
er þá Véa ok Vilja
léztu þér, Viðris kvæn,
báða i baðm of tekit."$txt$, $txt$»Tig du, Frigg!
Du är Fjorgyns mö,
och mangalen mycket du varit;
Vee och Vile
lät du, Vidrers hustru,
båda två dig taga i famn.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$"Veiztu, ef ek inni ættak
Ægis höllum i
Baldri líkan bur,
út þú né kvæmir
frá ása sonum,
ok væri þá at þér vreiðum vegit."$txt$, $txt$»Vet, om här inne
i Ägers sal
jag hade son av Balders sinne,
ut du ej komme
från asarnes söner,
slag dig i vrede sloges.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Enn vill þú, Frigg,
at ek fleiri telja
mína meinstafi:
ek því réð,
er þú ríða sér-at
síðan Baldr at sölum."$txt$, $txt$»Än mer vill du, Frigg,
att jag meddelar dig
av obehagliga ämnen!
Jag rår därför,
att du rida ej ser
Balder sedan till salen.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Ærr ertu, Loki,
er þú yðra telr
ljóta leiðstafi;
örlög Frigg,
hygg ek, at öll viti,
þótt hon sjalfgi segi."$txt$, $txt$»Tokig är du, Loke,
då du förtäljer
edra nedrigheter öppet;
alla framtidens öden
tror jag Frigg veta,
änskönt hon dem själv ej säger.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$"Þegi þú, Freyja,
þik kann ek fullgörva,
er-a þér vamma vant:
ása ok alfa,
er hér inni eru,
hverr hefir þinn hór verit."$txt$, $txt$»Tig du, Freja;
Dig till fullo jag känner;
du vanära visst icke saknar;
de asar och alfer,
som här inne äro,
ha alla dina älskare varit.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$"Flá er þér tunga,
hygg ek, at þér fremr myni
ógótt of gala;
reiðir ro þér æsir
ok ásynjur,
hryggr muntu heim fara."$txt$, $txt$»Falsk är din tunga;
framdeles, tror jag,
skall den dig ådraga ofärd;
vreda äro dig asar,
så ock asynjor,
med bedrövelse hem du skall draga.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$"Þegi þú, Freyja,
þú ert fordæða
ok meini blandin mjök,
síz þik at bræðr þínum
stóðu blíð regin
ok myndir þú þá, Freyja, frata."$txt$, $txt$»Tig du, Freja!
En trollpacka är du
och mängd med mycket men,
sedan blida makter
med din broder dig beträdde,
och fult skämde, Freja, du dig ut.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$"Þat er válítit,
þótt sér varðir
vers fái, hós eða hvárs;$txt$, $txt$»Föga det gör,
om fruntimmer sig
äkta män eller älskare skaffa;
men ett under det är,
att en omanlig as
kommit hit in, som barn har burit.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$"Þegi þú, Njörðr,
þú vart austr heðan
gíls of sendr at goðum;
Hymis meyjar
höfðu þik at hlandtrogi
ok þér i munn migu."$txt$, $txt$»Tig du, Njord!
Till östlig trakt
du gick som gisslan för gudar.
Hymers mör nyttjade
till nattkärl dig,
med sitt vatten vätte din mun.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$"Sú erumk líkn,
er ek vark langt heðan
gísl of sendr at goðum,
þá ek mög gat,
þann er mangi fíár,
ok þykkir sá ása jaðarr."$txt$, $txt$»Den lisa jag fick,
då jag långt härifrån
som gisslan för gudarne gick;
en son mig föddes,
som fiende ej har,
en ädling bland asar han synes.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$"Hættu nú, Njörðr,
haf þú á hófi þik,
munk-a ek því leyna lengr:
við systur þinni
gaztu slíkan mög,
ok er-a þó vánu verr."$txt$, $txt$»Håll nu, Njord,
och hov visa!
Ej längre det lönligt jag håller:
med syster din
fick du sådan son
och är dock ej värre än vån var.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$"Freyr er beztr
allra ballriða
ása görðum í;
mey hann né grætir
né manns konu
ok leysir ór höftum hvern."$txt$, $txt$»Frej är bäst
bland bålda hjältar
uti gudars gårdar;
mö han ej grämer
eller mans hustru
och löser ur länkar envar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$"Þegi þú, Týr,
þú kunnir aldregi
bera tilt með tveim;
handar innar hægri
mun ek hinnar geta,
er þér sleit Fenrir frá."$txt$, $txt$»Tig du, Tyr!
Två du kunde
aldrig att ena sig bringa.
Högra handen,
henne vill jag nämna,
som Fenrer ifrån dig slet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$"Handar em ek vanr,
en þú hróðrsvitnis,
böl er beggja þrá;
ulfgi hefir ok vel,
er í böndum skal
bíða ragnarökrs."$txt$, $txt$»Handen mig rövats
men Rodvitner dig,
oss båda vållar saknaden sorg.
Ej heller ulven har det bra,
som bunden skall
i bojor ragnarök bida.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$"Þegi þú, Týr,
þat varð þinni konu,
at hon átti mög við mér;
öln né penning
hafðir þú þess aldregi
vanréttis, vesall."$txt$, $txt$»Tig du, Tyr!
Min tillfälligtvis
var den son, som din hustru hade;
aldrig du fick
en aln eller penning
för oförrätten, din usling!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$"Ulfr sé ek liggja
árósi fyrir,
unz rjúfask regin;
því mundu næst,
nema þú nú þegir,
bundinn, bölvasmiðr."$txt$, $txt$»Ulven ser jag ligga
framför åns mynning,
tills makternas samband slites.
Tiger du ej,
du torde bredvid
fjättras, du fiende lede!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$"Gulli keypta
léztu Gymis dóttur
ok seldir þitt svá sverð;
en er Múspells synir
ríða Myrkvið yfir,
veizt-a þú þá, vesall, hvé þú vegr."$txt$, $txt$»Med guld du köpte dig
Gymers dotter
och sålde så ditt svärd,
men när Muspells söner
över Mörkskog rida,
vad vapen värjer dig då, usling?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$"Veiztu, ef ek eðli ættak
sem Ingunar-Freyr
ok svá sælligt setr,
mergi smæra
mölða ek þá meinkráku
ok lemða alla í liðu."$txt$, $txt$»Om jag anor ägde
som Ingunar-Frej
och bebodde så ståtligt ställe,
till mindre än märg
jag malde dig, olycksfågel,
och lamsloge alla dina lemmar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$"Hvat er þat it litla
er ek þat löggra sék
ok snapvíst snapir?
At eyrum Freys
mundu æ vera
ok und kvernum klaka."$txt$, $txt$»Vad är det för en varelse,
som vifta jag ser
och sniket snappa?
Vid Frejs öron
du alltid torde vara
och under kvarnarna kraxa.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$"Byggvir ek heiti,
en mik bráðan kveða
goð öll ok gumar;
því em ek hér hróðugr,
at drekka Hrofts megir
allir öl saman."$txt$, $txt$»Böggver jag heter,
men hetsig mig vara
gudar och människor mena.
Här jag därav rosas,
att Ropts söner
alla dricka öl tillsammans.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$"Þegi þú, Byggvir,
þú kunnir aldregi
deila með mönnum mat,
ok þik í flets strái
finna né máttu,
þá er vágu verar."$txt$, $txt$»Tig du, Byggver»
Bra du ej kunde
skifta bland männen mat,
och i bänkplatsens halm
man dig hitta ej kunde,
när män i vapenskifte möttes.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$"Ölr ertu, Loki,
svá at þú ert örviti,
- hví né lezk-a-ðu, Loki? -
því at ofdrykkja
veldr alda hveim,
er sína mælgi né man-at."$txt$, $txt$»Rusig är du, Loke,
rent från vettet;
vi låter du ej hejda dig, Loke;
ty dryckenskap
driver envar
att ej tänka på vad han talar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$"Þegi þú, Heimdallr,
þér var í árdaga
it ljóta líf of lagit;
örgu baki
þú munt æ vera
ok vaka vörðr goða."$txt$, $txt$»Tig du, Heimdall!
Tidigt blev dig
ett ledsamt liv bestämt:
rak skall du alltid
i ryggen vara
och som gudars väktare vaka.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$"Létt er þér, Loki;
mun-at-tu lengi svá
leika lausum hala,
því at þik á hjörvi
skulu ins hrímkalda magar
görnum binda goð."$txt$, $txt$»Lätt till mods är du, Loke!
Länge skall du ej så
springa lös och ledig;
ty på kantig klippa
med kalle sonens tarmar
skola gramse gudar dig binda.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$"Veiztu, ef mik á hjörvi
skulu ins hrímkalda magar
görnum binda goð,
fyrstr ok efstr
var ek at fjörlagi,
þars vér á Þjaza þrifum."$txt$, $txt$»Om på kantig klippa
med kalle sonens tarmar
gramse gudar mig binda,
så vet, den förste och siste
i fejden jag var,
när Tjatse förlorade livet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$"Veiztu, ef fyrstr ok efstr
vartu at fjörlagi,
þá er ér á Þjaza þrifuð,
frá mínum véum
ok vöngum skulu
þér æ köld ráð koma."$txt$, $txt$»Om den förste och siste
i fejden du var,
när Tjatse förlorade livet,
så vet, från min helgedom
och heliga fält
för dig skola kalla råd komma.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 52, $txt$"Léttari í málum
vartu við Laufeyjar son,
þá er þú létz mér á beð þinn boðit;
getit verðr oss slíks,
ef vér görva skulum
telja vömmin vár."$txt$, $txt$»Lättare i målet
mot Lauveys son du var,
då du bjöd mig in till din bädd;
nämnas får slikt,
om vi noga skola
uppräkna alla våra fel.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=52);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 53, $txt$"Heill ver þú nú, Loki,
ok tak við hrímkálki
fullum forns mjaðar,
heldr þú hana eina
látir með ása sonum
vammalausa vera."$txt$, $txt$»Hell dig, Loke!
Här får du bägarn,
full med flerårigt mjöd,
på det du ensamt mig
bland asars söner
låter fri från fel vara.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=53);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 54, $txt$"Ein þú værir,
ef þú svá værir,
vör ok gröm at veri;
einn ek veit,
svá at ek vita þykkjumk,
hór ok af Hlórriða,
ok var þat sá inn lævísi Loki."$txt$, $txt$»Ensam du vore,
om du så vore,
aktsam och ärbar mot maken;
en jag vet
och med visshet känner,
som har Lorrides hustru förlett,
och det var den lömske Loke.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=54);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 55, $txt$"Fjöll öll skjalfa;
hygg ek á för vera
heiman Hlórriða;
han ræðr ró,
þeim er rægir hér
goð öll ok guma."$txt$, $txt$»Fjällen alla darra,
nu drager, tror jag,
hemifrån Lorride hit.
Han tysta skall
den som här tillmälen ger
och grovt människor och gudar beskyller.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=55);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 56, $txt$"Þegi þú, Beyla,
þú ert Byggvis kvæn
ok meini blandinn mjök,
ókynjan meira
kom-a med ása sonum;
öll ertu, deigja, dritin."$txt$, $txt$»Tig du, Beyla!
Du är Byggvers hustru
och mängd med mycket men;
ett värre utskum
kom ej bland asars söner;
smörjig är du, deja, och smetig.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=56);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 57, $txt$"Þegi þú, rög vættr,
þér skal minn þrúðhamarr,
Mjöllnir, mál fyrnema;
herðaklett
drep ek þér halsi af,
ok verðr þá þínu fjörvi of farit."$txt$, $txt$»Tig, ditt kräk!
Dig skall min krafthammar,
Mjollner, målet betaga;
ditt huvud slår jag
av halsen på dig
och så blir det slut med ditt liv.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=57);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 58, $txt$"Jarðar burr
er hér nú inn kominn,
hví þrasir þú svá, Þórr?
En þá þorir þú ekki,
er þú skalt við ulfinn vega,
ok svelgr hann allan Sigföður."$txt$, $txt$»Jordens son
in i salen nu kommit;
vi väsnas du så väldigt, Tor?
Då vågar du icke,
när med vargen du skall kämpa
och han slukar Segerfader hel.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=58);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 59, $txt$"Þegi þú, rög vættr,
þér skal minn þrúðhamarr,
Mjöllnir, mál fyrnema;
upp ek þér verp
ok á austrvega,
síðan þik manngi sér."$txt$, $txt$»Tig, ditt kräk!
Dig skall min krafthammar,
Mjollner, målet betaga.
Upp jag dig slungar
och i österled;
sedan dig ingen ser.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=59);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 60, $txt$"Austrförum þínum
skaltu aldregi
segja seggjum frá,
síz í hanska þumlungi
hnúkðir þú einheri,
ok þóttisk-a þú þá Þórr vera."$txt$, $txt$»Om österfärderna dina
aldrig du skall
säga människor mycket,
sedan i handskens tumme
ihop du kröp, kämpe,
och tycktes du då Tor ej vara.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=60);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 61, $txt$"Þegi þú, rög vættr,
þér skal minn þrúðhamarr,
Mjöllnir, mál fyrnema;
hendi inni hægri
drep ek þik Hrungnis bana,
svá at þér brotnar beina hvat."$txt$, $txt$Tig, ditt kräk!
Dig skall min krafthammar,
Mjollner, målet betaga.
Min högra hand dig slår
med hammarn, som drap Rungner,
så att i dig vart ben blir bräckt.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=61);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 62, $txt$"Lifa ætla ek mér
langan aldr,
þóttú hætir hamri mér;
skarpar álar
þóttu þér Skrýmis vera,
ok máttir-a þú þá nesti ná,
ok svalzt þú þá hungri heill."$txt$, $txt$»Ett långt liv
leva jag hoppas,
fast du mig med hammaren hotar.
Skarpskrumpna remmar
tycktes dig Skrymers vara,
du mäktade ej matsäcken öppna,
höll på att svälta ihjäl, fastän sund.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=62);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 63, $txt$"Þegi þú, rög vættr,
þér skal minn þrúðhamarr,
Mjöllnir, mál fyrnema;
Hrungnis bani
mun þér í hel koma
fyr nágrindr neðan."$txt$, $txt$»Tig, ditt kräk!
Dig skall min krafthammar,
Mjollner, målet betaga.
Rungners dråpare
skall dig till dödsriket skicka
långt under likgrinden ned.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=63);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 64, $txt$"Kvað ek fyr ásum,
kvað ek fyr ása sonum,
þats mik hvatti hugr,
en fyr þér einum
mun ek út ganga,
því at ek veit, at þú vegr.$txt$, $txt$»Jag sade inför asar,
och inför asars söner
det, vartill lusten mig lockat;
men ensamt för dig
skall ut jag gå,
ty jag vet, att du slår till slut.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=64);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 65, $txt$Öl gerðir þú, Ægir,
en þú aldri munt
síðan sumbl of gera;
eiga þín öll,
er hér inni er,
leiki yfir logi,
ok brenni þér á baki."$txt$, $txt$Ölgille gjorde du, Äger,
men aldrig du skall
mera gästabud göra;
all din egendom,
som här inne är,
må lågan leka över
och bränna dig bak på ryggen!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Loketrätan$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=65);

-- ===== Kvädet om Trym  (Þrymskviða) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Vreiðr var þá Vingþórr
er hann vaknaði
ok síns hamars
of saknaði,
skegg nam at hrista,
skör nam at dýja,
réð Jarðar burr
um at þreifask.$txt$, $txt$Vred var Ving-Tor,
när han vaknade,
och sin hammare
han saknade;
han riste på sitt skägg,
han ruskade sitt hår;
Jordens son
satt och trevade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Ok hann þat orða
alls fyrst of kvað:
"Heyrðu nú, Loki,
hvat ek nú mæli
er eigi veit
jarðar hvergi
né upphimins:
áss er stolinn hamri!"$txt$, $txt$Det första ord,
han fällde, var detta:
»Hör nu, Loke,
vad här jag säger,
som ingen vet
vare sig på jorden
eller i höga himlen:
hammarn från asaguden stulits.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Gengu þeir fagra
Freyju túna,
ok hann þat orða
alls fyrst of kvað:
"Muntu mér, Freyja,
fjaðrhams léa,
ef ek minn hamar
mættak hitta?".$txt$, $txt$De gingo till Frejas
fagra gårdar,
och det första ord,
han fällde, var detta:
»Vill du mig, Freja,
din fjäderhamn låna,
om jag min hammare
hitta kunde?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Þó munda ek gefa þér
þótt ór gulli væri,
ok þó selja,
at væri ór silfri."$txt$, $txt$»Jag gåve den dig ock,
fast av guld den vore,
satte i din hand,
fast den vore av silver.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Fló þá Loki,
- fjaðrhamr dunði, -
unz fyr útan kom
ása garða
ok fyr innan kom
jötna heima.$txt$, $txt$Loke flög då,
fjäderhamnen ven,
tills han kom utanför
asars gårdar
och jagade in
i jättars bygder.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Þrymr sat á haugi,
þursa dróttinn,
greyjum sínum
gullbönd sneri
ok mörum sínum
mön jafnaði.$txt$, $txt$Trym satt å högen,
tursadrotten,
snodde tränsar av guld
åt tikarna sina
och manen jämnade
på manken av hästarna.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$"Hvat er með ásum?
Hvat er með alfum?
Hví ertu einn kominn
í Jötunheima?"$txt$, $txt$»Hur är det med asar?
Hur är det med alfer?
Vi har ensam du givit dig
in i jättebygderna?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Ek hef Hlórriða.
hamar of folginn
átta röstum
fyr jörð neðan;
hann engi maðr
aftr of heimtir,
nema færi mér
Freyju at kvæn."$txt$, $txt$»Jag håller Lorrides
hammare gömd
åtta mil
under jorden.
Ingen densamma
återhämtar,
om ej Freja till mig
han för som hustru.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Fló þá Loki,
- fjaðrhamr dunði, -
unz fyr útan kom
jötna heima
ok fyr innan kom
ása garða.
Mætti hann Þór
miðra garða,
ok þat hann orða
alls fyrst of kvað:$txt$, $txt$Loke då flög,
fjäderhamnen ven,
tills han jagade ut
ur jättarnes bygder
och kom inom
asars gårdar.
Han mötte Tor
mitt på gården,
och det första ord,
han fällde, var detta:$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Hefr þú erendi
sem erfiði?
Segðu á lofti
löng tíðendi,
oft sitjanda
sögur of fallask
ok liggjandi
lygi of bellir."$txt$, $txt$»Har målet du nått,
såsom möda du haft?
Säg i luften
långa tidenden!
Ofta den sittande
sviker minnet,
och den liggande
med lögn kommer.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Hef ek erfiði
ok erendi;
Þrymr hefr þinn hamar,
þursa dróttinn;
hann engi maðr
aftr of heimtir,
nema hánum færi
Freyju at kván.$txt$, $txt$»Målet jag nått
och möda jag haft.
Trym har din hammare,
tursarnes drott.
Ingen densamma
återhämtar,
om ej Freja till honom
han för som hustru.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Ganga þeir fagra
Freyju at hitta,
ok hann þat orða
alls fyrst of kvað:
"Bittu þik, Freyja,
brúðar líni;
vit skulum aka tvau
í Jötunheima."$txt$, $txt$De gå att den fagra
Freja träffa,
och det första ord,
han fällde, var detta:
»Bind dig, Freja,
i brudelin;
vi två skola åka
till tursarnes värld.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Reið varð þá Freyja
ok fnasaði,
allr ása salr
undir bifðisk,
stökk þat it mikla
men Brísinga:
"Mik veiztu verða
vergjarnasta,
ef ek ek með þér
í Jötunheima."$txt$, $txt$Vred vart då Freja
och fnyste av harm;
hela asasalen
under henne skalv,
och brisingasmycket
brast ifrån halsen:
»Den mangalnaste
månde jag vara,
om jag med dig åker
till jättarnes bygder.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Senn váru æsir
allir á þingi
ok ásynjur
allar á máli,
ok um þat réðu
ríkir tívar
hvé þeir Hlórriða
hamar of sætti.$txt$, $txt$Tillsammans voro alla
asar på tinget
och asynjorna alla
att överlägga,
och mycket rådslogo
mäktiga gudar,
huru Lorrides hammare
de hämta skulle.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Þá kvað þat Heimdallr,
hvítastr ása,
vissi hann vel fram
sem vanir aðrir:
"Bindum vér Þór þá
brúðar líni,
hafi hann it mikla
men Brísinga.$txt$, $txt$Då yttrade Heimdall,
av asar den vitaste, -
han visste väl framtiden
som vanerna annars -:
»Bindom på Tor då
brudelin;
bäre han det stora
brisingasmycket!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Látum und hánum
hrynja lukla
ok kvenváðir
um kné falla,
en á brjósti
breiða steina
ok hagliga
um höfuð typpum."$txt$, $txt$Ned från midjan
låtom nycklar skramla
och kvinnokläder
kring hans knän falla,
och på bröstet
breda stenar,
och händigt vi skola
hans huvud pryda.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Þá kvað þat Þór,
þrúðugr áss:
"Mik munu æsir
argan kalla,
ef ek bindask læt
brúðar líni!"$txt$, $txt$Då yttrade Tor,
asen den starke:
»Mig skola asarne
omanlig kalla,
om mig binda jag lät
i brudelin.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Þá kvað þat Loki
Laufeyjar sonr:
"Þegi þú, Þórr,
þeira orða.
Þegar munu jötnar
Ásgarð búa,
nema þú þinn hamar
þér of heimtir."$txt$, $txt$Då sade Loke,
Lauveys son:
»Tig du, Tor,
med detta tal!
Snart skola jättar
gästa i Asgård,
om dig din hammare
du hämtar ej åter.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Bundu þeir Þór þá
brúðar líni
ok inu mikla
meni Brísinga,
létu und hánum
hrynja lukla
ok kvenváðir
um kné falla,
en á brjósti
breiða steina,
ok hagliga
um höfuð typpðu.$txt$, $txt$De bundo på Tor då
brudelin
och det bålstora
brisingasmycket,
läto ned från midjan
nycklar skramla
och kvinnokläder
kring knäna falla,
men på bröstet de satte
breda stenar
och händigt de
hans huvud prydde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Þá kvað Loki
Laufeyjar sonr:
"Mun ek ok með þér
ambótt vera,
vit skulum aka tvær
í Jötunheima."$txt$, $txt$Då sade Loke,
Lauveys son:
»Jag skall som tärna
träda i din tjänst;
vi två skola åka
till tursarnes värld.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Senn váru hafrar
heim of reknir,
skyndir at sköklum,
skyldu vel renna;
björg brotnuðu,
brann jörð loga,
ók Óðins sonr
í Jötunheima.$txt$, $txt$Hemåt blevo bockarne
båda drivna,
spända i skacklar,
springa de skulle.
Bergen brusto,
brann jorden i lågor;
till Jotunheim åkte
Odens son.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Þá kvað þat Þrymr,
þursa dróttinn:
"Standið upp, jötnar,
ok stráið bekki,
nú færa mér
Freyju at kván
Njarðar dóttur
ór Nóatúnum.$txt$, $txt$Då sade Trym,
tursarnes drott:
»Stån jättar, upp,
strön på bänkarne halm!
Fören nu till mig
Freja som hustru,
Njords dotter
från Noatun!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Ganga hér at garði
gullhyrnðar kýr,
öxn alsvartir
jötni at gamni;
fjölð á ek meiðma,
fjölð á ek menja,
einnar mér Freyju
ávant þykkir."$txt$, $txt$Här gå på gården
guldhornade kor,
helsvarta oxar
till hugnad för jätten;
smycken har jag många,
smiden har jag många
Freja ensam
ägde jag icke.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Var þar at kveldi
of komit snemma
ok fyr jötna
öl fram borit;
einn át oxa,
átta laxa,
krásir allar,
þær er konur skyldu,
drakk Sifjar verr
sáld þrjú mjaðar.$txt$, $txt$Snart till kvällen
det kommet var,
och öl blev buret
på bordet åt jättarne.
Tor ensam åt en oxe,
åtta laxar,
allt läcker, som kvinnorna
bekomma skulle,
Sivs man drack
tre såar öl.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Þá kvat þat Þrymr,
þursa dróttinn:
"Hvar sáttu brúðir
bíta hvassara?
Sák-a ek brúðir
bíta breiðara,
né inn meira mjöð
mey of drekka."$txt$, $txt$Då sade Trym,
tursarnes drott:
»Var såg du brudar
bita vassare?
Jag såg ej brudar
bita bredare
eller mer mjöd
en mö dricka.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Sat in alsnotra
ambótt fyrir,
er orð of fann
við jötuns máli:
"Át vætr Freyja
átta nóttum,
svá var hon óðfús
í Jötunheima."$txt$, $txt$Men den sluga tärnan
satt framför dem
och genmäle hittade
att jätten svara:
»Freja åt intet
på åtta dagar,
så gärna hon ville
till jättarnes bygder.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Laut und línu,
lysti at kyssa,
en hann útan stökk
endlangan sal:
"Hví eru öndótt
augu Freyju?
Þykki mér ór augum
eldr of brenna."$txt$, $txt$Han lutade sig under linklädet,
lysten att kyssa,
men for tillbaka
bort genom salen.
»Vi äro Frejas ögon
så fruktansvärda?
Mig tycktes, att eld
ur ögonen brinner.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Sat in alsnotra
ambótt fyrir,
er orð of fann
við jötuns máli:
"Svaf vætr Freyja
átta nóttum,
svá var hon óðfús
í Jötunheima."$txt$, $txt$Men den sluga tärnan
satt framför dem
och genmäle hittade
att jätten svara:
»Freja sov intet
på åtta nätter,
så gärna hon ville
till jättarnes bygder.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$Inn kom in arma
jötna systir,
hin er brúðféar
biðja þorði:
"Láttu þér af höndum
hringa rauða,
ef þú öðlask vill
ástir mínar,
ástir mínar,
alla hylli.$txt$, $txt$In kom jättarnes
arma syster
och brudgåva
bedja vågade:
»Drag dina röda
ringar av händerna,
om vinna du vill
vänskap av mig,
vänskap av mig
och välvilja all!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Þá kvað þat Þrymr,
þursa dróttinn:
"Berið inn hamar
brúði at vígja,
lekkið Mjöllni
í meyjar kné,
vígið okkr saman
Várar hendi."$txt$, $txt$Då sade Trym,
tursarnes drott:
»Bären hammaren in
bruden att viga!
Läggen Mjollner
i möns knä!
Vigen oss tillsammans
med Vars hand!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Hló Hlórriða
hugr í brjósti,
er harðhugaðr
hamar of þekkði;
Þrym drap hann fyrstan,
þursa dróttin,
ok ætt jötuns
alla lamði.$txt$, $txt$På Lorride hjärtat
log i bröstet,
när, hård till sinnes,
han hammarn varsnade.
Trym först han dräpte,
tursarnes drott,
och all jättens
ätt han lamslog.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Drap hann ina öldnu
jötna systur,
hin er brúðféar
of beðit hafði;
hon skell of hlaut
fyr skillinga,
en högg hamars
fyr hringa fjölð.
Svá kom Óðins sonr
endr at hamri.$txt$, $txt$Han ihjälslog den åldriga
jättarnes syster,
henne, som brudgåva
bedit hade.
Slag i stället
för slantar hon fick
och hugg av hammaren
för hopen av ringar.
Så fick Odens son
åter sin hammare.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Trym$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);

-- ===== Kvädet om Volund  (Völundarkviða) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Meyjar flugu sunnan
myrkvið í gögnum,
Alvitr unga,
örlög drýgja;
þær á sævarströnd
settusk at hvílask
drósir suðrænar,
dýrt lín spunnu.$txt$, $txt$Möar flögo sunnan
Mörkskogen igenom,
Allvitr den unga
att örlog föra.
På sjöstrand sig satte
de sköna att vila,
kvinnor från södern,
kostbart lin spunno.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Ein nam þeira
Egil at verja,
fögr mær fira,
faðmi ljósum;
önnur var Svanhvít,
svanfjaðrar dró,
en in þriðja
þeira systir
varði hvítan
hals Völundar.$txt$, $txt$Egil slöts
av en av dem,
en fager mö,
i famnen den vita;
den andra var Svanvit,
med svanfjädrar flög;
den tredje systern
slog sin arm
omkring Volunds
vita hals.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Sátu síðan
sjau vetr at þat,
en inn átta
allan þráðu,
en inn níunda
nauðr of skilði;
meyjar fýstusk
á myrkvan við,
Alvitr unga,
örlög drýgja.$txt$, $txt$Sju år sutto de
sedan stilla,
hela det åttonde
hyste de trånad,
men det nionde
de nödgades skiljas.
Möarna längtade
till mörkan skog
- Allvitr den unga -
att örlog föra.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Kom þar af veiði
veðreygr skyti,
[Völundr, líðandi
um langan veg],
Slagfiðr ok Egill,
sali fundu auða,
gengu út ok inn
ok um sáusk;
austur skreið Egill
at Ölrúnu,
en suðr Slagfiðr
at Svanhvítu.$txt$, $txt$Hem väderbitne skytten
vände från jakten;
Slagfinn och Egil
funno salarne öde,
gingo ut och in
och om sig sågo.
Åt öster åkte Egil
efter Olrun
men åt söder Slagfinn
efter Svanvit.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$En einn Völundr
sat í Ulfdölum,
hann sló gull rautt
við gim fastan,
lukði hann alla
lind baugum vel;
svá beið hann
sinnar ljóssar
kvánar, ef hánum
koma gerði.$txt$, $txt$Ensam satt Volund
i Ulvdalarne,
slog guldet röda
kring glimmande sten,
alla ringarna på lindebast
lyckte han väl;
sitt väna viv
väntade han så,
i hopp, att hon skulle
till honom komma.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Þat spyrr Níðuðr,
Níára dróttinn,
at einn Völundr
sat í Ulfdölum;
nóttum fóru seggir,
neglðar váru brynjur,
skildir bliku þeira
við inn skarða mána.$txt$, $txt$Det spörjer Nidud,
njarernas drott,
att ensam Volund
i Ulvdalarne satt.
Om natten kommo män
med nitade brynjor,
deras sköldar blänkte
vid skenet av nedanet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Stigu ór söðlum
at salar gafli,
gengu inn þaðan
endlangan sal;
sáu þeir á bast
bauga dregna,
sjau hundruð allra,
er sá seggr átti.$txt$, $txt$De stego ur sadlarne
vid salens gavel
gingo därifrån in,
och upp längs salen;
de sågo på bast
bundna ringar,
sju hundra av alla,
som husbonden ägde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Og þeir af tóku
ok þeir á létu,
fyr einn útan,
er þeir af létu.
Kom þar af veiði
veðreygr skyti,
Völundr, líðandi
um langan veg.$txt$, $txt$De togo dem av,
och de trädde dem på,
förutom en,
som de av läto bliva.
Hem vände från jakten
väderbitne skytten,
Volund, vandrande
en väg så lång.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Gekk hann brúnni
beru hold steikja,
ár brann hrísi
allþurr fura,
viðr inn vindþurri,
fyr Völundi.$txt$, $txt$Han gick att av bruna
björnhonan steka,
snart den torra
tallens ris,
den vindtorra veden,
för Volund brann.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Sat á berfjalli,
bauga talði,
alfa ljóði,
eins saknaði;
hugði hann, at hefði
Hlöðvés dóttir,
Alvitr unga,
væri hon aftr komin.$txt$, $txt$På huden av björnen
satt härskaren över alfer,
räknade ringarne,
rövad var en.
Han tänkte, att den lånats
av Lodvers dotter,
Allvitr den unga,
att hon återkommit.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Sat hann svá lengi,
at hann sofnaði,
ok hann vaknaði
viljalauss;
vissi sér á höndum
höfgar nauðir,
en á fótum
fjötur of spenntan.$txt$, $txt$Han satt så länge,
att han somnade,
i ve och vånda
han vaknade åter;
kände bojor tunga
bundna på händerna
och på fötterna
en fjätter spänd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"Hverir ro jöfrar,
þeir er á lögðu
besti bör síma
ok mik bundu?"$txt$, $txt$»Vilka krigare är det,
som knöto på mig
band av bast
och bundo mig?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Kallaði nú Níðuðr
Níara dróttinn:
"Hvar gaztu, Völundr,
vísi alfa,
vára aura
í Ulfdölum?"$txt$, $txt$Nu ropade Nidud,
njarernas drott:
»Var fick du, Volund,
furste för alfer,
vårt egna guld
i Ulvdalarne?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$"Gull var þar eigi
á Grana leiðu,
fjarri hugða ek várt land
fjöllum Rínar;
man ek, at vér meiri
mæti áttum,
er vér heil hjú
heima várum.$txt$, $txt$Guld fanns där icke
på Granes väg,
fjärran är vårt land
från fjällen vid Ren.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Hlaðguðr ok Hervör
borin var Hlöðvé
kunn var Ölrún
Kíárs dóttir."$txt$, $txt$Ladgunn och Hervor,
av Lodver var hon barn,
bekant var Olrun
som Kjars dotter.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$[Úti stóð kunnig
kván Níðaðar],
hon inn of gekk
endlangan sal,
stóð á golfi,
stillti röddu:
"Er-a sá nú hýrr,
er ór holti ferr."$txt$, $txt$[Ute står Niduds
illsluga drottning,
och] in hon gick
och upp längs salen.
Hon stod på golvet
och stämman sankte:
»Fredlig är ej han,
som föres ur skogen.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$"Ámun eru augu
ormi þeim inum frána,
tenn hánum teygjask,
er hánum er tét sverð
ok hann Böðvildar
baug of þekkir;
sníðið ér hann
sina magni
ok setið hann síðan
í Sævarstöð."$txt$, $txt$"Hans tänder synas,
då svärdet visas honom
och den ring, som Bodvild
bär, han varsnar;
ögonen likna
den lömske ormens.
Skären sönder
hans senors styrka
och sätten honom sedan
i Sävarstad!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Skínn Níðaði
sverð á linda,
þat er ek hvessta,
sem ek hagast kunna
ok ek herðak,
sem mér hægst þótti;
sá er mér fránn mækir
æ fjarri borinn,
sékk-a ek þann Völundi
til smiðju borinn.$txt$, $txt$»Jag ser på Nidud
ett svärd vid bältet,
som jag vässat har,
så väl jag kunnat,
och vilket jag härdade,
som helst jag ville.
Borta från mig bäres
denna blixtrande klinga,
jag ser den ej buren
till smedjan åt Volund.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Nú berr Böðvildr
brúðar minnar
- bíðk-a ek þess bót, -
bauga rauða."$txt$, $txt$Nu bär Bodvild
min bruds
röda ringar
- rånet ej bötas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Sat hann, né hann svaf, ávallt
ok hann sló hamri;
vél gerði hann heldr
hvatt Níðaði.
Drifu ungir tveir
á dýr séa
synir Níðaðar,
í Sævarstöð.$txt$, $txt$Han satt och sov ej
och slog med hammaren,
gjorde ganska snart
ett svek mot Nidad.
Att kostbarheter se
kommo de två unga
sönerna av Nidad
till Sävarstad.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Kómu þeir til kistu,
kröfðu lukla,
opin var illúð
er þeir í sáu;
fjölð var þar menja,
er þeim mögum sýndisk
at væri gull rautt
ok görsimar.$txt$, $txt$De kommo till kistan,
krävde nycklarne,
uppenbar var ondskan,
när i den de sågo.
En mängd smycken där fanns,
som för sönerna vistes,
att rött guld det vore
och rikedomar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Komið einir tveir,
komið annars dags;
ykkr læt ek þat gull
of gefit verða;
segið-a meyjum
né salþjóðum,
manni engum,
at it mik fyndið."$txt$, $txt$»Kom allena, ni två!
Kom en annan dag!
Som gåva åt eder
detta guldet jag lämnar.
Säg det ej för flickorna
och folket i salen,
för ingen människa,
att mig ni träffat!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Snemma kallaði
seggr annan,
bróðir á bróður:
"Göngum baug séa!"
Kómu til kistu,
kröfðu lukla,
opin var illúð,
er þeir í litu.$txt$, $txt$Snart ropade
småttingen den andre,
broder till broder:
»Bort att se ringar!»
De kommo till kistan,
krävde nycklarne,
uppenbar var ondskan
när i den de sågo.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Sneið af höfuð
húna þeira
ok und fen fjöturs
fætr of lagði;
en þær skálar,
er und skörum váru,
sveip hann útan silfri,
seldi Níðaði.$txt$, $txt$Gossarnas huvud
högg han av
och lade benen
under blåsbälgens vattengrop,
men huvudskalarna,
som under håret voro,
svepte han i silver
och sände till Nidad.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$En ór augum
jarknasteina
sendi hann kunnigri
konu Níðaðar,
en ór tönnum
tveggja þeira
sló hann brjóstkringlur
sendi Böðvildi.$txt$, $txt$Men av ögonen gjorde han
ädelstenar,
sände dem till Nidads
sluga drottning,
men av tänderna
på de två gossarne
smidde han bröstsmycken
och sände till Bodvild.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Þá nam Böðvildr
baugi at hrósa
-- -- --
[bar hann Völundi],
er brotit hafði:
"Þorig-a ek at segja
nema þér einum."$txt$, $txt$Ringen Bodvild
att rosa begynt
- - -
[bar den till Volund],
då hon brutit den sönder:
»Annat än åt dig
jag dristar ej säga det.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$"Ek bæti svá
brest á gulli
at feðr þínum
fegri þykkir
ok mæðr þinni
miklu betri
ok sjalfri þér
at sama hófi."$txt$, $txt$»Bräckan på guldet
botar jag så,
att din fader
det fagrare synes
och din moder
mycket bättre
och dig själv
lika skönt också.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Bar hann hana bjóri,
því at hann betr kunni
svá at hon í sessi
of sofnaði.
"Nú hef ek hefnt
harma minna
allra nema einna
íviðgjarna."$txt$, $txt$Genom öl han henne
överlistade,
så att hon somnade,
där hon satt på bänken:
»Nu har jag hämnat,
vad mig harm har gjort,
allt utom ett
av det ondskefulla.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Vel ek," kvað Völundr,
"verða ek á fitjum
þeim er mik Níðaðar
námu rekkar."
Hlæjandi Völundr
hófsk at lofti,
grátandi Böðvildr
gekk ór eyju,
tregði för friðils
ok föður reiði.$txt$, $txt$»Bra», sade Volund,
»må på benen jag komma,
som Nidads kämpar
mig nekade bruka.»
Leende Volund
i luften sig höjde,
gråtande Bodvild
fick gå från ön,
sörjde älskarens färd
och sin faders vrede.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Úti stendr kunnig
kván Níðaðar,
ok hon inn of gekk
endlangan sal,
- en hann á salgarð
settisk at hvílask -:
"Vakir þú, Níðuðr
Níara dróttinn?"$txt$, $txt$Ute stod Niduds
illsluga drottning,
och in hon gick
upp genom salen,
- men på salens hägnad
han satte sig att vila. -
»Är du vaken, Nidud,
njarernas drott?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$"Vaki ek ávallt
viljalauss,
sofna ek minnst
síz mína sonu dauða;
kell mik í höfuð,
köld eru mér ráð þín,
vilnumk ek þess nú,
at ek við Völund dæma.$txt$, $txt$»Jag vakar alltid,
välbehag saknar,
jag sover föga,
sedan sönerna dogo,
i mitt huvud det kyler,
köld ge dina råd,
jag vill nu gärna
med Volund tala.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Seg þú mér þat, Völundr,
vísi alfa,
af heilum hvat varð
húnum mínum."$txt$, $txt$»Yppa mig, Volund,
alfernas furste,
vad blev av blomstrande
barnen mina!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$"Eiða skaltu mér áðr
alla vinna,
at skips borði
ok at skjaldar rönd,
at mars bægi
ok at mækis egg,
at þú kvelj-at
kván Völundar
né brúði minni
at bana verðir,
þótt vér kván eigim,
þá er ér kunnið,
eða jóð eigim
innan hallar.$txt$, $txt$»Först skall du alla
eder svärja:
vid skeppets bord
och vid sköldens rand,
vid hästens bog
och vid huggsvärdets egg,
att du Volunds viv
ej vållar kval
eller min brud
till bane varder,
fast jag käresta har,
som I kännen,
eller i din boning
barn jag äger.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$Gakk þú til smiðju,
þeirar er þú gerðir,
þar fiðr þú belgi
blóði stokkna;
sneið ek af höfuð
húna þinna,
ok und fen fjöturs
fætr of lagðak.$txt$, $txt$Gå bort till den smedja,
du byggt åt mig,
där finner du bälgarne
med blod bestänkta.
Dina gossars huvud
högg jag av
och lade benen
under bälgens vattengrop.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$En þær skálar,
er und skörum váru,
sveip ek útan silfri,
selda ek Níðaði;
en ór augum
jarknasteina
senda ek kunnigri
kván Níðaðar.$txt$, $txt$Men huvudskålarna,
som under håret voro,
svepte jag i silver
och sände till Nidad,
och av ögonen gjorde jag
ädelstenar,
sände dem till Nidads
sluga drottning.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$En úr tönnum
tveggja þeira
sló ek brjóstkringlur,
senda ek Böðvildi;
nú gengr Böðvildr
barni aukin,
eingadóttir
ykkur beggja."$txt$, $txt$Men av tänderna
på de två gossarne
smidde jag bröstsmycken
och sände till Bodvild.
Nu Bodvild bär
ett barn under hjärtat,
enda dottern
till eder båda.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$"Mæltir-a þú þat mál,
er mik meir tregi,
né ek þik vilja, Völundr,
verr of níta;
er-at svá maðr hár,
at þik af hesti taki,
né svá öflugr,
at þik neðan skjóti,
þar er þú skollir
við ský uppi."$txt$, $txt$»Ej något du sagt mig,
som jag sörjt över mera
eller ville, att det värre
dig, Volund, må bekomma.
Sa hög är ingen man,
att från hästen han dig tager,
inga nävar nog starka
att här nedifrån dig skjuta,
där du hänger svävande
i högan sky.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$Hlæjandi Völundr
hófsk at lofti,
en ókátr Níðuðr
sat þá eftir.$txt$, $txt$Leende Volund
i luften sig höjde
och kvar, i sorg
sänkt, satt Nidud.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$"Upp rístu, Þakkráðr,
þræll minn inn bezti,
bið þú Böðvildi,
meyna bráhvítu,
ganga fagrvarið
við föður ræða.$txt$, $txt$»Stig upp, Tackrad,
min träl den bäste,
bed du Bodvild,
den bländvita mön,
gå fagert smyckad
med sin fader att tala.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$Er þat satt, Böðvildr,
er sögðu mér:
Sátuð it Völundr
saman í holmi?"$txt$, $txt$»Är det sant, Bodvild,
som de sagt till mig?
Var du på holmen
till hopa med Volund?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$"Satt er þat, Níðuðr,
er sagði þér:
Sátum vit Völundr
saman í holmi
eina ögurstund,
æva skyldi;
ek vætr hánum
vinna kunnak,
ek vætr hánum
vinna máttak."$txt$, $txt$»Sant är det, Nidad,
som man sade dig.
Jag var på holmen
tillhopa med Volund,
en olycksstund,
som aldrig bort komma.
Honom jag icke
hindra kunde;
honom jag icke
hindra förmådde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Volund$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);

-- ===== Sången om Allvis  (Alvíssmál) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Bekki breiða,
nú skal brúðr með mér
heim í sinni snúask;
hratat um mægi
mun hverjum þykkja,
heima skal-at hvíld nema."$txt$, $txt$»Att bänkarne breda
skall bruden nu med mig
i sällskap hemåt hasta.
För att bli måg jag skyndat,
det menar nog envar;
man skall ej hänge sig åt vila hemma.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Hvat er þat fira?
Hví ertu svá fölr um nasar?
Vartu í nótt með ná?
Þursa líki
þykki mér á þér vera;
ert-at-tu til brúðar borinn."$txt$, $txt$»Vad är det för en bjässe?
Vi är så blek du på näsan?
Låg du i natt hos lik?
Tycke av en turs
tycks mig hos dig vara.
Du är ej för bruden boren.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Alvíss ek heiti,
bý ek fyr jörð neðan,
á ek undir steini stað;
vagna vers
ek em á vit kominn;
bregði engi föstu heiti fira."$txt$, $txt$»Allvis jag heter,
hålles under jorden,
under sten har jag varaktig stad.
Betalning för vapen
att taga jag kommit;
ingen bindande löfte bryte!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Ek mun bregða
því at ek brúðar á
flest of ráð sem faðir;
vark-a ek heima,
þá er þér heitit var,
at sá einn, er gjöf er, með goðum."$txt$, $txt$»Jag skall bryta,
ty brudens gifte
jag främst bestämmer som fader.
Jag var ej hemma,
då hon dig lovades;
enda giftoman bland gudar är jag.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Hvat er þat rekka,
er í ráðum telsk
fljóðs ins fagrglóa?
Fjarrafleina
þik munu fáir kunna;
hverr hefr þik baugum borit?"$txt$, $txt$»Vad är det för en man,
som myndighet påstår
över fagerglänsande flicka?
Av folk, som vitt färdas,
dig få torde känna.
Vilkens maka har din moder varit?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$"Vingþórr ek heiti,
ek hef víða ratat,
sonr em ek Síðgrana;
at ósátt minni skal-at-tu
þat it unga man hafa
ok þat gjaforð geta."$txt$, $txt$»Ving-Tor jag heter,
vida jag strövat,
son jag till Sidgrane är.
Utan mitt samtycke
ungmön du ej får
och gynnas ej med detta gifte.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$"Sáttir þínar
er ek vil snemma hafa
ok þat gjaforð geta;
eiga vilja
heldr en án vera
þat it mjallhvíta man."$txt$, $txt$»Samtycket ditt
vill snart jag hava
och gynnas med detta gifte;
äga vill jag hellre
än utan vara
denna mjällvita mö.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Meyjar ástum
mun-a þér verða,
vísi gestr, of varit,
ef þú ór heimi kannt
hverjum at segja
allt þat, er ek vil vita."$txt$, $txt$»Möns älskog
skall icke förmenad
varda dig, vise gäst,
om du ur varje
värld kan säga
allt, vad jag veta vill.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé sú jörð heitir,
er liggr fyr alda sonum
heimi hverjum í?"$txt$, $txt$»Säg du mig, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
vad månne väl den jord,
som framför människorna ligger
heter i varje värld?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Jörð heitir með mönnum,
en með ásum fold,
kalla vega vanir,
ígræn jötnar,
alfar gróandi,
kalla aur uppregin."$txt$, $txt$»Jord säges bland människor,
men slätt hos asarne,
vanerna kallar den vägar;
alltid grön jättarne,
alferna den groende,
gudarne där uppe grus.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé sá himinn heitir,
erakendi,
heimi hverjum í?"$txt$, $txt$»Säg du mig, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
vad himmelen,
som av havet föddes,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"Himinn heitir með mönnum,
en hlýrnir með goðum,
kalla vindófni vanir,
uppheim jötnar,
alfar fagraræfr,
dvergar drjúpansal."$txt$, $txt$»Himmel den heter bland människor,
högvalv bland gudar,
vindvävare kalla den vaner,
uppvärlden jättar,
alferna fagertak,
dvärgarne drypande sal.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$"Segðu mér þat, Avlíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hversu máni heitir,
sá er menn séa,
heimi hverjum í?"$txt$, $txt$»Säg du mig, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
huru månen
som människorna se,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$"Máni heitir með mönnum,
en mylinn með goðum,
kalla hverfanda hvél helju í,
skyndi jötnar,
en skin dvergar,
kalla alfar ártala."$txt$, $txt$»Måne den heter bland människor,
men molntapp hos gudar,
svänghjul de säga hos Hel,
skyndaren jättarne
men skenet dvärgarne,
om tideräknarn alferna tala.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé sú sól heitir,
er séa alda synir,
heimi hverjum í?"$txt$, $txt$»Säg du mig, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
hur den sol, som människors
söner skåda,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$"Sól heitir með mönnum,
en sunna með goðum,
kalla dvergar Dvalins leika,
eygló jötnar,
alfar fagrahvél,
alskír ása synir."$txt$, $txt$»Sol den heter bland människor,
»sunna» hos gudar,
den kalla dvärgar Dvalins leksak,
evigglöd jättar,
alferna fagerhjul
och allklar asars söner.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé þau ský heita,
er skúrum blandask,
heimi hverjum í?$txt$, $txt$»Säg du mig, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
huru de skyar,
som skicka oss skurar,
heta i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Ský heita með mönnum,
en skúrván með goðum,
kalla vindflot vanir,
úrván jötnar,
alfar veðrmegin,
kalla í helju hjalm huliðs."$txt$, $txt$»Skyar de heta hos människor,
skyfallshopp hos gudar,
vindflarn dem vanerna kalla,
ovädersväntan jättarne,
alferna väderkraft,
hölje de kallas hos Hel.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé sá vindr heitir,
er víðast ferr,
heimi hverjum í?"$txt$, $txt$»Säg du mig, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
huru vinden,
som vidast far,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Vindr heitir með mönnum,
en váfuðr með goðum,
kalla gneggjuð ginnregin,
æpi jötnar,
alfar dynfara,
kalla í helju hviðuð."$txt$, $txt$»Vind den heter bland människor,
viftaren hos gudar,
gnäggarn hos de väldiga väsen,
gormaren hos jättar,
snyftaren hos alfer,
vinaren han heter hos Hel.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé þat logn heitir,
er liggja skal,
heimi hverjum í?"$txt$, $txt$»Säg du mig, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
huru lugnet,
som ligga plär,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Logn heitir með mönnum,
en lægi með goðum,
kalla vindlot vanir,
ofhlý jötnar,
alfar dagsefa,
kalla dvergar dags veru."$txt$, $txt$»Lugn det heter hos människor,
lindring hos gudar,
vindslut det vanerna kalla,
övervärme jättarne,
alferna dagsstillhet,
dvärgarne dagens ro.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé sá marr heitir,
er menn róa,
heimi hverjum í?"$txt$, $txt$»Säg mig du, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
huru den sjön,
som skepp ro på,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$"Sær heitir með mönnum,
en sílægja með goðum,
kalla vág vanir,
álheim jötnar,
alfar lagastaf,
kalla dvergar djúpan mar."$txt$, $txt$»Sjö den heter bland människor,
vida skivan hos gudar,
vanerna kalla den våg,
jättarne ålhem
alferna vätskeämne,
namnet djupt hav giva den dvärgar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé sá eldr heitir,
er brennr fyr alda sonum,
heimi hverjum í?"$txt$, $txt$»Säg mig du, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
huru elden,
som för allt folk brinner,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Eldr heitir með mönnum,
en með ásum funi,
kalla vág vanir,
frekan jötnar,
en forbrenni dvergar,
kalla í helju hröðuð."$txt$, $txt$»Eld den heter bland människor,
men bland asarne flamma,
vanerna kalla den våg,
jättarne slukaren,
den svedande dvärgar,
den hastige han kallas hos Hel.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé viðr heitir,
er vex fyr alda sonum,
heimi hverjum í?"$txt$, $txt$»Säg mig du, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
huru skogen,
som skuggar människorna,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Viðr heitir með mönnum,
en vallarfax með goðum,
kalla hlíðþang halir,
eldi jötnar
alfar fagrlima,
kalla vönd vanir."$txt$, $txt$»Skog den heter hos människor,
man på slätten hos gudar,
hos Hels folk höjdsidans tång,
eldaren hos jättar,
hos alferna fagergrenig,
hos vise vaner spö.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr,at vitir,
hvé sú nótt heitir,
in Nörvi kennda,
heimi hverjum í?"$txt$, $txt$»Säg mig du, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
huru natten,
Norves dotter,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$"Nótt heitir með mönnum,
en njól með goðum,
kalla grímu ginnregin,
óljós jötnar,
alfar svefngaman,
kalla dvergar draumnjörun."$txt$, $txt$»Natt hon heter bland människor,
mörker bland gudar,
mask kalla henne väldiga makter,
oljus jättarne,
alferna sömngumman,
drömväverska kalla henne dvärgar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé þat sáð heitir,
er sá alda synir,
heimi hverjum í?"$txt$, $txt$»Säg mig du, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
huru säden,
som sås av människorna,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$"Bygg heitir með mönnum,
en barr með goðum,
kalla vöxt vanir,
æti jötnar,
alfar lagastaf,
kalla í helju hnipin."$txt$, $txt$»Bjugg den heter bland människor
och 'barr' hos gudar,
hos vanerna heter den växt,
äta jättarne den kalla,
alferna vätskeämne,
hänghuvud heter den hos Hel.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$"Segðu mér þat, Alvíss,
- öll of rök fira
vörumk, dvergr, at vitir -:
hvé þat öl heitir,
er drekka alda synir,
heimi hverjum í?"$txt$, $txt$»Säg mig du, Allvis -
alla varelsers öde
väntar jag, dvärg, att du vet -
huru ölet,
som allt folk dricker,
heter i varje värld!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$"Öl heitir með mönnum,
en með ásum bjórr,
kalla veig vanir,
hreinalög jötnar,
en í helju mjöð,
kalla sumbl Suttungs synir."$txt$, $txt$»Öl det heter bland människor,
bland asarne brygd,
rusande vätska hos vaner,
klar dryck det heter hos jättar
och kallas mjöd hos Hel,
supning hos Suttungs söner.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$"Í einu brjósti
ek sák aldrigi
fleiri forna stafi;
miklum tálum
kveð ek tældan þik:
Uppi ertu, dvergr, of dagaðr,
nú skínn sól í sali."$txt$, $txt$»I ett bröst
jag aldrig såg
så många minne från fordom.
Dock av mycket svek
nu sviken du är:
kvar uppe till dagsljus, dvärg!
Nu skiner solen i salen.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Sången om Allvis$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);

-- ===== Första kvädet om Helge Hundingsbane  (Helgakviða Hundingsbana I) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Ár var alda,
þat er arar gullu,
hnigu heilög vötn
af Himinfjöllum;
þá hafði Helga
inn hugumstóra
Borghildr borit
í Brálundi.$txt$, $txt$En gång i avlägsen forntid
örnar skreko,
heliga vatten runno
från himlafjällen;
då blev Helge
den hugstore
född av Borghild
i Bralund.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Nótt varð í bæ,
nornir kómu,
þær er öðlingi
aldr of skópu;
þann báðu fylki
frægstan verða
ok buðlunga
beztan þykkja.$txt$, $txt$Natt blev i gården,
nornor kommo,
som livets lott
lade åt ädlingen;
de bådo honom bliva
den bästa hövding
och av furstar
mest frejdad tyckas.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Sneru þær af afli
örlögþáttu,
þá er borgir braut
í Bráluni;
þær of greiddu
gullin símu
ok und mánasal
miðjan festu.$txt$, $txt$De snodde med eftertryck
ödets tradar,
medan borgar brötos,
i Bralund;
det gyllene repet
de redde ut
och fäste det mitt
under månens sal.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Þær austr ok vestr
enda fálu,
þar átti lofðungr
land á milli;
brá nift Nera
á norðrvega
einni festi,
ey bað hon halda.$txt$, $txt$De öster och väster
ändarne dolde,
däremellan landet
lydde under fursten;
Neres släkting
norrut slängde
ett band, som alltid
hon bad skulle hålla.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Eitt var at angri
Ylfinga nið
ok þeiri meyju,
er munúð fæddi;
hrafn kvað at hrafni,
- sat á hám meiði
andvanr átu -:
"ek veit nökkut.$txt$, $txt$Ett var ej till skada
för ylvingaättlingen,
som den unga kvinnan
i älskog födde:
korp till korp
kraxade hungrig
- i högt träd han satt -
»Hör, jag vet något!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Stendr í brynju
burr Sigmundar
dægrs eins gamall,
nú er dagr kominn;
hvessir augu
sem hildingar,
sá er varga vinr,
vit skulum teitir."$txt$, $txt$»I brynja Sigmunds
son står pansrad,
ett dygn gammal,
nu är dagen kommen.
Vassa äro ögonen
som på väldiga krigare;
han är vargarnes vän.
Varom glade!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Drótt þótti sá
döglingr vera,
kváðu með gumnum
góð ár komin;
sjalfr gekk vísi
ór vígþrimu
ungum færa
ítrlauk grami.$txt$, $txt$En hövding han tycktes
hovfolket vara,
goda år, de menade,
för männen hade kommit.
Själv gick konungen
ur kampens larm
att ädel lök giva
åt den unge fursten.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Gaf hann Helga nafn
ok Hringstaði,
Sólfjöll, Snæfjöll
ok Sigarsvöllu,
Hringstöð, Hátún
ok Himinvanga,
blóðorm búinn
bræðr Sinfjötla.$txt$, $txt$Namnet Helge han gav
och gårdarne Ringstad,
Solfjäll, Snöfjäll
och Sigarsslätterna,
Ringstod, Hatun
och Himinvang,
ett sirat svärd
åt Sinfjotles broder$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Þá nam at vaxa
fyr vina brjósti
almr ítrborinn
ynðis ljóma;
hann galt ok gaf
gull verðungu,
sparði eigi hilmir
hodd blóðrækinn.$txt$, $txt$Växa började
vid vänners bröst
ädelboren yngling
i ynnestens strålglans;
guld han gav
som gåva åt följet,
sin skatt ej ungdomsfriske
fursten skonade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Skammt lét vísi
vígs at bíða;
þá er fylkir var
fimmtán vetra,
ok hann harðan lét
Hunding veginn
þann er lengi réð
löndum ok þegnum.$txt$, $txt$Kort tid lät konungen
på kamp vänta,
när fursten var
femton vintrar
och han den hårde
Hunding dräpte,
som länge rådde
över länder och män.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Kvöddu síðan
Sigmundar bur
auðs ok hringa
Hundings synir,
því at þeir áttu
jöfri at gjalda
fjárnám mikit
ok föður dauða.$txt$, $txt$Av Sigmunds son
sedan fordrade
Hundings söner
håvor och ringar,
ty de ville fursten
vedergälla
för frånrövat gods
och faderns död.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Lét-at buðlungr
bótir uppi
né niðja in heldr
nefgjöld fáa;
ván kvað hann mundu
veðrs ins mikla
grára geira
ok gremi Óðins.$txt$, $txt$Men inga böter
bjöd dem fursten,
och fränderna ej heller
fingo mansbot;
de gråa spjutens
gräsliga storm
och Odens vrede
de vänta skulle.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Fara hildingar
hjörstefnu til,
þeirar er lögðu
at Logafjöllum;
sleit Fróða frið
fjánda á milli;
fara Viðris grey
valgjörn of ey.$txt$, $txt$Furstarne fara
till fejden hän,
som till Logafjällen
förlagt de hade;
Frodes frid
mellan fiender brast,
Vidrers hundar löpa
likhungriga kring ön.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Settisk vísi,
þá er vegit hafði
Alf ok Eyjólf,
und arasteini,
Hjörvarð ok Hávarð,
Hundings sonu;
farit hafði hann allri
ætt geirmímis.$txt$, $txt$Fursten sig satte,
då fällt han hade
Alf och Eyolf
under örnklippan,
Hjorvard och Havard,
Hundings söner,
och alldeles förintat
spjutjättens ätt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Þá brá ljóma
af Logafjöllum,
en af þeim ljómum
leiftrir kómu,
-- -- --
hávar und hjalmum
á Himinvanga,
brynjur váru þeira
blóði stokknar,
en af geirum
geislar stóðu.$txt$, $txt$Då lyste ett sken
från Logafjällen
och ur bländande skenet
blixtar kommo;
[Fursten då märkte
möar rida]
höga i hjälmar
på himlafältet;
deras brynjor voro
med blod bestänkta
och från spjuten
spelade strålar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Frá árliga
ór úlfíði
döglingr at því
dísir suðrænar,
ef þær vildi heim
með hildingum
þá nótt fara;
þrymr var alma.$txt$, $txt$Arla frågade
ur ulvboet
fursten därom
diserna från södern,
om med härmännen
hem de ville
denna natt fara;
dån var av bågar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$En af hesti
Högna dóttir,
- líddi randa rym, -
ræsi sagði:
"Hygg ek, at vér eigim
aðrar sýslur
en með baugbrota
bjór at drekka.$txt$, $txt$Men från hästen
Hognes dotter,
då sköldlarmet tystnade,
talte till fursten:
»Jag tycker, vi äga
andra sysslor
än med frikostig drott
att dricka öl.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Hefir minn faðir
meyju sinni
grimmum heitit
Granmars syni,
en ek hef, Helgi,
Höðbrodd kveðinn
konung óneisan
sem kattar son.$txt$, $txt$Min fader har
sin flicka lovat
åt Granmars
grymme son,
men jag har, Helge,
om Hodbrodd sagt,
att som en kattunge blott
den kungen är käck.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Þó kemr fylkir
fára nátta,
nema þú hánum vísir
valstefnu til
eða mey nemir
frá mildingi."$txt$, $txt$Dock fursten kommer
inom få dagar,
om ej till strid
du stämmer honom
eller flickan bort
från fursten tager.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Uggi eigi þú
Ísungs bana;
fyrr mun dolga dynr,
nema ek dauðr séak."$txt$, $txt$»Ängslas ej
för Isungs baneman;
förr dåna skall striden,
om ej död jag blir.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Sendi áru
allvaldr þaðan
of land ok um lög
leiðar at biðja,
iðgnógan
Ógnar ljóma
brögnum bjóða
ok burum þeira.$txt$, $txt$Bud härskaren
bort skickade
över land och hav
att ledungsfölje bedja
och röda guldet
rikligt bjuda
åt kämparne
och kämparnes söner.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Biðið skjótliga
til skipa ganga
ok ór Brandeyju
búna verða."
Þaðan beið þengill,
unz þingat kómu
halir hundmargir
ór Heðinseyju.$txt$, $txt$»Beden dem skyndsamt
till skeppen gå
och att från Brandö
bort sig rusta!»
Där väntade drotten,
tills dit till mötes kommo
hopar av kämpar
från Hedinsö.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Ok þar af ströndum
ór Stafnsnesi
beit her út skriðu
ok búin gulli;
spurði Helgi
Hjörleif at því:
"hefir þú kannaða
koni óneisa?"$txt$, $txt$Och där från stränderna
på Stavnsnäs
skepp ut skredo,
skinande av guld.
Helge gjorde
Hjorleif den frågan:
»Har du mönstrat
männen käcka?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$En ungr konungr
öðrum sagði,
seint kvað at telja
af Trönueyri
langhöfðuð skip
und líðöndum,
þau er í Örvasund
útan fóru.$txt$, $txt$Unge kungen
till den andre sade:
»Senräknat är talet
från Tranoören
på skepp med drakhuvud,
som sjöfolk bära
och segla in i Orvasund
utifrån havet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Tolf hundruð
tryggra manna;
þó er í Hátúnum
halfu fleira
víglið konungs;
ván erum rómu."$txt$, $txt$Tolv hundra
trofasta män,
och dock är i Hatun
hälften flera,
konungens stridsfolk;
om kamp har jag hopp.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Svá brá stýrir
stafntjöldum af,
at mildinga
mengi vakði,
ok döglingar
dagsbrún séa
ok siklingar
sneru upp við tré
vefnistingum
á Varinsfirði.$txt$, $txt$Framstammens skeppstält
fursten strök av,
så att sina många
män han väckte,
och drottens krigare
se dagen gry,
och härmännen
hissade på masten
väven vita
på Varinsfjord.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Varð ára ymr
ok járna glymr,
brast rönd við rönd,
reru víkingar;
eisandi gekk
und öðlingum
lofðungs floti
löndum fjarri.$txt$, $txt$Det blev rammel av åror,
det blev rassel av järn,
sköld slog mot sköld,
sjömännen rodde;
uti ilande fart
med ädlingarna gick
furstens flotta
fjärran från land.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Svá var at heyra,
er saman kómu
kolgu systir
ok kilir langir,
sem björg eða brim
brotna myndi.$txt$, $txt$Så det lät,
när de långa kölarna
och Kolgas syster
sammanstötte,
som om berg och bränning
sig bröto mot varandra.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$Draga bað Helgi
há segl ofar,
varð-at hrönnum
höfn þingloga,
þá er ógurlig
Ægis dóttir
stagstjórnmörum
steypa vildi.$txt$, $txt$Helge bjöd högre
höga seglen draga;
från mötet med vågor
ej manskapet ryggade,
fast ångestväckande
Ägirs dotter
sjöhästarne
stjälpa ville.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$En þeim sjalfum
Sigrún ofan
folkdjörf of barg
ok fari þeira;
snerisk ramliga
Rán ór hendi
gjalfrdýr konungs
at Gnipalundi.$txt$, $txt$Men seglarne själva
Sigrun från ovan
skyddade stridsdjärv
samt skeppet deras;
raskt sig vred
Ran ur händerna
kungens gungande sjöhäst
vid Gnipalunden.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Sat þar um aftan
í Unavágum,
flaust fagrbúin
fljóta knáttu;
en þeir sjalfir
frá Svarinshaugi
með hermðar hug
her könnuðu.$txt$, $txt$Om aftonen satt han
i Unavåg,
de fagra fartygen
flöto på vattnet,
men de som sutto
på Svarinshög
med harmsen hug
hans här skådade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Frá góðborinn
Goðmundr at því:
"Hverr er landreki,
sá er liði stýrir
ok hann feiknalið
færir at landi?"$txt$, $txt$Därom godättade
Gudmund sporde:
»Vem är den furste,
som folket styr
och fiendens flock
för till land?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Sinfjötli kvað
- slöng upp við rá
rauðum skildi,
rönd var ór gulli;
þar var sundvörðr,
sá er svara kunni
ok við öðlinga
orðum skipta --:$txt$, $txt$Sinfjotle talade,
och slängde på rån upp
den röda skölden,
randen var av guld.
Där var satt som vakt i sundet
den, som svara kunde
och ord växla
med ädlingar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$"Segðu þat í aftan,
er svínum gefr
ok tíkr yðrar
teygir at solli,
at sé Ylfingar
austan komnir
gunnar gjarnir
fyr Gnipalundi.$txt$, $txt$»Säg du i afton,
när åt svinen du giver
och lockar edra hyndor
att lapa mjölkmaten,
att ylvingar kommit
östanifrån,
galna efter strid,
från Gnipalunden.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Þar mun Höðbroddr
Helga finna
flugtrauðan gram
í flota miðjum,
sá er oft hefir
örnu sadda,
meðan þú á kvernum
kystir þýjar."$txt$, $txt$Där skall Hodbrodd
Helge finna,
en furste, som ej flyr,
i flottans mitt.
Han har ofta
örnar mättat,
medan kvinnor du kysste
som vid kvarnarna trälade.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$"Fátt mantu, fylkir,
fornra spjalla,
er þú öðlingum
ósönnu bregðr;
þú hefir etnar
ulfa krásir
ok bræðr þínum
at bana orðit,
oft sár sogin
með svölum munni,
hefr í hreysi
hvarleiðr skriðit."$txt$, $txt$»Föga minns du, furste,
forna sägner,
då osant du lägger
ädlingar till last.
Du har ätit
ulvars föda
och din broder
till bane blivit,
med sval mun sugit
sår ofta,
hatad överallt
du hållit dig i rösen.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$"Þú vart völva
í Varinseyju,
skollvís kona,
bartu skrök saman;
kvaztu engi mann
eiga vilja,
segg brynjaðan,
nema Sinfjötla.$txt$, $txt$»Du var en vala
på Varinsö,
en listig kona,
du lögn bar ihop.
Ingen man
du äga ville
i brynja klädd,
blott Sinfjotle.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$Þú vart, in skæða,
skass, valkyrja,
ötul, ámátlig
at Alföður;
mundu einherjar
allir berjask,
svevís kona,
of sakar þínar.$txt$, $txt$Du var, förhatliga
häxa, valkyria,
elak, vedervärdig
hos Allfader.
Einhärjarne slogos
sinsemellan alla
för din skull,
din durkdrivna kona!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$Níu áttu vit
á nesi Ságu
ulfa alna,
ek var einn faðir þeira."$txt$, $txt$På Sagunäs
tillsammans nio
ulvar vi födde,
deras fader var jag.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$"Faðir var-at-tu
fenrisulfa
öllum ellri,
svá at ek muna,
síz þik geldu
fyr Gnipalundi
þursa meyjar
á Þórsnesi.$txt$, $txt$»Fader var du ej
till fenrisulvar,
äldre än alla,
så vitt jag erinrar mig,
sedan vid Gnipalunden
grymt din manbarhet
tursamöar togo
på Torsnäset.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$Stjúpr vartu Siggeirs,
látt und stöðum heima,
vargljóðum vanr
á viðum úti;
kómu þér ógögn
öll at hendi,
þá er bræðr þínum
brjóst raufaðir;
gerðir þik frægjan
af firinverkum."$txt$, $txt$Du var styvson till Siggeir;
i stamhållet för ulvar
du låg, van vid vargatjut,
i vilda skogen.
All slags olycka
över dig kom,
när din broders bröst
du borrade genom,
dig namnkunnig gjorde
av nidingsverk »$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$"Þú vart brúðr Grana
á Brávelli,
gullbitluð vart
gör til rásar;
hafða ek þér móðri
marg skeið riðit
svangri und söðli,
simul, forbergis."$txt$, $txt$»Brud åt hästen Grane
på Bråvalla du var;
länkad med guldbetsel,
till lopp var du redo;
jag dig tröttridit utför backe
tämligen ofta,
smal, som du var,
under sadeln, ditt nöt!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$"Sveinn þóttir þú
siðlauss vera,
þá er þú Gullnis
geitr molkaðir,
en í annat sinn
Imðar dóttir
tötrughypja.
Vill þú tölu lengri?"$txt$, $txt$»Sedeslös sven
syntes du vara,
när du mjölkade Gullners
många getter
och en annan gång
var Imds dotter,
i trasor klädd.
Vill du träta längre?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$"Fyrr vilda ek
at Frekasteini
hrafna seðja
á hræum þínum
en tíkr yðrar
teygja at solli
eða gefa göltum;
deili gröm við þik."$txt$, $txt$»Förr jag ville
vid Frekastenen
med din kropp
korpar mätta
än locka edra hyndor
att lapa mjölkmat
eller giva åt galtarne.
Förgöre dig de onda!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$"Væri ykkr, Sinfjötli,
Sæmra miklu
gunni at heyja
ok glaða örnu,
en sé ónýtum
orðum at bregðask,
þótt hringbrotar
heiftir deili.$txt$, $txt$»Mycket hellre, Sinfjotle,
hövdes eder
att gå till strids
och glädja örnar
än med onyttiga
ord att kivas,
om än hövdingarna
hätskhet söndrar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$Þykkja-t mér góðir
Granmars synir,
þó dugir siklingum
satt at mæla;
þeir hafa markat
á Móinsheimum,
at hug hafa
hjörum at bregða."$txt$, $txt$Ej goda tyckas mig
Granmars söner,
men sanning dock höves
en hövding att säga.
På Moinsheim
märka de läto,
att de saknade ej att svinga
svärden mod.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$Þeir af ríki
renna létu
Svipuð ok Sveggjuð
Sólheima til
dala döggótta,
dökkvar hlíðir;
skalf Mistar marr
hvar er megir fóru.$txt$, $txt$De läto hästarne
hastigt löpa,
Svipud och Sveggjod,
till Solheimar
genom daggiga dalar,
över dunkla lider,
skalv misthöljd mark;
där männen foro.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$Mættu þeir tyggja
í túnhliði,
sögðu stríðliga
stilli kómu;
úti stóð Höðbroddr
hjalmi faldinn,
hugði hann jóreið
ættar sinnar:
"Hví er hermðar litr
á Hniflungum?"$txt$, $txt$Kungen i gårdsledet
kom dem till möte,
harmfullt de sade
för hövdingen deras ankomst.
Ute stod Hodbrodd
på huvudet satt hjälmen,
han såg sönernas
snabba ritt:
»Vi varsnas på nivlungar
vredens färg?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$"Snúask hér at sandi
snævgir kjólar,
rakka-hirtir
ok ráar langar,
skildir margir,
skafnar árar,
göfugt lið gylfa,
glaðir Ylfingar.$txt$, $txt$»Till sandstranden vända sig
snabba kölar,
rårepshjortar
och rår långa,
sköldar många
och skinande åror,
hövdingens härmän,
hurtiga ylvingar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$Ganga fimmtán
folk upp á land,
þó er í Sogn út
sjau þúsundir;
liggja hér í grindum
fyr Gnipalundi
brimdýr blásvört
ok búin gulli;
þar er miklu mest
mengi þeira;
mun-a nú Helgi
hjörþing dvala."$txt$, $txt$Nu gå femton
flockar i land
dock ute på viken
vänta sjutusen;
inom grindar här ligga
framför Gnipalunden
svartblåa drakar,
sirade med guld;
där är allra mesta
mängden av krigsfolk.
Nu tövar ej Helge
att träffningen börja.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$"Renni rökn bitluð
til Reginþinga,
en Sporvitnir
at Sparinsheiði,
Mélnir ok Mýlnir
til Myrkviðar;
látið engi mann
eftir sitja,
þeira er benlogum
bregða kunni.$txt$, $txt$»Löpe betslade hästar
bort till folktinget,
och Sporvitner
till Sparinsheid,
Melner och Mylner
till Myrkvid!
Låten ingen sig hålla
hemma kvar,
som sårande svärd
svänga kan!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 52, $txt$Bjóðið ér Högna
ok Hrings sonum,
Atla ok Yngva,
Alf inum gamla,
þeir ró gjarnir
gunni at heyja;
látum Völsunga
viðrnám fáa."$txt$, $txt$Samlen hit Hogne
och sönerna av Ring,
Atle och Yngve,
Alf den gamle;
god lust de äga
att gå till strids;
med motstånd låtom oss
möta volsungen.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=52);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 53, $txt$Svipr einn var þat,
er saman kómu
fölvir oddar
at Frekasteini;
ey var Helgi
Hundings bani
fyrstr í fólki,
þar er firar börðusk,
æstr á ímu,
alltrauðr flugar;
sá hafði hilmir
hart móðakarn.$txt$, $txt$Ett brak det blev,
då bleka uddar
flögo mot varandra
vid Frekastenen.
Alltid var Helge
Hundingsbane
främst i flocken,
då folket stred,
förträffligast i slaktningen,
högst trög till flykt;
den hövdingen hade
hårdhet i bröstet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=53);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 54, $txt$Kómu þar ór himni
hjalmvítr ofan,
- óx geira gnýr, -
þær er grami hlífðu;
þá kvað þat Sigrún,
sárvitr fluga
- át hálu skær
af hugins barri -:$txt$, $txt$Från himlen ned hjälmklädda
jungfrur kommo -
- vapnens gny växte -
som värnade fursten.
Så sade Sigrun,
svävande valkyrian,
- av korpens föda
frossade vargen -:$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=54);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 55, $txt$"Heill skaltu, vísi,
virða njóta,
áttstafr Yngva,
ok una lífi,
er þú fellt hefir
inn flugartrauða
jöfur, þann er olli
ægis dauða.$txt$, $txt$»Hell dig, hövding!
Härska över män
Yngves ättling,
med ditt öde nöjd,
då du fällt har fursten,
som fly ej ville,
drotten, som härskarens
död har vållat!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=55);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 56, $txt$Ok þér, buðlungr,
samir bæði vel
rauðir baugar
ok in ríkja mær;
heill skaltu, buðlungr,
bæði njóta
Högna dóttur
ok Hringstaða,
sigrs ok landa.
Þá er sókn lokit.$txt$, $txt$Och dig, ädling,
anstår bådadera,
de röda ringar
och den raska mö.
Hell dig, furste!
Över Hognes dotter
råda du skall,
Ringstad äga
och få seger och land;
slutad är då striden.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=56);

-- ===== Andra kvädet om Helge Hundingsbane  (Völsungakviða in forna) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Segðu Hemingi
at Helgi man,
hvern i brynju
bragnar felldu;
ér ulf gráan
inni höfðuð,
þar er Hamal hugði
Hundingr konungr."$txt$, $txt$»Säg du åt Heming,
att Helge minnes,
vem i brynja
vikingarne dräpte.
Ulven grå
inne ni hade,
som kung Hunding höll
för att Hamal vara.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Hvöss eru augu
í Hagals þýju;
er-a þat karls ætt,
er á kvernum stendr;
steinar rifna
stökk lúðr fyrir.$txt$, $txt$»Hagals trälkvinnas ögon
te sig vassa,
ej bondens ätt är det,
som bullrar vid kvarnen;
stenarne rämna,
i stycken springer lådan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Nú hefir hörð dæmi
hildingr þegit,
er vísi skal
valbygg mala;
heldr er sæmri
hendi þeiri
meðalkafli
en möndultré."$txt$, $txt$Hård lott har nu
hövdingen fått,
då korn från Valland
kungen skall mala;
för denna hand
dugde bättre
än kvarnens handtag
att hålla svärdet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Þat er lítil vá,
þótt lúðr þrumi
er mær konungs
möndul hrærir;
hon skævaði
skýjum efri
ok vega þorði
sem víkingar,
áðr hana Helgi
höftu gerði;
systir er hon þeira
Sigars ok Högna;
því hefir ötul augu
Ylfinga man."$txt$, $txt$»Om lådan larmar
är litet under,
då konungadottern
skall kvarnen draga.
Högre än molnen
mön svävade
och som vikingar
med vapen stred,
innan Helge till fånge
henne gjorde.
Syster hon är
till Sigar och Hogne,
därför elaka ögon
har ylvingatärnan.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Hverir láta fljóta
fley við bakka?
Hvar, hermegir,
heima eiguð?
Hvers bíðið ér
í Brunavágum?
Hvert lystir yðr
leið at kanna?"$txt$, $txt$»Vilka låta fartyg
flyta vid stranden?
Var hören I, krigare,
hemma själva?
Vem biden I på
i Brunavåg?
Vart lyster eder
att leden känna?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$"Hagall lætr fljóta
fley við bakka,
eigum heima
í Hléseyju,
bíðum byrjar
í Brunavágum,
austr lystir oss
leið at kanna."$txt$, $txt$»Hamal låter fartyg
flyta vid stranden;
i Lässö höra vi
hemma själva;
bris vi bida
i Brunavåg;
österut lyster oss
att leden känna.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$"Hvar hefir þú, hilmir,
hildi vakða
eða gögl alin
Gunnar systra?
Hví er brynja þín
blóði stokkin?
Hví skal und hjalmum
hrátt kjöt eta?"$txt$, $txt$»Var har du, furste,
vapen prövat
eller valplatsens fåglar
föda givit?
Vi är din brynja
med blod bestänkt?
Vi äta hjälmklädda kämpar
köttet rått?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Þat vann næst nýs
niðr Ylfinga
fyr vestan ver,
ef þik vita lystir,
er ek björnu tók
í Bragalundi
ok ætt ara
oddum saddak.$txt$, $txt$»Det utförde ylvingars
ättling nyss
väster om havet,
om veta dig lyster,
att björnar jag tog
i Bragalunden
och örnens ätt
med uddarne mättade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Nú er sagt, mær,
hvaðan sakar gerðusk,
því var á legi mér
lítt steikt etit."$txt$, $txt$Nu orsaken, mö,
är yppad därtill;
stekt därför föga
vi fingo på havet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Víg lýsir þú,
varð fyr Helga
Hundingr konungr
hníga at velli;
bar sókn saman,
er sefa hefnduð
ok busti blóð
á brimis eggjar."$txt$, $txt$»Dråp ger du tillkänna;
död måste på valplatsen
konung Hunding
för Helge falla.
Det drabbades samman,
då släkt I hämnaden,
och blod sprutade
på spetsen av svärdet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Hvat vissir þú,
at þeir séim,
snót svinnhuguð,
er sefa hefndum?
Margir ro hvassir
hildings synir
ok ámunir
ossum niðjum."$txt$, $txt$»Hur visste du,
att vi voro de,
snabbtänkta mö,
som släkt hämnade?
Många hjältesöner
djärva äro
och snarlika
släktingar till oss.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"Vark-a ek fjarri,
folks oddviti,
gær á morgun
grams aldrlokum,
þó tel ek slægjan
Sigmundar bur,
er í valrúnum
vígspjöll segir.$txt$, $txt$»Ej var jag fjärran,
du folkets hövding,
i går på morgonen
vid den grymmes livsslut;
dock Sigmunds son
slug jag anser,
då i dunkla ord
du döljer din bragd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Leit ek þik um sinn
fyrr á langskipum,
þá er þú byggðir
blóðga stafna
ok úrsvalar
unnir léku;
nú vill dyljask
döglingr fyr mér,
en Högna mær
Helga kennir."$txt$, $txt$Förr en gång såg jag dig
fara på långskepp,
när du stod och stred
i stammen den blodiga,
och svala vågor
svallande lekte.
Nu vill sig drotten
dölja för mig,
men Hognes mö
Helge känner.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Sótti Sigrún
sikling glaðan,
heim nam hon Helga
hönd at sækja,
kyssti ok kvaddi
konung und hjalmi;
þá varð hilmi
hugr á vífi.$txt$, $txt$Sigrun sökte
segerglad furste,
fattade Helges
hand i sin,
kysste och hälsade
härskaren i hjälm;
kärlek då fattade
fursten till vivet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Fyrr lézk hon unna
af öllum hug
syni Sigmundar
en hon sét hafði.$txt$, $txt$Hon sade sig älska
av all sin håg
Sigmunds son,
innan hon sett honom.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$"Var ek Höðbroddi
í her föstnuð,
en jöfur annan
eiga vildak;
þó sjámk, fylkir,
frænda reiði,
hefi ek míns föður
munráð brotit."$txt$, $txt$»Med Hodbrodd blev jag
i hären förlovad,
men en annan ädling
äga jag ville;
dock fruktar jag, furste,
mina fränders vrede,
mot min faders egen
önskan jag brutit.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Nam-a Högna mær
of hug mæla,
hafa kvaðsk hon Helga
hylli skyldu.$txt$, $txt$Ej Hognes dotter
dolde sina tankar,
sade Helges huldhet
sig hava önska.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Hirð eigi þú
Högna reiði
né illan hug
ættar þinnar.
Þú skalt, mær ung,
at mér lifa;
ætt áttu, in góða,
er ek eigi sjámk."$txt$, $txt$»Vårda dig icke
om vreden hos Hogne
eller oviljan
hos ätten din!
Unga mö, du skall
hos mig leva;
dina fränder, du goda,
fruktar jag icke.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Hver er skjöldungr,
sá er skipum stýrir,
lætr gunnfana
gullinn fyr stafni?
Þykkja mér fríð
í fararbroddi;
verpr vígroða
um víkinga.$txt$, $txt$»Vem är den sköldung,
som skeppen styr,
och gyllene stridsfana
i stammen hissar?
Ej frid tycks mig vara
i främsta spetsen,
kring vikingar blodsrodnad
blänker i skyn.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Hér má Höðbroddr
Helga kenna
flótta trauðan
í flota miðjum,
hann hefir eðli
ættar þinnar
arf Fjörsunga,
und sik þrungit."$txt$, $txt$»Här må Hodbrodd
Helge känna,
den till flykt tröge,
i flottans mitt.
Din ätts odaljord
han under sig tvungit,
fjorsungaarvet
med fejd vunnit.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Því fyrr skulu
at Frekasteini
sáttir saman
um sakar dæma;
mál er, Höðbroddr,
hefnd at vinna
ef vér lægra hlut
lengi bárum."$txt$, $txt$»Dess förr vi skola
vid Frekastein
sams till samman
om vår sak tala.
Tid är, Hodbrodd,
hämnd att vinna,
om den lägsta lotten
vi länge fingo.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Fyrr mundu, Guðmundr,
geitr of halda
ok bergskorar
brattar klífa,
hafa þér í hendi
heslikylfu,
þat er þér blíðara
en brimis dómar.$txt$, $txt$»Förr skall du, Gudmund,
fösa getter
och i branta
bergsklyftor kliva,
hava i handen
en hasselpåk;
det ser du hellre
än svärdets domar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$"Þér er, Sinfjötli,
sæmra miklu
gunni at heyja
ok glaða örnu
en ónýtum
orðum at bregða,
þótt hildingar
heiftir deili.$txt$, $txt$»Det synes dig bättre,
Sinfjotle, passa
att gå i strid
och glädja ornar
än med onyttiga
ord att tvista,
om än hätskhet
härskarne skiljer.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Þykkja-t mér góðir
Granmars synir,
þó dugir siklingum
satt at mæla;
þeir merkt hafa
á Móinsheimum,
at hug hafa
hjörum at bregða;
eru hildingar
hölzti snjallir.$txt$, $txt$Ej goda tyckas mig
Granmars söner
men sanning dock höves
en hövding att säga.
På Moinsheim
märka de läto,
att de saknade ej att svinga
svärden mod,
mycket käcka
kämpar de äro.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Mun-a þér, Sigrún
frá Sefafjöllum
Höðbroddr konungr,
hníga at armi;
liðin er ævi
- oft náir hrævi
gránstóð gríðar, -
Granmars sona."$txt$, $txt$»Icke skall Sigrun
från Sevafjällen,
konung Hodbrodd,
dig hålla i famn.
Gånget är livet
för Granmars söner;
ulvaflocken grå
äter ymigt lik.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Er-at þér at öllu,
alvitr, gefit,
- þó kveð ek nökkvi
nornir valda -:
fellu í morgun
at Frekasteini
Bragi ok Högni,
varð ek bani þeira.$txt$, $txt$»Ej allt, du kloka,
blev idel lycka,
dock säger jag, att nornorna
något vålla.
På morgonen föllo
vid Frekastein
Brage och Hogne;
deras baneman var jag.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$En at Styrkleifum
Starkaðr konungr,
en at Hlébjörgum
Hrollaugs synir;
þann sá ek gylfa
grimmúðgastan,
er barðisk bolr,
var á brott höfuð.$txt$, $txt$Rollaugs söner livet
vid Lebjorg miste,
men konung Starkad
vid Styrkleiv föll;
denna furste var det vildaste
väsen jag sett,
då bålen slogs,
fast borta var huvudet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Liggja at jörðu
allra flestir
niðjar þínir,
at náum orðnir;
vannt-at-tu vígi,
var þér þat skapat,
at þú at rógi
ríkmenni vart."$txt$, $txt$De allra flesta
av fränderna dina
ligga på jorden,
till lik vordna.
Hindra kampen du ej kunnat;
det kom på din lott,
att för stormän
till strid du blev.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Huggastu, Sigrún!
Hildr hefr þú oss verið;
vinna-t skjöldungar sköpum."$txt$, $txt$Da grät Sigrun. Han sade:
»Trösta dig, Sigrun!
Ett tvistefrö du varit oss.
ej sköldungar skickelsen motstå.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$"Trauðr em ek, systir,
trega þér at segja,
því at ek hefi nauðigr
nifti grætta;
fell í morgun
und Fjöturlundi
buðlungr, sá er var
beztr í heimi
ok hildingum
á halsi stóð."$txt$, $txt$»Sen är jag, syster,
din sorg att båda,
ty nödtvungen jag
min närmaste bedrövat.
På morgonen föll
vid Fjoturlunden,
den bäste furste,
som bodde i världen,
som alla hövdingar
på halsen stod.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$"Þik skyli allir
eiðar bíta,
þeir er Helga
hafðir unna
at inu ljósa
Leiftrar vatni
ok at úrsvölum
Unnarsteini.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Skríði-at þat skip,
er und þér skríði,
þótt óskabyrr
eftir leggisk;
renni-a sá marr,
er und þér renni,
þóttú fjándr þína
forðask eigir.$txt$, $txt$Segle ej det skepp,
som seglar med dig,
fast förlig vind
efter fartyget blåser!
Löpe ej den häst,
som löper med dig,
fast för fiender
du flykta skall!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Bíti-a þér þat sverð,
er þú bregðir,
nema sjalfum þér
syngvi of höfði.
Þá væri þér hefnt
Helga dauða,
ef þú værir vargr
á viðum úti
auðs andvani
ok alls gamans,
hefðir eigi mat,
nema á hræjum spryngir."$txt$, $txt$Bite ej det svärd,
som svänges av dig,
om ej dig själv
det sjunger om huvudet.
På dig vore hämnad
Helges död,
om du vore en varg
i villande skog
utan egendom
och all gamman
och föda ej finge,
om de fallne du ej åte.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$"Ær ertu, systir,
ok örvita,
er þú bræðr þínum
biðr forskapa;
einn veldr Óðinn
öllu bölvi,
því at með sifjungum
sakrúnar bar.$txt$, $txt$»Vansinnig, syster,
och från vettet du är,
då du önskar ofärd
åt egen broder.
Oden ensam
allt ont vållar,
ty mellan släktingar
söndring han stiftat.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Þér býðr bróðir
bauga rauða,
öll Vandilsvé
ok Vígdali;
hafðu halfan heim
harms at gjöldum,
brúðr baugvarið,
ok burir þínir."$txt$, $txt$Din broder röda
ringar dig bjuder,
hela Vandilsve
och Vigdalarne.
Tag halva boet
till bot för din sorg,
du smyckade brud,
jämte sönerna dina!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$"Sitk-a ek svá sæl
at Sefafjöllum
ár né of nætr,
at ek una lífi,
nema at liði lofðungs
ljóma bregði,
renni und vísa
Vígblær þinig,
gullbitli vanr,
knega ek grami fagna.$txt$, $txt$»Så säll jag ej sitter
vid Sevafjällen,
arla eUer särla,
att jag älskar livet,
om konungens krigare
ej kasta glans
och Vigblär ej hit
med hövdingen löper,
guldbetslade fålen,
och ej fursten jag hälsar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$Svá hafði Helgi
hrædda görva
fjándr sína alla
ok frændr þeira
sem fyr ulfi
óðar rynni
geitr af fjalli
geiskafullar.$txt$, $txt$Så hade Helge
hållit i rädsla
sina fiender alla
och fränderna deras,
som getter vilda
för vargen springa,
fuUa av fasa,
från fjället ned.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$Svá bar Helgi
af hildingum
sem ítrskapaðr
askr af þyrni
eða sá dýrkalfr
döggu slunginn
er efri ferr
öllum dýrum
ok horn glóa
við himin sjalfan."$txt$, $txt$Helge så högt
över hövdingar stod
som ädelformad
ask över törne,
och som daggstänkt hjort
bland djuren går
och huvudet bär
högre än alla
och hornen glänsa
mot himmelen själv.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$"Þú skalt, Hundingr,
hverjum manni
fótlaug geta
ok funa kynda,
hunda binda,
hesta gæta,
gefa svínum soð,
áðr sofa gangir."$txt$, $txt$»Åt männen alla
måste du, Hunding,
fotbad bära
och brasa tända,
hundar binda,
hästar vakta,
giva svinen mat,
förrn till sängs du går.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$"Hvárt eru þat svik ein,
er ek sjá þykkjumk,
eða ragnarök,
- ríða menn dauðir,
er jóa yðra
oddum keyrið -
eða er hildingum
heimför gefin?"$txt$, $txt$»Är blott svek den syn,
som se jag tycker mig,
eller ragnarök.
Rida väl de döde,
då I huggen med sporrar
hästarne edra,
eller har åt hövdingar
hemlov givits?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$"Er-a þat svik ein,
er þú sjá þykkisk,
né aldar rof,
þóttú oss lítir,
þótt vér jóa óra
oddum keyrim,
né er hildingum
heimför gefin."$txt$, $txt$»Ej blott svek är den syn,
som se du tycker dig,
ej åldrarnes ände,
fast oss du ser,
fast vi hugga med sporrar
hästarne våra,
fast hellre har åt hövdingar
hemlov givits.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$"Út gakk þú, Sigrún
frá Sefafjöllum,
ef þik folks jaðar
finna lystir;
upp er haugr lokinn,
kominn er Helgi,
dolgspor dreyra,
döglingr bað þik,
at þú sárdropa
svefja skyldir."$txt$, $txt$»Gå ut, du Sigrun
från Sevafjällen,
om dig lyster att folkets
furste träffa.
Högen är öppen,
Helge är kommen.
Såren blöda,
och så bad dig fursten,
att sårets ström
du stilla skulle.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$"Nú em ek svá fegin
fundi okkrum
sem átfrekir
Óðins haukar,
er val vitu,
varmar bráðir,
eða dögglitir
dagsbrún sjá.$txt$, $txt$»Nu gläder mig så mycket,
att vi mött varandra,
som Odens hungrande
hökar glädjas,
när de veta om valplatsens
varma stekar
eller dagens gryning
daggstänkta se.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$Fyrr vil ek kyssa
konung ólifðan
en þú blóðugri
brynju kastir;
hár er þitt, Helgi,
hélu þrungit,
allr er vísi
valdögg sleginn,
hendr úrsvalar
Högna mági;
hvé skal ek þér, buðlungr,
þess bót of vinna?"$txt$, $txt$Dig vill jag kyssa,
döde konung,
förr än du blodiga
brynjan avtager.
Ditt hår är, Helge,
höljt med rimfrost,
fursten är fullstandigt
färgad med blod,
händerna kalla
på Hognes måg.
Huru skall bättring
din brud åt dig vinna?$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$"Ein veldr þú, Sigrún
frá Sefafjöllum,
er Helgi er
harmdögg sleginn;
grætr þú, gullvarið,
grimmum tárum,
sólbjört, suðræn,
áðr þú sofa gangir;
hvert fellr blóðugt
á brjóst grami,
úrsvalt, innfjalgt,
ekka þrungit.$txt$, $txt$»Ensam du, Sigrun,
från Sevafjallen,
vållar, att Helge
är våt av tårar.
Du gråter, du guldprydda,
av grämelse tårar,
du solbjärta, sydländska,
förrn att sova du går.
Var tår faller blodig
på bröstet av fursten,
iskall, inbränd,
av ångest fylld.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$Vel skulum drekka
dýrar veigar,
þótt misst hafim
munar ok landa;
skal engi maðr
angrljóð kveða,
þótt mér á brjósti
benjar líti;
nú eru brúðir
byrgðar í haugi,
lofða dísir,
hjá oss liðnum."$txt$, $txt$Dock kom, låt oss dricka
kostliga drycken,
fast livslust och land
förlorat vi hava.
Ingen skall kväda
klagovisa,
fast han ser svåra
sår på mitt bröst,
ty en brud nu höljes
utav högen,
en furstedotter
hos oss fallna är.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$"Hér hefi ek þér, Helgi,
hvílu görva
angrlausa mjök,
Ylfinga niðr,
vil ek þér í faðmi,
fylkir, sofna
sem ek lofðungi
lifnum myndak."$txt$, $txt$»Här har jag bäddat
dig, Helge, en säng,
som från ängslan är fri,
du ylvingaättling!
I din famn jag vill,
du furste, somna,
som hos levande hjälten
jag göra skulle.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$"Nú kveð ek enskis
örvænt vera
síð né snimma
at Sefafjöllum,
er þú á armi
ólifðum sefr,
hvít, í haugi,
Högna dóttir,
ok ertu kvik,
in konungborna.$txt$, $txt$»Nu säger jag intet
oväntat vara
sent eller tidigt
vid Sevafjällen,
när på den avlidnes
arm du sover
i högen, du vita,
Hognes dotter;
är dock kvar i livet,
du konungborna.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$Mál er mér at ríða
roðnar brautir,
láta fölvan jó
flugstíg troða;
skal ek fyr vestan
vindhjalms brúar,
áðr Salgófnir
sigrþjóð veki."$txt$, $txt$Tid är mig att rida
rodnande vägar,
låta bleka fålen
flyga sin stig.
Väster jag skall
om vindhemmets bro,
förrän Salgovner
segerhjältar väcker.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$"Kominn væri nú,
ef koma hygði,
Sigmundar burr
frá sölum Óðins;
kveð ek grams þinig
grænask vánir,
er á asklimum
ernir sitja
ok drífr drótt öll
draumþinga til."$txt$, $txt$»Kommen vore nu,
om komma han tänkte,
Sigmunds son
från Odens salar.
Hoppet bleknar,
att härskarn kommer
när örnarna sitta
på askens grenar
och drottföljet drager
till drömmarnes ting.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$"Verðu eigi svá ær,
at ein farir,
dís skjöldunga,
draughúsa til;
verða öflgari
allir á nóttum
dauðir dolgar, mær,
en um daga ljósa."$txt$, $txt$Var ej avvita nog
att ensam färdas,
du sköldungars dis,
till de dödas boning,
ty mäktigare bliva,
mö, om natten
alla dödas vålnader
än i dagens ljus.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Helge Hundingsbane$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);

-- ===== Kvädet om Helge Hjorvardsson  (Helgakviða Hjörvarðssonar) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Sáttu Sigrlinn
Sváfnis dóttur,
mey ina fegrstu
í munarheimi?
Þó hagligar
Hjörvarðs konur
gumnum þykkja
at Glasislundi."$txt$, $txt$»Såg du Sigrlinn,
Svavners dotter,
den fagraste mö
i Munarheim,
dock även täcka
tyckas för männen
de hustrur, som Hjorvard
har i Glasislund.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Mundu við Atla
Iðmundar son,
fugl fróðhugaðr,
fleira mæla?"$txt$, $txt$»Skall du med Atle,
Idmunds son,
mångvise fågel,
mera tala?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Kjós-at-tu Hjörvarð
né hans sonu
né inar fögru
fylkis brúðir,
eigi brúðir þær,
er buðlungr á;
kaupum vel saman,
þat er vina kynni."$txt$, $txt$»Kora ej Hjorvard
och ej konungens söner,
ej heller furstens
fagra brudar,
icke de kvinnor,
som kungen äger!
Blivom väl överens,
som vänner pläga!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Hof mun ek kjósa,
hörga marga,
gullhyrnðar kýr
frá grams búi,
ef hánum Sigrlinn
sefr á armi
ok ónauðig
jöfri fylgir."$txt$, $txt$»Tempel skall jag välja,
talrika altaren,
guldhornade kor
från konungens gård,
om Sigrlinn
sover i hans famn
och följer otvungen
fursten hem.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Höfum erfiði
ok ekki örindi,
mara þraut óra
á meginfjalli,
urðum síðan
Sæmorn vaða,
þá var oss synjat
Sváfnis dóttur,
hringum gæddrar,
er vér hafa vildum."$txt$, $txt$»Möda jag haft
men har målet ej nått;
vara hästar tröttnade
på höga fjället,
sedan vi måste
över Sämorn vada;
så svarades oss nekande
om Svavners dotter,
den med ringar utstyrda,
som vi erhålla ville.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$"Síð muntu, Helgi,
hringum ráða,
ríkr rógapaldr,
né Röðulsvöllum,
- örn gól árla, -
ef þú æ þegir,
þótt þú harðan hug,
hilmir, gjaldir."$txt$, $txt$»Sent skall du, Helge,
du höge hjälte,
råda över ringar
och Rodulsslätterna
- en örn skriar tidigt -
om du alltid tiger,
fast ett hårt sinne
du, härskare, visar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$"Hvat lætr þú fylgja
Helga nafni,
brúðr bjartlituð,
alls þú bjóða ræðr?
Hygg þú fyr öllum
atkvæðum vel.
Þigg ek eigi þat,
nema ek þik hafa."$txt$, $txt$»Vad gåva följer
att fästa namnet Helge,
du bländande brud,
då du bjuder mig det.
Tänk väl efter,
vad du vill säga;
det tar jag ej emot,
om ej dig jag får.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Sverð veit ek liggja
í Sigarsholmi
fjórum færi
en fimm tögu;
eitt er þeira
öllum betra
vígnesta böl
ok varit gulli.$txt$, $txt$»Svärd vet jag ligga
i Sigarsholm
fyra färre
än fem tiotal;
ett av dem
av alla är bäst,
skärande sköld
och skimrande av guld.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Hringr er í hjalti,
hugr er í miðju,
ógn er í oddi
þeim er eiga getr;
liggr með eggju
ormr dreyrfáiðr,
en á valböstu
verpr naðr hala."$txt$, $txt$Ring är i fästet,
friskt mod i mitten,
skräck för ägarn
i udden är;
orm, målad med blod,
längs eggen ligger,
och på handtaget
kastar huggormen
stjärten.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Ert-at-tu, Hjörvarðr
heilráðr konungr,
folks oddviti,
þótt þú frægr séir;
léztu eld eta
jöfra byggðir,
en þeir angr við þik
ekki gerðu.$txt$, $txt$»En insiktsfull konung,
är du ej, Hjorvard,
du fylkingars främste,
fast frejdad du är;
du lät elden fräta
furstars bygder,
som mot dig intet
ont gjorde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$En Hróðmarr skal
hringum ráða,
þeim er áttu
órir niðjar;
sá sésk fylkir
fæst at lífi,
hyggsk aldauða
arfi at ráða."$txt$, $txt$Men Rodmar
råda skall för ringar,
som våra fränder
förut ägde;
den fursten föga
fruktar för livet,
anser sig utdödas
arv behärska.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"Hverir ro hölðar
í Hatafirði?
Skjöldum er tjaldat á skipum;
fræknliga látið,
fátt hygg ek yðr séask,
kennið mér nafn konungs."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$"Helgi hann heitir,
en þú hvergi mátt
vinna grand grami;
járnborgir ro
of öðlings flota;
knegu-t oss fálur fara."$txt$, $txt$Helge han heter,
men härskarn du ej
makt har att men vålla;
järnskydd äro
kring hjältens flotta,
oss tillfoga trollkvinnor intet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$"Hvé þik heitir,
halr inn ámáttki,
hvé þik kalla konir?
Fylkir þér trúir,
er þik í fögrum lætr
beits stafni búa."$txt$, $txt$»Hur kallar du dig,
du karl så stark,
hur nämna dig männen vid namn?
Fursten på dig litar
då han låter dig på skeppet
i fagra stäven stå.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$"Atli ek heiti,
atall skal ek þér vera,
mjök em ek gífrum gramastr;
úrgan stafn
ek hefi oft búit
ok kvalðar kveldriður.$txt$, $txt$»Atle jag heter,
ettrig skall jag dig vara,
jättekvinnor göra mig gramse;
den våta stäven
jag värnat ofta
och kvällens trollpackor kvalt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Hvé þú heitir,
hála nágráðug?
Nefndu þinn, fála, föður;
níu röstum
er þú skyldi neðar vera
ok vaxi þér á baðmi barr."$txt$, $txt$Vad heter du, häxa,
hungrig efter lik?
Tälj oss, troll, om din fader!
Nio mil skulle
längre ned du vara,
Må barrskog växa på din barm!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$"Hrímgerðr ek heiti,
Hati hét minn faðir,
þann vissa ek ámáttkastan jötun;
margar brúðir
hann lét frá búi teknar,
unz hann Helgi hjó."$txt$, $txt$»Rimgard jag heter
och Hate min fader,
den väldigaste jätte jag vetat;
många brudar
från bostaden tog han,
tills Helge ihjäl honom högg.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Þú vart, hála,
fyr hildings skipum
ok látt í fjarðar mynni fyrir;
ræsis rekka
er þú vildir Rán gefa,
ef þér kæmi-t í þverst þvari."$txt$, $txt$»Du var, häxa,
framför hövdingens skepp,
i fjordmynnet låg du på lur.
Du hövdingens hjältar
ville giva åt Ran,
om ej spjutet dig i valköttet sprungit.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Duliðr ertu nú, Atli,
draums kveð ek þér vera,
síga lætr þú brýnn fyr bráar;
móðir mín
lá fyrir mildings skipum;
ek drekkða Hlövarðs sonum í hafi.$txt$, $txt$»Dårad är du, Atle,
drömma jag tror dig,
du sänker dina ögonbryn i sömn;
min moder låg
framför milde furstens skepp,
jag sänkte Lodvards
söner i sjön.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Gneggja myndir þú, Atli,
ef þú geldr né værir,
brettir sinn Hrímgerðr hala;
aftarla hjarta,
hygg ek, at þitt, Atli, sé,
þótt hafir reina rödd."$txt$, $txt$Gnägga skulle du, Atle,
om ej utskuren du vore,
Rimgärd sätter rumpan i vädret.
Baktill, Atle,
ej i bröstet är ditt hjärta,
fast en hingst du låter likt.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Reini mun þér ek þykkja
ef þú reyna knátt,
ok stíga ek á land af legi,
öll muntu lemjask,
ef mér er alhugat,
ok sveigja þinn, Hrímgerðr, hala."$txt$, $txt$»Som en hingst jag skall dig synas,
om försöka du kan
och från sjön jag stiger å strand.
Du slås sönder och samman,
om sinnet rinner på mig,
och får sänka, Rimgärd, din svans.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Atli, gakk þú á land,
ef afli treystisk,
ok hittumk í vík Varins;
rifja rétti
er þú munt, rekkr, fáa,
ef þú mér í krummur kemr."$txt$, $txt$»Gå i land då, Atle,
om du litar på din styrka,
låt oss träffas i Varins vik!
Revbenen, karl,
skall du rätade få,
om du kommer i klorna på mig.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$"Munk-a ek ganga,
áðr gumnar vakna
ok halda of vísa vörð;
er-a mér örvænt,
nær óru kemr
skass upp undir skipi."$txt$, $txt$»Härifrån jag ej går,
förrän folket vaknar
och håller om hövdingen vakt.
Troligt nog är,
att en trollkvinna kommer
och skjuter upp under vårt skepp.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$"Vaki þú, Helgi,
ok bæt við Hrímgerði,
er þú lézt höggvinn Hata;
eina nótt
kná hon hjá jöfri sofa,
þá hefr hon bölva bætr."$txt$, $txt$»Vakna du, Helge,
och vedergäll Rimgärd,
att Hate ned du högg.
Får en enda natt
hos ädlingen hon sova,
är bot för oförrätt bragt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Loðinn heitir, er þik skal eiga,
leið ertu mannkyni,
sá býr í Þolleyju þurs,
hundvíss jötunn,
hraunbúa verstr,
sá er þér makligr maðr."$txt$, $txt$»Han heter Luden, som får dig,
led är du för mankön,
den tursen i Tollö bor;
en den visaste jätte,
den värste av bergfolket,
åt dig lagom han sig lämpar till man.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Hina vildu heldr, Helgi,
er réð hafnir skoða
fyrri nótt með firum;
marggullin mær
mér þótti afli bera;
hér sté hon land af legi
ok festi svá yðvarn flota;
hon ein því veldr,
er ek eigi mák
buðlungs mönnum bana."$txt$, $txt$»Henne vill du hellre ha,
som hamnarne granskade
den förra natten bland folket,
en mö, strålande av guld;
starkare hon mig tycktes.
Här steg hon på strand från sjön
och fäste så eder flotta.
Hon ensam vållar,
att jag icke kan
furstens män bliva till bane.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$"Heyr nú, Hrímgerðr,
ef ek bæti harma þér,
segðu görr grami:
Var sú ein vættr,
er barg öðlings skipum,
eða fóru þær fleiri saman?"$txt$, $txt$»Hör du, Rimgärd,
om jag håller dig skadeslös,
säg till fullo för fursten!
Var hon ensam, som frälste
furstens skepp
eller foro de flera till samman?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Þrennar níundir meyja,
þó reið ein fyrir
hvít und hjalmi mær;
marir hristusk,
stóð af mönum þeira
dögg í djúpa dali,
hagl í háva viðu;
þaðan kemr með öldum ár,
allt var mér þat leitt, er ek leitk."$txt$, $txt$»Tre flockar av nio,
dock främst av dem
red en mö under hjälmen mjällvit;
sig fålarne skakade,
da föll ifrån manarna
dagg i djupa dalar,
hagel i höga skogar,
det giver åt jorden gott år;
led var mig den syn, jag såg.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Austr líttu nú, Hrímgerðr,
ef þik lostna hefr
Helgi helstöfum;
á landi ok á vatni
borgit er lofðungs flota
ok siklings mönnum it sama."$txt$, $txt$»Se nu österut, Rimgärd,
om dig råkat har
Helge med död och fördärv.
På hav och på land
är härskarens flotta bärgad
och furstens män ej mindre.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$"Dagr er nú, Hrímgerðr,
en þik dvalða hefr
Atli til aldrlaga;
hafnarmark
þykkir hlægligt vera,
þars þú í steins líki stendr."$txt$, $txt$Dager är nu, Rimgärd,
men dig har Atle
till döds med samtal sinkat.
Som ett löjligt sjömärke
lär du synas,
där du star i stens skepnad.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$"Kom þú heill, Heðinn,
hvat kanntu segja
nýra spjalla
ór Nóregi?
Hví er þér, stillir,
stökkt ór landi
ok ert einn kominn
oss at finna?"$txt$, $txt$»Välkommen, Hedin!
Vad kan du säga
för nyheter
från Norge?
Vi är du, drott,
driven ur landet
och har ensam kommit
oss att träffa?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$"[Erumk-a, stillir,
stökkt ór landi],
mik hefr miklu glæpr
meiri sóttan:
Ek hefi körna
ina konungbornu
brúði þína
at bagarfulli."$txt$, $txt$»Mig mycket större
missgärning råkat
(än dig broder
jag böta kan);
jag har korat
den konungborna
bruden din
vid bragebägarn.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$"Sakask eigi þú,
sönn munu verða
ölmál, Heðinn,
okkur beggja.
Mér hefir stillir
stefnt til eyrar,
þriggja nátta
skylak þar koma;
if er mér á því,
at ek aftr koma;
þá má at góðu
gerask slíkt, ef skal."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$"Sagðir þú, Helgi,
at Heðinn væri
góðs verðr frá þér
ok gjafa stórra;
þér er sæmra
sverð at rjóða,
en frið gefa
fjándum þínum."$txt$, $txt$»Sade du, Helge,
att Hedin vore
värd gott från dig
och gåvor stora?
Bättre dig höves
att bloda ditt svärd
än dina fiender
frid att giva.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$"Reið á vargi,
er rökvit var,
fljóð eitt, er Heðinn
fylgju beiddi;
hón vissi þat,
at veginn myndi
Sigrlinnar sonr
á Sigarsvöllum."$txt$, $txt$»På varg en kvinna
i kvällsskymning red,
som bad Hedin
att bjuda henne sällskap.
Hon förutsag,
att falla skulle
Sigrlinns son
på Sigarsslätterna.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$Sendi Helgi
Sigar at ríða
eftir Eylima
eingadóttur;
"Bið bráðliga
búna verða,
ef hon vill finna
fylki kvikvan."$txt$, $txt$Helge sände
Sigar att rida
efter Eylimes
enda dotter.
»Bed henne raskt
redo bliva,
om hon vill finna,
fursten vid liv!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$"Mik hefr Helgi
hingat sendan
við þik, Sváfa,
sjalfa at mæla;
þik kvaðsk hilmir
hitta vilja,
áðr ítrborinn
öndu týndi."$txt$, $txt$»Mig haver Helge
hit sänt
att söka samtal,
Svava, med dig;
dig ville hjälten
gärna träffa,
innan den ädelborne
andan uppgav.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$"Hvat varð Helga
Hjörvarðs syni?
Mér er harðliga
harma leitat,
ef hann sær of lék
eða sverð of beit,
þeim skal ek gumna
grand of vinna."$txt$, $txt$»Hur gick det med Helge
Hjorvards son.
Hårt av sorg
jag hemsökt är,
om han slukats av havet,
om svärd honom bitit;
åt gärningsmannen gengäld
jag giva skall.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$"Fell hér í morgun
at Frekasteini,
buðlungr, sá er var,
baztr und sólu;
Alfr mun sigri
öllum ráða,
þótt þetta sinn
þörfgi væri."$txt$, $txt$»Här föll på morgonen
vid Frekastenen
den bäste furste,
som föddes under solen;
avgjord seger
Alf har vunnit,
vad denna gång
till gagn ej var.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$"Heil vertu, Sváfa,
hug skaltu deila,
sjá mun í heími
hinztr fundr vera;
téa buðlungi
blæða undir,
mér hefir hjörr komit
hjarta it næsta.$txt$, $txt$»Hell dig, Svava!
Sorg dig väntar.
Vi se varann i världen
för sista gången.
Blodet flyter
ur furstens sår;
svärdet trängde
tätt intill hjärtat.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$Bið ek þik, Sváfa,
- brúðr grát-at-tu -,
ef þú vill mínu
máli hlýða,
at þú Heðni
hvílu gervir
ok jöfur ungan
ástum leiðir."$txt$, $txt$Jag beder dig, Svava,
- min brud, gråt icke -
om du vill min
mening lyda,
att du åt Hedin
hängiver dig
och unge fursten
ömt älskar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$"Mælt hafða ek þat
í munarheimi,
þá er mér Helgi
hringa valði,
myndig-a ek lostig
at liðinn fylki
jöfur ókunnan
armi verja."$txt$, $txt$»Min menine jag sade
i Munarheim,
då Helge mig röda
ringar gav,
att, då fursten fallit,
jag ej frivilligt skulle
en oberömd furste
famna i kärlek.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$"Kysstu mik, Sváfa,
kem ek eigi áðr
Rogheims á vit
né Röðulsfjalla,
áðr ek hefnt hefik
Hjörvarðs sonar,
þess er buðlungr var
beztr und sólu."$txt$, $txt$»Kyss mig, Svava!
Jag svär att ej komma
till Rogheim åter
eller Rodulsfjällen,
förrän Helge Hjorvardsson
jag hämnat har,
den bäste furste,
som föddes under solen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Helge Hjorvardsson$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);

-- ===== Om Sinfjötles död  (Frá dauða Sinfjötla) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, NULL, $txt$Sigmundr Völsungsson var konungr á Frakklandi. Sinfjötli var elztr hans sona, annarr Helgi, þriði Hámundr. Borghildr, kona Sigmundar, átti bróður, er hét . . . . . . En Sinfjötli, stjúpson hennar, ok . . . . . . báðu einnar konu báðir, ok fyrir þá sök drap Sinfjötli hann.

En er hann kom heim, þá bað Borghildr hann fara á brott, en Sigmundr bauð henni fébætr, ok þat varð hon at þiggja. En at erfinu bar Borghildr öl. Hon tók eitr mikit, horn fullt, ok bar Sinfjötla.

En er hann sá í hornit, skilði hann, at eitr var í, ok mælti til Sigmundar: "Göróttr er drykkrinn, ái."

Sigmundr tók hornit ok drakk af. Svá er sagt at Sigmundr var harðgörr, at hvárki mátti hánum eitr granda útan né innan, en allir synir hans stóðust eitr á hörund útan.

Borghildr bar annat horn Sinfjötla ok bað drekka, ok fór allt sem fyrr. Ok enn it þriðja sinn bar hon hánum hornit ok þó ámælisorð með, ef hann drykki eigi af. Hann mælti enn sem fyrr við Sigmund.

Hann sagði: "Láttu grön sía þá, sonr."

Sinfjötli drakk ok varð þegar dauðr. Sigmundr bar hann langar leiðir í fangi sér ok kom at firði einum mjóvum ok löngum, ok var þar skip eitt lítit ok maðr einn á. Hann bauð Sigmundi far of fjörðinn. En er Sigmundr bar líkit út á skipit, þá var bátrinn hlaðinn. Karl mælti, at Sigmundr skyldi fara fyrir innan fjörðinn. Karl hratt út skipinu ok hvarf þegar.

Sigmundr konungr dvalðisk lengi í Danmörk í ríki Borghildar, síðan er hann fekk hennar. Fór Sigmundr þá suðr í Frakkland til þess ríkis, er hann átti þar. Þá fekk hann Hjördísar, dóttur Eylima konungs. Þeira son var Sigurðr.

Sigmundr konungr fell í orrostu fyrir Hundingssonum, en Hjördís giftist þá Álfi, syni Hjálpreks konungs. Óx Sigurðr þar upp í barnæsku. Sigmundr ok allir synir hans váru langt um fram alla menn aðra um afl ok vöxt ok hug ok alla atgervi. Sigurðr var þó allra framastr, ok hann kalla allir menn í fornfræðum um alla menn fram ok göfgastan herkonunga.$txt$, $txt$Sigmund Volsungsson var konung i Frankland; Sinfjotle var den äldste av hans söner, den andre var Helge, den tredje Hamund. Borghild, Sigmunds hustru, hade en broder, som hette ....... Men Sinfjotle, hennes styvson, och ....... friade båda till samma kvinna, och för den skull dödade honom Sinfjotle. Men när han kom hem, bad Borghild honom fara bort, men Sigmund bjöd henne penningar i böter, och dem måste hon mottaga. Men vid arvölet bar Borghild fram öl; hon tog gift, ett stort horn fullt, och bar fram åt Sinfjotle, men när han såg i hornet, urskilde han, att gift var i det, och sade till Sigmund: »Grumlig är drycken, gamlefar!» Sigmund tog hornet och drack ur. Det säges, att Sigmund var så hård, att gift varken kunde skada honom utvärtes eller invärtes, men alla hans söner uthärdade gift utanpå huden. Borghild bar ett annat horn åt Sinfjotle och bad honom dricka, och allt gick som förut. Och den tredje gången bar hon hornet till honom och sade stickord, om han ej drucke därur. Han sade åter som förut till Sigmund. Han sade: »Låt skägget sila det, son!» Sinfjotle drack och blev genast död.

Sigmund bar honom långa vägar i famnen på sig och kom till en smal och lång fjord, och där var en liten farkost och en man på; han erbjöd Sigmund att bli rodd över fjorden. Men när Sigmund bar liket ut på farkosten, var båten lastad; mannen sade, att Sigmund skulle färdas innanför fjordens ända. Mannen stötte ut farkosten och försvann genast.

Konung Sigmund stannade länge i Danmark i Borghilds rike, sedan han äktat henne. Sedan for Sigmund söder till Frankland till det rike, som han hade där. Då äktade han Hjordis, dotter till konung Eylime; deras son var Sigurd. Konung Sigmund föll i strid mot Hundings söner, men Hjordis gifte sig då med Alf, son till konung Hjalprek. Sigurd växte upp där i barndomen.

Sigmund och alla hans söner voro långt framom alla andra män i kraft och storlek och mod och all idrott. Sigurd var dock främst av alla, och honom säga alla i fornsagorna stå framför alla och vara den ansenligaste av härkonungar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Om Sinfjötles död$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no is null);

-- ===== Gripers spådom  (Grípisspá) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Hverr byggir hér
borgir þessar?
Hvat þann þjóðkonung
þegnar nefna?"$txt$, $txt$»Vem bor väl här
i denna borg?
Vad kalla krigarne
konungen över folket?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Er horskr konungr
heima í landi?
Mun sá gramr við mik
ganga at mæla?
Máls er þarfi
maðr ókunnigr,
vil ek fljótliga
finna Grípi."$txt$, $txt$»Är vise härskaren
hemma i landet?
Skall kungen med mig
komma till tals?
Okänd man
önskar hans samtal;
fort jag vill
finna Griper.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Þess mun glaðr konungr
Geiti spyrja,
hverr sá maðr sé,
er máls kveðr Grípi."$txt$, $txt$»Den glade konungen
skall Geiter spörja,
vem mannen är,
som möta vill Griper.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Þá gekk Geitir
Grípi at segja;
"Hér er maðr úti
ókuðr kominn;
hann er ítarligr
at áliti;
sá vill, fylkir,
fund þinn hafa."$txt$, $txt$Då gick Geiter
åt Griper att säga:
»Härute står kommen
en okänd man;
ädel han är
till utseendet;
inför dig, konung,
han komma vill.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Gengr ór skála
skatna dróttinn
ok heilsar vel
hilmi komnum:
"þiggðu hér, Sigurðr,
væri sæmra fyrr,
en þú, Geitir, tak
við Grana sjalfum."$txt$, $txt$Då träder krigarnes
konung ur salen
och hjärtligt hälsar
hjälten, som kommit:
»Välkommen, Sigurd!
Vi såg jag dig ej förr?
Men du, Geiter,
om Grane tag hand!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Mæla námu
ok margt hjala
þá er ráðspakir
rekkar fundusk.$txt$, $txt$De togo till att språka
och tala om mycket,
när rådvisa männen
råkade varandra.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$"Þú munt maðr vera
mæztr und sólu
ok hæstr borinn
hverjum jöfri,
gjöfull af gulli,
en glöggr flugar,
ítr áliti
ok í orðum spakr."$txt$, $txt$»En man skall du bliva,
mest ärad under sol,
och alla furstar
överlägsen,
slösande guld
men snålande flykt,
ädel att åse
och i ord vis.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Segðu, gegn konungr,
gerr en ek spyrja,
snotr, Sigurði,
ef þú sjá þykkisk:
Hvat mun fyrst gerask
til farnaðar,
þá er ór garði emk
genginn þínum?"$txt$, $txt$»Säg, kloke konung,
klarare än jag spörjer,
vis, för Sigurd,
om se du tycker dig,
vad först skall ske
till framgång för mig,
då ur din gård
gått jag har.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$"Fyrst muntu, fylkir,
föður of hefna,
ok Eylima
alls harms reka;
þú munt harða
Hundings sonu
snjalla fella,
muntu sigr hafa."$txt$, $txt$»Först skall du, furste,
din fader hämna
och allt ont
åt Eylime straffa;
du skall Hundings
hårda, djärva
söner fälla
och seger vinna.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Segðu, ítr konungr,
ættingi, mér
heldr horskliga,
er vit hugat mælum:
Sér þú Sigurðar
snör brögð fyrir,
þau er hæst fara
und himinskautum?"$txt$, $txt$»Säg, ädle konung,
min släkting, för mig,
med stor klokhet,
då förstånd vi tala;
ser du för Sigurd
snara bragder,
som högst stiga
mot himlens valv?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Muntu einn vega
orm inn frána,
þann er gráðugr liggr
á Gnitaheiði;
þú munt báðum
at bana verða
Regin ok Fáfni,
rétt segir Grípir."$txt$, $txt$»Ensam du skall dräpa
ormen den glänsande,
som glupsk ligger
på Gnitaheden.
Du skall båda
till bane varda,
Regin och Favner;
rätt säger Griper.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$"Auðr mun ærinn,
ef ek eflik svá
víg með virðum,
sem víst segir;
leið at huga
ok lengra seg:
Hvat mun enn vera
ævi minnar?"$txt$, $txt$»Ymnig blir min rikedom,
om jag utföra kan
i världen den strid,
som visst du spår mig.
Tänk dig om;
förtälj än längre,
vad mera skall hända
i mitt liv!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$"Þú munt finna
Fáfnis bæli
ok upp taka
auð inn fagra,
gulli hlæða
á Grana bógu;
ríðr þú til Gjúka,
gramr vígrisinn."$txt$, $txt$»Favners bo
du finna skall
och föra bort
den fagra skatten.
Guld skall du lasta
på Granes bogar;
ryktbar av striden,
du rider till Gjuke.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$"Enn skaltu hilmi
í hugaðsræðu,
framlyndr jöfurr,
fleira segja.
Gestr em ek Gjúka
ok ek geng þaðan,
hvat mun enn vera
ævi minnar?"$txt$, $txt$»Med kloka ord
för konungen skall du,
modige furste,
än mera säga.
Hos Gjuke är jag gäst
och går därifrån;
vad skall mera hända
i mitt liv?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$"Sefr á fjalli
fylkis dóttir
björt í brynju
eftir bana Helga;
þú munt höggva
hvössu sverði,
brynju rísta
með bana Fáfnis."$txt$, $txt$»På fjället sover,
furstens dotter,
bjärt i brynja
efter bane på Helge.
Vassa svärdet
svänga skall du,
med Favners bane
brynjan rista.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$"Brotin er brynja,
brúðr mæla tekr,
er vaknaði
víf ór svefni.
Hvat mun snót at heldr
við Sigurð mæla,
þat er at farnaði
fylki verði?"$txt$, $txt$»Bruten är brynjan,
bruden begynner
att tala, då vivet
vaknat ur sömnen.
Vad säger sedan
till Sigurd jungfrun,
som till fördel
för fursten bliver?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$"Hon mun ríkjum þér
rúnar kenna,
allar þær er aldir
eignask vildu,
ok á manns tungu
mæla hverja,
líf með lækning;
lifðu heill, konungr."$txt$, $txt$»Hon skall dig, ryktbare,
runor lära,
alla, som människor
ernå vilja,
och på varje mål
av människor tala,
och helande läkedom.
Var lycklig, konung!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Nú er því lokit,
numin eru fræði
ok em braut þaðan
búinn at ríða,
leið at huga
ok lengra seg:
Hvat mun meir vera
minnar ævi?"$txt$, $txt$»Lyktat är nu detta,
lärd är visdomen,
och redo jag är
att rida därifrån.
Tänk dig om,
förtälj än längre,
vad mera skall hända
i mitt liv!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Þú munt hitta
Heimis byggðir
ok glaðr vera
gestr þjóðkonungs;
farit er, Sigurðr,
þats ek fyrir vissak,
skal-a fremr en svá
fregna Grípi."$txt$, $txt$»Hinna skall du
Heimers bygder
och glad komma
till kungen som gäst.
Slut är nu, Sigurd,
vad jag såg av framtiden;
längre fram det Griper
ej lönt är att spörja$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Nú fær mér ekka
orð þatstu mæltir,
því at þú fram of sér
fylkir, lengra;
veiztu ofmikit
angr Sigurði,
því þú, Grípir, þat
gerr-a segja."$txt$, $txt$»Ängslan mig vållar
det ord, du sade,
ty, furste, längre
fram du ser.
För mycken sorg
för Sigurd vet du,
därför, Griper,
den du ej säger.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Lá mér um æsku
ævi þinnar
ljósast fyrir
líta eftir;
rétt em ek
ráðspakr taliðr
né in heldr framvíss,
farit þats ek vissak."$txt$, $txt$»Av livet ditt
låg mig ungdomen
ljusast före
att genomskåda.
Med rätta jag icke
räknas för vis,
ej heller för framsynt;
vad jag förutsåg, är borta.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Mann veit ek engi
fyr mold ofan,
þann er fleira sé
fram en þú, Grípir;
skal-at-tu leyna,
þótt ljót séi,
eða mein gerisk
á mínum hag."$txt$, $txt$»Ovan jord
ingen jag vet
som framtiden ser
fjärmare än Griper.
Du skall ej dölja,
fast dåligt det är
och mig min ställning
menlig bliver.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$"Er-a með löstum
lögð ævi þér,
láttu, inn ítri, þat,
öðlingr, nemask,
því at uppi mun,
meðan öld lifir,
naddéls boði,
nafn þitt vera."$txt$, $txt$»Med laster är icke
ditt liv dig bestämt,
låt, ädle furste,
lära dig det;
ty minnas skall ditt namn,
medan människor leva,
du vållare av vapnens
vinande storm!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$"Verst hyggjum því,
verðr at skiljask
Sigurðr við fylki
at sógöru;
leið vísa þú,
- lagt er allt fyrir -
mærr, mér, ef þú vilt,
móðurbróðir."$txt$, $txt$»Illa sker mig.
Skiljas måste
Sigurd från fursten,
då så är.
Visa mig vägen,
om du vill, morbroder!
I livet på förhand
allt ligger bestämt.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Nú skal Sigurði
segja görva,
alls þengill mik
til þess neyðir;
muntu víst vita
at vætki lýgr;
dægr eitt er þér
dauði ætlaðr."$txt$, $txt$»Nu skall för Sigurd
Jag säga noga,
då drotten mig
därtill nödgar.
Veta du skall,
att jag visst icke ljuger:
en dag åt dig,
döden är ämnad.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Vilk-at ek reiði
ríks þjóðkonungs,
góð ráð at heldr
Grípis þiggja;
nú vill víst vita,
þótt viltki sé,
hvat á sýnt Sigurðr
sér fyr höndum."$txt$, $txt$»Vrede jag vill ej
från väldige konungen
men goda råd
av Griper få.
Nu vill visst jag veta,
fast ej väl behagligt,
vad som dig synes
Sigurd vänta.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$"Fljóð er at Heimis
fagrt álitum,
hana Brynhildi
bragnar nefna,
dóttir Buðla,
en dýrr konungr
harðugðigt man
Heimir fæðir."$txt$, $txt$»En flicka är hos Heimer,
fager att åse,
och Brynhild henne
borgmännen nämna,
dotter till Budle,
men bålde konungen,
Heimer, fostrar
hårdsinta mön.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Hvat er mik at því,
þótt mær séi
fögr áliti
fædd at Heimis?
Þat skaltu, Grípir,
görva segja,
því at þú öll of sér
örlög fyrir."$txt$, $txt$»Vad gör det mig,
att en mö finnes,
fager att åse,
fostrad hos Heimer?
Det skall du, Griper,
grant mig säga,
ty ödet mitt
allt du förutser.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Hon firrir þik
flestu gamni,
fögr áliti,
fóstra Heimis,
svefn þú né sefr
né of sakar dæmir,
gár-a þú manna
nema þú mey séir."$txt$, $txt$»Hon gör, att glädjen
går ifrån dig,
Heimers fosterdotter,
fager att åse.
Sömn du ej sover,
ej om sak dömer,
på man du ej aktar,
om ej mön du ser.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$"Hvat mun til líkna
lagt Sigurði?
Segðu, Grípir, þat,
ef þú sjá þykkisk:
Mun ek mey ná
mundi kaupa,
þá ina fögru
fylkis dóttur?"$txt$, $txt$»Vad skall till lisa
lända Sigurd?
Säg du det, Griper,
om se du tycker dig!
Kan jag mön
till maka vinna,
denna furstens
fagra dotter?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$"It munuð alla
eiða vinna
fullfastliga,
fá munuð halda;
verit hefr þú Gjúka
gestr eina nótt,
mant-at-tu horska
Heimis fóstru."$txt$, $txt$»I skolen alla
eder svära
fullt och fast,
få I skolen hålla.
Gästat en natt
du gjort hos Gjuke,
så minns du ej mera
mön hos Heimer.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$"Hvat er þá, Grípir,
get þú þess fyr mér,
sér þú geðleysi
í grams skapi,
er ek skal við mey þá
málum slíta,
er ek alls hugar
unna þóttumk."$txt$, $txt$»Vad för nagot?
Nämn mig det, Griper!
Ser du flyktighet
i furstens lynne,
då bryta löftet
mot bruden jag skall,
som jag trodde mig älska
av all min själ?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$"Þú verðr, siklingr,
fyr svikum annars,
muntu Grímhildar
gjalda ráða,
mun bjóða þér
bjarthaddat man
dóttur sína,
dregr hon vél at gram."$txt$, $txt$»Du snärjes, ädling,
av annans svek,
för Grimhilds list
du lida skall.
Hon vill giva dig
ljushårig mö,
sin egen dotter;
anslag hon spinner.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$"Mun ek við þá Gunnar
görva hleyti
ok Guðrúnu
ganga at eiga?
Fullkvæni þá
fylkir væri,
ef meintregar
mér angraði-t."$txt$, $txt$»Blir jag med Gunnar
och hans bröder svåger
och går att taga
Gudrun till äkta?
Fullgott gifte
fursten då hade,
om ånger icke
ängslade mig.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$"Þik mun Grímhildr
görva véla,
mun hon Brynhildar
biðja fýsa
Gunnari til handa,
Gotna dróttni,
heitr þú fjótliga för
fylkis móður."$txt$, $txt$»Svika dig Grimhild
söka skall,
egga dig att bedja
om Brynhilds hand
för Gunnars räkning,
goterfurstens;
raskt furstens moder
färden du lovar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$"Mein eru fyr höndum,
má ek líta þat;
ratar görliga
ráð Sigurðar,
ef ek skal mærrar
meyjar biðja
öðrum til handa,
þeirar ek unna vel."$txt$, $txt$»Något menligt mig möter,
det märker jag grant;
svårligen vacklar
Sigurds ställning,
om bedja jag skall
till brud åt en annan
den sköna mö,
som själv jag älskar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$"Ér munuð allir
eiða vinna
Gunnar ok Högni,
en þú, gramr, þriði;
þá it litum víxlið,
er á leið eruð,
Gunnar ok þú;
Grípir lýgr eigi."$txt$, $txt$»I skolen alla
eder svära,
Gunnar och Hogne
och du, hövding, den tredje.
Då på vägen I ären,
växlen I skepnad,
Gunnar och du;
Griper ej ljuger.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$"Hví gegnir þat?
Hví skulum skipta
litum ok látum,
er á leið erum?
Þar mun fláræði
fylgja annat
atalt með öllu;
enn segðu, Grípir."$txt$, $txt$»Vad är skälet till det?
Vi skola vi skifta
sätt och utseende
samman på vägen?
Annan falskhet
följa det torde,
mycket elak.
Säg mera, Griper!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$"Lit hefir þú Gunnars
ok læti hans,
mælsku þína
ok meginhyggjur;
muntu fastna þér
framlundaða
fóstru Heimis,
sér vætr fyr því."$txt$, $txt$»Gunnars skepnad
och skick du har,
ditt eget tal
och tankekraft.
Du fäster den käcka
fosterdottern
till Heimer, men henne
till hustru ej får.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$"Verst hyggjum því,
vándr munk heitinn
Sigurðr með seggjum
at sógöru;
vilda ek eigi
vélum beita
jöfra brúði,
er ek æðsta veitk."$txt$, $txt$»Mycket illa det mig tyckes.
Usel bland män
skall Sigurd sägas,
då sådant sker.
List jag icke
lägga vill
mot furstedottern,
den främsta, jag vet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$"Þú munt hvíla,
hers oddviti
mærr, hjá meyju
sem þín móðir sé;
því mun uppi,
meðan öld lifir,
þjóðar þengill,
þitt nafn vera."$txt$, $txt$»Du, härens hövding,
härlig du skall
vila hos mön,
som din moder hon vore.
Därför skall minnas,
medan människor leva,
du folkens furste,
ditt frejdade namn.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$"Mun góða kván
Gunnarr eiga,
mærr með mönnum,
- mér segðu, Grípir, -
þótt hafi þrjár nætr
þegns brúðr hjá mér
snarlynd sofit?
Slíks eru-t dæmi."$txt$, $txt$»Skall Gunnar äga
den goda till hustru,
ryktbar bland män
- berätta mig, Griper! -
fast trenne nätter
hans trotsiga brud
har sovit hos mig?
Sådant har ej timat.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$"Saman munu brullup
bæði drukkin
Sigurðar ok Gunnars
í sölum Gjúka;
þá hömum víxlið,
er it heim komið;
hefr hvárr fyr því
hyggju sína."$txt$, $txt$»Samman skola bådas
bröllop drickas,
Sigurds och Gunnars,
i Gjukes salar.
Hamn I växlen,
då hem I kommit,
till själen var
sig själv förbliver.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$"Hvé mun at ynði
eftir verða
mægð með mönnum?
Mér segðu, Grípir.
Mun Gunnari
til gamans ráðit
síðan verða
eða sjalfum mér?"$txt$, $txt$»Hur skall sedan
svågerskapet
till gamman oss bliva,
Griper, säg det!
Skall det Gunnar
till glädje lända
eller mig själv
skänka hugnad?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$"Minnir þik eiða,
máttu þegja þó,
anntu Guðrúnu
góðra ráða;
en Brynhildr þykkisk
brúðr vargefin,
snót fiðr vélar
sér at hefndum."$txt$, $txt$»Du minns ederna åter,
kan ingenting säga,
du unnar Gudrun
äktenskapets lycka;
men Brynhild som bortslumpad
brud sig tycker,
den sluga söker
med svek att hämnas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$"Hvat mun at bótum
brúðr sú taka,
er vélar vér
vífi gerðum?
Hefir snót af mér
svarna eiða
enga efnda,
en unað lítit."$txt$, $txt$»Vad skall bruden
som böter taga,
för att vi smidde
svek mot vivet?
Hon äger av mig
eder svurna,
inga fyllda,
och föga kärlek.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$"Mun hon Gunnari
görva segja,
at þú eigi vel
eiðum þyrmðir,
þá er ítr konungr
af öllum hug,
Gjúka arfi,
á gram trúði."$txt$, $txt$»Hon skall gå
att Gunnar säga,
att icke du aktade
ederna väl,
då Gjukes arving,
den ädle konungen,
all sin lit
på ditt löfte satte.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$"Hvat er þá, Grípir,
get þú þess fyr mér,
mun ek saðr vera
at sögu þeiri,
eða lýgr á mik
lofsæl kona
ok á sjalfa sik?
Segðu, Grípir, þat."$txt$, $txt$»Vad för något!
Nämn mig det, Griper!
Skall sant det vara,
som säges om mig,
eller ljuger på mig
hjältekvinnan
och på sig själv?
Skönjer du det, Griper?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$"Mun fyr reiði
rík brúðr við þik
né af oftrega
allvel skipa;
viðr þú góðri
grand aldrigi,
þó ér víf konungs
vélum beittuð."$txt$, $txt$»Ej väl, av vrede
och värkande sorg,
dig mäktiga bruden
bemöta skall.
Den goda kvinnan
du kränkte icke,
dock drottningen I
bedrogen med list.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$"Mun horskr Gunnarr
at hvötun hennar
Gutþormr ok Högni
ganga síðan?
Munu synir Gjúka
á sifjugum mér
eggjar rjóða?
Enn segðu, Grípir."$txt$, $txt$»Skall Gunnar, den kloke,
Och Guttorm och Hogne
av hennes eggelse
sig hetsa låta?
Skola Gjukes söner
svärden bloda
på mig, sin svåger?
Säg du det, Griper!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$"Þá er Guðrúnu
grimmt um hjarta;
bræðr hennar
þér til bana ráða,
ok at engu verðr
ynði síðan
vitru vífi;
veldr því Grímhildr.$txt$, $txt$»Gruvligt det Gudrun
går till hjärtat;
dig hennes bröder
din bane vålla.
Till intet bliver
all glädje sedan
för visa vivet;
det vållar Grimhild.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 52, $txt$Því skal hugga þik,
hers oddviti,
sú mun gift lagið
á grams ævi:
Mun-at mætri maðr
á mold koma
und sólar sjöt,
en þú, Sigurðr, þykkir."$txt$, $txt$Det hugna dig skall,
du härens ledare,
att den lyckan för furstens
liv är bestämd:
ej märkligare man
ovan mullen skall födas
under solens säte
än, Sigurd, du anses.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=52);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 53, $txt$"Skiljumk heilir,
mun-at sköpum vinna.
Nú hefir þú, Grípir, vel
gört sem ek beiddak.
Fljótt myndir þú
fríðri segja
mína ævi,
ef þú mættir þat."$txt$, $txt$»Skiljoms i vänskap!
Man skickelsen ej motstår.
Väl har du, Griper,
vad jag ville, gjort.
Visst du skulle
vackrare spå
livet åt mig,
om du mäktade det.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Gripers spådom$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=53);

-- ===== Brottstycke av det större kvädet om Sigurd  (Sigurðarkviða hin meiri (Brot)) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Ęldr nam at œsask,
ęn jǫrð at skjalfa
ok hór logi
við himin gnæfa,
fár tręystisk þar
fylkis rekka
ęld at ríða
né yfir stíga.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Sigurðr Grana
sverði kęyrði
ęldr sloknaði
fyr ǫðlingi,
logi allr lægðisk
fyr lofgjǫrnum,
† bliku ręið,
es Ręginn átti.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Sigurðr vá at ormi,
ęn þat síðan mun
ęngum fyrnask,
meðan ǫld lifir,
ęn hlýri þinn
hvárki þorði
ęld at ríða
né yfir stíga.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Út gekk Sigurðr
andspjalli frá,
hollvinr lofða,
ok hnipnaði,
svát ganga nam
gunnarfúsum
sundr of síður
sęrkr járnofinn.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$[Hvat hęfr Sigurðr
til] saka unnit,
es frœknan vill
fjǫrvi næma?$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Mér hęfr Sigurðr
sęlda ęiða,
ęiða sęlda,
alla logna,
þá vélti hann mik,
es vesa skyldi
allra ęiða
ęinn fulltrúi.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Þik hęfr Brynhildr
bǫl at gørva
hęiptar hvattan
harm at vinna;
fyrman hón Goðrúnu
góðra ráða,
ęn síðan þér
sín at njóta.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Sumir ulf sviðu,
sumir orm sniðu,
sumir Gotþormi
af gera dęildu,
áðr þęir mætti
męins of lystir
á horskum hal
hęndr of lęggja.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Soltinn varð Sigurðr
sunnan Rínar;
hrafn at męiði
hótt kallaði:
ykr mun Atli
ęggjar rjóða,
munu vígskǫ́um
of viða ęiðar.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Úti stóð Goðrún
Gjúka dóttir,
ok hón þat orða
alls fyrst of kvað:
hvar ’s nú Sigurðr,
sęggja dróttinn,
es frændr mínir
fyrri ríða.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Ęinn því Hǫgni
andsvǫr vęitti:
sundr hǫfum Sigurð
sverði hǫggvinn,
gnapir æ grár jór
of grami dauðum.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Þá kvað Brynhildr
Buðla dóttir:
»vęl skuluð njóta
vápna ok landa,
ęinn myndi Sigurðr
ǫllu ráða,
ef hann lęngr lítlu
lífi hęldi.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Væria þat sœmt
at sá réði
Gjúka arfi
ok Gota męngi,
es hann fimm sonu
at folkræði,
gunnar fúsa,
getna hafði.«$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Hló þá Brynhildr,
bœr allr dunði,
ęinu sinni
af ǫllum hug:
lęngi skuluð njóta
landa ok þegna,
es frœknan gram
falla létuð.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Þá kvað þat Goðrún
Gjúka dóttir:
mjǫk mælir þú
miklar firnar;
gramir hafi Gunnar
gǫtvað Sigurðar,
hęiptgjarns hugar
hęfnt skal verða.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Framm vas kvelda,
fjǫlð vas drukkit,
þá vas hvívetna
vilmál talið,
sofnuðu allir
es í sæing kómu;
ęinn lęngr Gunnarr
ǫllum vakði.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Fót namat hrœra,
fjǫlð namat spjalla,
hitt hęrglǫtuðr
hyggja téði,
hvat þęir í bǫrvi
báðir sǫgðu
hrafn ęy ok ǫrn,
es hęim riðu.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Vaknaði Brynhildr
Buðla dóttir,
dís skjǫldunga,
fyr dag lítlu:
hvętið mik eða lętið mik,
harmr es unninn,
sorg at sęgja
eða svá láta.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Þǫgðu allir
við því orði,
fár kunni þęim
fljóða lǫ́tum,
es hón grátandi
gęrðisk at sęgja,
þats hlæjandi
hǫlða bęiddi:$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$»Hugðak mér Gunnarr
grimt í svefni,
svalt alt í sal,
ættak sæing kalda,
ęn þú gramr riðir
glaums andvani,
fjǫtri fatlaðr,
í fjanda lið.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Svá mun ǫll yður
ætt Niflunga
afli gęngin;
eruð ęiðrofa.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Mantat Gunnarr
til gǫrva þat,
es blóði í spor
báðir ręnduð,
nú hęfr hǫnum þat alt
illu launat,
es fręmstan þik
finna vildi.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Þá ręyndi þat,
es riðit hafði
móðigr á vit
mín at biðja,
hvé hęrglǫtuðr
hafði fyrri
ęiðum haldit
við hinn unga gram.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Bęnvǫnd of lét,
brugðinn golli,
margdýrr konungr
á meðal okkar;
ęldi vǫ́ru ęggjar
útan gǫrvar,
ęn ęitrdropum
innan fáðar.«$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brottstycke av det större kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);

-- ===== Första kvädet om Gudrun  (Guðrúnarkviða in fyrsta) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Ár var, þats Guðrún
gerðisk at deyja,
er hon sat sorgfull
yfir Sigurði;
gerði-t hon hjúfra
né höndum slá,
né kveina um
sem konur aðrar.$txt$, $txt$Det var en gång, som Gudrun
ville gå att dö,
då hon sorgfull satt
vid Sigurds lik.
Hon snyftade icke
eller slog med händerna,
ej heller klagade
som andra kvinnor.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Gengu jarlar
alsnotrir fram,
þeir er harðs hugar
hana löttu;
þeygi Guðrún
gráta mátti,
svá var hon móðug,
mundi hon springa.$txt$, $txt$Visa jarlar
gingo fram,
som henne manade
så hårdsint ej vara;
dock icke Gudrun
gråta kunde,
var så djupt bedrövad,
att hjärtat ville brista.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Sátu ítrar
jarla brúðir,
gulli búnar,
fyr Guðrúnu;
hvar sagði þeira
sinn oftrega,
þann er bitrastan
of beðit hafði.$txt$, $txt$Där sutto högborna
hustrur till jarlar,
guldsmyckade,
framför Gudrun.
Sin egen sorg
sade envar av dem,
den bittraste,
hon burit hade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Þá kvað Gjaflaug,
Gjúka systir:
"Mik veit ek á moldu
munarlausasta;
hefi ek fimm vera
forspell beðit,
tveggja dætra,
þriggja systra,
átta bræðra,
þó ek ein lifi."$txt$, $txt$Då sade Gjavlaug,
Gjukes syster:
»Mig vet jag mest vanlottad
i världen på glädje:
fem mäns förlust
jag lida fick,
tvänne döttrars,
trenne systrars,
åtta bröders,
jag ensam dock lever.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Þeygi Guðrún
gráta mátti,
svá var hon móðug
at mög dauðan
ok harðhuguð
of hrör fylkis.$txt$, $txt$Dock icke Gudrun
gråta kunde;
så bedrövad hon var
för sin döde make
och stel av kval
vid konungens lik.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Þá kvað þat Herborg,
Húnalands dróttning:
"Hefi ek harðara
harm at segja;
mínir sjau synir
sunnan lands,
verr inn átti,
í val fellu.$txt$, $txt$Då sade Herborg,
Hunalands drottning:
»Svårare sorg
att säga jag har:
mina söner sju
i södern föllo
och min man, den åttonde
med dem stupade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Faðir ok móðir,
fjórir bræðr,
þau á vági
vindr of lék,
barði bára
við borðþili.$txt$, $txt$Fader och moder,
fyra bröder,
dem blåste på vågen
vinden i kvav,
böljan bröt
mot bordplankorna.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Sjalf skylda ek göfga,
sjalf skylda ek götva,
sjalf skylda ek höndla
hrör þeira;
þat ek allt of beið
ein misseri,
svá at mér maðr engi
munar leitaði.$txt$, $txt$Själv skulle jag sköta,
själv skulle jag kläda,
själv skulle jag låta
deras lik få vård.
Det allt jag utstod
på ett enda halvår,
utan att hugnad
jag hade av någon.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Þá varð ek hafta
ok hernuma
sams misseris
síðan verða;
skylda ek skreyta
ok skúa binda
hersis kván
hverjan morgin.$txt$, $txt$Så fick jag fången
av fiendehär
samma halvår
sedan bliva.
Skruda jag skulle
och skorna binda
varje morgon
på makan till hersen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Hon ægði mér
af afbrýði
ok hörðum mik
höggum keyrði;
fann ek húsguma
hvergi in betra,
en húsfreyju
hvergi verri."$txt$, $txt$Hon sökte mig skrämma
av svartsjuka,
och drev till mig med hårda
hugg och slag.
Ej har i något hus
jag herre sett bättre,
men fru i huset
fann jag ej värre.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Þeygi Guðrún
gráta mátti,
svá var hon móðug
at mög dauðan
ok harðhuguð
of hrör fylkis.$txt$, $txt$Dock icke Gudrun
gråta kunde,
så bedrövad hon var
för sin döde make
och stel av kval
vid konungens lik.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Þá kvað þat Gullrönd
Gjúka dóttir:
"Fá kanntu, fóstra,
þótt þú fróð séir,
ungu vífi
andspjöll bera."
Varaði hon at hylja
um hrör fylkis.$txt$, $txt$Då sade Gullrond,
Gjukes dotter:
»Få trösteord, fast vis,
o fostermoder,
vet du det unga
vivet att säga.»
Hon ville ej längre
liket hölja.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Svipti hon blæju
af Sigurði
ok vatt vengi
fyr vífs knéum:
"Líttu á ljúfan,
leggðu munn við grön,
sem þú halsaðir
heilan stilli."$txt$, $txt$Snabbt hon lakanet
av Sigurd ryckte
och kastade en kudde
för knäna åt makan.
»Se på din käre!
Kyss hans läppar,
som om du famnade
fursten i livet!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Á leit Guðrún
einu sinni,
sá hon döglings skör
dreyra runna,
fránar sjónir
fylkis liðnar,
hugborg jöfurs
hjörvi skorna.$txt$, $txt$En enda gång
såg Gudrun på honom,
såg furstens hår,
fläckat av blod,
den blixtrande blicken
brusten i döden,
hjärtats borg av svärdet
genomskuren.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Þá hné Guðrún
höll við bolstri,
haddr losnaði,
hlýr roðnaði,
en regns dropi
rann niðr of kné.$txt$, $txt$Då böjde Gudrun
mot bolstret knä,
lockarne lossnade,
i låga brann kinden,
och regnet av tårar
rann i hennes knä.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Þá grét Guðrún
Gjúka dóttir,
svá at tár flugu
tresk í gögnum
ok gullu við
gæss í túni,
mærir fuglar,
er mær átti.$txt$, $txt$Då grät Gudrun,
Gjukes dotter,
så att tårarne forsade
trädörr igenom
och gässen på gården
gällt kacklade,
de härliga fåglar,
som husfrun ägde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Þá kvað þat Gullrönd
Gjúka dóttir:
"Ykkrar vissa ek
ástir mestar
manna allra
fyr mold ofan;
unðir þá hvárki
úti né inni,
systir mín
nema hjá Sigurði."$txt$, $txt$Då sade Gullrond,
Gjukes dotter:
»Eder kärlek vet jag
har varit den största
av alla människors
ovan mullen.
Ingenstädes trivdes du,
ute eller inne,
syster min,
om hos Sigurd du ej var.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Svá var minn Sigurðr
hjá sonum Gjúka
sem væri geirlaukr
ór grasi vaxinn
eða væri bjartr steinn
á band dreginn,
jarknasteinn
yfir öðlingum.$txt$, $txt$Då sade Gudrun,
Gjukes dotter:
»Så var min Sigurd
mot sönerna av Gjuke,
som en vitlök vore,
vuxen ur gräset,
eller som bjärt juvel,
på band dragen,
en ädel opal,
över ädlingar han var.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Ek þótta ok
þjóðans rekkum
hverri hæri
Herjans dísi;
nú em ek svá lítil
sem lauf séi
oft í jölstrum
at jöfur dauðan.$txt$, $txt$Jag föreföll också
furstens kämpar
högre än alla
Herjans diser.
Nu är jag så liten,
som lövet är
ofta på jolster,
efter avliden drott.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Sakna ek í sessi
ok í sæingu
míns málvinar,
valda megir Gjúka;
valda megir Gjúka
mínu bölvi
ok systur sinnar
sárum gráti.$txt$, $txt$Jag saknar, då jag sitter,
då i sängen jag vilar,
min vän att språka med;
det vålla Gjukes söner.
Mitt värsta ve
vålla Gjukes söner
och sin systers
svåra gråt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Svá ér of lýða
landi eyðið
sem ér of unnuð
eiða svarða;
mun-a þú, Gunnarr,
gulls of njóta;
þeir munu þér baugar
at bana verða,
er þú Sigurði
svarðir eiða.$txt$, $txt$I läggen öde
landet på folk,
så visst som I svikit
svurna eder.
Guldet skall du ej,
Gunnar, njuta,
din död de ringar
bereda skola,
sedan du svor
Sigurd eder.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Oft var í túni
teiti meiri,
þá er minn Sigurðr
söðlaði Grana
ok þeir Brynhildar
biðja fóru,
armar véttar,
illu heilli."$txt$, $txt$I gården det ofta
gladare var,
så, när min Sigurd
sadlade Grane
och de foro att bedja
om Brynhilds hand,
en eländig varelse,
i olycklig stund.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Þá kvað þat Brynhildr
Buðla dóttir:
"Vön sé sú véttr
vers ok barna,
er þik, Guðrún,
gráts of beiddi
ok þér í morgun
málrúnar gaf."$txt$, $txt$Då sade Brynhild,
Budles dotter:
»Utan man och barnlös
blive den varelsen,
som bad dig, Gudrun,
att gråta du skulle,
och i morse gav dig
makt att tala!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Þá kvað þat Gullrönd
Gjúka dóttir:
"Þegi þú, þjóðleið,
þeira orða;
urðr öðlinga
hefir þú æ verit;
rekr þik alda hver
illrar skepnu,
sorg sára
sjau konunga
ok vinspell
vífa mest."$txt$, $txt$Då sade Gullrond,
Gjukes dotter:
»Tig, du leda,
med att tala slikt!
Städs ädlingars onda
öde du varit,
var människa skyr dig,
skändliga stycke,
sju konungars
förkrossande sorg
och det värsta fördärv
av vänskap för kvinnor.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Þá kvað þat Brynhildr
Buðla dóttir:
"Veldr einn Atli
öllu bölvi
of borinn Buðla
bróðir minn.$txt$, $txt$Då sade Brynhild,
Budles dotter:
»Atle allena
all olycka vållar,
son till Budle,
broder till mig.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Þá er vit í höll
húnskrar þjóðar
eld á jöfri
ormbeðs litum,
þess hefi ek gangs
goldit síðan,
þeirar sýnar,
sáumk ey."$txt$, $txt$I hallen vi två då
hos hunska folket
sågo guldet
smycka fursten.
För detta besök
jag svårt har umgällt,
från denna syn
ser jag alltid bort.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Stóð hon und stoð,
strengði hon efli;
brann Brynhildi
Buðla dóttur
eldr ór augum,
eitri fnæsti,
er hon sár of leit
á Sigurði.$txt$, $txt$Hon stod vid stolpen,
sin styrka hon samlade;
det brann på Brynhild,
Budles dotter,
eld ur ögonen;
etter fnyste hon,
då hon såg såren
på Sigurds lik.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Första kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);

-- ===== Andra kvädet om Gudrun  (Guðrúnarkviða in forna) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Mær var ek meyja,
- móðir mik fæddi, -
björt í búri,
unna ek vel bræðrum, -
unz mik Gjúki
gulli reifði,
gulli reifði,
gaf Sigurði.$txt$, $txt$»Jag var flicka bland flickor,
fostrad av min moder,
ljuslätt i jungfrubur,
med hjärtat för bröderna,
till dess att Gjuke
guld mig skänkte,
guld mig skänkte
och gav mig åt Sigurd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Svá var Sigurðr
of sonum Gjúka
sem væri grænn laukr
ór grasi vaxinn
eða hjörtr hábeinn
of hvössum dýrum
eða gull glóðrautt
af gráu silfri.$txt$, $txt$Så var Sigurd
över sönerna till Gjuke,
som grön vitlök
ur gräset vuxen,
som högbent hjort
över hårgråa rådjur,
eller glödrött guld
över grått silver.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Unz mér fyrmunðu
mínir bræðr,
at ek ætta ver
öllum fremra;
sofa þeir né máttu-t
né of sakar dæma,
áðr þeir Sigurð
svelta létu.$txt$, $txt$Tills mina bröder
mig ej unnade,
att en man jag hade,
förmer än alla.
Sova de ej kunde
eller saker döma,
förrn Sigurd de låtit
slå ihjäl.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Grani rann at þingi,
- gnýr var at heyra, -
en þá Sigurðr
sjalfr eigi kom;
öll váru söðuldýr
sveita stokkin
ok of vanið vási
und vegöndum.$txt$, $txt$Grane sprang till tinget,
gny var att höra,
men Sigurd själv
sågs ej komma.
Alla sadeldjuren voro
av svett skummande,
hade dryg möda
med dråparne på ryggen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Gekk ek grátandi
við Grana ræða,
úrughlýra
jó frá ek spjalla;
hnipnaði Grani þá,
drap í gras höfði,
jór þat vissi,
eigendr né lifðu-t.$txt$, $txt$Gråtande gick jag
att med Grane tala,
med fuktiga kinder
jag frågade hästen.
Sorgsen blev då Grane,
sänkte huvudet i gräset;
hästen visste,
att hans herre ej levde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Lengi hvarfaðak,
lengi hugir deildusk,
áðr ek of frægak
folkvörð at gram.$txt$, $txt$Länge jag tvekade,
länge var jag tvehågse,
förrn om fursten jag frågade
folkets styresman.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Hnipnaði Gunnarr,
sagði mér Högni
frá Sigurðar
sárum dauða:
"Liggr of höggvinn
fyr handan ver
Gothorms bani
of gefinn ulfum.$txt$, $txt$Gunnar hängde huvudet,
men Hogne mig sade
om Sigurds
svåra död.
»Huggen ligger
på hinsidan vattnet
Guttorms baneman
ett byte för ulvar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Líttu þar Sigurð
á suðrvega;
þá heyrir þú
hrafna gjalla,
örnu gjalla
æzli fegna,
varga þjóta
of veri þínum."$txt$, $txt$Se där Sigurd
i söderled!
Då kommer du att höra
korpar kraxa,
örnar skria,
åt åteln glada,
vargar tjuta
vid kärestan din.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$"Hví þú mér, Högni,
harma slíka
viljalaussi
vill of segja?
Þitt skyli hjarta
hrafnar slíta
við lönd yfir
en þú vitir manna!"$txt$, $txt$»Varför, Hogne,
vill du mig säga
sådan sorg,
som min sällhet rövar.
Ma korpar ditt hjärta
ur kroppen slita
över vida land!
Du värst är av män!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Svaraði Högni
sinni einu,
trauðr góðs hugar,
af trega stórum:
"Þess áttu, Guðrún,
græti at fleiri,
at hjarta mitt
hrafnar slíti."$txt$, $txt$Då svarade Hogne
så en gång,
trög till godsinthet,
av tärande sorg:
»För det har du, Gudrun
att gråta mera,
om korpar mitt hjärta
ur kroppen slita.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Hvarf ek ein þaðan
annspilli frá
á við lesa
varga leifar;
gerðig-a ek hjúfra
né höndum slá
né kveina um
sem konur aðrar,
þá er sat soltin
of Sigurði.$txt$, $txt$Ensam gick jag bort
från ordskiftet,
att på skogen samla upp
vad ulven lämnat.
Jag snyftade icke
eller slog med händerna
eller kved och klagade,
som kvinnor göra,
då jag satt i sorg
vid Sigurds lik.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Nótt þótti mér
niðmyrkr vera,
er ek sárla satk
yfir Sigurði;
ulfar þóttumk
öllu betri,
ef þeir léti mik
lífi týna
eða brenndi mik
sem birkinn við.$txt$, $txt$Natten så mörk
som i nedan mig tycktes,
då i sorg jag satt
vid Sigurds lik;
ulvarna syntes mig
allra bäst vara,
om de läte mig
livet mista
och man mig brände
som björkens ved.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Fór ek af fjalli
fimm dægr talið,
unz ek höll Halfs
háva þekkðak.$txt$, $txt$Från fjället jag färdades
fem hela dagar,
tills Halvs höga
hall jag varsnade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Sat ek með Þóru
sjau misseri,
dætr Hákonar
í Danmörku;
hon mér at gamni
gullbókaði
sali suðræna
ok svani danska.$txt$, $txt$Sju halva år
jag höll mig hos Tora,
dotter till Hakon,
i Danmarks land.
Mig till glädje
i guld hon sydde
sydländska salar
och svanor danska.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Hafðu vit á skriftum
þat er skatar léku,
ok á hannyrðum
hilmis þegna,
randir rauðar,
rekka Húna,
hjördrótt, hjalmdrótt,
hilmis fylgju.$txt$, $txt$Vi virkade på väven
vapenlekar,
på konstrikt arbete
konungens män;
röda sköldar
rustade kämpar,
svärdsflock, hjälmflock
hjältens följe.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Skip Sigmundar
skriðu frá landi,
gylltar grímur,
grafnir stafnar;
byrðu vit á borða,
þat er þeir börðusk
Sigarr ok Siggeirr
suðr á Fjóni.$txt$, $txt$Sigmunds fartyg
foro från land,
med gyllene stävbild
och stammen sirad.
Vi stickade på stycket
de strider de hade,
Sigar och Siggeir
söderut på Five.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Þá frá Grimildr,
gotnesk kona,
hvat ek væra
hyggjuð -- --;
hon brá borða
ok buri heimti
þrágjarnliga
þess at spyrja,
hverr vildi son
systur bæta
eða ver veginn
vildi gjalda.$txt$, $txt$Då frågade Grimhild,
gotiska kvinnan,
hurudan Tora
tyckte, att jag vore.
Hon slutade väva
och sönerna hämtade
för att enträget
åtspörja dem,
vem ville åt systern
för sonen bota
eller vedergälla makan
för mannens dråp.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Görr lézk Gunnarr
gull at bjóða
sakar at bæta,
ok it sama Högni.
Hon frétti at því,
hverr fara vildi
vigg at söðla
vagn at beita,
hesti ríða,
hauki fleygja,
öðrum at skjóta
af ýboga.$txt$, $txt$Gunnar var villig
att guld bjuda
för att böta för brottet;
det bjöd ock Hogne.
Hon frågade också,
vem färdig vore
att springare sadla,
att spänna för vagn,
att häst rida
och hök låta flyga,
att avsända pil
från idegransbåge.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Valdarr Dönum
með Jarizleifi,
Eymóðr þriði
með Jarizskári
inn gengu þá,
jöfrum líkir,
Langbarðs liðar,
höfðu loða rauða,
stuttar brynjur,
steypða hjalma,
skalmum gyrðir,
höfðu skarar jarpar.$txt$, $txt$Valdar for till danskarna
jämte Jaritsleiv
Eymod den tredje
med Jaritsskar.
In gingo då
hjältars likar,
Långskäggs kämpar,
hade ludna röda kappor,
kort brynjor,
kupiga hjälmar,
vid bältet svärd
och brunt var håret.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Hverr vildi mér
hnossir velja,
hnossir velja
ok hugat mæla,
ef þeir mætti mér
margra súta
tryggðir vinna, -
né ek trúa gerða.$txt$, $txt$Envar mig ville
juveler skänka,
juveler skänka,
och vänligt tala,
om de måtte för mina
många sorger
tillgift vinna;
jag trodde dem icke.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Færði mér Grímhildr
full at drekka
svalt ok sárligt,
né ek sakar munðak;
þat var of aukit
jarðar magni,
svalköldum sæ
ok sónum dreyra.$txt$, $txt$Grimhild bjöd mig
bägare att dricka,
sval och bitter,
att brottet jag ej mindes.
Kraften däri
var kommen av jord,
av sval, kall sjö
och svinets blod.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Váru í horni
hvers kyns stafir
ristnir ok roðnir,
- ráða ek né máttak, -
lyngfiskr langr,
lands Haddingja
ax óskorit,
innleið dyra.$txt$, $txt$Där voro i hornet
varjehanda stavar,
ristade och rödfärgade,
reda jag ej kunde dem:
ormen den långe,
oskuret ax
från sjökonungs land,
led inom dörr.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Váru þeim bjóri
böl mörg saman,
urt alls viðar
ok akarn brunnin,
umdögg arins,
iðrar blótnar,
svíns lifr soðin,
því at hon sakar deyfði.$txt$, $txt$I ölet var
mycket ont tillsamman,
blad från all skogen
och brända ollon,
offrade inälvor,
ärilens sot,
kokt svinlever,
som klagomål dövar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$En þá gleymðu,
er getit höfðu,
öll jöfurs
jórbjúg í sal;
kómu konungar
fyr kné þrennir,
áðr hon sjalfa mik
sótti at máli.$txt$, $txt$Att förgäta jag gick,
som de gissat hade,
av ölet i salen
all orätt mot fursten.
Tre konungar föllo
på knä framför mig,
innan hon sökte
samtal med mig själv.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Gef ek þér, Guðrún,
gull at þiggja,
fjölð alls féar,
at þinn föður dauðan,
hringa rauða,
Hlöðvés sali,
ársal allan
at jöfur fallinn.$txt$, $txt$»Jag giver dig, Gudrun,
guld till skänks
och en dryg del gods
efter din döde fader,
lödiga ringar,
Lodvers salar,
allt sängomhänget
efter slagne fursten.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Húnskar meyjar,
þær er hlaða spjöldum
ok gera gull fagrt,
svá at þér gaman þykki;
ein skaltu ráða
auði Buðla,
gulli göfguð
ok gefin Atla."$txt$, $txt$Hunska möar,
som handhava vävstol
och göra guldväv så fager,
att gamman du får.
Ensam skall du bjuda
över Budles skatter,
i gyllene prydnad
och given åt Atle.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$"Vilk eigi ek
með veri ganga
né Brynhildar
bróður eiga;
samir eigi mér
við son Buðla
ætt at auka
né una lífi."$txt$, $txt$»Jag önskar icke
äkta en man
och vill ej Brynhilds
broder äga.
Ej bra mig passar,
att med Budles son
ätten foröka
och åtnjuta lycka.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Hirð-a-ðu hölðum
heiftir gjalda,
því at vér höfum
valdit fyrri;
svá skaltu láta,
sem þeir lifi báðir
Sigurðr ok Sigmundr,
ef þú sonu fæðir."$txt$, $txt$»Bry dig ej, att hämnd
på hövdingar söka,
därför att vi
de vållande voro.
Så skall bliva,
som om båda levde,
Sigurd och Sigmund,
om söner du föder.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Mák-a ek, Grímhildr,
glaumi bella
né vígrisins
vánir telja,
siz Sigurðar
sárla drukku
hrægífr, huginn
hjartblóð saman."$txt$, $txt$»Ej kan jag, Grimhild,
glädje känna
eller giva om mig
åt hjälten förhoppning,
sedan Sigurds hjärtblod
till min smärta drucko
vargen och korpen,
som voro vid liket.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$"Þann hefi ek allra
ættgöfgastan
fylki fundit
ok framast nökkvi;
hann skaltu eiga,
unz þik aldr viðr,
verlaus vera,
nema þú vilir þenna."$txt$, $txt$»Till ätt av alla
den yppersta är han,
den furste, jag funnit,
och främst för visso.
Honom skall du äga,
tills dig ålderdom besegrar,
eller sakna man,
försmår du honom.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$"Hirð-a-ðu bjóða
bölvafullar
þrágjarnliga
þær kindir mér;
hann mun Gunnar
grandi beita
ok ór Högna
hjarta slíta;
munk-at ek létta,
áðr lífshvatan
eggleiks hvötuð
aldri næmik."$txt$, $txt$»Bry dig ej du
att bjuda ut
denna ondskefulla ätt
så ivrigt åt mig!
Han skall Gunnar
grymt behandla
och bortslita hjärtat
ur bröstet på Hogne.
Innan livet jag tagit
från levnadslustige
stridens eggare
ej stanna jag skall.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Grátandi Grímhildr
greip við orði,
er burum sínum
bölva vætti
ok mögum sínum
meina stórra.$txt$, $txt$Gråtande grep
Grimhild det ord,
som spådde, att ont
ej sparas skulle
hennes båda söner,
och ej barnen fördärv.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$"Lönd gef ek enn þér,
lýða sinni,
Vinbjörg, Valbjörg,
ef þú vill þiggja;
eigðu um aldr þat
ok uni, dóttir."$txt$, $txt$»Mer land jag dig giver
och lydande följe:
Vinbjorg, Valbjorg,
om du vill dem taga.
Äg dem i ditt liv
och var lycklig, dotter!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$"Þann mun ek kjósa
af konungum
ok þó af niðjum
nauðig hafa;
verðr eigi mér
verr at ynði
né böl bræðra
at bura skjóli."$txt$, $txt$»Den skall jag kora
av konungar
och dock nödtvungen få
av närskylda fränder;
min man mig ej bliver
till mycken hugnad,
ej brödernas bane
till barnens skydd.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Senn var á hesti
hverr drengr litinn,
en víf valnesk
hafið í vagna;
vér sjau daga
svalt land riðum,
en aðra sjau
unnir kníðum,
en ina þriðju sjau
þurrt land stigum.$txt$, $txt$Snart sågs till häst
var hurtig sven,
och välska damer
i vagnar lyftes.
Sju dagar vi redo
och drogo över land,
påföljande sju
vi piskade böljorna,
trampade torrt land
de tredje sju.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$Þar hliðverðir
hárar borgar
grind upp luku,
áðr í garð riðum.$txt$, $txt$Den väldiga borgens
väktare vid porten
grinden öppnade,
förrn i gården vi redo.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$Vakði mik Atli,
en ek vera þóttumk
full ills hugar
at frændr dauða.$txt$, $txt$Atle mig väckte,
men vara jag kände mig
full av hätskhet
över frändernas död.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$"Svá mik nýliga
nornir vekja," -
vílsinnis spá
vildi, at ek réða, -
"hugða ek þik, Guðrún
Gjúka dóttir,
læblöndnum hjör
leggja mik í gögnum."$txt$, $txt$»Nyss mig sålunda
nornorna väckte»
- olycksspådom
han önskade, jag tydde -
»jag tyckte dig, Gudrun,
Gjukes dotter,
hjärtlöst med svärd
mig genomstinga.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$"Þat er fyr eldi,
er éarn dreyma,
fyr dul ok vil
drósar reiði;
mun ek þik við bölvi
brenna ganga,
líkna ok lækna,
þótt mér leiðir séir."$txt$, $txt$»Det järtecknar eld,
nar om järn man drömmer,
något inbilskt och vänligt,
när om vrede av kvinna;
som bot mot ont
jag dig bränna skall,
läka och lindra,
fast led du mig är.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$"Hugða ek hér í túni
teina fallna,
þá er ek vildak
vaxna láta,
rifnir með rótum,
roðnir í blóði,
bornir á bekki,
beðit mik at tyggva.$txt$, $txt$»Jag tyckte mig på gården
se telningar fallna,
sådana som jag ville
växa skulle,
rivna upp med rötter,
rödfärgade i blod,
burna fram på bänkarne,
bjudna mig att tugga.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$Hugða ek mér af hendi
hauka fljúga
bráðalausa
bölranna til;
hjörtu hugða ek þeira
við hunang tuggin,
sorgmóðs sefa,
sollin blóði.$txt$, $txt$Jag tyckte av min hand
hökar flyga,
utan rov,
till olycksboning;
deras hjärtan jag mig tyckte
tugga till honung
med sorgmodigt sinne,
svullna av blod.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$Hugða ek mér af hendi
hvelpa losna,
glaums andvana,
gylli báðir;
hold hugða ek þeira
at hræum orðit,
nauðigr nái
nýta ek skyldak."$txt$, $txt$Jag tyckte från min hand
hundvalpar lösa,
och glädjelöst
gnällde båda;
sen kropparna döda
mig kommo före,
och jag tyckte mig tvungen
att tära liken.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$"Þar munu seggir
of sæing dæma
ok hvítinga
höfði næma;
þeir munu feigir
fára nátta
fyrir dag litlu,
drótt of bergja."$txt$, $txt$»Det betyder, att män
tala om fiskfångst
och vrida huvudet
av vitlingar,
innan dagen gryr,
vad de dragit upp, de smaka;
ej många nätter
de mera skola leva.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$"Lægja ek síðan,
né ek sofa vildak,
þrágjarn í kör;
þat man ek görva."$txt$, $txt$»Jag tyckte sedan jag låg
och ej sova ville,
styvsint i sängen;
det stannat i minnet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Andra kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);

-- ===== Tredje kvädet om Gudrun  (Guðrúnarkviða in þriðja) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Hvat er þér, Atli,
æ, Buðla sonr?
Er þér hryggt í hug?
Hví hlær þú æva?
Hitt mundi æðra
jörlum þykkja,
at við menn mæltir
ok mik sæir."$txt$, $txt$»Varför är du, Atle,
alltid, du Budles son,
ledsen till sinnes?
Vi ler du aldrig?
Mer gärna ville
jarlarne väl,
att vid män du talte
och mig såge.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$"Tregr mik þat, Guðrún
Gjúka dóttir,
mér í höllu
Herkja sagði,
at þit Þjóðrekr
und þaki svæfið
ok léttliga
líni verðið."$txt$, $txt$»Mig grämer, Gudrun,
Gjukes dotter,
vad Herkja mig
i hallen sade,
att hon såg dig och Tjodrek
sova under täcket
och lägga kärligt
linnet om er.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Þér mun ek alls þess
eiða vinna
at inum hvíta
helga steini,
at ek við Þjóðrek
þatki áttak,
er vörðr né verr
vinna knátti.$txt$, $txt$»Dig om allt det
eder jag svärja
vill vid den heliga
vita stenen,
att jag med Tjodrek
gjorde ej sådant,
som kvinna eller man
ej kunde få företa.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Nema ek halsaða
herja stilli,
jöfur óneisinn,
einu sinni;
aðrar váru
okkrar spekjur,
er vit hörmug tvau
hnigum at rúnum.$txt$, $txt$Blott en enda gång
den orädde fursten,
härarnes hövding
om halsen jag föll.
Andra voro
våra samtal,
då vi två sorgsna
tillsamman språkade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Hér kom Þjóðrekr
með þría tegu,
lifa þeir né einir
þriggja tega manna;
hnöggt þú mik at bræðrum
ok at brynjuðum,
hnöggt þú mik at öllum
höfuðniðjum.$txt$, $txt$Till oss kom Tjodrek
med trettio man,
ingen enda lever
av alla de trettio.
Du avhänt mig broder
och brynjeklädda kämpar,
du avhänt mig samtliga
släktingar, de närmaste.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Sentu at Saxa,
Sunnmanna gram,
hann kann helga
hver vellanda."$txt$, $txt$Sänd efter Saxe,
södermännens furste,
han kan viga vattnet
i vällande kittel.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Sjau hundruð manna
í sal gengu,
áðr kvæn konungs
í ketil tæki.$txt$, $txt$Sju hundraden män
in i hallen gingo,
innan konungens hustru
stack handen i kitteln.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Kemr-a nú Gunnarr,
kallig-a ek Högna,
sékk-a ek síðan
svása bræðr;
sverði mundi Högni
slíks harms reka,
nú verð ek sjalf fyrir mik
synja lýta."$txt$, $txt$»Nu kommer ej Gunnar,
nu kallar jag ej Hogne,
aldrig mer jag ser
mina älskade bröder.
Med svärd skulle Hogne
slik orätt hämna,
nu har jag själv att visa
beskyllningens falskhet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Brá hon til botns
björtum lófa
ok hon upp of tók
jarknasteina:
"Sé nú, seggir,
sykn em ek orðin
heilagliga,
hvé sá hverr velli."$txt$, $txt$Till bottnen hon sträckte
bländvit handlove,
och upp hon tog
ädelstenar.
»Skåden nu, män,
skuldlös är jag vorden,
genom heligt prov,
hur än kitteln sjuder.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Hló þá Atla
hugr í brjósti,
er hann heilar sá
hendr Guðrúnar:
"Nú skal Herkja
til hvers ganga,
sú er Guðrúnu
grandi vændi."$txt$, $txt$Då jublade Atles
hjärta i bröstet,
då Gudruns händer
han hela såg:
»Nu skall Herkja
hit till kitteln,
hon, som skyllde Gudrun
för skändlighet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Sá-at maðr armligt,
hverr er þat sá-at,
hvé þar á Herkju
hendr sviðnuðu;
leiddu þá mey
í mýri fúla.
Svá þá Guðrún
sinna harma.$txt$, $txt$Något ömkligt den ej såg,
som ej åsåg det,
hur på Herkja
händerna skållades.
Ned i ruttnande kärr
de körde den mön.
Så blev oförrätten Gudrun
återgäldad.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Tredje kvädet om Gudrun$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);

-- ===== Det korta kvädet om Sigurd  (Sigurðarkviða hin skamma) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Ár vas þats Sigurðr
sótti Gjúka,
vǫlsungr ungi,
es vegit hafði,
tók við tryggðum
tvęggja brœðra,
sęldusk ęiða
ęljunfrœknir.$txt$, $txt$En gång var det, Sigurd
till Gjuke kom,
den unge volsungen,
som ormen dödat;
fick tvänne bröders
tro och loven;
de växlade eder
de väldiga kämpar.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Męy buðu hǫ́num
ok męiðma fjǫlð,
Goðrúnu unga
Gjúka dóttur;
drukku ok dœmðu
dœgr mart saman
 Sigurðr ungi
ok synir Gjúka.$txt$, $txt$Mö de honom bjödo
och en mängd av skatter,
unga Gudrun,
Gjukes dotter
Mången dag tillsammans
de drucko och språkade,
Sigurd den unge
och sönerna av Gjuke.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Unz Brynhildar
biðja fóru,
svát þęim Sigurðr
í sinni ręið,
vǫlsungr ungi,
ok vega kunni;
hann of átti,
ef ęiga knætti.$txt$, $txt$Tills de foro att bedja
om Brynhilds hand
och Sigurd i deras
sällskap red,
den unge volsungen,
vapenövad;
han hade henne ägt,
om ödet så velat.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Sęggr hinn suðrœni
lagði sverð nøkvit,
mæki málfáan,
á meðal þęira,
né hann konu
kyssa gęrði,
né húnskr konungr
hęfjask at armi.
męy frumunga
fal hann męgi Gjúka.$txt$, $txt$Hjälten från södern
lade svärdet draget;
den sirade klingan
kom dem emellan.
Han kysste icke
tjusande mö,
ej hunske konungen
tog henne i famn,
åt Gjukes arvinge
ungmön bevarade.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Hón sér at lífi
lǫst né vissi
ok at aldrlagi
ękki grand,
vamm þats væri
eða vesa hygði;
gingu á milli
grimmar urðir.$txt$, $txt$Vid sitt liv ej last
hon låda visste
och vid sin bana
ingen brist,
som vore en fläck
eller föreföll vara;
grymma skickelser
skilde dem åt.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Ęin sat hón úti
aptan dags,
nam hón svá ǫrt
umb at mælask:
»hafa skalk Sigurð,
eða svelti þó,
mǫg frumungan
mér á armi.$txt$, $txt$Ensam satt hon ute
på aftonen av dagen,
hon tog att tänka
och tala om mycket:
»Hava skall jag Sigurd
eller se honom död,
jag ynglingen skall
i mina armar sluta.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Orð mæltak nú,
iðrumk ęptir þess;
kvǫ́n ’s hans Goðrún
ęn Gunnars ek;
ljótar nornir
skópu oss langa þrǫ́.«$txt$, $txt$Ett ord jag nu talte
och ångrar det sedan.
Hans hustru är Gudrun,
men Gunnars jag;
oss längtan lång
gåvo leda nornor.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Opt gęngr hón innan
ills of fyld
ísa ok jǫkla
aptan hvęrjan,
es þau Goðrún,
ganga á bęð
ok hana Sigurðr
svęipr í ripti.
konungr hinn húnski
kvǫ́n frjá sína.$txt$, $txt$Ofta går hon ut
av ondska fylld,
av isar och ispiggar,
om aftonstund,
när Gudrun med maken
går till sängs
och Sigurd i lakanet
sveper henne,
den hunske konungen
sin hustru att smeka.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$»Vǫn gęng ek vilja
ok vers bęggja,
verðk mik gœla
af grimmum hug.«$txt$, $txt$»Brudgum och lycka
bägge jag mister;
mig glädja jag skall
åt grymma tankar.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Nam af þęim hęiptum
hvętjask at vígi:
»þú skalt Gunnarr
gǫrst of láta
mínu landi
ok mér sjalfri,
munka una aldri
með ǫðlingi.$txt$, $txt$Av denna hätskhet
hon hetsade sig till dråp:
»Gunnar, mitt land
helt förlora du skall,
som jag skänkte dig,
och mig själv därhos;
lycklig jag aldrig
lever med dig, furste.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Munk aptr fara,
þars áðan vask,
með nábornum
niðjum mínum,
þar munk sitja
ok sofa lífi,
nema þú Sigurð
svelta látir.
ok jǫfur ǫðrum
œðri verðir.$txt$, $txt$Dit fara vill jag åter,
där jag förut var,
hos mina närskylde,
närmaste fränder.
Där vill jag sitta
och sova mitt liv,
om icke du Sigurd
omkomma låter
och en härskare bliver
högre än andra.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Lǫ́tum son fara
fęðr í sinni,
skalat ulf ala
ungan lęngi;
hvęim verðr hǫlða
hǫnd léttari
síðan til sátta
at sonr lifit.«$txt$, $txt$Låtom sonen fara
i sällskap med fadern,
ej länge skall man ulvens
unge föda.
Vilken av hjältar
hjälper det väl hämnden
sedan att sona,
det att sonen lever?»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Hryggr varð Gunnarr
ok hnipnaði,
svęip sínum hug
sat of allan dag,
hann vissi þat
vilgi gǫrla,
hvat hǫ́num væri
vinna sœmst.
eða hǫ́num væri
vinna bęzt,
alls sik vǫlsungi
vissi firðan
ok at Sigurð
sǫknuð mikinn.$txt$, $txt$Ledsen blev Gunnar,
förlorade modet,
satt dagen i ända
dystert grubblande.
Nu han icke
noga visste,
vad honom värdigast
vore att göra
eller honom bleve
bäst att göra,
då han visste sig i ed
av volsungen tagen
och efter Sigurd
saknad stor.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Ýmist hann hugði
jafnlanga stund.
Þat vas ęigi
hǫ́num afar títt,
at frá konungdóm
kvánir gingi;
nam hann sér Hǫgna
hęita at rúnum;
þar átti hann
alls fulltrúa.$txt$, $txt$Han lika länge
var lott betänkte:
förr det icke
förekommit,
att en konungs drottning
från kronan ginge.
Han kallade Hogne
till hemligt samtal;
han fann i honom
en fulltrogen vän.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$»Ęin ’s mér Brynhildr
ǫllum bętri
of borin Buðla,
hón ’s bragr kvinna;
fyrr skalk mínu
fjǫrvi láta
an þęirar męyjar
męiðmum týna.$txt$, $txt$»Mig Brynhild ensam
är bättre än alla,
Budles dotter,
hon den bästa av kvinnor.
Förr mitt liv
jag låta skall
än mista denna
mös skatter.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Vildu okr fylki
til féar véla?
gótt ’s at ráða
Rínar malmi
ok unandi
auði stýra
ok sitjandi
sælu njóta.«$txt$, $txt$Vill du, att vi döda
drotten för hans gods?
Gott är att råda
för Renflodens malm
och i ro
rikedom äga,
sitta i fred
och sällhet njuta.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Ęinu því Hǫgni
andsvǫr vęitti:
»samir ęigi okr
slíkt at vinna
sverði rofna
svarna ęiða,
ęiða svarna,
unnar tryggðir.$txt$, $txt$Hogne på detta
honom blott svarade:
»Oss höves icke
handskas med slikt,
med svärd att bryta
svurna eder,
svurna eder,
sagda löften.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Vituma á moldu
męnn in sælli,
męðan fjórir vér
folki rǫ́ðum
ok sá hinn hunski
hęr-Baldr lifir,
né in mætri
mægð á foldu.
ef vér fimm sonu
fœðum lęngi
ǫ́ttum góða
œxla knættim.$txt$, $txt$Visst leva ej på jorden
lyckligare män,
så länge vi fyra
för folket råda
och den hunske
hövdingen lever.
Ej funnes i världen
mer frejdat svågerlag,
om länge vi fem
föda söner
och ätten den goda
öka kunde.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Ek vęit gǫrla
hvaðan vegir standa,
eru Brynhildar
brek ofmikil.«$txt$, $txt$Väl jag vet,
vilken väg dit leder,
Brynhilds lidelse
brinner för häftigt.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Vit skulum Gotþorm
gørva at vígi,
yngra bróður
ófróðara;
hann vas fyr útan
ęiða svarna,
ęiða svarna,
unnar tryggðir.$txt$, $txt$»Låtom oss Guttorm
locka till dråpet,
vår yngre broder,
den oerfarne!
Han var utanför
de eder, som svurits,
svurna eder,
sagda löften.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Dælt vas at ęggja
óbilgjarnan
— — — —
stóð til hjarta
hjǫrr Sigurði.$txt$, $txt$Lätt var att egga
den ej länge ville töva;
till hjärtat på Sigurd
svärdet stod.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Réð til hęfnda
hęrgjarn í sal
ok ęptir varp
óbilgjǫrnum,
fló til Gotþorms
Gramr ramliga,
kynbirt éarn,
ór konungs hęndi.$txt$, $txt$Härförarn redde sig
till hämnd i salen
och slungade svärdet
efter snarrådig yngling.
Grams glänsande järn
till Guttorm flög,
med kraft kastat
ur konungens hand.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Hné hans of dolgr
til hluta tvęggja,
hęndr ok hǫfuð
hné á annan veg,
ęn fótahlutr
fęll aptr í stað.$txt$, $txt$Hans fiende tumlade,
i två delar skuren,
hälften med händer
och huvud för sig,
men fotdelen
föll på stället$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Sofnuð vas Goðrún
í sæingu
sorgalaus
hjá Sigurði,
ęn hón vaknaði
vilja firð,
es hón Fręys vinar
flaut í dręyra.$txt$, $txt$Somnad var
i sängen Gudrun
vid Sigurds sida,
från sorger fri;
till ve och vånda
vaknade hon,
då hon flöt
i Frejs väns blod.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Svá sló hón sváran
sínar hęndr,
at rammhugaðr
ręis upp við bęð:
»gráta þú Goðrún
svá grimmliga
brúðr frumunga,
þér brœðr lifa.$txt$, $txt$Så hårt hon slog
med händerna sina,
att raske hjälten
reste sig vid sängen:
»Gråt icke, Gudrun,
och gräm dig ej,
min unga brud;
dina bröder leva.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Ák til ungan
ęrfinytja,
kannat firrask
ór fjandgarði,
þęir sér hafa
svárt ok dátt
ęnn nær numit
nýlig rǫ́ð.$txt$, $txt$Alltför ung
arvinge har jag;
fly han kan ej
ur fiendegården.
Med sitt nya tilltag
för nära de sig tagit,
ett ödesdigert
och olyckligt steg.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Ríðra þęim síðan
þótt sjau alir
systursonr
slíkr at þingi;
ek vęit gǫrla,
hví gęgnir nú,
ęin vęldr Brynhildr
ǫllu bǫlvi.$txt$, $txt$Ej med dem sedan,
fast söner sju du föder,
till tinget en sådan
systerson rider.
Väl jag vet,
på vad vis det är;
Brynhild ensam
allt ont vållar.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Mér unni mær
fyr mann hvęrjan,
ęn við Gunnar
grand ękki vank;
þyrmðak sifjum,
svǫrnum ęiðum,
síðr værak hęitinn
hans kvánar vinr.«$txt$, $txt$Mig älskade mön
mera än någon,
dock grep jag ej in
i Gunnars rätt,
ej svågerskap jag svek
eller svurna eder,
på det icke jag hette
hans hustrus käresta.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$Kona varp ǫndu
ęn konungr fjǫrvi,
svá sló hón sváran
sínar hęndr,
at kvǫ́ðu við
kálkar í vǫ́
ok gullu við
gæss í túni.$txt$, $txt$Gudrun suckade,
men Sigurd gav upp andan.
Så hårt hon slog
med händerna sina,
att genljud bägarna
giva i vrån
och gässen på gården
gällt kacklade.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Hló þá Brynhildr
Buðla dóttir
ęinu sinni
af ǫllum hug,
es hón til hvílu
hęyra knátti
gjallan grát
Gjúka dóttur.$txt$, $txt$Då skrattade Brynhild,
Budles dotter,
en enda gång
av all sin själ,
när hon till sängen
höra kunde
högljudd gråt
från Gjukes dotter.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Hitt kvað þá Gunnarr,
gramr haukstalda.
Hlæra þú af því,
hęiptgjǫrn kona,
á golfi glǫð,
at þér góðs viti;
hví hafnar þú
hinum hvíta lit,
fęikna fœðir?
hygg at fęig séir.$txt$, $txt$Då sade Gunnar,
godättades hövding:
»Ej skrattar du därför,
skadeglada kvinna,
nu glad på golvet,
att gott dig anar.
Vi förvandlas i vrede
din vita hy,
illdåds alstrare?
Ofärd dig väntar.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Þú værir þess
verðust kvinna,
at fyr augum þér
Atla hjøggim,
bróður þínum
sæir blóðugt sár,
undir dręyrgar
knættir yfir binda.$txt$, $txt$Du vore av kvinnor
mest värd den lotten,
att för dina ögon
Atle vi dräpte,
att blodigt sår
på din broder du såge
och blödande hugg
förbinda du finge.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Frýra þér Gunnarr
hęfr þú fullvegit;
lítt sésk Atli
ófu þína;
hann mun ykkar láta
ǫnd síðari
ok æ bera
afl hit męira.$txt$, $txt$»För feghet du ej förebrås,
fullt upp har du dräpit;
föga Atle fruktar
din fiendskap.
Han skall leva
längst av er båda
och alltid hava
övermakten.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$Sęgja munk þér Gunnarr,
sjalfr vęizt gǫrla,
hve ér yðr snimma
til saka réðuð;
varðka til ǫngð
né ofþrungin
fullgœdd féi
á flęti bróður.$txt$, $txt$Jag säger dig, Gunnar,
vad du granneligen själv vet,
hurusom sakskyldige
snart I blivit.
Jag var ej förtryckt
och tvång jag ej led
eller brist på gods
i min broders hus.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Né vildak þat,
at mik verr ætti,
áðr ér Gjúkungar
at garði riðuð,
þrír á hęstum
þjóðkonungar,
ęn þęira fǫr
þǫrfgi væri.$txt$, $txt$Ej heller maka
åt man jag ville bli,
innan ni gjukungar
till gården reden,
på hästarne trenne
härskare över folken,
och eder färd
onödig varit.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$Ok mér Atli þat
ęinni sagði,
at hvárki lézk
hǫfn of dęila,
goll né jarðir,
nema gefask létak,
ok ęngi hlut
auðins féar.$txt$, $txt$Till mig i enrum
Atle sade,
att av egendomen
intet han gåve mig,
varken guld eller jordagods,
om mig gifta jag ej ville,
och intet av det gods,
som jag erhöll en gång,
när åt mig som liten
han lämnade det att äga
och åt mig som liten
mynt betalade.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$Þás mér jóðungri
ęiga sęldi
ok mér jóðungri
aura talði.$txt$, $txt$I tvekan då var
min tanke därom,
om väl jag skulle vapen
på valplats bära,
båld i brynja,
för min broders skull.
Vida bekant
vara det skulle
för mången man
till mycket bekymmer.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$Þá vas á hvǫrfun
hugr minn of þat,
hvárt skyldak ver ęiga
eða val fęlla
bǫll í brynju
of bróður sǫk;
þat myndi þá
þjóðkunt vesa
mǫrgum manni
at munar stríði.$txt$, $txt$Vi läto det så
till förlikning komma;
det lekte mig i hågen
att håvor få,
de röda ringar, som sonen
till Sigmund hade;
ej önskade jag äga
annan mans skatter.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$Létum síga
sáttmǫ́l okkur;
lék mér męir í mun
męiðmar þiggja,
bauga rauða
burar Sigmundar;
né annars manns
aura vildak.$txt$, $txt$Åt den folkens furste
jag fäste mig då,
som med guldet satt
på Granes bogar.
Han var ej i ögonen
eder alls lik
och för ingen del
till utseende sådan,
och dock kommen I mig
som konungar före.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$Þęim hétumk þá
þjóðkonungi,
es með golli sat
á Grana bógum,
vasat hann í augu
yðr of glíkr
né á ęngi hlut
at álitum.
þó þykkizk ér
þjóðkonungar.$txt$, $txt$En jag älskade,
ej ömsom flera,
ej visste valkyrian
om vacklan i håg.
Allt det skall Atle
efteråt finna,
när min hädanfärd
han höra får.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$Unnak ęinum
né ýmissum,
bjóat of hverfan
hug męn-Skǫgul;
alt mun þat Atli
ęptir finna,
es mína spyrr
morðfǫr gǫrva.$txt$, $txt$Dock livet leva
som lättsinnig kvinna
med en annans man
man aldrig skall.
Hämnd jag skall då ha
för den harm, jag lidit.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$At þvígi skal
þunngęð kona
annarrar ver
aldri lęiða;
þat mun at hęfndum
harma minna.$txt$, $txt$Upp steg följets
furste Gunnar
och om hustruns hals
händerna lade.
Alla gingo
efter varandra
och avrådde henne
av all sin själ.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$Upp ręis Gunnarr,
gramr verðungar,
ok of hals konu
hęndr of lagði,
gingu allir
ok þó ýmissir
af hęilum hug
hána at lętja.$txt$, $txt$Hon kastade från sig,
vem som kom henne när,
lät sig ej lockas
från långa färden.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$Hratt af halsi
hvęim þar sér,
léta sik lętja
langrar gǫngu.$txt$, $txt$Han kallade Hogne
till hemligt samtal:
»Må männen alla,
mina och dina
i salen gå,
ty svar är nu nöden!
Må de se, om vi hindra
min hustrus dödsfärd,
tills med tiden
den timar sedan;
då låtom ödet
över den råda.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$Nam sér Hǫgna
hvętja at rúnum
»Sęggi vilk alla
í sal ganga,
þína með mínum
nú ’s þǫrf mikil
vita ef męini
morðfǫr konu,
unz af méli
ęnn męin komi,
þá lǫ́tum því
þarfar ráða.«$txt$, $txt$Hogne på detta
honom blott svarade:
»Locke henne ingen
från långa färden,
varifrån återfödd
hon aldrig blive!
Ett missfoster kom hon
framför moderns knän,
till elände född
för all sin tid
och mången man
till mycken sorg.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$Ęinu því Hǫgni
andsvǫr vęitti:
Lętia hána
langrar gǫngu,
þars aptrborin
aldri verði;
hón krǫng of komsk
fyr kné móður
hón ’s æ borin
óvilja til
mǫrgum manni
at móðtrega.$txt$, $txt$Sorgsen Gunnar
från samtalet gick,
då drottningen delade
dyrbarheterna.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$Hvarf sér óhróðigr
andspilli frá,
þars mǫrk męnja
męiðmum dęilði;
lęit hón of alla
ęigu sína,
soltnar þýjar,
ok salkonur.$txt$, $txt$Hon såg sig om
på allt sitt gods,
på tärnorna, som dödats,
och trälkvinnorna,
drog guldbrynjan på,
var ej glad i håg,
innan hon sig sårade
med svärdets eggar.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$Gollbrynju smó,
vasa gótt í hug,
áðr sik miðlaði
mækis ęggjum;
hné við bolstri
hón á annan veg
ok hjǫrunduð
hugði at rǫ́ðum.$txt$, $txt$Bort åt sidan
mot bolstret hon sjönk
och, sårad av svärdet,
sade sin tanke.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$Nu skulu ganga
þærs goll vili
ok minni því
at mér þiggja;
ek gef hvęrri
of hroðit sigli,
bók ok blæju,
bjartar váðir.$txt$, $txt$»Nu gånge de i döden,
som guld vilja
mottaga av mig
och mindre gåvor.
Jag giver envar
ett gyllene halssmycke,
lakan och sticktäcke,
lysande kläder.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$Þǫgðu allar
við því ráði,
ok allar sęnn
andsvǫr vęittu:
»œrnar ro soltnar,
munum ęnn lifa,
verða salkonur
sœmð at vinna.«$txt$, $txt$De tego alla
och tänkte sig för
och på samma gång
svar de gåvo:
»Nog liv ha förlorats,
leva vi skola;
tärnorna få göra dig
tillräcklig heder.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$Unz af hyggjandi
hǫrskrýdd kona,
ung at aldri,
orð viðr of kvað:
vilkat trauðan
né torbœnan
of óra sǫk
aldri týna.$txt$, $txt$Länge tänkte
linklädd kvinna,
ung till åren,
och orden talte:
»Jag vill ej, att någon
nödbjuden och trögt
livet för var skull
förlora skall.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 52, $txt$Þó mun á bęinum
brinna yðrum
færi ęyrir,
þás framm komið,
† nęit menju góð,
mín at vitja.$txt$, $txt$Dock brinna på bålet
över benen av eder
färre skatter,
då fram I kommen
att mig besöka
och mindre guld.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=52);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 53, $txt$Sęzk niðr Gunnarr,
munk sęgja þér
lífs ørvæna
ljósa brúði,
muna yðvart far
alt í sundi,
þótt ek hafa
ǫndu látit.$txt$, $txt$Sätt dig, Gunnar!
Säga dig skall jag,
att ljuslockig brud
bortgår ur livet.
Ej skall edert skepp
på sjön förgås,
fastän mitt liv
jag låtit har.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=53);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 54, $txt$Sǫ́tt munuð it Goðrún
snemr an hyggir;
hęfr kunn kona
við konungi
daprar minjar
at dauðan ver.$txt$, $txt$Du och Gudrun försonas
snarare än du tror,
den kloka kvinnan
mot konungen har dock
bedrövat minne
av döda maken.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=54);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 55, $txt$— — — —
Þar ’s mær borin,
móðir fœðir,
sú mun hvítari
an hinn hęiði dagr
Svanhildr vesa
sólar gęisla.$txt$, $txt$En mö blir född,
modern henne fostrar;
vacker som dagen
och vitare i hyn
skall Svanhild vara
än solens stråle.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=55);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 56, $txt$Gefa munt Goðrúnu
góðra nøkkurum
skęyti skæða
skatna męngi;
munat at vilja
versæl gefin;
hána mun Atli
ęiga ganga
of borinn Buðla,
bróðir minn.$txt$, $txt$Gudrun skall du giva
åt en god man,
hon är det vapen, som skall vålla
ve åt kämpar.
Mot sin vilja
åt man hon gives;
henne skall Atle
äga till hustru,
Budles son,
broder till mig.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=56);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 57, $txt$Margs ák minnask,
hvé við mik fóru.
— — — —
þás mik sára
svikna hǫfðuð;
vaðin at vilja
vask meðan lifðak.$txt$, $txt$Mycket jag har att minnas,
hur mot mig de förforo,
då I mig svårligen
svikit haden;
min levnads lycka
förlustig jag gick.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=57);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 58, $txt$Munt Oddrúnu
ęiga vilja,
ęn þik Atli mun
ęigi láta;
it munuð lúta
á laun saman,
hón mun þér unna
sem ek skyldak.
ef okr góð of skǫp
gęrði verða.$txt$, $txt$Du skall Oddrun
äga vilja,
men Atle skall
det icke tillåta;
I skolen eder luta
i löndom tillsamman,
hon skall dig älska
så ömt, som jag skolat,
om blid oss skickelsen
blivit hade.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=58);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 59, $txt$Þik mun Atli
illu bęita,
munt í ǫngan
ormgarð lagiðr.$txt$, $txt$Dig skall Atle
illa göra,
i trånga ormgården
inlagd du bliver.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=59);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 60, $txt$Þat mun ok verða
þvígit lęngra,
at Atli mun
ǫndu týna,
sælu sinni,
ok sona lífi,
þvít hǫ́num Goðrún
grýmir á bęð
snǫrpum ęggjum
af sǫ́rum hug.$txt$, $txt$Det lider ej heller
lång tid därefter,
förrn Atle skall
sin anda uppgiva,
sin sällhet mista
och sönernas liv,
ty i sängen honom Gudrun
med svärdets eggar
ur vägen röjer
vred till sinnes.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=60);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 61, $txt$Sœmri væri Goðrún
systir ykkur
frumver sínum
at fylgja dauðum;
ef hęnni gæfi
góðra hvęrr ráð,
eða ætti hón hug
ossum glíkan.$txt$, $txt$Värdigare vore,
att vår syster Gudrun
följde i döden
sin förste make,
om henne gåves
gode mäns råd
eller hon lynne
likt oss hade.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=61);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 62, $txt$Ǫrt mælik nú,
ęn hón ęigi mun
of óra sǫk
aldri týna;
hána munu hęfja
hóvar bǫ́rur
til Jónakrs
óðaltorfu.$txt$, $txt$Tungt är det mig
att tala nu.
Ej livet för vår skull
förlora hon skall;
höga böljor
bära henne skola
till de jordagods,
som Jonakr ärvt.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=62);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 63, $txt$[Ala mun sér jóð,
ęrfivǫrðu],
ęrfivǫrðu,
Jónakrs sonu,
mun hón Svanhildi
sęnda af landi
sína męy
ok Sigurðar.$txt$, $txt$[Ättlingar hon föder
och arvtagare],
söner som arvingar
efter Jonakr.
Svanhild skall hon
sända ur landet,
sin dotter
och Sigurds barn.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=63);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 64, $txt$Hána munu bíta
Bikka ráð,
þvít Jǫrmunrekkr
óþarft lifir;
þá ’s ǫll farin
ætt Sigurðar;
eru Goðrúnar
grœti at flęiri.$txt$, $txt$Bickes råd
henne bita skola,
ty Jormunrek
gör henne ont.
All Sigurds ätt
då omkommen är,
dess mer att begråta
för Gudrun finns.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=64);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 65, $txt$Biðja munk þik
bœnar ęinnar,
sú mun í hęimi
hinzt bœn vesa;
lát svá bręiða
borg á vęlli,
at und oss ǫllum
jafnrúmt séi.
þęim es sultu
með Sigurði.$txt$, $txt$En enda bön
jag dig bedja vill,
i världen den sista
den vara skall
Låt bygga så brett
bål på slätten,
att rum åt oss alla
rikligt bliver
åt oss, som med Sigurd,
sökte döden!$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=65);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 66, $txt$Tjaldi of þá borg
tjǫ́ldum ok skjǫldum,
valaript vęl fǫ́uð
ok vala męngi;
bręnni mér hinn húnska
á hlið aðra.$txt$, $txt$Gör tjäll över bålet
med bonad och sköldar,
sirat välskt tyg
och slavars mängd!
Må vid min sida
Sigurd brännas!$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=66);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 67, $txt$Bręnni hinum húnska
á hlið aðra
mína þjóna,
męnjum gǫfga,
tvá at hǫfðum
ok tvęir haukar;
þá ’s ǫllu skipt
til jafnaðar.$txt$, $txt$Må på andra sidan
om Sigurd brännas
mina svenner,
med smycken prydda,
två vid huvudet
och hökar två;
då är allt skiftat
i skäligt mått.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=67);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 68, $txt$Liggi okkar
ęnn í milli
ęgghvast éarn,
sęm ęndr lagit,
þás vit bæði
bęð ęinn stigum
ok hétum þá
hjóna nafni.$txt$, $txt$Vile ock mellan oss
vapnet med ringfästet,
eggvassa järnet,
åter så lagt,
som när vi båda
bädden delade
och makar hette,
man och hustru!$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=68);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 69, $txt$Hrynja hǫ́num
á hæl þęygi
hlunnblik hallar
hringa litkuð,
ef hǫ́num fylgir
fęrð mín heðan;
þęygi mun ór fǫr
aumlig vesa.$txt$, $txt$Ej hittas han
på hälen då
av porten till salen,
som prydd är med ring,
om honom mitt folk
följer hädan;
ej skall vår färd
vanheder giva.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=69);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 70, $txt$Þvít hǫ́num fylgja
fimm ambóttir,
átta þjónar,
ęðlum góðir,
fóstrman mitt
ok faðęrni,
þats Buðli gaf
barni sínu.$txt$, $txt$Ty honom följa
fem tärnor,
åtta tjänare
av aktad släkt,
min fostersyster,
det fädernearv,
som Budle gav
åt barnet sitt.$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=70);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 71, $txt$Mart sagðak þér,
myndak flęira,
ef mér męir mjǫtuðr
málrúm gæfi;
ómun þverr,
undir svella,
satt ęitt sagðak,
svá munk láta.$txt$, $txt$Mycket jag sade,
mera jag skulle
säga, om tala
jag tilläts av döden.
Såren svälla,
svag blir rösten,
blott sant jag sade,
så får jag sluta.»$txt$, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Det korta kvädet om Sigurd$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=71);

-- ===== Brynhilds färd till Hel  (Helreið Brynhildar) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$"Skaltu í gögnum
ganga eigi
grjóti studda
garða mína,
betr semði þér
borða at rekja
heldr en vitja
vers annarrar.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Hvat skaltu vitja
af Vallandi,
hvarfúst höfuð,
húsa minna?
Þú hefir, Vár gulls,
ef þik vita lystir,
mild af höndum
manns blóð þvegit."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Bregðu eigi mér,
brúðr ór steini,
þótt ek værak
í víkingu;
ek mun okkur
æðri þykkja,
hvars menn eðli
okkart kunna."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$"Þú vart, Brynhildr
Buðla dóttir,
heilli verstu
í heim borin;
þú hefir Gjúka
of glatat börnum
ok búi þeira
brugðit góðu."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$"Ek mun segja þér
svinn ór reiðu
vitlaussi mjök,
ef þik vita lystir,
hvé gerðu mik
Gjúka arfar
ástalausa
ok eiðrofa.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Hétu mik allir
í Hlymdölum
Hildi undir hjalmi
hverr er kunni.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Annar hét Agnarr,
Auðu bróðir,
er véttr engi
vildi týja.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Lét hami vára
hugfullr konungr
átta systra
undir eik borit;
var ek vetra tolf,
ef þik vita lystir,
er ek ungum gram
eiða seldak.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Þá lét ek gamlan
á Goðþjóðu
Hjalmgunnar næst
heljar ganga;
gaf ek ungum sigr
Auðu bróður;
þar varð mér Óðinn
ofreiðr of þat.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Lauk hann mik skjöldum
í Skatalundi
rauðum ok hvítum,
randir snurtu;
þann bað hann slíta
svefni mínum,
er hvergi lands
hræðask kynni.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Lét hann um sal minn
sunnanverðan
hávan brenna
her alls viðar;
þar bað hann einn þegn
yfir at ríða,
þanns mér færði gull,
þats und Fáfni lá.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Reið góðr Grana
gullmiðlandi,
þars fóstri minn
fletjum stýrði;
einn þótti hann þar
öllum betri
víkingr Dana
í verðungu.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Sváfu við ok unðum
í sæing einni,
sem hann minn bróðir
of borinn væri;
hvárki knátti
hönd yfir annat
átta nóttum
okkart leggja.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Því brá mér Guðrún
Gjúka dóttir,
at ek Sigurði
svæfak á armi,
þar varð ek þess vís,
er ek vildig-a-k,
at þau véltu mik
í verfangi.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Munu við ofstríð
alls til lengi
konur ok karlar
kvikvir fæðask;
við skulum okkrum
aldri slíta
Sigurðr saman.
Sökkstu, gýgjar kyn."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Brynhilds färd till Hel$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);

-- ===== Nivlungarnes dråp  (Dráp Niflunga) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, NULL, $txt$Gunnarr ok Högni tóku þá gullit allt, Fáfnis arf. Ófriðr var þá í milli Gjúkunga ok Atla. Kenndi hann Gjúkungum völd um andlát Brynhildar. Þat var til sætta, at þeir skyldu gifta hánum Guðrúnu, ok gáfu henni óminnisveig at drekka, áðr hon játti at giftast Atla. Synir Atla váru þeir Erpr ok Eitill, en Svanhildr var Sigurðar dóttir ok Guðrúnar. Atli konungr bauð heim Gunnari ok Högna ok sendi Vinga eða Knéfröð. Guðrún vissi vélar ok sendi með rúnum orð, at þeir skyldu eigi koma, ok til jartegna sendi hon Högna hringinn Andvaranaut ok knýtti í vargshár. Gunnarr hafði beðit Oddrúnar, systur Atla, ok gat eigi. Þá fekk hann Glaumvarar, en Högni átti Kostberu. Þeira synir váru þeir Sólarr ok Snævarr ok Gjúki. En er Gjúkungar kómu til Atla, þá bað Guðrún sonu sína, at þeir bæði Gjúkungum lífs, en þeir vildu eigi. Hjarta var skorit ór Högna, en Gunnarr settr í ormgarð. Hann sló hörpu ok svæfði ormana, en naðra stakk hann til lifrar.$txt$, $txt$Gunnar och Hogne togo då allt guldet, Favners arv. Ofrid var då mellan gjukungarne och Atle; han tillskrev gjukungarne skulden till Brynhilds död. Till förlikning bestämdes, att de skulle gifta Gudrun med honom, och de gåvo henne glömskedryck att dricka, innan hon jakade till att gifta sig med Atle. Atles söner voro Erp och Eitil, men Svanhild var Sigurds och Gudruns dotter. Konung Atle bjöd hem Gunnar och Hogne och sände Vinge eller Knefröd. Gudrun kände sveket och skickade hälsning med runor, att de icke skulle komma, och till kännemärke sände hon Hogne ringen Andvaranaut och knöt i varghår. Gunnar hade friat till Oddrun, Atles syster, och fick henne icke; därpå gifte han sig med Glaumvor, men Hogne var gift med Kostbera; deras söner voro Solar och Snävar och Gjuke. Men när gjukungarne kommo till Atle, så bad Gudrun sina söner, att de skulle bedja för gjukungarnes liv, men de ville icke. Hjärtat skars ur Hogne, men Gunnar sattes i ormgård. Han slog harpan och sövde ormarne, men en huggorm stack honom i levern.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Nivlungarnes dråp$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no is null);

-- ===== Oddruns gråt  (Oddrúnargrátr) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Hęyrðak sęgja
í sǫgum fornum,
hvé mær of kom
til Mornalands;
ęngi mátti
fyr jǫrð ofan
Hęiðreks dóttur
hjalpir vinna.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Þat frá Oddrún
Atla systir,
at mær hafði
miklar sóttír;
brá hón af stalli
stjórnbitluðum
ok á svartan
sǫðul of lagði.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Lét mar fara
moldveg sléttan,
unz at hóri kom
hǫll standandi;
ok hón inn of gekk
ęndlangan sal
svipti hón sǫðli
af svǫngum jó
ok hón þat orða
alls fyrst of kvað.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Hvat ’s frægst á fold
— — — —
eða hvat ’s hlézt
Húnalandi?$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Hvęrr hęfr vífi
vamms of lęitat?
Hví eru Borgnýjar
bráðar sóttir?$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Þær hykk mæltu
þvígit flęira,
gekk mild fyr kné
męyju at sitja;
ríkt gól Oddrún,
ramt gól Oddrún,
bitra galdra
at Borgnýju.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Knátti mær ok mǫgr
moldveg sporna
bǫrn þau hin blíðu
við bana Hǫgna;
þat nam at mæla
mær fjǫrsjúka,
svát ękki kvað
orð hit fyrra:$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Svá hjalpi þér
hollar véttir,
Frigg ok Fręyja
ok flęiri goð,
sęm fęldir mér
fár af hǫndum.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Hnékat af því
til hjalpar þér,
at værir þess
verð aldrigi;
hétk ok ęfndak,
es hinig mæltak,
at hvívetna
hjalpa skyldak.
þás ǫðlingar
arfi skiptu.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Œr est Oddrún
ok ørvita,
es mér af fári
flęst orð of kvatt,
ęn ek fylgðak þér
á fjǫrgynju,
sęm vit brœðrum tvęim
bornar værim.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Mank ęnn hvat þú
mæltir of aptan,
þás Gunnari
gęrðak rękkju,
slíks dœmi kvaðat
síðan mundu
męyju verða
nema mér ęinni.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Þá nam at sętjask
sorgmóð kona
at tęlja bǫl
af trega stórum.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Vask upp alin
í jǫfra sal,
flęstr fagnaði,
at fira ráði;
unðak aldri
ok ęign fǫður
fimm vetr ęina,
svát minn faðir lifði.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Þat nam at mæla
mál hit øfsta
sjá móðr konungr,
áðr sylti hann,
mik bað gœða
golli rauðu
ok suðr gefa
syni Grímhildar.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Ęn Brynhildi
bað hjalm geta,
hána kvað valmęy
verða skyldu;
kvaða hina œðri
alna mundu
męy í hęimi,
nema mjǫtuðr spilti.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Brynhildr í búri
borða rakði,
hafði lýði
ok lǫnd of sik,
jǫrð dúsaði
ok upphiminn,
þás bani Fáfnis
borg of þátti.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$Þá vas víg vegit
vǫlsku sverði
ok borg brotin,
sús Brynhildr átti,
vasa langt af því
hęldr válítit,
unz þær vélar
vissi allar.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Þess lét hón harðar
hęfndir verða,
svát ǫll hǫfum
œrnar raunir;
þat mun á hǫlða
hvęrt land fara,
es hón lét sveltask
at Sigurði.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Ęn Gunnari
gatk at unna,
bauga dęili,
sęm Brynhildr skyldi;
buðu þęir Atla
bauga rauða
ok brœðr mínum
bœtr ósmáar.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$Bauð ęnn við mér
bú fimtían,
hliðfarm Grana,
ef hafa vildi;
ęn Atli kvazk
ęigi vilja
mund aldrigi
at męgi Gjúka.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Þęygi vit mǫ́ttum
við munum vinna
nema ek helt hǫfði
við hringbrota;
mæltu margir
mínir niðjar,
kóðusk okr hafa
orðit bæði.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Ęn mik Atli kvað
ęigi mundu
lýti ráða
né lǫst gęra,
ęn slíks skyli
synja aldri
maðr fyr annan,
þars munúð dęilir.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Sęndi Atli
ǫ́ru sina
of myrkvan við
mín at fręista,
ok þeir kómu,
þars koma né skyldut,
þás bręiddum vit
blæju ęina.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Buðum vit þegnum
bauga rauða,
at ęigi til
Atla sęgði,
ęn þęir hvatliga
hęim skunduðu
ok óliga
Atla sǫgðu.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Ęn Goðrúnu
gǫrla lęynðu
þvís hęldr vita
hǫlfu skyldi.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Hlymr vas at hęyra
hófgollinna,
þás í garð riðu
Gjúka arfar,
þęir ór Hǫgna
hjarta skǫ́ru,
ęn í ormgarð
annan lǫgðu.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Vask ęnn farin
ęinu sinni
til Gęirmundar
gęrva drykkju;
nam horskr konungr
hǫrpu svęigja,
hann hugði mik
til hjalpar sér.
kynríkr konungr
of koma mundu.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$Namk at hęyra
ór Hlésęyju,
hvé þar af stríðum
stręngir mæltu;
baðk ambáttir
búnar verða,
vildak fylkis
fjǫrvi bjarga.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$Létum fljóta
far sund yfir,
unz alla sák
Atla garða.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Þá kom hin arma
út skævandi
móðir Atla,
hón morna skyli,
ok Gunnari
gróf til hjarta,
svát máttigak
mærum bjarga.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Opt undrumk þat,
hví ęptir mák,
linnvęngis Bil,
lífi halda,
es ógnhvǫtum
unna þóttumk
sverða dęili
sęm sjalfri mér.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Satt ok hlýddir
meðan sagðak þér
mǫrg ill of skǫp
mín ok þęira;
maðr hvęrr lifir
at munum sínum;
nú ’s of ginginn
grátr Oddrúnar.$txt$, NULL, NULL, $txt$De gamle Eddadigte, utg. Finnur Jónsson (1932, public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Oddruns gråt$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);

-- ===== Kvädet om Atle  (Atlakviða) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Atli sendi
ár til Gunnars
kunnan segg at ríða,
Knéfröðr var sá heitinn;
at görðum kom hann Gjúka
ok at Gunnars Höllu,
bekkjum aringreypum
ok at bjóri svásum.$txt$, $txt$Atle sänder
en sven till Gunnar,
att rida, en klok karl,
Knefröd han hette.
Han kom till Gjukes gårdar
och till Gunnars sal,
till bänkar omkring elden
och till ölet ljuva.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Drukku þar dróttmegir,
en dyljendr þögðu,
vín í valhöllu,
vreiði sásk þeir Húna;
kallaði þá Knéfröðr
kaldri röddu,
seggr inn suðræni
sat hann á bekk háum:$txt$, $txt$Drottens män de drucko,
medan dolske gäster tego,
vin i vapensalen,
vreden från hunnerna räddes.
Då ropade Knefröd
med kallsinnig röst,
de sydländske sändemannen,
som satt i högbänk:$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$"Atli mik hingat sendi
ríða erendi
mar inum mélgreypa
myrkvið inn ókunna,
at biðja yðr, Gunnarr,
at it á bekk kæmið
með hjalmum aringreypum
at sækja heim Atla.$txt$, $txt$»Atle hit mig sände
att hans ärende rida
på häst, som tuggar munbett,
över Mörkskogen djupa,
att bedja eder, Gunnar,
att på bänken I kommen
i hjälmar med ringband
att gästa Atle.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Skjöldu kneguð þar velja
ok skafna aska,
hjalma gullroðna
ok Húna mengi,
silfrgyllt söðulklæði,
serki valrauða,
dafar darraðar,
drösla mélgreypa.$txt$, $txt$Sköldar I där fån välja,
och skönglättade askspjut,
förgylda hjälmar
er givas och hunniska trälar,
silversytt sadeltyg,
sydländska brynjor,
kastspjut och fålar
med fradga om betslen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Völl lézk ykkr ok mundu gefa
víðrar Gnitaheiðar,
af geiri gjallanda
ok af gylltum stöfnum,
stórar meiðmar
ok staði Danpar,
hrís þat it mæra,
er meðr Myrkvið kalla."$txt$, $txt$Den vidsträckta Gnitaheden
vill han eder giva,
förutom ljungande kastspjut
och förgyllda stammar,
stora dyrbarheter
och Danparstaden,
den märkliga skog,
som man Mörkskogen kallar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Höfði vatt þá Gunnarr
ok Högna til sagði:
"Hvat ræðr þú okkr, seggr inn æri,
alls vit slíkt heyrum?
Gull vissa ek ekki
á Gnitaheiði,
þat er vit ættim-a
annat slíkt.$txt$, $txt$På huvudet vände Gunnar
och till Hogne sade:
»Vad säger du, ungersven,
då sådant vi höra.
Jag visste ej guld
på Gnitaheden,
vartill vi ej också
ägde maken.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Sjau eigum vit salhús
sverða full,
hverju eru þeira
hjölt ór gulli;
minn veit ek mar beztan,
en mæki hvassastan,
boga bekksæma,
en brynjur ór gulli,
hjalm ok skjöld hvítastan
kominn ór höll Kíars,
einn er minn betri
en sé allra Húna."$txt$, $txt$»För sent är nu, syster,
att samla nivlungar;
långt är att leta
till ledung följe,
från Rens Rosmofjäll
raska kämpar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$"Hvat hyggr þú brúði bendu,
þá er hon okkr baug sendi,
varinn váðum heiðingja?
Hygg ek, at hon vörnuð byði.
Hár fann ek heiðingja
riðit í hring rauðum,
ylfskr er vegr okkarr
at ríða erendi."$txt$, $txt$»Vad råd tror du Gudrun mente,
när nng till oss hon sände,
virad med vargens hår,
varning tror jag hon gav.
Ett hår jag fann av vargen
vridet i röda ringen;
vargar oss vänta
på den väg vi rida.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Niðjar hvöttu Gunnar
né náungr annarr,
rýnendr né ráðendr
né þeir er ríkir váru;
kvaddi þá Gunnarr,
sem konungr skyldi,
mærr í mjöðranni
af móði stórum:$txt$, $txt$Ej eggade fränder
eller andra närskylda,
ej vänner, ej vise,
ej väldiga herrar.
Dem hälsade Gunnar
som hövdes en konung,
stolt i mjödsal,
mycket upprörd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$"Rístu nú, Fjörnir,
láttu á flet vaða
greppa gullskálir
með gumna höndum.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$Ulfr mun ráða
arfi Niflunga,
gamlir, gránvarðir,
ef Gunnars missir,
birnir blakkfjallir
bíta þreftönnum,
gamna greystóði,
ef Gunnarr né kemr-at."$txt$, $txt$För nivlungars arv
skall ulven råda,
de gamla gråben,
om Gunnar förloras.
Brunpälsade björnar
skola bita med huggtand
göra gamman åt hundflock,
om Gunnar ej kommer.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Leiddu landrögni
lýðar óneisir,
grátendr gunnhvata
ór garði húna.
Þá kvað þat inn æri
erfivörþr Högna:
"Heilir farið nú ok horskir,
hvars ykkr hugr teygir!"$txt$, $txt$Sin stridsdjärve härskare
stridbara kämpar
gråtande följde
ur hunners gård.
Då sade den unge
sonen till Hogne:
»Hell, faren hurtiga,
dit hugen er lockar!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$Fetum létu fræknir
um fjöll at þyrja
mari ina mélgreypu
Myrkvið inn ókunna;
hristisk öll Húnmörk
þar er harðmóðgir fóru,
ráku þeir vandstyggva
völlu algræna.$txt$, $txt$Över fjället läto krigarne
i fullt språng löpa
hästarne med munbett
genom Mörkskog den okända.
Allt Hunnerlandet darrade,
där dristige de redo,
gåvo gångarne fart
över grönskande slätter.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$Land sáu þeir Atla
ok liðskjalfar djúpa,
Bikka greppar standa
á borg inni háu,
sal of suðrþjóðum
sleginn sessmeiðum,
bundnum röndum,
bleikum skjöldum,
dafar darraðar;
en þar drakk Atli
vín í valhöllu,
verðir sátu úti
at varða þeim Gunnari,
af þeir hér vitja kvæmi
með geiri gjallanda
at vekja gram hildi.$txt$, $txt$Atles jord de sågo,
ovan djupen vallar,
- Bickes män stå
på borgen den höga -
sal över söderfolk
med sittplatser utstyrd
med bundna bröstskydd
och bleka sköldar.
Med spjut och spetsar
spridda voro vakter
- vin drack Atle
i väldiga salen -
att på Gunnars folk akta,
om de gåve sig hit
med vinande kastspjut
att kriga mot fursten.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Systir fann þeira snemst,
at þeir í sal kómu
bræðr hennar báðir, -
bjóri var hon lítt drukkin:
"Ráðinn ertu nú, Gunnarr.
Hvat muntu, ríkr, vinna
við Húna harmbrögðum?
Höll gakk þú ór snemma.$txt$, $txt$Snart varsnade deras syster,
att i salen de kommo,
båda hennes bröder;
ej brydde henne ölet:
»Förrådd är du, Gunnar
Vad rår du väl att göra
mot hunners onda anslag?
Gå ut ur salen genast!$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$Betr hefðir þú, bróðir,
at þú í brynju færir,
sem hjalmum aringreypum
at séa heim Atla,
sætir þú í söðlum
sólheiða daga,
nái nauðfölva
létir nornir gráta,
Húna skjaldmeyjar
herfi kanna,
en Atla sjalfan
létir þú í ormgarð koma,
nú er sá ormgarðr
ykkr of folginn."$txt$, $txt$Bättre vore, broder,
att i brynja du komme
och i hjälmar med ringband
att gästa Atles hem,
att du sutte i sadel
på solheta dagar,
läte kvinnor kvida
över kallnade lik
och hunnernas sköldmör
härverk känna,
men Atle själv läte du
i ormgård komma;
nu är den ormgården
eder beredd.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$"Seinat er nú, systir,
at samna Niflungum;
langt er at leita
lýða sinnis til,
ef rosmufjöll Rínar
rekka óneissa."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$Fengu þeir Gunnar
ok í fjötur settu
vin Borgunda
ok bundu fastla.$txt$, $txt$De fångade Gunnar
och i fjättrar satte
burgundernas hövding
och hår honom bundo.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$Sjau hjó Högni
sverði hvössu,
en inum átta
hratt hann í eld heitan;
svá skal frækn
fjándum verjask
[sem] Högni varði
hendr [sínar].$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$-- -- Gunnars;
frágu fræknan,
ef fjör vildi,
gotna þjóðann,
gulli kaupa.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$"Hjarta skal mér Högna
í hendi liggja
blóðugt, ór brjósti
skorit baldriða
saxi slíðrbeitu,
syni þjóðans."$txt$, $txt$»Hognes hjärta
i min hand skall ligga,
blodigt, skuret
ur bröstet på hjälten,
med skarpslipat kortsvärd,
på konungasonen.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$Skáru þeir hjarta
Hjalla ór brjósti
blóðugt ok á bjóð lögðu
ok báru þat fyr Gunnar.$txt$, $txt$Hjärtat de skuro
ur Hjalles bröst,
blodigt, och på bricka
det buro till Gunnar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$Þá kvað þat Gunnarr,
gumna dróttinn:
"Hér hefi ek hjarta
Hjalla ins blauða,
ólíkt hjarta
Högna ins frækna,
er mjök bifask,
er á bjóði liggr,
bifðisk halfu meir,
er í brjósti lá."$txt$, $txt$Då sade Gunnar,
gode kämpars drott:
»Här har jag hjärtat
av Hjalle den fege,
olikt hjärtat
av den djärve Hogne,
då det mycket bävar,
där på brickan det ligger;
det bävade dubbelt
när i bröstet det låg.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$Hló þá Högni,
er til hjarta skáru
kvikvan kumblasmið,
klökkva hann sízt hugði;
blóðugt þat á bjóð lögðu
ok báru fyr Gunnar.$txt$, $txt$Då skrattade Hogne,
när de skuro till hjärtat
på levande krigshjälten;
han klagan lät ej höra.
De på brickan blodigt lade det
och buro det till Gunnar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$Mærr kvað þat Gunnarr
geirniflungr:
"Hér hefi ek hjarta
Högna ins frækna,
ólíkt hjarta
Hjalla ins blauða,
er lítt bifask,
er á bjóði liggr,
bifðisk svági mjök,
þá er í brjósti lá.$txt$, $txt$Då sade Gunnar,
glänsande spjut-nivlung:
»Här har jag hjärtat
av Hogne den djärve,
olikt hjärtat
på Hjalle den fege;
det föga bävar,
där på brickan det ligger,
bävade ej ens så,
när i bröstet det låg.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$Svá skaltu, Atli,
augum fjarri,
sem munt
menjum verða;
er und einum mér
öll of folgin
hodd Niflunga,
lifir-a nú Högni.$txt$, $txt$Atle, så fjärran
från intet du blir,
som bliva du skall
från skatterna våra.
Jag är den ende,
som gömstället vet
för all nivlungaskatten;
nu lever ej Hogne.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$Ey var mér týja,
meðan vit tveir lifðum,
nú er mér engi,
er ek einn lifik.
Rín skal ráða
rógmalmi skatna,
svinn, áskunna
arfi Niflunga,
- í veltanda vatni
lýsask valbaugar, -
heldr en á höndum gull
skíni Húna börnum."$txt$, $txt$Alltid tvivel jag hyste,
medan två vi levde,
nu har jag intet,
då jag ensam lever.
Ren för guldet skall råda,
som retar till strid,
fors för nivlungars arv,
som från asarne kommit.
I virvlande vatten
skola välska ringar lysa,
hellre än guld på händerna
av hunners barn må skina.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Ýkvið ér hvélvögnum,
haftr er nú í böndum."$txt$, $txt$»Faren med vagnarna!
Fången är i band nu.»
Och bort dädan
betselskakaren
till döden drog
dådrike kungen.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$Atli inn ríki
reið Glaum mönum,
sleginn rógþornum,
sifjungr þeira.
-- -- --
Guðrún sigtífa,
varnaði við tárum,
vaðin í þyshöllu.$txt$, $txt$Då red Atle den mäktige
manyvige Glaum,
ledsagad av krigare;
deras svåger han var
[Gunnars och Hognes];
Gudrun, i krigarnes
glamsal gången,
gråten sväljde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$"Svá gangi þér, Atli,
sem þú við Gunnar áttir
eiða oft of svarða
ok ár of nefnda,
at sól inni suðrhöllu
ok at Sigtýs bergi,
hölkvi hvílbeðjar
ok at hringi Ullar."
Ok meir þaðan
menvörð bituls
dolgrögni dró
til dauðs skokkr.$txt$, $txt$»Så gånge dig, Atle,
som med Gunnar du haver
eder ofta svurit
och uttalat fordom
vid sol i söder
och vid Sigtyrs berg,
vid vilobäddens rum
och vid Ulls ring!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Lifanda gram
lagði í garð,
þan er skriðinn var,
skatna mengi,
innan ormum,
en einn Gunnarr
heiftmóðr hörpu
hendi kníði,
glumðu strengir;
svá skal gulli
frækn hringdrifi
við fira halda.$txt$, $txt$Krigarhopen lade
levande fursten,
i den gård, varest runt
ringlade sig
ormar inne.
Men ensam Gunnar
harmsen harpan
med handen slog,
strängarne klingade.
En konung med mod
skall så i säkerhet
sätta sitt guld.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Atli lét
lands síns á vit
jó eyrskáan
aftr frá morði;
dynr var í garði,
dröslum of þrungit,
vápnsöngr virða,
váru af heiði komnir.$txt$, $txt$Atle lät löpa
till sitt lantgods från mordet
sin gode gångare,
som i gruset travade.
Larm på gården hördes,
hästarne trängdes,
ett hiskligt vapenslammer,
från heden de kommo.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Út gekk þá Guðrún
Atla í gögn
með gylltum kálki
at reifa gjöld rögnis:
"Þiggja knáttu, þengill,
í þinni höllu
glaðr at Guðrúnu
gnadda niflfarna."$txt$, $txt$Ut gick då Gudrun
Atle till mötes
med gyllene bägarn
att hans gengäld kungöra:
»Få kan du, furste,
i festsalen din
glad hos Gudrun
grisar hädanfarna!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$Umðu ölskálir
Atla vínhöfgar,
þá er í höll saman
Húnar tölðusk,
gumar gransíðir,
gengu inn hvatir.$txt$, $txt$Vinfyllda skålar
skramlade hos Atle,
när hunnerna sutto
i hallen och språkade.
Raska karlar kommo
med knävelborrar långa.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Skævaði þá in skírleita
-- -- --
veigar þeim at bera,
afkár dís jöfrum
ok ölkrásir valði
nauðug neffölum,
en níð sagði Atla:$txt$, $txt$Då skred den ljushylta
att skålar åt dem bära,
den bistra kvinnan, åt männen,
och mat till ölet valde
av tvång, men till bleke Atle
hon talade hånfullt:$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$"Sona hefir þinna,
sverða deilir,
hjörtu hrædreyrug
við hunang of tuggin;
melta knáttu, móðugr,
manna valbráðir,
eta at ölkrásum
ok í öndugi at senda.$txt$, $txt$»Dina söners hjärtan,
du svärdsutdelare,
har du blodiga
med honung tuggat.
Du, modige, nu kan smälta
människostekar,
äta dem till ölet,
undfägna gäster i högbänk.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$Kallar-a þú síðan
til knéa þinna
Erp né Eitil,
ölreifa tvá;
sér-a-ðu síðan
í seti miðju
gulls miðlendr
geira skefta,
manar meita
né mara keyra."$txt$, $txt$Du kallar ej att sitta
i knä hos dig sedan
Erp eller Eitil
att två åt ölet glädjas;
du ser ej sedan,
sittande mitt på bänken,
de unga skattskänkarne
skafta spjut,
ansa manar
och egga hästar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$Ymr varð á bekkjum,
afkárr söngr virða,
gnýr und guðvefjum,
grétu börn Húna;
nema ein Guðrún,
er hon æva grét
bræðr sína berharða
ok buri svása,
unga, ófróða,
þá er hon við Atla gat.$txt$, $txt$På bänkarne blev larm,
- bistra läto männen -
gny under guldväv,
gråt från hunners barn,
utom Gudrun ensam,
som aldrig begrät
sina björndjärva bröder
och båda kära söner,
unga, oskuldsfulla,
som med Atle hon hade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$Gulli söri
in gaglbjarta,
hringum rauðum
reifði hon húskarla;
sköp lét hon vaxa,
en skíran malm vaða,
æva fljóð ekki
gáði fjarghúsa.$txt$, $txt$Guld sådde
den svanvita,
röda ringar
räckte hon huskarlarne,
sitt öde lät hon fyllas,
ädelmetallen vandra,
kvinnan alls intet
aktade deras liv.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$Óvarr Atli
óðan hafði hann sik drukkit,
vápn hafði hann ekki,
varnaði-t hann við Gudrúnu,
oft var sá leikr betri,
þá er þau lint skyldu
oftar um faðmask
fyr öðlingum.$txt$, $txt$Intet anade Atle,
yr han sig druckit,
vapen han ej bar,
var på vakt ej mot Gudrun.
Bättre var det ofta,
då båda kärligt
för ädlingarnes ögon
omfamnade varandra.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$Hon beð broddi
gaf blóð at drekka
hendi helfússi
ok hvelpa leysti,
hratt fyr hallar dyrr
ok húskarla vakði
brandi brúðr heitum,
þau lét hon gjöld bræðra.$txt$, $txt$Medelst svärdsudd hon bädden
gav blod att dricka,
med mordgirig hand,
och hundarne löste,
framför hallens dörr dem hävde.
Med het brand väckte
husfrun sina huskarlar;
det var hämnden för bröderna.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$Eldi gaf hon þá alla,
er inni váru
ok frá morði þeira Gunnars
komnir váru ór Myrkheimi;
forn timbr fellu,
fjarghús ruku,
bær Buðlunga,
brunnu ok skjaldmeyjar
inni aldrstamar,
hnigu í eld heitan.$txt$, $txt$Åt elden gav hon alla,
som inne voro,
som från mordet på Gunnar
ur Mörkhem kommit.
Då ramlade timret
och rykte kropparne
samt budlungarnes gård.
Där brunno ock sköldmör,
livet förlustiga
i lågan de föllo.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$Fullrætt er um þetta,
ferr engi svá síðan
brúðr í brynju
bræðra at hefna;
hon hefir þriggja
þjóðkonunga
banorð borit,
björt, áðr sylti.$txt$, $txt$Nog härom är talat,
ej någon gör så mer
brud i brynja
sina bröder att hämna.
Tre konungars bane
hon blivit har,
förrn hon skildes hädan
den sköna kvinnan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Kvädet om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);

-- ===== Den grönländska sången om Atle  (Atlamál in grænlenzku) =====
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 1, $txt$Frétt hefir öld óvu,
þá er endr of gerðu
seggir samkundu,
sú var nýt fæstum,
æxtu einmæli,
yggr var þeim síðan
ok it sama sonum Gjúka,
er váru sannráðnir.$txt$, $txt$All världen sport den fiendskapen,
när fordom männen
sig gaddade samman,
vad ej gott var för många.
De ivrigt i enrum talte;
ödesdigert blev det dem sedan,
så ock för Gjukes söner,
som i sanning förrådde voro.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=1);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 2, $txt$Sköp æxtu skjöldunga,
- skyldu-at feigir, -
illa réðsk Atla,
átti hann þó hyggju;
felldi stoð stóra,
stríddi sér harðla,
af bragði boð sendi,
at kvæmi brátt mágar.$txt$, $txt$De skyndade på sköldungars öde,
som skäligen ej falla borde;
illa åt Atle råddes,
han ägde dock förstånd.
Ett starkt stöd han fällde,
svårt stred mot eget bästa;
i brådkastet bud han sände
och bjöd sina svågrar snart komma.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=2);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 3, $txt$Horsk var húsfreyja,
hugði at mannviti;
lag heyrði hon orða,
hvat þeir á laun mæltu;
þá var vant vitri,
vildi hon þeim hjalpa,
skyldi of sæ sigla,
en sjalf né komsk-at.$txt$, $txt$Klok var husfrun,
klyftigt hon tänkte;
lyssnade till lydelsen
av vad i löndom de talte.
Då var vanskligt för den visa;
hon ville dem hjälpa.
över sjön det skulle seglas,
själv kunde hon ej komma.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=3);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 4, $txt$Rúnar nam at rísta,
rengdi þær Vingi
- fárs var hann flýtandi -,
áðr hann fram seldi;
fóru þá síðan
sendimenn Atla
um fjörð Lima,
þar er fræknir bjuggu.$txt$, $txt$Runor hon tog att rista,
dem rådbråkade Vinge,
innan fram han dem lämnade
falskhet han övade.
Sedan foro då
sändemän från Atle
över Limafjord;
där levde de djärva.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=4);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 5, $txt$Ölværir urðu
ok elda kyndu,
hugðu vætr véla,
er þeir váru komnir;
tóku þeir fórnir,
er þeim fríðr sendi,
hengðu á súlu,
hugðu-t þat varða.$txt$, $txt$De ölglada blevo
och eldar tände,
på intet argt de tänkte,
då in dessa kommit.
De togo de gåvor,
som Gudrun dem sände,
hängde dem på stolpen,
som hade de ej att betyda.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=5);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 6, $txt$Kom þá Kostbera,
kvæn var hon Högna,
kona kapps gálig,
ok kvaddi þá báða;
glöð var ok Glaumvör,
er Gunnarr átti,
fellsk-at saðr sviðri,
sýsti of þörf gesta.$txt$, $txt$Då kom Kostbera,
en kvinna, som iakttog mycket,
hustru hon var till Hogne,
och hälsade dem båda.
Glad var ock Glaumvor,
som Gunnar hade till maka;
fint sätt hon svek ej, vettig,
sysslade med gästers
förplägning.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=6);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 7, $txt$Buðu þeir heim Högna,
ef hann þá heldr færi,
sýn var svipvísi,
ef þeir sín gæði;
hét þá för Gunnarr,
ef Högni vildi,
Högni því nítti-t,
er hinn of réði.$txt$, $txt$De bjödo hem Hogne,
om han då hellre fore;
uppenbar var illslugheten,
om aktat sig de hade.
Gunnar lovade,
om gå ville Hogne,
Hogne var emot,
vad den andre bestämde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=7);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 8, $txt$Báru mjöð mærar,
margs var alls beini;
fór þar fjölð horna,
unz þótti fulldrukkit.$txt$, $txt$Mjöd buro de väna,
mycket blev där bjudet,
tallösa horn där gingo,
förrn det tycktes nog drucket.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=8);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 9, $txt$Hjú gerðu hvílu
sem þeim hægst þótti;
kennd var Kostbera,
kunni hon skil rúna,
innti orðstafi
at eldi ljósum;
gæta varð hon tungu
í góma báða,
váru svá villtar,
at var vant at ráða.$txt$, $txt$Makar bäddade sängen,
som bäst dem tycktes vara,
kunnig var Kostbera,
hon kunde förstå runor.
Hon läste ljudtecknen
vid ljuset av elden,
hon fick sin tunga
taga i akt,
de voro så villade,
att vanskligt var att tyda.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=9);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 10, $txt$Sæing fóru síðan
sína þau Högni;
dreymði dróttláta,
dulði þess vætki,
sagði horsk hilmi,
þegars hon réð vakna:$txt$, $txt$Med sin hustru gick sedan
Hogne till sängs;
drottningen drömde,
och dolde det icke;
vis, hon det sade,
när hon vaknade, åt fursten:$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=10);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 11, $txt$"Heiman gerisk þú, Högni,
hyggðu at ráðum,
fár er fullrýninn,
far þú í sinn annat;
réð ek þér rúnar,
er reist þín systir,
björt hefir þér eigi
boðit í sinn þetta.$txt$, $txt$»Hemifrån du dig reder,
Hogne, tänk dig för!
Få kunna fullt runor;
far en annan gång!
De runor jag dig tydde,
som ristats av din syster;
ej denna gång har dig
drottningen bjudit.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=11);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 12, $txt$Eitt ek mest undrumk,
mák-at ek enn hyggja,
hvat þá varð vitri,
er skyldi villt rísta;
því at svá var á vísat,
sem undir væri
bani ykkarr beggja,
ef it bráðla kvæmið;
vant er stafs vífi,
eða valda aðrir."$txt$, $txt$Över ett mest jag undrar
och än det ej förstår,
vad som vållade, att den visa
villsamt skulle rista,
ty antytt var så,
som om under det låge
bådas eder bane,
om I brått skullen komma.
Valt har hon vilse runa
eller vålla det andra.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=12);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 13, $txt$"Allar ro illúðgar,
ákk-a ek þess kynni
vilk-a ek þess leita,
nema launa eigim;
okkr mun gramr gulli
reifa glóðrauðu;
óumk ek aldregi,
þótt vér ógn fregnim."$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=13);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 14, $txt$"Stopalt munuð ganga,
ef it stundið þangat;
ykkr mun ástkynni
eigi í sinn þetta;
dreymdi mik, Högni,
dyljumk þat eigi;
ganga mun ykkr andæris,
eða ella hræðumk.$txt$, $txt$»I störten i fördärvet,
om I sträven ditåt,
ej vänlig välkomst
väntar er denna gång.
Jag drömde, Hogne,
jag döljer det icke,
det skall gå eder galet,
eller grundlöst jag rädes.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=14);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 15, $txt$Blæju hugða ek þína
brenna í eldi,
hryti hár logi
hús mín í gögnum."$txt$, $txt$Ditt lakan jag tyckte
låga och brinna,
igenom mina hus
hög eldkvast for upp.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=15);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 16, $txt$"Liggja hér línklæði,
þau er lítt rækið,
þau munu brátt brenna,
þau er þú blæju sátt."$txt$, $txt$»Här linnekläder ligga,
som litet I akten;
bäsl det är, de skola brinna,
då i brand du lakanet såg.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=16);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 17, $txt$"Björn hugða ek hér inn kominn,
bryti upp stokka,
hristi svá hramma,
at vér hrædd yrðim;
munn oss mörg hefði,
svá at vér mættim ekki;
þar var ok þrömmun
þeygi svá lítil."$txt$, $txt$»Björn tyckte jag här in kommen,
och att han bröte upp stockar
och ruskade på ramarne,
så att rädda vi blevo,
hade många av oss i munnen,
så att vi mäktade intet;
långt ifrån litet
larm det var där.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=17);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 18, $txt$"Veðr mun þar vaxa,
verða ótt snemma,
hvítabjörn hugðir,
þar mun hregg austan."$txt$, $txt$»Vinden skall växa
och våldsam snart bliva;
då en isbjörn du tyckte ingå,
kommer österifrån storm.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=18);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 19, $txt$"Örn hugða ek hér inn fljúga
at endlöngu húsi,
þat mun oss drjúgt deilask,
dreifði hann oss öll blóði,
hugða ek af heitum
at væri hamr Atla."$txt$, $txt$»Jag tyckte örn flyga in här
ändefter salen,
oss stor fara stundar,
han stänkte på oss blod;
av hans hot jag höll honom
för en ham av Atle.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=19);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 20, $txt$"Slátrum sýsliga,
séum þá roðru,
oft er þat fyr öxnum,
er örnu dreymir;
heill er hugr Atla,
hvatki er þik dreymir."
Lokit því létu,
líðr hver ræða.$txt$, $txt$Med slakt vi ivrigt syssla,
och se därvid blod,
ofta det gäller oxar,
då om örnar man drömmer.
Ärligt är Atles sinne,
vad ont du än må drömma.»
Så slutade de sitt samtal
och sade intet mera.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=20);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 21, $txt$Vöknuðu vel borin,
var þar sams dæmi,
gettisk þess Glaumvör,
at væri grand svefna
-- -- -- við Gunnarr
at fáa tvær leiðir.$txt$, $txt$De välborna vaknade,
samma vändning tog samtalet,
Glaumvor sig gruvade
för gräsliga drömmar,
då frestade Gunnar
att få dem på två sätt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=21);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 22, $txt$"Görvan hugða ek þér galga,
gengir þú at hanga,
æti þik ormar,
yrða ek þik kvikvan,
gerðisk rök ragna;
ráð þú, hvat þat væri."$txt$, $txt$»Gjord tyckte jag dig en galge
och att du ginge att hänga,
att ormar dig åte,
komme över dig levande,
att ragnarök blev.
Räkna ut, vad det är!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=22);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 23, $txt$. . . . . . . . . . .$txt$, $txt$- - - -$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=23);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 24, $txt$"Blóðgan hugða ek mæki
borinn ór serk þínum
- illt er svefn slíkan
at segja nauðmanni, -
geir hugða ek standa
í gögnum þik miðjan,
emjuðu ulfar
á endum báðum."$txt$, $txt$»Blodigt svärd jag tyckte
ur din brynja draget,
- svårt är att slik dröm
säga för sin make -
spjut såg jag stunget
stå mitt igenom dig,
ulvar vid ömse
ändar tjöto.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=24);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 25, $txt$"Rakkar þar renna,
ráðask mjök geyja,
oft verðr glaumr hunda
fyr geira flaugun."$txt$, $txt$»Hundar här ränna,
högt de bruka skälla;
ofta förebadar hundskall
flygandet av spjut.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=25);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 26, $txt$"Á hugða ek hér inn renna
at endlöngu húsi,
þyti af þjósti,
þeystisk of bekki,
bryti fætr ykra
bræðra hér tveggja,
gerði-t vatn vægja;
vera mun þat fyr nökkvi."$txt$, $txt$»In en å jag tyckte rinna
har ändefter huset,
den forsade och fräste,
flödade över bänkar,
den bröt av benen
på er bröder två,
vattnet ej väjde;
det varslar nog för något.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=26);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 27, $txt$. . . . . . . . . . .$txt$, $txt$Åkrar torde löpa, där
som du tyckte en å rinna,
och när vi gå på åkern,
fastna ofta stora agnar
ifötterna på oss. Strofen är utlämnad i R.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=27);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 28, $txt$"Konur hugðak dauðar
koma í nótt hingat,
væri-t vart búnar,
vildi þik kjósa,
byði þér bráðliga
til bekkja sinna;
ek kveð aflima
orðnar þér dísir."$txt$, $txt$»Kvinnor jag tyckte döda
komma hit i natt,
kostbart de voro klädda,
kora dig de ville.
Brått de dig bjödo
till bänkarna sina,
dina diser jag menar
ej duga mer att hjälpa dig.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=28);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 29, $txt$"Seinat er at segja,
svá er nú ráðit;
forumk-a för þó,
alls þó ar fara ætlat;
margt er mjök glíkligt,
at mynim skammæir."$txt$, $txt$»För sent är sådant säga,
beslutat det nu blivit,
förebudet jag ej fly kan,
då att fara nu är ämnat;
mena tyckes mycket,
att vi månde få kort liv.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=29);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 30, $txt$Litu er lýsti,
létusk þeir fúsir,
allir upp rísa,
önnur þau löttu,
fóru fimm saman,
fleiri til váru
halfu húskarlar,
hugat var því illa.
Snævarr ok Sólarr,
synir váru þeir Högna,
Orkning þann hétu,
er þeim enn fylgði,
blíðr var börr skjaldar
bróðir hans kvánar.$txt$, $txt$De sågo dager lysa,
och lust de visade
alla upp att stiga;
de andra avrådde.
De foro fem tillsammans
och följdes av huskarlar
dubbelt så många,
- dåligt var det uttänkt. -
Snavar och Solar,
de voro söner till Hogne,
Orkning han hette,
som dem ytterligare följde,
sköldens blide bärare
var broder till hans hustru.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=30);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 31, $txt$Fóru fagrbúnar,
unz þau fjörðr skilði;
löttu ávallt ljósar,
létu-at heldr segjask.$txt$, $txt$De fagert klädda följde dem,
tills fjorden dem skilde,
avrådde alltjämt
men utan någon verkan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=31);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 32, $txt$Glaumvör kvað at orði,
er Gunnarr átti,
mælti hon við Vinga,
sem henni vert þótti:
"Veitk-at ek, hvárt verðlaunið
at vilja ossum;
glæpr er gests kváma,
ef í gerisk nakkvat."$txt$, $txt$»Du har skridit till dråpslag,
fast du skulle så ej göra;
illa är vän svika,
som väl på dig litar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=32);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 33, $txt$Sór þá Vingi,
sér réð hann lítt eira:
"Eigi hann jötnar,
ef hann at yðr lygi,
galgi görvallan,
ef hann á grið hygði."$txt$, $txt$Så svor då Vinge
och väjde ej för eder:
»Måtte jättarne honom taga,
om han ljöge för eder,
må i galgen han hänga,
förgrepe han sig på lejden!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=33);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 34, $txt$Bera kvað at orði,
blíð í hug sínum:
"Sigli þér sælir
ok sigr árnið;
fari sem ek fyr mælik,
fæst eigi því níta."$txt$, $txt$Bera tog till orda,
blid i sitt sinne:
»Seglen sälle
och seger vinnen!
Må det hända, som jag önskat,
och må hinder icke komma!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=34);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 35, $txt$Högni svaraði,
hugði gótt nánum:
"Huggizk it, horskar,
hvégi er þat gervisk;
mæla þat margir,
missir þó stórum,
mörgum ræðr litlu,
hvé verðr leiddr heiman."$txt$, $txt$Hogne svarade,
och hugnade de sina:
»Vad, hustrur, oss händer,
hållen modet uppe!
Många så säga,
det slår dock illa in;
föga det mången båtar,
vad vid färd från hemmet önskas.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=35);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 36, $txt$Sásk til síðan,
áðr í sundr hyrfi,
þá hygg ek sköp skiptu,
skilðusk vegir þeira.$txt$, $txt$De sågo på varandra sedan,
innan i sär det skulle bära.
Då beskärdes dem deras skickelse
och skildes deras vägar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=36);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 37, $txt$Róa námu ríki,
rifu kjöl halfan,
beystu bakföllum,
brugðusk heldr reiðir,
hömlur slitnuðu,
háir brotnuðu,
gerðu-t far festa,
áðr þeir frá hyrfi.$txt$, $txt$Med riktig fart de rodde,
då rämnade halva kölen,
de böjde sig tillbaks, då de rodde,
och böljorna piskade i vrede;
band på åror sletos,
sönder brusto årtullar,
de fäste ej farkosterna,
innan från dem de gingo.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=37);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 38, $txt$Litlu ok lengra,
- lok mun ek þess segja -,
bæ sá þeir standa,
er Buðli átti;
hátt hriktu grindr,
er Högni kníði.$txt$, $txt$Och litet längre fram
- nu lyktas om färden -
sågo de de boningshus,
som Budle ägde, för sig;
högt grindarne skrällde
då Hogne klappade på.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=38);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 39, $txt$Orð kvað þá Vingi,
þats án væri:
"Farið firr húsi,
- flátt er til sækja,
brátt hefi ek ykkr brennda,
bragðs skuluð höggnir,
fagrt bað ek ykkr kvámu,
flátt var þó undir -
ella heðan bíðið,
meðan ek hegg yðr galga."$txt$, $txt$Ord yttrade då Vinge,
som osagda bättre varit:
»Flyn fjärran från huset,
det är farligt att besöka,
snart får jag eder brända,
bums skolen I nedhuggas.
Fagert bjöd jag eder komma,
falskhet låg dock under,
eller vänten här,
tills jag huggit eder galge.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=39);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 40, $txt$Orð kvað hitt Högni,
hugði lítt vægja,
varr at véttugi,
er varð at reyna:
"Hirða þú oss hræða,
hafðu þat fram sjaldan,
ef þú eykr orði,
illt muntu þér lengja."$txt$, $txt$Ord yttrade Hogne,
aktade ej att väja,
rädd för intet,
som att röna blev:
»Bry dig ej oss skrämma
och skryt däröver sällan!
Om du yttrar ett ord till,
ditt onda du förlänger.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=40);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 41, $txt$Hrundu þeir Vinga
ok í hel drápu,
öxar at lögðu,
meðan í önd hixti.$txt$, $txt$De gingo löst på Vinge
och ihjäl honom slogo,
med yxor honom höggo,
så länge andan i honom rosslar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=41);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 42, $txt$Flykkðusk þeir Atli
ok fóru í brynjur,
gengu svá görvir,
at var garðr milli;
urpusk á orðum
allir senn reiðir:
"Fyrr várum fullráða
at firra yðr lífi."$txt$, $txt$Atles folk fylkades
och foro i brynjor
och härklädda gingo,
men en hägnad var emellan.
Ord de alla vreda
öste på varandra:
»Vi länge fast beslutat,
att frånta eder livet.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=42);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 43, $txt$"Á sér þat illa,
ef höfðuð áðr ráðit,
en eruð óbúnir,
ok höfum einn felldan,
lamðan til heljar,
liðs var sá yðvars."$txt$, $txt$»Det ser man illa på er,
om I beslutat det förut
men ären än ej rustade,
och en fällt vi hava,
hackat honom ihjäl,
och han var av edert folk.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=43);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 44, $txt$Óðir þá urðu,
er þat orð heyrðu,
forðuðu fingrum
ok fengu í snæri,
skutu skarpliga
ok skjöldum hlífðusk.$txt$, $txt$Ursinniga de blevo,
då det ordet de hörde;
de flyttade fingrarne
och fattade i spjutsnöret,
sköto i skarp strid,
och skyddade sig med skölden.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=44);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 45, $txt$Inn kom þá andspilli,
hvat úti drýgðu,
halir fyr höllu,
heyrðu þræl segja.$txt$, $txt$In kom underrättelse,
vad de ute gjorde,
högt en träl framför hallen
de hörde det säga.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=45);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 46, $txt$Ötul var þá Guðrún,
er hon ekka heyrði,
hlaðin halsmenjum,
hreytti hon þeim gervöllum,
slöngði svá silfri,
at í sundr hrutu baugar.$txt$, $txt$Förgrymmad blev Gudrun,
när det gräsliga hon hörde,
med halskedjor smyckad,
hon slängde bort alla,
hon slungade så silvret,
att sönder brusto ringarne.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=46);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 47, $txt$Út gekk hon síðan,
yppði-t lítt hurðum,
fór-a fælt þeygi
ok fagnaði komnum,
hvarf til Niflunga,
sú var hinzt kveðja,
fylgði saðr slíku,
sagði hon mun fleira:$txt$, $txt$Ut gick då Gudrun,
på gavel slog upp dörren,
trädde fram utan fruktan
och färdmännen hälsade.
Hon slöt sig till nivlungarna,
det var sista hälsningen;
sanning var i sådant,
och hon sade något mera:$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=47);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 48, $txt$"Leitaða ek í líkna
at letja ykkr heiman,
sköpum viðr manngi,
ok skuluð þó hér komnir."
Mælti af mannviti,
ef mundu sættask;
ekki at reðusk,
allir ní kváðu.$txt$, $txt$»Räddning jag sökte
i att råda er från färden;
sitt öde ingen undgår;
I ären dock hit komna.»
Med vishet hon vädjade,
att de vänner skulle bliva,
de aktade det alls icke,
alla nej sade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=48);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 49, $txt$Sá þá sælborin,
at þeir sárt léku,
hugði á harðræði
ok hrauzk ór skikkju;
nökðan tók hon mæki
ok niðja fjör varði,
hæg var-at hjaldri,
hvars hon hendr festi.$txt$, $txt$Den högborna såg då,
att de häftigt stridde,
på stordåd hon tänkte
och strök av sig kappan;
ett blottat svärd tog hon
brödernas liv värjde,
huld var hon ej i Hilds lek,
var än händerna drabbade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=49);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 50, $txt$Dóttir lét Gjúka
drengi tvá hníga,
bróður hjó hon Atla,
bera varð þann síðan,
skapði hon svá skæru,
skelldi fót undan.$txt$, $txt$Gjukes dotter
dräpte två kämpar,
högg till Atles broder,
att han bortbäras måste,
förde så sin fäktning,
att hon foten slog undan.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=50);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 51, $txt$Annan réð hon höggva,
svá at sá upp reis-at,
í helju hon þann hafði,
þeygi henni hendr skulfu.$txt$, $txt$En annan högg hon till,
att upp han sig ej reste,
ihjäl hon honom hade,
dock händerna ej skälvde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=51);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 52, $txt$Þjörku þar gerðu,
þeiri var við brugðit,
þat brá of allt annat,
er unnu börn Gjúka;
svá kváðu Niflunga,
meðan sjalfir lifðu,
skapa sókn sverðum,
slítask af brynjur,
höggva svá hjalma
sem þeim hugr dygði.$txt$, $txt$En strid de där stredo,
stort var dess rykte,
den glänste mer än annat,
som Gjukes söner utfört.
I minne är om nivlungar
att, medan än de levde,
med svärden fram de bröto,
och brynjor av dem sletos;
de höggo så mot hjälmar,
som dem hjältemodet
kraft gav.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=52);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 53, $txt$Morgin mest vágu,
unz miðjan dag líddi,
óttu alla
ok öndurðan dag;
fyrr var fullvegit,
flóði völlr blóði,
átján áðr fellu,
efri þeir urðu.
Beru tveir sveinar
ok bróðir hennar.$txt$, $txt$På morgonen mest de stridde,
tills åt middagen det led,
hela ottan,
och halva dagen.
Innan slut var på slaget,
flöt slätten i blod,
Aderton, innan de föllo,
övervunno
Beras två söner
och brodern till henne.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=53);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 54, $txt$Röskr tók at ræða,
þótt hann reiðr væri:
"Illt er um litask,
yðr er þat kenna;
várum þrír tigir,
þegnar vígligir,
eftir lifum ellifu,
ór er þar brunnit.$txt$, $txt$Atle tog till orda,
fast ond han och vred var:
»Illa är kring sig skåda,
skuld I därtill ären;
trettio vi voro
tappra kämpar,
blott elva av oss återstå,
åtskilligt är då bortbränt.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=54);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 55, $txt$Bæðr várum fimm,
er Buðla misstum;
hefir nú Hel halfa,
en höggnir tveir liggja.$txt$, $txt$Fem bröder vi voro,
när vi Budle miste;
hälften av bröderna Hel har,
och huggna till döds ligga tvänne.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=55);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 56, $txt$Mægð gat ek mikla,
mák-a-k því leyna,
kona váliga,
knák-a ek þess njóta;
hljótt áttum sjaldan,
síz komt í hendr ossar,
firrðan mik frændum,
féi oft svikinn,
senduð systur helju,
slíks ek mest kennumk."$txt$, $txt$Att förnämligt jag fick gifte,
neka jag ej kan,
du ondskefulla kvinna,
men jag kan ej därav njuta.
Sällan lugnt vi hade,
sedan samman med mig du kom.
I slagit mina fränder,
svikit mig på gods,
till döden sänt min syster,
detta mest jag känner.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=56);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 57, $txt$"Getr þú þess, Atli,
gerðir svá fyrri,
móður tókt mína
ok myrðir til hnossa,
svinna systrungu
sveltir þú í helli,
hlægligt mér þat þykkir,
er þú þinn harm tínir;
goðum ek þat þakka,
er þér gengsk illa."$txt$, $txt$»Att så du säger, Atle!
Du sådant började göra.
Moder min du tagit
och mördat för att få skatter.
Hennes systers raska dotter,
du svälte uti hålan.
Nöjsamt det mig tyckes,
då du nämner dina sorger;
gudarne jag tackar,
att det går dig illa.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=57);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 58, $txt$"Eggja ek yðr, jarlar,
auka harm stóran
vífs ins vegliga,
vilja ek þat líta;
kostið svá keppa,
at klökkvi Guðrún,
séa ek þat mætta,
at hon sér né ynði-t.$txt$, $txt$»Jag eggar eder, jarlar,
att öka stora sorgen
för välbeprytt viv;
jag ville det skada.
Gån att så sträva,
att Gudrun må klaga;
gärna jag såge,
att djupt hon sig grämde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=58);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 59, $txt$Takið ér Högna
ok hyldið með knífi,
skerið ór hjarta,
skuluð þess görvir,
Gunnar grimmúðgan
á galga festið,
bellið því bragði,
bjóðið til ormum."$txt$, $txt$Tagen Hogne,
i hans hull kören kniven,
skären ur hjärtat;
göra det I skolen!
Den grymsinte Gunnar
på galge fästen,
bringen det å bane,
bjuden dit ormar!»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=59);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 60, $txt$"Ger, sem til lystir,
glaðr munk þess bíða,
röskr munk þér reynask,
reynt hefi ek fyrr brattara;
höfuð hnekking,
meðan heilir várum,
nú erum svá sárir,
at þá mátt sjalfr valda."$txt$, $txt$»Gör som eder lyster!
Med jämnmod jag det bidar.
Mig rask I skolen röna,
rönt har förr jag värre.
Ingen framgång ni hade,
medan friska vi voro,
nu äro vi sårade
och övermakten din.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=60);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 61, $txt$Beiti þat mælti,
bryti var hann Atla:
"Tökum vér Hjalla,
en Högna forðum,
högum vér halft yrkjum,
hann er skapdauði,
lifir-a svá lengi,
löskr mun hann æ heitinn."$txt$, $txt$De togo Budles brassare
och brukade kniven;
den usla trälen gallskrek,
innan udden han kände.
Tid han sade sig hava
att tegen väl gödsla,
göra smutsigaste syssla,
om han sluppe blott att dö,
glad Hjalle ändå vore,
om de gåve honom livet.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=61);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 62, $txt$Hræddr var hvergætir,
helt-a in lengr rúmi,
kunni klökkr verða,
kleif í rá hverja;
vesall lézk vígs þeira,
er skyldi váss gjalda,
ok sinn dag dapran
at deyja frá svínum,
allri örkostu,
er hann áðr hafði.$txt$, $txt$Rädd blev grytvakten,
rusade från stället,
beklämd blott vara kunde,
klev i varje vrå.
Han sig olycklig sade att få lida
ont för deras strider
och att denna dag var bedrövlig
att dö bort från svinen
och all arbetsförtjänst,
som annars han hade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=62);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 63, $txt$Tóku þeir brás Buðla
ok brugðu til knífi,
æpði illþræli,
áðr odds kenndi,
tóm lézk at eiga
teðja vel garða,
vinna it vergasta,
ef hann við rétti,
feginn lézk þó Hjalli,
at hann fjör þægi.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=63);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 64, $txt$Gættisk þess Högni
- gerva svá færi -,
at árna ánauðgum,
at undan gengi:
"Fyrir kveð ek mér minna
at fremja leik þenna.
Hví mynim hér vilja
heyra á þá skræktun?"$txt$, $txt$Då bemödade sig Hogne
- ej många så göra -
att utverka åt trälen,
att han undan sluppe,
»Jag mindre har emot
att denna medfart röna.
Varför skulle vi här vilja
detta skrän åhöra?»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=64);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 65, $txt$Þrifu þeir þjóðgóðan,
þá var kostr engi
rekkum rakklátum
ráð enn lengr dvelja;
hló þá Högni,
heyrðu dagmegir,
keppa hann svá kunni,
kvöl hann vel þolði.$txt$, $txt$Då grepo de den gode,
gå det mer ej ville
att dröja med dådet
för dristiga kämpar.
Då skrattade Hogne,
det hörde männen,
kraft han visa kunde,
kval han väl tålde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=65);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 66, $txt$Harpu tók Gunnarr,
hrærði ilkvistum,
sláa hann svá kunni,
at snótir grétu,
klukku þeir karlar,
er kunnu görst heyra;
ríkri ráð sagði;
raftar sundr brustu.$txt$, $txt$Harpan tog Gunnar,
grep dess strängar med tårna,
han kunde så spela,
att kvinnorna gräto
och de karlar klagade,
som klangen bäst hörde,
han den höga sin nöd sade,
husets sparrar brusto.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=66);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 67, $txt$Dó þá dýrir,
dags var heldr snemma,
létu þeir á lesti
lifa íþróttir.$txt$, $txt$Så dogo de dråplige
på dagen rätt tidigt,
läto sina hjältedygder
leva till det sista.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=67);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 68, $txt$Stórr þóttisk Atli,
sté hann of þá báða,
horskri harm sagði
ok réð heldr at bregða:
"Morginn er nú, Guðrún,
misst hefir þú þér hollra;
sums ertu sjalfskapa,
at hafi svá gengit."$txt$, $txt$Stor sig tyckte Atle,
då han stäckt dem båda;
sin hustru hennes sorg han sade
och snarast med han förebrådde:
»Morgon är nu Gudrun,
mist har du dina kära,
till somt är själv du skuld,
att så det har gått.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=68);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 69, $txt$"Feginn ertu, Atli,
ferr þú víg lýsa,
á munu þér iðrar,
ef þú allt reynir;
sú mun erfð eftir,
ek kann þér segja:
Ills gengsk þér aldri,
nema ek ok deyja."$txt$, $txt$»Glad är du, Atle,
där gräsligt dråp du vidgar,
anger skall dig träffa,
när allt du får pröva.
Det arv kan jag säga dig
skall efter komma,
att aldrig ont du slipper,
om ej också jag dör.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=69);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 70, $txt$"Kann ek slíks synja,
sé ek til ráð annat
halfu hógligra,
- höfnum oft góðu -,
mani mun ek þik hugga,
mætum ágætum,
silfri snæhvítu,
sem þú sjalf vilir."$txt$, $txt$»Jag kan till sådant ej neka,
dock ser jag annan råd,
långt lämpligare är det
- ofta lämna vi det goda -.
Med träl, jag vill dig trösta
och med tindrande smycken,
med snövitt silver,
så, som själv du vill.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=70);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 71, $txt$"Ón er þess engi,
ek vil því níta;
sleit ek þá sáttir,
er váru sakar minni;
afkár ek áðr þótta,
á mun nú gæða,
hræfða ek um hotvetna,
meðan Högni lifði.$txt$, $txt$Ej något hopp finns därom,
neka därtill vill jag.
Sämjan jag slitit
för sak, som var mindre.
Vrångsint jag förut tycktes,
värre jag nu skall bliva.
Jag höll med vad helst till godo,
medan Hogne ännu levde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=71);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 72, $txt$Alin vit upp várum
í einu húsi,
lékum leik margan
ok í lundi óxum,
gæddi okkr Grímhildr
gulli ok halsmenjum;
bana muntu mér bræðra
bæta aldrigi
né vinna þess ekki,
at mér vel þykki.$txt$, $txt$Vi uppfödda voro
i ett och samma hus,
mången lek vi lekte,
och i lunden växte;
Grimhild gav oss
guld och halskedjor.
Mig brödernas bane
böta kan du aldrig,
eller göra något sådant,
som synes mig gott.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=72);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 73, $txt$Kostum drepr kvenna
karla ofríki;
í kné gengr hnefi,
ef kvistir þverra;
tré tekr at hníga,
ef höggr tág undan;
nú máttu einn, Atli,
öllu hér ráða."$txt$, $txt$Karlars våld krossar
kvinnornas lycka,
i knä går nävan,
när kvistarne minskas,
ett träd att luta tager,
om man tågorna undan hugger.
Nu kan du, Atle, ensam
för allt här råda.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=73);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 74, $txt$Gnótt var grunnýðgi,
er gramr því trúði,
sýn var sveipvísi,
ef hann sín gæði;
kröpp var þá Guðrún,
kunni of hug mæla,
létt hon sér gerði,
lék hon tveim skjöldum.$txt$, $txt$Fasligt lättrogen
var fursten, som dct trodde,
uppenbar illslugheten,
om aktat sig han hade;
krånglig var Gudrun,
kunde sig förställa,
lättlynt hon sig låtsade,
lekte med tvänne sköldar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=74);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 75, $txt$Æxti hon öldrykkjur
at erfa bræðr sína,
samr lézk ok Atli
at sína gerva.$txt$, $txt$Stort gravöl Gudrun
gav efter sina bröder,
så ock Atle sådant
efter sina lät göra.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=75);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 76, $txt$Lokit því létu,
lagat var drykkju,
sú var samkunda
við svörfun ofmikla;
ströng var stórhuguð,
stríddi hon ætt Buðla,
vildi hon ver sínum
vinna ofrhefndir.$txt$, $txt$Lyktat läto de det vara,
lagat var gravölet;
det samkvämet pågick
med svirande väldigt.
Sträng var den stolta,
stred mot Budles ätt,
ville taga på sin make
en mordisk hämnd.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=76);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 77, $txt$Lokkaði hon litla
ok lagði við stokki,
glúpnuðu grimmir
ok grétu þeygi,
fóru í faðm móður,
fréttu, hvat þá skyldi.$txt$, $txt$Hon lockade de små
och lade dem mot stocken;
då häpnade de hårda
men höllo dock gråten,
flögo modern i famn,
frågade, vad ske skulle.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=77);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 78, $txt$"Spyrið lítt eftir,
spilla ætla ek báðum,
lyst várumk þess lengi
at lyfja ykkr elli."$txt$, $txt$»Fråga icke därom!
Jag vill döda eder båda.
Lust hade jag därtill länge
att läka er för ålderdom.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=78);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 79, $txt$Brá þá barnæsku
bræðra in kappsvinna,
skipti-t skapliga,
skar hon á hals báða.
Enn frétti Atli,
hvert farnir væri
sveinar hans leika,
er hann sá þá hvergi.$txt$, $txt$Barsk hon då brödernas
barnaår stäckte,
handlade med hov ej,
halshögg dem båda.
Men Atle sporde,
vart sprungit hade,
hans söner att leka,
då han ej såg dem någonstädes.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=79);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 80, $txt$"Yfir ráðumk ganga
Atla til segja;
dylja munk þik eigi,
dóttir Grímhildar;
glaða mun þik minnst, Atli,
ef þú görva reynir;
vakðir vá mikla,
er þú vátt bræðr mína.$txt$, $txt$»Över vill jag gå
att för Atle det säga,
för dig döljer jag det icke,
jag, dottern av Grimhild.
Minst skall jag dig glädja,
om du märker noga;
mycket ont du anstiftat,
då du ombragt mina bröder.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=80);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 81, $txt$Svaf ek mjök sjaldan,
síðans þeir fellu,
hét ek þér hörðu,
hefi ek þik nú minntan;
morgin mér sagðir,
man ek enn þann görva,
nú er ok aftann,
átt þú slíkt at frétta.$txt$, $txt$Mycket sällan jag sov
alltsedan de föllo.
Hård hämnd jag dig lovat,
du det hört har och minns nu.
Mig en morgon du något sade,
den minnes jag än noga.
Nu åter är det afton,
då äger du slikt höra.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=81);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 82, $txt$Maga hefir þú þinna
misst, sem þú sízt skyldir,
hausa veizt þú þeira
hafða at ölskálum,
drýgða ek þér svá drykkju,
dreyra blett ek þeira.$txt$, $txt$Mist har du dina söner,
som minst förlora du ville.
Vet, att ur deras skallar
som skålar öl du druckit!
Din dryck jag drygare gjorde
genom att deras blod i den blanda.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=82);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 83, $txt$Tók ek þeira hjörtu,
ok á teini steikðak,
selda ek þér síðan,
sagðak, at kalfs væri:
einn þú því ollir,
ekki réttu leifa,
töggtu tíðliga,
trúðir vel jöxlum.$txt$, $txt$Jag tog deras hjärtan
och på tenen stekte,
satte för dig sedan
och sade, att kalv det vore.
Orsak är du ensam,
intet kvar du lämnat,
tuggade träget,
på tänderna litade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=83);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 84, $txt$Barna veiztu þinna,
biðr sér fár verra;
hlut veld ek mínum,
hælumk þó ekki."$txt$, $txt$Vad av barnen blivit, nu vet du,
ej förbannar sig mången till värre.
Min hand jag har i saken,
är högfärdig dock ej däröver.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=84);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 85, $txt$"Grimm vartu, Guðrún,
er þú gera svá máttir,
barna þinna blóði
at blanda mér drykkju;
snýtt hefir þú sifjungum,
sem þú sizt skyldir,
mér lætr þú ok sjalfum
millum ills lítit."$txt$, $txt$»Grym var du, Gudrun,
som så gräsligt kunde göra,
att blod av dina barn
du blandade mig i drycken.
Du slagit ihjäl släktingar,
som sist du skolat,
långt andrum mig själv ej heller
du lämnar mellan olyckor.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=85);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 86, $txt$"Vili mér enn væri
at vega þik sjalfan,
fátt er fullilla
farit við gram slíkan;
drýgt þú fyrr hafðir
þat, er menn dæmi vissu-t til,
heimsku, harðræðis
í heimi þessum;
nú hefir þú enn aukit,
þat er áðan frágum;
greipt glæp stóran,
gört hefir þú þitt erfi."$txt$, $txt$»Lust har jag ock att taga
livet från dig själv;
man förfar knappt nog illa
med en furste, som du är.
Förr mycket du utfört,
vars motstycke ej känt
av vanvettig vildhet
i världen har.
Nu du ytterligare ökat,
vad vi allaredan hört,
ett gruvligt dåd begått;
ditt gravöl du gjort.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=86);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 87, $txt$"Brennd muntu á báli
ok barið grjóti áðr,
þá hefir þú árnat
þatstu æ beiðisk."$txt$, $txt$»Du skulle brännas på bål
och bliva först stenad,
då har du det uppnått,
som alltid du bett om.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=87);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 88, $txt$Sátu samtýnis,
sendusk fárhugi,
hendusk heiftyrði,
hvártki sér unði;
heift óx Hniflungi,
hugði á stórræði,
gat fyr Guðrúnu,
at hann væri grimmr Atla.$txt$, $txt$I samma gård de sutto,
sura mot varandra,
vreda ord växlade,
vantrivdes båda.
Stort hat hos Nivlung stärktes,
på stora dåd han tänkte,
han gav för Gudrun till känna,
hur förgrymmad han var på Atle.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=88);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 89, $txt$Kómu í hug henni
Högna viðfarar,
talði happ hánum,
ef hann hefnt ynni.
Veginn var þá Atli,
var þess skammt bíða,
sonr vá Högna
ok sjalf Guðrún.$txt$, $txt$Ihåg hon då kom,
vad Hogne fått lida,
sade honom hända lycka,
om hämnd han toge.
Dräpt blev då Atle,
det dröjde ej länge;
Hognes son dräpte
och hon själv, Gudrun.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=89);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 90, $txt$Röskr tók at ræða,
rakðisk ór svefni,
kenndi brátt benja,
bands kvað hann þörf enga:
"Segið it sannasta,
hverr vá son Buðla,
emk-a ek lítt leikinn,
lífs tel ek ván enga."$txt$, $txt$Den tappre tog att spörja,
spratt ur sömnen upp,
såren snart kände,
sade ej värt förbinda:
»Sägen mig sanningen,
vem som sonen till Budle dräpte;
ej litet är jag lemlästad,
om liv jag intet hopp har.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=90);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 91, $txt$"Dylja mun þik eigi
dóttir Grímhildar,
látumk því valda,
er líðr þína æfi,
en sumu sonr Högna,
er þik sár mæða."$txt$, $txt$»För dig jag döljer det icke;
jag, dottern av Grimhild,
jag vållar, att din levnad
nu lider till ända,
samt ock sonen till Hogne något,
att såren dig matta, vållar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=91);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 92, $txt$"Vaðit hefir þú at vígi,
þótt væri-t skaplikt,
illt er vin véla,
þanns þér vel trúir;
beiddr fór ek heiman
at biðja þín, Guðrún.$txt$, NULL, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, NULL, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=92);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 93, $txt$Leyfð vartu ekkja,
létu stórráða,
varð-a ván lygi,
er vér of reyndum;
fórtu heim hingat,
fylgði oss herr manna,
allt var ítarligt
um órar ferðir.$txt$, $txt$Bedd, jag for hemifrån
att bedja om din hand, Gudrun.
Stort var ditt lov som änka,
en storråda sades du vara,
lögn ej ryktet sade,
det lärde vi nog att känna.
Du färdades hit till vårt hem,
oss följde en här av kämpar.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=93);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 94, $txt$Margs var alls sómi
manna tíginna,
naut váru ærin,
nutum af stórum,
þar var fjölð féar,
fengu til margir.$txt$, $txt$Allt var härligt,
då hit vi foro.
Mycken var äran
från män av rang,
nötboskap riklig,
vi njöto storligen;
där var myckenhet av håvor,
många dem lämnade.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=94);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 95, $txt$Mund galt ek mærri
meiðma fjölð þiggja,
þræla þría tigu,
þýjar sjau góðar,
sæmð var at slíku,
silfr var þó meira.$txt$, $txt$Till maka jag dig köpte
med en myckenhet smycken,
trettio trälar,
sju trälkvinnor goda
- i sådant var heder -
av silver var dock mera.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=95);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 96, $txt$Léztu þér allt þykkja,
sem ekki væri,
meðan lönd þau lágu,
er mér leifði Buðli,
gróftu svá undir,
gerði-t hlut þiggja;
sværu léztu þína
sitja oft grátna,
fann ek í hug heilum
hjóna vætr síðan."$txt$, $txt$Allt detta du sade dig akta,
som om intet det vore,
då de lantgods du ej hade
som lämnats mig av Budle.
I det fördolda du verkade,
så att del jag ej fick.
Ofta lät du din svärmor
sitta i tårar;
ej i sinnesfrid sedan
såg jag oss makar.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=96);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 97, $txt$"Lýgr þú nú, Atli,
þótt ek þat lítt rekja;
heldr var ek hæg sjaldan,
hóftu þó stórum;
börðuzk ér bræðr ungir,
báruzk róg milli;
halft gekk til heljar
ór húsi þínu;
hrolldi hotvetna
þat er til hags skyldi.$txt$, $txt$»Nu ljuger du, Atle,
men det gör mig ej mycket.
Rätt sällan var jag foglig,
men sämre du var dock.
Som unga ni bröder slogos,
osämja var mellan eder.
Av ditt hus gick hälften
till Hels boning.
Då vacklade allting,
som väl skulle vara.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=97);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 98, $txt$Þrjú várum systkin,
þóttum óvægin,
fórum af landi,
fylgðum Sigurði,
skæva vér létum,
skipi hvert várt stýrði,
örkuðum at auðnu,
unz vér austr kómum.$txt$, $txt$Tre syskon vi voro
och syntes stridbara,
vi foro ur landet
och följde Sigurd,
läto framåt skeppet fara,
sitt fartyg var styrde,
ävlades, som ödet ville,
tills vi österut kommo.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=98);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 99, $txt$Konung drápum fyrstan,
kurum land þaðra,
hersar oss á hönd gengu,
hræðslu þat vissi;
vágum ór skógi
þanns vildum syknan,
settum þann sælan,
er sér né átti-t.$txt$, $txt$Först konungen vi dödade,
kuvade så landet.
Oss harsar gingo till handa,
det häntydde på rädsla.
Ur skogen vi togo var fredlös,
som vi skuldlös ville göra,
förlänade den lycka,
som litet blott ägde.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=99);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 100, $txt$Dauðr varð inn húnski,
drap þá brátt kosti,
strangt var angr ungri
ekkju nafn hljóta;
kvöl þótti kvikri
at koma í hús Atla,
átti áðr kappi,
illr var sá missir.$txt$, $txt$Frankerhjälten död blev,
och fort min ställning skifte.
Mig unga var det ömkligt
att änkenamn bära.
Kvar i livet, det mig kval var,
att komma till Atles boning.
Med en hjälte var jag gift förr,
jämmerlig var förlusten.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=100);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 101, $txt$Komt-a-ðu af því þingi,
er vér þat frægim,
at þú sök sættir
né slekðir aðra;
vildir ávallt vægja
en vætki halda,
kyrrt of því láta,
-- -- -- -- -- --"$txt$, $txt$Från intet ting du kommit,
så vitt vi erfarit hava,
med egen sak vunnen,
ändras mot dig hindrad.
Alltid gav du efter,
ville ingenting hålla
och därom tiga stilla
- - - -.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=101);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 102, $txt$"Lýgr þú nú, Guðrún,
lítt mun við bætask
hluti hvárigra,
höfum öll skarðan.
Gerðu nú, Guðrún,
af gæzku þinni
okkr til ágætis,
er mik út hefja."$txt$, $txt$»Nu ljuger du, Gudrun.
Det gör föga bättre
lotten för någondera;
lidit ha vi båda.
Laga nu, Gudrun,
godhetsfullast
allt oss till ära,
när ut de mig bära.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=102);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 103, $txt$"Knörr mun ek kaupa
ok kistu steinda,
vexa vel blæju
at verja þitt líki,
hyggja á þörf hverja,
sem vit holl værim."$txt$, $txt$»Ett fartyg skall jag köpa,
och en kista, som är målad,
vaxa väl det lakan,
som skall vecklas om ditt lik,
tänka på allt, som tarvas,
som tyckte vi om varandra.»$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=103);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 104, $txt$Nár varð þá Atli,
niðjum stríð æxti,
efndi ítrborin
allt þats réð heita;
fróð vildi Gudrún
fara sér at spilla,
urðu dvöl dægra,
dó hon í sinn annat.$txt$, $txt$Till ledsnad stor för fränderna
ett lik blev då Atle;
den ädelborna uppfyllde
allt, vad hon lovat.
Gudrun, begåvad med vishet,
ville gå att livet spilla;
hennes dagars ände dröjde,
hon dog ej den gången.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=104);
insert into public.source_texts (source_id, stanza_no, original_norse, translation_sv, translation_en, norse_source, sv_source, en_source)
select hs.id, 105, $txt$Sæll er hverr síðan,
er slíkt getr fæða
jóð at afreki,
sems ól Gjúki;
lifa mun þat eftir
á landi hverju
þeira þrámæli,
hvargi er þjóð heyrir.$txt$, $txt$Säll är var och en sedan,
som sådant barn får föda
lika framstående, som de voro,
som föddes av Gjuke.
I varje land
skall leva efter dem,
deras trotsiga tal,
var än det förtäljes för folket.$txt$, NULL, $txt$Eddukvæði (Sæmundar-Edda), utg. Guðni Jónsson (public domain); via heimskringla.no$txt$, $txt$Erik Brate, Sämunds Edda (1913, public domain); via sv.wikisource$txt$, NULL
from public.historical_sources hs
where hs.work_type='edda_poem' and hs.title = $ttl$Den grönländska sången om Atle$ttl$
and not exists (select 1 from public.source_texts st where st.source_id=hs.id and st.stanza_no=105);


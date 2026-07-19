-- Källström-berikning: dedup av ristarhänder + beskrivningar med sidhänvisningar.
-- Underlag: Källström 2007, "Mästare och minnesmärken" (docs/mastareochminnesmarken.pdf),
-- systematiskt genomgången 2026-07-19; varje uppgift nedan bär sidreferens.
-- Beslut (Källströms auktoritet, inte gissning):
--  1. Torbjörn: 4 händer → 2 (s. 59). Torbjörn skald = U 29, U 37, U 70†, U 405, U 532,
--     Sö 190 (s. 73, 135 not 126, 174); U 379/U 391/U 467 = Torbjörn i Sigtuna (s. 296, 305).
--     → Torbjörn 3/4 raderas (dubbletter av skalden), skaldens U 379-kant tas bort,
--     Torbjörn 2 döps om till "Torbjörn i Sigtuna".
--  2. Fot: kurerade "Fot" = samma hand som rundatas "Fot 2" → slås ihop, namnet blir "Fot".
--     "Fot 1" (Sö 341†): signaturläsningen AVVISAD (träsnittsfelläsning, s. 366) — behålls
--     med kontesterad beskrivning.
--  3. Äskil 1 (Sö 333) = Äsger enligt Källström (s. 208; Bilaga 2 s. 426 "Tidigare: Äskil (1)")
--     → kanter flyttas till Äsger, raden raderas.
--  4. Traen: ristaren EXISTERAR INTE enligt Källström — attributionsnamnet vilar på avförd
--     felläsning av Sö 158 (rätt läsning: þróttaR þiagn; s. 362). Behålls med tydlig varning.

begin;

-- ---------- 1. Torbjörn-dedup ----------
-- 1a. Skaldens U 379-kant bort (stenen är Sigtuna-Torbjörns; han har egen kant)
delete from public.relationship r
using public.carvers c, public.runic_inscriptions i
where c.name = 'Torbjörn skald' and r.object_id = c.id
  and r.predicate = 'carved_by'
  and i.signum = 'U 379' and r.subject_id = i.id;

-- 1b. Torbjörn 3/4 raderas — deras enda kanter (U 405, Sö 190) finns redan hos skalden
delete from public.carvers where name in ('Torbjörn 3', 'Torbjörn 4');

-- 1c. Torbjörn 2 → Källströms identitet
update public.carvers set name = 'Torbjörn i Sigtuna'
where name = 'Torbjörn 2';

-- ---------- 2. Fot-merge ----------
-- 2a. Flytta kurerade Fots kant till Fot 2 (bevara qualifiers/proveniens)
insert into public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
select r.subject_id, r.predicate, f2.id, r.qualifiers, r.source_ref, r.confidence
from public.relationship r
join public.carvers f on f.id = r.object_id and f.name = 'Fot'
cross join (select id from public.carvers where name = 'Fot 2') f2
where r.predicate = 'carved_by'
on conflict (subject_id, predicate, object_id) do nothing;

-- Rundata har SJÄLVT två poster: onumrerade "Fot" (1 likhets-kant) och "Fot 2".
-- Kanten är kopierad ovan → radera den onumrerade raden (identifieras som den
-- utan egen huvudkorpus), döp sedan om Fot 2 → Fot.
delete from public.carvers c
where c.name = 'Fot'
  and (select count(*) from public.relationship r
       where r.object_id = c.id and r.predicate = 'carved_by') <= 1;
update public.carvers set name = 'Fot' where name = 'Fot 2';

-- ---------- 3. Äskil 1 → Äsger ----------
insert into public.relationship (subject_id, predicate, object_id, qualifiers, source_ref, confidence)
select r.subject_id, r.predicate, ag.id, r.qualifiers,
       coalesce(r.source_ref,'') || ' | omattribuerad Äskil 1→Äsger (Källström 2007 s. 208)',
       r.confidence
from public.relationship r
join public.carvers a1 on a1.id = r.object_id and a1.name = 'Äskil 1'
cross join (select id from public.carvers where name = 'Äsger') ag
where r.predicate = 'carved_by'
on conflict (subject_id, predicate, object_id) do nothing;

delete from public.carvers where name = 'Äskil 1';

-- ---------- 4. Beskrivningar (ersätter/skriver med Källström-förankring) ----------
update public.carvers set description = d.descr,
  source_ref = 'databasens graf (rundata 2020-11-29) + Källström 2007 med sidref'
from (values

  ('Fot',
   'En av Upplands stora runmästare — 79 stenar i databasen, koncentrerade till Vallentuna härad (18), Ärlinghundra (12) och Danderyds skeppslag (9), stilspann Rak–Pr 4 (ca 980–1100). Källström räknar 7 säkra signaturer (U 167, U 177, U 268, U 464, U 605†, U 678, U 945) men bedömer att den verkliga produktionen hör hemma bland de allra mest produktiva (2007, s. 59); "Fot har verkat över ett mycket större område" än lokala kollegor som Arbjörn (s. 74–75). Åsmund Kåresson var hans ornamentala förebild (s. 280, 293). Verkstaden gick i arv: U 308 signeras "Þórgautr ... Fóts arfi" — Torgöt Fotsarve var Fots son/lärling, "a clear example of a master and his apprentice" (s. 233, 309). Skriftprofil: enbart långkvistrunor, aldrig markerat nasalljud, ræisa (aldrig rétta) i resarformlerna (s. 281–283). Monografi: Crocker 1982. ("Fot 2" i rundatas numrering; "Fot 1" på Sö 341† bygger på en avvisad träsnittsläsning, s. 366.)'),

  ('Fot 1',
   'OBS — osäker hand: rundatas "Fot 1" bygger på Brates läsning "Fot högg" av det försvunna Sö 341† (Dåderö), känd endast ur träsnittet B 803-traditionen. Källström avvisar läsningen: partiet "futr + un" innehåller troligen felläsningar (2007, s. 366). Ska inte förväxlas med den uppländske mästaren Fot.'),

  ('Gunnar',
   '43 stenar i databasen, tyngdpunkt Seminghundra (13) och Vallentuna (12) härader, stilspann Rak–Pr 2 (ca 980–1050). Signaturen finns på U 226 vid Arkils tingstad: "Gunnarr hiogg stæin". Men Källström visar att Ulv i Borresta var upphovsman till monumentet — Ulv skisserade ornamentik och text på både U 225 och U 226 och överlät själva huggningen av U 226 på Gunnar; spårprofilmätningar antyder en mer ovan huggare (2007, s. 264–266). De s.k. "Gunnarsstenarna" (Stilles nio) attribuerar Källström till Ulv i Borresta, inte Gunnar (s. 266). Datering: Pr 1/Rak, hypotetiskt ca 1020 efter Ulvs hemkomst från England (s. 70, 267). Databasens stora Gunnar-korpus bör alltså läsas med Källströms omattribution i minnet.'),

  ('Traen',
   '⚠ Enligt Källström existerar denna ristare INTE. Attributionsnamnet vilar på Brates läsning av Sö 158 (Österberga, Rönö hd) ur träsnittet B 803: "Traen skrev runorna". När stenen återfanns 1951 visade sig samstavsrunan i stället innehålla þrutaRþiakn = þróttaR þiagn, den välbekanta sörmländska hederstiteln — ingen ristarsignatur (Källström 2007, s. 362). Databasens 22 attribuerade stenar (Rönö 12, Öknebo 4, stil Rak/Fp–Pr 2, ca 980–1050) utgör dock alltjämt en sammanhållen anonym hand-grupp; endast NAMNET är avfört.'),

  ('Torbjörn skald',
   'En av endast två uppländska ristare som signerar med titeln skald (den andra är Grim skald; Källström 2007, s. 243). Sex signerade stenar enligt Källström: U 29 Hillersjö (Gerlögs häll, "Þorbiorn skald rísti rúnaR", Pr 4), U 37, U 70†, U 405 Ekerö, U 532 Roslags-Bro och Sö 190 Ytterenhörna (s. 73, 135 not 126, 174); attribuerade dessutom U 517 och U 533 (s. 73, 381 f.). Verksam i två skilda områden i Uppland med enstaka arbeten i Södermanland — Källström föreslår att han var knuten till vissa ätter, kanske i en stormans följe med uppgift att hugfästa släktens döda (s. 244, 212 not 222). Rundatas fyra Torbjörn-händer reduceras av Källström till två (s. 59): denna samt Torbjörn i Sigtuna — U 379, som tidigare låg i skaldens korpus här, är återförd till Sigtunaristaren.'),

  ('Torbjörn i Sigtuna',
   'Tidig runristare verksam "både inne i staden och i ett antal socknar norr därom" — med Torbjörn som tongivande blir Sigtuna ett tredje centrum för den tidiga uppländska runstenstraditionen (Källström 2007, s. 296, 305). Signerade: U 379 och U 391 (korsbandsstenar, Sigtuna) samt U 467 Tibble i Vassunda, direkt norr om staden. Möjligen jämgammal med de oornerade stenarna och Ulv i Borresta (s. 296). Skriftbruk med ålderdomliga drag: inslag av kortkvistrunor, o-runan alltid i kortkvistform, kryssformigt skiljetecken som inskriftsmarkör (s. 296 not 315). Ulvkell (U 479) verkade i hans efterföljd. (Rundatas "Torbjörn 2"; databasens 21-stenarskorpus omfattar även stilattributioner utanför de tre signerade.)'),

  ('Arbjörn',
   '18 stenar i databasen, varav 3 signerade — U 652 Kumla, U 682† Kaddala och U 688 Stavsund, alla med det ovanliga objektet stæin i ristarformeln ("Arbiôrn hiogg stæin þennsa"); Arbjörn kan ha initierat detta bruk i sydvästra Uppland, sedan övertaget av Balle m.fl. (Källström 2007, s. 157). Utpräglat lokalbunden: Håbo härad dominerar (11 stenar), och "den övervägande delen" av Håbolandets ristningar står hans produktion nära (s. 298). Arbetade länge i konservativ stilriktning — hans Pr 2-stenar kan vara yngre än Fots Pr 4 (s. 74–75). Crocker ser spår av ringerikestil med närmaste paralleller i Södermanland: "a transplanted off-shoot of the Götalandic style" (s. 298). Ortografi: enbart långkvistrunor, frekvent stunget e, skiljetecken mellan varje ord, diftonger alltid dubbeltecknade (s. 298 not 317).'),

  ('Halvdan',
   'Sörmländsk hand på Södertörn: 18 stenar i databasen (Sotholms härad 12, Svartlösa 5), stilspann Pr 1–Pr 4 (ca 1010–1100). Enda signaturen är runhällen Sö 270 Tyresta: "haltan : hiak : runa" — Halfdan hiogg rúnaR, stil Pr 3–4 (Källström 2007, s. 365). I övrigt behandlas han inte närmare i avhandlingen; inga samarbeten med namngivna ristare är belagda — en självständig lokal verkstad.'),

  ('Torfast',
   '16 stenar i databasen (Ärlinghundra 4, Lyhundra 2, Seminghundra 2), stilar Pr 2–Pr 4 (ca 1020–1100). Två signaturer enligt Källström: U 599 Hanunda ("x þurfostr x hriti runoR") och U 629 Grynsta backe ("x þurfastr hristi runoR") — båda med den ortografiska egenheten oetymologiskt /h/ i rísti (2007, s. 368, 383 f.); på U 629 markerar han sitt eget namn med kryssformigt skiljetecken (s. 175). Hör till de få uppländska ristare som tydligt anslöt till Åsmund Kåressons egenartade skriftbruk — v. Friesen kallade honom Åsmunds direkta efterföljare (s. 280, 285). Databasens samarbetsdata bekräftar kretsen: Åsmund, Livsten, Torbjörn skald.'),

  ('Önjut',
   'Sen mästare med 16 stenar i databasen över två landskap (Rasbo/Frösåkers/Bälinge härader i Uppland + Gästrikland), stilar Pr 4–Pr 5 (ca 1070–1130). Signaturen står på Gs 1 Österfärnebo: "* in * oyniotr" — En Øyniútr, en satstyp utan verb som Källström läser som ristarsignatur (2007, s. 125). Källström identifierar honom med ristaren av U 1011 Örby i Rasbo och knyter en hel grupp till handen (U 496, U 497, U 597, U 1046 m.fl.) på ornamentik, runformer och karakteristiska k- och f-runor (s. 104, 307). Stilles attribution av Gs 1 till Öpir avvisas uttryckligen: o-runans kortkvistform och skrivningen resa är främmande för Öpir (s. 104–105 not 93).'),

  ('Äskil 2',
   'Uppländsk hand: 12 stenar i databasen (Lagunda 4, Håbo 2, Rasbo 2 härader), stil Fp–Pr 1 (ca 1010–1050). Signaturen på U 778 Svinnegarns kyrka — "x askil x raist", Æskæll ræist — sitter på en av Ingvarstågets stenar ("Han for österut med Ingvar"; Källström 2007, s. 149, 389); stilfönstret matchar tåget (ca 1041). Obs: rundatas "Äskil 1" (Sö 333) har utgått — Källström visar att den signaturen betydligt sannolikare lyder ÆsgæiRR (Äsger), se denne (s. 208; Bilaga 2 s. 426).'),

  ('Äsger',
   'Sörmländsk hand kring Selebo/Åkers härader, stil Fp (ca 1010–1050). Signaturen på Sö 333 Ärja ödekyrka lästes tidigare "eski" = Äskil, men Källström visar att ÆsgæiRR (Äsger) är betydligt sannolikare (2007, s. 208; katalog s. 366: "ÆsgæiRR rísti rúnaR þási"; Bilaga 2 s. 426 "Tidigare: Äskil (1)"). Signaturen står improvisationsartat i ett lodrätt textband på mittytan, inramad av kryssformiga skiljetecken (s. 172, 175). Rundatas Äskil 1-korpus är i databasen överförd till denna hand med proveniensnot.'),

  ('Jakob Rød',
   'Dansk medeltida stenmästare med 12 verk i databasen, samtliga attribuerade och samtliga på Fyn: Sallinge herred (4), Sunds herred (3), Gudme herred (2). Verken bär DR-signum utan vikingatida stilattribution — en romansk verkstad, påminnelse om att runbruket levde vidare efter vikingatiden. Behandlas inte av Källström 2007, vars korpus är vikingatidens Mellansverige. (Namnform enligt rundata.)')

) as d(name, descr)
where carvers.name = d.name;

commit;

-- #3 Katarina Sunesdotter (~1215–1252): berikning + arvet. Källa: Historiska museet/SHM (gravtumba),
-- Erikskrönikan. Gemål till Erik Eriksson "läspe och halte"; änka → myndigförklarad; ägde Nyköping +
-- Söderköping; donerade stor del av arvet till Gudhems kloster (Söderköping dock till systern Benedicta);
-- bosatte sig i Gudhem, gravtumba rest av klosterfolket, nu på Historiska museet.
update public.historical_kings set
  birth_year = 1215, death_year = 1252,
  role = 'drottning (gemål till Erik Eriksson "läspe och halte", Erikska ätten)',
  description = 'Drottning ~1234–1250, född ca 1215, död ca 1252. Sunesdotter (fadern Sune Folkesson). Gift med kung Erik Eriksson; änka efter få års äktenskap och blev då myndigförklarad — kunde förfoga över sin stora förmögenhet, bl.a. städerna Nyköping och Söderköping. Donerade en stor del av arvet till Gudhems kloster i Västergötland; Söderköping testamenterades i stället till systern Benedicta. Bosatte sig i Gudhem sina sista år. Klosterfolket lät resa en påkostad gravtumba, idag på Historiska museet.',
  sources = 'Historiska museet/SHM (gravtumba, CC-BY); Erikskrönikan',
  image_caption = 'Gravtumba, Katarina Sunesdotter (Gudhems kloster → Historiska museet)'
 where name ilike '%katarina sune%';

-- #2 Medeltidsfiltrerad dedikationsvy: behåll moderna helgon i katalogen, filtrera bort moderna
-- KYRKOR via byggår (syrisk-ortodoxa/nykatolska 1900-tal ska ej med i kristnandeanalysen).
create or replace view public.v_medieval_dedications as
  select e.name as church, e.landscape, e.parish, e.built_from,
         s.code as saint_code, s.name as saint, s.gender, s.saint_type, s.cult_era, s.is_native_nordic
  from public.ecclesiastical_sites e
  join public.saints s on e.saint_code = s.code
  where e.built_from between 1000 and 1550;

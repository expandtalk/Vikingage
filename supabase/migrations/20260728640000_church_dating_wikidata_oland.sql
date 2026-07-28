-- Kyrkodatering: metodpilot Öland (Daniel: "Svenska kyrkan/BeBR har bra info; ingen data får hittas på").
-- Källa: Wikidata P571 (speglar BeBR/Sveriges kyrkor), SPARQL-hämtad. VIKTIG METODREGEL: inception ger
-- ofta NUVARANDE byggnad (Öland revs/byggdes om ~1800-1860) → separeras i current_building_year.
-- built_from = MEDELTIDA grund (endast där Wikidata-året <1400). De ombyggda behöver medeltidsgrund
-- ur BeBR/Sveriges kyrkor (worklist). Inget påhittat — varje rad bär dating_source.
alter table public.ecclesiastical_sites
  add column if not exists current_building_year int,
  add column if not exists dating_source text;
begin;
update public.ecclesiastical_sites set built_from=null, current_building_year=1862, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Alböke kyrka' and round(lat::numeric,4)=56.9478;
update public.ecclesiastical_sites set built_from=null, current_building_year=1832, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Ålems kyrka' and round(lat::numeric,4)=56.9558;
update public.ecclesiastical_sites set built_from=null, current_building_year=1822, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Algutsrums kyrka' and round(lat::numeric,4)=56.6788;
update public.ecclesiastical_sites set built_from=1200, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Ås kyrka' and round(lat::numeric,4)=56.2383;
update public.ecclesiastical_sites set built_from=null, current_building_year=1879, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Borgholms kyrka' and round(lat::numeric,4)=56.8803;
update public.ecclesiastical_sites set built_from=null, current_building_year=1848, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Bredsättra kyrka' and round(lat::numeric,4)=56.8447;
update public.ecclesiastical_sites set built_from=null, current_building_year=1776, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Döderhults kyrka' and round(lat::numeric,4)=57.2678;
update public.ecclesiastical_sites set built_from=1100, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Egby kyrka' and round(lat::numeric,4)=56.8736;
update public.ecclesiastical_sites set built_from=null, current_building_year=1919, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Figeholms kyrka' and round(lat::numeric,4)=57.3730;
update public.ecclesiastical_sites set built_from=null, current_building_year=1828, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Föra kyrka' and round(lat::numeric,4)=57.0125;
update public.ecclesiastical_sites set built_from=null, current_building_year=1841, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Gårdby kyrka' and round(lat::numeric,4)=56.6008;
update public.ecclesiastical_sites set built_from=1200, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Gärdslösa kyrka' and round(lat::numeric,4)=56.7935;
update public.ecclesiastical_sites set built_from=null, current_building_year=1871, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Högby kyrka' and round(lat::numeric,4)=57.1644;
update public.ecclesiastical_sites set built_from=null, current_building_year=1822, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Högsrums kyrka' and round(lat::numeric,4)=56.7661;
update public.ecclesiastical_sites set built_from=1200, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Hulterstads kyrka' and round(lat::numeric,4)=56.4494;
update public.ecclesiastical_sites set built_from=null, current_building_year=1890, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Källa nya kyrka' and round(lat::numeric,4)=57.1214;
update public.ecclesiastical_sites set built_from=null, current_building_year=1856, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Kastlösa kyrka' and round(lat::numeric,4)=56.4586;
update public.ecclesiastical_sites set built_from=null, current_building_year=1968, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Kikebokyrkan' and round(lat::numeric,4)=57.2614;
update public.ecclesiastical_sites set built_from=null, current_building_year=1955, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Köpings kyrka' and round(lat::numeric,4)=56.8782;
update public.ecclesiastical_sites set built_from=1300, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Kyrkhamns kapell' and round(lat::numeric,4)=56.2098;
update public.ecclesiastical_sites set built_from=1200, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Långlöts kyrka' and round(lat::numeric,4)=56.7391;
update public.ecclesiastical_sites set built_from=null, current_building_year=1842, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Löts kyrka' and round(lat::numeric,4)=56.9183;
update public.ecclesiastical_sites set built_from=null, current_building_year=1847, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Mönsterås kyrka' and round(lat::numeric,4)=57.0428;
update public.ecclesiastical_sites set built_from=null, current_building_year=1813, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Mörbylånga kyrka' and round(lat::numeric,4)=56.5196;
update public.ecclesiastical_sites set built_from=null, current_building_year=1976, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Nådens kapell' and round(lat::numeric,4)=56.6480;
update public.ecclesiastical_sites set built_from=null, current_building_year=1832, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Norra Möckleby kyrka' and round(lat::numeric,4)=56.6475;
update public.ecclesiastical_sites set built_from=null, current_building_year=1876, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Oskarshamns stadskyrka' and round(lat::numeric,4)=57.2633;
update public.ecclesiastical_sites set built_from=1200, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Räpplinge kyrka' and round(lat::numeric,4)=56.8285;
update public.ecclesiastical_sites set built_from=1200, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Resmo kyrka' and round(lat::numeric,4)=56.5413;
update public.ecclesiastical_sites set built_from=null, current_building_year=1841, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Runstens kyrka' and round(lat::numeric,4)=56.6992;
update public.ecclesiastical_sites set built_from=null, current_building_year=1750, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Ryssby kyrka' and round(lat::numeric,4)=56.8019;
update public.ecclesiastical_sites set built_from=null, current_building_year=1971, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Sankt Elavi kapell' and round(lat::numeric,4)=56.8837;
update public.ecclesiastical_sites set built_from=null, current_building_year=1976, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Sankt Olofs kapell' and round(lat::numeric,4)=57.3222;
update public.ecclesiastical_sites set built_from=null, current_building_year=1843, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Segerstads kyrka' and round(lat::numeric,4)=56.3614;
update public.ecclesiastical_sites set built_from=null, current_building_year=1853, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Smedby kyrka' and round(lat::numeric,4)=56.4069;
update public.ecclesiastical_sites set built_from=null, current_building_year=1851, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Södra Möckleby kyrka' and round(lat::numeric,4)=56.3565;
update public.ecclesiastical_sites set built_from=null, current_building_year=1838, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Stenåsa kyrka' and round(lat::numeric,4)=56.5144;
update public.ecclesiastical_sites set built_from=1100, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Torslunda gamla kyrka' and round(lat::numeric,4)=56.6335;
update public.ecclesiastical_sites set built_from=1100, current_building_year=1776, dating_source='Wikidata P571 (nuvarande byggnad; medeltidsgrund via BeBR pending)' where name='Torslunda kyrka' and round(lat::numeric,4)=56.6333;
update public.ecclesiastical_sites set built_from=1200, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Ventlinge kyrka' and round(lat::numeric,4)=56.2839;
update public.ecclesiastical_sites set built_from=1200, current_building_year=null, dating_source='Wikidata P571 (medeltida byggnad)' where name='Vickleby kyrka' and round(lat::numeric,4)=56.5772;
commit;

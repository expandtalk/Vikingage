-- Exakt källa för Göranssons vårdkas-/vårdböte-karta: Sölve Göransson 1978, i Kalmar Stads Historia 1,
-- s. 141. Rättar tidigare vaga citering. De enskilda ~45 lägena kräver georeferering av den tryckta
-- kartan (kontrollpunkter: Kalmar, Ölands kustkontur, skalstock 0–15 km) — ögonmäts ej ur foto.
begin;
update public.beacon_sites
  set source_uri = 'Sölve Göransson 1978, i Kalmar Stads Historia 1, s. 141'
  where name like 'Vårdböte, Stensö udde%';

update public.ortnamn_element_config
  set note = regexp_replace(note,
    'Sölve Göranssons undersökning:',
    'Sölve Göransson 1978 (karta i Kalmar Stads Historia 1, s. 141):')
  where element_key = 'böte';
commit;

-- Geokodning av husaby-nukleusens ankare — bara belagda koordinater (får ej gissas).
-- Hossmo = Hossmo kyrka (RAÄ Fornsök via heritage_sites/ecclesiastical_sites).
-- Grimskär = rutt-verifierad (Daniel 2026-07-28, centralRoute.ts). Övriga ortnamn geokodas
-- som eget steg mot Fornsök/Lantmäteri och lämnas NULL tills dess.
begin;
update public.kalmar_place_names
   set lat=56.63716667, lng=16.22510556,
       source = coalesce(source,'') || ' · koord: Hossmo kyrka (RAÄ Fornsök)'
 where name='Hossmo' and lat is null;
update public.kalmar_place_names
   set lat=56.658, lng=16.392,
       source = coalesce(source,'') || ' · koord: rutt-verifierad'
 where name='Grimskär' and lat is null;
commit;

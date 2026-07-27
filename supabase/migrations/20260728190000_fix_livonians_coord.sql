-- QA-fix: Livländarna (folk_groups) var geopositionerad i havet (Rigabukten).
-- Koordinat {x:24, y:57.5} = 57.5°N 24°Ö = ~35 km ut i Rigabukten.
-- Flyttas till land: Turaida/Vidzeme (24.85°Ö, 57.18°N) — historiska Livlands kärnområde.
-- Regional folk-markör (geo_precision='regional'), approximativ per natur.
-- coordinates = point(x=lng, y=lat).

begin;
update public.folk_groups
set coordinates = point(24.85, 57.18), geo_precision = 'regional', updated_at = now()
where name = 'Livländarna';
commit;

-- Kontroll: select name, coordinates from public.folk_groups where name='Livländarna';

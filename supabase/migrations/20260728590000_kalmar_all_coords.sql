-- Alla 25 Kalmar-ortnamn koordinatsatta. Beslut: FORSKAREN (Daniel), ej assistenten, avgör.
-- coord_precision-tier (ärlighet, ej gate): register=place_names · fornsök=RAÄ · rutt=verifierad rutt ·
-- approx-osm=OSM Nominatim (approx) · placeholder=ungefärlig, forskaren positionerar. Alla flyttbara.
begin;
update public.kalmar_place_names set lat=56.645215, lng=16.2734486, coord_precision='approx-osm' where name='Aspö';
update public.kalmar_place_names set lat=56.665, lng=16.232, coord_precision='placeholder' where name='Barketorp';
update public.kalmar_place_names set lat=56.66, lng=16.3, coord_precision='placeholder' where name='Boön';
update public.kalmar_place_names set lat=56.6723, lng=16.2327, coord_precision='register' where name='Dörby';
update public.kalmar_place_names set lat=56.6341, lng=16.2658, coord_precision='register' where name='Dunö';
update public.kalmar_place_names set lat=56.6806152, lng=16.2628789, coord_precision='approx-osm' where name='Ebbetorp';
update public.kalmar_place_names set lat=56.6879145, lng=16.316534, coord_precision='approx-osm' where name='Ekö';
update public.kalmar_place_names set lat=56.658, lng=16.392, coord_precision='rutt' where name='Grimskär';
update public.kalmar_place_names set lat=56.648, lng=16.248, coord_precision='placeholder' where name='Guttorp';
update public.kalmar_place_names set lat=56.5542, lng=16.1805, coord_precision='register' where name='Hagby';
update public.kalmar_place_names set lat=56.63716667, lng=16.22510556, coord_precision='fornsök' where name='Hossmo';
update public.kalmar_place_names set lat=56.6435228, lng=16.1902991, coord_precision='approx-osm' where name='Kölby';
update public.kalmar_place_names set lat=56.6549838, lng=16.2943704, coord_precision='approx-osm' where name='Kungsholmen';
update public.kalmar_place_names set lat=56.6259, lng=16.1116, coord_precision='register' where name='Ölvingstorp';
update public.kalmar_place_names set lat=56.6813327, lng=16.2411675, coord_precision='approx-osm' where name='Perstorp';
update public.kalmar_place_names set lat=56.647, lng=16.1864, coord_precision='register' where name='Råby';
update public.kalmar_place_names set lat=56.6529371, lng=16.2844922, coord_precision='approx-osm' where name='Ramsö';
update public.kalmar_place_names set lat=56.6477, lng=16.22, coord_precision='register' where name='Rinkaby';
update public.kalmar_place_names set lat=56.672, lng=16.24, coord_precision='placeholder' where name='Skällby';
update public.kalmar_place_names set lat=56.6796, lng=16.2365, coord_precision='register' where name='Smedby';
update public.kalmar_place_names set lat=56.6404399, lng=16.3198245, coord_precision='approx-osm' where name='Stensö';
update public.kalmar_place_names set lat=56.6450777, lng=16.2960661, coord_precision='approx-osm' where name='Styrsö';
update public.kalmar_place_names set lat=56.678, lng=16.2181, coord_precision='register' where name='Tingby';
update public.kalmar_place_names set lat=56.6673337, lng=16.1995017, coord_precision='approx-osm' where name='Tomteby';
update public.kalmar_place_names set lat=56.6702132, lng=16.2848407, coord_precision='approx-osm' where name='Törneby';
commit;

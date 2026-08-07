-- Koordinater (fyndplats) för de 7 SHM-föremålen så de syns på kartan vid orten (Daniel: völvestaven
-- vid Klinta, Buddhan på Helgö osv). geom är GENERERAD från lat/lng. Verifierade: Helgö 59.27861/17.67972
-- + Köpingsvik/Klinta 56.87778/16.72167 (sv.wikipedia), Birka 59.3362/17.5455 (Wikipedia); Söderala kyrka/
-- Vårby/Silte/Lindby ur DB (rätt ort). Klinta=Köpingsvik och Mästermyr=Silte sn = APPROX (markerat).
-- INGEN GISSNING: ingen koord ur minnet. Applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-07.
update public.museum_objects m
set lat = v.lat, lng = v.lng
from (values
  ('Buddha från Helgö', 59.27861, 17.67972),
  ('Skyddshalsbandet från Birka', 59.3362, 17.5455),
  ('Oden från Lindby', 55.4472, 13.4999),
  ('Klintastaven', 56.87778, 16.72167),
  ('Söderalaflöjeln', 61.2806, 16.9568),
  ('Mästermyrkistan', 57.2210, 18.2362),
  ('Vårbyskatten', 59.2632, 17.8846)
) as v(name, lat, lng)
where m.name = v.name;

update public.museum_objects set context = context || ' · koord approximativ (Köpingsvik/Klinta-graven, Öland)' where name = 'Klintastaven';
update public.museum_objects set context = context || ' · koord approximativ (Silte socken; Mästermyr)' where name = 'Mästermyrkistan';

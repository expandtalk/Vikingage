-- Ersätt Eriksgatans waypoints med den MEDELTIDA rutten ur Populär Historia-illustrationen
-- (Petter Lönegård; Magnus Eriksson-eran, medsols från Uppsala) — 23 anhalter via Östergötlands
-- klosterstäder. Fler anhalter = linjen hugger land bättre. ALLA koordinater DB-verifierade
-- (place_names tätort / ecclesiastical_sites kloster / befintliga landmärken — aldrig ur minnet).
-- Källa: Populär Historia 1/2021 (Olle Larsson) + landskapslagarna. Rutt = FAKTA (platssekvens), ej verbatim.
-- Överlämningsplatser (gisslebyten) = waypoint_type 'junction'; städer = 'landmark'.

delete from public.road_waypoints
where road_id = (select id from public.viking_roads where name = 'Eriksgatan');

insert into public.road_waypoints (road_id, name, coordinates, waypoint_type, waypoint_order)
select (select id from public.viking_roads where name = 'Eriksgatan'), v.name, v.coord::point, v.typ, v.ord
from (values
  ('Uppsala (start)',                     '(17.6389,59.8498)', 'junction', 1),
  ('Enköping',                            '(17.0845,59.6410)', 'landmark', 2),
  ('Strängnäs',                           '(17.0221,59.3715)', 'landmark', 3),
  ('Nyköping',                            '(17.0440,58.7462)', 'landmark', 4),
  ('Norrköping',                          '(16.1738,58.5911)', 'landmark', 5),
  ('Linköping',                           '(15.5856,58.4158)', 'landmark', 6),
  ('Skänninge',                           '(15.0877,58.3921)', 'landmark', 7),
  ('Vadstena',                            '(14.8886,58.4510)', 'landmark', 8),
  ('Alvastra (kloster)',                  '(14.6600,58.3000)', 'landmark', 9),
  ('Gränna',                              '(14.4591,58.0218)', 'landmark', 10),
  ('Jönköping',                           '(14.1337,57.7780)', 'landmark', 11),
  ('Falköping',                           '(13.5675,58.1808)', 'landmark', 12),
  ('Gudhem',                              '(13.5660,58.2288)', 'landmark', 13),
  ('Skara',                               '(13.4395,58.3934)', 'landmark', 14),
  ('Ramundeboda (överlämning till närkingarna)', '(14.5431,58.9708)', 'junction', 15),
  ('Örebro',                              '(15.2142,59.2977)', 'landmark', 16),
  ('Oppboga bro (gräns Närke/Västmanland)', '(15.5501,59.4331)', 'junction', 17),
  ('Arboga',                              '(15.8608,59.4013)', 'landmark', 18),
  ('Köping',                              '(15.9841,59.5146)', 'landmark', 19),
  ('Västerås',                            '(16.4744,59.6226)', 'landmark', 20),
  ('Östens bro (Sagån)',                  '(16.8669,59.6194)', 'junction', 21),
  ('Enköping',                            '(17.0845,59.6410)', 'landmark', 22),
  ('Uppsala (cirkeln sluten)',            '(17.6389,59.8498)', 'junction', 23)
) as v(name, coord, typ, ord);

-- Uppsala start/slut är kungavalsplatsen (Mora sten), EJ ett gisslebyte → 'landmark'.
-- Kvar som 'junction' = exakt de tre belagda gränsöverlämningarna (gisslebyten):
-- Ramundeboda, Oppboga bro, Östens bro. Legenden skiljer gisslebyten (junction) från städer/kloster.
update public.road_waypoints
set waypoint_type = 'landmark'
where road_id = (select id from public.viking_roads where name = 'Eriksgatan')
  and name like 'Uppsala%';

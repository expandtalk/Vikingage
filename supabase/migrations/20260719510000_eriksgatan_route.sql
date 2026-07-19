-- Eriksgatan som route (viking_roads + road_waypoints) — kungavalets riksrunda.
-- Utökar check-constraints: road_type += 'kungavag', theme_links.entity_type += 'road'.
begin;

alter table public.theme_links drop constraint if exists theme_links_entity_type_check;
alter table public.theme_links add constraint theme_links_entity_type_check
  check (entity_type in ('inscription','source','king','coin','carver','site','dynasty','road'));

alter table public.viking_roads drop constraint if exists viking_roads_road_type_check;
alter table public.viking_roads add constraint viking_roads_road_type_check
  check (road_type = any (array['rullstensas','halvag','vintervag','bro','vadstalle','knutpunkt','kungavag']));

insert into public.viking_roads
  (name, name_en, road_type, description, description_en, period_start, period_end,
   start_coordinates, end_coordinates, importance_level, total_length_km)
select 'Eriksgatan','The Eriksgata (royal circuit)','kungavag',
  'Den nyvalde kungens rundresa genom riket för att "tas till konung" av varje lands ting. Efter kungavalet vid Mora sten red kungen (traditionell/ungefärlig rutt): Uppsala → Södermanland → Östergötland → Smålands gräns (Junabäck) → Västergötland → Närke → Västmanland → åter Uppland. Vid varje landsgräns möttes han av lagmannen, fick gisslan och svor att hålla landskapets egen lag. Kodifierad i Magnus Erikssons landslag (~1350).',
  'The newly elected king''s circuit through the realm to be "taken as king" by each land''s thing. After the election at the Mora stone the king rode (traditional/approximate route): Uppsala → Södermanland → Östergötland → the Småland border (Junabäck) → Västergötland → Närke → Västmanland → back to Uppland. At each provincial boundary he was met by the lawman, given hostages and swore to uphold that province''s law. Codified in Magnus Eriksson''s Law of the Realm (~1350).',
  1100, 1500, point(17.638,59.858), point(17.638,59.858), 'high', 750
where not exists (select 1 from public.viking_roads r where r.name='Eriksgatan');

insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, name, description)
select r.id, v.coord, v.ord, v.typ, v.namn, v.beskr
from public.viking_roads r,
(values
  (point(17.638,59.858), 1, 'junction', 'Uppsala (start)', 'Start efter kungavalet vid Mora sten (Lagga).'),
  (point(17.033,59.377), 2, 'landmark', 'Strängnäs — Södermanland', 'Kungen rider in i Södermanland.'),
  (point(16.42,58.67),   3, 'junction', 'Kolmården (landskapsgräns)', 'Gränsskogen in i Östergötland.'),
  (point(15.62,58.41),   4, 'landmark', 'Linköping — Östergötland', 'Östergötlands ting.'),
  (point(14.85,58.15),   5, 'junction', 'Holaveden (landskapsgräns)', 'Gränsskogen mot Småland (nära Rök).'),
  (point(14.17,57.78),   6, 'landmark', 'Junabäck, Jönköping — Smålands gräns', 'Kungen tangerar Småland och vänder mot Västergötland.'),
  (point(13.44,58.386),  7, 'landmark', 'Skara — Västergötland', 'Västergötlands ting.'),
  (point(15.21,59.27),   8, 'landmark', 'Örebro — Närke', 'Närkes ting.'),
  (point(16.55,59.61),   9, 'landmark', 'Västerås — Västmanland', 'Västmanlands ting.'),
  (point(17.00,59.60),  10, 'junction', 'Sagån (landskapsgräns)', 'Åter in i Uppland (Fjärdhundraland).'),
  (point(17.638,59.858),11, 'junction', 'Uppsala (cirkeln sluten)', 'Rundan avslutas där den började.')
) as v(coord, ord, typ, namn, beskr)
where r.name='Eriksgatan'
  and not exists (select 1 from public.road_waypoints w where w.road_id=r.id);

insert into public.theme_links (theme_id, entity_type, entity_id, notes)
select t.id, 'road', r.id, 'Kungavalets riksrunda'
from public.themes t, public.viking_roads r
where t.name in ('Rätt & lag','Makt & dynasti') and r.name='Eriksgatan'
on conflict (theme_id, entity_type, entity_id) do nothing;

commit;

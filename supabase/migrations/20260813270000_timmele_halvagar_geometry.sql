-- Timmele hålvägar (Ulricehamn, Redvägs härad) — landets bäst bevarade hålvägar vid vadstället över
-- Ätran, N om Timmele kyrka. Koordinater verifierade 2026-08-13: hålvägarna GPS 57.8553/13.4339
-- (Länsstyrelsen VG), Timmele kyrka 57.853000/13.436250 (sv.wikipedia). Applicerad via MCP; repo-spegel.
delete from public.road_waypoints
where road_id = (select id from public.viking_roads where slug='timmele-halvagar');

insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, kind, off_route, name)
select r.id, p.coord, p.ord, 'landmark', 'corridor', false, p.nm
from public.viking_roads r
cross join (values
  (point(13.436250,57.853000), 1, 'Timmele kyrka'),
  (point(13.4339,57.8553), 2, 'Hålvägarna vid vadstället över Ätran (landets bäst bevarade)')
) as p(coord, ord, nm)
where r.slug = 'timmele-halvagar';

update public.viking_roads
set description =
  'Timmele hålvägar (Ulricehamn, Västergötland) — landets bäst bevarade hålvägar: ridvägar som nötts till djupa sänkor genom århundradens användning och erosion. De ligger vid det gamla vadstället över Ätran, strax norr om Timmele kyrka, i ett naturskönt område. Fyra parallella hålvägar i områdets sydvästra del, upp till 180 m långa, 10 m breda och 4,5 m djupa; ett par ansluter till varandra. Vägen fortsatte troligen norrut längs Ätran mot det tätbefolkade Falbygden. "Röjda vägar" i Ätradalen har gett namn åt Redvägs härad. Intill hålvägarna ligger ett järnåldersgravfält (45 högar och 15 runda stensättningar). Fler hålvägar finns vid Källeberg strax söder om Timmele tätort. GPS 57.8553, 13.4339. OBS: ligger på privat mark — visa hänsyn, parkera på anvisad plats. Källa: Länsstyrelsen Västra Götaland.',
    start_coordinates = point(13.436250,57.853000),
    end_coordinates = point(13.4339,57.8553)
where slug = 'timmele-halvagar';

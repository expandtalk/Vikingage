-- Korrigera Eriksgatans schematiska rutt så den inte skär Vättern.
-- Detekterat (PostGIS mot water_reference Vättern-polygon): ENDA korsande segmentet var
-- Holaveden→Junabäck/Jönköping (7 km över sjön). Fix: infoga två verifierade landpunkter på
-- Vätterns östra/sydöstra strand (Gränna, Huskvarna) + nudga Jönköping-noden någon km ner på land.
-- Verifierat: samtliga nya delsegment (Holaveden→Gränna→Huskvarna→Jönköping→Skara) skär EJ Vättern.
-- coordinates = native point(lng,lat).
do $$
declare rid uuid;
begin
  select id into rid from public.viking_roads where slug='eriksgatan';

  -- 1) gör plats: skjut alla waypoints från och med ordning 6 två steg
  update public.road_waypoints set waypoint_order = waypoint_order + 2 where road_id = rid and waypoint_order >= 6;

  -- 2) infoga de två strand-punkterna
  insert into public.road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, name, name_en, off_route)
  values
    (rid, point(14.466, 58.017), 6, 'landmark', 'Gränna (Vätterns östra strand)', 'Gränna (east shore of Lake Vättern)', false),
    (rid, point(14.290, 57.800), 7, 'landmark', 'Huskvarna (Vätterns sydspets)', 'Huskvarna (south tip of Lake Vättern)', false);

  -- 3) nudga Jönköping-noden ner på land (SW om sjöspetsen) så sista biten ej klipper vattnet
  update public.road_waypoints set coordinates = point(14.150, 57.760)
  where road_id = rid and name ilike 'Junabäck%';
end $$;

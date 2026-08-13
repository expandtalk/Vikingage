-- road_overview v2 (applicerad i prod via MCP; denna fil = repo-spegling. 2026-08-13):
-- (1) Linjen/etapperna använder BARA on-route-huvudpunkter — off_route + trace/probable/milestone/
--     execution filtreras bort. Löste "orimlig sicksack" på /sv/led/gota-landsvag (generiska sidan
--     drog EN linje genom alla 54 punkter inkl. milstolpar/namnspår/galgbacke). Kommunikationsarkeolog-
--     granskning 2026-08-13.
-- (2) Exponerar start/end (ur viking_roads.start/end_coordinates) så RoadPage kan CENTRERA + sätta
--     ändpunktsnålar för stub-vägar (åsar/isvägar utan waypoints) — utan att gissa en sträckning
--     (INGEN GISSNING: rullstensås ritas EJ som rak linje). point = (lng,lat).
create or replace function public.road_overview(p_slug text)
returns jsonb language sql stable set search_path to 'public'
as $function$
  select jsonb_build_object(
    'name', r.name,
    'type', r.road_type,
    'description', r.description,
    'slug', r.slug,
    'start', case when r.start_coordinates is not null
             then jsonb_build_object('lat',(r.start_coordinates)[1],'lng',(r.start_coordinates)[0]) end,
    'end',   case when r.end_coordinates is not null
             then jsonb_build_object('lat',(r.end_coordinates)[1],'lng',(r.end_coordinates)[0]) end,
    'waypoints', (select coalesce(jsonb_agg(jsonb_build_object(
        'name',w.name,'type',w.waypoint_type,'lat',(w.coordinates)[1],'lng',(w.coordinates)[0],'ord',w.waypoint_order)
        order by w.waypoint_order),'[]'::jsonb)
      from road_waypoints w where w.road_id=r.id
        and coalesce(w.off_route,false)=false
        and coalesce(w.kind,'') not in ('trace','probable','milestone','execution')),
    'landmarks', (select coalesce(jsonb_agg(jsonb_build_object(
        'name',l.name,'type',l.landmark_type,'lat',(l.coordinates)[1],'lng',(l.coordinates)[0],
        'description',l.description,'significance',l.historical_significance)),'[]'::jsonb)
      from road_landmarks l where l.road_id=r.id)
  )
  from viking_roads r where r.slug = p_slug limit 1;
$function$;

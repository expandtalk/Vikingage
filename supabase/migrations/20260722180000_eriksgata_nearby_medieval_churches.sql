-- eriksgata_nearby: kyrkorna hämtas nu ur ecclesiastical_sites (medeltida) istället
-- för heritage_sites (som innehöll moderna kyrkor), och med snävare radie för kyrkor
-- (church_radius_m default 500 m; runstenar kvar på radius_m 1000 m). Applicerad via
-- MCP execute_sql; fil = proveniens. Motiv: Eriksgatan visade för många + moderna kyrkor;
-- ska bara visa de medeltida kyrkor rutten faktiskt passerar nära (117 → 54).
create or replace function public.eriksgata_nearby(radius_m double precision default 1000, church_radius_m double precision default 500)
returns json language sql stable set search_path to 'public' as $$
  with wl as (
    select ST_SetSRID(ST_MakeLine(ST_MakePoint((w.coordinates)[0],(w.coordinates)[1]) order by w.waypoint_order),4326)::geography g
    from road_waypoints w join viking_roads r on r.id=w.road_id where r.name='Eriksgatan'
  )
  select json_build_object(
    'runestones', (
      select coalesce(json_agg(json_build_object('signum',ri.signum,'lat',(ri.coordinates)[1],'lng',(ri.coordinates)[0])),'[]'::json)
      from runic_inscriptions ri, wl
      where ri.coordinates is not null
        and ST_DWithin(ST_SetSRID(ST_MakePoint((ri.coordinates)[0],(ri.coordinates)[1]),4326)::geography, wl.g, radius_m)
    ),
    'churches', (
      select coalesce(json_agg(json_build_object('name',e.name,'type',e.kind,'lat',e.lat,'lng',e.lng)),'[]'::json)
      from ecclesiastical_sites e, wl
      where e.geom is not null
        and (e.built_from is null or e.built_from<=1550 or e.dating_class ilike '%medeltid%')
        and ST_DWithin(e.geom::geography, wl.g, church_radius_m)
    )
  );
$$;

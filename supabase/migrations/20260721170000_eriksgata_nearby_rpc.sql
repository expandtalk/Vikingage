-- Närhets-RPC för Eriksgata-vyn. Applicerad via MCP execute_sql; fil = proveniens.
-- Returnerar runstenar + medeltida kyrkor/kapell/kloster inom radius_m meter från
-- Eriksgatan-leden (viking_roads 'Eriksgatan' + road_waypoints som linje).
create or replace function public.eriksgata_nearby(radius_m double precision default 1000)
returns json language sql stable set search_path = public as $$
  with wl as (
    select ST_SetSRID(ST_MakeLine(
      ST_MakePoint((w.coordinates)[0], (w.coordinates)[1]) order by w.waypoint_order
    ), 4326)::geography as g
    from road_waypoints w join viking_roads r on r.id = w.road_id
    where r.name = 'Eriksgatan'
  )
  select json_build_object(
    'runestones', (
      select coalesce(json_agg(json_build_object(
        'signum', ri.signum, 'lat', (ri.coordinates)[1], 'lng', (ri.coordinates)[0])), '[]'::json)
      from runic_inscriptions ri, wl
      where ri.coordinates is not null
        and ST_DWithin(ST_SetSRID(ST_MakePoint((ri.coordinates)[0], (ri.coordinates)[1]),4326)::geography, wl.g, radius_m)
    ),
    'churches', (
      select coalesce(json_agg(json_build_object(
        'name', h.name, 'type', h.raa_type, 'lat', h.lat, 'lng', h.lng)), '[]'::json)
      from heritage_sites h, wl
      where h.geom is not null and h.raa_type in ('kyrka','kapell','kloster')
        and ST_DWithin(h.geom::geography, wl.g, radius_m)
    )
  );
$$;
grant execute on function public.eriksgata_nearby(double precision) to anon, authenticated;

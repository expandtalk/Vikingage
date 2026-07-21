-- Omkrets-/närhets-RPC. Applicerad via MCP execute_sql; fil = proveniens.
-- Returnerar ortnamn, kulturlager (heritage_sites), runstenar och fornborgar inom
-- radius_m meter från en punkt (klickad kyrka/fornborg). Radien sätts dynamiskt i UI.
create or replace function public.features_near_point(p_lat double precision, p_lng double precision, radius_m double precision default 9000)
returns json language sql stable set search_path = public as $$
  with c as (select ST_SetSRID(ST_MakePoint(p_lng, p_lat),4326)::geography as g)
  select json_build_object(
    'place_names', (
      select coalesce(json_agg(json_build_object('name', pn.name, 'lat', pn.lat, 'lng', pn.lng, 'category', pn.element_category)), '[]'::json)
      from place_names pn, c
      where pn.lat is not null and ST_DWithin(ST_SetSRID(ST_MakePoint(pn.lng, pn.lat),4326)::geography, c.g, radius_m)
    ),
    'kulturlager', (
      select coalesce(json_agg(json_build_object('name', h.name, 'type', h.raa_type, 'lat', h.lat, 'lng', h.lng)), '[]'::json)
      from heritage_sites h, c
      where h.geom is not null and ST_DWithin(h.geom::geography, c.g, radius_m)
    ),
    'runestones', (
      select coalesce(json_agg(json_build_object('signum', ri.signum, 'lat', (ri.coordinates)[1], 'lng', (ri.coordinates)[0])), '[]'::json)
      from runic_inscriptions ri, c
      where ri.coordinates is not null
        and ST_DWithin(ST_SetSRID(ST_MakePoint((ri.coordinates)[0], (ri.coordinates)[1]),4326)::geography, c.g, radius_m)
    ),
    'fortresses', (
      select coalesce(json_agg(json_build_object('name', vf.name, 'type', vf.fortress_type, 'lat', (vf.coordinates)[1], 'lng', (vf.coordinates)[0])), '[]'::json)
      from viking_fortresses vf, c
      where vf.coordinates is not null
        and ST_DWithin(ST_SetSRID(ST_MakePoint((vf.coordinates)[0], (vf.coordinates)[1]),4326)::geography, c.g, radius_m)
    )
  );
$$;
grant execute on function public.features_near_point(double precision, double precision, double precision) to anon, authenticated;

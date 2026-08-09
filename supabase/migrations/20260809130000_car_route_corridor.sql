-- Bil-läge (rutt-korridor), NIVÅ 1 — kurerade rutter ur viking_roads + road_waypoints.
-- Additiv: tre STABLE SQL-RPC:er, inga schemaändringar. Rör inte datainnehållet.
--
-- Konceptet: en väg-linje ("vart jag ska åka") byggd ur road_waypoints (ordnad på
-- waypoint_order, off_route-punkter exkluderade) + objekt inom en justerbar buffert
-- längs linjen ("vad finns längs vägen"). Samma objekt-union/mönster som nearby_along_route
-- och nearby_features (heritage_sites, runic_inscriptions, ecclesiastical_sites, cult_sites,
-- estates, museums, maritime_nodes). INGEN gissad geometri — allt ur befintlig data.

-- 1) Lista över kurerade rutter till väljaren. Bara rutter med >=2 användbara waypoints
--    (annars kan ingen linje byggas). length_km = kurerat värde när det finns, annars
--    approximativt ur waypoint-segmenten (märks som ungefär i UI:t).
create or replace function public.curated_routes()
returns table(
  id uuid, name text, name_en text, road_type text, importance_level text,
  waypoint_count int, length_km numeric
)
language sql
stable
set search_path to 'public'
as $function$
  select vr.id, vr.name, vr.name_en, vr.road_type, vr.importance_level,
    count(rw.id)::int as waypoint_count,
    coalesce(
      vr.total_length_km,
      round((st_length(
        st_makeline(st_setsrid(st_makepoint(rw.coordinates[0], rw.coordinates[1]), 4326) order by rw.waypoint_order)::geography
      ) / 1000.0)::numeric, 1)
    ) as length_km
  from viking_roads vr
  join road_waypoints rw
    on rw.road_id = vr.id
   and rw.coordinates is not null
   and rw.off_route is not true
  group by vr.id, vr.name, vr.name_en, vr.road_type, vr.importance_level, vr.total_length_km
  having count(rw.id) >= 2
  order by waypoint_count desc, vr.name;
$function$;

-- 2) Rutt-linjen som GeoJSON (för att rita korridoren). Klipps till p_max_km fram.
create or replace function public.viking_road_line(
  p_road_id uuid,
  p_max_km numeric default 300
)
returns table(geojson text, length_km numeric, point_count int)
language sql
stable
set search_path to 'public'
as $function$
  with wp as (
    select st_setsrid(st_makepoint(coordinates[0], coordinates[1]), 4326) as g, waypoint_order
    from road_waypoints
    where road_id = p_road_id and coordinates is not null and off_route is not true
  ),
  ln as (
    select st_makeline(g order by waypoint_order) as geom, count(*)::int as n from wp
  ),
  clipped as (
    select case
      when geom is null or n < 2 then null
      when st_length(geom::geography) <= p_max_km * 1000 then geom
      else st_linesubstring(geom, 0, least(1.0, (p_max_km * 1000) / nullif(st_length(geom::geography), 0)))
    end as geom, n
    from ln
  )
  select st_asgeojson(geom, 6),
         round((st_length(geom::geography) / 1000.0)::numeric, 1),
         n
  from clipped
  where geom is not null;
$function$;

-- 3) Objekt inom p_buffer_m från rutt-linjen (korridorsökning). frac_along = position längs
--    rutten (0..1) → itinerär-ordning. dist_m = avstånd till linjen. significance/prominent
--    styr vilka som får permanent etikett (huvudnoder) resp. hover-namn i UI:t.
create or replace function public.features_along_route(
  p_road_id uuid,
  p_buffer_m int default 500,
  p_max_km numeric default 300,
  p_types text[] default null,
  p_limit int default 500
)
returns table(
  feature_type text, feature_id text, name text,
  lat double precision, lng double precision,
  dist_m double precision, frac_along double precision,
  significance double precision, prominent boolean
)
language sql
stable
set search_path to 'public'
as $function$
  with wp as (
    select st_setsrid(st_makepoint(coordinates[0], coordinates[1]), 4326) as g, waypoint_order
    from road_waypoints
    where road_id = p_road_id and coordinates is not null and off_route is not true
  ),
  ln as (
    select st_makeline(g order by waypoint_order) as geom, count(*)::int as n from wp
  ),
  clipped as (
    select case
      when geom is null or n < 2 then null
      when st_length(geom::geography) <= p_max_km * 1000 then geom
      else st_linesubstring(geom, 0, least(1.0, (p_max_km * 1000) / nullif(st_length(geom::geography), 0)))
    end as geom
    from ln
  ),
  rl as (select geom, geom::geography as geog from clipped where geom is not null),
  src as (
    select 'runestone'::text as feature_type, r.id::text as feature_id,
      coalesce(
        case when ri.name ~* '(sten|häll|ristning|monument|bleck)' then nullif(ri.name, '') end,
        (select a from unnest(ri.also_known_as) a where a ~* '(sten|häll|ristning|monument|bleck)' limit 1),
        r.signum, 'runsten') as label,
      r.coordinates_latitude as lat, r.coordinates_longitude as lng,
      0.60::numeric as base_sig, null::text as evidence,
      (ri.name is not null and ri.name ~* '(sten|häll|ristning|monument|bleck)') as is_named
    from runic_with_coordinates r
    left join runic_inscriptions ri on ri.id = r.id
    where r.coordinates_latitude is not null and r.coordinates_longitude is not null
    union all
    select 'church', c.id::text, c.name, c.lat, c.lng, 0.35, null, (c.name is not null)
      from ecclesiastical_sites c
      where c.lat is not null and c.lng is not null
        and (c.built_from is null or c.built_from < 1550 or c.name ilike '%domkyrka%')
    union all
    select 'cult_site', cs.id::text, cs.name, cs.lat, cs.lng, 0.32, null, (cs.name is not null)
      from cult_sites cs where cs.lat is not null and cs.lng is not null
    union all
    select 'estate', e.id::text, e.name, e.lat, e.lng, 0.30, null, (e.name is not null)
      from estates e where e.lat is not null and e.lng is not null
    union all
    select 'museum', mu.id::text, mu.name, mu.lat, mu.lng, 0.45, null, true
      from museums mu where mu.lat is not null and mu.lng is not null
    union all
    select 'heritage', h.id::text,
      coalesce(h.raa_type, 'lämning') || case when h.name is not null and h.name <> coalesce(h.raa_type, '') then ' – ' || h.name else '' end,
      h.lat, h.lng, 0.10, h.evidence_class,
      (h.name is not null and h.name <> coalesce(h.raa_type, ''))
      from heritage_sites h
      where h.geom is not null and h.raa_type not ilike '%kyrk%'
        and st_dwithin(h.geom::geography, (select geog from rl), p_buffer_m)
    union all
    select 'maritime_node', m.id::text, m.name, m.lat, m.lng, 0.28, null, (m.name is not null)
      from maritime_nodes m where m.lat is not null and m.lng is not null
  ),
  scored as (
    select s.*,
      st_distance(st_setsrid(st_makepoint(s.lng, s.lat), 4326)::geography, (select geog from rl)) as dist_m,
      st_linelocatepoint((select geom from rl), st_setsrid(st_makepoint(s.lng, s.lat), 4326)) as frac_along
    from src s
    where exists (select 1 from rl)
      and st_dwithin(st_setsrid(st_makepoint(s.lng, s.lat), 4326)::geography, (select geog from rl), p_buffer_m)
      and (p_types is null or s.feature_type = any(p_types))
  ),
  fin as (
    select *,
      least(1.0, base_sig
        + case evidence when 'belagd' then 0.25 when 'tradition' then 0.12 when 'oklar' then 0.05 else 0 end
        + case when is_named then 0.10 else 0 end) as significance,
      (feature_type = 'museum'
        or (is_named and feature_type in ('church', 'estate', 'cult_site', 'maritime_node'))
        or (feature_type = 'runestone' and is_named)
        or (feature_type = 'heritage' and evidence = 'belagd' and is_named)) as prominent
    from scored
  )
  select feature_type, feature_id, label as name, lat, lng,
    round(dist_m::numeric, 1)::double precision as dist_m,
    round(coalesce(frac_along, 0)::numeric, 4)::double precision as frac_along,
    round(significance::numeric, 3)::double precision as significance,
    prominent
  from fin
  order by frac_along, dist_m
  limit p_limit;
$function$;

grant execute on function public.curated_routes() to anon, authenticated;
grant execute on function public.viking_road_line(uuid, numeric) to anon, authenticated;
grant execute on function public.features_along_route(uuid, int, numeric, text[], int) to anon, authenticated;

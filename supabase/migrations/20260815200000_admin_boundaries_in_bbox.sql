-- Zoom-progressivt admin-lager: hämta bara gränserna på en nivå som SKÄR aktuell kartvy (bbox).
-- Löser att hela socken-lagret är ~5 MB nationellt: vid inzoomning hämtar frontend bara de
-- synliga socknarna → liten payload. Samma retur-shape som get_admin_boundary_geojson.
-- SECURITY INVOKER (RLS publik läsning). bbox i WGS84 (lng/lat).
create or replace function public.get_admin_boundaries_in_bbox(
  p_level text,
  p_min_lng double precision,
  p_min_lat double precision,
  p_max_lng double precision,
  p_max_lat double precision,
  p_simplify double precision default 0.0005
)
returns table (
  code text,
  name text,
  geojson text,
  clat double precision,
  clng double precision
)
language sql
stable
as $$
  select
    b.code,
    b.name,
    st_asgeojson(
      case when p_simplify > 0 then st_simplifypreservetopology(b.geom, p_simplify) else b.geom end
    ) as geojson,
    st_y(b.centroid) as clat,
    st_x(b.centroid) as clng
  from public.admin_boundaries b
  where b.level = p_level
    and b.geom && st_makeenvelope(p_min_lng, p_min_lat, p_max_lng, p_max_lat, 4326);
$$;

grant execute on function public.get_admin_boundaries_in_bbox(text, double precision, double precision, double precision, double precision, double precision) to anon, authenticated;

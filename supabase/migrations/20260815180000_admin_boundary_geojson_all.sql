-- Fas 1c: låt get_admin_boundary_geojson ge ALLA gränser på en nivå när p_codes är NULL
-- (annars filtrerat på koderna). Möjliggör nationellt kommungräns-lager (förenklat), och samma
-- mekanism återanvänds för level='socken'/'lan' etc. SECURITY INVOKER, RLS publik läsning.
create or replace function public.get_admin_boundary_geojson(
  p_level text,
  p_codes text[] default null,
  p_simplify double precision default 0
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
      case
        when p_simplify > 0 then st_simplifypreservetopology(b.geom, p_simplify)
        else b.geom
      end
    ) as geojson,
    st_y(b.centroid) as clat,
    st_x(b.centroid) as clng
  from public.admin_boundaries b
  where b.level = p_level
    and (p_codes is null or b.code = any(p_codes));
$$;

grant execute on function public.get_admin_boundary_geojson(text, text[], double precision) to anon, authenticated;

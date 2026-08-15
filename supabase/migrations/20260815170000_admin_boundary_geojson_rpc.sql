-- Fas 1a: Admin-gränser (Lantmäteri) → GeoJSON för frontend-kartlager.
-- Källa: Lantmäteriet "Kommun, län och rike" (tabell public.admin_boundaries, © Lantmäteriet).
-- admin_boundaries har RLS med publik läsning; funktionen körs SECURITY INVOKER (default) så
-- RLS gäller för anropande roll (anon). Ren läsfunktion — ingen SECURITY DEFINER, ingen skrivning.
--
-- Returnerar (valfritt topologibevarande simplifierad) geometri som GeoJSON + centroid för
-- kartcentrering. Simplify=0 (default) ger orörd geometri; Öland-kommunerna är ~7 KB → simplify
-- behövs oftast inte, men parametern finns för stora kommuner/län.
create or replace function public.get_admin_boundary_geojson(
  p_level text,
  p_codes text[],
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
    and b.code = any(p_codes);
$$;

grant execute on function public.get_admin_boundary_geojson(text, text[], double precision) to anon, authenticated;

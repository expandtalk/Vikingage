-- Städa DEM-strandlinjens geometri i get_paleo_shorelines_dem.
-- PROBLEM: Copernicus DEM GLO-30 (~30 m) ger en brusig havspolygon med tusentals mikro-öar/hål;
-- amber-konturen i useShorelineOverlay tracear allt bruset → "orange kladd" (t.ex. /sv/staket).
-- FIX: för copernicus_dem — släpp partiklar < 4 ha + simplifiera (~40 m) → ren kustlinje.
-- MHM (Lantmäteri 1 m, Öland) lämnas nästan orört (gentle 3 m-simplify, ingen area-filter).

create or replace function public.get_paleo_shorelines_dem(p_year integer, p_bbox double precision[] default null::double precision[])
returns table(id uuid, period_label text, year_ce integer, water_body_type text, geojson text, matched_year_ce integer)
language sql
stable
set search_path to 'public'
as $function$
  with env as (
    select case when p_bbox is not null and array_length(p_bbox, 1) = 4
                then ST_MakeEnvelope(p_bbox[1], p_bbox[2], p_bbox[3], p_bbox[4], 4326)
           end as g
  ),
  model as (
    select case when exists (
             select 1 from public.paleo_shorelines ps, env
             where ps.model_version = 'mhm_lantmateri'
               and env.g is not null and ST_Intersects(ps.geom, env.g)
           ) then 'mhm_lantmateri' else 'copernicus_dem' end as mv
  ),
  pick as (
    select ps.year_ce as y
    from public.paleo_shorelines ps, env, model
    where ps.model_version = model.mv
      and (env.g is null or ST_Intersects(ps.geom, env.g))
    order by abs(ps.year_ce - p_year), ps.year_ce
    limit 1
  )
  select ps.id, ps.period_label, ps.year_ce, ps.water_body_type,
    ST_AsGeoJSON(
      ST_SimplifyPreserveTopology(
        case when model.mv = 'copernicus_dem'
          -- släpp mikro-öar/-partiklar < 4 ha (speckle); behåll original om allt filtreras bort
          then coalesce(
                 (select ST_Collect(d.geom) from ST_Dump(ps.geom) d where ST_Area(d.geom::geography) > 40000),
                 ps.geom)
          else ps.geom end,
        case when model.mv = 'copernicus_dem' then 0.0004 else 0.00003 end)
    ) as geojson,
    pick.y
  from public.paleo_shorelines ps, pick, env, model
  where ps.model_version = model.mv and ps.year_ce = pick.y
    and (env.g is null or ST_Intersects(ps.geom, env.g))
  order by ps.water_body_type;
$function$;

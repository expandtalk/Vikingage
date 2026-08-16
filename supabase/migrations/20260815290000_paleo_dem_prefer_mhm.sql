-- get_paleo_shorelines_dem: föredra Lantmäteris MHM-härledda strandlinjer (bar jord, RH2000, 1 m)
-- där kartvyns bbox täcker MHM-data (idag Öland); annars falla tillbaka på copernicus_dem (rikstäckande).
-- MHM saknar Copernicus DSM-bias (träd/hus) → sannare strandlinje. Utan bbox: alltid copernicus_dem
-- (så rikstäckningen inte tappas). Samma returkolumner som förut (ingen frontend-brytning).
CREATE OR REPLACE FUNCTION public.get_paleo_shorelines_dem(p_year integer, p_bbox double precision[] DEFAULT NULL::double precision[])
 RETURNS TABLE(id uuid, period_label text, year_ce integer, water_body_type text, geojson text, matched_year_ce integer)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  WITH env AS (
    SELECT CASE WHEN p_bbox IS NOT NULL AND array_length(p_bbox, 1) = 4
                THEN ST_MakeEnvelope(p_bbox[1], p_bbox[2], p_bbox[3], p_bbox[4], 4326)
           END AS g
  ),
  model AS (
    -- Föredra MHM endast när en bbox ges OCH den skär MHM-data; annars Copernicus (inkl. hela riket).
    SELECT CASE WHEN EXISTS (
             SELECT 1 FROM public.paleo_shorelines ps, env
             WHERE ps.model_version = 'mhm_lantmateri'
               AND env.g IS NOT NULL AND ST_Intersects(ps.geom, env.g)
           ) THEN 'mhm_lantmateri' ELSE 'copernicus_dem' END AS mv
  ),
  pick AS (
    SELECT ps.year_ce AS y
    FROM public.paleo_shorelines ps, env, model
    WHERE ps.model_version = model.mv
      AND (env.g IS NULL OR ST_Intersects(ps.geom, env.g))
    ORDER BY abs(ps.year_ce - p_year), ps.year_ce
    LIMIT 1
  )
  SELECT ps.id, ps.period_label, ps.year_ce, ps.water_body_type, ST_AsGeoJSON(ps.geom), pick.y
  FROM public.paleo_shorelines ps, pick, env, model
  WHERE ps.model_version = model.mv AND ps.year_ce = pick.y
    AND (env.g IS NULL OR ST_Intersects(ps.geom, env.g))
  ORDER BY ps.water_body_type;
$function$;

-- DEM-strandlinje-RPC v2: valfri bbox-parameter så varje forskningssida bara får sin regions
-- geometri (Kalmar-sidan drar inte Mälarens ~1,5 MB och tvärtom). Ersätter 1-arg-varianten
-- (drop → recreate för att undvika överlagrings-tvetydighet). Applicerad mot fjärr-DB via
-- pooler; denna fil = proveniens. Läs-only, publik. p_bbox = {minlng,minlat,maxlng,maxlat} (4326).
DROP FUNCTION IF EXISTS public.get_paleo_shorelines_dem(int);

CREATE OR REPLACE FUNCTION public.get_paleo_shorelines_dem(p_year int, p_bbox double precision[] DEFAULT NULL)
RETURNS TABLE(id uuid, period_label text, year_ce int, water_body_type text, geojson text)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  WITH env AS (
    SELECT CASE WHEN p_bbox IS NOT NULL AND array_length(p_bbox, 1) = 4
                THEN ST_MakeEnvelope(p_bbox[1], p_bbox[2], p_bbox[3], p_bbox[4], 4326)
           END AS g
  ),
  pick AS (
    SELECT ps.year_ce AS y
    FROM public.paleo_shorelines ps, env
    WHERE ps.model_version = 'copernicus_dem'
      AND (env.g IS NULL OR ST_Intersects(ps.geom, env.g))
    ORDER BY abs(ps.year_ce - p_year), ps.year_ce
    LIMIT 1
  )
  SELECT ps.id, ps.period_label, ps.year_ce, ps.water_body_type, ST_AsGeoJSON(ps.geom)
  FROM public.paleo_shorelines ps, pick, env
  WHERE ps.model_version = 'copernicus_dem' AND ps.year_ce = pick.y
    AND (env.g IS NULL OR ST_Intersects(ps.geom, env.g))
  ORDER BY ps.water_body_type;
$$;

GRANT EXECUTE ON FUNCTION public.get_paleo_shorelines_dem(int, double precision[]) TO anon, authenticated;

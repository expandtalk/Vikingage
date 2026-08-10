-- Task 3 (paleo-tidsresa Östersjön): guard mot TYST felsnappning. get_paleo_shorelines_nearest
-- och get_paleo_shorelines_dem snappar alltid till närmaste tillgängliga skiva utan att säga
-- hur långt bort den var — en efterfrågan på Baltiska issjön (~-12600, ej ingested) fick
-- tyst Yoldia (-9650) tillbaka, 2950 år fel, utan att klienten kunde upptäcka det.
--
-- Lägger till kolumnen matched_year_ce (=året raden faktiskt snappades till; identiskt med
-- year_ce, men uttryckligt namngivet så klienten kan jämföra abs(p_year - matched_year_ce)
-- mot en tolerans och avstå från att rita om snappet är för långt bort). ADDITIV: nya kolumnen
-- läggs sist, befintliga kolumner/ordning oförändrade → befintliga anrop (destructuring på
-- kolumnnamn i useShorelineOverlay.ts) fortsätter fungera. Måste DROP+CREATE (inte
-- CREATE OR REPLACE) eftersom returtypen ändras. Läs-only, publik — ingen datarad rörs.

DROP FUNCTION IF EXISTS public.get_paleo_shorelines_nearest(int);

CREATE FUNCTION public.get_paleo_shorelines_nearest(p_year int)
RETURNS TABLE(id uuid, period_label text, year_ce int, water_body_type text, geojson text, matched_year_ce int)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  WITH pick AS (
    SELECT ps.year_ce AS y
    FROM public.paleo_shorelines ps
    WHERE ps.model_version = 'sgu_strandforskjutning'
    ORDER BY abs(ps.year_ce - p_year), ps.year_ce
    LIMIT 1
  )
  SELECT ps.id, ps.period_label, ps.year_ce, ps.water_body_type, ST_AsGeoJSON(ps.geom), pick.y
  FROM public.paleo_shorelines ps, pick
  WHERE ps.model_version = 'sgu_strandforskjutning' AND ps.year_ce = pick.y
  ORDER BY ps.water_body_type;
$$;

GRANT EXECUTE ON FUNCTION public.get_paleo_shorelines_nearest(int) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.get_paleo_shorelines_dem(int, double precision[]);

CREATE FUNCTION public.get_paleo_shorelines_dem(p_year int, p_bbox double precision[] DEFAULT NULL)
RETURNS TABLE(id uuid, period_label text, year_ce int, water_body_type text, geojson text, matched_year_ce int)
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
  SELECT ps.id, ps.period_label, ps.year_ce, ps.water_body_type, ST_AsGeoJSON(ps.geom), pick.y
  FROM public.paleo_shorelines ps, pick, env
  WHERE ps.model_version = 'copernicus_dem' AND ps.year_ce = pick.y
    AND (env.g IS NULL OR ST_Intersects(ps.geom, env.g))
  ORDER BY ps.water_body_type;
$$;

GRANT EXECUTE ON FUNCTION public.get_paleo_shorelines_dem(int, double precision[]) TO anon, authenticated;

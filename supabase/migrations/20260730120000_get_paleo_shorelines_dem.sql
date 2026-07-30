-- RPC för den FINUPPLÖSTA DEM-strandlinjen (model_version='copernicus_dem'), härledd ur
-- Copernicus DEM GLO-30 + projektets paleo_rsl (se scripts/data/derive-shoreline-dem.py +
-- scripts/data/load-dem-shorelines.mjs). Speglar get_paleo_shorelines_nearest men filtrerar
-- på DEM-modellen — så Kalmar-sidan får detaljerad kust medan övriga sidor behåller SGU.
-- Applicerad mot fjärr-DB via pooler-psql/node; denna fil = proveniens. Läs-only, publik.
CREATE OR REPLACE FUNCTION public.get_paleo_shorelines_dem(p_year int)
RETURNS TABLE(id uuid, period_label text, year_ce int, water_body_type text, geojson text)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  WITH pick AS (
    SELECT ps.year_ce AS y
    FROM public.paleo_shorelines ps
    WHERE ps.model_version = 'copernicus_dem'
    ORDER BY abs(ps.year_ce - p_year), ps.year_ce
    LIMIT 1
  )
  SELECT ps.id, ps.period_label, ps.year_ce, ps.water_body_type, ST_AsGeoJSON(ps.geom)
  FROM public.paleo_shorelines ps, pick
  WHERE ps.model_version = 'copernicus_dem' AND ps.year_ce = pick.y
  ORDER BY ps.water_body_type;
$$;

GRANT EXECUTE ON FUNCTION public.get_paleo_shorelines_dem(int) TO anon, authenticated;

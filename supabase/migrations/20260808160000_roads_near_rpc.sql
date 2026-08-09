-- Färdväg-/hålväg-LINJEgeometri nära en punkt (ur lamning_geometry, RAÄ). För exkursionskartans
-- "vägnät"-lager: rita den faktiska vägen (t.ex. Borgvägen mot Ismantorp) som linje, inte punkt.
-- KÄLLKRITIK: bara verklig RAÄ-geometri (aktuell); ingen påhittad riktning.
CREATE OR REPLACE FUNCTION public.roads_near(
  p_lat double precision, p_lng double precision, p_radius_m double precision DEFAULT 5000
)
RETURNS TABLE (name text, raa_type text, register_id text, len_m int, geojson text)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT COALESCE(hs.name, lg.register_id) AS name,
         hs.raa_type,
         lg.register_id,
         round(ST_Length(lg.geom::geography))::int AS len_m,
         ST_AsGeoJSON(lg.geom, 6) AS geojson
  FROM lamning_geometry lg
  LEFT JOIN heritage_sites hs ON hs.id = lg.lamning_id
  WHERE lg.is_current IS TRUE
    AND GeometryType(lg.geom) IN ('LINESTRING','MULTILINESTRING')
    AND (hs.raa_type ~* 'färdväg|hålväg|\bväg\b' OR hs.raa_type IS NULL)
    AND ST_DWithin(lg.geom::geography, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_m);
$$;
GRANT EXECUTE ON FUNCTION public.roads_near(double precision, double precision, double precision) TO anon, authenticated;

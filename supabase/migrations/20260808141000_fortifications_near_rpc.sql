-- Befästningsgeometri (linjer/polygoner/punkter) nära en punkt, för svarskartans polygonlager.
-- KÄLLKRITIK: varje feature bär evidence_class + datering → frontend stylar tolkat/hypotetiskt
-- streckat, bevarat heldraget. Bara publicerade fort_element + aktuella lamning_geometry-polygoner.
CREATE OR REPLACE FUNCTION public.fortifications_near(
  p_lat double precision, p_lng double precision, p_radius_m double precision DEFAULT 3000
)
RETURNS TABLE (
  kind text, name text, subtype text, evidence_class text,
  year_from int, year_to int, geojson text
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT 'fort_element'::text AS kind,
         fe.name, fe.element_type AS subtype, fe.evidence_class,
         COALESCE(fe.start_earliest, fe.start_latest) AS year_from,
         COALESCE(fe.end_latest, fe.end_earliest) AS year_to,
         ST_AsGeoJSON(ST_Transform(fe.geom, 4326), 6) AS geojson
  FROM fort_element fe
  WHERE fe.published IS TRUE AND fe.geom IS NOT NULL
    AND ST_DWithin(
      ST_Transform(fe.geom, 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_m)
  UNION ALL
  SELECT 'lamning'::text AS kind,
         COALESCE(hs.name, lg.register_id) AS name,
         hs.raa_type AS subtype,
         hs.evidence_class,
         NULL::int AS year_from, NULL::int AS year_to,
         ST_AsGeoJSON(lg.geom, 6) AS geojson
  FROM lamning_geometry lg
  LEFT JOIN heritage_sites hs ON hs.id = lg.lamning_id
  WHERE lg.is_current IS TRUE AND lg.geom IS NOT NULL
    AND GeometryType(lg.geom) IN ('LINESTRING','MULTILINESTRING','POLYGON','MULTIPOLYGON')
    AND ST_DWithin(
      lg.geom::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_m);
$$;
GRANT EXECUTE ON FUNCTION public.fortifications_near(double precision, double precision, double precision) TO anon, authenticated;

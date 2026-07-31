-- Förskatte-territoriemodell (hypotesgenererande): Voronoi/Thiessen-polygoner kring Ölands
-- fornborgar = teoretiska borg-upptagningsområden FÖRE socken/skatte-"formen". SCHEMATISKT
-- (klippt till en generös Öland-envelope, ej exakt kustlinje; ej alla borgar samtida — se
-- dating_basis). Testfråga: följer sockengränserna dessa territorier eller skär de tvärs?
CREATE OR REPLACE FUNCTION public.oland_fort_territories()
RETURNS TABLE(fort_name text, dated boolean, period_start int, period_end int, geojson text)
LANGUAGE sql STABLE AS $$
  WITH forts AS (
    SELECT name, ST_SetSRID(coordinates::geometry, 4326) AS g,
           (dating_basis IS NOT NULL) AS dated, period_start, period_end
      FROM swedish_hillforts
     WHERE coordinates IS NOT NULL
       AND ST_Y(coordinates::geometry) BETWEEN 56.20 AND 57.37   -- Öland (exkl. fastlands-borgar norrut)
       AND ST_X(coordinates::geometry) BETWEEN 16.35 AND 17.10
  ),
  vor AS ( SELECT (ST_Dump(ST_VoronoiPolygons(ST_Collect(g)))).geom AS cell FROM forts ),
  clip AS (
    SELECT ST_Intersection(ST_SetSRID(cell,4326),
             ST_SetSRID(ST_MakeEnvelope(16.35,56.20,17.10,57.37),4326)) AS cell FROM vor
  )
  SELECT f.name, f.dated, f.period_start, f.period_end, ST_AsGeoJSON(c.cell)
    FROM clip c JOIN forts f ON ST_Contains(c.cell, f.g);
$$;

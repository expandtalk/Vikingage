-- Guld per borgterritorium (hypotesgenererande): räknar solidi vars fyndplats faller inom
-- varje Ölands-borgs Voronoi-cell (samma envelope/klippning som oland_fort_territories).
-- SCHEMATISKT — fyndplats på socken-/bynivå, cellgräns är teoretisk. Testfråga: koncentreras
-- guldet i vissa borgars upptagningsområden (t.ex. Sandby) eller är det jämnt spritt?
-- ~4,5 g/solidus (Diocletianus: 1 solidus = 1000 denarer).
CREATE OR REPLACE FUNCTION public.gold_per_fort_territory()
RETURNS TABLE(fort_name text, dated boolean, solidi_count bigint, gold_grams numeric, geojson text)
LANGUAGE sql STABLE AS $$
  WITH forts AS (
    SELECT name, ST_SetSRID(coordinates::geometry, 4326) AS g,
           (dating_basis IS NOT NULL) AS dated
      FROM swedish_hillforts
     WHERE coordinates IS NOT NULL
       AND ST_Y(coordinates::geometry) BETWEEN 56.20 AND 57.37
       AND ST_X(coordinates::geometry) BETWEEN 16.35 AND 17.10
  ),
  vor AS ( SELECT (ST_Dump(ST_VoronoiPolygons(ST_Collect(g)))).geom AS cell FROM forts ),
  clip AS (
    SELECT ST_Intersection(ST_SetSRID(cell,4326),
             ST_SetSRID(ST_MakeEnvelope(16.35,56.20,17.10,57.37),4326)) AS cell FROM vor
  ),
  cells AS (
    SELECT f.name AS fort_name, f.dated, c.cell
      FROM clip c JOIN forts f ON ST_Contains(c.cell, f.g)
  ),
  sol AS (
    SELECT ST_SetSRID(coordinates::geometry, 4326) AS g
      FROM solidi WHERE coordinates IS NOT NULL
  )
  SELECT cells.fort_name, cells.dated,
         COUNT(sol.g) AS solidi_count,
         ROUND(COUNT(sol.g) * 4.5, 1) AS gold_grams,
         ST_AsGeoJSON(cells.cell) AS geojson
    FROM cells LEFT JOIN sol ON ST_Contains(cells.cell, sol.g)
   GROUP BY cells.fort_name, cells.dated, cells.cell
   ORDER BY solidi_count DESC;
$$;

NOTIFY pgrst, 'reload schema';

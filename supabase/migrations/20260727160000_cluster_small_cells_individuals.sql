-- Kluster-declutter: celler med FÄRRE ÄN 5 lämningar returneras som enskilda rader
-- (cnt=1 per individ → klienten ritar riktiga typmarkörer, ingen sifferbubbla).
-- Täta celler (>=5) returneras som EN aggregerad rad MED representativ raa_type, så
-- klustret kan färgas per kategori + få rätt glyph (tidigare NULL → alltid neutral).
-- Signaturen oförändrad → CREATE OR REPLACE.

CREATE OR REPLACE FUNCTION public.sites_bbox_clusters(
  min_lng double precision, min_lat double precision,
  max_lng double precision, max_lat double precision,
  p_zoom integer DEFAULT 6, p_types text[] DEFAULT NULL::text[])
RETURNS TABLE(
  cnt bigint, lat double precision, lng double precision,
  id uuid, raa_type text, name text, period text, description text,
  landscape text, municipality text, parish text, source_uri text)
LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  WITH env AS (SELECT ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326) AS g),
  grid AS (SELECT (0.02 * power(2, greatest(0, 11 - p_zoom)))::double precision AS cell),
  tagged AS (
    SELECT h.id, h.raa_type, h.name, h.period, h.description,
           h.landscape, h.municipality, h.parish, h.source_uri, h.lat, h.lng,
           ST_SnapToGrid(h.geom, grid.cell) AS cell
    FROM heritage_sites h, env, grid
    WHERE h.geom && env.g
      AND (p_types IS NULL OR h.raa_type = ANY(p_types))
  ),
  counts AS (SELECT cell, count(*)::bigint AS c FROM tagged GROUP BY cell)
  -- Glesa celler (<5): en rad per lämning, cnt=1 → riktig markör hos klienten.
  SELECT 1::bigint AS cnt, t.lat, t.lng, t.id, t.raa_type, t.name, t.period, t.description,
         t.landscape, t.municipality, t.parish, t.source_uri
  FROM tagged t JOIN counts n ON n.cell = t.cell
  WHERE n.c < 5
  UNION ALL
  -- Täta celler (>=5): aggregerad klusterrad + representativ typ (kategorifärg + glyph).
  SELECT n.c, avg(t.lat), avg(t.lng),
         NULL::uuid, (array_agg(t.raa_type ORDER BY t.id))[1], NULL::text, NULL::text, NULL::text,
         NULL::text, NULL::text, NULL::text, NULL::text
  FROM tagged t JOIN counts n ON n.cell = t.cell
  WHERE n.c >= 5
  GROUP BY t.cell, n.c
$function$;

GRANT EXECUTE ON FUNCTION public.sites_bbox_clusters(double precision, double precision, double precision, double precision, integer, text[]) TO anon, authenticated, service_role;

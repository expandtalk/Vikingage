-- Heritage-lagret: rikare popups + befordra ensam-lämningar ur kluster.
--
-- Problem (Daniels QA 2026-07-25): under zoom 11 ritas server-kluster som en orange
-- sifferbubbla ÄVEN när cellen bara har 1 lämning → man måste klicka in på en "1" för
-- att se en enda ikon. Och individ-popupen visade bara name/period/description
-- (de två sista oftast NULL, name ofta skräpdubblett "Hällristning, Hällristning") →
-- ingen unik id, inga koordinater, ingen länk, inget mervärde.
--
-- heritage_sites HAR redan: landscape/municipality/parish (geografi), lat/lng
-- (koordinater), source_uri (kulturarvsdata.se/raa/lamning/<uuid> = unikt RAÄ-id + länk).
-- Migrationen exponerar dessa till frontend och låter singletons bli riktiga punkter.

-- 1) sites_in_bbox: lägg till geografi + source_uri i returen (bak-kompat: nya kolumner).
DROP FUNCTION IF EXISTS public.sites_in_bbox(double precision, double precision, double precision, double precision, integer, text[]);
CREATE FUNCTION public.sites_in_bbox(
  min_lng double precision, min_lat double precision,
  max_lng double precision, max_lat double precision,
  p_zoom integer DEFAULT 6, p_types text[] DEFAULT NULL::text[])
RETURNS TABLE(
  is_cluster boolean, cnt bigint, lat double precision, lng double precision,
  id uuid, raa_type text, name text, period text, description text,
  landscape text, municipality text, parish text, source_uri text)
LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
  WITH env AS (SELECT ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326) AS g)
  SELECT false, 1::bigint, h.lat, h.lng, h.id, h.raa_type, h.name, h.period, h.description,
         h.landscape, h.municipality, h.parish, h.source_uri
  FROM heritage_sites h, env
  WHERE h.geom && env.g
    AND (p_types IS NULL OR h.raa_type = ANY(p_types))
    AND p_zoom >= 11
  LIMIT 3000
$function$;

-- 2) sites_bbox_clusters: per rutnätscell — antal + (när antal=1) hela lämningens fält,
--    så frontend kan rita en riktig punkt med popup i st.f. en "1"-bubbla.
DROP FUNCTION IF EXISTS public.sites_bbox_clusters(double precision, double precision, double precision, double precision, integer, text[]);
CREATE FUNCTION public.sites_bbox_clusters(
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
  g AS (
    SELECT count(*)::bigint AS cnt, avg(h.lat) AS clat, avg(h.lng) AS clng,
           (array_agg(h.id         ORDER BY h.id))[1] AS aid,
           (array_agg(h.raa_type   ORDER BY h.id))[1] AS araa,
           (array_agg(h.name       ORDER BY h.id))[1] AS aname,
           (array_agg(h.period     ORDER BY h.id))[1] AS aperiod,
           (array_agg(h.description ORDER BY h.id))[1] AS adesc,
           (array_agg(h.landscape  ORDER BY h.id))[1] AS aland,
           (array_agg(h.municipality ORDER BY h.id))[1] AS amun,
           (array_agg(h.parish     ORDER BY h.id))[1] AS aparish,
           (array_agg(h.source_uri ORDER BY h.id))[1] AS asrc
    FROM heritage_sites h, env, grid
    WHERE h.geom && env.g
      AND (p_types IS NULL OR h.raa_type = ANY(p_types))
    GROUP BY ST_SnapToGrid(h.geom, grid.cell)
  )
  SELECT cnt, clat, clng,
         CASE WHEN cnt = 1 THEN aid END,
         CASE WHEN cnt = 1 THEN araa END,
         CASE WHEN cnt = 1 THEN aname END,
         CASE WHEN cnt = 1 THEN aperiod END,
         CASE WHEN cnt = 1 THEN adesc END,
         CASE WHEN cnt = 1 THEN aland END,
         CASE WHEN cnt = 1 THEN amun END,
         CASE WHEN cnt = 1 THEN aparish END,
         CASE WHEN cnt = 1 THEN asrc END
  FROM g
$function$;

-- 3) Återställ grants (DROP tog bort dem).
GRANT EXECUTE ON FUNCTION public.sites_in_bbox(double precision, double precision, double precision, double precision, integer, text[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sites_bbox_clusters(double precision, double precision, double precision, double precision, integer, text[]) TO anon, authenticated, service_role;

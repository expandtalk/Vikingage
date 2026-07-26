-- STEG 1 av spatial/kunskapsgraf-riktningen: gör kartan volym-oberoende.
-- PostGIS på + generisk plats-nod heritage_sites + viewport-RPC:er. Explore laddar
-- nu bara det som är i vyn (server-side-kluster vid låg zoom) → tål obegränsat
-- antal punkter. sites_near blir samtidigt MCP-/mobil-tjänstens "vad finns nära mig".
--
-- OBS: Applicerad via MCP (db push trasig i detta repo). Dokumentation av schemat.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS heritage_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raa_type text NOT NULL,
  name text NOT NULL,
  landscape text,
  municipality text,
  parish text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  geom geometry(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
  period text,
  description text,
  source_uri text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_heritage_geom ON heritage_sites USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_heritage_type ON heritage_sites (raa_type);

ALTER TABLE heritage_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "heritage public read" ON heritage_sites FOR SELECT USING (true);
CREATE POLICY "heritage admin write" ON heritage_sites FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Enskilda punkter i vyn (hög zoom, tak 3000)
CREATE OR REPLACE FUNCTION sites_in_bbox(
  min_lng double precision, min_lat double precision,
  max_lng double precision, max_lat double precision,
  p_zoom integer DEFAULT 6, p_types text[] DEFAULT NULL
) RETURNS TABLE (is_cluster boolean, cnt bigint, lat double precision, lng double precision, id uuid, raa_type text, name text)
LANGUAGE sql STABLE SET search_path = public AS $$
  WITH env AS (SELECT ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326) AS g),
  hits AS (SELECT h.id, h.raa_type, h.name, h.lat, h.lng FROM heritage_sites h, env
           WHERE h.geom && env.g AND (p_types IS NULL OR h.raa_type = ANY(p_types)))
  SELECT false, 1::bigint, h.lat, h.lng, h.id, h.raa_type, h.name FROM hits h WHERE p_zoom >= 11 LIMIT 3000
$$;

-- Server-side-kluster (låg zoom): rutnät → centroid + antal
CREATE OR REPLACE FUNCTION sites_bbox_clusters(
  min_lng double precision, min_lat double precision,
  max_lng double precision, max_lat double precision,
  p_zoom integer DEFAULT 6, p_types text[] DEFAULT NULL
) RETURNS TABLE (cnt bigint, lat double precision, lng double precision)
LANGUAGE sql STABLE SET search_path = public AS $$
  WITH env AS (SELECT ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326) AS g),
  grid AS (SELECT (0.02 * power(2, greatest(0, 11 - p_zoom)))::double precision AS cell)
  SELECT count(*)::bigint, avg(h.lat), avg(h.lng)
  FROM heritage_sites h, env, grid
  WHERE h.geom && env.g AND (p_types IS NULL OR h.raa_type = ANY(p_types))
  GROUP BY ST_SnapToGrid(h.geom, grid.cell)
$$;

-- "Vad finns nära mig" (meter). Blir MCP-/mobil-tjänstens kärna.
CREATE OR REPLACE FUNCTION sites_near(
  p_lat double precision, p_lng double precision, p_radius_m double precision DEFAULT 5000,
  p_types text[] DEFAULT NULL, p_limit integer DEFAULT 100
) RETURNS TABLE (id uuid, raa_type text, name text, lat double precision, lng double precision, landscape text, parish text, distance_m double precision)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT h.id, h.raa_type, h.name, h.lat, h.lng, h.landscape, h.parish,
         ST_Distance(h.geom::geography, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography)
  FROM heritage_sites h
  WHERE (p_types IS NULL OR h.raa_type = ANY(p_types))
    AND ST_DWithin(h.geom::geography, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_radius_m)
  ORDER BY 8 LIMIT p_limit
$$;

-- Seed: vårdkasarna (beacon_sites) folded in som första raa_type
INSERT INTO heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, source_uri)
SELECT 'vårdkase', name, landscape, municipality, parish, lat, lng, source_uri FROM beacon_sites
ON CONFLICT DO NOTHING;

-- RPC: fairways som GeoJSON till frontend-kartlagret (fairways.geom → text).
CREATE OR REPLACE FUNCTION public.fairways_geojson()
RETURNS TABLE(name text, fairway_kind text, period text, note text, geojson text)
LANGUAGE sql STABLE AS $$
  SELECT f.name, f.fairway_kind, f.period, f.note, ST_AsGeoJSON(f.geom)
  FROM public.fairways f WHERE f.geom IS NOT NULL;
$$;

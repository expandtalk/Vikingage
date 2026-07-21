-- Kyrkolager-stöd: bildkolumn + viewport-RPC. Applicerad via MCP; fil = proveniens.

ALTER TABLE public.ecclesiastical_sites ADD COLUMN IF NOT EXISTS image_url text;         -- Wikimedia Commons (Wikidata P18)
ALTER TABLE public.ecclesiastical_sites ADD COLUMN IF NOT EXISTS image_attribution text;

-- Serverar kyrkor i kartvyn med rik data (byggår, stift, ruinstatus, bild) + socken/härad.
CREATE OR REPLACE FUNCTION public.ecclesiastical_in_bbox(
  min_lng double precision, min_lat double precision, max_lng double precision, max_lat double precision,
  p_limit int DEFAULT 2000)
RETURNS TABLE(id uuid, name text, lat double precision, lng double precision, kind text, status text,
              built_from int, dating_class text, diocese text, socken text, harad text,
              image_url text, image_attribution text)
LANGUAGE sql STABLE SET search_path=public AS $$
  SELECT e.id, e.name, e.lat, e.lng, e.kind, e.status, e.built_from, e.dating_class,
         d.name AS diocese, p.name AS socken, h.name AS harad, e.image_url, e.image_attribution
  FROM public.ecclesiastical_sites e
  LEFT JOIN public.dioceses d ON d.id = e.diocese_id
  LEFT JOIN public.parishes p ON p.id = e.parish_id
  LEFT JOIN public.hundreds h ON h.id = e.hundred_id
  WHERE e.geom && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    AND e.kind IN ('parish_church','chapel','cathedral','monastery','nunnery','hospital')
  LIMIT p_limit;
$$;
GRANT EXECUTE ON FUNCTION public.ecclesiastical_in_bbox(double precision,double precision,double precision,double precision,int) TO anon, authenticated;
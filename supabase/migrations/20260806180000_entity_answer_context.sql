-- Rik svarssida: kontext-RPC för en sökt plats → karta-centrum + kopplade runinskrifter
-- + bilder. 2026-08-06. Applicerad i prod via MCP (denna fil = repo-spegling).
-- KVAR: forskar-block (object_source.sourceid=bytea pekar EJ direkt på research_scholars —
-- kedjan via 'sources' behöver utredas innan den läggs in).

CREATE OR REPLACE FUNCTION public.entity_answer_context(p_name text)
RETURNS jsonb LANGUAGE sql STABLE SET search_path TO 'public' AS $$
WITH ins AS (
  SELECT r.id, r.signum, coalesce(nullif(r.name,''), r.signum) AS label,
         r.coordinates[1] AS lat, r.coordinates[0] AS lng, coalesce(r.socken, r.location) AS place
  FROM runic_inscriptions r
  WHERE (r.socken ILIKE p_name OR r.location ILIKE p_name OR r.parish ILIKE p_name)
    AND r.coordinates IS NOT NULL
  LIMIT 80
),
img AS (
  SELECT DISTINCT m.media_url, m.description
  FROM inscription_media m
  WHERE m.inscription_id IN (SELECT id FROM ins) AND m.media_url IS NOT NULL
  LIMIT 12
)
SELECT jsonb_build_object(
  'center', (SELECT jsonb_build_object('lat', round(avg(lat)::numeric,5), 'lng', round(avg(lng)::numeric,5)) FROM ins),
  'inscriptions', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'signum',signum,'label',label,'lat',lat,'lng',lng,'place',place)),'[]'::jsonb) FROM ins),
  'images', (SELECT coalesce(jsonb_agg(jsonb_build_object('url',media_url,'desc',description)),'[]'::jsonb) FROM img),
  'count', (SELECT count(*) FROM ins)
);
$$;
GRANT EXECUTE ON FUNCTION public.entity_answer_context(text) TO anon, authenticated;

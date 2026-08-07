-- Gotland gav tomt svar (center null, count 0) medan Öland gav 132: Öland har en content_page (25 km-
-- radie), Gotland saknar. Fallbacken matchade bara socken/location/parish — inte landscape. Tillägg:
-- OR r.landscape ILIKE p_name → landskaps-sökningar utan content_page resolvar (Gotland=400 capped,
-- Västergötland=322). Öland oförändrat (går via content_page). Applicerad via MCP; fil = repo-spegling.
-- 2026-08-07.
CREATE OR REPLACE FUNCTION public.entity_answer_context(p_name text)
 RETURNS jsonb LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
WITH page AS (
  SELECT cp.id, cp.slug, cp.title_sv,
         ST_Y(ST_Centroid(cp.geom)) AS lat, ST_X(ST_Centroid(cp.geom)) AS lng, cp.geom
  FROM content_pages cp
  WHERE cp.geom IS NOT NULL AND (
    lower(cp.title_sv) = lower(p_name) OR lower(cp.slug) = lower(p_name)
    OR cp.url IN (SELECT es.destination FROM entity_senses es
                  WHERE lower(es.term) = lower(p_name) AND es.our_domain AND es.destination IS NOT NULL)
  )
  ORDER BY cp.priority DESC NULLS LAST
  LIMIT 1
),
hit AS (
  SELECT r.coordinates[1] AS lat, r.coordinates[0] AS lng
  FROM runic_inscriptions r
  WHERE r.coordinates IS NOT NULL AND NOT EXISTS (SELECT 1 FROM page)
    AND (r.name ILIKE p_name OR r.signum ILIKE p_name OR r.name ILIKE p_name || '%'
         OR EXISTS (SELECT 1 FROM unnest(coalesce(r.also_known_as,'{}')) a WHERE lower(a) = lower(p_name)))
  LIMIT 1
),
ins AS (
  SELECT r.id, r.signum, coalesce(nullif(r.name,''), r.signum) AS label,
         r.coordinates[1] AS lat, r.coordinates[0] AS lng, coalesce(r.socken, r.location) AS place
  FROM runic_inscriptions r
  WHERE r.coordinates IS NOT NULL AND (
    CASE
      WHEN EXISTS (SELECT 1 FROM page) THEN ST_DWithin(
             ST_SetSRID(ST_MakePoint(r.coordinates[0], r.coordinates[1]),4326)::geography,
             ST_SetSRID(ST_MakePoint((SELECT lng FROM page),(SELECT lat FROM page)),4326)::geography, 25000)
      WHEN EXISTS (SELECT 1 FROM hit) THEN ST_DWithin(
             ST_SetSRID(ST_MakePoint(r.coordinates[0], r.coordinates[1]),4326)::geography,
             ST_SetSRID(ST_MakePoint((SELECT lng FROM hit),(SELECT lat FROM hit)),4326)::geography, 15000)
      ELSE (r.socken ILIKE p_name OR r.location ILIKE p_name OR r.parish ILIKE p_name OR r.landscape ILIKE p_name)
    END)
  LIMIT 400
),
img AS (
  SELECT DISTINCT m.media_url, m.description FROM inscription_media m
  WHERE m.inscription_id IN (SELECT id FROM ins) AND m.media_url IS NOT NULL LIMIT 12
),
lit AS (
  SELECT DISTINCT s.id, s.title, coalesce(s.author,'') AS author, s.written_year AS year,
         s.isbn, s.kind::text AS kind
  FROM relationship r
  JOIN entity_registry er ON er.id = r.object_id
  JOIN historical_sources s ON s.id = r.subject_id
  WHERE r.predicate = 'documents'
    AND (lower(er.label) = lower(p_name) OR er.label ILIKE p_name || '%')
)
SELECT jsonb_build_object(
  'center', CASE
    WHEN EXISTS (SELECT 1 FROM page) THEN (SELECT jsonb_build_object('lat', round(lat::numeric,5), 'lng', round(lng::numeric,5)) FROM page)
    WHEN EXISTS (SELECT 1 FROM hit) THEN (SELECT jsonb_build_object('lat', round(lat::numeric,5), 'lng', round(lng::numeric,5)) FROM hit)
    ELSE (SELECT jsonb_build_object('lat', round(avg(lat)::numeric,5), 'lng', round(avg(lng)::numeric,5)) FROM ins) END,
  'page', (SELECT jsonb_build_object('slug', slug, 'title', title_sv) FROM page),
  'inscriptions', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'signum',signum,'label',label,'lat',lat,'lng',lng,'place',place)),'[]'::jsonb) FROM ins),
  'images', (SELECT coalesce(jsonb_agg(jsonb_build_object('url',media_url,'desc',description)),'[]'::jsonb) FROM img),
  'research', CASE WHEN EXISTS (SELECT 1 FROM page) THEN (
      SELECT coalesce(jsonb_agg(jsonb_build_object('id',rs.id,'name',rs.name,'role',rs.role_title,'affiliation',rs.affiliation) ORDER BY rs.name),'[]'::jsonb)
      FROM content_page_scholars cps JOIN research_scholars rs ON rs.id = cps.scholar_id
      WHERE cps.content_page_id = (SELECT id FROM page)
    ) ELSE '[]'::jsonb END,
  'literature', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'author',author,'year',year,'isbn',isbn,'kind',kind) ORDER BY year NULLS LAST),'[]'::jsonb) FROM lit),
  'count', (SELECT count(*) FROM ins)
);
$function$;

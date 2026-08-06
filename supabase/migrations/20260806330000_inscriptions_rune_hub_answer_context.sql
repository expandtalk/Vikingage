-- /inscriptions som RUNE-HUB i söket + karta för fler sökningar.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- 1) content_page 'runstenar' (url /inscriptions) + kanoniska senser (runsten/runestone …).
-- 2) entity_answer_context: matchar page via SENSER (så runsten/runestone → hubben) OCH
--    namngivna stenar (Karlevistenen/Rök) → karta centrerad på stenen + närliggande.
INSERT INTO public.content_pages (slug, url, title_sv, title_en, kind, geom, teaser_sv, teaser_en, priority)
SELECT 'runstenar', '/inscriptions', 'Runstenar', 'Runestones', 'page',
       ST_SetSRID(ST_MakePoint(17.45, 59.50), 4326),
       'Sveriges runinskrifter — karta, sökbar korpus och de kändaste stenarna.',
       'Sweden''s runic inscriptions — map, searchable corpus and the most famous stones.', 70
WHERE NOT EXISTS (SELECT 1 FROM public.content_pages WHERE slug = 'runstenar');

DELETE FROM public.entity_senses WHERE term IN ('runsten','runstenar','runestone','runestones');
INSERT INTO public.entity_senses (term, sense_label_sv, sense_label_en, our_domain, rank, entity_type, entity_id, destination, note_sv, note_en)
VALUES
 ('runsten', 'Runstenar (korpus + karta)', 'Runestones (corpus + map)', true, 0, 'page', NULL, '/inscriptions', 'Hela runstenskorpusen med karta och de kändaste stenarna.', 'The full runestone corpus with map.'),
 ('runstenar', 'Runstenar (korpus + karta)', 'Runestones (corpus + map)', true, 0, 'page', NULL, '/inscriptions', 'Hela runstenskorpusen med karta och de kändaste stenarna.', 'The full runestone corpus with map.'),
 ('runestone', 'Runstenar (korpus + karta)', 'Runestones (corpus + map)', true, 0, 'page', NULL, '/inscriptions', 'Hela runstenskorpusen med karta.', 'The full runestone corpus with map.'),
 ('runestones', 'Runstenar (korpus + karta)', 'Runestones (corpus + map)', true, 0, 'page', NULL, '/inscriptions', 'Hela runstenskorpusen med karta.', 'The full runestone corpus with map.');

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
      ELSE (r.socken ILIKE p_name OR r.location ILIKE p_name OR r.parish ILIKE p_name)
    END)
  LIMIT 80
),
img AS (
  SELECT DISTINCT m.media_url, m.description FROM inscription_media m
  WHERE m.inscription_id IN (SELECT id FROM ins) AND m.media_url IS NOT NULL LIMIT 12
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
  'count', (SELECT count(*) FROM ins)
);
$function$;

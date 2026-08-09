-- Tierad galleri-data ovanpå temagrenen (se 20260807450000). images bär nu media_type + source
-- (frontend tierar: foto=stående 2:3-kort, teckning=pappersmatta), rankade så bästa visuella bärkraft
-- kommer först (foto > image > teckning). Ny nyckel 'missing' = inskrifter i scope UTAN bild →
-- frontend renderar Tier-5 typografiska kort (runsignum) i st f tomrum. Additivt: alla befintliga
-- nycklar/objektfält behålls (url, desc, theme, sites …) → live-frontend opåverkad.
-- Applicerad via MCP 2026-08-07; denna fil = repo-spegling av prod.
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
theme AS (
  SELECT t.id, t.slug, t.name
  FROM themes t
  WHERE NOT EXISTS (SELECT 1 FROM page)
    AND NOT EXISTS (
      SELECT 1 FROM runic_inscriptions r
      WHERE r.socken ILIKE p_name OR r.location ILIKE p_name
         OR r.parish ILIKE p_name OR r.landscape ILIKE p_name)
    AND NOT EXISTS (
      SELECT 1 FROM heritage_sites h
      WHERE h.parish ILIKE p_name OR h.landscape ILIKE p_name)
    AND (
      lower(t.name) = lower(p_name) OR lower(t.slug) = lower(p_name)
      OR lower(p_name) = ANY (SELECT lower(k) FROM unnest(coalesce(t.keywords,'{}'::text[])) k)
    )
    AND (
      SELECT count(*) FROM theme_links tl
      WHERE tl.theme_id = t.id AND tl.entity_type = 'inscription'
        AND EXISTS (SELECT 1 FROM inscription_media m
                    WHERE m.inscription_id = tl.entity_id AND m.media_url IS NOT NULL)
    ) >= 8
  ORDER BY (SELECT count(*) FROM theme_links tl2 WHERE tl2.theme_id = t.id) DESC
  LIMIT 1
),
hit AS (
  SELECT r.coordinates[1] AS lat, r.coordinates[0] AS lng
  FROM runic_inscriptions r
  WHERE r.coordinates IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM page) AND NOT EXISTS (SELECT 1 FROM theme)
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
      WHEN EXISTS (SELECT 1 FROM theme) THEN r.id IN (
             SELECT tl.entity_id FROM theme_links tl
             WHERE tl.theme_id = (SELECT id FROM theme) AND tl.entity_type = 'inscription')
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
sites AS (
  SELECT h.id, h.name, h.raa_type, h.lat, h.lng, coalesce(sd.prominence,0) AS prom
  FROM heritage_sites h
  LEFT JOIN search_document sd ON sd.entity_type='heritage_site' AND sd.entity_id = h.id
  WHERE h.lat IS NOT NULL AND NOT EXISTS (SELECT 1 FROM theme) AND (
    CASE
      WHEN EXISTS (SELECT 1 FROM page) THEN ST_DWithin(
             ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography,
             ST_SetSRID(ST_MakePoint((SELECT lng FROM page),(SELECT lat FROM page)),4326)::geography, 25000)
      WHEN EXISTS (SELECT 1 FROM hit) THEN ST_DWithin(
             ST_SetSRID(ST_MakePoint(h.lng,h.lat),4326)::geography,
             ST_SetSRID(ST_MakePoint((SELECT lng FROM hit),(SELECT lat FROM hit)),4326)::geography, 15000)
      ELSE (h.parish ILIKE p_name OR h.landscape ILIKE p_name)
    END)
    AND coalesce(sd.prominence,0) > 0
  ORDER BY coalesce(sd.prominence,0) DESC, h.name
  LIMIT 10
),
img AS (
  SELECT media_url, description, media_type, source_institution
  FROM (
    SELECT DISTINCT ON (m.media_url) m.media_url, m.description, m.media_type, m.source_institution
    FROM inscription_media m
    WHERE m.inscription_id IN (SELECT id FROM ins) AND m.media_url IS NOT NULL
    ORDER BY m.media_url
  ) d
  ORDER BY CASE lower(coalesce(d.media_type,'')) WHEN 'photo' THEN 0 WHEN 'image' THEN 1 WHEN 'teckning' THEN 3 WHEN 'etsning' THEN 3 ELSE 2 END,
           (d.description IS NULL)
  LIMIT 12
),
missing AS (
  SELECT i.signum, i.label
  FROM ins i
  WHERE NOT EXISTS (SELECT 1 FROM inscription_media m WHERE m.inscription_id = i.id AND m.media_url IS NOT NULL)
  ORDER BY i.signum
  LIMIT 8
),
lit AS (
  SELECT DISTINCT s.id, s.title, coalesce(s.author,'') AS author, s.written_year AS year, s.isbn, s.kind::text AS kind
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
  'theme', (SELECT jsonb_build_object('slug', slug, 'name', name) FROM theme),
  'inscriptions', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'signum',signum,'label',label,'lat',lat,'lng',lng,'place',place)),'[]'::jsonb) FROM ins),
  'sites', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'type',raa_type,'lat',lat,'lng',lng) ORDER BY prom DESC, name),'[]'::jsonb) FROM sites),
  'images', (SELECT coalesce(jsonb_agg(jsonb_build_object('url',media_url,'desc',description,'type',media_type,'source',source_institution)),'[]'::jsonb) FROM img),
  'missing', (SELECT coalesce(jsonb_agg(jsonb_build_object('signum',signum,'label',label)),'[]'::jsonb) FROM missing),
  'research', CASE WHEN EXISTS (SELECT 1 FROM page) THEN (
      SELECT coalesce(jsonb_agg(jsonb_build_object('id',rs.id,'name',rs.name,'role',rs.role_title,'affiliation',rs.affiliation) ORDER BY rs.name),'[]'::jsonb)
      FROM content_page_scholars cps JOIN research_scholars rs ON rs.id = cps.scholar_id
      WHERE cps.content_page_id = (SELECT id FROM page)
    ) ELSE '[]'::jsonb END,
  'literature', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'author',author,'year',year,'isbn',isbn,'kind',kind) ORDER BY year NULLS LAST),'[]'::jsonb) FROM lit),
  'count', (SELECT count(*) FROM ins)
);
$function$;

-- (1) Visby ringmur saknades i DB (bekräftat). Läggs in i heritage_sites med VERIFIERAD koordinat
--     (57.64032/18.29440, sv.wikipedia + RAÄ Visby 105:1) + i search_document (namn-sökbar, prominence 1.2).
-- (2) entity_answer_context: nytt 'sites'-fält = notabla heritage-monument i scope (prominence-ordnat)
--     → ikoniska monument (Visby ringmur) syns i landskaps-/plats-svaret, ej bara runstenar.
-- Applicerad i prod via MCP; denna fil = repo-spegling. INGEN GISSNING: koord verifierad, ej ur minnet.
insert into public.heritage_sites (name, raa_type, period, parish, landscape, lat, lng, description)
select 'Visby ringmur', 'Stadsmur/befästning', '1100–1700-tal (huvudmur 1270–1280-tal)', 'Visby', 'Gotland',
  57.64032, 18.29440,
  'Medeltida stadsmur kring Visby, ca 3,4 km lång — en av Nordeuropas bäst bevarade stadsmurar. '
  'Äldsta delen (Kruttornet) ca 1160–1161; huvudmuren uppförd 1270–1280-talen, förstärkt på 1350-talet '
  'och senare. Del av världsarvet Hansestaden Visby. RAÄ/Fornsök: Visby 105:1. '
  'Källa: sv.wikipedia.org/wiki/Visby_ringmur (koordinat verifierad) + RAÄ Fornsök.'
where not exists (select 1 from public.heritage_sites where name = 'Visby ringmur');

insert into public.search_document (entity_type, entity_id, label, sublabel, body_simple, body_sv, geom, period_start, period_end, prominence)
select 'heritage_site', h.id, 'Visby ringmur', 'Stadsmur/befästning · Visby · Gotland',
  'Visby ringmur stadsmur befästning Visby Gotland medeltida världsarv Hansestaden Kruttornet',
  'Visby ringmur — medeltida stadsmur kring Visby, Gotland. Del av världsarvet Hansestaden Visby. Huvudmur 1270–1280-tal.',
  ST_SetSRID(ST_MakePoint(h.lng, h.lat), 4326), 1160, 1700, 1.2
from public.heritage_sites h
where h.name = 'Visby ringmur'
  and not exists (select 1 from public.search_document where entity_type='heritage_site' and entity_id=h.id);

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
  ORDER BY cp.priority DESC NULLS LAST LIMIT 1
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
sites AS (
  SELECT h.id, h.name, h.raa_type, h.lat, h.lng, coalesce(sd.prominence,0) AS prom
  FROM heritage_sites h
  LEFT JOIN search_document sd ON sd.entity_type='heritage_site' AND sd.entity_id = h.id
  WHERE h.lat IS NOT NULL AND (
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
  ORDER BY coalesce(sd.prominence,0) DESC, h.name LIMIT 10
),
img AS (
  SELECT DISTINCT m.media_url, m.description FROM inscription_media m
  WHERE m.inscription_id IN (SELECT id FROM ins) AND m.media_url IS NOT NULL LIMIT 12
),
lit AS (
  SELECT DISTINCT s.id, s.title, coalesce(s.author,'') AS author, s.written_year AS year, s.isbn, s.kind::text AS kind
  FROM relationship r
  JOIN entity_registry er ON er.id = r.object_id
  JOIN historical_sources s ON s.id = r.subject_id
  WHERE r.predicate = 'documents' AND (lower(er.label) = lower(p_name) OR er.label ILIKE p_name || '%')
)
SELECT jsonb_build_object(
  'center', CASE
    WHEN EXISTS (SELECT 1 FROM page) THEN (SELECT jsonb_build_object('lat', round(lat::numeric,5), 'lng', round(lng::numeric,5)) FROM page)
    WHEN EXISTS (SELECT 1 FROM hit) THEN (SELECT jsonb_build_object('lat', round(lat::numeric,5), 'lng', round(lng::numeric,5)) FROM hit)
    ELSE (SELECT jsonb_build_object('lat', round(avg(lat)::numeric,5), 'lng', round(avg(lng)::numeric,5)) FROM ins) END,
  'page', (SELECT jsonb_build_object('slug', slug, 'title', title_sv) FROM page),
  'inscriptions', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'signum',signum,'label',label,'lat',lat,'lng',lng,'place',place)),'[]'::jsonb) FROM ins),
  'sites', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'type',raa_type,'lat',lat,'lng',lng) ORDER BY prom DESC, name),'[]'::jsonb) FROM sites),
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

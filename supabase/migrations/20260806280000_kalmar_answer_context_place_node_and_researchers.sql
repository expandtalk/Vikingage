-- AnswerContext (söksvarets topp) föredrar kurerad platsnod (content_pages) + relaterad forskning.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- Löser Kalmar-homonymen i söket: platsnoden Kalmar (content_pages, Småland) styr kartan i
-- stället för runsten-socken-fallbacken (Kalmar sn Uppland/Bråviken). Forskare kopplade till
-- hubben via ny länktabell content_page_scholars.

INSERT INTO public.research_scholars (name, affiliation, role_title, biography, source)
SELECT * FROM (VALUES
  ('Dick Harrison','Lunds universitet','Professor i historia',
   'Historiker och populärhistorisk författare; har skrivit om nordisk medeltid, bl.a. Kalmarunionen.','allmänt belagt (Wikipedia)'),
  ('Lars-Olof Larsson','Linnéuniversitetet (Växjö)','Professor emeritus i historia',
   'Auktoritet på Smålands och Kalmars historia; har skrivit om Kalmarunionen, Gustav Vasa och Smålands medeltid.','allmänt belagt (Wikipedia)'),
  ('Kalmar läns museum','Kalmar län','Museum / arkeologisk institution',
   'Regionalt museum med arkeologisk verksamhet i Kalmar län (bl.a. marinarkeologi kring regalskeppet Kronan).','allmänt belagt')
) AS v(name, affiliation, role_title, biography, source)
WHERE NOT EXISTS (SELECT 1 FROM public.research_scholars rs WHERE rs.name = v.name);

CREATE TABLE IF NOT EXISTS public.content_page_scholars (
  content_page_id bigint NOT NULL REFERENCES public.content_pages(id) ON DELETE CASCADE,
  scholar_id uuid NOT NULL REFERENCES public.research_scholars(id) ON DELETE CASCADE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (content_page_id, scholar_id)
);
ALTER TABLE public.content_page_scholars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cps_read ON public.content_page_scholars;
CREATE POLICY cps_read ON public.content_page_scholars FOR SELECT USING (true);
GRANT SELECT ON public.content_page_scholars TO anon, authenticated;

INSERT INTO public.content_page_scholars (content_page_id, scholar_id)
SELECT cp.id, rs.id
FROM public.content_pages cp
JOIN public.research_scholars rs ON rs.name IN ('Dick Harrison','Lars-Olof Larsson','Kalmar läns museum')
WHERE cp.slug = 'kalmar'
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.entity_answer_context(p_name text)
 RETURNS jsonb LANGUAGE sql STABLE SET search_path TO 'public'
AS $function$
WITH page AS (
  SELECT id, slug, title_sv,
         ST_Y(ST_Centroid(geom)) AS lat, ST_X(ST_Centroid(geom)) AS lng, geom
  FROM content_pages
  WHERE geom IS NOT NULL AND (lower(title_sv) = lower(p_name) OR lower(slug) = lower(p_name))
  ORDER BY priority DESC NULLS LAST
  LIMIT 1
),
ins AS (
  SELECT r.id, r.signum, coalesce(nullif(r.name,''), r.signum) AS label,
         r.coordinates[1] AS lat, r.coordinates[0] AS lng, coalesce(r.socken, r.location) AS place
  FROM runic_inscriptions r
  WHERE r.coordinates IS NOT NULL AND (
    CASE WHEN EXISTS (SELECT 1 FROM page)
      THEN ST_DWithin(
             ST_SetSRID(ST_MakePoint(r.coordinates[0], r.coordinates[1]),4326)::geography,
             ST_SetSRID(ST_MakePoint((SELECT lng FROM page),(SELECT lat FROM page)),4326)::geography,
             25000)
      ELSE (r.socken ILIKE p_name OR r.location ILIKE p_name OR r.parish ILIKE p_name)
    END)
  LIMIT 80
),
img AS (
  SELECT DISTINCT m.media_url, m.description
  FROM inscription_media m
  WHERE m.inscription_id IN (SELECT id FROM ins) AND m.media_url IS NOT NULL
  LIMIT 12
)
SELECT jsonb_build_object(
  'center', CASE WHEN EXISTS (SELECT 1 FROM page)
    THEN (SELECT jsonb_build_object('lat', round(lat::numeric,5), 'lng', round(lng::numeric,5)) FROM page)
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

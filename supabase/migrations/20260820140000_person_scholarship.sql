-- Materialiserar bryggan persons ↔ research_scholars via Wikidata-QID, + forskarens verk.
-- persons.wikidata_qid  ==  research_scholars.external_ref ('wikidata:Q…').
-- Verk: public.sources via scholar_id (hård FK) UNION historical_sources via författarnamn (mjuk match —
-- historical_sources saknar scholar-FK; dokumenterad begränsning, kan backfillas senare).
-- Läsbart för alla (forskningsplattform, publik läsning).

-- 1) Sammanfattningsvy — en rad per QID-matchad person, med verk-antal (för listor/koppling).
CREATE OR REPLACE VIEW public.person_scholarship_summary AS
SELECT
  p.id            AS person_id,
  p.name          AS person_name,
  p.wikidata_qid,
  rs.id           AS scholar_id,
  rs.name         AS scholar_name,
  rs.affiliation,
  rs.role_title,
  rs.active_period,
  (SELECT count(*) FROM public.sources s WHERE s.scholar_id = rs.id)
  + (SELECT count(*) FROM public.historical_sources hs WHERE lower(hs.author) = lower(rs.name)) AS work_count
FROM public.persons p
JOIN public.research_scholars rs ON rs.external_ref = 'wikidata:' || p.wikidata_qid
WHERE p.wikidata_qid IS NOT NULL;

GRANT SELECT ON public.person_scholarship_summary TO anon, authenticated;

-- 2) RPC för personsidan — forskarpost + full verklista (belagt läs-uppslag, ingen skrivning).
CREATE OR REPLACE FUNCTION public.person_scholarship(p_person_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  WITH sch AS (
    SELECT rs.id, rs.name, rs.affiliation, rs.role_title, rs.active_period, rs.life_status, rs.biography, rs.external_ref
    FROM public.research_scholars rs
    JOIN public.persons p ON rs.external_ref = 'wikidata:' || p.wikidata_qid
    WHERE p.id = p_person_id
    LIMIT 1
  ),
  works AS (
    SELECT s.title, s.publication_year AS year, COALESCE(s.source_type,'') AS work_type, 'sources'::text AS src, s.url
    FROM public.sources s, sch WHERE s.scholar_id = sch.id
    UNION ALL
    SELECT hs.title, hs.written_year AS year, COALESCE(hs.work_type,'') AS work_type, 'historical_sources'::text AS src, hs.url
    FROM public.historical_sources hs, sch WHERE lower(hs.author) = lower(sch.name)
  )
  SELECT CASE WHEN EXISTS (SELECT 1 FROM sch) THEN jsonb_build_object(
    'scholar',    (SELECT to_jsonb(sch) FROM sch),
    'work_count', (SELECT count(*) FROM works),
    'works',      COALESCE((SELECT jsonb_agg(to_jsonb(w) ORDER BY w.year DESC NULLS LAST) FROM works w), '[]'::jsonb)
  ) ELSE NULL END;
$$;

GRANT EXECUTE ON FUNCTION public.person_scholarship(uuid) TO anon, authenticated;

-- Härdning av fort_element-GIS per Supabase-krav (Daniels GIS-granskning).
-- VIKTIG AVVIKELSE FRÅN RÅDET: PostGIS ligger i public i DENNA databas (ej extensions),
-- så fullkvalificering sker som public.ST_* — extensions.ST_* hade brutit funktionerna.
-- Roll-konvention: is_admin() (som viking_names/carvers/staging), ej auth.jwt()->>'role'.

-- (3) Privat schema för framtida staging + qa-matvy (RLS gäller INTE matvyer; de får aldrig
--     ligga i public där PostgREST exponerar dem). qa_mur_vs_kmr + staging.kalmar_mur → hit.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;

-- (2) published-flagga: opublicerade/ej-georefererade segment får aldrig nå anon-nyckeln.
ALTER TABLE public.fort_element ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;

-- (4) Halo som lagrad generated column (ST_Buffer är IMMUTABLE) — billigare än per-anrop.
ALTER TABLE public.fort_element ADD COLUMN IF NOT EXISTS halo_geom geometry(Geometry,3006)
  GENERATED ALWAYS AS (
    CASE WHEN pos_accuracy_m > 0
         THEN public.ST_Buffer(geom, pos_accuracy_m, 'quad_segs=2') END
  ) STORED;

-- (1) search_path='' + fullkvalificering. Deterministisk oavsett anropande roll.
CREATE OR REPLACE FUNCTION public.temporal_certainty(se int, sl int, ee int, el int, t int)
RETURNS numeric LANGUAGE sql IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN t < se OR t > el                              THEN 0
    WHEN t >= COALESCE(sl,se) AND t <= COALESCE(ee,el) THEN 1
    WHEN t < COALESCE(sl,se)  THEN COALESCE((t-se)::numeric / NULLIF(sl-se,0), 1)
    ELSE                            COALESCE((el-t)::numeric / NULLIF(el-ee,0), 1)
  END;
$$;

CREATE OR REPLACE FUNCTION public.fort_at(
  p_year int,
  p_site text DEFAULT 'Kalmar gamla stad',
  p_min_certainty numeric DEFAULT 0.01
) RETURNS json LANGUAGE sql STABLE PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT json_build_object(
    'type','FeatureCollection',
    'year', p_year,
    'features', COALESCE(json_agg(f ORDER BY f->>'id'), '[]'::json)
  )
  FROM (
    SELECT json_build_object(
      'type','Feature',
      'id', e.id,
      'geometry', public.ST_AsGeoJSON(public.ST_Transform(e.geom,4326),6)::json,
      'properties', json_build_object(
        'name',       e.name,
        'type',       e.element_type,
        'evidence',   e.evidence,
        'accuracy_m', e.pos_accuracy_m,
        'certainty',  round(public.temporal_certainty(e.start_earliest,e.start_latest,
                                                      e.end_earliest,e.end_latest,p_year),2),
        'span',       format('%s–%s', COALESCE(e.start_latest,e.start_earliest),
                                      COALESCE(e.end_earliest,e.end_latest)),
        'halo', CASE WHEN e.halo_geom IS NOT NULL THEN
                  public.ST_AsGeoJSON(public.ST_Transform(e.halo_geom,4326),5)::json END,
        'sources', (SELECT COALESCE(json_agg(json_build_object(
                      'citation',s.citation,'archive',s.archive,'signum',s.signum,
                      'year',s.year,'url',s.url)),'[]'::json)
                    FROM public.fort_element_source es JOIN public.fort_source s ON s.id=es.source_id
                    WHERE es.element_id=e.id)
      )
    ) AS f
    FROM public.fort_element e
    WHERE e.site = p_site
      AND public.temporal_certainty(e.start_earliest,e.start_latest,
                                    e.end_earliest,e.end_latest,p_year) >= p_min_certainty
  ) q;
$$;

-- (2) Läspolicy gated på published; skrivning för admin (projektets konvention).
DROP POLICY IF EXISTS "fort_element public read" ON public.fort_element;
CREATE POLICY "fort_element read published" ON public.fort_element
  FOR SELECT TO anon, authenticated USING (published);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fort_element' AND policyname='fort_element admin write')
    THEN CREATE POLICY "fort_element admin write" ON public.fort_element
           FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin()); END IF;
END $$;

-- (2) Explicit revoke->grant på RPC:n.
REVOKE EXECUTE ON FUNCTION public.fort_at(int,text,numeric) FROM public;
GRANT  EXECUTE ON FUNCTION public.fort_at(int,text,numeric) TO anon, authenticated;

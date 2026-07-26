-- Arkeologiska undersökningar per ort (K-samsök rapporter/undersökningar).
-- Spec: docs/superpowers/specs/2026-07-26-archaeological-investigations-design.md
-- Copyright: lagrar bara metadata + länk; fulltext/bild bara vid PD/CC0/CC-BY (licensfiltret).

CREATE TABLE IF NOT EXISTS public.archaeological_investigations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text NOT NULL,
  investigation_type text,                 -- utredning|förundersökning|undersökning|schaktövervakning|inventering
  year_from          int,
  year_to            int,
  parish             text,
  municipality       text,
  county             text,
  landscape          text,
  lat                double precision,
  lng                double precision,
  geom               geometry GENERATED ALWAYS AS (
                       CASE WHEN lat IS NOT NULL AND lng IS NOT NULL
                            THEN ST_SetSRID(ST_MakePoint(lng, lat), 4326) END) STORED,
  geo_precision      text,                 -- 'socken' (centroid) | 'exact'
  period             text,
  keywords           text[] DEFAULT '{}',
  finds_summary      text,
  report_url         text,
  source_uri         text UNIQUE NOT NULL, -- entityUri → dedup
  source_institution text DEFAULT 'Riksantikvarieämbetet (K-samsök)',
  license            text,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_arch_inv_geom     ON public.archaeological_investigations USING gist(geom);
CREATE INDEX IF NOT EXISTS idx_arch_inv_keywords ON public.archaeological_investigations USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_arch_inv_parish   ON public.archaeological_investigations (parish);

ALTER TABLE public.archaeological_investigations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='archaeological_investigations' AND policyname='arch_inv_public_read') THEN
    CREATE POLICY arch_inv_public_read ON public.archaeological_investigations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='archaeological_investigations' AND policyname='arch_inv_admin_write') THEN
    CREATE POLICY arch_inv_admin_write ON public.archaeological_investigations FOR ALL USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END $$;

-- Lager "kyrkoundersökningar": dokumenterade arkeologiska/byggnadsarkeologiska
-- undersökningar i/under/vid kyrkor, ankrat på den kanoniska kyrkidentiteten
-- ecclesiastical_sites (~4 146 kyrkor). Strikt proveniens: what_found fylls BARA i
-- när det är citat/attribuerat; verification_status skiljer källverifierat från
-- "primärkälla saknas". what_found får ALDRIG innehålla syntetiserade fynd.
CREATE TABLE IF NOT EXISTS public.church_investigations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.ecclesiastical_sites(id) ON DELETE CASCADE,
  church_name text,
  investigation_id uuid REFERENCES public.archaeological_investigations(id) ON DELETE SET NULL,
  year_from integer,
  year_to integer,
  investigation_type text,
  find_context text,                 -- t.ex. 'under kyrkgolv','kyrkogård','murverk','invid kyrka'
  what_found text,                   -- endast attribuerat innehåll; annars NULL (aldrig påhittat)
  source_type text NOT NULL CHECK (source_type = ANY (ARRAY['raa_ksamsok','sveriges_kyrkor','ata_report','publication','other'])),
  source_citation text NOT NULL,
  source_url text,
  license text,
  evidence_class text,
  verification_status text NOT NULL DEFAULT 'verified' CHECK (verification_status = ANY (ARRAY['verified','needs_primary_source'])),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_church_investigations_church ON public.church_investigations(church_id);
CREATE INDEX IF NOT EXISTS idx_church_investigations_investigation ON public.church_investigations(investigation_id);

ALTER TABLE public.church_investigations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "church_investigations public read" ON public.church_investigations FOR SELECT USING (true);
CREATE POLICY "church_investigations admin all" ON public.church_investigations FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Konsumerbar vy för karta/panel: kyrka + undersökning + koordinat + rapportlänk
CREATE OR REPLACE VIEW public.v_church_investigations AS
SELECT
  ci.id,
  ci.church_id,
  es.name        AS church_name,
  es.landscape,
  es.kind        AS church_kind,
  es.built_from  AS church_built_from,
  COALESCE(es.lat, ai.lat) AS lat,
  COALESCE(es.lng, ai.lng) AS lng,
  ci.year_from,
  ci.year_to,
  ci.investigation_type,
  ci.find_context,
  ci.what_found,
  ci.source_type,
  ci.source_citation,
  COALESCE(ci.source_url, ai.report_url) AS source_url,
  ci.license,
  ci.evidence_class,
  ci.verification_status,
  ci.notes,
  ai.title       AS report_title,
  ai.report_url
FROM public.church_investigations ci
JOIN public.ecclesiastical_sites es ON es.id = ci.church_id
LEFT JOIN public.archaeological_investigations ai ON ai.id = ci.investigation_id;

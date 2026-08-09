-- Källkritisk claim-arkitektur (se docs/DATA_GOVERNANCE.md). Applicerad i prod via MCP 2026-08-08;
-- denna fil = spegling. Väg (a): status/confidence/created_by_method ORTOGONALT på de fyra
-- påståendebärande tabellerna; konflikter polymorft via assert_conflict(); historical_sources = kanon.
DROP TABLE IF EXISTS public.place_claim;
DROP TABLE IF EXISTS public.place_claim_source;

ALTER TABLE public.historical_sources
  ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN ('A','B','C','D')),
  ADD COLUMN IF NOT EXISTS do_not_cite boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS retracted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS superseded_by uuid REFERENCES public.historical_sources(id),
  ADD COLUMN IF NOT EXISTS source_key text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_historical_sources_source_key ON public.historical_sources(source_key) WHERE source_key IS NOT NULL;

-- status/method på phases/finds/hypothesis/observation; confidence där det saknades; berikning av fort_hypothesis
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['fortification_phases','fortification_finds','fort_hypothesis','observation'] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS verification_status text', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS created_by_method text', t);
  END LOOP;
END $$;
ALTER TABLE public.fort_hypothesis ADD COLUMN IF NOT EXISTS confidence numeric, ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id uuid, ADD COLUMN IF NOT EXISTS school text,
  ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.historical_sources(id),
  ADD COLUMN IF NOT EXISTS cited_authority_id uuid REFERENCES public.historical_sources(id),
  ADD COLUMN IF NOT EXISTS source_critical_caveat text, ADD COLUMN IF NOT EXISTS claim_key text;
ALTER TABLE public.observation ADD COLUMN IF NOT EXISTS confidence numeric;
ALTER TABLE public.fortification_phases ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.historical_sources(id), ADD COLUMN IF NOT EXISTS claim_key text;
ALTER TABLE public.fortification_finds  ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.historical_sources(id), ADD COLUMN IF NOT EXISTS claim_key text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fort_hypothesis_claim_key       ON public.fort_hypothesis(claim_key) WHERE claim_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fortification_phases_claim_key  ON public.fortification_phases(claim_key) WHERE claim_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fortification_finds_claim_key   ON public.fortification_finds(claim_key) WHERE claim_key IS NOT NULL;

-- kontrollerad attribut-vokabulär (guardrail mot allt-tabell)
CREATE TABLE IF NOT EXISTS public.place_claim_attribute (
  attribute text PRIMARY KEY, claim_type text NOT NULL, unit text, description text);

-- place_claim = ENBART attribut-nycklade påståenden
CREATE TABLE public.place_claim (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), claim_key text UNIQUE NOT NULL,
  entity_type text NOT NULL, entity_id uuid, place_slug text,
  attribute text NOT NULL REFERENCES public.place_claim_attribute(attribute),
  statement text NOT NULL, value numeric, value_text text, measurement_reference text,
  source_id uuid REFERENCES public.historical_sources(id), source_locator text,
  cited_authority_id uuid REFERENCES public.historical_sources(id), corroborating_source_ids uuid[],
  confidence numeric,
  verification_status text CHECK (verification_status IN ('needs_verification','disputed','verified','rejected','unpublished_hypothesis')),
  created_by_method text, note text, created_at timestamptz DEFAULT now());
CREATE INDEX idx_place_claim_entity ON public.place_claim(entity_type, entity_id);
CREATE INDEX idx_place_claim_status ON public.place_claim(verification_status);

-- polymorf konflikt-kant — skrivs BARA via assert_conflict()
CREATE TABLE public.assertion_conflict (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), a_table text NOT NULL, a_id uuid NOT NULL,
  b_table text NOT NULL, b_id uuid NOT NULL, relation text NOT NULL DEFAULT 'conflicts_with',
  note text, created_at timestamptz DEFAULT now(),
  CONSTRAINT assertion_conflict_uq UNIQUE (a_table, a_id, b_table, b_id, relation));

CREATE OR REPLACE FUNCTION public.assert_conflict(p_a_table text, p_a_id uuid, p_b_table text, p_b_id uuid, p_relation text DEFAULT 'conflicts_with', p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $fn$
DECLARE at text; ai uuid; bt text; bi uuid; BEGIN
  IF (p_a_table, p_a_id::text) <= (p_b_table, p_b_id::text) THEN at:=p_a_table; ai:=p_a_id; bt:=p_b_table; bi:=p_b_id;
  ELSE at:=p_b_table; ai:=p_b_id; bt:=p_a_table; bi:=p_a_id; END IF;
  INSERT INTO public.assertion_conflict (a_table,a_id,b_table,b_id,relation,note) VALUES (at,ai,bt,bi,p_relation,p_note)
  ON CONFLICT (a_table,a_id,b_table,b_id,relation) DO UPDATE SET note = COALESCE(excluded.note, assertion_conflict.note);
END $fn$;

ALTER TABLE public.place_claim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_claim_attribute ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assertion_conflict ENABLE ROW LEVEL SECURITY;
CREATE POLICY place_claim_read ON public.place_claim FOR SELECT USING (true);
CREATE POLICY place_claim_attr_read ON public.place_claim_attribute FOR SELECT USING (true);
CREATE POLICY assertion_conflict_read ON public.assertion_conflict FOR SELECT USING (true);
CREATE POLICY place_claim_write ON public.place_claim FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY place_claim_attr_write ON public.place_claim_attribute FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY assertion_conflict_write ON public.assertion_conflict FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Data: scripts/data/seed-ismantorp-claims.mjs (16 källor + 33 claims) + Fornsök-verifieringspass (MCP).

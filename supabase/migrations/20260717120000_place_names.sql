-- Ortnamnslager (GIS-pilot)
-- Punktlager för forskningsrelevanta ortnamn, taggade på namnelement.
-- Design: docs/superpowers/specs/2026-07-17-ortnamn-gis-pilot-design.md
--
-- Åtkomst: publik läsning (som övriga kartlager), admin-skrivning via is_admin().
-- Datakälla: Lantmäteriet "Ortnamn Nedladdning, vektor" (CC BY 4.0).
-- Äldsta belägg (earliest_attestation_*) fylls i senare fas från Isof Ortnamnsregistret.

CREATE TABLE IF NOT EXISTS public.place_names (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      text NOT NULL,
  lat                       double precision NOT NULL,
  lng                       double precision NOT NULL,
  -- Matchade namnelement (kan vara flera), t.ex. {val}. Driver kartfiltret.
  element_keys              text[] NOT NULL DEFAULT '{}',
  -- Bästa gissning: 'sacral' | 'power' | 'nature'. INTE ett påstående — se contested i katalogen.
  element_category          text,
  -- Lantmäteriets objekttyp (bebyggelse/natur/…).
  feature_type              text,
  parish_id                 uuid REFERENCES public.parishes(id) ON DELETE SET NULL,
  province                  text,
  -- Äldsta belägg — fylls senare från Isof. Nullbart med flit.
  earliest_attestation_year integer,
  attested_form             text,
  attestation_source        text,
  -- Proveniens.
  source                    text NOT NULL DEFAULT 'lantmateriet_ortnamn',
  source_license            text NOT NULL DEFAULT 'CC BY 4.0',
  external_id               text,
  imported_at               timestamptz NOT NULL DEFAULT now(),
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.place_names IS
  'Forskningsrelevanta ortnamn taggade på namnelement. GIS-pilot; se docs/superpowers/specs.';

-- Idempotent re-import: en rad per (källa, extern id).
CREATE UNIQUE INDEX IF NOT EXISTS place_names_source_external_id_key
  ON public.place_names (source, external_id);

-- Snabbt elementfilter.
CREATE INDEX IF NOT EXISTS place_names_element_keys_gin
  ON public.place_names USING gin (element_keys);
CREATE INDEX IF NOT EXISTS place_names_element_category_idx
  ON public.place_names (element_category);
CREATE INDEX IF NOT EXISTS place_names_province_idx
  ON public.place_names (province);

-- Row Level Security: publik läsning, admin-skrivning.
ALTER TABLE public.place_names ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "place_names_public_read" ON public.place_names;
CREATE POLICY "place_names_public_read"
  ON public.place_names
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "place_names_admin_insert" ON public.place_names;
CREATE POLICY "place_names_admin_insert"
  ON public.place_names
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "place_names_admin_update" ON public.place_names;
CREATE POLICY "place_names_admin_update"
  ON public.place_names
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "place_names_admin_delete" ON public.place_names;
CREATE POLICY "place_names_admin_delete"
  ON public.place_names
  FOR DELETE
  USING (public.is_admin());

-- Håll updated_at aktuell.
CREATE OR REPLACE FUNCTION public.place_names_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS place_names_set_updated_at ON public.place_names;
CREATE TRIGGER place_names_set_updated_at
  BEFORE UPDATE ON public.place_names
  FOR EACH ROW
  EXECUTE FUNCTION public.place_names_set_updated_at();

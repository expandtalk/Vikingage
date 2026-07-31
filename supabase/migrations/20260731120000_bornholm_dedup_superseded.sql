-- 20260731120000_bornholm_dedup_superseded.sql
-- Bornholm-dedup: samma fysiska sten fanns dubblerad under två signumsystem
-- (gamla DR 368–403 = Danmarks Runeindskrifter 1942, och nya DK Bh 1–35 =
-- Nationalmuseets Danske Runeindskrifter). ~90 poster i Bornholms-bboxen men
-- endast ~38–40 verkliga stenar. Crosswalken finns REDAN i vår egen data:
-- varje DR-rad bär DK Bh-numret i alternative_signum (importerat ur Rundata),
-- och den är dubbelverifierad mot arild-hauge.com:s auktoritativa DR↔DK Bh-tabell.
--
-- ICKE-DESTRUKTIVT: vi RADERAR aldrig. En dubblett markeras som ersatt av sin
-- kanoniska rad (DK Bh = nuvarande standard) via kolumnen superseded_by. Full
-- reversibilitet: sätt superseded_by = NULL för att återställa. Se
-- scripts/data/dedup-bornholm-runestones.mjs för dataförflyttningen.

-- 1) Suppression-/länk-kolumn (superseded_by pekar från dubbletten till den rad
--    som ersätter den). superseded_by IS NOT NULL == undertryckt (dubblett).
ALTER TABLE public.runic_inscriptions
  ADD COLUMN IF NOT EXISTS superseded_by uuid
  REFERENCES public.runic_inscriptions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.runic_inscriptions.superseded_by IS
  'Om satt: raden är en dubblett som ersätts av (pekar på) den kanoniska raden. '
  'Reversibel undertryckning — undantas från kartvyn (runic_with_coordinates) och '
  'från count_runestones(). NULL = aktiv/kanonisk. Se migration 20260731120000.';

-- Partiellt index — bara de få undertryckta raderna, billigt filter i vy/funktion.
CREATE INDEX IF NOT EXISTS idx_runic_superseded_by
  ON public.runic_inscriptions(superseded_by) WHERE superseded_by IS NOT NULL;

-- 2) Kartvyn: exkludera undertryckta dubbletter (DB-sidan → live direkt, ingen
--    frontend-deploy krävs för att markörerna ska försvinna). Kolumnlistan är
--    oförändrad; endast ett WHERE-villkor tillkommer (CREATE OR REPLACE OK).
CREATE OR REPLACE VIEW public.runic_with_coordinates AS
 SELECT r.id,
    r.signum,
    r.transliteration,
    r.location,
    r.parish,
    r.province,
    r.country,
    r.municipality,
    r.county,
    r.landscape,
    r.translation_en,
    r.translation_sv,
    r.object_type,
    r.period_start,
    r.period_end,
    r.dating_text,
    r.created_at,
    r.coordinates AS original_coordinates,
    c.latitude AS coordinates_latitude,
    c.longitude AS coordinates_longitude,
    ac.latitude AS additional_latitude,
    ac.longitude AS additional_longitude,
    ac.source AS coordinate_source,
    ac.confidence,
        CASE
            WHEN r.coordinates IS NOT NULL THEN 'original_coordinates'::text
            WHEN c.latitude IS NOT NULL THEN 'coordinates_table'::text
            WHEN ac.latitude IS NOT NULL THEN 'additional_coordinates'::text
            ELSE 'no_coordinates'::text
        END AS coordinate_status,
        CASE
            WHEN r.coordinates IS NOT NULL OR c.latitude IS NOT NULL OR ac.latitude IS NOT NULL THEN 'has_coordinates'::text
            WHEN r.location IS NOT NULL AND r.parish IS NOT NULL THEN 'high_geocoding_potential'::text
            WHEN r.location IS NOT NULL THEN 'medium_geocoding_potential'::text
            ELSE 'low_geocoding_potential'::text
        END AS geocoding_priority,
    r.coord_confidence,
    r.coord_source,
    r.socken,
    r.harad,
    r.meter
   FROM runic_inscriptions r
     LEFT JOIN coordinates c ON r.id::text = c.object_id AND c.current_flag = 1
     LEFT JOIN additional_coordinates ac ON r.signum = ac.signum
  WHERE r.superseded_by IS NULL;

-- 3) Runstensräkningen: undertryckta dubbletter ska inte dubbelräknas.
CREATE OR REPLACE FUNCTION public.count_runestones()
RETURNS integer
LANGUAGE sql STABLE
AS $$
  SELECT count(*)::int FROM runic_inscriptions
  WHERE public.is_runestone(object_type) AND superseded_by IS NULL;
$$;

COMMENT ON FUNCTION public.count_runestones() IS
  'Antal runstenar (strikt def, se is_runestone), exkl. undertryckta dubbletter '
  '(superseded_by IS NOT NULL). Skild från total runic_inscriptions. Se migr. 20260724200000 + 20260731120000.';

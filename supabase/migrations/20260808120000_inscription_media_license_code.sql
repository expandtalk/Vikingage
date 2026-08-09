-- Normaliserad licenskod på inscription_media — styr attribuering + återanvändning.
-- Rå copyright_info är blandad (URL/kod/fritext); license_code = kontrollerad vokabulär:
--   PD | CC0 | CC-BY | CC-BY-SA | unknown.  unknown/NULL = restriktivt (ej klarerad) tills verifierad.
-- Mappning = exakt substring-match, ALDRIG gissning. Trigger håller fältet i synk vid framtida ingest.
-- Applicerad i prod via MCP 2026-08-08; denna fil = spegling.
ALTER TABLE public.inscription_media ADD COLUMN IF NOT EXISTS license_code text;
COMMENT ON COLUMN public.inscription_media.license_code IS 'Normaliserad licens: PD | CC0 | CC-BY | CC-BY-SA | unknown. Härledd ur copyright_info.';

CREATE OR REPLACE FUNCTION public.set_inscription_media_license_code()
RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN
  NEW.license_code := CASE
    WHEN NEW.copyright_info IS NULL THEN 'unknown'
    WHEN lower(NEW.copyright_info) ~ 'by[-\s]?sa' THEN 'CC-BY-SA'
    WHEN lower(NEW.copyright_info) ~ 'cc0|publicdomain/zero' THEN 'CC0'
    WHEN lower(NEW.copyright_info) ~ 'publicdomain/mark|public domain|pdm|\(pdm\)' THEN 'PD'
    WHEN lower(NEW.copyright_info) ~ 'creativecommons\.org/licenses/by|cc[-\s]?by' THEN 'CC-BY'
    ELSE 'unknown'
  END;
  RETURN NEW;
END $fn$;

DROP TRIGGER IF EXISTS trg_inscription_media_license_code ON public.inscription_media;
CREATE TRIGGER trg_inscription_media_license_code
  BEFORE INSERT OR UPDATE OF copyright_info ON public.inscription_media
  FOR EACH ROW EXECUTE FUNCTION public.set_inscription_media_license_code();

-- Backfill befintliga rader (samma mappning som triggern):
UPDATE public.inscription_media SET license_code = CASE
  WHEN copyright_info IS NULL THEN 'unknown'
  WHEN lower(copyright_info) ~ 'by[-\s]?sa' THEN 'CC-BY-SA'
  WHEN lower(copyright_info) ~ 'cc0|publicdomain/zero' THEN 'CC0'
  WHEN lower(copyright_info) ~ 'publicdomain/mark|public domain|pdm|\(pdm\)' THEN 'PD'
  WHEN lower(copyright_info) ~ 'creativecommons\.org/licenses/by|cc[-\s]?by' THEN 'CC-BY'
  ELSE 'unknown'
END;

CREATE INDEX IF NOT EXISTS idx_inscription_media_license ON public.inscription_media(license_code);

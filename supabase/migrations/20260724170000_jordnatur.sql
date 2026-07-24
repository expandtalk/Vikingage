-- 20260724170000_jordnatur.sql
-- 1. Kolumn.
ALTER TABLE estate_holdings ADD COLUMN IF NOT EXISTS jordnatur text;

-- 2. jordnatur-vokabulär.
INSERT INTO vocabulary (scheme, code, label_sv, label_en) VALUES
  ('jordnatur','skatte','skattejord','tax land'),
  ('jordnatur','fralse','frälsejord','noble land'),
  ('jordnatur','krono','kronojord','crown land'),
  ('jordnatur','kyrko','kyrkojord','church land')
ON CONFLICT (scheme, code) DO NOTHING;

-- 3. Utöka valideringstriggern med jordnatur (behåll övriga kontroller).
CREATE OR REPLACE FUNCTION public.check_estate_holding_vocab()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.acquired_via IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vocabulary WHERE scheme='acquisition_mode' AND code=NEW.acquired_via) THEN
    RAISE EXCEPTION 'estate_holdings: okänd acquired_via "%"', NEW.acquired_via; END IF;
  IF NEW.holder_kind IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vocabulary WHERE scheme='holder_kind' AND code=NEW.holder_kind) THEN
    RAISE EXCEPTION 'estate_holdings: okänd holder_kind "%"', NEW.holder_kind; END IF;
  IF NEW.from_holder_kind IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vocabulary WHERE scheme='holder_kind' AND code=NEW.from_holder_kind) THEN
    RAISE EXCEPTION 'estate_holdings: okänd from_holder_kind "%"', NEW.from_holder_kind; END IF;
  IF NEW.fiscal_system IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vocabulary WHERE scheme='fiscal_system' AND code=NEW.fiscal_system) THEN
    RAISE EXCEPTION 'estate_holdings: okänd fiscal_system "%"', NEW.fiscal_system; END IF;
  IF NEW.jordnatur IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vocabulary WHERE scheme='jordnatur' AND code=NEW.jordnatur) THEN
    RAISE EXCEPTION 'estate_holdings: okänd jordnatur "%"', NEW.jordnatur; END IF;
  RETURN NEW;
END $$;

-- 4. Datamigrering: land_skatt = årlig jordskatt = jordnatur skatte. Render okänt -> NULL.
UPDATE estate_holdings SET jordnatur='skatte', fiscal_system=NULL WHERE fiscal_system='land_skatt';

-- 5. Städa bort felplacerade fiscal_system-koder (jordnatur-koder + migrerad land_skatt).
--    Inga estate_holdings-rader refererar dem efter steg 4.
DELETE FROM vocabulary WHERE scheme='fiscal_system' AND code IN ('skatte','fralse','krona','krono','kyrka','land_skatt');

-- Ortnamnssemantik steg 1: skörda referent-typ + salience ur Wikidata-crosswalken.
-- Löser homonymi (Kalmar ort/socken, Danmark land/by): P31 = vad namnet ÄR (stad/socken/land),
-- sitelinks = hur prominent (sökaren menar staden Kalmar, inte socknen). is_primary_referent
-- sätts av en rankningsvy/steg senare; här skördas råsignalerna.
ALTER TABLE place_names
  ADD COLUMN IF NOT EXISTS wikidata_p31       text,     -- instans-av: QID-lista (t.ex. Q515 stad)
  ADD COLUMN IF NOT EXISTS wikidata_sitelinks int,      -- antal Wikipedia-språkversioner = prominens-proxy
  ADD COLUMN IF NOT EXISTS is_primary_referent boolean; -- sätts av rankning (nation > stad > socken > by)

COMMENT ON COLUMN place_names.wikidata_p31 IS 'Wikidata P31 (instans-av) QID-lista, |-separerad. Ger referent-typ för homonymi-upplösning.';
COMMENT ON COLUMN place_names.wikidata_sitelinks IS 'Antal Wikipedia-språkversioner för QID:t = prominens-proxy (stad >> by).';

NOTIFY pgrst, 'reload schema';

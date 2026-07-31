-- Diakron ortnamnsmodell: ett namn = funktion av (plats, tid, utsträckning). God ortnamnsseds
-- enda "gällande form" räcker inte för forskning — vi behöver namnhistoriken: vad namnet var
-- vid en viss tid och en viss del av orten, och riktade namnbyten (Husgatan→Kungsgatan).
-- place_name_forms bär redan attested_form/attested_year/form_kind; vi lägger till tidsintervall,
-- utsträckning, relation till ankarorten, och en självreferens för namnbyteskedjor.
ALTER TABLE place_name_forms
  ADD COLUMN IF NOT EXISTS valid_from     int,     -- namnformen i bruk fr.o.m. (år, nullable)
  ADD COLUMN IF NOT EXISTS valid_to       int,     -- t.o.m. (null = fortfarande i bruk / okänt)
  ADD COLUMN IF NOT EXISTS extent         text,    -- vilken DEL formen gäller ("östra delen", "vid kyrkan")
  ADD COLUMN IF NOT EXISTS relation_kind  text,    -- same_place | related_feature | part | predecessor | successor
  ADD COLUMN IF NOT EXISTS related_form_id uuid REFERENCES place_name_forms(id) ON DELETE SET NULL;

COMMENT ON COLUMN place_name_forms.valid_from IS 'År formen togs i bruk (nullable).';
COMMENT ON COLUMN place_name_forms.valid_to IS 'År formen upphörde (null = i bruk / okänt).';
COMMENT ON COLUMN place_name_forms.extent IS 'Vilken del av orten/objektet formen gäller ("en viss del").';
COMMENT ON COLUMN place_name_forms.relation_kind IS 'Relation till ankarorten: same_place (ortens egen form) | related_feature (skans/sjö/kyrkby m. delad stam) | part (delnamn) | predecessor/successor (riktat namnbyte via related_form_id).';

-- Idempotens för reconciliation-captures (samma form/relation ska inte dubbleras per ort).
CREATE UNIQUE INDEX IF NOT EXISTS place_name_forms_dedup
  ON place_name_forms (place_id, lower(attested_form), coalesce(relation_kind, ''));

NOTIFY pgrst, 'reload schema';

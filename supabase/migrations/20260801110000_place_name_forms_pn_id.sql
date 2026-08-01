-- place_name_forms.place_id är FK → kalmar_place_names (31 kuraterade). Diakrona namnformer för
-- OSM-gazetteern (place_names, 42k) kunde därför aldrig sparas (FK-violation, tyst sväljt →
-- related_feature/varianter blev 0). Lägg en parallell pn_id → place_names så BÅDA källorna kan
-- bära namnformer. Dedup-index på coalesce(place_id, pn_id).
ALTER TABLE place_name_forms ADD COLUMN IF NOT EXISTS pn_id uuid REFERENCES place_names(id) ON DELETE CASCADE;
ALTER TABLE place_name_forms ALTER COLUMN place_id DROP NOT NULL;

DROP INDEX IF EXISTS place_name_forms_dedup;
CREATE UNIQUE INDEX place_name_forms_dedup
  ON place_name_forms (coalesce(place_id, pn_id), lower(attested_form), coalesce(relation_kind, ''));

NOTIFY pgrst, 'reload schema';

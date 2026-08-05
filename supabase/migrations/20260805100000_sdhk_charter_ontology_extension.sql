-- SDHK medeltidsbrev → kunskapsgraf: ADDITIV utökning av ontologin (ingen omskrivning).
-- Nya diplomatik-predikat, entitetstyper (institution/city) + charter_mentions-kopplingslager.
-- Spec: docs/sdhk-charter-ontology-mapping.md. Samplet kan lägga till fler predikat (additivt).

-- 1. Diplomatik-predikat: akt-roller (subject person/institution/city → object = akt-eventet)
INSERT INTO rel_predicates (code, label_sv, label_en, subject_type, object_type, qualifier_schema, description) VALUES
('issued',       'utfärdade',    'issued',       'person', 'event', '{"role_detail":"text"}'::jsonb, 'Utfärdare av brevet/akten.'),
('received',     'mottog',       'received',     'person', 'event', null, 'Mottagare/förvärvare i akten.'),
('sealed',       'beseglade',    'sealed',       'person', 'event', '{"seal_note":"text"}'::jsonb, 'Sigillant.'),
('witnessed',    'bevittnade',   'witnessed',    'person', 'event', null, 'Vittne.'),
('land_witness', 'fastar',       'land witness', 'person', 'event', null, 'Fastar (jordtransaktionsvittne).'),
('consented',    'samtyckte',    'consented',    'person', 'event', null, 'Samtyckande part (t.ex. hustru i själagåva).'),
('guarantor_of', 'gick i borgen','guarantor of', 'person', 'event', null, 'Borgensman.'),
('mentioned_in', 'omnämns i',    'mentioned in', 'person', 'event', '{"note":"text"}'::jsonb, 'Person omnämnd utan aktroll.'),
-- Dokumentär släkt (kin_of är GENETISKT och återanvänds EJ)
('married_to', 'gift med',   'married to', 'person', 'person', '{"uncertain":"boolean"}'::jsonb, 'Äktenskap belagt i brev.'),
('child_of',   'barn till',  'child of',   'person', 'person', null, 'Barn-relation belagd i brev.'),
('widow_of',   'änka efter', 'widow of',   'person', 'person', null, 'Änkerelation.'),
('sibling_of', 'syskon till','sibling of', 'person', 'person', null, 'Syskonrelation.'),
-- Befattning (temporal via qualifiers)
('held_office', 'innehade ämbete', 'held office', 'person', '*', '{"office":"text","valid_from":"text","valid_to":"text"}'::jsonb, 'Person innehade befattning (fogde/borgmästare/biskop…) vid ort/institution, temporalt.')
ON CONFLICT (code) DO NOTHING;

-- 2. Nya entitetstyper
INSERT INTO ontology_entity_types (code, label_sv, label_en, physical_table, id_column, coord_kind, provenance_columns, status, description) VALUES
('institution', 'Institution', 'Institution', 'entity_registry', 'id', 'none', null, 'active', 'Kloster/domkyrka/stadsråd/domkapitel/handelshus/gille som charter-part.'),
('city',        'Stad',        'City',        'entity_registry', 'id', 'via place_name', null, 'active', 'In-/utländsk stad (Hansa m.fl.). Koordinat via place_names + external_ids (GeoNames/TGN).')
ON CONFLICT (code) DO NOTHING;

-- 3. charter_mentions — tunt kopplingslager (mention ≠ entitet), egen proveniens.
CREATE TABLE IF NOT EXISTS charter_mentions (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sdhk_id       integer NOT NULL,
  act_event_id  uuid REFERENCES historical_events(id),
  name_as_written text NOT NULL,
  mention_kind  text NOT NULL,                 -- 'person'|'institution'|'city'|'place'
  role          text,                          -- predikatkod (issued/sealed/…) el. place-context
  entity_id     uuid,                          -- → entity_registry.id; NULL tills resolvat
  confidence    text,                          -- 'certain|probable|possible|uncertain'
  method        text NOT NULL DEFAULT 'llm',   -- 'regex'|'llm'|'manuell'
  uncertain     boolean NOT NULL DEFAULT false,
  qualifiers    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_charter_mentions_sdhk ON charter_mentions (sdhk_id);
CREATE INDEX IF NOT EXISTS idx_charter_mentions_entity ON charter_mentions (entity_id);
CREATE INDEX IF NOT EXISTS idx_charter_mentions_unresolved ON charter_mentions (mention_kind) WHERE entity_id IS NULL;

-- RLS: publik läsning, admin-skrivning (plattformens standard).
ALTER TABLE charter_mentions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS charter_mentions_public_read ON charter_mentions;
CREATE POLICY charter_mentions_public_read ON charter_mentions FOR SELECT USING (true);
DROP POLICY IF EXISTS charter_mentions_admin_write ON charter_mentions;
CREATE POLICY charter_mentions_admin_write ON charter_mentions FOR ALL USING (is_admin()) WITH CHECK (is_admin());

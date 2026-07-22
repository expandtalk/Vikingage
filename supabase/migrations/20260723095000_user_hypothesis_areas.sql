-- Sparade hypotes-områden per inloggad användare (Daniel 2026-07-23): namnge + spara ett
-- sond-område (punkt + form + radie + fri hypotes-text) och återkom till det. Kontobunden
-- persistens ovanpå den lokala "Mina punkter". RLS: varje användare ser/hanterar BARA sina
-- egna rader (auth.uid() = user_id).
CREATE TABLE IF NOT EXISTS hypothesis_areas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  note       text,
  lat        double precision NOT NULL,
  lng        double precision NOT NULL,
  shape      text CHECK (shape IN ('circle','square','hexagon')) DEFAULT 'circle',
  radius_km  numeric NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hypothesis_areas_user_idx ON hypothesis_areas(user_id, created_at DESC);

ALTER TABLE hypothesis_areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hypothesis_areas_own_select ON hypothesis_areas;
CREATE POLICY hypothesis_areas_own_select ON hypothesis_areas FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS hypothesis_areas_own_insert ON hypothesis_areas;
CREATE POLICY hypothesis_areas_own_insert ON hypothesis_areas FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS hypothesis_areas_own_update ON hypothesis_areas;
CREATE POLICY hypothesis_areas_own_update ON hypothesis_areas FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS hypothesis_areas_own_delete ON hypothesis_areas;
CREATE POLICY hypothesis_areas_own_delete ON hypothesis_areas FOR DELETE USING (auth.uid() = user_id);

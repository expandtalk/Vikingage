-- 20260724170100_estate_valuations.sql
CREATE TABLE IF NOT EXISTS estate_valuations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id uuid NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  year int NOT NULL CHECK (year BETWEEN 800 AND 1700),
  jordetal_penningland int CHECK (jordetal_penningland >= 0),
  jordetal_notation text,
  cameral_units text,
  source text,
  confidence text DEFAULT 'probable',
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_estate_valuations_estate_year ON estate_valuations (estate_id, year);

ALTER TABLE estate_valuations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS valuations_read ON estate_valuations;
CREATE POLICY valuations_read ON estate_valuations FOR SELECT USING (true);
DROP POLICY IF EXISTS valuations_admin ON estate_valuations;
CREATE POLICY valuations_admin ON estate_valuations FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Jordetal -> kanoniskt penningland. 1 markland=192, 1 öresland=24, 1 örtugland=8 penningland.
CREATE OR REPLACE FUNCTION jordetal_to_penningland(markland int, oresland int, ortugland int, penningland int)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(markland,0)*192 + coalesce(oresland,0)*24 + coalesce(ortugland,0)*8 + coalesce(penningland,0)
$$;

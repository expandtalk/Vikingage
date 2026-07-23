-- Ångermanlands vikingatida centralorter — kurerat ortnamnskluster-lager (Daniel 2026-07-23,
-- ur forskningsdokument). Tes: samma kluster av sakrala/makt-ortnamnsled återkommer kring varje
-- centralort (Nora, Torsåker, Härnösand–Säbrå). LINGVIST-fokus: attesteringsform + år bevaras.
-- KÄLLKRITIK: evidence_tier skiljer etablerat (core) från författarens hypoteser (extended, ⚠).
-- Koordinater = NULL (geokodas separat ur Ortnamnsregistret/Lantmäteriet) — inga påhittade lägen.
-- Full seed applicerad via MCP; se central_places / central_place_names i prod. Denna fil
-- dokumenterar schemat + RLS för reproducerbarhet (seed-VALUES i migrationshistoriken hos MCP).

CREATE TABLE IF NOT EXISTS central_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, region text,
  lat double precision, lng double precision, geom geometry(Point, 4326),
  description text, source text, confidence text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS central_place_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  central_place_id uuid NOT NULL REFERENCES central_places(id) ON DELETE CASCADE,
  name text NOT NULL, attested_form text, attested_year integer,
  element_keys text[], category text,
  evidence_tier text CHECK (evidence_tier IN ('core','extended','control')),
  interpretation text, fnction text,
  lat double precision, lng double precision, geom geometry(Point, 4326),
  source text, confidence text, note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cpn_place_idx ON central_place_names(central_place_id);
CREATE INDEX IF NOT EXISTS cpn_geom_gix ON central_place_names USING gist (geom);

ALTER TABLE central_places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cp_read ON central_places;  CREATE POLICY cp_read ON central_places FOR SELECT USING (true);
DROP POLICY IF EXISTS cp_write ON central_places; CREATE POLICY cp_write ON central_places FOR ALL USING (is_admin()) WITH CHECK (is_admin());
ALTER TABLE central_place_names ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cpn_read ON central_place_names;  CREATE POLICY cpn_read ON central_place_names FOR SELECT USING (true);
DROP POLICY IF EXISTS cpn_write ON central_place_names; CREATE POLICY cpn_write ON central_place_names FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Seed: 3 centralorter + 41 kluster-namn (Nora 15 / Torsåker 12 / Härnösand–Säbrå 14),
-- attesteringsform+år + element_keys + evidence_tier + tolkning, källa = forskningsdokumentet.
-- (Se MCP-migrationen 'angermanland_central_place_clusters' för fullständiga VALUES.)

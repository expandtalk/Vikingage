-- Steg 1 osteologi→GIS (Daniel 2026-07, task #6): geom på archaeological_sites +
-- normaliserad isotope_measurements + ontologi-predikat sannolikt_ursprung.
-- Princip: EN individ = en nod med flera mät-dimensioner (osteologi/isotoper/aDNA),
-- inte silo. genetic_individuals bär redan genetic_sex/archaeological_sex, age, radiocarbon,
-- haplogrupper, ancestry — isotoperna bryts ut till egen tabell så de blir kartbara/queryable.

-- 1. Geometri (SRID 4326 = plattformskonvention, jfr estates; ST_Transform 3006 vid metrisk
--    analys). archaeological_sites.coordinates är en point (lng,lat).
ALTER TABLE archaeological_sites ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);
UPDATE archaeological_sites
   SET geom = ST_SetSRID(ST_MakePoint(coordinates[0], coordinates[1]), 4326)
 WHERE coordinates IS NOT NULL AND geom IS NULL;
CREATE INDEX IF NOT EXISTS archaeological_sites_geom_gix ON archaeological_sites USING gist (geom);

-- 2. Normaliserade isotop-mätningar: EN individ → många prov, method + osäkerhet PER värde.
CREATE TABLE IF NOT EXISTS isotope_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  individual_id uuid NOT NULL REFERENCES genetic_individuals(id) ON DELETE CASCADE,
  system text NOT NULL,                 -- 'Sr87_86' | 'd18O' | 'd13C' | 'd15N' | ...
  value double precision NOT NULL,
  unit text,                            -- 'ratio' | 'permil_VPDB' | 'permil_VSMOW' | 'permil_AIR'
  uncertainty double precision,         -- ±1σ
  tissue text,                          -- 'emalj' | 'dentin' | 'ben'
  method text,                          -- 'MC-ICP-MS' | 'TIMS' | 'IRMS' ...
  lab text,
  reference_baseline text,              -- vilken baslinje/isoscape värdet tolkas mot
  is_local boolean,                     -- tolkning mot baslinjen (NULL = ej bedömt)
  source text,
  confidence text,                      -- 'certain'|'probable'|'possible'|'uncertain'
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS isotope_measurements_individual_idx ON isotope_measurements(individual_id);
CREATE INDEX IF NOT EXISTS isotope_measurements_system_idx ON isotope_measurements(system);

ALTER TABLE isotope_measurements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS iso_public_read ON isotope_measurements;
CREATE POLICY iso_public_read ON isotope_measurements FOR SELECT USING (true);
DROP POLICY IF EXISTS iso_admin_write ON isotope_measurements;
CREATE POLICY iso_admin_write ON isotope_measurements FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 3. Ontologi: provenance som KG-kant. Individ → plats/region (sannolikhetsyta, ej punkt).
INSERT INTO rel_predicates (code, label_sv, label_en, subject_type, object_type, qualifier_schema, description)
VALUES ('sannolikt_ursprung', 'sannolikt ursprung', 'likely origin',
  'genetic_individual', 'city',
  '{"method":"Sr|Sr+O|aDNA|ZooMS","probability":"0-1","confidence":"certain|probable|possible|uncertain"}'::jsonb,
  'Individens sannolika geografiska ursprung enligt isotop-/aDNA-analys. Resultatet är en sannolikhetsyta — object pekar på närmaste registrerade plats/region; kvalificerare bär metod + sannolikhet. Icke-lokal-flaggning sker på isotope_measurements.is_local.')
ON CONFLICT (code) DO NOTHING;

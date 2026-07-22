-- Strandförskjutnings-kontrollpunkter (strandkontroll): validerings-/kalibreringsdata mot
-- SGU-strandförskjutningsmodellen (Daniel 2026-07-23, samdesignat). Tabellen + 8 seed-punkter
-- skapades externt (pastad SQL) men SAKNADE RLS = exponerad läs+skriv via API:t. Denna
-- migration härdar den och lägger till linje-tabellen för krön/sill-digitalisering.
--
-- Kontrolltyper: arkeologisk / geologisk_strandlinje / isolationsbacken förankrar olika delar
-- av kurvan; gradienttest Öland (~1 mm/år) vs Slätbaken (~2,8) skiljer modellfel från feldatering.
-- z_min_rh2000/rsl fylls av LiDAR+NKG2016LU-skriptet (dry-run default, --commit + JA). De
-- provisoriska rsl-intervallen i seed är FLAGGADE expertuppskattningar, ej mätdata.
-- geom EPSG:3006 (SWEREF, matchar Lantmäteriet/SGU/LiDAR); lon/lat_wgs84 = provenance.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid='public.strandkontroll'::regclass AND conname='strandkontroll_namn_key'
  ) THEN
    ALTER TABLE strandkontroll ADD CONSTRAINT strandkontroll_namn_key UNIQUE (namn);
  END IF;
END $$;

ALTER TABLE strandkontroll ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS strandkontroll_read ON strandkontroll;
CREATE POLICY strandkontroll_read ON strandkontroll FOR SELECT USING (true);
DROP POLICY IF EXISTS strandkontroll_write ON strandkontroll;
CREATE POLICY strandkontroll_write ON strandkontroll FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE TABLE IF NOT EXISTS strandkontroll_linje (
  id    serial PRIMARY KEY,
  namn  text NOT NULL,
  mode  text CHECK (mode IN ('crest','sill')),
  geom  geometry(LineString, 3006)
);
ALTER TABLE strandkontroll_linje ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS strandkontroll_linje_read ON strandkontroll_linje;
CREATE POLICY strandkontroll_linje_read ON strandkontroll_linje FOR SELECT USING (true);
DROP POLICY IF EXISTS strandkontroll_linje_write ON strandkontroll_linje;
CREATE POLICY strandkontroll_linje_write ON strandkontroll_linje FOR ALL USING (is_admin()) WITH CHECK (is_admin());

UPDATE strandkontroll
SET geom = ST_Transform(ST_SetSRID(ST_MakePoint(lon_wgs84,lat_wgs84),4326),3006)
WHERE geom IS NULL AND lon_wgs84 IS NOT NULL;

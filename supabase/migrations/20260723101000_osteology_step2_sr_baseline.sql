-- Osteologi steg 2: Sr/O-baslinjelager (referensdata för att flagga icke-lokala individer).
-- ÄRLIGT: seedar bara de breda GEOLOGISKA intervallen (karbonat vs silikat — textboksfakta,
-- citerbara), INTE påhittade bioavailable-punktvärden. Fina baslinjer (moderna snäckor/växter/
-- smågnagare) ingesteras från publicerade studier innan de tolkas som "lokal".
-- zon-rader (basis='geological_range') = grov isoscape; punkt-rader (basis='reference_sample')
-- = fina mätvärden med geom, ingesteras separat.
CREATE TABLE IF NOT EXISTS sr_baseline (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region       text NOT NULL,
  geology      text CHECK (geology IN ('carbonate','silicate','mixed','marine')),
  basis        text NOT NULL CHECK (basis IN ('geological_range','reference_sample')),
  sample_type  text,
  sr8786_min   numeric,
  sr8786_max   numeric,
  d18o_note    text,
  lon_wgs84    double precision,
  lat_wgs84    double precision,
  geom         geometry(Point, 3006),
  source       text,
  confidence   text,
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sr_baseline_geom_gix ON sr_baseline USING gist (geom);

ALTER TABLE sr_baseline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sr_baseline_read ON sr_baseline;
CREATE POLICY sr_baseline_read ON sr_baseline FOR SELECT USING (true);
DROP POLICY IF EXISTS sr_baseline_write ON sr_baseline;
CREATE POLICY sr_baseline_write ON sr_baseline FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO sr_baseline (region, geology, basis, sr8786_min, sr8786_max, source, confidence, note)
SELECT * FROM (VALUES
 ('Baltiskt kalkstensbälte (Öland/Gotland/Skåne)','carbonate','geological_range',0.7080,0.7100,
  'Paleozoisk karbonatberggrund; jfr paleozoiskt havsvatten ~0,708','coarse',
  'GROV zon. Karbonat → låg/icke-radiogen signatur. Öland≈Gotland≈Skåne → kan EJ skilja dem åt. Fina bioavailable-värden kräver referensprover.'),
 ('Prekambriskt urberg (Svealand/Götaland fastland)','silicate','geological_range',0.7200,0.7500,
  'Graniter/gnejser; radiogen Sr','coarse',
  'GROV zon. Silikat → hög radiogen signatur. Identifierar "icke-lokal från silikat" bra; positionering inom området kräver finare baslinje.'),
 ('Östersjön (marint/sea-spray)','marine','geological_range',0.7089,0.7092,
  'Modernt havsvatten ~0,7092','coarse',
  'GROV. Sea-spray drar bioavailable mot marint på små öar (homogeniserar Gotland/Öland).')
) AS v(region,geology,basis,sr8786_min,sr8786_max,source,confidence,note)
WHERE NOT EXISTS (SELECT 1 FROM sr_baseline WHERE basis='geological_range');

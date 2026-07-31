-- Museisamlings-objekt (SHM CC BY m.fl.) — egen tabell (artefacts är en bar legacy-tabell).
-- KÄRNAN: varje objekt attribueras till rätt museum via museum_id (Daniel). Fyndplats,
-- tidsperiod, kategori, osteologi (jsonb) + bild/källa. CC BY → attribution obligatorisk.
CREATE TABLE IF NOT EXISTS museum_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id uuid REFERENCES museums(id) ON DELETE SET NULL,   -- attribution till rätt museum
  object_no text, name text, title text, description text,
  category text, material text, technique text, size text, denomination text,
  find_country text, find_landscape text, find_socken text, find_kommun text, find_place text, find_fornlamning text,
  context text, period text, period_start int, period_end int,
  osteology jsonb, image_url text, source_url text, source text, attribution text,
  lat double precision, lng double precision,
  geom geometry(Point,4326) GENERATED ALWAYS AS (
    CASE WHEN lng IS NOT NULL AND lat IS NOT NULL THEN ST_SetSRID(ST_MakePoint(lng,lat),4326) END) STORED,
  created_at timestamptz DEFAULT now(),
  UNIQUE (museum_id, object_no)
);
ALTER TABLE museum_objects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS museum_objects_read ON museum_objects;
CREATE POLICY museum_objects_read ON museum_objects FOR SELECT USING (true);

-- Säkerställ museet Kungliga myntkabinettet (Historiska museet finns redan).
INSERT INTO museums (name, museum_type, website, domain, city, county, landscape, source, verified)
VALUES ('Kungliga myntkabinettet (Ekonomiska museet)','riks','https://myntkabinettet.se','myntkabinettet.se','Stockholm','Stockholm','Uppland','kurerad',false)
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';

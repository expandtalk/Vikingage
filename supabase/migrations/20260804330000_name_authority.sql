-- Namn-auktoritet: kanoniskt namn → former/varianter → belagda attestationer (m. region).
-- Grundad i runcorpusen: attestationer hämtas ur runic_inscriptions där NORMALISERINGEN har
-- namn-markören " framför namnet (Rundata-konvention) → verifierat, ej lös delsträngsmatchning.
-- Den regionala fördelningen (öst/väst-nordiska former, ort/landskap) faller ut ur attestationerna.

CREATE TABLE IF NOT EXISTS name_authority (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical text NOT NULL UNIQUE,
  gender text, meaning text, etymology text, notes_sv text, notes_en text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS name_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_id uuid NOT NULL REFERENCES name_authority(id) ON DELETE CASCADE,
  form text NOT NULL,
  form_type text NOT NULL,          -- 'modern' | 'old_norse' | 'runic'
  note_sv text, note_en text,
  UNIQUE (name_id, form)
);
CREATE TABLE IF NOT EXISTS name_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_id uuid NOT NULL REFERENCES name_authority(id) ON DELETE CASCADE,
  signum text NOT NULL,
  province text, parish text, lat double precision, lng double precision,
  norm_snippet text, source text DEFAULT 'runic_inscriptions',
  created_at timestamptz DEFAULT now(),
  UNIQUE (name_id, signum)
);
ALTER TABLE name_authority ENABLE ROW LEVEL SECURITY;
ALTER TABLE name_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE name_attestations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pr_na ON name_authority; CREATE POLICY pr_na ON name_authority FOR SELECT USING (true);
DROP POLICY IF EXISTS pr_nf ON name_forms; CREATE POLICY pr_nf ON name_forms FOR SELECT USING (true);
DROP POLICY IF EXISTS pr_nat ON name_attestations; CREATE POLICY pr_nat ON name_attestations FOR SELECT USING (true);

-- Pilot: Erik (kanoniskt + varianter + attestationer via namn-markör i normalization).
INSERT INTO name_authority (canonical, gender, meaning, etymology) VALUES
 ('Erik','male','evig/ensam härskare','Fornnordiska Eiríkr: ei-/æi- "alltid, ensam" + ríkr "härskare, mäktig".')
ON CONFLICT (canonical) DO NOTHING;

INSERT INTO name_forms (name_id, form, form_type, note_sv, note_en)
SELECT na.id, v.form, v.ft, v.nsv, v.nen
FROM name_authority na, (VALUES
  ('Erik','modern','modern svensk form','modern Swedish form'),
  ('Eirik','modern','variant','variant'),
  ('Eiríkr','old_norse','normaliserad fornnordisk form','normalised Old Norse form'),
  ('airikr','runic','yngre futhark-stavning (t.ex. G 68, N A280)','Younger Futhark spelling (e.g. G 68, N A280)'),
  ('irik','runic','stavning utan initialt a (t.ex. N A180)','spelling without initial a (e.g. N A180)')
) AS v(form,ft,nsv,nen)
WHERE na.canonical='Erik'
ON CONFLICT (name_id, form) DO NOTHING;

INSERT INTO name_attestations (name_id, signum, province, parish, lat, lng, norm_snippet)
SELECT na.id, ri.signum, ri.province, ri.parish,
       (ri.coordinates)[1], (ri.coordinates)[0], substring(ri.normalization for 90)
FROM runic_inscriptions ri, name_authority na
WHERE na.canonical='Erik'
  AND (ri.normalization LIKE '%"Eirík%' OR ri.normalization LIKE '%"Eirik%' OR ri.normalization LIKE '%"Erik%')
ON CONFLICT (name_id, signum) DO NOTHING;

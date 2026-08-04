-- Fynd per befästning (C14, solidus, hoard, produktion …) — evidenslager under datering/funktion.
-- Gör C14 och myntfynd till FÖRSTKLASSIG data i stället för fritext i period/dating_source.
-- Seeden är strikt dokumenterad (per fort med källa); ingen extrapolering.

CREATE TABLE IF NOT EXISTS fortification_finds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fortification_source text NOT NULL,   -- 'swedish_hillforts' | 'heritage_sites' | 'viking_fortresses'
  fortification_id uuid NOT NULL,
  find_type text NOT NULL,              -- 'c14' | 'solidus' | 'hoard' | 'production' | 'artefact' | 'other'
  label text,
  date_from int,                        -- kalibrerat/tolkat, e.Kr. (neg = f.Kr.)
  date_to int,
  c14_raw text,                         -- t.ex. '445±75 e.Kr.' / '1640±80 BP'
  description text,
  source_ref text,
  confidence text DEFAULT 'documented',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE fortification_finds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ff_read ON fortification_finds;
CREATE POLICY ff_read ON fortification_finds FOR SELECT USING (true);
DROP POLICY IF EXISTS ff_write ON fortification_finds;
CREATE POLICY ff_write ON fortification_finds FOR ALL USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO fortification_finds (fortification_source, fortification_id, find_type, label, date_from, date_to, c14_raw, description, source_ref, confidence)
SELECT * FROM (VALUES
  ('swedish_hillforts','53969468-2554-4b19-871a-2fa51d79f333'::uuid,'c14','Massakerlager',450,500,NULL,'Obegravda offer från massakern ca 480 e.Kr., daterad arkeologiskt.','Kalmar läns museum; Victor et al.','documented'),
  ('swedish_hillforts','53969468-2554-4b19-871a-2fa51d79f333'::uuid,'hoard','Smyckesdepåer (guld/silver)',450,500,NULL,'Gömda smyckesdepåer (bl.a. förgyllda reliefspännen, pärlor) funna i husen — vittnar om rikedom vid massakern.','Kalmar läns museum','documented'),
  ('swedish_hillforts','8d1e2db1-42b7-4807-94b0-0965878cfab8'::uuid,'c14','14C-datering',370,520,'445±75 e.Kr.','Radiokoldatering till folkvandringstid.','Damell 2000; Jensen-Urstad 2023','documented'),
  ('swedish_hillforts','fe995461-bf32-42f0-a6b6-9e4b6c22a4e2'::uuid,'c14','14C-datering (Darsgärde)',250,430,'1640±80 BP','Radiokoldatering, ca 300-tal e.Kr.','Ambrosiani 1958','documented'),
  ('swedish_hillforts','484e9840-4a16-4511-80d4-29ea30ab4953'::uuid,'production','Bronsgjutning (deglar)',300,500,NULL,'Deglar/gjutrester = bronshantverk på platsen — funktion utöver försvar.','Carlström 2002; RAÄ Järfälla 62:1','documented'),
  ('swedish_hillforts','7eb178a4-6bb7-43af-875c-1e86894be20c'::uuid,'production','Glas-/emaljproduktion',375,750,NULL,'Belägg för glas-/emaljhantverk — specialiserad produktion, inte enbart tillflykt.','Sjöblom et al. 2022','documented'),
  ('swedish_hillforts','7eb178a4-6bb7-43af-875c-1e86894be20c'::uuid,'c14','14C-datering',375,750,NULL,'Folkvandringstid–vendeltid.','Bornfalk-Back 2023','documented'),
  ('swedish_hillforts','18f25f6d-3f30-4176-82ae-66f8a00bc306'::uuid,'c14','14C (omtvistad)',-2900,-2700,'4880±350 BP','Kontroversiell — 14C på svedd jord ger bondestenålder; förväntades folkvandringstid pga guldskatterna i Falbygden. Osäker association.','kontroversiell 14C','disputed')
) AS v
WHERE NOT EXISTS (SELECT 1 FROM fortification_finds);

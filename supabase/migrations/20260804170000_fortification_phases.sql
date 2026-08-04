-- Intra-site-faser för befästningar: en plats byggs om i faser med skilda funktion/läge över tid.
-- Fångar Daniels princip: siting='defensible_height' ⇒ försvar; siting='logistics_hub'/'island_chokepoint'
-- ⇒ kontroll/handel. Föregångaren sitter oftast PÅ samma plats (samma monument, ny fas) — inte som
-- separat fornborg bredvid (se 20260804160000).

CREATE TABLE IF NOT EXISTS fortification_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fortification_source text NOT NULL,   -- 'heritage_sites' | 'swedish_hillforts' | 'viking_fortresses'
  fortification_id uuid NOT NULL,
  phase_order int NOT NULL,
  phase_name text NOT NULL,
  period_start int,
  period_end int,
  function text,                         -- 'defense' | 'control_trade' | 'administrative' | 'royal_residence'
  siting text,                           -- 'defensible_height' | 'logistics_hub' | 'island_chokepoint'
  description text,
  source_ref text,
  confidence text DEFAULT 'documented',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE fortification_phases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fp_read ON fortification_phases;
CREATE POLICY fp_read ON fortification_phases FOR SELECT USING (true);
DROP POLICY IF EXISTS fp_write ON fortification_phases;
CREATE POLICY fp_write ON fortification_phases FOR ALL USING (is_admin()) WITH CHECK (is_admin());

WITH ids AS (
  SELECT name, id FROM heritage_sites
  WHERE name IN ('Kalmar slott','Almarestäkets borg (Sankt Eriks borg)','Telge hus (Ragnhildsborg)')
)
INSERT INTO fortification_phases (fortification_source, fortification_id, phase_order, phase_name, period_start, period_end, function, siting, description, source_ref, confidence)
SELECT 'heritage_sites', ids.id, v.ord, v.pname, v.ps, v.pe, v.fn, v.sit, v.descr, v.sref, v.conf
FROM ids JOIN (VALUES
  ('Kalmar slott', 1, 'Kastal (försvarstorn)', 1180, 1250, 'control_trade', 'logistics_hub', 'Runt försvarstorn under Knut Eriksson, sent 1100-tal; kontrollerade Kalmarsunds inre farled och hamnen.', 'sv.wikipedia', 'approximate'),
  ('Kalmar slott', 2, 'Medeltidsborg (gränsfäste)', 1300, 1520, 'administrative', 'logistics_hub', 'Utbyggt till en av rikets starkaste borgar och gränsfäste mot Danmark; Kalmarunionen beseglades här 1397.', 'sv.wikipedia', 'documented'),
  ('Kalmar slott', 3, 'Renässansslott', 1540, 1600, 'royal_residence', 'logistics_hub', 'Ombyggt till renässansslott under Vasasönerna på 1500-talet.', 'sv.wikipedia', 'documented'),
  ('Almarestäkets borg (Sankt Eriks borg)', 1, '1100-talsborg (föregångare)', 1100, 1434, 'control_trade', 'island_chokepoint', 'Föregångarborg på Stäketsholmen; försvar för Sigtuna och Uppsala, kontroll av vattenleden Stockholm–Uppsala. Bränd 1434.', 'sv.wikipedia', 'approximate'),
  ('Almarestäkets borg (Sankt Eriks borg)', 2, 'Ärkebiskopsborg', 1440, 1519, 'administrative', 'island_chokepoint', 'Återuppförd 1440 (ärkebiskop Nils Ragvaldsson), kyrkans/påvemaktens borg. Gustav Trolle på 1510-talet; belägrad 1516–17, riven 1519 → upptakt till Stockholms blodbad 1520.', 'sv.wikipedia', 'documented'),
  ('Telge hus (Ragnhildsborg)', 1, 'Första borgen', 1300, 1445, 'administrative', 'island_chokepoint', 'Medeltida borg på Slottsholmen; administrerade Telgehus län 1318–1527 och kontrollerade passagen Mälaren–Östersjön. Bränd 1445 (Erik Puke).', 'sv.wikipedia', 'documented'),
  ('Telge hus (Ragnhildsborg)', 2, 'Karlsborg', 1448, 1520, 'administrative', 'island_chokepoint', 'Återuppförd 1448 av Karl Knutsson (Bonde), kallad Karlsborg; förföll under 1500-talet.', 'sv.wikipedia', 'documented')
) AS v(nm, ord, pname, ps, pe, fn, sit, descr, sref, conf) ON v.nm = ids.name
WHERE NOT EXISTS (
  SELECT 1 FROM fortification_phases fp WHERE fp.fortification_id = ids.id AND fp.phase_order = v.ord
);

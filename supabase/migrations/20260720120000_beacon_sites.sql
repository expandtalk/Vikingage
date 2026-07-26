-- Vårdkasar (beacon-fire sites) från RAÄ/K-samsök.
-- 211 verifierade lämningar med WGS84-koordinat direkt ur kulturarvsdata.se
-- (fritextsök text=vårdkase, filtrerat till type=Kulturlämning med giltig
-- gml:coordinates). INGA gissade lägen — varje rad har source_uri som pekar på
-- RAÄ Fornsök. Eget kartlager (useMapBeaconSites), legendknapp '🔥 Vårdkasar'.
--
-- OBS: Applicerad via MCP (db push är trasig i detta projekt). Denna fil är
-- dokumentation av schemat; datan importerades separat (se scratchpad-pipeline).

CREATE TABLE IF NOT EXISTS beacon_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  landscape text,
  municipality text,
  parish text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  source_uri text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE beacon_sites IS 'Vårdkasar (beacon-fire sites) från RAÄ/K-samsök, endast verifierade lämningar med WGS84-koordinat. Källa: kulturarvsdata.se';

ALTER TABLE beacon_sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "beacon_sites public read" ON beacon_sites;
CREATE POLICY "beacon_sites public read" ON beacon_sites FOR SELECT USING (true);

DROP POLICY IF EXISTS "beacon_sites admin write" ON beacon_sites;
CREATE POLICY "beacon_sites admin write" ON beacon_sites FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_beacon_sites_landscape ON beacon_sites (landscape);

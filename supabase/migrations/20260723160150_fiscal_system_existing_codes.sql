-- 20260723160150_fiscal_system_existing_codes.sql
-- Befintlig estate_holdings-data använder fiscal_system-koderna 'land_skatt' (10) och 'mynt' (5)
-- som saknades i 160000. Läggs in så valideringstriggern (160200) inte blockerar dem.
-- Not: 'land_skatt' och 'skatte' överlappar begreppsmässigt — taxonomi-städning (behåll en) är
-- en öppen fråga för Daniel; ingen data ändras här.
INSERT INTO vocabulary (scheme, code, label_sv, label_en) VALUES
  ('fiscal_system','land_skatt','landskatt','land tax'),
  ('fiscal_system','mynt','mynt','money render')
ON CONFLICT (scheme, code) DO NOTHING;

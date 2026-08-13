-- Göteborgs 1600-talsförsvar i fort_element (ritas av fortifications_near → Befästningar-lagret).
-- VERIFIERADE koordinater (Wikipedia): Skansen Kronan 57.69667/11.95472, Skansen Lejonet 57.71417/11.98944.
-- WGS84 → SWEREF99TM (3006). evidence='dokumenterad', evidence_class='bevarat_ovan_mark' (stående byggnader).
-- Nya/Gamla Älvsborg saknar verifierad koord → backlog (gissas ej).
INSERT INTO fort_element (site, element_type, name, start_earliest, start_latest, evidence, evidence_class, published, geom)
SELECT v.site, v.etype, v.name, v.se, v.sl, 'dokumenterad', 'bevarat_ovan_mark', true,
  ST_Transform(ST_SetSRID(ST_MakePoint(v.lng, v.lat),4326), 3006)
FROM (VALUES
  ('Göteborgs 1600-talsförsvar','skans','Skansen Kronan', 1687, 1700, 57.69667, 11.95472),
  ('Göteborgs 1600-talsförsvar','skans','Skansen Lejonet', 1687, 1690, 57.71417, 11.98944)
) AS v(site, etype, name, se, sl, lat, lng)
WHERE NOT EXISTS (SELECT 1 FROM fort_element fe WHERE fe.name = v.name);

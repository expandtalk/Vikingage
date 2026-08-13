-- Nya + Gamla Älvsborg i fort_element. VERIFIERADE koord (Wikipedia): Nya 57.68556/11.83833
-- (Kyrkogårdsholmen), Gamla 57.68972/11.90722 (Klippan). WGS84→SWEREF99TM. Nya = bevarad (1653–1677);
-- Gamla = medeltida, raserad ~1660 (utgravd, dating osäker → start null).
INSERT INTO fort_element (site, element_type, name, start_earliest, start_latest, end_earliest, evidence, evidence_class, published, geom)
SELECT v.site, 'fästning', v.name, v.se, v.sl, v.ee, v.ev, v.ec, true,
  ST_Transform(ST_SetSRID(ST_MakePoint(v.lng, v.lat),4326), 3006)
FROM (VALUES
  ('Älvsborgs fästningar','Nya Älvsborgs fästning', 1653, 1677, NULL::int, 'dokumenterad', 'bevarat_ovan_mark', 57.68556, 11.83833),
  ('Älvsborgs fästningar','Gamla Älvsborg', NULL::int, NULL::int, 1660, 'utgravd', NULL, 57.68972, 11.90722)
) AS v(site, name, se, sl, ee, ev, ec, lat, lng)
WHERE NOT EXISTS (SELECT 1 FROM fort_element fe WHERE fe.name = v.name);

-- Attundalandsvägen (Ambrosiani 1987): runstenstät landsväg längs vattendelaren Saltsjön–Mälaren,
-- Lunda → Kyrkhamn/Hässelby (Spånga sn). Waypoint-KOORDINATER hämtade ur Rundata (runic_inscriptions,
-- våra egna verifierade runstenslägen) — EJ gissade; leden följer stenarna (Bollaerts poäng). 7 ankare N→S.
WITH ins_road AS (
  INSERT INTO viking_roads (name, road_type, description)
  SELECT 'Attundalandsvägen', 'landsvag',
    'Runstenstät landsväg längs vattendelaren mellan Saltsjön och Mälaren, från Lunda till Kyrkhamn vid Hässelby (Spånga sn). Rekonstruerad av Björn Ambrosiani (1987). Sträckningen här följer de daterade runstenarna längs leden (Rundata) — bl.a. Jarlabankes bro (U 164/U 165).'
  WHERE NOT EXISTS (SELECT 1 FROM viking_roads WHERE name='Attundalandsvägen')
  RETURNING id
),
rid AS (SELECT id FROM ins_road UNION ALL SELECT id FROM viking_roads WHERE name='Attundalandsvägen' LIMIT 1)
INSERT INTO road_waypoints (road_id, name, coordinates, waypoint_type, waypoint_order)
SELECT (SELECT id FROM rid), v.name, point(v.lng, v.lat), v.wtype, v.ord
FROM (VALUES
  ('Norra änden — Lunda (vid U 356)', 18.0489, 59.6568, 'junction', 1),
  ('Vid U 243', 18.0820, 59.5607, 'landmark', 2),
  ('Jarlabankes bro (U 164/U 165), Täby', 18.0635, 59.4994, 'bridge', 3),
  ('Vid U 143/U 144', 18.0162, 59.4684, 'landmark', 4),
  ('Vid U 101', 17.9839, 59.4487, 'landmark', 5),
  ('Spånga (vid U 73)', 17.8999, 59.4219, 'landmark', 6),
  ('Södra änden — Kyrkhamn/Hässelby, Spånga sn (vid U 85)', 17.8136, 59.3770, 'junction', 7)
) AS v(name, lng, lat, wtype, ord)
WHERE NOT EXISTS (SELECT 1 FROM road_waypoints w JOIN viking_roads r ON r.id=w.road_id WHERE r.name='Attundalandsvägen');

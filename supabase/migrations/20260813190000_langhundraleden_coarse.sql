-- Långhundraleden som GROV, SCHEMATISK korridor (Daniel: ingen källa just nu → backlog för full sträckning).
-- Endast övre loppet, dragen mellan VERIFIERADE ankare ur vår DB: Skepptuna/U 357 (Rundata),
-- Broborg (Wikidata Q29886005), Gamla Uppsala kyrka (heritage). Ingen gissad waypoint.
-- Ny road_type 'farled' (vattenled saknades i taxonomin).
ALTER TABLE public.viking_roads DROP CONSTRAINT viking_roads_road_type_check;
ALTER TABLE public.viking_roads ADD CONSTRAINT viking_roads_road_type_check
  CHECK (road_type = ANY (ARRAY['rullstensas','halvag','vintervag','bro','vadstalle','knutpunkt','kungavag','landsvag','farled']));

WITH ins_road AS (
  INSERT INTO viking_roads (name, road_type, description, slug)
  SELECT 'Långhundraleden', 'farled',
    'Vikingatida vattenled från Trälhavet (Åkersberga) upp genom Långhundradalen till Uppsala. OBS: sträckningen här är SCHEMATISK — endast övre loppet, dragen mellan verifierade ankare (Skepptuna/U 357, Broborg, Gamla Uppsala). Full sträckning kräver källa (Lantmäteriets vandringstavla el. forskares ledstenslista) — se backlog.',
    'langhundraleden'
  WHERE NOT EXISTS (SELECT 1 FROM viking_roads WHERE name='Långhundraleden')
  RETURNING id
),
rid AS (SELECT id FROM ins_road UNION ALL SELECT id FROM viking_roads WHERE name='Långhundraleden' LIMIT 1)
INSERT INTO road_waypoints (road_id, name, coordinates, waypoint_type, waypoint_order)
SELECT (SELECT id FROM rid), v.name, point(v.lng, v.lat), v.wtype, v.ord
FROM (VALUES
  ('Skepptuna (U 357) — övre loppet', 18.0937, 59.7088, 'landmark', 1),
  ('Broborg (Vassunda) — förglasad fornborg vid leden', 17.9516, 59.7556, 'landmark', 2),
  ('Gamla Uppsala — ledens nordliga ände', 17.6318, 59.8995, 'junction', 3)
) AS v(name, lng, lat, wtype, ord)
WHERE NOT EXISTS (SELECT 1 FROM road_waypoints w JOIN viking_roads r ON r.id=w.road_id WHERE r.name='Långhundraleden');

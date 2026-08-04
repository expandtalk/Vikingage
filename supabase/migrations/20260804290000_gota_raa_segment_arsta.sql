-- Göta landsväg: lägg RAÄ-belagd sträcka (Stockholm 227, utgrävd vägbana vid Årsta) som verifierad
-- waypoint i norr — bekräftar linjens dragning nära Årstaviken/Skanstull. Källa: Fornsök RAÄ Stockholm 227;
-- Vinberg m.fl. 2012 (KM 12017). (Bonus i heritage_sites: pålspärr Årstaviken L2013:4298, vikingatid–tidig
-- medeltid, kontrollerade passagen mellan Årstaholmarna.)
-- OBS källkritik: moderna gatunamn (Norr/Söder Mälarstrand = 1900-tals kajer på utfylld mark) läggs EJ in
-- som historiska strandvägar — strandvägar adderas bara där belagda (RAÄ färdväg / äldre lantmäterikartor).

DO $$
DECLARE rid uuid;
BEGIN
  SELECT id INTO rid FROM viking_roads WHERE name='Göta landsväg';
  IF rid IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM road_waypoints w WHERE w.road_id=rid AND w.name LIKE 'Göta landsväg – RAÄ-belagd%') THEN
    UPDATE road_waypoints SET waypoint_order = waypoint_order + 1 WHERE road_id = rid;
    INSERT INTO road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, name, description)
    VALUES (rid, point(18.0562245,59.2937085), 1, 'landmark',
      'Göta landsväg – RAÄ-belagd sträcka (Årsta)',
      'Arkeologiskt belagd vägbana (grus/småsten, ~34 m i schakt) av Göta landsväg vid Årsta, ca 300 m SÖ om gravfältet RAÄ Stockholm 77:1. Bekräftar linjens dragning i norr. Källa: Fornsök RAÄ Stockholm 227; Vinberg m.fl. 2012 (KM 12017).');
  END IF;
END $$;

-- (a) Valdemarsleden: lägg Stora Rör (Ölandslandning) mellan draget och Köpingsvik så sund-korsningen
--     landar på Ölands kust i stället för att skära in över ön. Stora Rör = historisk färjeplats mot
--     Revsudden (smalaste Kalmar–Öland), sv.wikipedia 56.75389/16.54056.
-- (b) Ortnamnstaggning: drag-leden (morfologisk) på alla ^Drag-namn (26 st). Påstår EJ portage — bara
--     att leden finns. Portage-tolkning bara där korroborerad (led/farled, drag+ed som Dragedet, näs).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM valdemar_route_points WHERE id = 'vrp-stora-ror') THEN
    UPDATE valdemar_route_points SET seq = seq + 1 WHERE seq >= 9;
    INSERT INTO valdemar_route_points (id, route, seq, name, lat, lng, is_lotstation, is_major_waypoint, section, description)
    VALUES ('vrp-stora-ror','Kalmarsund',9,'Stora Rör (Ölandslandning)',56.75389,16.54056,false,true,'Kalmarsund',
      'Landningsplats på Öland mittemot draget vid Revsudden — smalaste Kalmar–Öland. Historisk färjeplats till Revsudden (före Ölandsbron 1972). Härifrån kustsegling norrut till Köpingsvik.');
  END IF;
END $$;

UPDATE place_names SET element_keys = array_append(coalesce(element_keys,'{}'),'drag')
 WHERE name ~ '^Drag' AND NOT ('drag' = ANY(coalesce(element_keys,'{}')));

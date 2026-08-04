-- Rättar österledernas (Östvägen + Volgavägen) utfart ur Birka.
-- FÖRE: rak linje Birka → Staraja Ladoga, som klipper norrut över Uppland (ser ut som Birka→Uppsala)
--       och hoppar över Neva. EFTER: verifierad sjökorridor Birka → Furusund → Åland → Nevas mynning → Ladoga.
-- Koordinater: sv.wikipedia (Furusund 59.66056/18.90694; Mariehamn 60.09306/19.93917; Nyen 59.94417/30.40694).
-- Schematisk (exakt vikingatida farled genom skärgården är omtvistad; detaljerad ö-rutt = framtida spår).
-- geom är GENERERAD ur lat/lng. Idempotent via NOT EXISTS-vakt.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM trade_route_points WHERE name = 'Furusund (skärgårdsutlopp)') THEN
    UPDATE trade_route_points SET seq = seq + 3
     WHERE route_id IN (SELECT id FROM trade_routes WHERE name IN ('Östvägen (Rus-floderna)','Volgavägen (mot kalifatet)'))
       AND seq >= 2;

    INSERT INTO trade_route_points (route_id, seq, name, lat, lng, point_kind, section, description, source, shoreline_note)
    SELECT tr.id, v.seq, v.nm, v.lat, v.lng, 'waypoint', v.sec, v.descr,
           'Wikipedia (koordinater)', 'Schematisk sjökorridor — exakt vikingatida farled genom skärgården omtvistad'
    FROM trade_routes tr, (VALUES
      (2,'Furusund (skärgårdsutlopp)',59.66056,18.90694,'Stockholms skärgård','Ut österut genom norra skärgården (Furusundsleden, förbi Rindö/Ljusterö/Blidö) — ej norrut mot Uppsala.'),
      (3,'Åland (Ålands hav)',60.09306,19.93917,'Ålands hav','Överfart Ålands hav.'),
      (4,'Nevas mynning (Nyen)',59.94417,30.40694,'Finska viken','In i Finska viken till Nevas mynning; därifrån uppför Neva mot Ladoga.')
    ) AS v(seq,nm,lat,lng,sec,descr)
    WHERE tr.name IN ('Östvägen (Rus-floderna)','Volgavägen (mot kalifatet)');
  END IF;
END $$;

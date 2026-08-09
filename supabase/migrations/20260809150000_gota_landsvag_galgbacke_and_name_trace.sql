-- (1) Galgbacken/avrättningsplatsen (off-route landmärke, kind='execution').
--     Koordinat: Wikipedia (Galgbacken, Hammarbyhöjden). Låg SÖ om Skanstull vid sidoväg mot
--     Hammarby — EJ på Göta landsvägs sydvästliga huvudlinje → off_route=true.
insert into road_waypoints (road_id, waypoint_order, name, kind, waypoint_type, description, off_route, coordinates) values
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 50, 'Galgbacken (Hammarbyhöjden)', 'execution', 'landmark',
 'Stockholms avrättningsplats utanför Skanstulls tull från sent 1600-tal; stupstock vid dagens Solandergatan. Sista offentliga avrättning 1862 (Pehr Viktor Göthe); skelettfynd vid husbyggena på 1930-talet. Låg SÖ om Skanstull vid en sidoväg mot Hammarby/Dalarö — inte på Göta landsvägs huvudlinje (som gick SV mot Johanneshov). Koordinat: Wikipedia (bör dubbelkollas mot Wikidata P625).',
 true, point(18.09167, 59.29886));

-- (2) Göta landsvägs BEVARADE NAMNSPÅR: moderna gatan Göta landsväg/Götalandsvägen genom
--     Årstafältet->Östberga. NAMNKONTINUITET (belagt via gällande gatunamn, Isof) — inte påstådd
--     medeltida vägkropp. kind='trace', off_route=true; ritas som SOLID linje (skild från
--     den streckade ankarlinjen). Ordnade NÖ->SV till en jämn linje. Koord: Isof-/gatudata.
insert into road_waypoints (road_id, waypoint_order, name, kind, waypoint_type, description, off_route, coordinates) values
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 60, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn Göta landsväg/Götalandsvägen (namnkontinuitet, Isof).', true, point(18.049013, 59.291588)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 61, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.045319, 59.292395)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 62, 'Göta landsväg (namnspår) – Valla å', 'trace', 'landmark', 'Bevarat gatunamn vid Valla å (Isof).', true, point(18.043212, 59.292038)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 63, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.041661, 59.289756)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 64, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.040949, 59.289265)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 65, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.040778, 59.288832)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 66, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.040631, 59.288655)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 67, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.040377, 59.288494)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 68, 'Göta landsväg (namnspår) – Årstafältet', 'trace', 'landmark', 'Bevarat gatunamn vid Årstafältet (Isof).', true, point(18.039781, 59.288076)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 69, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.033257, 59.284861)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 70, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.031454, 59.284812)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 71, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.02516, 59.282848)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 72, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.022767, 59.283117)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 73, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.021666, 59.282972)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 74, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.020092, 59.282603)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 75, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.017446, 59.282925)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 76, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.014853, 59.282222)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 77, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.014681, 59.281564)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 78, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.014971, 59.281164)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 79, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.014814, 59.28091)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 80, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.009131, 59.279198)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 81, 'Göta landsväg (namnspår) – Lerkrogen', 'trace', 'landmark', 'Bevarat gatunamn vid Lerkrogen (Isof).', true, point(18.007997, 59.279152)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 82, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.00652, 59.279441)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 83, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.00543, 59.280081)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 84, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.004761, 59.28034)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 85, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.004335, 59.280256)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 86, 'Göta landsväg (namnspår)', 'trace', 'landmark', 'Bevarat gatunamn (Isof).', true, point(18.003985, 59.280018));

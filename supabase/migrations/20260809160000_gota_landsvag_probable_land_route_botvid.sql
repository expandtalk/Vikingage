-- TROLIG LANDVÄG via Sankt Botvids väg (Huddinge) — en landsväg simmar inte över Albysjön/
-- Långsjön; den realistiska sträckningen Flottsbro->Botkyrka gick på land via dagens
-- Södertäljevägen/Botkyrkaleden (Sankt Botvids väg-stråket). kind='probable', off_route=true
-- (ingår ej i ankarlinjen); ritas som SOLID linje. Koord: D. Larsson (WGS84), gatunät.
insert into road_waypoints (road_id, waypoint_order, name, kind, waypoint_type, description, off_route, coordinates) values
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 90, 'Trolig landväg – Södertäljevägen (Huddinge, N)', 'probable', 'landmark', 'Trolig landsträckning via Sankt Botvids väg-stråket (dagens Södertäljevägen), Huddinge. Landväg mellan Flottsbro och Botkyrka — ej vattenpassage. Koord: D. Larsson.', true, point(17.872417, 59.254716)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 91, 'Trolig landväg – Södertäljevägen (Huddinge)', 'probable', 'landmark', 'Trolig landsträckning via Södertäljevägen (Sankt Botvids väg-stråket), Huddinge. Koord: D. Larsson.', true, point(17.872898, 59.254676)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 92, 'Trolig landväg – Botkyrkaleden (alt.)', 'probable', 'landmark', 'Alternativ landsträckning via Botkyrkaleden, Huddinge/Botkyrka. Koord: D. Larsson.', true, point(17.872149, 59.250135)),
('97b4a769-7eed-4d64-b97e-978d5b957e7d', 93, 'Trolig landväg – Botkyrkaleden (alt., S)', 'probable', 'landmark', 'Alternativ landsträckning via Botkyrkaleden mot Botkyrka. Koord: D. Larsson.', true, point(17.871627, 59.24999));

-- Galgbacken: koordinat verifierad mot Wikidata P625 (Q10502174) 59.29887/18.09167.
update road_waypoints
set coordinates = point(18.09167, 59.29887),
    description = 'Stockholms avrättningsplats utanför Skanstulls tull från sent 1600-tal; stupstock vid dagens Solandergatan. Sista offentliga avrättning 1862 (Pehr Viktor Göthe); skelettfynd vid husbyggena på 1930-talet. Låg SÖ om Skanstull vid en sidoväg mot Hammarby/Dalarö — inte på Göta landsvägs huvudlinje (som gick SV mot Johanneshov). Koordinat verifierad: Wikidata P625 (Q10502174) 59.29887/18.09167.'
where road_id='97b4a769-7eed-4d64-b97e-978d5b957e7d' and kind='execution';

-- (1) Volga/Birka östled: DETALJERAD skärgårdssträckning som EGEN, märkt rekonstruktions-led
--     (Daniels itinerär). Källkritik: följer dagens öar; vid vikingatidens ~+5 m var Stockholmsområdet
--     ett brett sundsystem → EJ belagd vikingatida farled. Koord: sv.wikipedia (öarna verifierade).
-- (2) Voxtorps rundkyrka: ackreditering av arkeolog/källa Cecilia Ring (Kalmar läns museum 2005) +
--     undersökningspost (1958/59: absidkor, mittpelarfundament, pilgrimssnäcka).

INSERT INTO trade_routes (name, slug, description, source, license)
SELECT 'Birka östled — skärgårdssträckning (rekonstruktion)','birka-ostled-skargard',
 'REKONSTRUKTION av utfarten ur Birka österut genom Stockholms skärgård mot Östersjön/Åland. Följer DAGENS öar — vid vikingatidens ~+5 m havsnivå var Stockholmsområdet ett brett sundsystem, så detta är EJ en belagd vikingatida farled. Jfr schematiska huvudkorridoren (Östvägen/Volgavägen).',
 'Rekonstruktion (Daniels itinerär); koordinater sv.wikipedia','reconstruction'
WHERE NOT EXISTS (SELECT 1 FROM trade_routes WHERE slug='birka-ostled-skargard');

INSERT INTO trade_route_points (route_id, seq, name, lat, lng, point_kind, is_major, section, shoreline_note)
SELECT tr.id, v.seq, v.nm, v.lat, v.lng, 'waypoint', v.major, 'Stockholms skärgård (rekonstruktion)',
  'Modern ö; vikingatida +5 m-strandlinje avvek — rekonstruktion'
FROM trade_routes tr, (VALUES
  (1,'Birka',59.3362,17.5455,true),(2,'Lovön',59.3170,17.8330,false),
  (3,'Stadsholmen (Gamla stan)',59.3251,18.0711,true),(4,'Lidingö',59.3670,18.1330,false),
  (5,'Rindö (Vaxholm)',59.39861,18.40167,true),(6,'Ljusterö',59.48917,18.53083,false),
  (7,'Blidö',59.61528,18.90139,false),(8,'Furusund',59.66056,18.90694,true),
  (9,'Åland (Ålands hav)',60.09306,19.93917,true)
) AS v(seq,nm,lat,lng,major)
WHERE tr.slug='birka-ostled-skargard'
  AND NOT EXISTS (SELECT 1 FROM trade_route_points p WHERE p.route_id=tr.id);

UPDATE ecclesiastical_sites
   SET dating_source = 'Dendrokronologi 1240-tal. Kulturhistorisk inventering: Cecilia Ring, Kalmar läns museum 2005. RAÄ BBR; Svenska kyrkan Södermöre.',
       historical_notes = coalesce(historical_notes||' ','') ||
         'Rundkyrka (fästningskyrka) dendrodaterad till 1240-talet — en av åtta bevarade rundkyrkor i Sverige; influenser från Skåne/Bornholm. Arkeolog/inventering: Cecilia Ring, Kalmar läns museum 2005.'
 WHERE name='Voxtorps kyrka' AND lat BETWEEN 56.53 AND 56.54
   AND historical_notes NOT LIKE '%Rundkyrka (fästningskyrka)%';

INSERT INTO church_investigations (church_id, church_name, year_from, year_to, investigation_type, find_context, what_found, source_type, source_citation, source_url, evidence_class, verification_status)
SELECT id, 'Voxtorps kyrka', 1958, 1959, 'restaurering/arkeologisk undersökning', 'under kyrkgolvet/koret',
  'Ursprungligt absidförsett kor + fundament till mittpelaren; pilgrimssnäcka (Santiago de Compostela) i grav under altaret. Restaurering efter åsknedslag 1958 (Erik Lundberg).',
  'publication',
  'Cecilia Ring, "Voxtorp kyrkogård – kulturhistorisk inventering", Kalmar läns museum 2005; RAÄ BBR; Stig Lundh 2014; Martin Hansson, Det medeltida Småland.',
  'https://www.svenskakyrkan.se/sodermore/historia-om-voxtorp-kyrka','documented','verified'
FROM ecclesiastical_sites WHERE name='Voxtorps kyrka' AND lat BETWEEN 56.53 AND 56.54
  AND NOT EXISTS (SELECT 1 FROM church_investigations ci JOIN ecclesiastical_sites e ON e.id=ci.church_id
                  WHERE e.name='Voxtorps kyrka' AND e.lat BETWEEN 56.53 AND 56.54 AND ci.year_from=1958);

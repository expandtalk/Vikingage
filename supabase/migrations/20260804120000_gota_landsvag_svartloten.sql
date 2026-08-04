-- Göta landsväg + Svartlötens tingsplats (Södertörn)
--
-- Källor:
--   * sv.wikipedia: "Gamla Göta landsväg", "Svartlöten", "Svartlösa härad"
--   * RAÄ Botkyrka 389:1 (Svartlötens tingsplats); RAÄ Brännkyrka 34:1 (bevarad vägsträcka över Årstafältet)
--
-- OBS koordinater:
--   * Svartlöten: 59.24000 N / 17.83639 Ö — härledd ur RAÄ-registret/sv.wikipedia, ännu EJ Fornsök-precis.
--   * Vägens start/slut (Skanstull/Södertälje): APPROXIMATIVA ändpunkter. Verifierad delpunkt = Svartlöten.
--   * Full verifierad waypoint-kedja (Årstafältet, Långsjön/Korkskruven, Flottsbro, Botkyrka kyrka, Salem)
--     återstår — kräver koordinat-per-punkt mot Fornsök/Wikidata innan inläggning.

BEGIN;

-- 1) Utöka road_type-enumet med 'landsvag' (medeltida landsväg passar ingen befintlig typ)
ALTER TABLE viking_roads DROP CONSTRAINT viking_roads_road_type_check;
ALTER TABLE viking_roads ADD CONSTRAINT viking_roads_road_type_check
  CHECK (road_type = ANY (ARRAY['rullstensas','halvag','vintervag','bro','vadstalle','knutpunkt','kungavag','landsvag']));

-- 2) Svartlötens tingsplats i thing_sites
INSERT INTO thing_sites
  (name, thing_type, jurisdiction, landscape, monument_type, evidence_type,
   period_start, period_end, usage_note, confidence, source, description, lat, lng, geom)
SELECT
  'Svartlöten (Svarta Löt)', 'häradsting', 'Svartlösa härad', 'Södermanland',
  'samlingsplats', 'urkund', 1250, 1667,
  'Häradsting för Svartlösa härad; gav namn åt häradet och senare Svartlösa tingsrätt (1977 → Huddinge tingsrätt). Ting belagt här senast fr.o.m. mitten av 1200-talet (kan vara äldre); omnämns i flera 1400-talsdokument som Swarta lööth. Tingsplatsen flyttades till Fittja gård 1667. Brännkyrka socken ingick i häradet t.o.m. 1913. Göta landsväg passerade platsen; föregångaren kallades Tingsvägen just för att den ledde hit.',
  'high', 'RAÄ Botkyrka 389:1 (Fornsök); sv.wikipedia',
  'Medeltida tingsplats i norra Botkyrka, vid torpet Eriksberg (förr Tingsta) vid Kumla gård. Läget ligger idag delvis under Södertäljevägen (E4/E20) nära Hallunda trafikplats; kommunen har markerat platsen med en granitmur vid Alby centrum. Koordinat härledd ur RAÄ-registret/sv.wikipedia, ännu ej Fornsök-precis.',
  59.24000, 17.83639,
  ST_SetSRID(ST_MakePoint(17.83639, 59.24000), 4326)
WHERE NOT EXISTS (SELECT 1 FROM thing_sites WHERE name = 'Svartlöten (Svarta Löt)');

-- 3) Göta landsväg i viking_roads
INSERT INTO viking_roads
  (name, name_en, road_type, description, description_en,
   period_start, start_coordinates, end_coordinates, importance_level)
SELECT
  'Göta landsväg', 'Göta landsväg (medieval highroad)', 'landsvag',
  'Medeltida landsväg från Stockholm (Skanstull) över Södertörn mot Götalandskapen. Sträckning: Skanstull → Årsta/Årstafältet (bäst bevarade delen, fornminnesmärkt som RAÄ Brännkyrka 34:1) → Brännkyrka kyrka → Långsjön (serpentinbacken Korkskruven på östra sidan) → Älvsjö → Huddinge (förbi Gömmaren, genom Glömsta) → Flottsbro (flottbro över det smalaste sundet mellan Albysjön och Tullingesjön) → Alby förbi Svartlötens tingsplats → Botkyrka kyrka (ungefär halvvägs, ofta första dagsetappen) → Salem → Södertälje. Föregångare var den forntida (odaterade) Tingsvägen som ledde till Svartlötens tingsplats; vägen infogades i tillfartsvägen till Stockholm och kom att kallas Göta landsväg efter stadens grundande på 1250-talet. Stora delar av den södra sträckningen löper parallellt med dagens Södertäljeväg (E4/E20). Start-/slutkoordinater approximativa; verifierad delpunkt: Svartlöten (RAÄ Botkyrka 389:1).',
  'Medieval highroad from Stockholm (Skanstull) across Södertörn towards the Göta lands. Route: Skanstull → Årstafältet (best-preserved stretch, listed as RAÄ Brännkyrka 34:1) → Brännkyrka church → Långsjön (the Korkskruven serpentine) → Älvsjö → Huddinge (Glömsta) → Flottsbro (pontoon bridge over the narrowest sound between Albysjön and Tullingesjön) → Alby past the Svartlöten assembly site → Botkyrka church (roughly halfway) → Salem → Södertälje. Its predecessor was the ancient Tingsvägen leading to the Svartlöten thing-site; it took the name Göta landsväg after Stockholm was founded in the 1250s. Much of the southern stretch runs parallel to today''s E4/E20 motorway. Endpoint coordinates approximate.',
  1250, point(18.0765, 59.3045), point(17.6253, 59.1955), 'high'
WHERE NOT EXISTS (SELECT 1 FROM viking_roads WHERE name = 'Göta landsväg');

-- 3b) längd (härledd ur 11-punktslinjen: start + 9 waypoints + slut) + dateringsevidens/delsträcka
UPDATE viking_roads
   SET total_length_km = 31.9,
       description = description
         || ' Vid Glömsta bekräftar runhällen Sö 300 (brobyggnadsinskrift) att vägen över den sanka Glömstadalen är minst från 1000-talet.'
         || ' Dokumenterad delsträcka Salem–Södertälje (sv.wikipedia): förbi sjön Aspen, öster/söder om Bornsjön (Söderby fornminnesområde, Oxelbystenen Sö 304), norr om sjön Tullan, in i Södertälje vid Sankta Ragnhilds kyrka.'
 WHERE name = 'Göta landsväg'
   AND total_length_km IS NULL;  -- idempotent: kör bara en gång

-- 4) Waypoint-kedja (N→S). Koordinater: kyrkor ur ecclesiastical_sites (verified),
--    Sö 300 ur runic_inscriptions (rundata_evighetsrunor, high), Årstafältet/Flottsbro ur sv.wikipedia.
--    Långsjön/Korkskruven UTELÄMNAD tills verifierad koordinat finns.
DELETE FROM road_waypoints
 WHERE road_id = (SELECT id FROM viking_roads WHERE name = 'Göta landsväg');

WITH r AS (SELECT id FROM viking_roads WHERE name = 'Göta landsväg')
INSERT INTO road_waypoints (road_id, coordinates, waypoint_order, waypoint_type, name, description)
SELECT r.id, v.coordinates, v.ord, v.wtype, v.nm, v.descr
FROM r, (VALUES
  (point(18.0449583, 59.2907000), 1, 'bridge',
   'Årstafältet – Valla å',
   'Vägen korsade Valla å över Årstafältet; en rekonstruerad stenvalvbro (1998, efter förlagan Albybron) finns idag. Bäst bevarade sträckan, fornminnesmärkt (RAÄ Brännkyrka 34:1), ca 730 m över fältet. Band samman järnåldersgårdarna Valla/Bägersta (norr) och Östberga/Ersta (söder).'),
  (point(18.0230556, 59.2819444), 2, 'landmark',
   'Brännkyrka kyrka',
   'Medeltida sockenkyrka. Brännkyrka socken ingick i Svartlösa härad t.o.m. 1913.'),
  (point(17.9146000, 59.2347000), 3, 'landmark',
   'Glömstahällen (Sö 300)',
   'Runhäll ristad direkt i berget vid Glömstadalen (RAÄ Huddinge 24:1 / L2016:837). Inskrift: "Sverker lät göra bron efter Ärengunn, sin goda moder" — ett brobyggnadsmonument som daterar vägen över den sanka Glömstadalen till åtminstone 1000-talet.'),
  (point(17.8808300, 59.2313900), 4, 'bridge',
   'Flottsbro (flottbron)',
   'Smalaste sundet mellan Albysjön och Tullingesjön; resande fördes över på en flottbro. Använd fram till 1660-talet; 1669 flyttades vägen till Fittjanäset.'),
  (point(17.8363900, 59.2400000), 5, 'landmark',
   'Svartlötens tingsplats',
   'Medeltida tingsplats för Svartlösa härad (RAÄ Botkyrka 389:1), vid Alby/Hallunda. Ligger idag delvis under E4/E20 — därav att vägen här löper parallellt med motorvägen.'),
  (point(17.8183889, 59.2390833), 6, 'landmark',
   'Botkyrka kyrka',
   'Medeltidskyrka i S:t Botvid-miljön. Härifrån Botkyrkamonumentet Sö 286, ett tidigkristet gravmonument (originalet på Historiska museet). Ungefär halvvägs Stockholm–Södertälje, ofta första dagsetappen.'),
  (point(17.7704600, 59.2185200), 7, 'landmark',
   'Salems kyrka',
   'Medeltida sockenkyrka i Salem, längs vägens fortsättning mot Södertälje.'),
  (point(17.6941000, 59.2339000), 8, 'landmark',
   'Bornsjön – Oxelbystenen (Sö 304)',
   'Vägen gick förbi sjön Aspen och öster/söder om Bornsjön, förbi Söderby fornminnesområde. Vid Bornsjöns sydöstra vik står runstenen Oxelbystenen (Sö 304). Källa: sv.wikipedia (sträckning); koordinat ur runkorpus (Rundata, high).'),
  (point(17.6261000, 59.1985000), 9, 'landmark',
   'Sankta Ragnhilds kyrka (infart Södertälje)',
   'Efter en sväng mot sydväst norr om sjön Tullan kom vägen in i Södertälje från öster, ca ett kvarter söder om Sankta Ragnhilds kyrka, och slutade vid Stora Torget. Källa: sv.wikipedia.')
) AS v(coordinates, ord, wtype, nm, descr);

-- 5) Återanvändbar väglinje-vy: bygger LineString ur start + ordnade waypoints + slut.
--    security_invoker => RLS på underliggande tabeller gäller (jfr härdning 20260720150000).
--    Underlag för korridoranalys (buffra geom och sampla features/jordart längs vägen).
CREATE OR REPLACE VIEW v_road_lines
WITH (security_invoker = on) AS
SELECT r.id AS road_id, r.name, r.name_en, r.road_type, r.importance_level, r.total_length_km,
       ST_MakeLine(p.pt ORDER BY p.ord) AS geom
FROM viking_roads r
JOIN LATERAL (
  SELECT ST_SetSRID(ST_MakePoint(r.start_coordinates[0], r.start_coordinates[1]),4326) AS pt, 0 AS ord
  UNION ALL
  SELECT ST_SetSRID(ST_MakePoint(w.coordinates[0], w.coordinates[1]),4326), w.waypoint_order
    FROM road_waypoints w WHERE w.road_id = r.id
  UNION ALL
  SELECT ST_SetSRID(ST_MakePoint(r.end_coordinates[0], r.end_coordinates[1]),4326), 2147483647
) p ON true
WHERE r.start_coordinates IS NOT NULL AND r.end_coordinates IS NOT NULL
GROUP BY r.id, r.name, r.name_en, r.road_type, r.importance_level, r.total_length_km
HAVING count(p.pt) >= 2;

COMMIT;

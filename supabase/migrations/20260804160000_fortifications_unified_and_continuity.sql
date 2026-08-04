-- Enat befästningslager (fornborg / vikingaborg / medeltidsborg) + platskontinuitets-kandidatvy
-- + Kalmar slott (exempel på intra-site-kontinuitet kastal→slott).
--
-- Modelleringsprincip (Daniels iakttagelse): "en plats flyttar man sällan på" — en medeltidsborg
-- har ofta en äldre föregångare PÅ SAMMA plats. Men det visade sig att kontinuiteten nästan alltid
-- är INTRA-SITE (samma monument i faser: Kalmar kastal 1100-tal → slott; Almarestäket 1100-tal → 1440),
-- INTE en separat fornborg bredvid: närmaste förhistoriska fornborg ligger 2,7–18 km från varje
-- medeltidsborg (0 samlokaliserade inom 500 m). Därför länkas INGA fornborgar som "föregångare" här
-- (det vore en gissning) — intra-site-faserna bor i respektive posts beskrivning/datering.

BEGIN;

-- Kalmar slott (RAÄ-nr ej bekräftat → register_id null). Koordinat ur sv.wikipedia. geom genereras.
INSERT INTO heritage_sites (name, raa_type, register_system, municipality, parish, landscape, period, lat, lng, description, source_uri, evidence_class)
SELECT 'Kalmar slott', 'Borg/slottslämning', 'RAÄ', 'Kalmar', 'Kalmar', 'Småland', 'medeltid',
  56.65806, 16.35556,
  'Medeltida borg/slott på Slottsholmen vid Slottsfjärden, Kalmar. Ett försvarstorn (kastal) uppfördes förmodligen i slutet av 1100-talet (under Knut Eriksson) på den redan befolkade holmen och kontrollerade Kalmarsunds inre farled och den medeltida hamnen. Under senmedeltiden en av rikets starkaste borgar; ombyggt till renässansslott på 1500-talet. Skolexempel på platskontinuitet: kastal (1100-tal) → medeltidsborg → slott på samma plats. Källa: sv.wikipedia (CC BY-SA 4.0).',
  'https://sv.wikipedia.org/wiki/Kalmar_slott', 'documented'
WHERE NOT EXISTS (SELECT 1 FROM heritage_sites WHERE name='Kalmar slott' AND lat BETWEEN 56.6 AND 56.7);

-- Enat lager över alla tre borgtyper (för "hoppa mellan borgtyperna" i frontend)
CREATE OR REPLACE VIEW v_fortifications_all
WITH (security_invoker = on) AS
SELECT 'swedish_hillforts'::text AS source_table, id, name, 'fornborg'::text AS fort_class,
       period::text AS period, coordinates[0] AS lng, coordinates[1] AS lat,
       ST_SetSRID(ST_MakePoint(coordinates[0],coordinates[1]),4326) AS geom
  FROM swedish_hillforts WHERE coordinates IS NOT NULL
UNION ALL
SELECT 'viking_fortresses', id, name, 'vikingaborg', construction_period::text,
       coordinates[0], coordinates[1], ST_SetSRID(ST_MakePoint(coordinates[0],coordinates[1]),4326)
  FROM viking_fortresses WHERE coordinates IS NOT NULL
UNION ALL
SELECT 'heritage_sites', id, name, 'medeltidsborg', period,
       lng, lat, ST_SetSRID(ST_MakePoint(lng,lat),4326)
  FROM heritage_sites
  WHERE period='medeltid' AND (raa_type ILIKE '%borg%' OR raa_type ILIKE '%slott%') AND lng IS NOT NULL;

-- Kandidatvy: medeltidsborg + närmaste äldre borg + co_located-flagga (<=500 m = trolig platskontinuitet).
-- OBS: en träff är bara en HYPOTES att verifiera per plats; co_located=false betyder INTE föregångare.
CREATE OR REPLACE VIEW v_fortification_continuity_candidates
WITH (security_invoker = on) AS
SELECT m.id AS castle_id, m.name AS castle, m.lat AS castle_lat, m.lng AS castle_lng,
       o.name AS nearest_older_fort, o.fort_class AS older_class, o.source_table AS older_source,
       ROUND(ST_Distance(m.geom::geography, o.geom::geography)::numeric,0) AS distance_m,
       (ST_Distance(m.geom::geography, o.geom::geography) <= 500) AS co_located
FROM (SELECT * FROM v_fortifications_all WHERE fort_class='medeltidsborg') m
CROSS JOIN LATERAL (
  SELECT a.name, a.fort_class, a.source_table, a.geom
  FROM v_fortifications_all a
  WHERE a.fort_class IN ('fornborg','vikingaborg')
  ORDER BY m.geom::geography <-> a.geom::geography
  LIMIT 1
) o;

COMMIT;

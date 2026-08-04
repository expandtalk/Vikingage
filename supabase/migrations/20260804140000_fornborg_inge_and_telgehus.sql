-- Fornborgs-hubb: backfill av socken/kommun, fornborg↔-inge-vy, + Telge hus (medeltida borg).
--
-- Källkritik: -inge-associationen är en HYPOTES om ålder (ortnamnstypen är gammal, men enskild
-- fornborg delar inte automatiskt namnets ålder). Vyn exponerar den som obekräftad hypotes,
-- den skrivs ALDRIG in som datering i swedish_hillforts. Telge hus är en MEDELTIDA stenborg
-- (ej förhistorisk fornborg) → hör hemma i heritage_sites, inte swedish_hillforts.

BEGIN;

-- 1) parish ur RAÄ-nummer-prefix (auktoritativ socken). country är redan ifyllt; county/län kvarstår tomt.
UPDATE swedish_hillforts
   SET parish = trim(regexp_replace(raa_number, '\s+\d+.*$',''))
 WHERE (parish IS NULL OR parish='') AND raa_number ~ '\s+\d';

-- 2) municipality via entydig parish→kommun-crosswalk ur heritage_sites (partiell; spatial fill kvar)
UPDATE swedish_hillforts h
   SET municipality = m.municipality
  FROM (
    SELECT parish, min(municipality) AS municipality
    FROM heritage_sites
    WHERE coalesce(parish,'')<>'' AND coalesce(municipality,'')<>''
    GROUP BY parish HAVING count(DISTINCT municipality)=1
  ) m
 WHERE (h.municipality IS NULL OR h.municipality='') AND h.parish = m.parish;

-- 3) Telge hus (Ragnhildsborg) — RAÄ Östertälje 220:1. geom är GENERERAD ur lat/lng (sätts ej här).
INSERT INTO heritage_sites (name, raa_type, register_system, register_id, municipality, parish, landscape, period, lat, lng, description, source_uri, evidence_class)
SELECT 'Telge hus (Ragnhildsborg)', 'Borg/slottslämning', 'RAÄ', 'Östertälje 220:1',
  'Södertälje', 'Östertälje', 'Södermanland', 'medeltid', 59.21806, 17.61000,
  'Medeltida stenborg på Slottsholmen (tidigare Ragnhildsholmen) i Linasundet, norra Södertälje. Första borgen daterad till tidigt 1300-tal (marinarkeologi, C14 sent 1200-/tidigt 1300-tal); administrerade Telgehus län 1318–1527 (Öknebo, Hölebo, delar av Svartlösa härad). Brändes 1445, återuppfördes 1448 (Karlsborg), förföll under 1500-talet. Namnet Ragnhildsborg (efter Södertäljes skyddshelgon Ragnhild av Tälje) är inte medeltida utan känt först från 1700-talet — ej att förväxla med Ragnhildsborgs gård. Postglacial landhöjning har förändrat holmens strandlinje. Källor: RAÄ Östertälje 220:1; sv.wikipedia (CC BY-SA 4.0); Stockholms läns museum.',
  'https://sv.wikipedia.org/wiki/Telge_hus', 'documented'
WHERE NOT EXISTS (SELECT 1 FROM heritage_sites WHERE register_id='Östertälje 220:1');

-- 4) Persistent vy: fornborg + närmaste -inge-namn + avstånd (+ hypotesflagga <=2 km).
CREATE OR REPLACE VIEW v_fornborg_inge
WITH (security_invoker = on) AS
SELECT h.id AS hillfort_id, h.name, h.raa_number, h.parish, h.municipality, h.landscape,
       h.coordinates, h.period_start, h.dating_confidence,
       i.inge_name AS nearest_inge, ROUND(i.d::numeric,0) AS inge_distance_m,
       CASE WHEN i.d <= 2000 THEN 'äldre järnålder (ortnamnshypotes, obekräftad)' END AS inge_dating_hypothesis
FROM swedish_hillforts h
CROSS JOIN LATERAL (
  SELECT pn.name AS inge_name,
         ST_Distance(ST_SetSRID(ST_MakePoint(h.coordinates[0],h.coordinates[1]),4326)::geography, pn.geom::geography) AS d
  FROM place_names pn
  WHERE (pn.normed_name ILIKE '%inge' OR pn.name ILIKE '%inge') AND pn.geom IS NOT NULL
  ORDER BY ST_SetSRID(ST_MakePoint(h.coordinates[0],h.coordinates[1]),4326)::geography <-> pn.geom::geography
  LIMIT 1
) i
WHERE h.coordinates IS NOT NULL;

COMMIT;

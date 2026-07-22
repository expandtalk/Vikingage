-- Befordran av kyrkor till ecclesiastical_sites + koppling socken/härad. Körd via MCP 2026-07-21.
-- Koordinater kommer ALLTID från heritage_sites/Wikidata — inga gissade lägen.
-- Byggår för medeltidskyrkor sätts av scripts/data/ingest-medieval-churches.mjs (Wikidata inception).

-- 1) Befordra ALLA heritage-kyrkor som inte redan finns inom 300 m (spatial dedup).
INSERT INTO public.ecclesiastical_sites
  (name, kind, lat, lng, landscape, parish, municipality, heritage_site_id, source, license, legacy_table, legacy_id)
SELECT h.name, 'parish_church', h.lat, h.lng, h.landscape, h.parish, h.municipality, h.id,
       'heritage_sites / Wikidata (CC0)', 'CC0', 'heritage_sites', h.id
FROM public.heritage_sites h
WHERE h.raa_type='kyrka' AND h.lat IS NOT NULL AND h.lng IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.ecclesiastical_sites e
                  WHERE e.geom IS NOT NULL AND ST_DWithin(e.geom::geography, h.geom::geography, 300))
ON CONFLICT (legacy_table, legacy_id) DO NOTHING;

-- 2) Koppla socken ENDAST för entydiga sockennamn (n=1). Tvetydiga (Vänge/Näs/Bro m.fl.) lämnas
--    olänkade tills sockenpolygoner (Geotorget) möjliggör spatial punkt-i-polygon.
WITH c AS (
  SELECT e.id, trim(regexp_replace(lower(e.name),
    '\s*(gamla |nya |gamble )?(ödekyrka|kyrkoruin|domkyrka|kyrkan|kyrka|cathedral|kloster|kapell).*$','')) AS base
  FROM public.ecclesiastical_sites e WHERE e.kind IN ('parish_church','chapel','cathedral')
),
counts AS (
  SELECT c.id eid, count(*) n, (array_agg(p.id))[1] pid
  FROM c JOIN public.parishes p ON p.parish_type='socken' AND p.country='Sweden'
     AND (lower(p.name)=c.base OR lower(p.name)=rtrim(c.base,'s'))
  GROUP BY c.id
)
UPDATE public.ecclesiastical_sites e SET parish_id = counts.pid
FROM counts WHERE e.id=counts.eid AND counts.n=1 AND e.parish_id IS NULL;

-- 3) Koppla härad via parishes.hundred_external_id -> hundreds.external_id.
UPDATE public.ecclesiastical_sites e SET hundred_id = h.id
FROM public.parishes p JOIN public.hundreds h ON h.external_id = p.hundred_external_id
WHERE e.parish_id = p.id AND e.hundred_id IS NULL;

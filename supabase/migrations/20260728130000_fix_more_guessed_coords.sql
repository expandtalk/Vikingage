-- Fler koordinater satta ur minnet/approximation → verifierade Wikidata-värden.
-- Ledbergs kulle: 58.4000,15.4700 (fel ~4.7 km) → 58.4406,15.4494 (Wikidata Q10556200, själva kullen).
-- Stora Förvar:   57.2850,17.9650 (fel ~1.1 km) → 57.2922,17.9771 (Wikidata Q66195454, grottplatsen).
UPDATE public.archaeological_sites
SET coordinates = point(15.4494,58.4406), geom = ST_SetSRID(ST_MakePoint(15.4494,58.4406),4326)
WHERE name = 'Ledbergs kulle';
UPDATE public.archaeological_sites
SET coordinates = point(17.9771,57.2922), geom = ST_SetSRID(ST_MakePoint(17.9771,57.2922),4326)
WHERE name = 'Stora Förvar (Stora Karlsö)';

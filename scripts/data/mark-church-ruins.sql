-- Markerar ruinstatus på ecclesiastical_sites. Körd via MCP 2026-07-21.
-- Ödekyrkor/kyrkoruiner hämtas till heritage_sites av scripts/data/fetch-church-ruins.mjs (RAÄ K-samsök).

-- 1) Via namn (ödekyrka/kyrkoruin/klosterruin/ruin).
UPDATE public.ecclesiastical_sites SET status='ruin'
WHERE (name ILIKE '%ödekyrk%' OR name ILIKE '%kyrkoruin%' OR name ILIKE '%klosterruin%' OR name ILIKE '% ruin%')
  AND (status IS NULL OR status <> 'ruin');

-- 2) Via närhet (100 m) till en verifierad K-samsök-ruin.
UPDATE public.ecclesiastical_sites e SET status='ruin'
FROM public.heritage_sites h
WHERE h.raa_type IN ('kyrkoruin','klosterruin') AND h.geom IS NOT NULL
  AND ST_DWithin(e.geom::geography, h.geom::geography, 100)
  AND (e.status IS NULL OR e.status <> 'ruin');

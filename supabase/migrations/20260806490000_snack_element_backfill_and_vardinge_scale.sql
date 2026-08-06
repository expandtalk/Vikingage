-- 1) Tagga Snäck-namn med ledet 'snack' (prefix-regel, speglar placeNameElements.matchElements).
--    Så dyker ledet upp som chip + på kartan + i /explore?element=snack (den befintliga "undersidan").
-- 2) Vårdinge-vågen → museum_objects (verifierad; inv.nr pending).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
UPDATE public.place_names
SET element_keys = array_append(coalesce(element_keys, '{}'), 'snack')
WHERE name ILIKE 'Snäck%'
  AND NOT ('snack' = ANY(coalesce(element_keys, '{}')));

INSERT INTO public.museum_objects (name, title, description, category, material, period, find_landscape, find_socken, source, attribution)
SELECT 'Balansvåg med vikter, Vårdinge', 'Vikingatida balansvåg (Vårdinge)',
  'Hopfällbar balansvåg med skålar och tillhörande viktlod från Vårdinge socken, Södermanland — handelsredskapet i den vägda silverekonomin, där silvret mättes i vikt på plats. Förvaras på Statens historiska museum; refererad i den numismatiska litteraturen om vågar och viktlod. Exakt inventarienummer och gravkontext behöver verifieras mot SHM.',
  'våg', 'brons/järn', 'vikingatid', 'Södermanland', 'Vårdinge',
  'Webbverifierad (SHM; "Vågar och viktlod", DiVA)', 'Fakta fria; inv.nr/gravkontext + bild pending verifiering'
WHERE NOT EXISTS (SELECT 1 FROM public.museum_objects m WHERE m.name = 'Balansvåg med vikter, Vårdinge');

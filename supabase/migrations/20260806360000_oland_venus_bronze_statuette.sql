-- Venus-statyett (romersk import) från Öland. Klein 1931 (faktakälla, paraphraserad). 2026-08-06.
-- Auto-indexeras i söket via trg_museum_object_search. Bild pending CC0/CC.
INSERT INTO public.museum_objects (name, title, description, category, material, size, find_landscape, period, source, attribution)
SELECT 'Venusstatyett från Öland', 'Venus (romersk bronsstatyett)',
  'Vacker Venusbild funnen på Öland — verk av en romersk bronsgjutare från kejsartiden, alltså en romersk import till Norden under äldre järnålder. Hela statyetten är 274 mm hög. Förvaras i Statens historiska museum.',
  'statyett', 'brons', '274 mm', 'Öland', 'romersk järnålder (romersk import, kejsartiden)',
  'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'
WHERE NOT EXISTS (SELECT 1 FROM public.museum_objects m WHERE m.name = 'Venusstatyett från Öland');

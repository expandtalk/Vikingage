-- Apollo Grannus-kärlet (romersk bronsimport, SHM). Applicerad i prod via MCP (repo-spegling).
-- Klein 1931 (faktakälla, paraphraserad). Fyndplats EJ angiven i källan → NULL (verifiera SHM). 2026-08-06.
-- Auto-indexeras i söket via trg_museum_object_search.
INSERT INTO public.museum_objects (name, title, description, category, material, size, period, source, attribution)
SELECT 'Apollo Grannus-kärlet', 'Apollo Grannus-urnan (romerskt bronskärl)',
  'Ett romerskt bronskärl tillägnat guden Apollo Grannus — ett av de präktigaste föremålen ur Sveriges jord, 448 mm högt. Romersk import under äldre järnålder. Förvaras i Statens historiska museum. Fyndplats ej angiven i källan (verifiera mot SHM).',
  'kärl', 'brons', '448 mm', 'romersk järnålder (romersk import)',
  'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; fyndplats/koord pending (SHM); bild pending CC0/CC'
WHERE NOT EXISTS (SELECT 1 FROM public.museum_objects m WHERE m.name = 'Apollo Grannus-kärlet');

-- Romerskt glaskärl (sjögrönt, slipat, rundad botten), SHM. Klein 1931 (faktakälla, paraphraserad).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- Fyndplats ej angiven i källan → NULL (verifiera mot SHM). Auto-indexeras via trg_museum_object_search.
INSERT INTO public.museum_objects (name, title, description, category, material, period, source, attribution)
SELECT 'Romerskt glaskärl (sjögrönt, slipat)', 'Romerskt glaskärl',
  'Romerskt glaskärl av en utomordentligt läcker sjögrön färg, med en slipning som är en njutning att ta i, och rundad botten — romersk import under äldre järnålder. Förvaras i Statens historiska museum. Fyndplats ej angiven i källan (verifiera mot SHM).',
  'kärl (glas)', 'glas', 'romersk järnålder (romersk import)',
  'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; fyndplats/koord pending (SHM); bild pending CC0/CC'
WHERE NOT EXISTS (SELECT 1 FROM public.museum_objects m WHERE m.name = 'Romerskt glaskärl (sjögrönt, slipat)');

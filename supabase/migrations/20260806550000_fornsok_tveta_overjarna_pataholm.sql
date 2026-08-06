-- Tre Fornsök-lämningar, verifierade SWEREF99TM→WGS84-koordinater (RAÄ CC0).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.

INSERT INTO public.heritage_sites (name, raa_type, period, parish, landscape, lat, lng, description)
SELECT 'Höggrupp, Tveta 39:3', 'hög', 'förhistorisk (odaterad hög)', 'Tveta', 'Södermanland',
  59.1484, 17.6013,
  'Grupp om tre högar (gravhögar), ca 6–7 m diam, 0,4–0,7 m h; två med central grop. På krön av bergrygg, hagmark. Fornsök L2014:75 / Tveta 39:3.'
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.name = 'Höggrupp, Tveta 39:3');

INSERT INTO public.swedish_hillforts (name, parish, landscape, raa_number, dating_basis, description, coordinates)
SELECT 'Fornborg, Överjärna 23:1', 'Överjärna', 'Södermanland', 'Överjärna 23:1 (L2013:1511)',
  'ej daterad (RAÄ Fornsök)',
  'Fornborg 550×100–200 m (Ö–V), begränsad av branter/stup och i V av en 85 m lång vall (0,5–1 m h). Ingång 1,5 m br där en stig leder in. Fornsök L2013:1511.',
  point(17.5109, 59.1307)
WHERE NOT EXISTS (SELECT 1 FROM public.swedish_hillforts h WHERE h.raa_number = 'Överjärna 23:1 (L2013:1511)');

INSERT INTO public.heritage_sites (name, raa_type, period, parish, landscape, lat, lng, description)
SELECT 'Pataholm — minnessten & gammal köping', 'minnesmärke', 'eftermedeltid (köping) + 1954 (minnessten)', 'Ålem', 'Småland',
  56.9164, 16.4287,
  'Pataholms gamla köping (ursprungligen holme i innerskärgården) med bevarade köpmans-/hembygdsgårdar. Vid infarten en rest minnessten (1,6 m h) med ingraverat "Gustaf Adolf" och "16/5 54" — rest i samband med Kung Gustaf VI Adolfs eriksgata 1954. Fornsök L1955:40 / Ålem 59:1.'
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.name = 'Pataholm — minnessten & gammal köping');

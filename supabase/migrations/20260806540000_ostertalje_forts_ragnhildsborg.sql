-- Tre Fornsök-lämningar i Östertälje sn (Södermanland) med VERIFIERADE SWEREF99TM→WGS84-koordinater
-- (RAÄ CC0). Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.

-- 1) Stora fornborgen L2014:8639 (Östertälje 161:1) — saknades → ny i swedish_hillforts.
INSERT INTO public.swedish_hillforts (name, parish, landscape, raa_number, dating_basis, description, coordinates)
SELECT 'Fornborg, Östertälje 161:1 (storborg)', 'Östertälje', 'Södermanland',
  'Östertälje 161:1 (L2014:8639)', 'ej daterad (RAÄ Fornsök)',
  'Mycket stor fornborg, ca 930×200–450 m (NV–SÖ), till största delen begränsad av bergsbranter, däremellan stenvallar (10–130 m l, 2–4 m br). Vid utgrävning av förmodad förborg utanför SÖ-muren påträffades stora mängder träkol (ATA 6123/71, Lars Löfstrand). Delundersökt. Fornsök L2014:8639.',
  point(17.6985, 59.2018)
WHERE NOT EXISTS (SELECT 1 FROM public.swedish_hillforts h WHERE h.raa_number = 'Östertälje 161:1 (L2014:8639)');

-- 2) Ryska borgen L2014:9183 — finns redan → berika med koord/RAÄ-nr/beskrivning där de saknas.
UPDATE public.swedish_hillforts
SET raa_number = coalesce(nullif(raa_number,''), 'Östertälje 162:1 (L2014:9183)'),
    description = coalesce(nullif(description,''),
      'Fornborg, 160×140 m (N–S), begränsad av bergstup och stenvallar (2–6 m br, 0,5–2 m h), kallmurade i upp till fyra skikt. Förmodade ingångar i NV och SV. Ej undersökt. Fornsök L2014:9183.'),
    coordinates = coalesce(coordinates, point(17.7046, 59.1922))
WHERE name = 'Ryska borgen';

-- 3) Ragnhildsborg / Täljehus L2014:8640 — medeltida borg → castle-lagret med verifierad koord.
INSERT INTO public.medieval_castles (name, category, region, country_now, lat, lng, coord_status, period, source, note)
SELECT 'Ragnhildsborg (Täljehus)', 'medeltidsborg', 'Södermanland', 'Sverige',
  59.2180, 17.6101, 'verified', 'medeltid (anlagd 1300-tal; bränd 1435 av Erik Puke; återuppförd av Karl Knutsson)',
  'RAÄ Fornsök L2014:8640 / Östertälje 220:1 (CC0)',
  'Ruin av stenhus (22×10 m) med gråsten/tegel, husgrund, terrasseringar och vallgravar. Även kallad Täljehus/Karlsborg/Karlsholm. Källor: Rannsakningar 1667; Hjulhammar 2003; Ekman 2017.'
WHERE NOT EXISTS (SELECT 1 FROM public.medieval_castles m WHERE m.name = 'Ragnhildsborg (Täljehus)');

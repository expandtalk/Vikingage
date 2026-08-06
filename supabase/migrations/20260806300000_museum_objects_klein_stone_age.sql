-- Sju stenåldersföremål ur Ernst Klein, Bilder ur Sveriges historia (1931) som FAKTAKÄLLA.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- OBS: museum_objects fanns REDAN (1208 SHM-objekt) — ingen ny tabell skapas, bara INSERT.
-- Kleins text skyddad (d. 1968) → paraphraserad. Bilder pending CC0/CC (image_url NULL).
-- TODO durabilitet/söksurfacing: museum_objects är ännu inte sök-indexerade — kräver en gren
--   i rebuild_search_document('museum_object') + META/route i GlobalSearch (eget steg).
INSERT INTO public.museum_objects (name, title, description, category, material, size, find_landscape, find_socken, find_place, period, source, attribution)
SELECT * FROM (VALUES
  ('Stenålderskranier — långskalle & kortskalle', 'Stenålderskranier (långskalle/kortskalle)',
    'Under stenåldern förekom två skalltyper som 1931 beskrevs som "långskalle" och "kortskalle". Långskallen från Alvastraboplatsen bär tydliga snitt ungefär vid hårfästets höjd, vilket tolkats som att individen blivit skalperad.',
    'kranium', 'ben', NULL, 'Östergötland', 'Västra Tollstad', 'Alvastraboplatsen', 'stenålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; Kleins text skyddad t.o.m. 2039; bild pending CC0/CC'),
  ('Tunnackig flintyxa (Kungälv)', 'Tunnackig flintyxa',
    'Tunnackig flintyxa, 39 cm lång, funnen vid Kungälv — ett av stenålderns förnämsta arbetsredskap.',
    'yxa', 'flinta', '39 cm', 'Bohuslän', NULL, 'Kungälv', 'stenålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Flintdolkar (senneolitikum)', 'Flintdolkar',
    'Dolkar av flinta ur Statens historiska museums samlingar — den senneolitiska flintdolkstraditionen, skickligt tillhuggna.',
    'dolk', 'flinta', NULL, NULL, NULL, NULL, 'senneolitikum',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Stridsyxa av sten (Södermanland)', 'Stridsyxa av sten',
    'Stridsyxa av sten, 246 mm lång, funnen i Södermanland (stridsyxe-/båtyxekultur).',
    'stridsyxa', 'sten', '246 mm', 'Södermanland', NULL, 'Södermanland', 'stenålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Halsband av sältänder', 'Halsband av sältänder',
    'Halsband av genomborrade sältänder — smycke från säljägarnas stenålder.',
    'smycke', 'sältänder', NULL, NULL, NULL, NULL, 'stenålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Hängsmycke av skiffer (Gästrikland)', 'Hängsmycke av skiffer',
    'Hängsmycke av skiffer från Gästrikland med ristade figurer.',
    'smycke', 'skiffer', NULL, 'Gästrikland', NULL, NULL, 'stenålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Kam från Näs (Gotland)', 'Kam med ornament och människoansikte',
    'Kam från Näs socken på Gotland med sicksackformade ornament, ett djurhuvud och ett människoansikte — ett av få människoansikten i svensk stenålderskonst.',
    'kam', 'ben/horn', NULL, 'Gotland', 'Näs', 'Näs socken', 'stenålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC')
) AS v(name,title,description,category,material,size,find_landscape,find_socken,find_place,period,source,attribution)
WHERE NOT EXISTS (SELECT 1 FROM public.museum_objects m WHERE m.name = v.name);

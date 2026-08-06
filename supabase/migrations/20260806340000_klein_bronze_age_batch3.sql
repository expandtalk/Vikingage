-- Klein 1931 batch 3: bronsålder. Applicerad i prod via MCP (repo-spegling). 2026-08-06.
-- Fakta paraphraserade; koord Wikidata P625. Objekt auto-indexeras via trg_museum_object_search.
UPDATE public.heritage_sites SET
  lat = COALESCE(lat, 55.6825), lng = COALESCE(lng, 14.2339),
  period = COALESCE(period, 'bronsålder'),
  description = COALESCE(description,
    'Kungagraven i Kivik (Bredarör) vid Skånes östkust (Hanöbukten) — ett av Sveriges märkligaste bronsåldersminnen. Gravkammarens hällar bär inristade bilder (hästar, vagn, processioner). Koordinat verifierad: Wikidata Q1540741. Faktakälla: Ernst Klein 1931 (paraphraserad).')
WHERE name = 'Bredarör, Röse';

INSERT INTO public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri, register_system, register_id)
SELECT * FROM (VALUES
  ('skeppssättning (i hög)', 'Lugnarohögen (stenskeppet)', 'Halland', 'Laholm', 'Hasslöv',
    56.4121, 13.0094, 'bronsålder',
    'Bronsåldershög strax norr om Hallandsåsen med en dold skeppssättning (stenskepp) i sitt inre — bevarad under ett skyddstak och tillgänglig för besökare. Koordinat verifierad: Wikidata Q4580064. Faktakälla: Ernst Klein 1931 (paraphraserad).',
    'https://www.wikidata.org/wiki/Q4580064', 'Wikidata', 'Q4580064')
) AS v(raa_type,name,landscape,municipality,parish,lat,lng,period,description,source_uri,register_system,register_id)
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.name = v.name);

INSERT INTO public.museum_objects (name, title, description, category, material, size, find_landscape, find_socken, find_place, period, source, attribution)
SELECT * FROM (VALUES
  ('Dolk från Gudhem', 'Dolk (Gudhem)',
    'Dolk funnen i Gudhems socken, Västergötland. Statens historiska museum. (Material/exakt datering ej angivet i sammanfattningen — verifiera mot SHM.)',
    'dolk', NULL, NULL, 'Västergötland', 'Gudhem', 'Gudhem', 'sten-/bronsålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; material/datering pending; bild pending CC0/CC'),
  ('Hågasvärdet (Kung Björns svärd)', 'Kung Björns svärd (Håga)',
    'Kraftigt bronssvärd, 75 cm långt, gjutet i brons — från Hågahögen (Kung Björns hög) vid Håga nära Uppsala. Ett av bronsålderns främsta svärd.',
    'svärd', 'brons', '75 cm', 'Uppland', 'Bondkyrko', 'Hågahögen', 'bronsålder (period IV, ca 1000 f.Kr.)',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Glasögonfibula från Håga', 'Glasögonfibula (Håga)',
    'Brosch (fibula) från Hågahögen som arkeologer kallar glasögonfibula (dubbla spiralskivor). Gjuten i brons och belagd med tunt guldbleck.',
    'fibula', 'brons + guldbleck', NULL, 'Uppland', 'Bondkyrko', 'Hågahögen', 'bronsålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Bronsyxor från Skogstorp', 'Bronsyxorna från Skogstorp',
    'De gåtfulla, rikt ornerade bronsyxorna från Skogstorp vid Eskilstuna, Södermanland — praktföremål vars funktion debatterats.',
    'yxa', 'brons', NULL, 'Södermanland', NULL, 'Skogstorp (Eskilstuna)', 'bronsålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Bronsfiguriner (gudinnor)', 'Bronsåldersfiguriner',
    'Figuriner från bronsåldern föreställande gudinnor/kultgestalter, gjutna i brons.',
    'figurin', 'brons', NULL, NULL, NULL, NULL, 'bronsålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; fyndplats/datering pending; bild pending CC0/CC')
) AS v(name,title,description,category,material,size,find_landscape,find_socken,find_place,period,source,attribution)
WHERE NOT EXISTS (SELECT 1 FROM public.museum_objects m WHERE m.name = v.name);

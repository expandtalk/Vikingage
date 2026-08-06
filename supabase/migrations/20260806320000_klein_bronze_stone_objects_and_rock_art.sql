-- Klein 1931 batch 2: föremål (museum_objects) + hällristningsplatser (heritage_sites).
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- Fakta paraphraserade; koord Wikidata där de finns, annars approx/pending (markerat).
-- Objekt auto-indexeras i söket via trg_museum_object_search.
INSERT INTO public.museum_objects (name, title, description, category, material, size, find_landscape, find_socken, find_place, period, source, attribution)
SELECT * FROM (VALUES
  ('Alundaälgen (yxa med älghuvud)', 'Alundaälgen',
    'Yxliknande stenföremål med ett underbart levande utformat älghuvud, funnet i Alunda socken, Uppland — ett av stenålderns främsta konstverk. Originalet på Statens historiska museum.',
    'kultföremål', 'sten', NULL, 'Uppland', 'Alunda', 'Alunda', 'stenålder (neolitikum)',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Husurna från Stora Hammar', 'Husurna',
    'Den bäst bevarade husurnan, funnen i Stora Hammar, Skytts härad, Skåne — målad svart på ljusgul botten, med rökhål som kan stängas med ett löst lock. 350 mm hög. Statens historiska museum.',
    'urna', 'keramik', '350 mm', 'Skåne', 'Stora Hammar', 'Stora Hammar (Skytts härad)', 'bronsålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Gerumsmanteln', 'Gerumsmanteln',
    'Bronsålderns ylemantel, funnen nedstoppad under en sten i mossen vid Gerumsberget. Professor Sune Lindqvist tolkade de egendomliga snitten som att bäraren dräpts och manteln gömts för att dölja dådet.',
    'textil', 'ull', NULL, 'Västergötland', 'Gerum', 'Gerumsberget', 'bronsålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad); tolkning Sune Lindqvist', 'Fakta fria; bild pending CC0/CC'),
  ('Bronssköld (Spannarp)', 'Bronssköld av norditalisk typ',
    'Bronssköld av norditalisk typ, funnen i Spannarps socken, Halland — vittnar om bronsålderns fjärrkontakter söderut. Originalet på Statens historiska museum.',
    'sköld', 'brons', NULL, 'Halland', 'Spannarp', 'Spannarp', 'bronsålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC'),
  ('Bronsyxa från Lundby (Slöinge)', 'Bronsyxa',
    'Vacker bronsyxa, 32 cm lång, från Lundby i Slöinge socken, Halland. Statens historiska museum.',
    'yxa', 'brons', '32 cm', 'Halland', 'Slöinge', 'Lundby', 'bronsålder',
    'Ernst Klein 1931 (faktakälla, paraphraserad)', 'Fakta fria; bild pending CC0/CC')
) AS v(name,title,description,category,material,size,find_landscape,find_socken,find_place,period,source,attribution)
WHERE NOT EXISTS (SELECT 1 FROM public.museum_objects m WHERE m.name = v.name);

INSERT INTO public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri, register_system, register_id)
SELECT * FROM (VALUES
  ('hällristning (skepp)', 'Brandskogsskeppet', 'Uppland', 'Enköping', 'Boglösa',
    59.60339, 17.16654, 'bronsålder',
    'Berömd hällristning i Boglösa socken — roddare framställs stående, drivande fram sin farkost med spadformiga paddlar. Koordinat verifierad: Wikidata Q1404398. Faktakälla: Ernst Klein 1931 (paraphraserad).',
    'https://www.wikidata.org/wiki/Q1404398', 'Wikidata', 'Q1404398'),
  ('hällristning', 'Tegneby hällristningar', 'Bohuslän', 'Tanum', 'Tanum',
    58.70, 11.34, 'bronsålder',
    'Hällristningslokal i Tanums socken (Tanums världsarv). Koordinat APPROXIMATIV (Tanumsområdet; exakt lokal ej verifierad — Fornsök pending). Faktakälla: Ernst Klein 1931 (paraphraserad).',
    'https://www.wikidata.org/wiki/Q10691868', 'Wikidata', 'Q10691868'),
  ('hällristning', 'Finntorp hällristningar', 'Bohuslän', 'Tanum', 'Tanum',
    58.70, 11.34, 'bronsålder',
    'Hällristningslokal i Tanums socken (Tanums världsarv). Koordinat APPROXIMATIV (Tanumsområdet; exakt lokal ej verifierad — Fornsök pending). Faktakälla: Ernst Klein 1931 (paraphraserad).',
    NULL, 'Wikidata', NULL)
) AS v(raa_type,name,landscape,municipality,parish,lat,lng,period,description,source_uri,register_system,register_id)
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.name = v.name);

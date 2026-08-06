-- Museer som sökbara entiteter (excursion-mönstret, jfr Fornsalen). 2026-08-06.
-- Koordinater ur Wikidata P625 (verifierade via Wikipedias API) — aldrig ur minnet.
-- Sanningskälla = src/data/excursions.ts; denna spegling håller prod-DB i synk.
-- Applicerad i prod via MCP.

INSERT INTO public.excursions (id, name, region, grp, period, coordinates, description_sv, description_en) VALUES
 ('historiska-museet','Statens historiska museet','Stockholm','Uppland & Mälardalen','Sten- till medeltid',
   point(18.09028,59.33472), -- Wikidata Q1726607
   'Sveriges nationella kulturhistoriska museum i Stockholm — Guldrummet och omfattande vikingatida och medeltida samlingar.',
   'Sweden''s national museum of cultural history in Stockholm — the Gold Room and extensive Viking-Age and medieval collections.'),
 ('vikingaliv','Vikingaliv (The Viking Museum)','Djurgården, Stockholm','Uppland & Mälardalen','Vikingatid',
   point(18.095,59.327), -- Wikidata Q31871457
   'Museum på Djurgården i Stockholm om vikingatiden.',
   'Museum on Djurgården, Stockholm, about the Viking Age.'),
 ('fotevikens-museum','Fotevikens Museum','Höllviken, Vellinge, Skåne','Skåne','Vikingatid',
   point(12.953,55.429), -- Wikidata Q1426033; Wikipedia 55°25′46″N 12°57′11″Ö
   'Arkeologiskt friluftsmuseum vid Foteviken i sydvästra Skåne med en rekonstruerad vikingatida stad i full skala. Grundat 1995 av föreningen SVEG (ur marinarkeologin kring Foteviksskeppen) och nedlagt 2022.',
   'Open-air archaeological museum at Foteviken in south-west Scania, with a full-scale reconstructed Viking-Age town. Founded in 1995 by the SVEG association (from the marine archaeology around the Foteviken ships) and closed in 2022.'),
 ('trelleborgen','Trelleborgen (vikingaborg)','Trelleborg, Skåne','Skåne','Vikingatid',
   point(13.148,55.376), -- Wikidata Q2451282
   'Delvis rekonstruerad vikingatida ringborg av trelleborgstyp i Trelleborg.',
   'Partly reconstructed Viking-Age ring fortress of the Trelleborg type, in Trelleborg.')
ON CONFLICT (id) DO UPDATE SET
   name=excluded.name, region=excluded.region, grp=excluded.grp, period=excluded.period,
   coordinates=excluded.coordinates, description_sv=excluded.description_sv, description_en=excluded.description_en;

-- Reindexera bara excursions (rör ej andra typers popularity/geom).
SELECT public.rebuild_search_document('excursion');

-- Popularitet: Gotlands museum ur museets egen organic-keyword-export.
INSERT INTO public.wiki_popularity (entity_name, volume, source, note) VALUES
 ('Fornsalen (Gotlands museum)', 600, 'Ahrefs SE', 'keyword fornsalen 600; gotlands museum 500 (brandat)')
ON CONFLICT DO NOTHING;

-- Återdenormalisera popularitet in i indexet (rebuild nollar kolumnen på excursions).
UPDATE public.search_document sd
   SET popularity = wp.volume
  FROM public.wiki_popularity wp
 WHERE lower(sd.label) = lower(wp.entity_name);

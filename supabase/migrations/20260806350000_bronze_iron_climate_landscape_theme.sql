-- Landskaps-/klimattema: bronsålderns värmetid → järnålderns klimatförsämring.
-- Applicerad i prod via MCP (repo-spegling). 2026-08-06. Fakta paraphraserade (pollenanalys;
-- Klein 1931). Foton (Lagerberg, C.G. Rosenberg) bara CC0/CC.
INSERT INTO public.themes (name, name_en, description, description_en, slug, keywords)
SELECT 'Bronsålderns värmetid & järnålderns klimatförsämring',
  'Bronze Age warmth & Iron Age climate deterioration',
  'Landskapets klimathistoria bakom förhistorien. Under bronsåldern rådde ett varmare klimat (den postglaciala värmetiden) då ädellövskog — lind, ek, hassel, alm — bredde ut sig långt norrut i Sverige; det var miljön kring hällristningar, rösen och skeppssättningar. Vid övergången till järnålder, ett stycke in på första årtusendet f.Kr., försämrades klimatet med ökad nederbörd som försumpade väldiga områden av landet (t.ex. Tåsjö mosse i Ångermanland). Förloppet är belagt genom pollenanalys och torvstratigrafi — metoden grundad av Lennart von Post. Faktakälla bl.a. Ernst Klein 1931 (paraphraserad); lövskogen dokumenterad i bild av bl.a. Torsten Lagerberg och C.G. Rosenberg (foton endast om fri licens).',
  'The climatic history of the landscape behind prehistory: a warmer Bronze Age (postglacial optimum) when deciduous forest spread far north, then an Iron Age climate deterioration with rising precipitation that waterlogged vast areas (e.g. Tåsjö bog).',
  'bronsalder-varmetid-klimat',
  ARRAY['bronsålder','klimat','värmetid','lövskog','ädellöv','försumpning','järnålder','pollenanalys','von Post','Tåsjö mosse']
WHERE NOT EXISTS (SELECT 1 FROM public.themes WHERE slug = 'bronsalder-varmetid-klimat');

INSERT INTO public.research_scholars (name, affiliation, role_title, biography, source)
SELECT * FROM (VALUES
  ('Lennart von Post', 'Stockholms högskola / SGU', 'Geolog — pollenanalysens grundare',
    'Grundade den kvantitativa pollenanalysen (1916) — metoden som belägger vegetationens och klimatets historia i torvlagren, bl.a. bronsålderns värmetid och järnålderns klimatförsämring.',
    'allmänt belagt (Wikipedia)'),
  ('Torsten Lagerberg', 'Skogshögskolan', 'Professor i skogsbotanik',
    'Botaniker som dokumenterade den sydsvenska lövskogen (bl.a. Dalby socken i Skåne) i ord och bild — illustrerar den lövskogsflora som under värmetiden bredde ut sig norrut.',
    'allmänt belagt (Wikipedia)')
) AS v(name, affiliation, role_title, biography, source)
WHERE NOT EXISTS (SELECT 1 FROM public.research_scholars rs WHERE rs.name = v.name);

INSERT INTO public.heritage_sites (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri, register_system, register_id)
SELECT * FROM (VALUES
  ('torvmosse (pollenstratigrafisk lokal)', 'Tåsjö mosse', 'Ångermanland', 'Strömsund', 'Tåsjö',
    64.222, 15.901, 'järnålder (klimatförsämring, ~1:a årtusendet f.Kr.)',
    'Torvmosse i Tåsjö socken — exempel på den försumpning som järnålderns klimatförsämring (ökad nederbörd, ett stycke in på första årtusendet f.Kr.) orsakade över väldiga områden av Sverige. Torvlagren bär den paleoekologiska berättelsen (pollenanalys). Koordinat APPROXIMATIV (sockennivå; mossens exakta läge ej verifierat). Faktakälla: Ernst Klein 1931 (paraphraserad); Wikidata Q10708132.',
    'https://www.wikidata.org/wiki/Q10708132', 'Wikidata', 'Q10708132')
) AS v(raa_type,name,landscape,municipality,parish,lat,lng,period,description,source_uri,register_system,register_id)
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.name = v.name);

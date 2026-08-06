-- Stenålderslokaler ur Ernst Klein, Bilder ur Sveriges historia (1931) som FAKTAKÄLLA.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
-- Kleins text är skyddad (d. 1968) → fakta paraphraserade, ej verbatim. Koord Wikidata P625.
-- Typ = lämningstyp, period separat (TYP≠ÅLDER). Stora Förvar-koord approximativ (öns läge).
INSERT INTO public.heritage_sites
  (raa_type, name, landscape, municipality, parish, lat, lng, period, description, source_uri, register_system, register_id)
SELECT * FROM (VALUES
  ('grottboplats', 'Stora Förvar (Stora Karlsö)', 'Gotland', 'Gotland', 'Eksta',
    57.29, 17.97, 'stenålder (mesolitikum–neolitikum)',
    'Grottboplats på Stora Karlsö utanför Gotlands västkust, bebodd redan under äldre stenålder och vidare in i neolitikum — en av Nordens rikaste stenåldersgrottor (säljägarmiljö). Koordinat APPROXIMATIV (öns läge; grottans exakta position ej verifierad). Faktakälla: Ernst Klein 1931 (paraphraserad); Wikidata Q2094380.',
    'https://www.wikidata.org/wiki/Q2094380', 'Wikidata', 'Q2094380'),
  ('boplats (pålbyggnad)', 'Alvastra pålbyggnad', 'Östergötland', 'Ödeshög', 'Västra Tollstad',
    58.30, 14.68, 'yngre stenålder (ca 3000 f.Kr.)',
    'Neolitisk pålbyggnad/strandboplats i Dags mosse vid Omberg — en gammaldags strandboplats bevarad i mossen. Från boplatsen härrör bl.a. ett stenålderskranium ("långskallen"). Koordinat verifierad: Wikidata Q744107. Faktakälla: Ernst Klein 1931 (paraphraserad).',
    'https://www.wikidata.org/wiki/Q744107', 'Wikidata', 'Q744107'),
  ('gånggrift', 'Karlebys gånggrifter', 'Västergötland', 'Falköping', 'Karleby',
    58.15, 13.64, 'yngre stenålder (neolitikum)',
    'Grupp megalitiska gånggrifter på Falbygden utanför Falköping — bland dem Girommen, en av Sveriges längsta gånggrifter. Koordinat verifierad: Wikidata Q10543792. Faktakälla: Ernst Klein 1931 (paraphraserad).',
    'https://www.wikidata.org/wiki/Q10543792', 'Wikidata', 'Q10543792')
) AS v(raa_type,name,landscape,municipality,parish,lat,lng,period,description,source_uri,register_system,register_id)
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.name = v.name);
-- Sök-indexering per id via rebuild_search_document('heritage_site', id) (kördes i samma migration i prod).

-- Tre fynd: Bäversvansbörsen (Tåsjö), bildsten (Sanda), trolldosan (Bäl). Fakta verifierade via
-- webb (SHM-samlingar, Gotländskt Arkiv, Bror Schnittger). Fakta fria; bild pending.
-- Applicerad i prod via MCP (denna fil = repo-spegling). 2026-08-06.
INSERT INTO public.museum_objects (name, title, description, category, material, period, find_landscape, find_socken, find_place, source, attribution)
SELECT * FROM (VALUES
  ('Bäversvansbörsen från Långön (Tåsjö)', 'Bäversvansbörs (eldstålsetui)',
    'Börs/etui av bäversvansskinn (ytterlager) med textilfoder, från Långön i Tåsjö socken, Ångermanland (ca 800–1100). Behållare för ett eldslagningsset (eldstål). KÄLLKRITIK: skinnet troddes tidigare vara av varanödla (monitorödla) från Sydostasien — en sensationell exotisk import — men har vid senare granskning (Moa Råhlander) omtolkats som bäversvansskinn. Statens historiska museum.',
    'börs/etui', 'bäverskinn/textil', 'vikingatid (ca 800–1100)', 'Ångermanland', 'Tåsjö', 'Långön',
    'Webbverifierad (SHM; Linda Wåhlander/Naturhistoriska, omtolkning)', 'Fakta fria; bild pending CC0/CC'),
  ('Bildsten från Sanda', 'Gotländsk bildsten (Sanda)',
    'Gotländsk bildsten av kalksten från Sanda socken på Gotland. Den stora Sanda-stenen behandlas i Gotländskt Arkiv (1962). Minst en runsten och en bildsten från Sanda förvaras på Statens historiska museum. (Motivbeskrivning ej återgiven här — verifiera mot SHM/Gotlands Museum.)',
    'bildsten', 'kalksten', 'järnålder (gotländsk bildsten, ca 400–1100)', 'Gotland', 'Sanda', NULL,
    'Webbverifierad (SHM-samlingar; Gotländskt Arkiv 1962)', 'Fakta fria; motiv + bild pending verifiering'),
  ('Trolldosan från Bäl', 'Trolldosa med ormskelett (Bäl)',
    'Vikingatida "trolldosa" från Bäls socken på Gotland, innehållande ett ormskelett. Beskriven av Bror Schnittger i "En trolldosa från vikingatiden". FAKTA: en dosa med ett ormskelett. SÄGEN/FOLKTRO: en trolldosa antogs rymma en "vit orm" eller ett magiskt väsen — redovisas som folktro, inte som belagd funktion.',
    'dosa', NULL, 'vikingatid', 'Gotland', 'Bäl', NULL,
    'Webbverifierad (Bror Schnittger, En trolldosa från vikingatiden)', 'Fakta fria; museum/inv.nr + bild pending verifiering')
) AS v(name,title,description,category,material,period,find_landscape,find_socken,find_place,source,attribution)
WHERE NOT EXISTS (SELECT 1 FROM public.museum_objects m WHERE m.name = v.name);

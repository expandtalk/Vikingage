-- Tre nya VERIFIERADE fynd (2025 års rapportering), inlagda i befintliga kartlager.
-- Inga frontend-ändringar behövs: skatter renderas av useMapCoins (legend 'coins'),
-- båtgraven av skeppsgravslagret (heritage_sites, raa_type='skeppsgrav').
-- Koordinatdisciplin: Bedale = Wikipedia/Yorkshire Museum-koordinat (fält). Viggbyholm +
-- Sand = orts-/by-koordinat via Nominatim (ungefärlig, exakt fyndplats ej publicerad/inmätt),
-- markerat i find_place/description. Ingen koordinat satt ur minnet.

-- ============================================================================
-- 1) Bedale-skatten (coins, category='hoard', metal='silver')
--    54.29°N 1.59°W. Kershaw et al. 2025 (Archaeometry) — silverproveniens.
-- ============================================================================
INSERT INTO public.coins
  (name, name_en, category, metal, period_start, period_end,
   find_place, coordinates, significance, description, description_en, sources)
SELECT
  'Bedale-skatten',
  'The Bedale Hoard',
  'hoard', 'silver', 850, 900,
  'Bedale, North Yorkshire, England — nedgrävt i öppen mark under flat sten och järnplåt (metallsökarfynd 2012). Fält-koordinat (Yorkshire Museum/Wikipedia).',
  point(-1.59, 54.29),
  'Myntlös silverdepå (bullion-viktekonomi) med 48 föremål i silver och guld. Blyisotop- och spårämnesanalys (Kershaw et al. 2025) visar tre silverkällor: västeuropeiskt karolingiskt/anglosaxiskt silver — sannolikt plundrat under 800-talets vikingaräder på kontinenten och i England — samt islamiskt dirhamsilver som nått Skandinavien via österns handel, plus blandformer. Nio tackor göts av nästan rent dirhamsilver (~715 g ≈ 240 dirhamer, mer österländskt silver än allt bevarat 800-tals myntfynd i England tillsammans) — belägg för att stora mängder tidigt islamiskt silver nådde väster ut redan på 800-talet. Frånvaron av samanidiskt silver daterar nedläggningen till före ca 900. Silvret raffinerades med brittiskt (North Pennines/Alston), franskt (Melle) och blandat bly. Unik guldfoliprydd svärdsknapp i Trewhiddle-stil, unik "West Viking"-halskrage, ett "permiskt" ringfragment importerat från Ryssland samt hiberno-skandinaviska armringar från Dublin. Äldre än både Cuerdale- och Vale of York-skatterna.',
  'Depåfynd av 48 silver- och guldföremål från sent 800-tal/tidigt 900-tal: 29 stavformade silvertackor (flera med test-hack, tre med inristade kors), fyra silverhalsringar/-kragar, en armring, ett "permiskt" ringfragment, en penannular brosch samt en järnsvärdsknapp med guldfolie och guldhålkar/-nitar från fästet. Funnet nära Bedale 22 maj 2012 av metallsökare, förvärvat av Yorkshire Museum. Geokemisk analys (blyisotoper + spårämnen) har spårat silvret till väst­europeiska, islamiska och blandade källor.',
  'A hoard of 48 silver and gold objects of the late 9th/early 10th century: 29 cigar-shaped silver ingots (many test-nicked, three cross-incised), four silver neck-rings/collars, an arm-ring, a "Permian" ring fragment, a penannular brooch and an iron sword pommel with gold-foil plaques and gold hilt-hoops/rivets. Found near Bedale on 22 May 2012 by metal-detectorists and acquired by the Yorkshire Museum. Geochemical analysis (lead isotopes + trace elements) traced the silver to western European, Islamic and mixed sources.',
  'Kershaw, J., Merkel, S., Woods, A., Evans, J., Pashley, V. & Chenery, S. 2025, "The Provenance of Silver in the Viking-Age Hoard From Bedale, North Yorkshire", Archaeometry 68(S4): S86–S106, doi:10.1111/arcm.70031; Portable Antiquities Scheme YORYM-CEE620; Yorkshire Museum YORYM 2014.149.'
WHERE NOT EXISTS (SELECT 1 FROM public.coins WHERE name = 'Bedale-skatten');

-- ============================================================================
-- 2) Vikby-skatten (coins, category='hoard', metal='silver')
--    Vikby-gården vid Viggbyholm, Täby, Uppland. Arkeologerna 2019–2022.
--    NAMN: "Vikby-skatten" — SKILD från den äldre, separata Viggbyholmsskatten
--    (samma trakt, annat fynd). Namnet valt för att undvika förväxling.
--    OBS: INGEN koordinat lagras — exakt fyndplats ska ej röjas (fyndplatsskydd).
--    coordinates lämnas NULL → posten ritas ALDRIG som nål (useMapCoins hoppar
--    över rader utan koordinat). Finns kvar som sökbar post i coins/explore.
-- ============================================================================
INSERT INTO public.coins
  (name, name_en, category, metal, period_start, period_end,
   find_place, significance, description, description_en, sources)
SELECT
  'Vikby-skatten',
  'The Vikby hoard',
  'hoard', 'silver', 960, 1000,
  'Vikby (vikingatida gård vid Viggbyholm), Täby, Uppland — nedgrävt i keramikkärl under ett trägolv i ett hus (utgrävning Arkeologerna 2019–2022). Att skilja från den äldre Viggbyholmsskatten i samma trakt. Exakt fyndplats anges ej — visas därför inte som punkt på kartan.',
  'Silverskatt gömd i ett keramikkärl under trägolvet i ett hus på den vikingatida gården Vikby (föregångaren till det senare Viggbyholm; ej att förväxla med den tidigare kända Viggbyholmsskatten). Åtta torque-formade halsringar av hög kvalitet — utomordentligt välbevarade, närmast nytillverkade i skick — samt två armringar, en ring, två pärlor och tolv mynthängen. Mynten speglar vidsträckta handelskontakter: präglingar från England, Böhmen och Bayern jämte fem arabiska dirhamer. Ett mynt är extremt sällsynt: präglat i Rouen i Normandie (900-tal), en typ som dessförinnan bara var känd genom teckningar i en 1700-talsbok (myntbestämning J.C. Moesgaard, Stockholms universitet). Boplatsen bebos från folkvandringstid/vendeltid (~400–550) in i vikingatid och tidig medeltid.',
  'Depåfynd nedlagt under vikingatidens slutskede (ca 900-talets senare del) i keramikkärl under ett hus på Vikby-gården vid Viggbyholm, Täby. Innehöll åtta halsringar, två armringar, en fingerring, två pärlor och tolv mynthängen (bl.a. engelska, böhmiska, bayerska och fem arabiska dirhamer samt ett mycket sällsynt Rouen-mynt). Påträffat vid Arkeologernas undersökning av en järnålders- och vikingatida gård 2019–2022.',
  'A silver hoard deposited in the late Viking Age (later 10th century) in a ceramic pot beneath a house floor at the Vikby farm near Viggbyholm, Täby (not to be confused with the earlier, separate Viggbyholm hoard). It contained eight neck-rings, two arm-rings, a finger-ring, two beads and twelve coin-pendants (including English, Bohemian, Bavarian and five Arabic dirhams, plus a very rare Rouen coin). Recovered during the Arkeologerna excavation of an Iron Age and Viking-Age farmstead, 2019–2022.',
  'Arkeologerna (Statens historiska museer), "Viking silver treasure uncovered in Täby, Stockholm" 2021; utgrävning Viggbyholm 2019–2022 (Maria Lingström, John Hamilton, Magnus Lindberg); myntbestämning J.C. Moesgaard, Stockholms universitet.'
WHERE NOT EXISTS (SELECT 1 FROM public.coins WHERE name = 'Vikby-skatten');

-- ============================================================================
-- 3) Båtgraven vid Sand, Senja (heritage_sites, raa_type='skeppsgrav') — #7
--    By-koordinat via Nominatim (ungefärlig; exakt fyndplats ej publicerad).
--    heritage_sites saknar country-kolumn → land i municipality. geom är GENERERAD.
-- ============================================================================
INSERT INTO public.heritage_sites (raa_type, name, landscape, municipality, lat, lng, period, description)
SELECT * FROM (VALUES
  ('skeppsgrav','Båtgraven vid Sand, Senja','Troms','Senja (Norge)',69.53768,17.90992,'vikingatid (900–950)',
   'Den första båtgraven som påträffats på Senja (utgrävd maj 2025, Norges arktiske universitetsmuseum, UiT). En elitkvinna begravd midskepps med huvudet i norr och en liten hund omsorgsfullt lagd vid fötterna. Sydd båt ~5,4 m — inga järnnitar; plankorna hopfogade med trädymlingar och rotfibrer/senor. Gravgåvor: två ovala spännbucklor med silvertråd, järnskära, brynsten av skiffer, ringhänge med två bronspärlor (huvudbonad eller öra), två skivformade pärlor (ev. bärnsten), sländtrissa och ett möjligt vävsvärd av valben — textilredskap som markerar hög status. Ligger nära de sydda båtgravarna på Hillesøy. Ungefärligt läge (byn Sand; exakt fyndplats ej publicerad). Källa: Anja Roth Niemi, UiT 2025.')
) AS v(raa_type,name,landscape,municipality,lat,lng,period,description)
WHERE NOT EXISTS (SELECT 1 FROM public.heritage_sites h WHERE h.name = v.name AND h.raa_type = 'skeppsgrav');

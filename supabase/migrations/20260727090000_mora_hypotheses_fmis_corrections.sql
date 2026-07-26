-- Korrigeringar av Mora stenar-hypoteserna utifrån FMIS-källdata (Daniel) + källkritik.
--
-- 1) Mora kungsäng/Samlingsplats (RAÄ Lagga 62:1 = L1943:6404) har nu verifierad
--    centrumkoordinat: SWEREF99TM N 6632237 E 656491 -> WGS84 59.79881, 17.78920.
--    Detta är HELA ängen (tingsplatsen), ej Juthögen — labeln rättas.
-- 2) Juthögen är RAÄ Lagga 115 (inte L1943:6404, som är Samlingsplatsen). L-nr rättas.
-- 3) Stenramen (L1940:7694 = Danmark 224): FMIS bekräftar "ring av stenar ca 8 m diam,
--    delvis eldsprängda, stenröjt innanför, belägen på häradsallmänning" (RAÄ dnr 326-1734-2012).
-- 4) INTEGRITET: Söderbyskatten-raden tas bort från Mora-hypoteserna. Den auktoritativa
--    källan (Rundkvist & Westerholm, "Kammargravfältet vid Danmarksby", Fornvännen) placerar
--    Söderbyskatten i DANMARKS socken vid Lunsen, 3 km S om Danmarksby-gravfältet — inte på
--    Mora äng (Lagga sn). Kopplingen skatt->Mora ting/Mulating är för svag för att stå som
--    lägeshypotes för Mora sten. Söderbyskatten hör hemma i ett eget Danmarksby-fynd, inte här.

-- 1) Mora kungsäng / Samlingsplats — verifierad koordinat + rättad label.
UPDATE public.location_hypotheses SET
  lat = 59.79881, lng = 17.78920,
  label = 'Mora kungsäng / Samlingsplats (RAÄ Lagga 62:1, L1943:6404) — hela tingsängen',
  rationale = 'Mora kungsäng, ca 1290 x 465-740 m (NV-SÖ), utsträckning enligt geometrisk avmätning 1639 (Thomas Christensson). Registrerad som Samlingsplats/tingsplats. Enligt FMIS har Mora ting troligen legat i ängens N del, kungavalsplatsen på gränsen mellan Attunda- och Tiundaland. Länge det traditionellt antagna området (von Friesen, Holmgren, Larsson). Bornfalk Back (2021) invänder att den centrala ängen var för våt (postglacial lera) och att tidiga källor inte knyter tinget specifikt till ängen. Koordinat = ängens centrumpunkt (SWEREF99TM N 6632237 E 656491).',
  source = 'RAÄ Fornsök Lagga 62:1 (L1943:6404); von Friesen 1926; Holmgren 1937; Larsson 2010; kritik i Bornfalk Back 2021.'
WHERE feature_slug = 'mora-stenar'
  AND label = 'Mora äng / Kungsängen — traditionella förslaget (von Friesen, Holmgren, Larsson)';

-- 2) Juthögen — rätt RAÄ-nummer (Lagga 115), ej L1943:6404.
UPDATE public.location_hypotheses SET
  label = 'Juthögen (RAÄ Lagga 115) — nära ursprungsläget för Mora sten',
  rationale = 'Numera urschaktad höjd (Juthögen) i ängens N del. FMIS: "Ursprungliga platsen för Mora sten (Lagga 59:1) kan ha varit i närheten av Juthögen (Lagga 115)". Larsson tolkade höjden som gravhög med intilliggande stolprad/pir. Bornfalk Back invänder: höjden reste sig bara ca 30 cm över dåtida vatten (för lågt/vått), och utgrävning gav inga belägg för gravhög. Koordinat ej hämtad (RAÄ Lagga 115).',
  source = 'RAÄ Fornsök Lagga 115; Larsson 2010, 2013; kritik i Bornfalk Back 2021.'
WHERE feature_slug = 'mora-stenar'
  AND label = 'Juthögen, centralt på ängen (L1943:6404) — Larsson';

-- 3) Stenramen — FMIS-bekräftad beskrivning (Danmark 224 / L1940:7694).
UPDATE public.location_hypotheses SET
  rationale = 'Bäst underbyggda nya förslaget (Bornfalk Back 2021). FMIS L1940:7694 (Danmark 224): "Ring av stenar, ca 8 m diam av 0,3-0,8 m st stenar, delvis eldsprängda. Stenröjt innanför stenarna. Tydlig lämning, osäker funktion. Belägen på häradsallmänning." Läget — på en av områdets högsta punkter (klippa/berghäll), mitt på gränsen mellan folklanden OCH mellan häradsallmänningar + Söderby (neutral tingsmark) — stödjer natursten-hypotesen ("Mora berg"). Jämförs med stenramarna vid Arkils tingstad (Vallentuna) och alla götars ting (Skara). Nyanmäld av Upplandsmuseet, inmätt med GPS (RAÄ dnr 326-1734-2012). Koordinat ej hämtad; löses via Fornsök L1940:7694.',
  source = 'RAÄ Fornsök L1940:7694 (Danmark 224); Bornfalk Back, A. 2021, Fornvännen 116.'
WHERE feature_slug = 'mora-stenar'
  AND label = 'Stenram vid klippa i skogen SV om ängen (L1940:7694) — Bornfalk Back 2021';

-- 4) Ta bort Söderbyskatten-referensen (fel socken / för svag koppling).
DELETE FROM public.location_hypotheses
WHERE feature_slug = 'mora-stenar'
  AND label = 'Söderbyskatten (500-tal, guldbrakteater) — möjligt järnålders-Mulating';

-- Mora stenar / Mora ting: kandidatplatser ur forskningen (Bornfalk Back 2021,
-- Fornvännen 116; Larsson 2010–2020; Ohlson 1976; von Friesen 1926; Holmgren 1937/54).
-- Populerar location_hypotheses-ramverket. Verifierade koordinater där de finns
-- (RAÄ/K-samsök); annars L-nummer som referens + NULL koord (ingen gissning).
-- Validerar hypotesen: "Mora sten" var sannolikt en NATURLIG berghäll/stenig höjd
-- ("Mora berg"), inte ett löst block — tingsplatser utnyttjade naturstenar.

-- 1) Uppdatera monumentets koordinat till RAÄ-verifierad + skärp lost-radens forskningsläge.
UPDATE public.location_hypotheses SET lat = 59.79774, lng = 17.78080
WHERE feature_slug = 'mora-stenar' AND kind = 'monument';

UPDATE public.location_hypotheses SET
  rationale = 'Medeltida kungavalsplats (Erikskrönikan: Magnus Ladulås vald 1275; Södermannalagen 1327). Den halvmytiska "Mora sten" saknar samtida beskrivning och antas försvunnen efter mitten av 1400-talet. Bornfalk Back (2021) argumenterar för att Mora ting var icke-kontinuerligt i tre faser (500-tal, 1300-tal, 1400-tal), att den ursprungliga platsen INTE var på den våta ängen utan i skogshöjden SV (etymologi: mora = sumpig granskog), och att "Mora sten" sannolikt syftade på en NATURLIG berghäll/stenig höjd ("Mora berg") snarare än ett löst block — vilket stödjer hypotesen att tingsplatser utnyttjade naturstenar. Läget för den ursprungliga stenen/tinget är okänt.',
  source = 'Bornfalk Back, A. 2021, "Till frågan om Mora ting", Fornvännen 116. Larsson 2010–2020; Holmgren 1954.'
WHERE feature_slug = 'mora-stenar' AND kind = 'lost';

-- 2) Kandidatplatser.
INSERT INTO public.location_hypotheses (feature_name, feature_slug, kind, label, lat, lng, confidence, rationale, source, thing_site_id)
SELECT * FROM (VALUES
  ('Mora stenar', 'mora-stenar', 'candidate',
   'Mora äng / Kungsängen — traditionella förslaget (von Friesen, Holmgren, Larsson)',
   59.79793::double precision, 17.78909::double precision, 'low',
   'Det länge antagna läget på ängen där dokumentstenarna förvaras (RAÄ Samlingsplats). Baserat på topografi nära segelled och gränsen Tiundaland/Attundaland. Bornfalk Back invänder: ängen var för våt (postglacial lera), och tidiga källor knyter inte tinget till ängen.',
   'von Friesen 1926; Holmgren 1937; Larsson 2010; kritik i Bornfalk Back 2021.',
   (SELECT id FROM public.thing_sites WHERE name ILIKE 'Mora stenar' LIMIT 1)),
  ('Mora stenar', 'mora-stenar', 'candidate',
   'Stenram vid klippa i skogen SV om ängen (L1940:7694) — Bornfalk Back 2021',
   NULL, NULL, 'medium',
   'Bäst underbyggda nya förslaget: en 9×9 m stenram som utgår från en klippa/berghäll, på en av områdets högsta punkter, mitt på gränsen mellan folklanden Tiundaland/Attundaland OCH mellan häradsallmänningar + Söderby (neutral tingsplats). Liknar stenramarna vid Arkils tingstad (Vallentuna) och "alla götars ting" (Skara). Stödjer natursten-hypotesen ("Mora berg"). Koordinat ej hämtad ännu — RAÄ-lämning L1940:7694 (löses via Fornsök).',
   'Bornfalk Back, A. 2021, Fornvännen 116.',
   (SELECT id FROM public.thing_sites WHERE name ILIKE 'Mora stenar' LIMIT 1)),
  ('Mora stenar', 'mora-stenar', 'candidate',
   'Juthögen, centralt på ängen (L1943:6404) — Larsson',
   NULL, NULL, 'low',
   'Larssons förslag: en numera urschaktad höjd (Juthögen) tolkad som gravhög + intilliggande stolprad/pir (L1943:6765). KMR:s nuvarande registrering. Bornfalk Back invänder: höjden reste sig bara ~30 cm över dåtida vatten (för lågt/vått), och utgrävning gav inga belägg för gravhög (möjligen naturformation el. vägbank).',
   'Larsson 2010b, 2013, 2018; kritik i Bornfalk Back 2021.',
   (SELECT id FROM public.thing_sites WHERE name ILIKE 'Mora stenar' LIMIT 1)),
  ('Mora stenar', 'mora-stenar', 'reference',
   'Söderbyskatten (500-tal, guldbrakteater) — möjligt järnålders-Mulating',
   NULL, NULL, 'speculative',
   'Depåfynd (10 guldbrakteater m.m., nedlagt i våtmark 500-tal) funnet 1876 ca 500 m från stenramen. Bornfalk Back föreslår att fyndet markerar platsen för Snorres "Mulating" (Heimskringla ~1230), samtida med Gamla Uppsalas framväxt som centralplats ~550 e.Kr. Koordinat ej hämtad.',
   'Lamm et al. 1999; Bornfalk Back 2021.',
   (SELECT id FROM public.thing_sites WHERE name ILIKE 'Mora stenar' LIMIT 1))
) AS v(feature_name, feature_slug, kind, label, lat, lng, confidence, rationale, source, thing_site_id)
WHERE NOT EXISTS (
  SELECT 1 FROM public.location_hypotheses lh WHERE lh.feature_slug = 'mora-stenar' AND lh.label = v.label
);
